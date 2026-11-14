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
  ];
  const missing=[
    ...(!productCode?['productCode']:[]),...(!widthInches?['widthInches']:[]),
    ...(!heightInches?['heightInches']:[]),...(!quantity?['quantity']:[]),
  ];
  return {sourceText:text,productCode,fabricCode,widthInches,heightInches,quantity,color,options,notes:[],missing,status:'needs_review'};
}
