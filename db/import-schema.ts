import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const importBatches = sqliteTable("import_batches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  batchKey: text("batch_key").notNull().unique(),
  fileName: text("file_name").notNull(),
  workbookType: text("workbook_type").notNull(),
  fileHash: text("file_hash").notNull(),
  status: text("status").notNull().default("preview"),
  rowCount: integer("row_count").notNull().default(0),
  warningCount: integer("warning_count").notNull().default(0),
  importedByUserId: integer("imported_by_user_id"),
  confirmedAt: text("confirmed_at"),
  rolledBackAt: text("rolled_back_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => ({ fileHashUnique: uniqueIndex("import_batches_file_hash_unique").on(table.fileHash) }));

export const importRows = sqliteTable("import_rows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  batchId: integer("batch_id").notNull(),
  sourceSheet: text("source_sheet").notNull(),
  sourceRow: integer("source_row").notNull(),
  recordType: text("record_type").notNull(),
  orderNumber: text("order_number").notNull().default(""),
  customer: text("customer").notNull().default(""),
  project: text("project").notNull().default(""),
  product: text("product").notNull().default(""),
  amount: real("amount"),
  currency: text("currency"),
  status: text("status").notNull().default(""),
  notes: text("notes").notNull().default(""),
  warningsJson: text("warnings_json").notNull().default("[]"),
  rawJson: text("raw_json").notNull().default("[]"),
  targetEntityType: text("target_entity_type"),
  targetEntityId: text("target_entity_id"),
  importStatus: text("import_status").notNull().default("preview"),
  reviewStatus: text("review_status").notNull().default("pending"),
  reviewNote: text("review_note").notNull().default(""),
  reviewedByUserId: integer("reviewed_by_user_id"),
  reviewedAt: text("reviewed_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => ({ sourceUnique: uniqueIndex("import_rows_batch_source_unique").on(table.batchId, table.sourceSheet, table.sourceRow, table.recordType, table.currency) }));
