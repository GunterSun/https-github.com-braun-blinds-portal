import { NextRequest, NextResponse } from "next/server";
import { and, asc, count, like, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { customers } from "@/db/schema";
import { orders, unifiedOrderAssignments } from "@/db/order-schema";
import { getCurrentAppUser } from "@/lib/v4-auth";
import { hasPermission } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  const user=await getCurrentAppUser();
  if(!user)return NextResponse.json({error:"请先登录 / Authentication required"},{status:401});
  if(!hasPermission(user.role,"customers.view"))return NextResponse.json({error:"无权查看客户"},{status:403});
  const page=positive(request.nextUrl.searchParams.get("page"),1),pageSize=Math.min(positive(request.nextUrl.searchParams.get("pageSize"),25),100);
  const q=text(request.nextUrl.searchParams.get("q"),120),conditions:SQL[]=[];
  if(user.role!=="owner")conditions.push(sql`exists (
    select 1 from ${orders}
    inner join ${unifiedOrderAssignments} on ${unifiedOrderAssignments.orderId} = ${orders.id}
    where ${orders.customerId} = ${customers.id} and ${unifiedOrderAssignments.userId} = ${user.id}
  )`);
  if(q){const pattern=`%${q}%`;conditions.push(or(like(customers.companyName,pattern),like(customers.contactName,pattern),like(customers.email,pattern),like(customers.phone,pattern))!)}
  const where=conditions.length?and(...conditions):undefined,db=await getDb();
  const rows=await db.select({id:customers.id,companyName:customers.companyName,contactName:customers.contactName,email:customers.email,phone:customers.phone,status:customers.status})
    .from(customers).where(where).orderBy(asc(customers.companyName),asc(customers.contactName),asc(customers.id)).limit(pageSize).offset((page-1)*pageSize);
  const totals=await db.select({total:count()}).from(customers).where(where);
  return NextResponse.json({customers:rows,page,pageSize,total:Number(totals[0]?.total||0)});
}

function positive(value:string|null,fallback:number){const parsed=Number(value);return Number.isInteger(parsed)&&parsed>0?parsed:fallback}
function text(value:unknown,max:number){return String(value??"").replace(/\s+/g," ").trim().slice(0,max)}
