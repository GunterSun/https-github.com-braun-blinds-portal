import {extractInquiryDraft,type InquiryDraft} from './extract-inquiry.ts';
export type InquiryLine={lineNumber:number;source:string;draft:InquiryDraft};
export type MultiLineResult={lines:InquiryLine[];warnings:string[];status:'needs_review'};
/** Splits only explicit numbered lines; never invents quantity or merges products. */
export function extractInquiryLines(sourceText:string):MultiLineResult {
 const raw=String(sourceText??'');
 const source=raw.slice(0,12000);
 const rows=source.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
 const numbered=rows.filter(s=>/^(?:line\s*)?\d{1,3}\s*[).:：-]\s*\S/i.test(s));
 const warnings:string[]=[];
 if(raw.length>12000)warnings.push('Inquiry exceeded 12,000 characters; truncated text requires manual review');
 if(numbered.length===0)return {lines:[{lineNumber:1,source,draft:extractInquiryDraft(source)}],warnings:['No explicit line numbering; review whether the message contains multiple windows'],status:'needs_review'};
 const lines=numbered.slice(0,100).map((row,index)=>({
  lineNumber:index+1,source:row.replace(/^(?:line\s*)?\d{1,3}\s*[).:：-]\s*/i,''),
  draft:extractInquiryDraft(row.replace(/^(?:line\s*)?\d{1,3}\s*[).:：-]\s*/i,''))
 }));
 if(numbered.length>100)warnings.push('More than 100 lines; only first 100 parsed');
 if(rows.length!==numbered.length)warnings.push('Unnumbered context was not assigned to any line; review manually');
 return {lines,warnings,status:'needs_review'};
}
