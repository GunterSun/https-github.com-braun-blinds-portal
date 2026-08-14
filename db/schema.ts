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
  preferredLocale: text("preferred_locale").notNull().default("zh-CN"),
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

export const customerPropertyAccess = sqliteTable("customer_property_access", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  customerId: integer("customer_id").notNull(),
  propertyId: integer("property_id").notNull(),
  accessRole: text("access_role").notNull().default("household"),
  status: text("status").notNull().default("active"),
  grantedBy: integer("granted_by").notNull(),
  grantedAt: text("granted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  revokedBy: integer("revoked_by"),
  revokedAt: text("revoked_at"),
}, table => ({ userPropertyUnique: uniqueIndex("customer_property_access_user_property_unique").on(table.userId, table.propertyId), propertyIdx: index("customer_property_access_property_idx").on(table.propertyId) }));

export const customerInvitations = sqliteTable("customer_invitations", {
  id: integer("id").primaryKey({ autoIncrement: true }), customerId: integer("customer_id").notNull(), propertyId: integer("property_id").notNull(),
  email: text("email").notNull(), phone: text("phone").notNull().default(""), displayName: text("display_name").notNull(), accessRole: text("access_role").notNull().default("household"),
  tokenHash: text("token_hash").notNull().unique(), status: text("status").notNull().default("pending"), expiresAt: text("expires_at").notNull(), invitedBy: integer("invited_by").notNull(), acceptedByUserId: integer("accepted_by_user_id"),
  acceptedAt: text("accepted_at"), revokedAt: text("revoked_at"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => ({ propertyIdx: index("customer_invitations_property_idx").on(table.propertyId) }));

export const customerQuoteVersions = sqliteTable("customer_quote_versions", {
  id: integer("id").primaryKey({ autoIncrement: true }), quoteNumber: text("quote_number").notNull(), version: integer("version").notNull(),
  customerId: integer("customer_id").notNull(), propertyId: integer("property_id").notNull(), handoffId: integer("handoff_id").notNull(),
  status: text("status").notNull().default("issued"), currency: text("currency").notNull().default("USD"), subtotal: real("subtotal").notNull(), discountAmount: real("discount_amount").notNull().default(0), taxAmount: real("tax_amount").notNull().default(0), installationFee: real("installation_fee").notNull().default(0), depositRequired: real("deposit_required").notNull().default(0), total: real("total").notNull(),
  terms: text("terms").notNull().default(""), validUntil: text("valid_until").notNull(), renderingUrlsJson: text("rendering_urls_json").notNull().default("[]"), optionsJson: text("options_json").notNull().default("[]"), selectedOptionIdsJson: text("selected_option_ids_json").notNull().default("[]"),
  sourceSnapshotJson: text("source_snapshot_json").notNull(), documentSha256: text("document_sha256").notNull(), createdBy: integer("created_by").notNull(), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), signedAt: text("signed_at"),
}, table => ({ quoteVersionUnique: uniqueIndex("customer_quote_versions_number_version_unique").on(table.quoteNumber, table.version), handoffIdx: index("customer_quote_versions_handoff_idx").on(table.handoffId), propertyIdx: index("customer_quote_versions_property_idx").on(table.propertyId) }));

export const customerQuoteSignatures = sqliteTable("customer_quote_signatures", {
  id: integer("id").primaryKey({ autoIncrement: true }), quoteVersionId: integer("quote_version_id").notNull().unique(), userId: integer("user_id").notNull(), printedName: text("printed_name").notNull(), timezone: text("timezone").notNull(), disclaimerVersion: text("disclaimer_version").notNull(), signatureText: text("signature_text").notNull(), signedDocumentSha256: text("signed_document_sha256").notNull(), ipAddressHash: text("ip_address_hash").notNull(), userAgentHash: text("user_agent_hash").notNull(), idempotencyKey: text("idempotency_key").notNull().unique(), signedAt: text("signed_at").notNull(),
}, table => ({ userIdx: index("customer_quote_signatures_user_idx").on(table.userId) }));

export const customerBillingInvoices = sqliteTable("customer_billing_invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }), invoiceNumber: text("invoice_number").notNull().unique(), quoteVersionId: integer("quote_version_id").notNull(), customerId: integer("customer_id").notNull(), propertyId: integer("property_id").notNull(), version: integer("version").notNull().default(1), currency: text("currency").notNull(), total: real("total").notNull(), depositRequired: real("deposit_required").notNull().default(0), dueDate: text("due_date").notNull(), status: text("status").notNull().default("issued"), customerSnapshotJson: text("customer_snapshot_json").notNull(), documentSha256: text("document_sha256").notNull(), createdBy: integer("created_by").notNull(), issuedAt: text("issued_at").notNull(), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => ({ propertyIdx: index("customer_billing_invoices_property_idx").on(table.propertyId), quoteIdx: index("customer_billing_invoices_quote_idx").on(table.quoteVersionId) }));

export const customerBillingTransactions = sqliteTable("customer_billing_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }), invoiceId: integer("invoice_id").notNull(), transactionType: text("transaction_type").notNull(), status: text("status").notNull(), amount: real("amount").notNull(), currency: text("currency").notNull(), provider: text("provider").notNull(), providerSessionId: text("provider_session_id").unique(), providerTransactionId: text("provider_transaction_id"), providerEventId: text("provider_event_id").unique(), idempotencyKey: text("idempotency_key").notNull().unique(), receiptNumber: text("receipt_number").unique(), occurredAt: text("occurred_at").notNull(), metadataJson: text("metadata_json").notNull().default("{}"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => ({ invoiceIdx: index("customer_billing_transactions_invoice_idx").on(table.invoiceId) }));

export const customerFulfillments=sqliteTable("customer_fulfillments",{id:integer("id").primaryKey({autoIncrement:true}),propertyId:integer("property_id").notNull(),customerId:integer("customer_id").notNull(),reference:text("reference").notNull().unique(),mode:text("mode").notNull(),status:text("status").notNull().default("preparing"),carrier:text("carrier").notNull().default(""),trackingNumber:text("tracking_number").notNull().default(""),trackingUrl:text("tracking_url").notNull().default(""),shippedAt:text("shipped_at"),deliveredAt:text("delivered_at"),pickupReadyAt:text("pickup_ready_at"),pickupAppointmentAt:text("pickup_appointment_at"),warehouseInstructions:text("warehouse_instructions").notNull().default(""),authorizedPickupPerson:text("authorized_pickup_person").notNull().default(""),pickupCodeHash:text("pickup_code_hash"),createdBy:integer("created_by").notNull(),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)},t=>({propertyIdx:index("customer_fulfillments_property_idx").on(t.propertyId)}));
export const customerFulfillmentPackages=sqliteTable("customer_fulfillment_packages",{id:integer("id").primaryKey({autoIncrement:true}),fulfillmentId:integer("fulfillment_id").notNull(),packageCode:text("package_code").notNull(),windowIdsJson:text("window_ids_json").notNull(),windowCodesJson:text("window_codes_json").notNull(),status:text("status").notNull().default("preparing"),releasedAt:text("released_at"),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)},t=>({codeUnique:uniqueIndex("customer_fulfillment_packages_code_unique").on(t.fulfillmentId,t.packageCode),fulfillmentIdx:index("customer_fulfillment_packages_fulfillment_idx").on(t.fulfillmentId)}));
export const customerPickupSignatures=sqliteTable("customer_pickup_signatures",{id:integer("id").primaryKey({autoIncrement:true}),fulfillmentId:integer("fulfillment_id").notNull(),userId:integer("user_id").notNull(),packageIdsJson:text("package_ids_json").notNull(),printedName:text("printed_name").notNull(),signatureText:text("signature_text").notNull(),releasedBy:text("released_by").notNull(),evidenceSha256:text("evidence_sha256").notNull().unique(),idempotencyKey:text("idempotency_key").notNull().unique(),signedAt:text("signed_at").notNull()},t=>({fulfillmentIdx:index("customer_pickup_signatures_fulfillment_idx").on(t.fulfillmentId)}));

export const customerJourneyAcceptances=sqliteTable("customer_journey_acceptances",{id:integer("id").primaryKey({autoIncrement:true}),propertyId:integer("property_id").notNull(),evidenceSha256:text("evidence_sha256").notNull().unique(),evidenceJson:text("evidence_json").notNull(),certifiedBy:integer("certified_by").notNull(),certifiedAt:text("certified_at").notNull().default(sql`CURRENT_TIMESTAMP`)},t=>({propertyIdx:index("customer_journey_acceptances_property_idx").on(t.propertyId,t.certifiedAt)}));

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

export const offlineJobPackages = sqliteTable("offline_job_packages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  installationJobId: integer("installation_job_id").notNull(),
  assignedUserId: integer("assigned_user_id").notNull(),
  state: text("state").notNull().default("online_only"),
  sourceVersion: integer("source_version").notNull(),
  snapshotJson: text("snapshot_json").notNull(),
  snapshotSha256: text("snapshot_sha256").notNull(),
  expiresAt: text("expires_at").notNull(),
  downloadedAt: text("downloaded_at"),
  lastSyncedAt: text("last_synced_at"),
  revokedAt: text("revoked_at"),
  createdBy: integer("created_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => ({
  jobUserUnique: uniqueIndex("offline_job_packages_job_user_unique").on(table.installationJobId, table.assignedUserId),
  assignedIdx: index("offline_job_packages_assigned_idx").on(table.assignedUserId, table.state),
}));

