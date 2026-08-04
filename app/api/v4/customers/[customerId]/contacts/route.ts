import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { customerContacts } from "@/db/schema";
import { canAccessCustomer, cleanText, normalizeEmail, normalizePhone } from "@/lib/customer-access";
import { getCurrentAppUser, writeAuditLog } from "@/lib/v4-auth";
import { hasPermission } from "@/lib/permissions";

export async function POST(request: NextRequest, context: { params: Promise<{ customerId: string }> }) {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  if (!hasPermission(user.role, "customers.manage")) return NextResponse.json({ error: "无权修改联系人" }, { status: 403 });
  const customerId = Number((await context.params).customerId);
  if (!Number.isInteger(customerId) || !(await canAccessCustomer(user, customerId))) return NextResponse.json({ error: "未找到客户" }, { status: 404 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "请求格式无效" }, { status: 400 }); }
  const name = cleanText(body.name, 160), phoneRaw = cleanText(body.phone, 50), emailRaw = cleanText(body.email, 254);
  if (!name) return NextResponse.json({ error: "联系人姓名不能为空" }, { status: 400 });
  const db = await getDb(), now = new Date().toISOString(), isPrimary = body.isPrimary === true;
  if (isPrimary) await db.update(customerContacts).set({ isPrimary: false, updatedAt: now })
    .where(and(eq(customerContacts.customerId, customerId), eq(customerContacts.isPrimary, true)));
  const created = await db.insert(customerContacts).values({ customerId, name, title: cleanText(body.title, 100), phoneRaw,
    phoneNormalized: normalizePhone(phoneRaw), emailRaw, emailNormalized: normalizeEmail(emailRaw),
    preferredChannel: cleanText(body.preferredChannel, 30) || "email", isPrimary,
    customerVisible: body.customerVisible !== false }).returning();
  await writeAuditLog({ userId: user.id, action: "customer_contact_created", entityType: "customer_contact",
    entityId: String(created[0].id), details: { customerId, isPrimary } });
  return NextResponse.json({ contact: created[0] }, { status: 201 });
}
