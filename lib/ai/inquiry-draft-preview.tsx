"use client";
import {useState} from "react";
import {extractInquiryLines,type InquiryLine} from "./extract-lines";
import {parseInches,type InquiryDraft} from "./extract-inquiry";
import {quoteDraftGate} from "./quote-adapter";

export default function AiInquiryDraftPreview(){
 const [source,setSource]=useState("");
 const [lines,setLines]=useState<InquiryLine[]>([]);
 const [warnings,setWarnings]=useState<string[]>([]);
 const [notice,setNotice]=useState("");
 const [locale,setLocale]=useState<"zh"|"en">("zh");
 const en=locale==="en";
 const extract=()=>{
  if(!source.trim()){setNotice(en?"Enter an inquiry first.":"请先粘贴客户询价。");return;}
  const result=extractInquiryLines(source);
  setLines(result.lines);setWarnings(result.warnings);
  setNotice(en?"Review-only drafts; nothing was saved or sent.":"仅生成待审核草稿；未保存或发送任何信息。");
 };
 const update=(index:number,field:"productCode"|"widthInches"|"heightInches"|"quantity",value:string)=>{
  setLines(previous=>previous.map((line,i)=>{
   if(i!==index)return line;
   const next={...line.draft};
   if(field==="productCode")next.productCode=value.trim().toUpperCase()||null;
   else if(field==="quantity")next.quantity=/^[1-9]\d*$/.test(value)&&Number.isSafeInteger(Number(value))?Number(value):null;
   else next[field]=parseInches(value);
   next.missing=(["productCode","widthInches","heightInches","quantity"] as const).filter(key=>!next[key]);
   return {...line,draft:next};
  }));
 };
 const fields=[["productCode","型号","Model"],["widthInches","宽度（英寸）","Width (in)"],["heightInches","高度（英寸）","Height (in)"],["quantity","数量","Quantity"]] as const;
 return <main style={{maxWidth:1000,margin:"0 auto",padding:"24px 16px",fontFamily:"system-ui",color:"#152235"}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
   <h1 style={{fontSize:26,fontWeight:700}}>Braun Blinds · {en?"Inquiry Drafts":"AI 询价草稿工作台"}</h1>
   <button type="button" onClick={()=>setLocale(en?"zh":"en")}>{en?"中文":"English"}</button>
  </div>
  <p>{en?"Owner-only preview. No saving, email or factory orders.":"仅限 Owner 的开发预览，不保存、不发邮件、不下工厂单。"}</p>
  <label htmlFor="inquiry" style={{display:"block",fontWeight:600,marginTop:18}}>{en?"Customer inquiry":"客户邮件 / 短信 / 微信询价"}</label>
  <textarea id="inquiry" value={source} onChange={e=>setSource(e.target.value)} rows={7}
   placeholder={"1. JL3601 White LF 39 5/8 x 40 5/8 qty 1\n2. ML-1801 36 x 60 qty 2 motorized"}
   style={{width:"100%",boxSizing:"border-box",padding:12,border:"1px solid #94a3b8",borderRadius:8}}/>
  <button type="button" onClick={extract} style={{marginTop:12,padding:"10px 18px",background:"#123d5a",color:"white",borderRadius:8}}>{en?"Extract drafts":"识别询价"}</button>
  {notice&&<p role="status">{notice}</p>}
  {warnings.map((warning,i)=><p key={i} style={{color:"#92400e"}}>⚠ {warning}</p>)}
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,320px),1fr))",gap:16,marginTop:22}}>
   {lines.map((line,i)=><section key={i} style={{border:"1px solid #cbd5e1",borderRadius:10,padding:18,minWidth:0}}>
    <h2 style={{fontSize:19,fontWeight:700}}>{en?"Line":"第"} {i+1} {en?"— review required":"项 · 待审核"}</h2>
    {fields.map(([field,zh,label])=><label key={field} style={{display:"block",margin:"12px 0"}}>{en?label:zh}
     <input type="text" inputMode={field==="productCode"?"text":"decimal"} value={line.draft[field]??""}
      onChange={e=>update(i,field,e.target.value)}
      style={{boxSizing:"border-box",display:"block",width:"100%",padding:9,border:"1px solid #94a3b8",borderRadius:6}}/>
    </label>)}
    <p>{en?"Color":"颜色"}：{line.draft.color??"—"} · {en?"Options":"选项"}：{line.draft.options.join(", ")||"—"}</p>
    <p>{en?"Verified fabric code":"已核实面料代码"}：{line.draft.fabricCode??"—"}</p>
    <p>{en?"Missing":"缺失"}：{line.draft.missing.join(", ")||"—"}</p>
    <p style={{color:"#92400e"}}>{quoteDraftGate(line.draft).reason}</p>
   </section>)}
  </div>
  <p style={{fontSize:13,color:"#475569",marginTop:24}}>{en?"Never use this preview for unverified pricing or formal quote issuance.":"此预览不执行价格计算、正式签发或生产放行。"}</p>
 </main>;
}
