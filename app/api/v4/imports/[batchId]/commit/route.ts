import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { businessLedgerEntries, importBatches, importRows } from "@/db/import-schema";
import { orders } from "@/db/order-schema";
import { getCurrentAppUser, writeAuditLog } from "@/lib/v4-auth";

type Row=typeof importRows.$inferSelect;
type Impact={approved:number;pending:number;rejected:number;committed:number;willCreate:number;blockers:Array<{rowId:number;reason:string}>};

export async function GET(_request:NextRequest,context:{params:Promise<{batchId:string}>}){
  const result=await prepare(context);if(result.response)return result.response;
  return NextResponse.json({batch:result.batch,impact:result.impact});
}

export async function POST(request:NextRequest,context:{params:Promise<{batchId:string}>}){
  const user=await getCurrentAppUser();if(!user||user.role!=="owner")return NextResponse.json({error:"仅老板账号可生成正式记录 / Owner only"},{status:403});
  let body:{confirm?:boolean};try{body=await request.json()}catch{return NextResponse.json({error:"请求格式无效"},{status:400})}
  if(body.confirm!==true)return NextResponse.json({error:"必须明确确认正式转换"},{status:400});
  const result=await prepare(context,user);if(result.response)return result.response;
  if(result.impact.pending>0)return NextResponse.json({error:"仍有待审核记录，不能正式转换",impact:result.impact},{status:409});
  if(result.impact.blockers.length)return NextResponse.json({error:"存在阻断项，请修正后重试",impact:result.impact},{status:409});
  if(result.impact.willCreate===0)return NextResponse.json({error:"没有可生成的已批准记录",impact:result.impact},{status:409});
  const db=await getDb();let created=0;
  for(const row of result.rows.filter(row=>row.reviewStatus==="approved"&&row.importStatus!=="committed")){
    const normalized=normalizeOrder(row.orderNumber),order=normalized?result.orders.get(normalized):undefined;
    const inserted=await db.insert(businessLedgerEntries).values({importBatchId:result.batch.id,importRowId:row.id,recordType:row.recordType,orderId:order?.id||null,orderNumber:normalized||row.orderNumber,counterparty:row.customer,project:row.project,description:row.product,amount:Number(row.amount),currency:String(row.currency),businessStatus:row.status,notes:row.notes,sourceSheet:row.sourceSheet,sourceRow:row.sourceRow,createdByUserId:user.id}).onConflictDoNothing().returning({id:businessLedgerEntries.id});
    const entry=inserted[0]||await db.select({id:businessLedgerEntries.id}).from(businessLedgerEntries).where(eq(businessLedgerEntries.importRowId,row.id)).limit(1).then(rows=>rows[0]);
    if(!entry)continue;
    await db.update(importRows).set({importStatus:"committed",targetEntityType:"business_ledger_entry",targetEntityId:String(entry.id)}).where(and(eq(importRows.id,row.id),eq(importRows.batchId,result.batch.id)));
    if(inserted[0])created++;
  }
  const committedAt=new Date().toISOString();
  await db.update(importBatches).set({status:"committed"}).where(eq(importBatches.id,result.batch.id));
  await writeAuditLog({userId:user.id,action:"excel_import_committed",entityType:"import_batch",entityId:String(result.batch.id),details:{created,approvedRows:result.impact.approved,committedAt}});
  return NextResponse.json({ok:true,batchId:result.batch.id,status:"committed",created,committedAt});
}

async function prepare(context:{params:Promise<{batchId:string}>},knownUser?:Awaited<ReturnType<typeof getCurrentAppUser>>){
  const user=knownUser||await getCurrentAppUser();if(!user||user.role!=="owner")return {response:NextResponse.json({error:"仅老板账号可预览正式转换 / Owner only"},{status:403})};
  const id=Number((await context.params).batchId);if(!Number.isInteger(id)||id<=0)return {response:NextResponse.json({error:"批次编号无效"},{status:400})};
  const db=await getDb(),batches=await db.select().from(importBatches).where(eq(importBatches.id,id)).limit(1),batch=batches[0];
  if(!batch)return {response:NextResponse.json({error:"未找到导入批次"},{status:404})};
  if(batch.status==="rolled_back")return {response:NextResponse.json({error:"已回滚批次不能转换"},{status:409})};
  const rows=await db.select().from(importRows).where(eq(importRows.batchId,id));
  const orderNumbers=[...new Set(rows.filter(row=>row.reviewStatus==="approved"&&row.recordType==="order").map(row=>normalizeOrder(row.orderNumber)).filter(Boolean))] as string[];
  const orderMap=new Map<string,{id:number;currency:string}>();for(const number of orderNumbers){const found=await db.select({id:orders.id,currency:orders.currency}).from(orders).where(eq(orders.orderNumber,number)).limit(1);if(found[0])orderMap.set(number,found[0])}
  const impact=buildImpact(rows,orderMap);return {user,batch,rows,orders:orderMap,impact};
}

function buildImpact(rows:Row[],orderMap:Map<string,{id:number;currency:string}>):Impact{
  const impact:Impact={approved:0,pending:0,rejected:0,committed:0,willCreate:0,blockers:[]};
  for(const row of rows){if(row.importStatus==="committed"){impact.committed++;continue}if(row.reviewStatus==="pending"){impact.pending++;continue}if(row.reviewStatus==="rejected"){impact.rejected++;continue}impact.approved++;if(row.recordType==="unknown")impact.blockers.push({rowId:row.id,reason:"记录类型仍为 unknown"});if(row.amount===null||!row.currency)impact.blockers.push({rowId:row.id,reason:"金额或币种未确认"});if(row.recordType==="order"){const number=normalizeOrder(row.orderNumber),order=number?orderMap.get(number):undefined;if(!order)impact.blockers.push({rowId:row.id,reason:"未匹配到现有五位数统一订单"});else if(order.currency!==row.currency)impact.blockers.push({rowId:row.id,reason:`币种与订单 ${order.currency} 不一致`})}impact.willCreate++}
  return impact;
}

function normalizeOrder(value:string){const match=String(value||"").toUpperCase().match(/(?:CWF\s*)?(\d{5})/);return match?.[1]||""}
