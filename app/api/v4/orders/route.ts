import { NextRequest, NextResponse } from "next/server";
import { and, count, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { appUsers, customers } from "@/db/schema";
import { orders, orderSequences, unifiedOrderAssignments } from "@/db/order-schema";
import { getCurrentAppUser, writeAuditLog } from "@/lib/v4-auth";
import { hasPermission } from "@/lib/permissions";

const PAGE_SIZE_DEFAULT = 25;
const PAGE_SIZE_MAX = 100;

export async function GET(request: NextRequest) {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "请先登录 / Authentication required" }, { status: 401 });

  const page = positiveInteger(request.nextUrl.searchParams.get("page"), 1);
  const pageSize = Math.min(positiveInteger(request.nextUrl.searchParams.get("pageSize"), PAGE_SIZE_DEFAULT), PAGE_SIZE_MAX);
  const q = cleanText(request.nextUrl.searchParams.get("q"), 120);
  const status = cleanText(request.nextUrl.searchParams.get("status"), 40);
  const paymentStatus = cleanText(request.nextUrl.searchParams.get("paymentStatus"), 40);
  const conditions: SQL[] = [];

  if (user.role === "customer") {
    if (!user.customerId) return NextResponse.json({ orders: [], page, pageSize, total: 0 });
    conditions.push(eq(orders.customerId, user.customerId));
  } else if (user.role !== "owner") {
    conditions.push(sql`exists (
      select 1 from unified_order_assignments assignment
      where assignment.order_id = ${orders.id} and assignment.user_id = ${user.id}
    )`);
  }
  if (status) conditions.push(eq(orders.status, status));
  if (paymentStatus) conditions.push(eq(orders.paymentStatus, paymentStatus));
  if (q) {
    const aliasNumber = q.toUpperCase().match(/^CWF\s*(\d{5})$/)?.[1];
    const pattern = `%${q}%`;
    conditions.push(or(
      aliasNumber ? eq(orders.orderNumber, aliasNumber) : undefined,
      like(orders.orderNumber, pattern),
      like(orders.projectName, pattern),
      like(orders.projectAddress, pattern),
      like(customers.companyName, pattern),
      like(customers.contactName, pattern),
      like(customers.email, pattern),
      like(customers.phone, pattern),
    )!);
  }

  const db = await getDb();
  const where = conditions.length ? and(...conditions) : undefined;
  const rows = await db.select({
    id: orders.id,
    orderNumber: orders.orderNumber,
    externalPrefix: orders.externalPrefix,
    customerId: orders.customerId,
    customerCompany: customers.companyName,
    customerName: customers.contactName,
    projectName: orders.projectName,
    projectAddress: orders.projectAddress,
    status: orders.status,
    paymentStatus: orders.paymentStatus,
    currency: orders.currency,
    grandTotal: orders.grandTotal,
    amountPaid: orders.amountPaid,
    balanceDue: orders.balanceDue,
    createdAt: orders.createdAt,
    updatedAt: orders.updatedAt,
  }).from(orders).innerJoin(customers, eq(orders.customerId, customers.id))
    .where(where).orderBy(desc(orders.updatedAt), desc(orders.id))
    .limit(pageSize).offset((page - 1) * pageSize);
  const totals = await db.select({ total: count() }).from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id)).where(where);

  return NextResponse.json({
    orders: rows,
    page,
    pageSize,
    total: Number(totals[0]?.total || 0),
    capabilities: { create: hasPermission(user.role, "orders.create") },
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "请先登录 / Authentication required" }, { status: 401 });
  if (!hasPermission(user.role, "orders.create")) {
    return NextResponse.json({ error: "无权创建订单 / Permission denied" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "请求格式无效 / Invalid request" }, { status: 400 }); }

  const customerId = Number(body.customerId);
  const projectName = cleanText(body.projectName, 200);
  const projectAddress = cleanText(body.projectAddress, 500);
  const externalPrefix = cleanText(body.externalPrefix, 12).toUpperCase();
  if (!Number.isInteger(customerId) || customerId <= 0) {
    return NextResponse.json({ error: "请选择有效客户 / Valid customer required" }, { status: 400 });
  }
  if (externalPrefix && !/^[A-Z0-9-]{1,12}$/.test(externalPrefix)) {
    return NextResponse.json({ error: "外部编号前缀无效 / Invalid external prefix" }, { status: 400 });
  }

  const db = await getDb();
  const customer = await db.select({ id: customers.id }).from(customers).where(eq(customers.id, customerId)).limit(1);
  if (!customer[0]) return NextResponse.json({ error: "客户不存在 / Customer not found" }, { status: 404 });

  let salesUserId: number | null = user.role === "sales" ? user.id : null;
  if (user.role === "owner" && body.salesUserId !== undefined && body.salesUserId !== null && body.salesUserId !== "") {
    const requestedSalesUserId = Number(body.salesUserId);
    if (!Number.isInteger(requestedSalesUserId) || requestedSalesUserId <= 0) {
      return NextResponse.json({ error: "销售人员编号无效" }, { status: 400 });
    }
    const salesUser = await db.select({ id: appUsers.id }).from(appUsers)
      .where(and(eq(appUsers.id, requestedSalesUserId), eq(appUsers.role, "sales"), eq(appUsers.status, "active"))).limit(1);
    if (!salesUser[0]) return NextResponse.json({ error: "未找到有效销售人员" }, { status: 404 });
    salesUserId = salesUser[0].id;
  }

  await db.insert(orderSequences).values({ id: 1, lastNumber: 0 }).onConflictDoNothing();
  const sequence = await db.update(orderSequences).set({
    lastNumber: sql`${orderSequences.lastNumber} + 1`,
    updatedAt: new Date().toISOString(),
  }).where(eq(orderSequences.id, 1)).returning({ lastNumber: orderSequences.lastNumber });
  if (!sequence[0] || sequence[0].lastNumber > 99_999) {
    return NextResponse.json({ error: "五位订单编号已用尽 / Order number limit reached" }, { status: 409 });
  }

  const orderNumber = String(sequence[0].lastNumber).padStart(5, "0");
  try {
    const created = await db.insert(orders).values({
      orderNumber,
      externalPrefix,
      customerId,
      projectName,
      projectAddress,
      salesUserId,
      currency: "USD",
    }).returning();
    if (salesUserId) {
      await db.insert(unifiedOrderAssignments).values({
        orderId: created[0].id,
        userId: salesUserId,
        accessLevel: "edit",
        assignedByUserId: user.id,
      }).onConflictDoNothing();
    }
    await writeAuditLog({
      userId: user.id,
      action: "order_created",
      entityType: "order",
      entityId: orderNumber,
      details: { customerId, projectName, externalPrefix, salesUserId },
    });
    return NextResponse.json({ order: created[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "订单创建失败，请重试 / Unable to create order" }, { status: 409 });
  }
}

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function cleanText(value: unknown, maxLength: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}
