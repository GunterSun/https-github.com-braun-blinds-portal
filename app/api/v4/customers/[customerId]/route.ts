import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { customerAddresses, customerContacts, customers } from "@/db/schema";
import { orders } from "@/db/order-schema";
import { canAccessCustomer, cleanText } from "@/lib/customer-access";
import { getCurrentAppUser, writeAuditLog } from "@/lib/v4-auth";
import { hasPermission } from "@/lib/permissions";

export async function GET(_request: NextRequest, context: { params: Promise<{ customerId: string }> }) {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "请先登录 / Authentication required" }, { status: 401 });
  const customerId = parseId((await context.params).customerId);
  if (!customerId || !(await canAccessCustomer(user, customerId))) return NextResponse.json({ error: "未找到客户" }, { status: 404 });
  const db = await getDb();
  const row = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  if (!row[0]) return NextResponse.json({ error: "未找到客户" }, { status: 404 });
  const [contacts, addresses, recentOrders] = await Promise.all([
    db.select().from(customerContacts).where(eq(customerContacts.customerId, customerId)).orderBy(asc(customerContacts.id)),
    db.select().from(customerAddresses).where(eq(customerAddresses.customerId, customerId)).orderBy(asc(customerAddresses.addressType), asc(customerAddresses.id)),
    db.select({ id: orders.id, orderNumber: orders.orderNumber, projectName: orders.projectName, status: orders.status,
      currency: orders.currency, grandTotal: orders.grandTotal, balanceDue: orders.balanceDue, updatedAt: orders.updatedAt })
      .from(orders).where(eq(orders.customerId, customerId)).orderBy(asc(orders.id)).limit(100),
  ]);
  if (user.role === "customer") {
    return NextResponse.json({ customer: publicCustomer(row[0]), contacts: contacts.filter((item) => item.customerVisible),
      addresses, orders: recentOrders });
  }
  return NextResponse.json({ customer: row[0], contacts, addresses, orders: recentOrders });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ customerId: string }> }) {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "请先登录 / Authentication required" }, { status: 401 });
  if (!hasPermission(user.role, "customers.manage")) return NextResponse.json({ error: "无权修改客户" }, { status: 403 });
  const customerId = parseId((await context.params).customerId);
  if (!customerId || !(await canAccessCustomer(user, customerId))) return NextResponse.json({ error: "未找到客户" }, { status: 404 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "请求格式无效" }, { status: 400 }); }
  const db = await getDb();
  const existing = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  if (!existing[0] || existing[0].archivedAt) return NextResponse.json({ error: "客户不存在或已归档" }, { status: 409 });
  const patch: Partial<typeof customers.$inferInsert> = {};
  for (const [input, column, max] of [["displayName", "displayName", 160], ["legalName", "legalName", 200],
    ["companyName", "companyName", 160], ["contactName", "contactName", 160], ["phone", "phone", 50],
    ["preferredLanguage", "preferredLanguage", 10]] as const) {
    if (body[input] !== undefined) patch[column] = cleanText(body[input], max);
  }
  if (user.role === "owner") {
    if (body.paymentTerms !== undefined) patch.paymentTerms = cleanText(body.paymentTerms, 60);
    if (body.taxExemptStatus !== undefined) patch.taxExemptStatus = cleanText(body.taxExemptStatus, 30);
    if (body.defaultDiscountValue !== undefined) {
      const value = Number(body.defaultDiscountValue);
      if (!Number.isFinite(value) || value < 0 || value > 100) return NextResponse.json({ error: "折扣值无效" }, { status: 400 });
      patch.defaultDiscountValue = value;
    }
  }
  if (!Object.keys(patch).length) return NextResponse.json({ error: "没有可更新字段" }, { status: 400 });
  patch.updatedAt = new Date().toISOString();
  const updated = await db.update(customers).set(patch).where(eq(customers.id, customerId)).returning();
  await writeAuditLog({ userId: user.id, action: "customer_updated", entityType: "customer", entityId: String(customerId),
    details: { fields: Object.keys(patch).filter((field) => field !== "updatedAt") } });
  return NextResponse.json({ customer: updated[0] });
}

function parseId(value: string) { const parsed = Number(value); return Number.isInteger(parsed) && parsed > 0 ? parsed : null; }
function publicCustomer(customer: typeof customers.$inferSelect) {
  return omit(customer, ["passwordHash", "passwordSalt", "passwordEncrypted", "discountPercent",
    "defaultDiscountValue", "defaultDiscountType", "taxDocumentId", "salesOwnerUserId"]);
}
function omit<T extends Record<string, unknown>, K extends keyof T>(value: T, keys: readonly K[]): Omit<T, K> {
  const copy = { ...value };
  for (const key of keys) delete copy[key];
  return copy;
}
