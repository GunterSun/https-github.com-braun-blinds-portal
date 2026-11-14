/** Read-only inquiry parser. Results always require human review. */
export type InquiryDraft = {
  sourceText:string; productCode:string|null; fabricCode:string|null;
  widthInches:number|null; heightInches:number|null; quantity:number|null;
  color:string|null; options:string[]; notes:string[]; missing:string[]; status:'needs_review';
};
export function parseInches(input:string):number|null {
  const s=input.trim().replace(/[″”]/g,'"').replace(/[′’]/g,"'").replace(/\s*(?:inches|inch|in|")$/i,'').trim();
  const m=s.match(/^(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/);
  if(m){const whole=Number(m[1]??0),numerator=Number(m[2]),denominator=Number(m[3]);
    if(!denominator||numerator>=denominator)return null;
    const value=whole+numerator/denominator;return value>0&&value<=1000?value:null;
  }
  if(!/^\d+(?:\.\d+)?$/.test(s))return null;
  const value=Number(s);return value>0&&value<=1000?value:null;
}
const token='(?:\\d+\\s+\\d+\\s*\\/\\s*\\d+|\\d+\\s*\\/\\s*\\d+|\\d+(?:\\.\\d+)?)';
const dimensionRegex=new RegExp('('+token+')\\s*(?:inches|inch|in|["″])?\\s*[x×X]\\s*('+token+')\\s*(?:inches|inch|in|["″])?','i');
export function extractInquiryDraft(sourceText:string):InquiryDraft {
  const text=String(sourceText??'').slice(0,12000);
  const dimensions=text.match(dimensionRegex);
  const widthInches=dimensions?parseInches(dimensions[1]):null;
  const heightInches=dimensions?parseInches(dimensions[2]):null;
  const productCode=text.match(/\b(?:LJYM|BZM|JL|ML|DR)[- ]?\d{2,6}\b/i)?.[0].replace(/ /g,'').toUpperCase()??null;
  const fabricCode=null; // LF/BO/BK are opacity options; WH is hardware color, not a verified fabric code.
  const qty=text.match(/(?:\b(?:qty|quantity)\b|数量)\s*[:：]?\s*(\d+)\b/i);
  const quantity=qty&&Number.isSafeInteger(Number(qty[1]))&&Number(qty[1])>0?Number(qty[1]):null;
  const color=text.match(/\b(white|beige|black|gray|grey|ivory|cream)\b/i)?.[0]??null;
  const options=[
    ...(/\b(?:motorized|motorised|motor)\b|电动/i.test(text)?['motorized']:[]),
    ...(/\bcordless\b|无绳/i.test(text)?['cordless']:[]),
    ...(/\bremote\b|遥控/i.test(text)?['remote']:[]),
    ...(/square valance|方形罩盒/i.test(text)?['square_valance']:[]),
    ...(/\bLF\b|light filtering|透光/i.test(text)?['light_filtering']:[]),
    ...(/\bBO\b|blackout|遮光/i.test(text)?['blackout']:[]),
    ...(/\bWH\b|white hardware|白色配件/i.test(text)?['white_hardware']:[]),
    ...(/\bBK\b|black hardware|黑色配件/i.test(text)?['black_hardware']:[]),
  ];
  const detectedModels=[...text.matchAll(/\b(?:LJYM|BZM|JL|ML|DR)[- ]?\d{2,6}\b/gi)].map(match=>match[0].replace(/[- ]/g,'').toUpperCase());
  const quantities=[...text.matchAll(/(?:\b(?:qty|quantity)\b|数量)\s*[:：]?\s*(\d+)\b/gi)].map(match=>match[1]);
  const invalidQuantityMention=/(?:\b(?:qty|quantity)\b|数量)\s*[:：]?\s*(?:0+(?!\d)|-\s*\d+|\d+\.\d+|\d+\s*\/\s*\d+)(?!\d)/i.test(text);
  const unresolvedQuantityMention=/(?:\b(?:qty|quantity)\b|数量)\s*[:：]?\s*(?:tbd\b|unknown\b|pending\b|n\/a\b|待定|未定)/i.test(text);
  const notes:string[]=[];
  const unresolvedOptionMention=/(?:\b(?:color|colour|fabric|hardware|opacity|operation|control)\b|颜色|布料|面料|配件|遮光|操作方式|控制方式)\s*[:：]?\s*(?:tbd\b|unknown\b|pending\b|n\/a\b|待定|未定)/i.test(text);
  if(unresolvedOptionMention)notes.push('Unresolved fabric or configuration statement in source; confirm selection with customer');
  const unresolvedModelMention=/(?:\b(?:model|product(?:\s+code)?)\b|型号|产品型号)\s*[:：]?\s*(?:tbd\b|unknown\b|pending\b|n\/a\b|待定|未定)/i.test(text);
  if(unresolvedModelMention)notes.push('Unresolved product model statement in source; confirm model with customer');
  if(new Set(detectedModels).size>1)notes.push('Multiple product models in one window; split and verify with customer');
  if(new Set(quantities.map(value=>Number(value))).size>1)notes.push('Conflicting quantities in one window; verify the intended count');
  if(invalidQuantityMention||quantities.some(value=>!Number.isSafeInteger(Number(value))||Number(value)<=0))notes.push('Invalid quantity statement in source; verify the intended positive whole number');
  if(unresolvedQuantityMention)notes.push('Unresolved quantity statement in source; confirm count with customer');
  const unresolvedDimensionMention=/(?:\b(?:width|height|size|dimensions?)\b|宽度|高度|尺寸)\s*[:：]?\s*(?:tbd\b|unknown\b|pending\b|n\/a\b|待定|未定)/i.test(text);
  if(unresolvedDimensionMention)notes.push('Unresolved dimension statement in source; confirm measurements with customer');
  const dimensionMatches=[...text.matchAll(new RegExp(dimensionRegex.source,'gi'))];
  const dimensionPairs=dimensionMatches.map(match=>[parseInches(match[1]),parseInches(match[2])].join('x'));
  if(dimensionMatches.some(match=>parseInches(match[1])===null||parseInches(match[2])===null))notes.push('Invalid dimension pair in source; verify width and height');
  if(new Set(dimensionPairs).size>1)notes.push('Multiple dimension pairs in one window; verify which size applies');

  if(options.includes('light_filtering')&&options.includes('blackout'))notes.push('Conflicting opacity options: LF and BO; verify with customer');
  if(options.includes('white_hardware')&&options.includes('black_hardware'))notes.push('Conflicting hardware colors: WH and BK; verify with customer');
  if(options.includes('motorized')&&options.includes('cordless'))notes.push('Motorized and cordless both requested; verify operating system');
  const missing=[
    ...(!productCode?['productCode']:[]),...(!widthInches?['widthInches']:[]),
    ...(!heightInches?['heightInches']:[]),...(!quantity?['quantity']:[]),
  ];
  return {sourceText:text,productCode,fabricCode,widthInches,heightInches,quantity,color,options,notes,missing,status:'needs_review'};
}
