import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const orderSequences = sqliteTable("order_sequences", {
  id: integer("id").primaryKey(),
  lastNumber: integer("last_number").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("order_number").notNull().unique(),
  externalPrefix: text("external_prefix").notNull().default(""),
  customerId: integer("customer_id").notNull(),
  projectName: text("project_name").notNull().default(""),
  projectAddress: text("project_address").notNull().default(""),
  salesUserId: integer("sales_user_id"),
  status: text("status").notNull().default("draft"),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  currency: text("currency").notNull().default("USD"),
  subtotal: real("subtotal").notNull().default(0),
  discountAmount: real("discount_amount").notNull().default(0),
  taxAmount: real("tax_amount").notNull().default(0),
  installationFee: real("installation_fee").notNull().default(0),
  shippingCharge: real("shipping_charge").notNull().default(0),
  grandTotal: real("grand_total").notNull().default(0),
  amountPaid: real("amount_paid").notNull().default(0),
  balanceDue: real("balance_due").notNull().default(0),
  confirmedAt: text("confirmed_at"),
  completedAt: text("completed_at"),
  archivedAt: text("archived_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull(),
  sourceCalculator: text("source_calculator").notNull().default("manual"),
  productType: text("product_type").notNull(),
  style: text("style").notNull().default(""),
  fabricCode: text("fabric_code").notNull().default(""),
  width: real("width"),
  height: real("height"),
  quantity: integer("quantity").notNull().default(1),
  mountType: text("mount_type").notNull().default(""),
  controlType: text("control_type").notNull().default(""),
  lining: text("lining").notNull().default(""),
  unitPrice: real("unit_price").notNull().default(0),
  lineTotal: real("line_total").notNull().default(0),
  costEstimateUsd: real("cost_estimate_usd"),
  notes: text("notes").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  importBatchId: integer("import_batch_id"),
  importRowId: integer("import_row_id"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  importRowUnique: uniqueIndex("order_items_import_row_unique").on(table.importRowId),
}));

export const unifiedOrderAssignments = sqliteTable("unified_order_assignments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull(),
  userId: integer("user_id").notNull(),
  accessLevel: text("access_level").notNull().default("view"),
  assignedByUserId: integer("assigned_by_user_id"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  orderUserUnique: uniqueIndex("unified_order_assignments_order_user_unique").on(table.orderId, table.userId),
}));
