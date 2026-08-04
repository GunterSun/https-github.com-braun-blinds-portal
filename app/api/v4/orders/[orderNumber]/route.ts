import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { customers } from "@/db/schema";
import { orderItems, orders, unifiedOrderAssignments } from "@/db/order-schema";
import { getCurrentAppUser, writeAuditLog, type AppRole } from "@/lib/v4-auth";
import { hasPermission } from "@/lib/permissions";

const ORDER_STATUSES = new Set([
  "draft", "quoted", "confirmed", "in_production", "ready_to_ship", "shipped",
  "installation_scheduled", "installed", "completed", "cancelled", "on_hold",
]);
const SALES_TRANSITIONS: Record<string, readonly string[]> = {
  draft: ["quoted", "cancelled", "on_hold"],
  quoted: ["confirmed", "cancelled", "on_hold"],
  confirmed: ["in_production", "on_hold"],
  in_production: ["ready_to_ship", "on_hold"],
  ready_to_ship: ["shipped", "on_hold"],
  shipped: ["installation_scheduled", "on_hold"],
  installation_scheduled: ["installed", "on_hold"],
  installed: ["completed", "on_hold"],
  on_hold: ["draft", "quoted", "confirmed", "in_production", "ready_to_ship", "shipped", "installation_scheduled"],
  completed: [],
  cancelled: [],
};

export async function GET(_request: NextRequest, context: { params: Promise<{ orderNumber: string }> }) {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "请先登录 / Authentication required" }, { status: 401 });
  const orderNumber = normalizeOrderNumber((await context.params).orderNumber);
  if (!orderNumber) return NextResponse.json({ error: "订单号无效 / Invalid order number" }, { status: 400 });

  const db = await getDb();
  const result = await db.select({ order: orders, customer: {
    id: customers.id,
    companyName: customers.companyName,
    contactName: customers.contactName,
    email: customers.email,
    phone: customers.phone,
  } }).from(orders).innerJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.orderNumber, orderNumber)).limit(1);
  if (!result[0] || !(await canAccess(result[0].order.id, result[0].order.customerId, user))) {
    return NextResponse.json({ error: "未找到订单 / Order not found" }, { status: 404 });
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, result[0].order.id))
    .orderBy(asc(orderItems.sortOrder), asc(orderItems.id));
  const includeSalesAmounts = ["owner", "sales", "customer"].includes(user.role);
  const order = includeSalesAmounts ? result[0].order : omit(result[0].order, [
    "subtotal", "discountAmount", "taxAmount", "installationFee", "shippingCharge",
    "grandTotal", "amountPaid", "balanceDue", "paymentStatus",
  ]);
  const visibleItems = items.map((item) => {
    if (user.role === "owner") return item;
    const withoutCost = omit(item, ["costEstimateUsd"]);
    return ["sales", "customer"].includes(user.role)
      ? withoutCost
      : omit(withoutCost, ["unitPrice", "lineTotal"]);
  });

  return NextResponse.json({ order, customer: result[0].customer, items: visibleItems });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ orderNumber: string }> }) {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "请先登录 / Authentication required" }, { status: 401 });
  if (!hasPermission(user.role, "orders.edit")) {
    return NextResponse.json({ error: "无权修改订单 / Permission denied" }, { status: 403 });
  }
  const orderNumber = normalizeOrderNumber((await context.params).orderNumber);
  if (!orderNumber) return NextResponse.json({ error: "订单号无效 / Invalid order number" }, { status: 400 });

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "请求格式无效 / Invalid request" }, { status: 400 }); }

  const db = await getDb();
  const existing = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  if (!existing[0] || !(await canAccess(existing[0].id, existing[0].customerId, user))) {
    return NextResponse.json({ error: "未找到订单 / Order not found" }, { status: 404 });
  }
  if (existing[0].archivedAt) return NextResponse.json({ error: "已归档订单不能直接修改" }, { status: 409 });

  const patch: Partial<typeof orders.$inferInsert> = {};
  if (body.projectName !== undefined) patch.projectName = cleanText(body.projectName, 200);
  if (body.projectAddress !== undefined) patch.projectAddress = cleanText(body.projectAddress, 500);
  if (body.status !== undefined) {
    const nextStatus = cleanText(body.status, 40);
    if (!ORDER_STATUSES.has(nextStatus)) return NextResponse.json({ error: "订单状态无效" }, { status: 400 });
    if (user.role !== "owner" && nextStatus !== existing[0].status && !SALES_TRANSITIONS[existing[0].status]?.includes(nextStatus)) {
      return NextResponse.json({ error: "不允许的订单状态转换" }, { status: 409 });
    }
    patch.status = nextStatus;
    if (nextStatus === "confirmed" && !existing[0].confirmedAt) patch.confirmedAt = new Date().toISOString();
    if (nextStatus === "completed" && !existing[0].completedAt) patch.completedAt = new Date().toISOString();
  }
  if (user.role === "owner" && body.externalPrefix !== undefined) {
    const prefix = cleanText(body.externalPrefix, 12).toUpperCase();
    if (prefix && !/^[A-Z0-9-]{1,12}$/.test(prefix)) return NextResponse.json({ error: "外部编号前缀无效" }, { status: 400 });
    patch.externalPrefix = prefix;
  }
  if (!Object.keys(patch).length) return NextResponse.json({ error: "没有可更新字段" }, { status: 400 });
  patch.updatedAt = new Date().toISOString();

  const updated = await db.update(orders).set(patch).where(eq(orders.id, existing[0].id)).returning();
  await writeAuditLog({
    userId: user.id,
    action: "order_updated",
    entityType: "order",
    entityId: orderNumber,
    details: { before: auditFields(existing[0]), after: auditFields(updated[0]) },
  });
  return NextResponse.json({ order: updated[0] });
}

async function canAccess(orderId: number, customerId: number, user: { id:number; role:AppRole; customerId:number|null }) {
  if (user.role === "owner") return true;
  if (user.role === "customer") return user.customerId === customerId;
  const db = await getDb();
  const assignment = await db.select({ id: unifiedOrderAssignments.id }).from(unifiedOrderAssignments)
    .where(and(eq(unifiedOrderAssignments.orderId, orderId), eq(unifiedOrderAssignments.userId, user.id))).limit(1);
  return Boolean(assignment[0]);
}

function normalizeOrderNumber(value: unknown) {
  const match = decodeURIComponent(String(value ?? "")).trim().toUpperCase().match(/^(?:CWF\s*)?(\d{5})$/);
  return match?.[1] || "";
}

function cleanText(value: unknown, maxLength: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function omit<T extends Record<string, unknown>, K extends keyof T>(value: T, keys: readonly K[]): Omit<T, K> {
  const copy = { ...value };
  for (const key of keys) delete copy[key];
  return copy;
}

function auditFields(order: typeof orders.$inferSelect) {
  return {
    projectName: order.projectName,
    projectAddress: order.projectAddress,
    externalPrefix: order.externalPrefix,
    status: order.status,
    confirmedAt: order.confirmedAt,
    completedAt: order.completedAt,
  };
}
