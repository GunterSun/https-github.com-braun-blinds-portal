import { NextRequest, NextResponse } from "next/server";
import { and, asc, count, eq, like, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { customerContacts, customerSequences, customers } from "@/db/schema";
import { orders, unifiedOrderAssignments } from "@/db/order-schema";
import { cleanText, normalizeEmail, normalizePhone } from "@/lib/customer-access";
import { getCurrentAppUser, writeAuditLog } from "@/lib/v4-auth";
import { hasPermission } from "@/lib/permissions";

const CUSTOMER_TYPES = new Set(["retail", "wholesale", "designer", "contractor", "commercial", "other"]);

export async function GET(request: NextRequest) {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "请先登录 / Authentication required" }, { status: 401 });
  if (!hasPermission(user.role, "customers.view")) return NextResponse.json({ error: "无权查看客户" }, { status: 403 });
  const page = positive(request.nextUrl.searchParams.get("page"), 1);
  const pageSize = Math.min(positive(request.nextUrl.searchParams.get("pageSize"), 25), 100);
  const q = cleanText(request.nextUrl.searchParams.get("q"), 120);
  const status = cleanText(request.nextUrl.searchParams.get("status"), 40);
  const type = cleanText(request.nextUrl.searchParams.get("type"), 40);
  const conditions: SQL[] = [];
  if (user.role !== "owner") conditions.push(sql`${customers.salesOwnerUserId} = ${user.id} or exists (
    select 1 from ${orders} inner join ${unifiedOrderAssignments} on ${unifiedOrderAssignments.orderId} = ${orders.id}
    where ${orders.customerId} = ${customers.id} and ${unifiedOrderAssignments.userId} = ${user.id}
  )`);
  if (status) conditions.push(eq(customers.status, status));
  if (type) conditions.push(eq(customers.customerType, type));
  if (q) {
    const pattern = `%${q}%`;
    conditions.push(or(like(customers.customerNumber, pattern), like(customers.displayName, pattern),
      like(customers.companyName, pattern), like(customers.contactName, pattern), like(customers.email, pattern), like(customers.phone, pattern))!);
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const db = await getDb();
  const rows = await db.select({ id: customers.id, customerNumber: customers.customerNumber,
    customerType: customers.customerType, displayName: customers.displayName, companyName: customers.companyName,
    contactName: customers.contactName, email: customers.email, phone: customers.phone, status: customers.status,
    salesOwnerUserId: customers.salesOwnerUserId, archivedAt: customers.archivedAt })
    .from(customers).where(where).orderBy(asc(customers.displayName), asc(customers.companyName), asc(customers.id))
    .limit(pageSize).offset((page - 1) * pageSize);
  const totals = await db.select({ total: count() }).from(customers).where(where);
  return NextResponse.json({ customers: rows, page, pageSize, total: Number(totals[0]?.total || 0),
    capabilities: { create: hasPermission(user.role, "customers.manage") } });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "请先登录 / Authentication required" }, { status: 401 });
  if (!hasPermission(user.role, "customers.manage")) return NextResponse.json({ error: "无权创建客户" }, { status: 403 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "请求格式无效" }, { status: 400 }); }
  const displayName = cleanText(body.displayName, 160);
  const companyName = cleanText(body.companyName, 160);
  const contactName = cleanText(body.contactName, 160);
  const email = normalizeEmail(body.email);
  const phone = cleanText(body.phone, 50);
  const phoneNormalized = normalizePhone(phone);
  const customerType = cleanText(body.customerType, 30) || "retail";
  if (!displayName && !companyName && !contactName) return NextResponse.json({ error: "客户名称不能为空" }, { status: 400 });
  if (!CUSTOMER_TYPES.has(customerType)) return NextResponse.json({ error: "客户类型无效" }, { status: 400 });
  if (!email) return NextResponse.json({ error: "客户邮箱不能为空" }, { status: 400 });
  const db = await getDb();
  const duplicateConditions: SQL[] = [eq(customers.email, email)];
  if (phoneNormalized) duplicateConditions.push(sql`replace(replace(replace(replace(${customers.phone}, ' ', ''), '-', ''), '(', ''), ')', '') like ${`%${phoneNormalized}`}`);
  const duplicates = await db.select({ id: customers.id, customerNumber: customers.customerNumber, displayName: customers.displayName,
    companyName: customers.companyName, contactName: customers.contactName, email: customers.email, phone: customers.phone })
    .from(customers).where(or(...duplicateConditions)).limit(10);
  if (duplicates.length && body.confirmCreate !== true) {
    return NextResponse.json({ requiresConfirmation: true, duplicateCandidates: duplicates }, { status: 409 });
  }
  await db.insert(customerSequences).values({ id: 1, lastNumber: 0 }).onConflictDoNothing();
  const sequence = await db.update(customerSequences).set({ lastNumber: sql`${customerSequences.lastNumber} + 1`, updatedAt: new Date().toISOString() })
    .where(eq(customerSequences.id, 1)).returning({ lastNumber: customerSequences.lastNumber });
  const customerNumber = `CUS-${String(sequence[0].lastNumber).padStart(6, "0")}`;
  try {
    const created = await db.insert(customers).values({ customerNumber, customerType, displayName: displayName || companyName || contactName,
      legalName: cleanText(body.legalName, 200), companyName, contactName, email, phone, source: cleanText(body.source, 60) || "manual",
      salesOwnerUserId: user.role === "sales" ? user.id : null, status: "active" }).returning();
    if (contactName || phone || email) await db.insert(customerContacts).values({ customerId: created[0].id,
      name: contactName || displayName || companyName, phoneRaw: phone, phoneNormalized, emailRaw: email,
      emailNormalized: email, isPrimary: true });
    await writeAuditLog({ userId: user.id, action: "customer_created", entityType: "customer", entityId: String(created[0].id),
      details: { customerNumber, customerType, duplicateCandidateIds: duplicates.map((item) => item.id) } });
    return NextResponse.json({ customer: { id: created[0].id, customerNumber: created[0].customerNumber,
      customerType: created[0].customerType, displayName: created[0].displayName, companyName: created[0].companyName,
      contactName: created[0].contactName, email: created[0].email, phone: created[0].phone, status: created[0].status } }, { status: 201 });
  } catch { return NextResponse.json({ error: "客户创建失败；邮箱或编号可能重复" }, { status: 409 }); }
}

function positive(value: string | null, fallback: number) { const parsed = Number(value); return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback; }
