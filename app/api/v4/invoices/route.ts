import { desc, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { customerOrders, invoiceSignatureRequests } from "@/db/schema";
import { getCurrentAppUser } from "@/lib/v4-auth";

export async function GET(){
  const user=await getCurrentAppUser();
  if(!user)return NextResponse.json({error:"请先登录"},{status:401});
  if(user.role!=="owner")return NextResponse.json({error:"仅 Owner 可以管理 Invoice 签名"},{status:403});
  const db=await getDb();
  const orders=await db.select({id:customerOrders.id,orderNumber:customerOrders.orderNumber,invoiceNumber:customerOrders.invoiceNumber,customerEmail:customerOrders.customerEmail,projectName:customerOrders.projectName,wholesaleTotal:customerOrders.wholesaleTotal,paymentCurrency:customerOrders.paymentCurrency,paymentStatus:customerOrders.paymentStatus,amountPaid:customerOrders.amountPaid,confirmedAt:customerOrders.confirmedAt}).from(customerOrders).where(isNotNull(customerOrders.invoiceNumber)).orderBy(desc(customerOrders.confirmedAt),desc(customerOrders.id)).limit(500);
  const requests=await db.select({id:invoiceSignatureRequests.id,invoiceNumber:invoiceSignatureRequests.invoiceNumber,status:invoiceSignatureRequests.status,signerEmail:invoiceSignatureRequests.signerEmail,expiresAt:invoiceSignatureRequests.expiresAt,viewedAt:invoiceSignatureRequests.viewedAt,signedAt:invoiceSignatureRequests.signedAt,declinedAt:invoiceSignatureRequests.declinedAt,revokedAt:invoiceSignatureRequests.revokedAt,createdAt:invoiceSignatureRequests.createdAt}).from(invoiceSignatureRequests).orderBy(desc(invoiceSignatureRequests.createdAt));
  const latest=new Map<string,(typeof requests)[number]>();
  for(const request of requests)if(!latest.has(request.invoiceNumber))latest.set(request.invoiceNumber,request);
  const now=Date.now();
  return NextResponse.json({invoices:orders.map(order=>{const request=latest.get(order.invoiceNumber||"");return {...order,signatureRequest:request?{...request,status:["pending","viewed"].includes(request.status)&&new Date(request.expiresAt).getTime()<=now?"expired":request.status}:null}})});
}
