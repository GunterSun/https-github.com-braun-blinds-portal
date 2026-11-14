import {extractInquiryDraft,type InquiryDraft} from './extract-inquiry.ts';
export type InquiryLine={lineNumber:number;originalWindowId:string|null;originalRow:string;source:string;draft:InquiryDraft};
export type MultiLineResult={lines:InquiryLine[];warnings:string[];status:'needs_review'};
/** Splits only explicit numbered lines; never invents quantity or merges products. */
export function extractInquiryLines(sourceText:string):MultiLineResult {
 const raw=String(sourceText??'');
 const source=raw.slice(0,12000);
 const rows=source.split(/\r?\n/).filter(row=>row.trim());
 const prefix=/^\s*(?:(?:line\s*)?(\d{1,3})\s*(?:[).:：]|-(?!\d))|((?:window\s+|W\s*|窗位\s*|窗口\s*)\d{1,3}(?:-\d{1,3})?|[a-z]{1,8}-\d{1,3}|\d{1,3}-\d{1,3}|[a-z]{1,8}\d{1,3}[a-z]{0,4})(?=\s|[).:：])\s*[).:：]?)\s*(\S.*)$/i;
 const numbered=rows.flatMap(row=>{
  const match=row.match(prefix);
  if(!match||/^(?:LJYM|BZM|JL|ML|LM|DR)[- ]?\d/i.test(match[2]??""))return [];
  const originalWindowId=match[1]??match[2];
  const numericLabel=originalWindowId.match(/^(?:(?:window|w|窗位|窗口)\s*)?(\d+)$/i);
  return [{originalWindowId,originalRow:row,number:numericLabel?Number(numericLabel[1]):null,source:match[3]}];
 });
 const warnings:string[]=[];
 if(raw.length>12000)warnings.push('Inquiry exceeded 12,000 characters; truncated text requires manual review');
 if(numbered.length===0)return {lines:[{lineNumber:1,originalWindowId:null,originalRow:source,source,draft:extractInquiryDraft(source)}],warnings:[...warnings,'No explicit line numbering; review whether the message contains multiple windows'],status:'needs_review'};
 const parsed=numbered.slice(0,100);
 const lines=parsed.map(({source,originalWindowId,originalRow},index)=>({
  lineNumber:index+1,source,originalWindowId,originalRow,draft:extractInquiryDraft(source)
 }));
 const sourceNumbers=parsed.map(({number})=>number);
 const allNumeric=sourceNumbers.every(number=>number!==null);
 const ids=parsed.map(({originalWindowId,number})=>number===null?originalWindowId.toUpperCase():String(number));
 if(allNumeric&&sourceNumbers[0]!==1)warnings.push('Window numbering does not start at 1; verify missing earlier windows');
 if(new Set(ids).size!==ids.length)warnings.push('Duplicate window line numbers detected; verify each window manually');
 if(allNumeric&&sourceNumbers.some((n,i)=>i>0&&n!==Number(sourceNumbers[i-1])+1))warnings.push('Window line numbering is out of sequence; check for omitted or reordered windows');
 if(numbered.length>100)warnings.push('More than 100 lines; only first 100 parsed');
 if(rows.length!==numbered.length)warnings.push('Unnumbered context was not assigned to any line; review manually');
 return {lines,warnings,status:'needs_review'};
}
