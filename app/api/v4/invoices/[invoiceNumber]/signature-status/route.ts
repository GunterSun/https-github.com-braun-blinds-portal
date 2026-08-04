import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { invoiceSignatureRequests } from "@/db/schema";
import { getCurrentAppUser } from "@/lib/v4-auth";

export async function GET(_request:Request,context:{params:Promise<{invoiceNumber:string}>}){
  const user=await getCurrentAppUser();if(!user)return NextResponse.json({error:"请先登录"},{status:401});
  if(user.role!=="owner")return NextResponse.json({error:"仅 Owner 可以查看签名状态"},{status:403});
  const {invoiceNumber:raw}=await context.params,invoiceNumber=decodeURIComponent(raw||"").trim();
  const requests=await (await getDb()).select({id:invoiceSignatureRequests.id,status:invoiceSignatureRequests.status,signerEmail:invoiceSignatureRequests.signerEmail,expiresAt:invoiceSignatureRequests.expiresAt,viewedAt:invoiceSignatureRequests.viewedAt,signedAt:invoiceSignatureRequests.signedAt,declinedAt:invoiceSignatureRequests.declinedAt,revokedAt:invoiceSignatureRequests.revokedAt,createdAt:invoiceSignatureRequests.createdAt}).from(invoiceSignatureRequests).where(eq(invoiceSignatureRequests.invoiceNumber,invoiceNumber)).orderBy(desc(invoiceSignatureRequests.createdAt)).limit(50);
  return NextResponse.json({invoiceNumber,requests});
}
