"use client";
import {useRef,useState} from "react";
import {type InquiryLine} from "./extract-lines";
import {parseInches} from "./extract-inquiry";
import {inspectIntakeFile,signatureMatches} from "./intake-file";
import {parseDelimitedInquiry} from "./intake-delimited";
import {isDrapery,reviewDrapery} from "./drapery-review";
import {quoteDraftGate} from "./quote-adapter";

import {captureInquiry,captureMeasurement,emptyMeasurement,measurementDifferences,measurementDimensions,recordRevision,type FieldRevision} from "./inquiry-record";

const draperyLabels = {
 dimensions:["轨道 / 杆宽与成品高度","Track / rod width and finished height"],
 mount:["口内 / 口外","Mount"], draw:["开合方式","Draw"],
 lining:["衬布","Lining"], pleat:["褶型","Pleat"], hardware:["杆 / 轨道颜色","Hardware color"],
} as const;

const measurementKinds = {
 field:["现场读数","Field reading"], design:["设计图读数","Design dimension"],
 budget:["预算尺寸","Budget dimension"], finished:["加工 / 成品尺寸","Finished dimension"],
 inquiry:["询价尺寸","Inquiry dimension"],
} as const;

const measurementLabels = {
 sourceRef:["来源 / 表格行或 PDF 页","Source / workbook row or PDF page"],
 windowId:["原窗位编号","Original window ID"], room:["房间 / 楼层","Room / floor"],
 visitOrder:["走访顺序","Visit order"], mount:["口内 / 口外","Inside / outside mount"],
 top:["上宽","Top width"], middleWidth:["中宽","Middle width"], bottom:["下宽","Bottom width"],
 left:["左高","Left height"], middleHeight:["中高","Middle height"], right:["右高","Right height"],
 depth:["窗框深度","Depth"], notes:["照片编号 / 供电 / 障碍","Photo IDs / power / obstructions"],
} as const;

