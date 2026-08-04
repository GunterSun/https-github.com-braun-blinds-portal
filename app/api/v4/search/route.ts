import { and, eq, like, or, sql, type SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { customerAddresses, customerOrders, customers } from "@/db/schema";
import { orders, unifiedOrderAssignments } from "@/db/order-schema";
import { getCurrentAppUser } from "@/lib/v4-auth";

type SearchResult={type:"order"|"customer"|"address"|"invoice";id:string;title:string;subtitle:string;href:string};

export async function GET(request:NextRequest){
  const user=await getCurrentAppUser();if(!user)return NextResponse.json({error:"请先登录 / Authentication required"},{status:401});
  const q=String(request.nextUrl.searchParams.get("q")||"").replace(/\s+/g," ").trim().slice(0,121);
  if(q.length<2||q.length>120)return NextResponse.json({error:"请输入 2 至 120 个字符"},{status:400});
  const db=await getDb(),pattern=`%${q}%`,digits=q.replace(/\D/g,""),alias=q.toUpperCase().match(/^(?:CWF\s*)?(\d{5})$/)?.[1];
  const orderAccess=accessOrder(user),customerAccess=accessCustomer(user),results:SearchResult[]=[];
  const orderSearch=or(alias?eq(orders.orderNumber,alias):undefined,like(orders.orderNumber,pattern),like(orders.externalPrefix,pattern),like(orders.projectName,pattern),like(orders.projectAddress,pattern),like(customers.companyName,pattern),like(customers.contactName,pattern),like(customers.email,pattern),digits.length>=4?sql`replace(replace(replace(replace(${customers.phone}, '-', ''), '(', ''), ')', ''), ' ', '') like ${`%${digits}%`}`:undefined)!;
  const orderRows=await db.select({id:orders.id,orderNumber:orders.orderNumber,externalPrefix:orders.externalPrefix,projectName:orders.projectName,projectAddress:orders.projectAddress,customerName:customers.displayName,companyName:customers.companyName}).from(orders).innerJoin(customers,eq(orders.customerId,customers.id)).where(and(orderAccess,orderSearch)).limit(25);
  for(const row of orderRows)results.push({type:"order",id:String(row.id),title:`${row.externalPrefix?`${row.externalPrefix} `:""}${row.orderNumber}`,subtitle:user.role==="owner"||user.role==="sales"?[row.companyName||row.customerName,row.projectName||row.projectAddress].filter(Boolean).join(" · "):row.projectName||"Order",href:`/orders/${row.orderNumber}`});
  if(["owner","sales","customer"].includes(user.role)){
    const customerSearch=or(like(customers.customerNumber,pattern),like(customers.displayName,pattern),like(customers.companyName,pattern),like(customers.contactName,pattern),like(customers.email,pattern),digits.length>=4?sql`replace(replace(replace(replace(${customers.phone}, '-', ''), '(', ''), ')', ''), ' ', '') like ${`%${digits}%`}`:undefined)!;
    const customerRows=await db.select({id:customers.id,customerNumber:customers.customerNumber,displayName:customers.displayName,companyName:customers.companyName,contactName:customers.contactName,email:customers.email,phone:customers.phone}).from(customers).where(and(customerAccess,customerSearch)).limit(20);
    for(const row of customerRows)results.push({type:"customer",id:String(row.id),title:row.companyName||row.displayName||row.contactName||row.customerNumber||`Customer #${row.id}`,subtitle:[row.phone,row.email].filter(Boolean).join(" · "),href:`/customers/${row.id}`});
    const addressSearch=or(like(customerAddresses.label,pattern),like(customerAddresses.line1,pattern),like(customerAddresses.line2,pattern),like(customerAddresses.city,pattern),like(customerAddresses.state,pattern),like(customerAddresses.postalCode,pattern))!;
    const addressRows=await db.select({id:customerAddresses.id,customerId:customerAddresses.customerId,label:customerAddresses.label,line1:customerAddresses.line1,city:customerAddresses.city,state:customerAddresses.state,postalCode:customerAddresses.postalCode,customerName:customers.displayName,companyName:customers.companyName}).from(customerAddresses).innerJoin(customers,eq(customerAddresses.customerId,customers.id)).where(and(customerAccess,addressSearch)).limit(20);
    for(const row of addressRows)results.push({type:"address",id:String(row.id),title:row.label||row.line1,subtitle:[row.companyName||row.customerName,row.line1,row.city,row.state,row.postalCode].filter(Boolean).join(" · "),href:`/customers/${row.customerId}`});
  }
  if(user.role==="owner"){
    const invoiceRows=await db.select({id:customerOrders.id,invoiceNumber:customerOrders.invoiceNumber,orderNumber:customerOrders.orderNumber,customerEmail:customerOrders.customerEmail,projectName:customerOrders.projectName}).from(customerOrders).where(or(like(customerOrders.invoiceNumber,pattern),like(customerOrders.orderNumber,pattern),like(customerOrders.customerEmail,pattern),like(customerOrders.projectName,pattern))!).limit(20);
    for(const row of invoiceRows)if(row.invoiceNumber)results.push({type:"invoice",id:String(row.id),title:`Invoice ${row.invoiceNumber}`,subtitle:[row.orderNumber,row.customerEmail,row.projectName].filter(Boolean).join(" · "),href:"/invoices"});
  }
  return NextResponse.json({query:q,results,total:results.length,capabilities:{tracking:false}});
}

function accessOrder(user:NonNullable<Awaited<ReturnType<typeof getCurrentAppUser>>>):SQL|undefined{
  if(user.role==="owner")return undefined;if(user.role==="customer")return user.customerId?eq(orders.customerId,user.customerId):sql`0=1`;
  return sql`exists (select 1 from ${unifiedOrderAssignments} a where a.order_id=${orders.id} and a.user_id=${user.id})`;
}
function accessCustomer(user:NonNullable<Awaited<ReturnType<typeof getCurrentAppUser>>>):SQL|undefined{
  if(user.role==="owner")return undefined;if(user.role==="customer")return user.customerId?eq(customers.id,user.customerId):sql`0=1`;
  if(user.role!=="sales")return sql`0=1`;
  return or(eq(customers.salesOwnerUserId,user.id),sql`exists (select 1 from ${orders} o inner join ${unifiedOrderAssignments} a on a.order_id=o.id where o.customer_id=${customers.id} and a.user_id=${user.id})`)!;
}
