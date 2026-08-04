import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { getCurrentAppUser } from "@/lib/v4-auth";
import { importBatches, importRows } from "@/db/import-schema";

export async function GET() {
  const user = await getCurrentAppUser();
  if (!user || user.role !== "owner") {
    return NextResponse.json({ error: "仅老板账号可查看导入历史 / Owner only" }, { status: 403 });
  }

  const db = await getDb();
  const batches = await db
    .select({
      id: importBatches.id,
      batchKey: importBatches.batchKey,
      fileName: importBatches.fileName,
      workbookType: importBatches.workbookType,
      fileHash: importBatches.fileHash,
      status: importBatches.status,
      rowCount: importBatches.rowCount,
      warningCount: importBatches.warningCount,
      confirmedAt: importBatches.confirmedAt,
      rolledBackAt: importBatches.rolledBackAt,
      createdAt: importBatches.createdAt,
      committedRows: sql<number>`sum(case when ${importRows.importStatus} = 'committed' then 1 else 0 end)`,
    })
    .from(importBatches)
    .leftJoin(importRows, eq(importRows.batchId, importBatches.id))
    .groupBy(importBatches.id)
    .orderBy(desc(importBatches.id))
    .limit(100);

  return NextResponse.json({ batches });
}