export default function AiInquiryDraftPreview(){
 const [draperySelection,setDraperySelection]=useState<Record<number,boolean>>({});
 const [sources,setSources]=useState<ReturnType<typeof captureInquiry>[]>([]);
 const [history,setHistory]=useState<FieldRevision[]>([]);
 const [measurement,setMeasurement]=useState(emptyMeasurement);
 const [measurements,setMeasurements]=useState<ReturnType<typeof captureMeasurement>[]>([]);
 const [reviewNote,setReviewNote]=useState("");
 const [reviewNotes,setReviewNotes]=useState<{text:string;recordedAt:string}[]>([]);
 const previousValue=useRef("");
 const [source,setSource]=useState("");
 const [fileNotice,setFileNotice]=useState("");
 const [selectedFile,setSelectedFile]=useState<string|null>(null);
 const inspectFile=async(file:File)=>{
  setSelectedFile(null);
  const preflight=inspectIntakeFile(file.name,file.size,file.type);
  if(!preflight.ok||!preflight.kind){setFileNotice(preflight.reason);return;}
  const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer());
  if(!signatureMatches(preflight.kind,bytes)){setFileNotice(en?"File signature mismatch; rejected.":"文件内容与格式不匹配，已拒绝。");return;}
  setSelectedFile(file.name);
  if(preflight.kind==="text"){
   let text=await file.text();
   if(/\\.(csv|tsv)$/i.test(file.name)){
    try {
     const table=parseDelimitedInquiry(text,/\\.tsv$/i.test(file.name)?"\\t":",");
     text=table.text;
     if(table.warnings.length){setFileNotice(table.warnings.join("; "));}
    }catch(error){setFileNotice(error instanceof Error?error.message:"Invalid table");return;}
   }
   if(text.length>12000){setFileNotice(en?"Text exceeds 12,000 characters. Paste a shorter section for review.":"文本超过 12,000 字符，请分段处理。");return;}
   setSource(text);setLines([]);setWarnings([]);
   setFileNotice(en?"Text/table loaded locally. Click Extract drafts. Nothing uploaded.":"文本/表格已在本机载入，请点击识别询价；文件没有上传。");
  }else setFileNotice(en?"File checked locally. Image/Excel/PDF extraction is not connected yet; no upload occurred.":"文件已通过本地初步检查。照片/Excel/PDF 解析尚未接入，未上传文件。");
 };
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
  "Conflicting opacity options: LF and BO; verify with customer":"透光 LF 与遮光 BO 同时出现，请向客户确认。",
  "Conflicting hardware colors: WH and BK; verify with customer":"白色配件 WH 与黑色配件 BK 同时出现，请向客户确认。",
  "Motorized and cordless both requested; verify operating system":"电动与无绳操作同时出现，请向客户确认操作方式。"
 };
 const extract=()=>{
  if(!source.trim()){setNotice(en?"Enter an inquiry first.":"请先粘贴客户询价。");return;}
  const result=captureInquiry(source,new Date().toISOString());
  setSources(previous=>[...previous,result]);
  setDraperySelection({});
  setLines(result.lines);setFieldEdits({});setWarnings(result.warnings);
  setNotice(en?"Draft recorded for review in this session.":"已在当前会话记录待审核草稿。");
 };
 const update=(index:number,field:"productCode"|"widthInches"|"heightInches"|"quantity",value:string)=>{
  setFieldEdits(previous=>({...previous,[`${index}:${field}`]:value}));
  setLines(previous=>previous.map((line,i)=>{
   if(i!==index)return line;
   const next={...line.draft};
   if(field==="productCode")next.productCode=value.trim().toUpperCase()||null;
   else if(field==="quantity")next.quantity=/^[1-9]\d*$/.test(value)&&Number.isSafeInteger(Number(value))?Number(value):null;
   else {
    next[field]=parseInches(value);
    next[field==="widthInches"?"widthRaw":"heightRaw"]=value;
   }
   next.missing=(["productCode","widthInches","heightInches","quantity"] as const).filter(key=>!next[key]);
   return {...line,draft:next};
  }));
 };
 const measurementReview=measurements.map(entry=>{
  const differences=measurementDifferences(entry,measurements,sources);
  return {...entry,differences,conflicts:[...new Set(differences.map(item=>item.field))]};
 });
 const draperyReviews=lines.map((line,index)=>
  (draperySelection[index]??isDrapery(line.source)) ? reviewDrapery(line.source) : null
 );
 const exportRecord=()=>{
  const file=new Blob([JSON.stringify({schemaVersion:1,sources,history,measurements:measurementReview,reviewNotes,currentLines:lines,draperyReviews},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(file);
  const link=document.createElement("a");
  link.href=url;
  link.download="braun-inquiry-record.json";
  link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const fields=[["productCode","型号","Model"],["widthInches","宽度（英寸）","Width (in)"],["heightInches","高度（英寸）","Height (in)"],["quantity","数量","Quantity"]] as const;
 return <main style={{maxWidth:1000,margin:"0 auto",padding:"24px 16px",fontFamily:"system-ui",color:"#152235"}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
   <h1 style={{fontSize:26,fontWeight:700}}>Braun Blinds · {en?"Inquiry Drafts":"AI 询价草稿工作台"}</h1>
   <button type="button" onClick={()=>setLocale(en?"zh":"en")}>{en?"中文":"English"}</button>
  </div>
  <p>{en?"Owner only. Entries stay in this session until exported.":"仅限 Owner。记录暂存在本页，刷新前请导出。"}</p>
  <section style={{border:"1px solid #cbd5e1",borderRadius:8,padding:14,marginTop:16}}>
   <label htmlFor="intake-file" style={{display:"block",fontWeight:600}}>{en?"Select inquiry file (local preflight)":"选择客户询价文件（本地预检查）"}</label>
   <input id="intake-file" type="file" accept=".jpg,.jpeg,.png,.heic,.pdf,.xlsx,.xls,.txt,.csv,.tsv" onChange={event=>{const file=event.target.files?.[0];if(file)void inspectFile(file);event.target.value="";}}/>
   {selectedFile&&<p>{selectedFile}</p>}
   {fileNotice&&<p role="status">{fileNotice}</p>}
   <p style={{fontSize:12}}>{en?"TXT/CSV/TSV can be read locally. No files are uploaded or saved.":"本版本可本地读取 TXT/CSV/TSV；照片、Excel、PDF 暂只检查格式，文件不会上传或保存。"}</p>
  </section>
  <label htmlFor="inquiry" style={{display:"block",fontWeight:600,marginTop:18}}>{en?"Customer inquiry":"客户邮件 / 短信 / 微信询价"}</label>
  <textarea id="inquiry" value={source} onChange={e=>{setSource(e.target.value);setLines([]);setFieldEdits({});setWarnings([]);setNotice("");}} rows={7}
   placeholder={"1. JL3601 White LF 39 5/8 x 40 5/8 qty 1\n2. ML-1801 36 x 60 qty 2 motorized"}
   style={{width:"100%",boxSizing:"border-box",padding:12,border:"1px solid #94a3b8",borderRadius:8}}/>
  <button type="button" onClick={extract} style={{marginTop:12,padding:"10px 18px",background:"#123d5a",color:"white",borderRadius:8}}>{en?"Extract drafts":"识别询价"}</button>
  {notice&&<p role="status">{notice}</p>}
  {warnings.map((warning,i)=><p key={i} role="alert" style={{color:"#92400e"}}>⚠ {en?warning:(warningZh[warning]??warning)}</p>)}
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,320px),1fr))",gap:16,marginTop:22}}>
   {lines.map((line,i)=><section key={i} style={{border:"1px solid #cbd5e1",borderRadius:10,padding:18,minWidth:0}}>
    <h2 style={{fontSize:19,fontWeight:700}}>{en?"Line":"第"} {line.originalWindowId??i+1} {en?"— human review required":"· 待人工确认"}</h2>
    <details><summary>{en?"Original line":"客户原话"}</summary><p style={{whiteSpace:"pre-wrap"}}>{line.originalRow}</p></details>
    {fields.map(([field,zh,label])=><label key={field} style={{display:"block",margin:"12px 0"}}>{en?label:zh}
     <input type="text" inputMode={field==="productCode"?"text":"decimal"} value={fieldEdits[`${i}:${field}`]??(field==="widthInches"?line.draft.widthRaw:field==="heightInches"?line.draft.heightRaw:line.draft[field])??""}
      onFocus={e=>{previousValue.current=e.target.value;}}
      onBlur={e=>{
       const revision={windowId:line.originalWindowId,lineIndex:i+1,sourceVersion:sources.length,field,previous:previousValue.current,next:e.target.value,recordedAt:new Date().toISOString()};
       setHistory(previous=>recordRevision(previous,revision));
      }}
      onChange={e=>update(i,field,e.target.value)}
      style={{boxSizing:"border-box",display:"block",width:"100%",padding:9,border:"1px solid #94a3b8",borderRadius:6}}/>
    </label>)}
    {fields.filter(([field])=>field!=="productCode"&&fieldEdits[`${i}:${field}`]!==undefined&&line.draft[field]===null).map(([field,zh,label])=><p key={`error-${field}`} role="alert" style={{color:"#b91c1c"}}>{en?label:zh}：{en?"Invalid value. Enter a positive number; fractions such as 39 5/8 are supported.":"输入无效。请输入正数；尺寸支持 39 5/8 等分数英寸。"}</p>)}
    <label style={{display:"block",marginTop:12}}>
     <input type="checkbox" checked={draperySelection[i]??isDrapery(line.source)} onChange={event=>{
      const checked=event.target.checked;
      setDraperySelection(previous=>({...previous,[i]:checked}));
     }}/>
     {en?"Drapery checklist":"布艺帘审单清单"}
    </label>
    {draperyReviews[i]&&<ul aria-label={en?"Drapery review":"布艺帘审单结果"}>
     {draperyReviews[i]?.map(item=><li key={item.field}>
      {draperyLabels[item.field][en?1:0]} · {item.status==="present"?(en?"Found in source":"原文已提供"):item.status==="conflict"?(en?"Conflict — human review required":"冲突 · 待人工确认"):(en?"Missing or uncertain — human review required":"缺失或不明确 · 待人工确认")}
      {item.evidence.length>0&&<> · {item.evidence.join(" / ")}</>}
     </li>)}
    </ul>}
    <p>{en?"Color":"颜色"}：{line.draft.color??"—"} · {en?"Options":"选项"}：{line.draft.options.join(", ")||"—"}</p>
    <p>{en?"Verified fabric code":"已核实面料代码"}：{line.draft.fabricCode??"—"}</p>
    {!line.draft.fabricCode&&<p style={{color:"#92400e",fontWeight:600}}>{en?"Fabric is not verified. Confirm the correct product catalog before pricing.":"面料代码尚未核实。请先核对对应产品目录，JL 系列不得套用 Z 系列价格。"}</p>}
    {line.draft.notes.map((note,j)=><p key={`note-${j}`} role="alert" style={{color:"#b91c1c",fontWeight:600}}>⚠ {en?note:(noteZh[note]??note)}</p>)}
    <p>{en?"Missing":"缺失"}：{line.draft.missing.join(", ")||"—"}</p>
    <p style={{color:"#92400e"}}>{en?(line.draft.notes.length?"Unresolved conflicting or ambiguous inquiry details require customer confirmation. Formal quote issuance is blocked.":line.draft.missing.length?"Required inquiry details are missing. Complete and manually verify them before quoting.":"Customer pricing, product catalog, and quote version are not verified. Formal quote issuance is blocked."):quoteDraftGate(line.draft).reason}</p>
   </section>)}
  </div>
  <section style={{marginTop:28}}>
   <h2>{en?"Source and revision history":"来源与修改历史"}</h2>
   {sources.map((entry,i)=><details key={i}><summary>{en?"Source":"来源"} {i+1} · {entry.recordedAt}</summary><p style={{whiteSpace:"pre-wrap"}}>{entry.text}</p></details>)}
   {history.map((entry,i)=><p key={i}>{entry.recordedAt} · #{entry.sourceVersion} / {entry.windowId??entry.lineIndex} · {fields.find(([field])=>field===entry.field)?.[en?2:1]} · {entry.previous||"—"} → {entry.next||"—"}</p>)}
   <form onSubmit={event=>{
    event.preventDefault();
    if(!reviewNote.trim())return;
    setReviewNotes(previous=>[...previous,{text:reviewNote,recordedAt:new Date().toISOString()}]);
    setReviewNote("");
   }}>
    <label>{en?"Evidence or question for human review":"人工确认问题 / 补充证据"} <input value={reviewNote} onChange={e=>setReviewNote(e.target.value)}/></label>
    <button type="submit">{en?"Record review note":"记录待确认事项"}</button>
   </form>
   {reviewNotes.map((entry,i)=><p key={i} role="status">{en?"Human review required":"待人工确认"} · {entry.text}</p>)}
  </section>
  <section style={{marginTop:28}}>
   <h2>{en?"Field measurements (inches)":"现场测量（英寸）"}</h2>
   <p>{en?"Keep the original ID when adding a new visit. Enter fractions such as 34 1/2.":"复测另加一笔，沿用原窗位编号。可直接输入 34 1/2 等分数。"}</p>
   <form onSubmit={event=>{
    event.preventDefault();
    if(!measurement.windowId.trim())return;
    setMeasurements(previous=>[...previous,captureMeasurement(measurement,new Date().toISOString())]);
    setMeasurement(emptyMeasurement);
   }}>
    <label>{en?"Dimension type":"尺寸用途"} <select value={measurement.kind} onChange={e=>setMeasurement({...measurement,kind:e.target.value as typeof measurement.kind})}>
     {(["field","design","budget","finished"] as const).map(kind=><option key={kind} value={kind}>{measurementKinds[kind][en?1:0]}</option>)}
    </select></label>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12}}>
     {(["windowId","sourceRef","room","visitOrder","mount",...measurementDimensions,"notes"] as const).map(field=><label key={field}>
      {measurementLabels[field][en?1:0]}
      <input required={field==="windowId"} value={measurement[field]} style={{display:"block",width:"100%"}} onChange={e=>setMeasurement({...measurement,[field]:e.target.value})}/>
     </label>)}
    </div>
    <button type="submit" style={{marginTop:12}}>{en?"Add measurement":"追加测量记录"}</button>
   </form>
   {measurementReview.map(({input,issues,conflicts,differences,recordedAt},i)=><details key={i} open={issues.length>0||conflicts.length>0}><summary>{input.windowId} · {measurementKinds[input.kind][en?1:0]} · {input.sourceRef} · {recordedAt}</summary>
    <p>{measurementDimensions.map(field=>`${measurementLabels[field][en?1:0]} ${input[field]||"—"}`).join(" · ")}</p>
    <p>{input.visitOrder} · {input.mount} · {input.notes}</p>
    {issues.length>0&&<p role="alert">{en?"Human review required (missing or invalid)":"待人工确认（缺失或无效）"}：{issues.map(field=>measurementLabels[field][en?1:0]).join("、")}</p>}
    {differences.length>0&&<div role="alert">
     <p>{en?"Human review required. Verify whether the values measure the same thing.":"待人工确认：请核对两份尺寸是否属于同一测量口径。"}</p>
     <ul>{differences.map((item,index)=><li key={index}>{measurementLabels[item.field][en?1:0]} · {item.current} / {item.other} · {measurementKinds[item.kind][en?1:0]} · {item.source}</li>)}</ul>
    </div>}
   </details>)}
  </section>
  <button type="button" style={{marginTop:20}} onClick={exportRecord} disabled={!sources.length&&!measurements.length&&!reviewNotes.length}>{en?"Download record (JSON)":"导出记录（JSON）"}</button>
  <p style={{fontSize:13,color:"#475569",marginTop:24}}>{en?"Never use this preview for unverified pricing or formal quote issuance.":"此预览不执行价格计算、正式签发或生产放行。"}</p>
 </main>;
}
