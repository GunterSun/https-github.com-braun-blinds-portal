-- REVIEW DRAFT ONLY. Deliberately outside drizzle/: no automatic deployment.
-- Requires PR301 schema. No historical data backfill or existing-table rewrites.
PRAGMA foreign_keys = ON;

CREATE TABLE v5_order_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_system TEXT NOT NULL CHECK(length(trim(source_system)) > 0),
  source_entity TEXT NOT NULL CHECK(length(trim(source_entity)) > 0),
  source_id TEXT NOT NULL CHECK(length(trim(source_id)) > 0),
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  reviewed_by INTEGER NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  review_reason TEXT NOT NULL CHECK(length(trim(review_reason)) > 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source_system, source_entity, source_id)
);
CREATE INDEX v5_order_sources_order_idx ON v5_order_sources(order_id);

-- A window can participate in more than one order (e.g. a later replacement).
-- A line has one window; multiple products/lines may share that window.
CREATE TABLE v5_order_window_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  order_item_id INTEGER NOT NULL UNIQUE REFERENCES order_items(id) ON DELETE RESTRICT,
  window_id INTEGER NOT NULL REFERENCES measure_windows(id) ON DELETE RESTRICT,
  measurement_version_id INTEGER NOT NULL REFERENCES measurement_versions(id) ON DELETE RESTRICT,
  created_by INTEGER NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX v5_order_window_links_order_idx ON v5_order_window_links(order_id);
CREATE INDEX v5_order_window_links_window_idx ON v5_order_window_links(window_id);

-- Polymorphic document identity: existence/ownership must be checked by a typed
-- service inside the same transaction as insertion. This is not itself a FK
-- to each document table, nor permission to issue a production order.
CREATE TABLE v5_order_document_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  document_type TEXT NOT NULL CHECK(document_type IN (
    'customer_quote_version', 'customer_billing_invoice', 'legacy_invoice_version',
    'factory_work_order', 'customer_fulfillment'
  )),
  document_id INTEGER NOT NULL CHECK(document_id > 0),
  linked_by INTEGER NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  link_reason TEXT NOT NULL CHECK(length(trim(link_reason)) > 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_type, document_id)
);
CREATE INDEX v5_order_document_links_order_idx ON v5_order_document_links(order_id);

-- Append-only through the future application service; SQLite alone does not
-- make this table tamper-proof. Access controls and transactional writes matter.
CREATE TABLE v5_order_relation_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  actor_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  action TEXT NOT NULL CHECK(length(trim(action)) > 0),
  reason TEXT NOT NULL CHECK(length(trim(reason)) > 0),
  before_json TEXT NOT NULL CHECK(json_valid(before_json)),
  after_json TEXT NOT NULL CHECK(json_valid(after_json)),
  idempotency_key TEXT NOT NULL UNIQUE CHECK(length(idempotency_key) >= 16),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Reject cross-order lines, cross-customer windows and mismatched measurement
-- versions. Updates of legacy parent records still require service validation.
CREATE TRIGGER v5_order_window_links_insert_guard
BEFORE INSERT ON v5_order_window_links
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM orders o
    JOIN order_items i ON i.order_id = o.id AND i.id = NEW.order_item_id
    JOIN measure_windows w ON w.id = NEW.window_id
    JOIN measure_properties p ON p.id = w.property_id AND p.customer_id = o.customer_id
    JOIN measurement_versions m ON m.id = NEW.measurement_version_id AND m.window_id = w.id
    WHERE o.id = NEW.order_id
  ) THEN RAISE(ABORT, 'Order/window/customer/measurement mismatch') END;
END;

-- Mapping corrections use an explicit, audited service transaction; in-place
-- updates are disallowed in this initial proposal to avoid silent reassignment.
CREATE TRIGGER v5_order_sources_no_update BEFORE UPDATE ON v5_order_sources
BEGIN SELECT RAISE(ABORT, 'Source reassignment requires a reviewed correction'); END;
CREATE TRIGGER v5_order_window_links_no_update BEFORE UPDATE ON v5_order_window_links
BEGIN SELECT RAISE(ABORT, 'Window reassignment requires a reviewed correction'); END;
CREATE TRIGGER v5_order_document_links_no_update BEFORE UPDATE ON v5_order_document_links
BEGIN SELECT RAISE(ABORT, 'Document reassignment requires a reviewed correction'); END;
