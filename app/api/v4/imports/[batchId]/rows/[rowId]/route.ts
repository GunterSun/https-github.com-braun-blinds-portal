import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { importBatches, importRows } from "@/db/import-schema";
import { getCurrentAppUser, writeAuditLog } from "@/lib/v4-auth";

const RECORD_TYPES = new Set(["order", "expense", "payment", "settlement", "unknown"]);
const REVIEW_STATUSES = new Set(["pending", "approved", "rejected"]);

export async function PATCH(request: NextRequest, context: { params: Promise<{ batchId: string; rowId: string }> }) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "仅老板账号可审核导入 / Owner only" }, { status: 403 });
  }

  const params = await context.params;
  const batchId = Number(params.batchId);
  const rowId = Number(params.rowId);
  if (!Number.isInteger(batchId) || batchId <= 0 || !Number.isInteger(rowId) || rowId <= 0) {
    return NextResponse.json({ error: "批次或记录编号无效" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "请求格式无效" }, { status: 400 }); }

  const recordType = text(body.recordType);
  const reviewStatus = text(body.reviewStatus);
  const currency = text(body.currency).toUpperCase();
  const amount = body.amount === null || body.amount === "" ? null : Number(body.amount);
  if (!RECORD_TYPES.has(recordType) || !REVIEW_STATUSES.has(reviewStatus)) {
    return NextResponse.json({ error: "记录类型或审核状态无效" }, { status: 400 });
  }
  if (currency && currency !== "USD" && currency !== "RMB") {
    return NextResponse.json({ error: "币种必须为空、USD 或 RMB" }, { status: 400 });
  }
  if (amount !== null && (!Number.isFinite(amount) || Math.abs(amount) > 10_000_000)) {
    return NextResponse.json({ error: "金额无效或超出允许范围" }, { status: 400 });
  }
  if (reviewStatus === "approved" && (amount === null || !currency)) {
    return NextResponse.json({ error: "批准前必须填写有效金额和币种" }, { status: 400 });
  }
  if (reviewStatus === "approved" && recordType === "order" && !text(body.orderNumber)) {
    return NextResponse.json({ error: "订单记录批准前必须填写订单号" }, { status: 400 });
  }

  const db = await getDb();
  const batches = await db.select({ status: importBatches.status }).from(importBatches).where(eq(importBatches.id, batchId)).limit(1);
  if (!batches[0]) return NextResponse.json({ error: "未找到导入批次" }, { status: 404 });
  if (batches[0].status === "rolled_back") return NextResponse.json({ error: "已回滚批次不能审核" }, { status: 409 });

  const existing = await db.select({ id: importRows.id, importStatus: importRows.importStatus })
    .from(importRows).where(and(eq(importRows.id, rowId), eq(importRows.batchId, batchId))).limit(1);
  if (!existing[0]) return NextResponse.json({ error: "未找到导入记录" }, { status: 404 });
  if (existing[0].importStatus === "committed") return NextResponse.json({ error: "已生成正式记录，不能直接修改" }, { status: 409 });

  const reviewed = reviewStatus !== "pending";
  const updated = await db.update(importRows).set({
    recordType,
    orderNumber: text(body.orderNumber),
    customer: text(body.customer),
    project: text(body.project),
    product: text(body.product),
    amount: amount === null ? null : Math.round(amount * 100) / 100,
    currency: currency || null,
    status: text(body.status),
    notes: text(body.notes),
    reviewStatus,
    reviewNote: text(body.reviewNote),
    reviewedByUserId: reviewed ? user.id : null,
    reviewedAt: reviewed ? new Date().toISOString() : null,
  }).where(and(eq(importRows.id, rowId), eq(importRows.batchId, batchId))).returning();

  await writeAuditLog({
    userId: user.id,
    action: `excel_import_row_${reviewStatus}`,
    entityType: "import_row",
    entityId: String(rowId),
    details: { batchId, recordType, amount, currency },
  });
  // Row review is metadata inside the confirmed staging batch. The batch only
  // becomes `committed` when a separate, audited conversion creates formal
  // business records.
  return NextResponse.json({ ok: true, row: updated[0], batchStatus: batches[0].status });
}

function text(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, 1000);
}
