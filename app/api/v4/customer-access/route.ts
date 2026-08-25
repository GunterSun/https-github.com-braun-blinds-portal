import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { appSessions, appUsers, customerBillingInvoices, customerFulfillments, customerInvitations, customerJourneyAcceptances, customerPropertyAccess, customerQuoteVersions, customers, designVersions, measureProperties, measureQaRuns, measureRooms, measureWindows, measurementVersions, roomSketchVersions, wallElevationVersions, workflowHandoffs } from "@/db/schema";
import { getCurrentAppUser, sha256, writeAuditLog } from "@/lib/v4-auth";

const roles=new Set(["primary","co_owner","household"]);
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x=>x.toString(16).padStart(2,"0")).join("");

export async function GET(){const user=await getCurrentAppUser();if(!user||user.role!=="owner")return NextResponse.json({error:"Owner only"},{status:403});const db=await getDb();return NextResponse.json({properties:await db.select({id:measureProperties.id,name:measureProperties.name,address:measureProperties.address,customerId:measureProperties.customerId,customerName:customers.displayName}).from(measureProperties).leftJoin(customers,eq(customers.id,measureProperties.customerId)).limit(500),customers:await db.select({id:customers.id,name:customers.displayName,email:customers.email,customerNumber:customers.customerNumber,status:customers.status}).from(customers).where(isNull(customers.archivedAt)).orderBy(customers.displayName).limit(1000),access:await db.select({id:customerPropertyAccess.id,userId:customerPropertyAccess.userId,userName:appUsers.displayName,email:appUsers.email,propertyId:customerPropertyAccess.propertyId,role:customerPropertyAccess.accessRole,status:customerPropertyAccess.status,grantedAt:customerPropertyAccess.grantedAt,revokedAt:customerPropertyAccess.revokedAt}).from(customerPropertyAccess).innerJoin(appUsers,eq(appUsers.id,customerPropertyAccess.userId)).orderBy(desc(customerPropertyAccess.grantedAt))})}

export async function POST(request:NextRequest){const user=await getCurrentAppUser();if(!user||user.role!=="owner")return NextResponse.json({error:"Owner only"},{status:403});let body:Record<string,unknown>;try{body=await request.json()}catch{return NextResponse.json({error:"Invalid request"},{status:400})}const propertyId=Number(body.propertyId),email=String(body.email||"").trim().toLowerCase(),phone=String(body.phone||"").trim(),displayName=String(body.displayName||"").trim().slice(0,120),accessRole=String(body.accessRole||"household");if(!propertyId||!/^\S+@\S+\.\S+$/.test(email)||!displayName||!roles.has(accessRole))return NextResponse.json({error:"Property, valid email, name and access role required"},{status:400});const db=await getDb(),property=(await db.select().from(measureProperties).where(eq(measureProperties.id,propertyId)).limit(1))[0];if(!property?.customerId)return NextResponse.json({error:"Property must be linked to a Customer"},{status:409});const raw=token(),created=(await db.insert(customerInvitations).values({customerId:property.customerId,propertyId,email,phone,displayName,accessRole,tokenHash:await sha256(raw),expiresAt:new Date(Date.now()+7*86400_000).toISOString(),invitedBy:user.id}).returning())[0];await writeAuditLog({userId:user.id,action:"customer_property_invited",entityType:"customer_invitation",entityId:String(created.id),details:{propertyId,email,accessRole}});return NextResponse.json({invitation:{id:created.id,expiresAt:created.expiresAt,url:`/accept-customer-invite?token=${raw}`}},{status:201})}

export async function PATCH(request:NextRequest){const user=await getCurrentAppUser();if(!user||user.role!=="owner")return NextResponse.json({error:"Owner only"},{status:403});const body=await request.json(),id=Number(body.accessId);if(!id)return NextResponse.json({error:"Access ID required"},{status:400});const db=await getDb(),row=(await db.select().from(customerPropertyAccess).where(and(eq(customerPropertyAccess.id,id),eq(customerPropertyAccess.status,"active"),isNull(customerPropertyAccess.revokedAt))).limit(1))[0];if(!row)return NextResponse.json({error:"Active grant not found"},{status:404});const now=new Date().toISOString();await db.update(customerPropertyAccess).set({status:"revoked",revokedBy:user.id,revokedAt:now}).where(eq(customerPropertyAccess.id,id));await db.update(appSessions).set({revokedAt:now}).where(and(eq(appSessions.userId,row.userId),isNull(appSessions.revokedAt)));await writeAuditLog({userId:user.id,action:"customer_property_access_revoked",entityType:"customer_property_access",entityId:String(id),details:{propertyId:row.propertyId,userId:row.userId}});return NextResponse.json({ok:true})}

