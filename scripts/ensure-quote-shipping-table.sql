-- Z-Series / Quote Shipping migration
-- Safe for existing databases: old Quote versions implicitly remain shipping = 0 when no row exists.
CREATE TABLE IF NOT EXISTS customer_quote_shipping (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_version_id INTEGER NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  label_zh TEXT NOT NULL DEFAULT '运输费',
  label_en TEXT NOT NULL DEFAULT 'Shipping',
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS customer_quote_shipping_quote_version_unique
  ON customer_quote_shipping (quote_version_id);
