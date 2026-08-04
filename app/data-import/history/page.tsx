"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ImportBatch = {
  id:number; fileName:string; workbookType:string; status:string; rowCount:number;
  warningCount:number; committedRows:number; confirmedAt:string|null; rolledBackAt:string|null; createdAt:string;
  pendingRows:number; approvedRows:number; rejectedRows:number;
};

export default function ImportHistoryPage(){
  const [lang,setLang]=useState<"zh"|"en">("zh");
  const [batches,setBatches]=useState<ImportBatch[]>([]);
  const [message,setMessage]=useState("");
  const [busyId,setBusyId]=useState<number|null>(null);
  const t=(zh:string,en:string)=>lang==="zh"?zh:en;

  async function load(){
    setMessage("");
    const response=await fetch("/api/v4/imports",{cache:"no-store"});
    const data=await response.json().catch(()=>({}));
    if(!response.ok){setMessage(data.error||t("读取失败","Load failed"));return;}
    setBatches(data.batches||[]);
  }
  useEffect(()=>{
    let cancelled=false;
    fetch("/api/v4/imports",{cache:"no-store"}).then(async response=>{
      const data=await response.json().catch(()=>({}));
      if(cancelled)return;
      if(!response.ok){setMessage(data.error||(lang==="zh"?"读取失败":"Load failed"));return;}
      setBatches(data.batches||[]);
    });
    return()=>{cancelled=true;};
  },[lang]);

  async function rollback(id:number){
    if(!confirm(t("确认回滚这个导入批次？正式业务记录不会被删除。","Rollback this import batch? Committed business records will not be deleted.")))return;
    setBusyId(id);setMessage("");
    const response=await fetch(`/api/v4/imports/${id}/rollback`,{method:"POST"});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)setMessage(data.error||t("回滚失败","Rollback failed"));
    else{setMessage(t(`批次 #${id} 已回滚`,`Batch #${id} rolled back`));await load();}
    setBusyId(null);
  }

  return <main className="page"><header><div><small>BRAUN SMART PORTAL</small><h1>{t("Excel 导入历史","Excel Import History")}</h1><p>{t("查看已确认批次、警告数量和回滚状态。","Review confirmed batches, warnings and rollback status.")}</p></div><div><Link href="/data-import">{t("返回导入","Back to Import")}</Link><button onClick={()=>setLang(lang==="zh"?"en":"zh")}>{lang==="zh"?"English":"中文"}</button></div></header>
  {message&&<div className="message">{message}</div>}
  <section><div className="table"><table><thead><tr><th>ID</th><th>{t("文件","File")}</th><th>{t("类型","Type")}</th><th>{t("记录","Rows")}</th><th>{t("审核进度","Review")}</th><th>{t("警告","Warnings")}</th><th>{t("正式记录","Committed")}</th><th>{t("状态","Status")}</th><th>{t("确认时间","Confirmed")}</th><th>{t("操作","Action")}</th></tr></thead><tbody>{batches.map(batch=><tr key={batch.id}><td>#{batch.id}</td><td><Link className="review-link" href={`/data-import/history/${batch.id}`}><strong>{batch.fileName}</strong></Link></td><td>{batch.workbookType}</td><td>{batch.rowCount}</td><td><span className="approved">✓ {batch.approvedRows||0}</span> / <span className="pending">{batch.pendingRows||0}</span> / <span className="rejected">✕ {batch.rejectedRows||0}</span></td><td>{batch.warningCount}</td><td>{batch.committedRows||0}</td><td><span className={`status ${batch.status}`}>{batch.status}</span></td><td>{batch.confirmedAt?new Date(batch.confirmedAt).toLocaleString():"—"}</td><td><div className="row-actions"><Link href={`/data-import/history/${batch.id}`}>{t("审核","Review")}</Link><button disabled={busyId===batch.id||batch.status==="rolled_back"||(batch.committedRows||0)>0} onClick={()=>rollback(batch.id)}>{batch.status==="rolled_back"?t("已回滚","Rolled back"):t("回滚","Rollback")}</button></div></td></tr>)}</tbody></table>{!batches.length&&<div className="empty">{t("暂无导入批次","No import batches yet")}</div>}</div></section>
  <style jsx>{`.page{min-height:100vh;background:#f4f2ed;color:#18352c;padding:30px;font-family:Arial,"PingFang SC",sans-serif}header{max-width:1450px;margin:auto;display:flex;justify-content:space-between;gap:18px;align-items:flex-start}header div:last-child,.row-actions{display:flex;gap:10px;align-items:center}h1{margin:5px 0;font-size:34px}p,small{color:#687871}a,button{border:0;border-radius:9px;padding:10px 14px;background:#1f5b49;color:white;text-decoration:none;font-weight:700}.review-link{background:none;color:#18352c;padding:0}.approved{color:#18734e}.pending{color:#9a6a17}.rejected{color:#a13b31}button:disabled{background:#b7bdb9}.message{max-width:1450px;margin:18px auto;padding:12px;background:#fff3d8;border-radius:10px}section{max-width:1450px;margin:22px auto;background:white;border:1px solid #dedbd3;border-radius:18px;padding:20px}.table{overflow:auto}table{border-collapse:collapse;width:100%;min-width:1250px}th,td{padding:12px;border-bottom:1px solid #e7e4dd;text-align:left;font-size:13px}.status{padding:5px 8px;border-radius:999px;background:#edf0ee}.status.confirmed{background:#e5f1eb;color:#17603f}.status.rolled_back{background:#eee;color:#666}.empty{text-align:center;padding:32px;color:#75817c}@media(max-width:800px){.page{padding:16px}header{display:block}header div:last-child{margin-top:12px}}`}</style></main>;
}
