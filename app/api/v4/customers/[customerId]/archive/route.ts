import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { getDb } from "@/db";
import { customers } from "@/db/schema";
import { orders } from "@/db/order-schema";
import { canAccessCustomer } from "@/lib/customer-access";
import { getCurrentAppUser, writeAuditLog } from "@/lib/v4-auth";
import { hasPermission } from "@/lib/permissions";

export async function POST(request: NextRequest, context: { params: Promise<{ customerId: string }> }) {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  if (!hasPermission(user.role, "customers.manage")) return NextResponse.json({ error: "无权归档客户" }, { status: 403 });
  const customerId = Number((await context.params).customerId);
  if (!Number.isInteger(customerId) || !(await canAccessCustomer(user, customerId))) return NextResponse.json({ error: "未找到客户" }, { status: 404 });
  let body: Record<string, unknown> = {};
  try { body = await request.json(); } catch { /* confirmation is optional until risk is found */ }
  const db = await getDb();
  const risks = await db.select({ id: orders.id, orderNumber: orders.orderNumber, status: orders.status, balanceDue: orders.balanceDue })
    .from(orders).where(and(eq(orders.customerId, customerId), isNull(orders.archivedAt),
      or(gt(orders.balanceDue, 0), eq(orders.status, "draft"), eq(orders.status, "confirmed"), eq(orders.status, "in_production")))).limit(20);
  if (risks.length && body.confirm !== true) return NextResponse.json({ requiresConfirmation: true, risks }, { status: 409 });
  const archivedAt = new Date().toISOString();
  const updated = await db.update(customers).set({ status: "archived", archivedAt, updatedAt: archivedAt })
    .where(eq(customers.id, customerId)).returning({ id: customers.id, archivedAt: customers.archivedAt });
  if (!updated[0]) return NextResponse.json({ error: "未找到客户" }, { status: 404 });
  await writeAuditLog({ userId: user.id, action: "customer_archived", entityType: "customer", entityId: String(customerId),
    details: { confirmedRisks: risks.map((item) => item.orderNumber) } });
  return NextResponse.json({ customer: updated[0] });
}
