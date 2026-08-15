import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * First-class shipping/freight charge for an immutable customer Quote version.
 * Existing Quote versions without a row are treated as shipping = 0.
 * One Quote version can have at most one shipping charge snapshot.
 */
export const customerQuoteShipping = sqliteTable("customer_quote_shipping", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quoteVersionId: integer("quote_version_id").notNull(),
  amount: real("amount").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  labelZh: text("label_zh").notNull().default("运输费"),
  labelEn: text("label_en").notNull().default("Shipping"),
  createdAt: text("created_at").notNull(),
}, (table) => ({
  quoteVersionUnique: uniqueIndex("customer_quote_shipping_quote_version_unique").on(table.quoteVersionId),
}));
