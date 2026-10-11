import {env} from 'cloudflare:workers';
import {cookies} from 'next/headers';
import {buildOrderPreview,previewColumns,type Dataset,type Source,type Proposal} from '@/lib/v5-order-preview';
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
export async function GET(request:Request) {
  try {
    // Do not call getCurrentAppUser: its recovery hook may WRITE credentials.
    if ((env as unknown as Record<string,unknown>).V4_OWNER_RECOVERY) return reply({error:'账号恢复处理中，暂不可预览。'},503);
    const token=(await cookies()).get('braun_v4_session')?.value;
    if(!token) return reply({error:'请先登录。'},401);
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(b=>b.toString(16).padStart(2,'0')).join('');
    const user=await env.DB.prepare('SELECT u.role FROM app_sessions s JOIN app_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>? AND u.status=? LIMIT 1').bind(hash,new Date().toISOString(),'active').first<{role:string}>();
    if(!user) return reply({error:'登录已失效。'},401);
    if(user.role!=='owner') return reply({error:'只有 Owner 可以查看历史关联审核资料。'},403);
    const url=new URL(request.url),raw=url.searchParams.get('pairs')||'[]';
    if(raw.length>10000) return reply({error:'候选关联过多。'},400);
    let proposals:Proposal[];
    try {proposals=JSON.parse(raw);if(!Array.isArray(proposals)||proposals.length>100||proposals.some(p=>!p||!Number.isSafeInteger(p.legacyOrderId)||p.legacyOrderId<=0||!Number.isSafeInteger(p.orderId)||p.orderId<=0)) throw Error();}
    catch{return reply({error:'候选必须为有效的旧订单 ID 与 V4 订单 ID。'},400);}
    const tables=Object.keys(previewColumns) as Source[];
    const results: {success:boolean;results: import('@/lib/v5-order-preview').Row[]}[]=await env.DB.batch(tables.map(t=>env.DB.prepare(`SELECT ${previewColumns[t]} FROM ${t} ORDER BY id LIMIT 5001`)));
    if(results.some(r=>!r.success)) return reply({error:'读取不完整，未生成关联结论。'},503);
    if(results.some(r=>r.results.length>5000)) return reply({error:'单表超过 5000 条，需分批审计；本次不返回可能误判孤立记录的截断结果。'},413);
    const data=Object.fromEntries(tables.map((t,i)=>[t,results[i].results])) as Dataset;
    return reply({...buildOrderPreview(data,proposals),generatedAt:new Date().toISOString(),consistency:'只读查询结果；不保证跨表单一时间点快照，不能用于直接确认。'});
  } catch {return reply({error:'预览读取失败，请重试；没有执行关联写入。'},503);}
}
// No confirmation endpoint exists in this phase, including for Owner.
export async function POST(){return reply({error:'只读预览阶段禁止确认或保存关联。'},405);}
