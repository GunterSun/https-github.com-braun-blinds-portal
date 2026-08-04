import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const appUsers = sqliteTable("app_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  displayName: text("display_name").notNull().default(""),
  phone: text("phone").notNull().default(""),
  role: text("role").notNull().default("customer"),
  status: text("status").notNull().default("active"),
  customerId: integer("customer_id"),
  lastLoginAt: text("last_login_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const appSessions = sqliteTable("app_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  revokedAt: text("revoked_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  passwordHash: text("password_hash"),
  passwordSalt: text("password_salt"),
  companyName: text("company_name").notNull().default(""),
  contactName: text("contact_name").notNull().default(""),
  phone: text("phone").notNull().default(""),
  customerNumber: text("customer_number").unique(),
  customerType: text("customer_type").notNull().default("retail"),
  displayName: text("display_name").notNull().default(""),
  legalName: text("legal_name").notNull().default(""),
  source: text("source").notNull().default("manual"),
  salesOwnerUserId: integer("sales_owner_user_id"),
  defaultDiscountType: text("default_discount_type").notNull().default("percent"),
  defaultDiscountValue: real("default_discount_value").notNull().default(0),
  paymentTerms: text("payment_terms").notNull().default("due_on_receipt"),
  taxExemptStatus: text("tax_exempt_status").notNull().default("taxable"),
  taxDocumentId: text("tax_document_id"),
  preferredLanguage: text("preferred_language").notNull().default("en"),
  firstOrderAt: text("first_order_at"),
  lastOrderAt: text("last_order_at"),
  archivedAt: text("archived_at"),
  passwordEncrypted: text("password_encrypted"),
  discountPercent: real("discount_percent").notNull().default(0),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const customerSequences = sqliteTable("customer_sequences", {
  id: integer("id").primaryKey(),
  lastNumber: integer("last_number").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const customerContacts = sqliteTable("customer_contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").notNull(),
  name: text("name").notNull(),
  title: text("title").notNull().default(""),
  phoneRaw: text("phone_raw").notNull().default(""),
  phoneNormalized: text("phone_normalized").notNull().default(""),
  emailRaw: text("email_raw").notNull().default(""),
  emailNormalized: text("email_normalized").notNull().default(""),
  preferredChannel: text("preferred_channel").notNull().default("email"),
  isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
  customerVisible: integer("customer_visible", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const customerAddresses = sqliteTable("customer_addresses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").notNull(),
  addressType: text("address_type").notNull(),
  label: text("label").notNull().default(""),
  line1: text("line1").notNull(),
  line2: text("line2").notNull().default(""),
  city: text("city").notNull(),
  state: text("state").notNull().default(""),
  postalCode: text("postal_code").notNull().default(""),
  country: text("country").notNull().default("US"),
  normalizedAddressHash: text("normalized_address_hash").notNull().default(""),
  accessNotes: text("access_notes").notNull().default(""),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const customerSessions = sqliteTable("customer_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const quotes = sqliteTable("quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quoteNumber: text("quote_number").notNull().unique(),
  customerEmail: text("customer_email").notNull(),
  projectName: text("project_name").notNull().default(""),
  product: text("product").notNull(),
  style: text("style").notNull().default(""),
  fabricGroup: text("fabric_group").notNull().default(""),
  width: real("width").notNull(),
  height: real("height").notNull(),
  quantity: integer("quantity").notNull().default(1),
  mount: text("mount").notNull().default("Inside"),
  control: text("control").notNull().default("Cordless"),
  lining: text("lining").notNull().default("Privacy"),
  retailTotal: real("retail_total").notNull(),
  wholesaleTotal: real("wholesale_total").notNull(),
  discountPercent: real("discount_percent").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const customerOrders = sqliteTable("customer_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("order_number").notNull().unique(),
  customerEmail: text("customer_email").notNull(),
  projectName: text("project_name").notNull().default(""),
  itemsJson: text("items_json").notNull(),
  retailTotal: real("retail_total").notNull(),
  wholesaleTotal: real("wholesale_total").notNull(),
  discountPercent: real("discount_percent").notNull(),
  status: text("status").notNull().default("draft"),
  invoiceNumber: text("invoice_number"),
  confirmedAt: text("confirmed_at"),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  amountPaid: real("amount_paid").notNull().default(0),
  paymentCurrency: text("payment_currency").notNull().default("usd"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paidAt: text("paid_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orderAssignments = sqliteTable("order_assignments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull(),
  userId: integer("user_id").notNull(),
  accessLevel: text("access_level").notNull().default("view"),
  assignedByUserId: integer("assigned_by_user_id"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  orderUserUnique: uniqueIndex("order_assignments_order_user_unique").on(table.orderId, table.userId),
}));

export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull().default(""),
  detailsJson: text("details_json").notNull().default("{}"),
  ipAddress: text("ip_address").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const invoiceSequences = sqliteTable("invoice_sequences", {
  id: integer("id").primaryKey(),
  lastNumber: integer("last_number").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
