import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { importBatches, importRows } from "@/db/import-schema";
import { getCurrentAppUser } from "@/lib/v4-auth";

export async function GET(_request: NextRequest, context: { params: Promise<{ batchId: string }> }) {
  const user = await getCurrentAppUser();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "仅老板账号可审核导入 / Owner only" }, { status: 403 });
  }

  const { batchId: rawBatchId } = await context.params;
  const batchId = Number(rawBatchId);
  if (!Number.isInteger(batchId) || batchId <= 0) {
    return NextResponse.json({ error: "批次编号无效" }, { status: 400 });
  }

  const db = await getDb();
  const batches = await db.select().from(importBatches).where(eq(importBatches.id, batchId)).limit(1);
  if (!batches[0]) return NextResponse.json({ error: "未找到导入批次" }, { status: 404 });

  const rows = await db.select().from(importRows)
    .where(eq(importRows.batchId, batchId))
    .orderBy(asc(importRows.sourceSheet), asc(importRows.sourceRow), asc(importRows.id));

  return NextResponse.json({
    batch: batches[0],
    rows: rows.map((row) => ({
      ...row,
      warnings: safeJsonArray(row.warningsJson),
      raw: safeJsonArray(row.rawJson),
      warningsJson: undefined,
      rawJson: undefined,
    })),
  });
}

function safeJsonArray(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
