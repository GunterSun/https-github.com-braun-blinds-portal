import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { customerFulfillmentPackages, customerFulfillments, customerPickupSignatures, customerPropertyAccess, measureProperties, measureWindows } from "@/db/schema";
import { getCurrentAppUser, sha256, writeAuditLog } from "@/lib/v4-auth";

const modes = new Set(["shipment", "local_delivery", "installer_pickup", "customer_pickup"]);
const statuses = new Set(["preparing", "ready_for_pickup", "shipped", "in_transit", "delivered", "partially_released", "completed", "exception"]);
const transitions: Record<string, Set<string>> = {
  preparing: new Set(["ready_for_pickup", "shipped", "exception"]),
  ready_for_pickup: new Set(["completed", "exception"]),
  shipped: new Set(["in_transit", "delivered", "exception"]),
  in_transit: new Set(["delivered", "exception"]),
  partially_released: new Set(["completed", "exception"]),
  exception: new Set(["preparing", "ready_for_pickup", "shipped"]),
};

async function list(propertyIds?: number[]) {
  const db = await getDb();
  const rows = propertyIds ? propertyIds.length ? await db.select().from(customerFulfillments).where(inArray(customerFulfillments.propertyId, propertyIds)).orderBy(desc(customerFulfillments.createdAt)) : [] : await db.select().from(customerFulfillments).orderBy(desc(customerFulfillments.createdAt));
  return Promise.all(rows.map(async (f) => ({
    id: f.id, propertyId: f.propertyId, reference: f.reference, mode: f.mode, status: f.status,
    carrier: f.carrier, trackingNumber: f.trackingNumber, trackingUrl: f.trackingUrl,
    shippedAt: f.shippedAt, deliveredAt: f.deliveredAt, pickupReadyAt: f.pickupReadyAt,
    pickupAppointmentAt: f.pickupAppointmentAt, warehouseInstructions: f.warehouseInstructions,
    authorizedPickupPerson: f.authorizedPickupPerson,
    packages: await db.select().from(customerFulfillmentPackages).where(eq(customerFulfillmentPackages.fulfillmentId, f.id)),
    signatures: await db.select({ id: customerPickupSignatures.id, packageIdsJson: customerPickupSignatures.packageIdsJson, printedName: customerPickupSignatures.printedName, releasedBy: customerPickupSignatures.releasedBy, evidenceSha256: customerPickupSignatures.evidenceSha256, signedAt: customerPickupSignatures.signedAt }).from(customerPickupSignatures).where(eq(customerPickupSignatures.fulfillmentId, f.id)),
  })));
}

export async function GET() {
  const u = await getCurrentAppUser();
  if (!u) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const db = await getDb();
  if (u.role === "owner") return NextResponse.json({ fulfillments: await list(), properties: await db.select({ id: measureProperties.id, name: measureProperties.name, customerId: measureProperties.customerId }).from(measureProperties).limit(500), windows: await db.select({ id: measureWindows.id, propertyId: measureWindows.propertyId, code: measureWindows.code }).from(measureWindows).limit(2000) });
  if (u.role !== "customer") return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  const grants = await db.select({ id: customerPropertyAccess.propertyId }).from(customerPropertyAccess).where(and(eq(customerPropertyAccess.userId, u.id), eq(customerPropertyAccess.status, "active")));
  return NextResponse.json({ fulfillments: await list(grants.map((x) => x.id)) });
}

