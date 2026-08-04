import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { customerOrders, invoiceSignatureEvents, invoiceSignatureRequests, invoiceVersions } from "@/db/schema";
import { getCurrentAppUser, sha256 } from "@/lib/v4-auth";

const hex=(bytes:Uint8Array)=>Array.from(bytes).map(value=>value.toString(16).padStart(2,"0")).join("");

export async function POST(request:NextRequest,context:{params:Promise<{invoiceNumber:string}>}){
  const user=await getCurrentAppUser();
  if(!user)return NextResponse.json({error:"请先登录"},{status:401});
  if(user.role!=="owner")return NextResponse.json({error:"仅 Owner 可以发起签名请求"},{status:403});
  const {invoiceNumber:raw}=await context.params,invoiceNumber=decodeURIComponent(raw||"").trim();
  if(!/^\d{5}$/.test(invoiceNumber))return NextResponse.json({error:"Invoice 编号无效"},{status:400});
  const idempotencyKey=String(request.headers.get("idempotency-key")||"").trim();
  if(idempotencyKey.length<16||idempotencyKey.length>200)return NextResponse.json({error:"需要有效 Idempotency-Key"},{status:400});
  const db=await getDb();
  const existing=await db.select({id:invoiceSignatureRequests.id,status:invoiceSignatureRequests.status,expiresAt:invoiceSignatureRequests.expiresAt}).from(invoiceSignatureRequests).where(eq(invoiceSignatureRequests.idempotencyKey,idempotencyKey)).limit(1);
  if(existing.length)return NextResponse.json({ok:true,reused:true,request:existing[0]});
  const order=await db.select().from(customerOrders).where(eq(customerOrders.invoiceNumber,invoiceNumber)).limit(1);
  if(!order.length)return NextResponse.json({error:"Invoice 不存在"},{status:404});
  const invoice=order[0],snapshot={invoiceNumber,orderNumber:invoice.orderNumber,customerEmail:invoice.customerEmail,projectName:invoice.projectName,itemsJson:invoice.itemsJson,wholesaleTotal:invoice.wholesaleTotal,discountPercent:invoice.discountPercent,paymentCurrency:invoice.paymentCurrency,confirmedAt:invoice.confirmedAt};
  const snapshotJson=JSON.stringify(snapshot),documentSha256=await sha256(snapshotJson);
  let version=await db.select().from(invoiceVersions).where(and(eq(invoiceVersions.invoiceNumber,invoiceNumber),eq(invoiceVersions.documentSha256,documentSha256))).orderBy(desc(invoiceVersions.version)).limit(1);
  if(!version.length){const latest=await db.select({version:invoiceVersions.version}).from(invoiceVersions).where(eq(invoiceVersions.invoiceNumber,invoiceNumber)).orderBy(desc(invoiceVersions.version)).limit(1);version=await db.insert(invoiceVersions).values({orderId:invoice.id,invoiceNumber,version:(latest[0]?.version||0)+1,snapshotJson,documentSha256,createdBy:user.id}).returning()}
  const token=hex(crypto.getRandomValues(new Uint8Array(32))),tokenHash=await sha256(token),expiresAt=new Date(Date.now()+7*86400_000).toISOString();
  const created=await db.insert(invoiceSignatureRequests).values({invoiceVersionId:version[0].id,invoiceNumber,signerEmail:invoice.customerEmail.trim().toLowerCase(),tokenHash,idempotencyKey,status:"pending",expiresAt,createdBy:user.id}).returning({id:invoiceSignatureRequests.id,status:invoiceSignatureRequests.status});
  await db.insert(invoiceSignatureEvents).values({requestId:created[0].id,eventType:"created",actorType:"app_user",actorId:String(user.id),metadataJson:JSON.stringify({invoiceNumber,version:version[0].version,documentSha256})});
  return NextResponse.json({ok:true,request:{...created[0],expiresAt,invoiceVersion:version[0].version,documentSha256},signaturePath:`/sign-invoice/${token}`},{status:201});
}
