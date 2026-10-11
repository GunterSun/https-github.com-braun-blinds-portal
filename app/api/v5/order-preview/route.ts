import {env} from 'cloudflare:workers';
import {cookies} from 'next/headers';
import {readReviewPage,readCandidates,ReviewInputError} from '@/lib/v5-review-reader';
import type {Row} from '@/lib/v5-order-preview';
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
    const url=new URL(request.url);
    const db={all:async(sql:string,params:(string|number)[])=>{
      const result=await env.DB.prepare(sql).bind(...params).all();
      if(!result.success)throw Error('Read failed');
      return result.results as Row[];
    }};
    return reply(url.searchParams.get('mode')==='candidates'?await readCandidates(db,url):await readReviewPage(db,url));
  } catch(error) {if(error instanceof ReviewInputError)return reply({error:error.message},400);return reply({error:'预览读取失败，请重试；没有执行关联写入。'},503);}
}
// No confirmation endpoint exists in this phase, including for Owner.
export async function POST(){return reply({error:'只读预览阶段禁止确认或保存关联。'},405);}
