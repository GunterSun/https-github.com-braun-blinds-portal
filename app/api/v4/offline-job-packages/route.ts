import { and, desc, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { installationAssignments, installationJobs } from "@/db/installation-schema";
import { orders } from "@/db/order-schema";
import { appUsers, offlineJobPackages, offlineSyncOperations } from "@/db/schema";
import { getCurrentAppUser, sha256, writeAuditLog } from "@/lib/v4-auth";

const allowedOperations=new Set(["note_draft","checklist_draft","measurement_draft","media_reference"]);

export async function GET(){
  const user=await getCurrentAppUser();
  if(!user||!["owner","installer"].includes(user.role))return NextResponse.json({error:"Permission denied"},{status:403});
  const db=await getDb(),conditions=user.role==="owner"?undefined:eq(offlineJobPackages.assignedUserId,user.id);
  const rows=await db.select({pkg:offlineJobPackages,jobStatus:installationJobs.status,scheduledStart:installationJobs.scheduledStart,scheduledEnd:installationJobs.scheduledEnd,orderNumber:orders.orderNumber,projectName:orders.projectName,assignee:appUsers.displayName}).from(offlineJobPackages).innerJoin(installationJobs,eq(installationJobs.id,offlineJobPackages.installationJobId)).innerJoin(orders,eq(orders.id,installationJobs.orderId)).innerJoin(appUsers,eq(appUsers.id,offlineJobPackages.assignedUserId)).where(conditions).orderBy(desc(offlineJobPackages.updatedAt)).limit(100);
  return NextResponse.json({packages:rows.map(row=>({...row.pkg,orderNumber:row.orderNumber,projectName:row.projectName,jobStatus:row.jobStatus,scheduledStart:row.scheduledStart,scheduledEnd:row.scheduledEnd,assignee:row.assignee,snapshot:JSON.parse(row.pkg.snapshotJson)}))});
}

export async function POST(request:NextRequest){
  const user=await getCurrentAppUser();
  if(!user||user.role!=="owner")return NextResponse.json({error:"Owner only"},{status:403});
  const key=String(request.headers.get("idempotency-key")||"");if(key.length<16)return NextResponse.json({error:"Idempotency-Key required"},{status:400});
  const body=await request.json(),installationJobId=Number(body.installationJobId),assignedUserId=Number(body.assignedUserId),db=await getDb();
  const row=(await db.select({job:installationJobs,order:orders,assignment:installationAssignments}).from(installationJobs).innerJoin(orders,eq(orders.id,installationJobs.orderId)).innerJoin(installationAssignments,and(eq(installationAssignments.installationJobId,installationJobs.id),eq(installationAssignments.installerUserId,assignedUserId))).where(eq(installationJobs.id,installationJobId)).limit(1))[0];
  if(!row)return NextResponse.json({error:"Assigned installation job not found"},{status:404});
  const snapshot={schemaVersion:1,generatedAt:new Date().toISOString(),job:{id:row.job.id,version:row.job.version,status:row.job.status,scheduledStart:row.job.scheduledStart,scheduledEnd:row.job.scheduledEnd,timezone:row.job.timezone,address:row.job.addressSnapshot,contact:JSON.parse(row.job.contactSnapshot||"{}"),instructions:row.job.instructions,jobType:row.job.jobType},order:{id:row.order.id,orderNumber:row.order.orderNumber,projectName:row.order.projectName}};
  const snapshotJson=JSON.stringify(snapshot),snapshotSha256=await sha256(snapshotJson),expiresAt=new Date(Date.now()+72*3600_000).toISOString(),now=new Date().toISOString();
  const existing=(await db.select().from(offlineJobPackages).where(and(eq(offlineJobPackages.installationJobId,installationJobId),eq(offlineJobPackages.assignedUserId,assignedUserId))).limit(1))[0];
  const pkg=existing?(await db.update(offlineJobPackages).set({state:"online_only",sourceVersion:row.job.version,snapshotJson,snapshotSha256,expiresAt,downloadedAt:null,lastSyncedAt:null,revokedAt:null,updatedAt:now}).where(eq(offlineJobPackages.id,existing.id)).returning())[0]:(await db.insert(offlineJobPackages).values({installationJobId,assignedUserId,state:"online_only",sourceVersion:row.job.version,snapshotJson,snapshotSha256,expiresAt,createdBy:user.id}).returning())[0];
  await writeAuditLog({userId:user.id,action:"offline_job_package_prepared",entityType:"offline_job_package",entityId:String(pkg.id),details:{installationJobId,assignedUserId,snapshotSha256,expiresAt,idempotencyKey:key}});
  return NextResponse.json({package:{...pkg,snapshot}},{status:existing?200:201});
}

export async function PATCH(request:NextRequest){
  const user=await getCurrentAppUser();if(!user||!["owner","installer"].includes(user.role))return NextResponse.json({error:"Permission denied"},{status:403});
  const body=await request.json(),packageId=Number(body.packageId),action=String(body.action||""),db=await getDb(),pkg=(await db.select().from(offlineJobPackages).where(and(eq(offlineJobPackages.id,packageId),user.role==="owner"?undefined:eq(offlineJobPackages.assignedUserId,user.id),isNull(offlineJobPackages.revokedAt))).limit(1))[0];
  if(!pkg)return NextResponse.json({error:"Package unavailable"},{status:404});
  const now=new Date().toISOString();if(pkg.expiresAt<=now)return NextResponse.json({error:"Package expired; download a refreshed assignment"},{status:409});
  if(action==="downloaded"){await db.update(offlineJobPackages).set({state:"ready_offline",downloadedAt:now,updatedAt:now}).where(eq(offlineJobPackages.id,pkg.id));await writeAuditLog({userId:user.id,action:"offline_job_package_downloaded",entityType:"offline_job_package",entityId:String(pkg.id),details:{snapshotSha256:pkg.snapshotSha256}});return NextResponse.json({ok:true,state:"ready_offline"})}
  if(action==="sync"){const clientOperationId=String(body.clientOperationId||""),operationType=String(body.operationType||""),baseSourceVersion=Number(body.baseSourceVersion);if(clientOperationId.length<16||!allowedOperations.has(operationType)||!Number.isInteger(baseSourceVersion))return NextResponse.json({error:"Valid operation ID, type and base version required"},{status:400});const replay=(await db.select().from(offlineSyncOperations).where(eq(offlineSyncOperations.clientOperationId,clientOperationId)).limit(1))[0];if(replay)return NextResponse.json({operation:replay,reused:true});const conflict=baseSourceVersion!==pkg.sourceVersion,status=conflict?"conflict":"accepted",conflictJson=conflict?JSON.stringify({expected:pkg.sourceVersion,received:baseSourceVersion}):null;const op=(await db.insert(offlineSyncOperations).values({packageId:pkg.id,assignedUserId:user.id,clientOperationId,operationType,baseSourceVersion,payloadJson:JSON.stringify(body.payload||{}),status,conflictJson}).returning())[0];await db.update(offlineJobPackages).set({state:conflict?"conflict":"synced",lastSyncedAt:conflict?pkg.lastSyncedAt:now,updatedAt:now}).where(eq(offlineJobPackages.id,pkg.id));await writeAuditLog({userId:user.id,action:"offline_sync_operation_received",entityType:"offline_sync_operation",entityId:String(op.id),details:{packageId:pkg.id,operationType,status}});return NextResponse.json({operation:op,conflict},{status:conflict?409:201})}
  if(action==="revoke"&&user.role==="owner"){await db.update(offlineJobPackages).set({state:"expired_revoked",revokedAt:now,updatedAt:now}).where(eq(offlineJobPackages.id,pkg.id));await writeAuditLog({userId:user.id,action:"offline_job_package_revoked",entityType:"offline_job_package",entityId:String(pkg.id),details:{assignedUserId:pkg.assignedUserId}});return NextResponse.json({ok:true,state:"expired_revoked"})}
  return NextResponse.json({error:"Unsupported action"},{status:400});
}