export async function PUT(request:NextRequest){const user=await getCurrentAppUser();if(!user||user.role!=="owner")return NextResponse.json({error:"Owner only"},{status:403});const body=await request.json(),propertyId=Number(body.propertyId),customerId=Number(body.customerId);if(!propertyId||!customerId)return NextResponse.json({error:"Property and Customer required"},{status:400});const db=await getDb(),customer=(await db.select({id:customers.id}).from(customers).where(and(eq(customers.id,customerId),isNull(customers.archivedAt))).limit(1))[0];if(!customer)return NextResponse.json({error:"Active Customer not found"},{status:404});const linked=await db.update(measureProperties).set({customerId}).where(and(eq(measureProperties.id,propertyId),isNull(measureProperties.customerId))).returning({id:measureProperties.id});if(!linked.length)return NextResponse.json({error:"Property is already linked; reassignment requires a separate review"},{status:409});await writeAuditLog({userId:user.id,action:"measure_property_customer_linked",entityType:"measure_property",entityId:String(propertyId),details:{customerId}});return NextResponse.json({ok:true,propertyId,customerId})}

export async function DELETE(request:NextRequest){
  const user=await getCurrentAppUser();
  if(!user||user.role!=="owner")return NextResponse.json({error:"Owner only"},{status:403});
  let body:Record<string,unknown>;
  try{body=await request.json()}catch{return NextResponse.json({error:"Invalid request"},{status:400})}
  const propertyId=Number(body.propertyId),confirmation=String(body.confirmation||"").trim();
  if(!propertyId||!confirmation)return NextResponse.json({error:"Property and exact-name confirmation required"},{status:400});
  const db=await getDb(),property=(await db.select().from(measureProperties).where(eq(measureProperties.id,propertyId)).limit(1))[0];
  if(!property)return NextResponse.json({error:"Property not found"},{status:404});
  if(property.customerId)return NextResponse.json({error:"Linked Properties cannot be deleted here"},{status:409});
  if(confirmation!==property.name)return NextResponse.json({error:"Confirmation must exactly match the Property name"},{status:400});
  const rooms=await db.select({id:measureRooms.id}).from(measureRooms).where(eq(measureRooms.propertyId,propertyId)),roomIds=rooms.map(row=>row.id);
  const windows=await db.select({id:measureWindows.id}).from(measureWindows).where(eq(measureWindows.propertyId,propertyId)),windowIds=windows.map(row=>row.id);
  const checks=await Promise.all([
    db.select({id:customerPropertyAccess.id}).from(customerPropertyAccess).where(eq(customerPropertyAccess.propertyId,propertyId)).limit(1),
    db.select({id:customerInvitations.id}).from(customerInvitations).where(eq(customerInvitations.propertyId,propertyId)).limit(1),
    db.select({id:customerQuoteVersions.id}).from(customerQuoteVersions).where(eq(customerQuoteVersions.propertyId,propertyId)).limit(1),
    db.select({id:customerBillingInvoices.id}).from(customerBillingInvoices).where(eq(customerBillingInvoices.propertyId,propertyId)).limit(1),
    db.select({id:customerFulfillments.id}).from(customerFulfillments).where(eq(customerFulfillments.propertyId,propertyId)).limit(1),
    db.select({id:customerJourneyAcceptances.id}).from(customerJourneyAcceptances).where(eq(customerJourneyAcceptances.propertyId,propertyId)).limit(1),
    db.select({id:measureQaRuns.id}).from(measureQaRuns).where(eq(measureQaRuns.propertyId,propertyId)).limit(1),
    roomIds.length?db.select({id:roomSketchVersions.id}).from(roomSketchVersions).where(inArray(roomSketchVersions.roomId,roomIds)).limit(1):Promise.resolve([]),
    roomIds.length?db.select({id:wallElevationVersions.id}).from(wallElevationVersions).where(inArray(wallElevationVersions.roomId,roomIds)).limit(1):Promise.resolve([]),
    windowIds.length?db.select({id:measurementVersions.id}).from(measurementVersions).where(inArray(measurementVersions.windowId,windowIds)).limit(1):Promise.resolve([]),
    windowIds.length?db.select({id:designVersions.id}).from(designVersions).where(inArray(designVersions.windowId,windowIds)).limit(1):Promise.resolve([]),
    windowIds.length?db.select({id:workflowHandoffs.id}).from(workflowHandoffs).where(inArray(workflowHandoffs.windowId,windowIds)).limit(1):Promise.resolve([]),
  ]);
  if(checks.some(rows=>rows.length))return NextResponse.json({error:"This Property has business or versioned evidence and cannot be test-cleaned"},{status:409});
  if(windowIds.length)await db.delete(measureWindows).where(inArray(measureWindows.id,windowIds));
  if(roomIds.length)await db.delete(measureRooms).where(inArray(measureRooms.id,roomIds));
  await db.delete(measureProperties).where(eq(measureProperties.id,propertyId));
  await writeAuditLog({userId:user.id,action:"unlinked_test_property_deleted",entityType:"measure_property",entityId:String(propertyId),details:{name:property.name,roomCount:roomIds.length,windowCount:windowIds.length}});
  return NextResponse.json({ok:true,deleted:{propertyId,name:property.name,rooms:roomIds.length,windows:windowIds.length}});
}
