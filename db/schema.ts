import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

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

export const productCategories = sqliteTable("product_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  parentId: integer("parent_id"),
  code: text("code").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameZh: text("name_zh").notNull(),
  status: text("status").notNull().default("active"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const catalogProducts = sqliteTable("catalog_products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id").notNull(),
  sku: text("sku").notNull().unique(),
  productType: text("product_type").notNull(),
  nameEn: text("name_en").notNull(),
  nameZh: text("name_zh").notNull(),
  descriptionEn: text("description_en").notNull().default(""),
  descriptionZh: text("description_zh").notNull().default(""),
  status: text("status").notNull().default("draft"),
  defaultUom: text("default_uom").notNull().default("each"),
  taxable: integer("taxable", { mode: "boolean" }).notNull().default(true),
  createdBy: integer("created_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  typeStatusIdx: index("catalog_products_type_status_idx").on(table.productType, table.status),
  categoryIdx: index("catalog_products_category_idx").on(table.categoryId),
}));

export const shutterSpecifications = sqliteTable("shutter_specifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull().unique(),
  material: text("material").notNull(),
  panelConfiguration: text("panel_configuration").notNull(),
  louverSize: text("louver_size").notNull(),
  frameType: text("frame_type").notNull(),
  dividerRailRule: text("divider_rail_rule").notNull().default("optional"),
  tiltType: text("tilt_type").notNull().default("traditional"),
  hingeOptionsJson: text("hinge_options_json").notNull().default("[]"),
  shapeOptionsJson: text("shape_options_json").notNull().default("[]"),
  colorOptionsJson: text("color_options_json").notNull().default("[]"),
});

export const blindSpecifications = sqliteTable("blind_specifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull().unique(),
  blindType: text("blind_type").notNull(),
  material: text("material").notNull(),
  orientation: text("orientation").notNull(),
  slatOrVaneSize: text("slat_or_vane_size").notNull(),
  liftType: text("lift_type").notNull(),
  tiltType: text("tilt_type").notNull(),
  valanceOptionsJson: text("valance_options_json").notNull().default("[]"),
  ladderOptionsJson: text("ladder_options_json").notNull().default("[]"),
  colorOptionsJson: text("color_options_json").notNull().default("[]"),
});

export const productAuditEvents = sqliteTable("product_audit_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  detailsJson: text("details_json").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({ productIdx: index("product_audit_events_product_idx").on(table.productId) }));

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

export const invoiceVersions = sqliteTable("invoice_versions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  version: integer("version").notNull(),
  snapshotJson: text("snapshot_json").notNull(),
  documentSha256: text("document_sha256").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({ invoiceVersionUnique: uniqueIndex("invoice_versions_invoice_version_unique").on(table.invoiceNumber, table.version) }));

export const invoiceSignatureRequests = sqliteTable("invoice_signature_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoiceVersionId: integer("invoice_version_id").notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  signerEmail: text("signer_email").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  status: text("status").notNull().default("pending"),
  expiresAt: text("expires_at").notNull(),
  createdBy: integer("created_by").notNull(),
  viewedAt: text("viewed_at"),
  signedAt: text("signed_at"),
  declinedAt: text("declined_at"),
  revokedAt: text("revoked_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({ invoiceStatusIdx: index("invoice_signature_requests_invoice_status_idx").on(table.invoiceNumber, table.status) }));

export const invoiceSignatureEvents = sqliteTable("invoice_signature_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  requestId: integer("request_id").notNull(),
  eventType: text("event_type").notNull(),
  actorType: text("actor_type").notNull(),
  actorId: text("actor_id").notNull().default(""),
  metadataJson: text("metadata_json").notNull().default("{}"),
  occurredAt: text("occurred_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({ requestIdx: index("invoice_signature_events_request_idx").on(table.requestId) }));

export const invoiceSignatures = sqliteTable("invoice_signatures", {
  id: integer("id").primaryKey({ autoIncrement: true }), requestId: integer("request_id").notNull().unique(),
  invoiceVersionId: integer("invoice_version_id").notNull(), signerName: text("signer_name").notNull(), signerEmail: text("signer_email").notNull(),
  signaturePointsJson: text("signature_points_json").notNull(), consentTextVersion: text("consent_text_version").notNull(),
  signedAtUtc: text("signed_at_utc").notNull(), timezone: text("timezone").notNull(), documentSha256: text("document_sha256").notNull(),
  verificationCode: text("verification_code").notNull().unique(), ipAddressHash: text("ip_address_hash").notNull().default(""),
  userAgentHash: text("user_agent_hash").notNull().default(""), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