export const offlineSyncOperations = sqliteTable("offline_sync_operations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  packageId: integer("package_id").notNull(),
  assignedUserId: integer("assigned_user_id").notNull(),
  clientOperationId: text("client_operation_id").notNull().unique(),
  operationType: text("operation_type").notNull(),
  baseSourceVersion: integer("base_source_version").notNull(),
  payloadJson: text("payload_json").notNull().default("{}"),
  status: text("status").notNull().default("accepted"),
  conflictJson: text("conflict_json"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, table => ({ packageIdx: index("offline_sync_operations_package_idx").on(table.packageId, table.createdAt) }));

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

export const measureProperties = sqliteTable("measure_properties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id"),
  name: text("name").notNull(),
  address: text("address").notNull().default(""),
  createdBy: integer("created_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({ customerIdx: index("measure_properties_customer_idx").on(table.customerId) }));

export const measureRooms = sqliteTable("measure_rooms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").notNull(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({ propertyIdx: index("measure_rooms_property_idx").on(table.propertyId) }));

export const measureWindows = sqliteTable("measure_windows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  propertyId: integer("property_id").notNull(),
  roomId: integer("room_id").notNull(),
  code: text("code").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({ propertyCodeUnique: uniqueIndex("measure_windows_property_code_unique").on(table.propertyId, table.code), roomIdx: index("measure_windows_room_idx").on(table.roomId) }));

export const measurementVersions = sqliteTable("measurement_versions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  windowId: integer("window_id").notNull(),
  version: integer("version").notNull(),
  productType: text("product_type").notNull(),
  mountType: text("mount_type").notNull().default("inside"),
  controlSide: text("control_side").notNull().default("unspecified"),
  status: text("status").notNull().default("draft"),
  obstacleNotes: text("obstacle_notes").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdBy: integer("created_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({ windowVersionUnique: uniqueIndex("measurement_versions_window_version_unique").on(table.windowId, table.version), windowIdx: index("measurement_versions_window_idx").on(table.windowId) }));

export const measurementValues = sqliteTable("measurement_values", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  measurementVersionId: integer("measurement_version_id").notNull(),
  fieldKey: text("field_key").notNull(),
  totalSixteenths: integer("total_sixteenths").notNull(),
  wholeInches: integer("whole_inches").notNull(),
  fractionSixteenths: integer("fraction_sixteenths").notNull().default(0),
  sourceValue: text("source_value").notNull(),
}, (table) => ({ versionFieldUnique: uniqueIndex("measurement_values_version_field_unique").on(table.measurementVersionId, table.fieldKey) }));

export const roomSketchVersions = sqliteTable("room_sketch_versions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomId: integer("room_id").notNull(),
  version: integer("version").notNull(),
  objectsJson: text("objects_json").notNull().default("[]"),
  scaleLabel: text("scale_label").notNull().default("not_to_scale"),
  internalNotes: text("internal_notes").notNull().default(""),
  createdBy: integer("created_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({ roomVersionUnique: uniqueIndex("room_sketch_versions_room_version_unique").on(table.roomId, table.version), roomIdx: index("room_sketch_versions_room_idx").on(table.roomId) }));

export const wallElevationVersions = sqliteTable("wall_elevation_versions", {
  id: integer("id").primaryKey({ autoIncrement: true }), roomId: integer("room_id").notNull(), version: integer("version").notNull(),
  title: text("title").notNull(), windowIdsJson: text("window_ids_json").notNull(), measurementVersionIdsJson: text("measurement_version_ids_json").notNull(),
  configurationJson: text("configuration_json").notNull().default("{}"), language: text("language").notNull().default("bilingual"),
  createdBy: integer("created_by").notNull(), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, table=>({ roomVersionUnique:uniqueIndex("wall_elevation_versions_room_version_unique").on(table.roomId,table.version),roomIdx:index("wall_elevation_versions_room_idx").on(table.roomId) }));

export const fabrics = sqliteTable("fabrics", {
  id:integer("id").primaryKey({autoIncrement:true}),sku:text("sku").notNull().unique(),status:text("status").notNull().default("draft"),currentVersionId:integer("current_version_id"),createdBy:integer("created_by").notNull(),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
},table=>({statusIdx:index("fabrics_status_idx").on(table.status)}));
export const fabricVersions = sqliteTable("fabric_versions", {
  id:integer("id").primaryKey({autoIncrement:true}),fabricId:integer("fabric_id").notNull(),version:integer("version").notNull(),nameEn:text("name_en").notNull(),nameZh:text("name_zh").notNull(),aliasesJson:text("aliases_json").notNull().default("[]"),collection:text("collection").notNull().default(""),brand:text("brand").notNull().default(""),supplier:text("supplier").notNull().default(""),description:text("description").notNull().default(""),color:text("color").notNull(),pattern:text("pattern").notNull().default(""),composition:text("composition").notNull().default(""),weightGsm:real("weight_gsm"),usableWidthSixteenths:integer("usable_width_sixteenths").notNull(),direction:text("direction").notNull(),railroadable:integer("railroadable",{mode:"boolean"}).notNull().default(false),patternRepeatSixteenths:integer("pattern_repeat_sixteenths").notNull().default(0),matchType:text("match_type").notNull().default("none"),opacityClass:text("opacity_class").notNull(),recommendedFamiliesJson:text("recommended_families_json").notNull().default("[]"),restrictionsJson:text("restrictions_json").notNull().default("[]"),swatchUrl:text("swatch_url").notNull().default(""),sourceFileUrl:text("source_file_url").notNull().default(""),supplierCost:real("supplier_cost"),sellingPriceReference:real("selling_price_reference"),currency:text("currency").notNull().default("USD"),effectiveFrom:text("effective_from").notNull(),effectiveTo:text("effective_to"),createdBy:integer("created_by").notNull(),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
},table=>({fabricVersionUnique:uniqueIndex("fabric_versions_fabric_version_unique").on(table.fabricId,table.version),fabricIdx:index("fabric_versions_fabric_idx").on(table.fabricId)}));
export const fabricInventoryLots=sqliteTable("fabric_inventory_lots",{id:integer("id").primaryKey({autoIncrement:true}),fabricId:integer("fabric_id").notNull(),lotReference:text("lot_reference").notNull(),rollReference:text("roll_reference").notNull().default(""),availableLength:real("available_length").notNull().default(0),uom:text("uom").notNull().default("yard"),status:text("status").notNull().default("available"),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)},table=>({fabricLotUnique:uniqueIndex("fabric_inventory_lots_fabric_lot_unique").on(table.fabricId,table.lotReference,table.rollReference)}));

export const hardwareParts=sqliteTable("hardware_parts",{id:integer("id").primaryKey({autoIncrement:true}),sku:text("sku").notNull().unique(),category:text("category").notNull(),status:text("status").notNull().default("draft"),currentVersionId:integer("current_version_id"),createdBy:integer("created_by").notNull(),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)},table=>({categoryStatusIdx:index("hardware_parts_category_status_idx").on(table.category,table.status)}));
export const hardwareVersions=sqliteTable("hardware_versions",{id:integer("id").primaryKey({autoIncrement:true}),hardwarePartId:integer("hardware_part_id").notNull(),version:integer("version").notNull(),nameEn:text("name_en").notNull(),nameZh:text("name_zh").notNull(),brand:text("brand").notNull().default(""),supplier:text("supplier").notNull().default(""),dimensionsJson:text("dimensions_json").notNull().default("{}"),finishColor:text("finish_color").notNull().default(""),capacity:real("capacity"),clearanceSixteenths:integer("clearance_sixteenths").notNull().default(0),packQuantity:real("pack_quantity").notNull().default(1),unit:text("unit").notNull().default("each"),installationNotes:text("installation_notes").notNull().default(""),motorProtocol:text("motor_protocol").notNull().default(""),voltage:text("voltage").notNull().default(""),controlCompatibilityJson:text("control_compatibility_json").notNull().default("[]"),productCompatibilityJson:text("product_compatibility_json").notNull().default("[]"),supplierCost:real("supplier_cost"),salesReferencePrice:real("sales_reference_price"),currency:text("currency").notNull().default("USD"),effectiveFrom:text("effective_from").notNull(),effectiveTo:text("effective_to"),leadTimeDays:integer("lead_time_days").notNull().default(0),createdBy:integer("created_by").notNull(),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)},table=>({partVersionUnique:uniqueIndex("hardware_versions_part_version_unique").on(table.hardwarePartId,table.version),partIdx:index("hardware_versions_part_idx").on(table.hardwarePartId)}));
export const hardwareCompatibilityRules=sqliteTable("hardware_compatibility_rules",{id:integer("id").primaryKey({autoIncrement:true}),sourcePartId:integer("source_part_id").notNull(),targetPartId:integer("target_part_id").notNull(),relationship:text("relationship").notNull(),reason:text("reason").notNull().default(""),createdBy:integer("created_by").notNull(),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)},table=>({pairUnique:uniqueIndex("hardware_compatibility_pair_unique").on(table.sourcePartId,table.targetPartId,table.relationship)}));
export const designVersions=sqliteTable("design_versions",{id:integer("id").primaryKey({autoIncrement:true}),windowId:integer("window_id").notNull(),version:integer("version").notNull(),measurementVersionId:integer("measurement_version_id").notNull(),fabricVersionIdsJson:text("fabric_version_ids_json").notNull().default("[]"),hardwarePartIdsJson:text("hardware_part_ids_json").notNull().default("[]"),combinationType:text("combination_type").notNull(),configurationJson:text("configuration_json").notNull(),status:text("status").notNull().default("draft"),createdBy:integer("created_by").notNull(),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)},table=>({windowVersionUnique:uniqueIndex("design_versions_window_version_unique").on(table.windowId,table.version),windowIdx:index("design_versions_window_idx").on(table.windowId)}));
export const measureQaRuns=sqliteTable("measure_qa_runs",{id:integer("id").primaryKey({autoIncrement:true}),propertyId:integer("property_id").notNull(),status:text("status").notNull(),errorCount:integer("error_count").notNull(),warningCount:integer("warning_count").notNull(),reviewCount:integer("review_count").notNull(),createdBy:integer("created_by").notNull(),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)},table=>({propertyIdx:index("measure_qa_runs_property_idx").on(table.propertyId)}));
export const measureQaFindings=sqliteTable("measure_qa_findings",{id:integer("id").primaryKey({autoIncrement:true}),qaRunId:integer("qa_run_id").notNull(),windowId:integer("window_id"),measurementVersionId:integer("measurement_version_id"),code:text("code").notNull(),severity:text("severity").notNull(),messageEn:text("message_en").notNull(),messageZh:text("message_zh").notNull(),fieldLink:text("field_link").notNull().default(""),status:text("status").notNull().default("open"),overrideReason:text("override_reason"),overriddenBy:integer("overridden_by"),overriddenAt:text("overridden_at"),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)},table=>({runIdx:index("measure_qa_findings_run_idx").on(table.qaRunId)}));
export const workflowHandoffs=sqliteTable("workflow_handoffs",{id:integer("id").primaryKey({autoIncrement:true}),windowId:integer("window_id").notNull(),measurementVersionId:integer("measurement_version_id").notNull(),designVersionId:integer("design_version_id").notNull(),qaRunId:integer("qa_run_id").notNull(),revision:integer("revision").notNull(),sourceHash:text("source_hash").notNull(),sourceSnapshotJson:text("source_snapshot_json").notNull(),idempotencyKey:text("idempotency_key").notNull().unique(),status:text("status").notNull().default("prepared"),createdBy:integer("created_by").notNull(),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)},table=>({windowRevisionUnique:uniqueIndex("workflow_handoffs_window_revision_unique").on(table.windowId,table.revision),windowIdx:index("workflow_handoffs_window_idx").on(table.windowId)}));
export const workflowArtifacts=sqliteTable("workflow_artifacts",{id:integer("id").primaryKey({autoIncrement:true}),handoffId:integer("handoff_id").notNull(),artifactType:text("artifact_type").notNull(),status:text("status").notNull(),externalRecordId:text("external_record_id"),snapshotJson:text("snapshot_json").notNull(),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)},table=>({handoffTypeUnique:uniqueIndex("workflow_artifacts_handoff_type_unique").on(table.handoffId,table.artifactType)}));
