"use client";
import {useState} from "react";
import {extractInquiryLines,type InquiryLine} from "./extract-lines";
import {parseInches,type InquiryDraft} from "./extract-inquiry";
import {quoteDraftGate} from "./quote-adapter";

export default function AiInquiryDraftPreview(){
 const [source,setSource]=useState("");
 const [lines,setLines]=useState<InquiryLine[]>([]);
 const [fieldEdits,setFieldEdits]=useState<Record<string,string>>({});
 const [warnings,setWarnings]=useState<string[]>([]);
 const [notice,setNotice]=useState("");
 const [locale,setLocale]=useState<"zh"|"en">("zh");
 const en=locale==="en";
 const warningZh:Record<string,string>={
  "Inquiry exceeded 12,000 characters; truncated text requires manual review":"询价超过 12,000 个字符，内容已截断，请人工核对遗漏窗位。",
  "No explicit line numbering; review whether the message contains multiple windows":"未找到明确的窗位编号，请核对是否包含多个窗位。",
  "Window numbering does not start at 1; verify missing earlier windows":"窗位编号不是从 1 开始，请检查前面的窗位是否遗漏。",
  "Duplicate window line numbers detected; verify each window manually":"发现重复窗位编号，请逐项人工核对。",
  "Window line numbering is out of sequence; check for omitted or reordered windows":"窗位编号跳号或倒序，请检查遗漏或顺序错误。",
  "More than 100 lines; only first 100 parsed":"超过 100 个窗位，仅识别前 100 项，请人工处理剩余内容。",
  "Unnumbered context was not assigned to any line; review manually":"存在未编号的补充内容，未自动分配到任何窗位，请人工核对。"
 };

 const noteZh:Record<string,string>={
  "Multiple product models in one window; split and verify with customer":"同一窗位出现多个不同型号，请拆分并向客户确认。",
  "Multiple dimension pairs in one window; verify which size applies":"同一窗位出现多组宽高尺寸，请向客户确认使用哪一组。",
  "Invalid dimension pair in source; verify width and height":"原始询价中存在无效尺寸，请核实宽度和高度。",
  "Conflicting quantities in one window; verify the intended count":"同一窗位出现不同数量，请向客户确认正确数量。",
  "Invalid quantity statement in source; verify the intended positive whole number":"原始询价中出现无效数量，请向客户确认正确的正整数数量。",
  "Unresolved quantity statement in source; confirm count with customer":"原始询价中有待定或未知数量，请向客户确认数量。",
  "Conflicting opacity options: LF and BO; verify with customer":"透光 LF 与遮光 BO 同时出现，请向客户确认。",
  "Conflicting hardware colors: WH and BK; verify with customer":"白色配件 WH 与黑色配件 BK 同时出现，请向客户确认。",
  "Motorized and cordless both requested; verify operating system":"电动与无绳操作同时出现，请向客户确认操作方式。"
 };
 const extract=()=>{
  if(!source.trim()){setNotice(en?"Enter an inquiry first.":"请先粘贴客户询价。");return;}
  const result=extractInquiryLines(source);
  setLines(result.lines);setFieldEdits({});setWarnings(result.warnings);
  setNotice(en?"Review-only drafts; nothing was saved or sent.":"仅生成待审核草稿；未保存或发送任何信息。");
 };
 const update=(index:number,field:"productCode"|"widthInches"|"heightInches"|"quantity",value:string)=>{
  setFieldEdits(previous=>({...previous,[`${index}:${field}`]:value}));
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
  <textarea id="inquiry" value={source} onChange={e=>{setSource(e.target.value);setLines([]);setFieldEdits({});setWarnings([]);setNotice("");}} rows={7}
   placeholder={"1. JL3601 White LF 39 5/8 x 40 5/8 qty 1\n2. ML-1801 36 x 60 qty 2 motorized"}
   style={{width:"100%",boxSizing:"border-box",padding:12,border:"1px solid #94a3b8",borderRadius:8}}/>
  <button type="button" onClick={extract} style={{marginTop:12,padding:"10px 18px",background:"#123d5a",color:"white",borderRadius:8}}>{en?"Extract drafts":"识别询价"}</button>
  {notice&&<p role="status">{notice}</p>}
  {warnings.map((warning,i)=><p key={i} role="alert" style={{color:"#92400e"}}>⚠ {en?warning:(warningZh[warning]??warning)}</p>)}
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,320px),1fr))",gap:16,marginTop:22}}>
   {lines.map((line,i)=><section key={i} style={{border:"1px solid #cbd5e1",borderRadius:10,padding:18,minWidth:0}}>
    <h2 style={{fontSize:19,fontWeight:700}}>{en?"Line":"第"} {i+1} {en?"— review required":"项 · 待审核"}</h2>
    {fields.map(([field,zh,label])=><label key={field} style={{display:"block",margin:"12px 0"}}>{en?label:zh}
     <input type="text" inputMode={field==="productCode"?"text":"decimal"} value={fieldEdits[`${i}:${field}`]??(line.draft[field]??"")}
      onChange={e=>update(i,field,e.target.value)}
      style={{boxSizing:"border-box",display:"block",width:"100%",padding:9,border:"1px solid #94a3b8",borderRadius:6}}/>
    </label>)}
    {fields.filter(([field])=>field!=="productCode"&&fieldEdits[`${i}:${field}`]!==undefined&&line.draft[field]===null).map(([field,zh,label])=><p key={`error-${field}`} role="alert" style={{color:"#b91c1c"}}>{en?label:zh}：{en?"Invalid value. Enter a positive number; fractions such as 39 5/8 are supported.":"输入无效。请输入正数；尺寸支持 39 5/8 等分数英寸。"}</p>)}
    <p>{en?"Color":"颜色"}：{line.draft.color??"—"} · {en?"Options":"选项"}：{line.draft.options.join(", ")||"—"}</p>
    <p>{en?"Verified fabric code":"已核实面料代码"}：{line.draft.fabricCode??"—"}</p>
    {!line.draft.fabricCode&&<p style={{color:"#92400e",fontWeight:600}}>{en?"Fabric is not verified. Confirm the correct product catalog before pricing.":"面料代码尚未核实。请先核对对应产品目录，JL 系列不得套用 Z 系列价格。"}</p>}
    {line.draft.notes.map((note,j)=><p key={`note-${j}`} role="alert" style={{color:"#b91c1c",fontWeight:600}}>⚠ {en?note:(noteZh[note]??note)}</p>)}
    <p>{en?"Missing":"缺失"}：{line.draft.missing.join(", ")||"—"}</p>
    <p style={{color:"#92400e"}}>{en?(line.draft.notes.length?"Unresolved conflicting or ambiguous inquiry details require customer confirmation. Formal quote issuance is blocked.":line.draft.missing.length?"Required inquiry details are missing. Complete and manually verify them before quoting.":"Customer pricing, product catalog, and quote version are not verified. Formal quote issuance is blocked."):quoteDraftGate(line.draft).reason}</p>
   </section>)}
  </div>
  <p style={{fontSize:13,color:"#475569",marginTop:24}}>{en?"Never use this preview for unverified pricing or formal quote issuance.":"此预览不执行价格计算、正式签发或生产放行。"}</p>
 </main>;
}
