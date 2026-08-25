import { and, desc, eq, inArray, max } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { designVersions, fabricVersions, fabrics, hardwareParts, measureProperties, measureQaFindings, measureQaRuns, measureRooms, measureWindows, measurementValues, measurementVersions, workflowArtifacts, workflowHandoffs } from "@/db/schema";
import { getCurrentAppUser, sha256, writeAuditLog } from "@/lib/v4-auth";

async function getSource(windowId: number, user: { id: number; role: string }) {
  const db = await getDb();
  const workspace = (await db.select({ window: measureWindows, room: measureRooms, property: measureProperties })
    .from(measureWindows).innerJoin(measureRooms, eq(measureRooms.id, measureWindows.roomId))
    .innerJoin(measureProperties, eq(measureProperties.id, measureWindows.propertyId))
    .where(eq(measureWindows.id, windowId)).limit(1))[0];
  if (!workspace || (user.role === "sales" && workspace.property.createdBy !== user.id)) return null;
  const measurement = (await db.select().from(measurementVersions).where(and(eq(measurementVersions.windowId, windowId), eq(measurementVersions.status, "approved"))).orderBy(desc(measurementVersions.version)).limit(1))[0];
  const design = (await db.select().from(designVersions).where(and(eq(designVersions.windowId, windowId), inArray(designVersions.status, ["selected", "approved"]))).orderBy(desc(designVersions.version)).limit(1))[0];
  const qa = (await db.select().from(measureQaRuns).where(eq(measureQaRuns.propertyId, workspace.property.id)).orderBy(desc(measureQaRuns.createdAt)).limit(1))[0];
  if (!measurement || !design || !qa) return { missing: [
    ...(!measurement ? ["approved measurement"] : []), ...(!design ? ["selected design"] : []), ...(!qa ? ["QA run"] : []),
  ] };
  const openErrors = await db.select().from(measureQaFindings).where(and(eq(measureQaFindings.qaRunId, qa.id), eq(measureQaFindings.severity, "error"), eq(measureQaFindings.status, "open")));
  if (openErrors.length) return { missing: [`${openErrors.length} open QA errors`] };
  const values = await db.select().from(measurementValues).where(eq(measurementValues.measurementVersionId, measurement.id));
  const fabricIds = JSON.parse(design.fabricVersionIdsJson) as number[];
  const hardwareIds = JSON.parse(design.hardwarePartIdsJson) as number[];
  const fabricRows = fabricIds.length ? await db.select({ version: fabricVersions, sku: fabrics.sku }).from(fabricVersions).innerJoin(fabrics, eq(fabrics.id, fabricVersions.fabricId)).where(inArray(fabricVersions.id, fabricIds)) : [];
  const hardwareRows = hardwareIds.length ? await db.select().from(hardwareParts).where(inArray(hardwareParts.id, hardwareIds)) : [];
  return { snapshot: {
    property: { id: workspace.property.id, customerId: workspace.property.customerId, name: workspace.property.name },
    room: { id: workspace.room.id, name: workspace.room.name }, window: { id: workspace.window.id, code: workspace.window.code },
    measurement: { id: measurement.id, version: measurement.version, values },
    design: { id: design.id, version: design.version, combinationType: design.combinationType, configuration: JSON.parse(design.configurationJson) },
    fabrics: fabricRows.map(x => ({ versionId: x.version.id, sku: x.sku, technical: { usableWidthSixteenths: x.version.usableWidthSixteenths, patternRepeatSixteenths: x.version.patternRepeatSixteenths, direction: x.version.direction } })),
    hardware: hardwareRows.map(x => ({ id: x.id, sku: x.sku })), qaRunId: qa.id,
  } };
}

export async function GET(request: NextRequest) {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const windowId = Number(request.nextUrl.searchParams.get("windowId"));
  const current = await getSource(windowId, user);
  if (!current) return NextResponse.json({ error: "Window not found" }, { status: 404 });
  if ("missing" in current) return NextResponse.json(current);
  const db = await getDb();
  const previous = (await db.select().from(workflowHandoffs).where(eq(workflowHandoffs.windowId, windowId)).orderBy(desc(workflowHandoffs.revision)).limit(1))[0];
  const hash = await sha256(JSON.stringify(current.snapshot));
  return NextResponse.json({ ready: true, sourceHash: hash, changed: previous ? previous.sourceHash !== hash : false,
    impact: previous && previous.sourceHash !== hash ? ["Quote price may change", "BOM/MRP must regenerate", "Production drawing requires new revision", "Installation package may change"] : [],
    previousRevision: previous?.revision || 0, snapshot: current.snapshot,
    handoffs: await db.select().from(workflowHandoffs).where(eq(workflowHandoffs.windowId, windowId)).orderBy(desc(workflowHandoffs.revision)),
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentAppUser();
  if (!user || !["owner", "sales"].includes(user.role)) return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  const body = await request.json();
  const windowId = Number(body.windowId);
  const key = String(request.headers.get("idempotency-key") || "");
  if (key.length < 16) return NextResponse.json({ error: "Idempotency-Key required" }, { status: 400 });
  const db = await getDb();
  const existing = (await db.select().from(workflowHandoffs).where(eq(workflowHandoffs.idempotencyKey, key)).limit(1))[0];
  if (existing) return NextResponse.json({ handoff: existing, reused: true });
  const current = await getSource(windowId, user);
  if (!current) return NextResponse.json({ error: "Window not found" }, { status: 404 });
  if ("missing" in current) return NextResponse.json(current, { status: 409 });
  const snapshot = current.snapshot;
  const sourceHash = await sha256(JSON.stringify(snapshot));
  const latest = await db.select({ revision: max(workflowHandoffs.revision) }).from(workflowHandoffs).where(eq(workflowHandoffs.windowId, windowId));
  const revision = Number(latest[0]?.revision || 0) + 1;
  const handoff = (await db.insert(workflowHandoffs).values({ windowId, measurementVersionId: snapshot.measurement.id, designVersionId: snapshot.design.id, qaRunId: snapshot.qaRunId, revision, sourceHash, sourceSnapshotJson: JSON.stringify(snapshot), idempotencyKey: key, createdBy: user.id }).returning())[0];
  const artifactTypes = ["visualizer", "quote", "customer_approval", "order", "production_drawing"];
  await db.insert(workflowArtifacts).values(artifactTypes.map(artifactType => ({ handoffId: handoff.id, artifactType, status: "prepared", snapshotJson: JSON.stringify({ sourceHash, source: snapshot }) })));
  await writeAuditLog({ userId: user.id, action: "workflow_handoff_prepared", entityType: "workflow_handoff", entityId: String(handoff.id), details: { windowId, revision, sourceHash } });
  return NextResponse.json({ handoff, artifacts: artifactTypes }, { status: 201 });
}
