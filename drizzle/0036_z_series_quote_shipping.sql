CREATE TABLE `customer_quote_shipping` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `quote_version_id` integer NOT NULL,
  `amount` real DEFAULT 0 NOT NULL,
  `currency` text DEFAULT 'USD' NOT NULL,
  `label_zh` text DEFAULT '运输费' NOT NULL,
  `label_en` text DEFAULT 'Shipping' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX `customer_quote_shipping_quote_version_unique` ON `customer_quote_shipping` (`quote_version_id`);
CREATE TABLE `z_series_quote_issuance_operations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `idempotency_key` text NOT NULL,
  `request_sha256` text NOT NULL,
  `quote_version_id` integer,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX `z_series_quote_issuance_operations_key_unique` ON `z_series_quote_issuance_operations` (`idempotency_key`);
PRAGMA optimize;
