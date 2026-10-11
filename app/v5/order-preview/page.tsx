'use client';
import {useState} from 'react';
import {requestJson} from '@/lib/request-json';
import type {buildOrderPreview} from '@/lib/v5-order-preview';
type Result=ReturnType<typeof buildOrderPreview>;
const labels={linked:'明确关联',review:'待人工审核',conflict:'冲突',orphan:'孤立／缺失引用'};
export default function OrderPreviewPage(){
 const [result,setResult]=useState<Result|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[filter,setFilter]=useState('all'),[legacy,setLegacy]=useState(''),[order,setOrder]=useState('');
 async function load(){setBusy(true);setError('');setResult(null);try{const pairs=legacy||order?[{legacyOrderId:Number(legacy),orderId:Number(order)}]:[];setResult(await requestJson<Result>('/api/v5/order-preview?pairs='+encodeURIComponent(JSON.stringify(pairs))));}catch(e){setError(e instanceof Error?e.message:'读取失败');}finally{setBusy(false);}}
 return <main style={{maxWidth:1100,margin:'auto',padding:16,overflowWrap:'anywhere'}}>
 <h1>V5.1 历史订单关联预览</h1><p>仅 Owner 可读。保留原编号、客户与金额，不自动合并，不写入数据库。当前阶段不提供确认按钮。</p>
 <p>“明确关联”仅表示记录已有直接引用，不代表已关联统一订单。缺失引用显示为孤立记录；没有可靠依据的关联交由人工审核。</p>
 <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'end'}}>
 <label>旧订单内部 ID（可选）<input type="number" min="1" value={legacy} onChange={e=>setLegacy(e.target.value)} style={{display:'block',width:'100%',minHeight:44}}/></label>
 <label>V4 订单内部 ID（可选）<input type="number" min="1" value={order} onChange={e=>setOrder(e.target.value)} style={{display:'block',width:'100%',minHeight:44}}/></label>
 <button disabled={busy} onClick={load} style={{minHeight:44,padding:'8px 20px'}}>{busy?'正在只读检查…':'读取／重新预览'}</button></div>
 <p>候选 ID 用于本次金额和客户比较，刷新后不会保存。单表超过 5000 条时会停止并提示分批，避免截断数据造成误判。</p>
 {error&&<p role="alert">{error}</p>}
 {result&&<><p role="status">读取 {result.records.length} 条记录。跨表数据可能在读取期间变化，不能据此直接确认迁移。</p>
 {result.candidates.map((c,i)=><section key={i} style={{border:'2px solid #a36d26',padding:12,margin:'12px 0'}}><h2>候选：旧单 {c.legacyOrderId} → V4 {c.orderId}</h2><p>{c.status==='conflict'?'冲突':'待人工审核，未确认'}</p>{c.findings.map((f,j)=><p key={j}>{f.code}：{f.message}</p>)}<pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify({旧单:c.legacy,V4:c.order},null,2)}</pre></section>)}
 <label>分类筛选 <select value={filter} onChange={e=>setFilter(e.target.value)} style={{minHeight:44}}><option value="all">全部</option>{Object.entries(labels).map(([k,v])=><option key={k} value={k}>{v}（{result.records.filter(r=>r.status===k).length}）</option>)}</select></label>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,320px),1fr))',gap:12,marginTop:16}}>
 {result.records.filter(r=>filter==='all'||r.status===filter).map(r=><article key={r.key} style={{border:'1px solid #aaa',borderRadius:8,padding:12,minWidth:0}}><h2 style={{fontSize:18}}>{r.key}</h2><strong>{labels[r.status]}</strong>{r.customer&&<p>客户：{r.customer.company_name||r.customer.contact_name} · {r.customer.email} · {r.customer.phone}</p>}{r.findings.map((f,i)=><p key={i}>{f.code}：{f.message}</p>)}<p>已有引用：{r.links.join('，')||'无可验证直接引用'}</p><details><summary style={{minHeight:44}}>原始字段（未修改）</summary><pre style={{whiteSpace:'pre-wrap',fontSize:13}}>{JSON.stringify(r.original,null,2)}</pre></details></article>)}
 </div></>}
 </main>;
}
