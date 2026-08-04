import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { orderItems, orders, unifiedOrderAssignments } from "@/db/order-schema";
import type { AppRole } from "@/lib/v4-auth";

export type OrderAccessUser = { id:number; role:AppRole; customerId:number|null };

export function normalizeUnifiedOrderNumber(value: unknown) {
  const match = decodeURIComponent(String(value ?? "")).trim().toUpperCase().match(/^(?:CWF\s*)?(\d{5})$/);
  return match?.[1] || "";
}

export async function findAccessibleOrder(rawOrderNumber: unknown, user: OrderAccessUser) {
  const orderNumber = normalizeUnifiedOrderNumber(rawOrderNumber);
  if (!orderNumber) return null;
  const db = await getDb();
  const rows = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  const order = rows[0];
  if (!order) return null;
  if (user.role === "owner") return order;
  if (user.role === "customer") return user.customerId === order.customerId ? order : null;
  const assignment = await db.select({ id: unifiedOrderAssignments.id }).from(unifiedOrderAssignments)
    .where(and(eq(unifiedOrderAssignments.orderId, order.id), eq(unifiedOrderAssignments.userId, user.id))).limit(1);
  return assignment[0] ? order : null;
}

export async function recalculateOrderTotals(orderId: number) {
  const db = await getDb();
  const totals = await db.select({ subtotal: sql<number>`coalesce(sum(${orderItems.lineTotal}), 0)` })
    .from(orderItems).where(eq(orderItems.orderId, orderId));
  const current = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!current[0]) throw new Error("Order not found");
  const subtotal = money(Number(totals[0]?.subtotal || 0));
  const grandTotal = money(subtotal - current[0].discountAmount + current[0].taxAmount + current[0].installationFee + current[0].shippingCharge);
  const balanceDue = money(grandTotal - current[0].amountPaid);
  const updatedAt = new Date().toISOString();
  await db.update(orders).set({ subtotal, grandTotal, balanceDue, updatedAt }).where(eq(orders.id, orderId));
  return { subtotal, grandTotal, balanceDue, updatedAt };
}

export function money(value: number) {
  return Math.round(value * 100) / 100;
}