export async function POST(r: NextRequest) {
  const u = await getCurrentAppUser();
  if (!u || u.role !== "owner") return NextResponse.json({ error: "Owner only" }, { status: 403 });
  const b = await r.json(), propertyId = Number(b.propertyId), mode = String(b.mode), status = String(b.status || "preparing"), reference = String(b.reference || "").trim().slice(0, 100), packages = Array.isArray(b.packages) ? b.packages : [];
  if (!propertyId || !reference || !modes.has(mode) || !statuses.has(status) || !packages.length) return NextResponse.json({ error: "Property, reference, mode and packages required" }, { status: 400 });
  if (["delivered", "shipped", "in_transit"].includes(status) && (!b.carrier || !b.trackingNumber)) return NextResponse.json({ error: "Confirmed carrier and tracking required for shipment status" }, { status: 400 });
  const db = await getDb(), property = (await db.select().from(measureProperties).where(eq(measureProperties.id, propertyId)).limit(1))[0];
  if (!property?.customerId) return NextResponse.json({ error: "Property must link to Customer" }, { status: 409 });
  const windows = await db.select({ id: measureWindows.id, code: measureWindows.code }).from(measureWindows).where(eq(measureWindows.propertyId, propertyId)), byId = new Map(windows.map((x) => [x.id, x.code]));
  const normalized = packages.map((p: { windowIds?: unknown[]; packageCode?: unknown }, index: number) => ({ packageCode: String(p.packageCode || `PKG-${index + 1}`).slice(0, 80), ids: (Array.isArray(p.windowIds) ? p.windowIds : []).map(Number) }));
  const invalid = normalized.findIndex((p: { ids: number[] }) => !p.ids.length || p.ids.some((id) => !byId.has(id)));
  if (invalid >= 0) return NextResponse.json({ error: `Package ${invalid + 1} contains invalid Window` }, { status: 400 });
  const pickupCode = mode === "customer_pickup" ? Array.from(crypto.getRandomValues(new Uint8Array(8))).map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase() : "", now = new Date().toISOString();
  const created = (await db.insert(customerFulfillments).values({ propertyId, customerId: property.customerId, reference, mode, status, carrier: String(b.carrier || "").slice(0, 80), trackingNumber: String(b.trackingNumber || "").slice(0, 160), trackingUrl: String(b.trackingUrl || "").slice(0, 500), shippedAt: b.shippedAt ? String(b.shippedAt) : null, deliveredAt: status === "delivered" ? String(b.deliveredAt || now) : null, pickupReadyAt: status === "ready_for_pickup" ? String(b.pickupReadyAt || now) : null, pickupAppointmentAt: b.pickupAppointmentAt ? String(b.pickupAppointmentAt) : null, warehouseInstructions: String(b.warehouseInstructions || "").slice(0, 1000), authorizedPickupPerson: String(b.authorizedPickupPerson || "").slice(0, 160), pickupCodeHash: pickupCode ? await sha256(pickupCode) : null, createdBy: u.id }).returning())[0];
  const packageStatus = ["ready_for_pickup", "shipped", "in_transit", "delivered"].includes(status) ? status : "preparing";
  for (const p of normalized) await db.insert(customerFulfillmentPackages).values({ fulfillmentId: created.id, packageCode: p.packageCode, windowIdsJson: JSON.stringify(p.ids), windowCodesJson: JSON.stringify(p.ids.map((id: number) => byId.get(id))), status: packageStatus });
  await writeAuditLog({ userId: u.id, action: "customer_fulfillment_created", entityType: "customer_fulfillment", entityId: String(created.id), details: { reference, mode, propertyId } });
  return NextResponse.json({ fulfillment: created, pickupCode: pickupCode || null }, { status: 201 });
}

export async function PATCH(r: NextRequest) {
  const u = await getCurrentAppUser();
  if (!u || u.role !== "owner") return NextResponse.json({ error: "Owner only" }, { status: 403 });
  const b = await r.json(), id = Number(b.fulfillmentId), next = String(b.status || ""), db = await getDb(), current = (await db.select().from(customerFulfillments).where(eq(customerFulfillments.id, id)).limit(1))[0];
  if (!current) return NextResponse.json({ error: "Fulfillment not found" }, { status: 404 });
  if (!statuses.has(next) || !transitions[current.status]?.has(next)) return NextResponse.json({ error: `Invalid transition: ${current.status} → ${next}` }, { status: 409 });
  const carrier = String(b.carrier ?? current.carrier ?? "").slice(0, 80), trackingNumber = String(b.trackingNumber ?? current.trackingNumber ?? "").slice(0, 160);
  if (["shipped", "in_transit", "delivered"].includes(next) && (!carrier || !trackingNumber)) return NextResponse.json({ error: "Confirmed carrier and tracking required" }, { status: 400 });
  const now = new Date().toISOString();
  await db.update(customerFulfillments).set({ status: next, carrier, trackingNumber, trackingUrl: String(b.trackingUrl ?? current.trackingUrl ?? "").slice(0, 500), shippedAt: ["shipped", "in_transit", "delivered"].includes(next) ? current.shippedAt || now : current.shippedAt, deliveredAt: next === "delivered" ? now : current.deliveredAt, pickupReadyAt: next === "ready_for_pickup" ? current.pickupReadyAt || now : current.pickupReadyAt, updatedAt: now }).where(eq(customerFulfillments.id, id));
  if (["ready_for_pickup", "shipped", "in_transit", "delivered"].includes(next)) await db.update(customerFulfillmentPackages).set({ status: next }).where(and(eq(customerFulfillmentPackages.fulfillmentId, id), isNull(customerFulfillmentPackages.releasedAt)));
  await writeAuditLog({ userId: u.id, action: "customer_fulfillment_status_updated", entityType: "customer_fulfillment", entityId: String(id), details: { from: current.status, to: next } });
  return NextResponse.json({ ok: true });
}
