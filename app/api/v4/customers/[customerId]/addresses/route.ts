import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { customerAddresses } from "@/db/schema";
import { addressHash, canAccessCustomer, cleanText } from "@/lib/customer-access";
import { getCurrentAppUser, writeAuditLog } from "@/lib/v4-auth";
import { hasPermission } from "@/lib/permissions";

const ADDRESS_TYPES = new Set(["billing", "shipping", "project", "other"]);

export async function POST(request: NextRequest, context: { params: Promise<{ customerId: string }> }) {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  if (!hasPermission(user.role, "customers.manage")) return NextResponse.json({ error: "无权修改地址" }, { status: 403 });
  const customerId = Number((await context.params).customerId);
  if (!Number.isInteger(customerId) || !(await canAccessCustomer(user, customerId))) return NextResponse.json({ error: "未找到客户" }, { status: 404 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "请求格式无效" }, { status: 400 }); }
  const addressType = cleanText(body.addressType, 20), line1 = cleanText(body.line1, 200), city = cleanText(body.city, 100);
  if (!ADDRESS_TYPES.has(addressType) || !line1 || !city) return NextResponse.json({ error: "地址类型、地址和城市为必填项" }, { status: 400 });
  const line2 = cleanText(body.line2, 200), state = cleanText(body.state, 80), postalCode = cleanText(body.postalCode, 30);
  const country = cleanText(body.country, 2).toUpperCase() || "US", isDefault = body.isDefault === true;
  const db = await getDb(), now = new Date().toISOString();
  if (isDefault) await db.update(customerAddresses).set({ isDefault: false, updatedAt: now })
    .where(and(eq(customerAddresses.customerId, customerId), eq(customerAddresses.addressType, addressType), eq(customerAddresses.isDefault, true)));
  const created = await db.insert(customerAddresses).values({ customerId, addressType, label: cleanText(body.label, 100),
    line1, line2, city, state, postalCode, country, normalizedAddressHash: await addressHash([line1, line2, city, state, postalCode, country]),
    accessNotes: cleanText(body.accessNotes, 500), isDefault }).returning();
  await writeAuditLog({ userId: user.id, action: "customer_address_created", entityType: "customer_address",
    entityId: String(created[0].id), details: { customerId, addressType, isDefault } });
  return NextResponse.json({ address: created[0] }, { status: 201 });
}
