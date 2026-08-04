import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { getCurrentAppUser, writeAuditLog } from "@/lib/v4-auth";
import { importBatches, importRows } from "@/db/import-schema";

export async function POST(request: NextRequest) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "仅老板账号可确认导入 / Owner only" }, { status: 403 });
  }

  let body: { fileName?: string; fileHash?: string; workbookType?: string; rows?: Array<Record<string, unknown>> };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "请求格式无效" }, { status: 400 }); }

  const fileName = String(body.fileName || "").trim();
  const fileHash = String(body.fileHash || "").trim().toLowerCase();
  const workbookType = String(body.workbookType || "").trim();
  const rows = Array.isArray(body.rows) ? body.rows : [];
  if (!fileName || !/^[a-f0-9]{64}$/.test(fileHash) || !workbookType || rows.length === 0) {
    return NextResponse.json({ error: "缺少文件名、SHA-256、表格类型或导入明细" }, { status: 400 });
  }
  if (rows.length > 5000) return NextResponse.json({ error: "单次最多导入 5000 条" }, { status: 413 });

  const db = await getDb();
  const duplicate = await db.select({ id: importBatches.id, status: importBatches.status }).from(importBatches).where(eq(importBatches.fileHash, fileHash)).limit(1);
  if (duplicate[0]) {
    return NextResponse.json({ error: "此文件已经导入", duplicateBatchId: duplicate[0].id, status: duplicate[0].status }, { status: 409 });
  }

  const warningCount = rows.reduce((total, row) => total + (Array.isArray(row.warnings) ? row.warnings.length : 0), 0);
  const batchKey = crypto.randomUUID();
  const inserted = await db.insert(importBatches).values({
    batchKey, fileName, fileHash, workbookType, status: "confirmed", rowCount: rows.length,
    warningCount, importedByUserId: user.id, confirmedAt: new Date().toISOString(),
  }).returning({ id: importBatches.id });
  const batchId = inserted[0]?.id;
  if (!batchId) return NextResponse.json({ error: "无法建立导入批次" }, { status: 500 });

  for (const row of rows) {
    const source = (row.source || {}) as Record<string, unknown>;
    await db.insert(importRows).values({
      batchId,
      sourceSheet: String(source.sheetName || ""),
      sourceRow: Number(source.rowNumber || 0),
      recordType: String(row.recordType || "unknown"),
      orderNumber: String(row.orderNumber || ""), customer: String(row.customer || ""),
      project: String(row.project || ""), product: String(row.product || ""),
      amount: typeof row.amount === "number" ? row.amount : null,
      currency: row.currency ? String(row.currency) : null,
      status: String(row.status || ""), notes: String(row.notes || ""),
      warningsJson: JSON.stringify(Array.isArray(row.warnings) ? row.warnings : []),
      rawJson: JSON.stringify(Array.isArray(row.raw) ? row.raw : []), importStatus: "confirmed",
    });
  }

  await writeAuditLog({ userId: user.id, action: "excel_import_confirmed", entityType: "import_batch", entityId: String(batchId), details: { fileName, fileHash, workbookType, rowCount: rows.length, warningCount } });
  return NextResponse.json({ ok: true, batchId, batchKey, rowCount: rows.length, warningCount }, { status: 201 });
}
