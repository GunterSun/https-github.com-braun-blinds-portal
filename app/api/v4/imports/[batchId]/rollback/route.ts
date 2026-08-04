import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { getCurrentAppUser, writeAuditLog } from "@/lib/v4-auth";
import { importBatches, importRows } from "@/db/import-schema";

export async function POST(_request: NextRequest, context: { params: Promise<{ batchId: string }> }) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "仅老板账号可回滚 / Owner only" }, { status: 403 });
  }

  const { batchId: rawBatchId } = await context.params;
  const batchId = Number(rawBatchId);
  if (!Number.isInteger(batchId) || batchId <= 0) return NextResponse.json({ error: "批次编号无效" }, { status: 400 });

  const db = await getDb();
  const batch = await db.select().from(importBatches).where(eq(importBatches.id, batchId)).limit(1);
  if (!batch[0]) return NextResponse.json({ error: "未找到导入批次" }, { status: 404 });
  if (batch[0].status === "rolled_back") return NextResponse.json({ error: "该批次已回滚" }, { status: 409 });

  const linkedRows = await db.select({ id: importRows.id }).from(importRows)
    .where(and(eq(importRows.batchId, batchId), eq(importRows.importStatus, "committed")));
  if (linkedRows.length > 0) {
    return NextResponse.json({ error: "该批次已生成正式业务记录，必须先使用目标记录回滚流程", linkedRows: linkedRows.length }, { status: 409 });
  }

  const rolledBackAt = new Date().toISOString();
  await db.update(importRows).set({ importStatus: "rolled_back" }).where(eq(importRows.batchId, batchId));
  await db.update(importBatches).set({ status: "rolled_back", rolledBackAt }).where(eq(importBatches.id, batchId));
  await writeAuditLog({ userId: user.id, action: "excel_import_rolled_back", entityType: "import_batch", entityId: String(batchId), details: { fileName: batch[0].fileName, rowCount: batch[0].rowCount } });

  return NextResponse.json({ ok: true, batchId, rolledBackAt });
}
