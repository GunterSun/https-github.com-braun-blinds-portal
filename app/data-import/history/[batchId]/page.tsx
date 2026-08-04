"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ReviewStatus = "pending" | "approved" | "rejected";
type ImportRow = {
  id:number; sourceSheet:string; sourceRow:number; recordType:string; orderNumber:string;
  customer:string; project:string; product:string; amount:number|null; currency:string|null;
  status:string; notes:string; warnings:string[]; reviewStatus:ReviewStatus; reviewNote:string;
  importStatus:string; reviewedAt:string|null;
};
type ImportBatch = { id:number; fileName:string; workbookType:string; status:string; rowCount:number; warningCount:number };
type CommitImpact = {approved:number;pending:number;rejected:number;committed:number;willCreate:number;blockers:Array<{rowId:number;reason:string}>};

export default function ImportReviewPage({params}:{params:Promise<{batchId:string}>}) {
  const {batchId}=use(params);
  const [lang,setLang]=useState<"zh"|"en">("zh");
  const [batch,setBatch]=useState<ImportBatch|null>(null);
  const [rows,setRows]=useState<ImportRow[]>([]);
  const [filter,setFilter]=useState<"all"|ReviewStatus>("all");
  const [message,setMessage]=useState("");
  const [busyId,setBusyId]=useState<number|null>(null);
  const [impact,setImpact]=useState<CommitImpact|null>(null);
  const [committing,setCommitting]=useState(false);
  const t=(zh:string,en:string)=>lang==="zh"?zh:en;

  useEffect(()=>{
    let cancelled=false;
    fetch(`/api/v4/imports/${batchId}`,{cache:"no-store"}).then(async response=>{
      const data=await response.json().catch(()=>({}));
      if(cancelled)return;
      if(!response.ok){setMessage(data.error||(lang==="zh"?"读取失败":"Load failed"));return;}
      setBatch(data.batch);setRows(data.rows||[]);
    });
    return()=>{cancelled=true;};
  },[batchId,lang]);

  const counts=useMemo(()=>rows.reduce((result,row)=>({...result,[row.reviewStatus]:result[row.reviewStatus]+1}),{pending:0,approved:0,rejected:0}),[rows]);
  const visibleRows=filter==="all"?rows:rows.filter(row=>row.reviewStatus===filter);

  function updateLocal(id:number,field:keyof ImportRow,value:string|number|null){
    setRows(current=>current.map(row=>row.id===id?{...row,[field]:value}:row));
  }

  async function save(row:ImportRow,reviewStatus:ReviewStatus){
    setBusyId(row.id);setMessage("");
    const response=await fetch(`/api/v4/imports/${batchId}/rows/${row.id}`,{
      method:"PATCH",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({...row,reviewStatus}),
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok)setMessage(data.error||t("保存失败","Save failed"));
    else{
      setRows(current=>current.map(item=>item.id===row.id?{...item,...data.row}:item));
      setBatch(current=>current?{...current,status:data.batchStatus||current.status}:current);
      setImpact(null);setMessage(reviewStatus==="approved"?t(`记录 #${row.id} 已批准`,`Row #${row.id} approved`):reviewStatus==="rejected"?t(`记录 #${row.id} 已驳回`,`Row #${row.id} rejected`):t(`记录 #${row.id} 已保存`,`Row #${row.id} saved`));
    }
    setBusyId(null);
  }

  async function previewCommit(){setMessage("");const response=await fetch(`/api/v4/imports/${batchId}/commit`,{cache:"no-store"});const data=await response.json().catch(()=>({}));if(!response.ok){setMessage(data.error||t("影响预览失败","Impact preview failed"));return}setImpact(data.impact)}
  async function commit(){if(!impact||impact.pending||impact.blockers.length||!impact.willCreate)return;setCommitting(true);setMessage("");const response=await fetch(`/api/v4/imports/${batchId}/commit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({confirm:true})});const data=await response.json().catch(()=>({}));if(!response.ok){setMessage(data.error||t("正式转换失败","Commit failed"));if(data.impact)setImpact(data.impact)}else{setBatch(current=>current?{...current,status:data.status}:current);setRows(current=>current.map(row=>row.reviewStatus==="approved"?{...row,importStatus:"committed"}:row));setImpact(null);setMessage(t(`已生成 ${data.created} 条正式业务记录`,`Created ${data.created} formal business records`))}setCommitting(false)}

  return <main className="page"><header><div><small>BRAUN SMART PORTAL</small><h1>{t("逐条导入审核","Import Row Review")}</h1><p>{batch?`${batch.fileName} · #${batch.id} · ${batch.workbookType}`:t("正在读取批次…","Loading batch…")}</p></div><div className="header-actions"><Link href="/data-import/history">{t("返回历史","Back to History")}</Link><button onClick={()=>setLang(lang==="zh"?"en":"zh")}>{lang==="zh"?"English":"中文"}</button></div></header>
  <section className="notice"><strong>{t("安全审核区","Safe review area")}</strong><span>{t("批准只表示字段已核对。所有行审核完成后，先查看影响预览，再明确确认生成正式业务记录。","Approval confirms fields only. Review every row, preview the impact, then explicitly commit formal business records.")}</span></section>
  {message&&<div className="message">{message}</div>}
  <section className="toolbar"><div><strong>{rows.length}</strong> {t("条记录","rows")} · <span className="approved">✓ {counts.approved}</span> · <span className="pending">◷ {counts.pending}</span> · <span className="rejected">✕ {counts.rejected}</span> · {t("批次状态","Batch status")}: <strong>{batch?.status||"—"}</strong></div><div className="filters">{(["all","pending","approved","rejected"] as const).map(value=><button className={filter===value?"active":""} key={value} onClick={()=>setFilter(value)}>{value}</button>)}</div></section>
  {batch&&batch.status!=="rolled_back"&&batch.status!=="committed"&&<section className="commit-card"><div><strong>{t("正式转换","Commit to business records")}</strong><p>{t("系统会阻止待审核、unknown、币种不明或无法匹配订单的记录。","Pending, unknown, ambiguous-currency, and unmatched-order rows are blocked.")}</p></div><button onClick={()=>void previewCommit()}>{t("查看影响预览","Preview impact")}</button>{impact&&<div className="impact"><span>{t("将生成","Will create")}: <b>{impact.willCreate}</b></span><span>{t("待审核","Pending")}: <b>{impact.pending}</b></span><span>{t("阻断","Blockers")}: <b>{impact.blockers.length}</b></span>{impact.blockers.map(item=><span className="blocker" key={`${item.rowId}-${item.reason}`}>#{item.rowId} · {item.reason}</span>)}<button className="commit" disabled={committing||impact.pending>0||impact.blockers.length>0||impact.willCreate===0} onClick={()=>void commit()}>{committing?t("转换中…","Committing…"):t("确认生成正式记录","Confirm commit")}</button></div>}</section>}
  <section className="rows">{visibleRows.map(row=><article key={row.id} className={`row ${row.reviewStatus}`}><div className="row-head"><div><strong>#{row.id}</strong> · {row.sourceSheet} #{row.sourceRow}</div><span>{row.reviewStatus}</span></div><div className="grid">
    <label>{t("记录类型","Type")}<select value={row.recordType} onChange={e=>updateLocal(row.id,"recordType",e.target.value)}>{["order","expense","payment","settlement","unknown"].map(value=><option key={value}>{value}</option>)}</select></label>
    <label>{t("订单号","Order number")}<input value={row.orderNumber} onChange={e=>updateLocal(row.id,"orderNumber",e.target.value)}/></label>
    <label>{t("客户/对象","Customer/Payee")}<input value={row.customer} onChange={e=>updateLocal(row.id,"customer",e.target.value)}/></label>
    <label>{t("项目","Project")}<input value={row.project} onChange={e=>updateLocal(row.id,"project",e.target.value)}/></label>
    <label>{t("产品/说明","Product/Description")}<input value={row.product} onChange={e=>updateLocal(row.id,"product",e.target.value)}/></label>
    <label>{t("金额","Amount")}<input type="number" step="0.01" value={row.amount??""} onChange={e=>updateLocal(row.id,"amount",e.target.value===""?null:Number(e.target.value))}/></label>
    <label>{t("币种","Currency")}<select value={row.currency||""} onChange={e=>updateLocal(row.id,"currency",e.target.value)}><option value="">—</option><option value="USD">USD</option><option value="RMB">RMB</option></select></label>
    <label>{t("业务状态","Business status")}<input value={row.status} onChange={e=>updateLocal(row.id,"status",e.target.value)}/></label>
    <label className="wide">{t("原备注","Notes")}<input value={row.notes} onChange={e=>updateLocal(row.id,"notes",e.target.value)}/></label>
    <label className="wide">{t("审核备注","Review note")}<input value={row.reviewNote} onChange={e=>updateLocal(row.id,"reviewNote",e.target.value)}/></label>
  </div>{row.warnings.length>0&&<div className="warnings">{row.warnings.map(warning=><span key={warning}>{warning}</span>)}</div>}<div className="actions"><button disabled={busyId===row.id||batch?.status==="rolled_back"||row.importStatus==="committed"} onClick={()=>save(row,"pending")}>{t("保存修改","Save")}</button><button className="reject" disabled={busyId===row.id||batch?.status==="rolled_back"||row.importStatus==="committed"} onClick={()=>save(row,"rejected")}>{t("驳回","Reject")}</button><button className="approve" disabled={busyId===row.id||batch?.status==="rolled_back"||row.importStatus==="committed"} onClick={()=>save(row,"approved")}>{t("批准","Approve")}</button></div></article>)}</section>
  <style jsx>{`.page{min-height:100vh;background:#f4f2ed;color:#18352c;padding:28px;font-family:Arial,"PingFang SC",sans-serif}header,.notice,.toolbar,.commit-card,.rows,.message{max-width:1450px;margin-left:auto;margin-right:auto}header{display:flex;justify-content:space-between;gap:18px}.header-actions,.filters,.actions{display:flex;gap:9px;align-items:center}h1{margin:5px 0}p,small{color:#687871}a,button{border:0;border-radius:9px;padding:10px 14px;background:#1f5b49;color:white;text-decoration:none;font-weight:700}.notice,.toolbar,.commit-card,.message{box-sizing:border-box;margin-top:18px;padding:14px 16px;background:white;border:1px solid #dedbd3;border-radius:13px}.notice{display:grid;gap:5px;background:#fff3d8}.toolbar{display:flex;justify-content:space-between;align-items:center}.commit-card{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;border-color:#c9d9d1}.commit-card p{margin:5px 0}.impact{grid-column:1/-1;display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding-top:12px;border-top:1px solid #e2e7e4}.impact .blocker{width:100%;background:#fff0ec;color:#95392e;padding:8px;border-radius:8px}.impact .commit{margin-left:auto;background:#176b4b}.filters button{background:#e3e8e5;color:#29483e}.filters .active{background:#1f5b49;color:white}.approved{color:#18734e}.pending{color:#9a6a17}.rejected{color:#a13b31}.rows{display:grid;gap:14px;margin-top:14px}.row{background:white;border:1px solid #dedbd3;border-left:5px solid #c0aaa0;border-radius:15px;padding:17px}.row.approved{border-left-color:#2f8b63}.row.rejected{border-left-color:#b65348}.row-head{display:flex;justify-content:space-between;margin-bottom:13px}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px}.grid label{display:grid;gap:5px;font-size:12px;color:#617169}.grid .wide{grid-column:span 2}input,select{box-sizing:border-box;width:100%;border:1px solid #cfd6d2;border-radius:8px;padding:9px;background:white;color:#18352c}.warnings{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.warnings span{background:#fff0dd;color:#9a4e16;padding:6px 9px;border-radius:999px;font-size:12px}.actions{justify-content:flex-end;margin-top:14px}.actions .reject{background:#a24b42}.actions .approve{background:#19714f}button:disabled{opacity:.5}@media(max-width:850px){.page{padding:15px}header,.toolbar{display:block}.header-actions,.filters{margin-top:12px;flex-wrap:wrap}.grid{grid-template-columns:1fr 1fr}.grid .wide{grid-column:span 2}}@media(max-width:520px){.grid{grid-template-columns:1fr}.grid .wide{grid-column:span 1}.actions{flex-wrap:wrap;justify-content:stretch}.actions button{flex:1}.commit-card{grid-template-columns:1fr}.impact{grid-column:1}.impact .commit{margin-left:0}}`}</style></main>;
}
