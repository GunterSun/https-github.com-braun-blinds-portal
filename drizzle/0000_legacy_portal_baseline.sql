CREATE TABLE `customers` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `email` text NOT NULL,
  `username` text,
  `password_hash` text,
  `password_salt` text,
  `company_name` text DEFAULT '' NOT NULL,
  `contact_name` text DEFAULT '' NOT NULL,
  `phone` text DEFAULT '' NOT NULL,
  `password_encrypted` text,
  `discount_percent` real DEFAULT 0 NOT NULL,
  `status` text DEFAULT 'pending' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_email_unique` ON `customers` (`email`);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_username_unique` ON `customers` (`username`);
--> statement-breakpoint
CREATE TABLE `customer_sessions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `customer_id` integer NOT NULL,
  `token_hash` text NOT NULL,
  `expires_at` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customer_sessions_token_hash_unique` ON `customer_sessions` (`token_hash`);
--> statement-breakpoint
CREATE TABLE `quotes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `quote_number` text NOT NULL,
  `customer_email` text NOT NULL,
  `project_name` text DEFAULT '' NOT NULL,
  `product` text NOT NULL,
  `style` text DEFAULT '' NOT NULL,
  `fabric_group` text DEFAULT '' NOT NULL,
  `width` real NOT NULL,
  `height` real NOT NULL,
  `quantity` integer DEFAULT 1 NOT NULL,
  `mount` text DEFAULT 'Inside' NOT NULL,
  `control` text DEFAULT 'Cordless' NOT NULL,
  `lining` text DEFAULT 'Privacy' NOT NULL,
  `retail_total` real NOT NULL,
  `wholesale_total` real NOT NULL,
  `discount_percent` real NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quotes_quote_number_unique` ON `quotes` (`quote_number`);
--> statement-breakpoint
CREATE TABLE `customer_orders` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `order_number` text NOT NULL,
  `customer_email` text NOT NULL,
  `project_name` text DEFAULT '' NOT NULL,
  `items_json` text NOT NULL,
  `retail_total` real NOT NULL,
  `wholesale_total` real NOT NULL,
  `discount_percent` real NOT NULL,
  `status` text DEFAULT 'draft' NOT NULL,
  `invoice_number` text,
  `confirmed_at` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customer_orders_order_number_unique` ON `customer_orders` (`order_number`);
--> statement-breakpoint
CREATE TABLE `import_batches` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `batch_key` text NOT NULL,
  `file_name` text NOT NULL,
  `workbook_type` text NOT NULL,
  `file_hash` text NOT NULL,
  `status` text DEFAULT 'preview' NOT NULL,
  `row_count` integer DEFAULT 0 NOT NULL,
  `warning_count` integer DEFAULT 0 NOT NULL,
  `imported_by_user_id` integer,
  `confirmed_at` text,
  `rolled_back_at` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `import_batches_batch_key_unique` ON `import_batches` (`batch_key`);
--> statement-breakpoint
CREATE UNIQUE INDEX `import_batches_file_hash_unique` ON `import_batches` (`file_hash`);
--> statement-breakpoint
CREATE TABLE `import_rows` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `batch_id` integer NOT NULL,
  `source_sheet` text NOT NULL,
  `source_row` integer NOT NULL,
  `record_type` text NOT NULL,
  `order_number` text DEFAULT '' NOT NULL,
  `customer` text DEFAULT '' NOT NULL,
  `project` text DEFAULT '' NOT NULL,
  `product` text DEFAULT '' NOT NULL,
  `amount` real,
  `currency` text,
  `status` text DEFAULT '' NOT NULL,
  `notes` text DEFAULT '' NOT NULL,
  `warnings_json` text DEFAULT '[]' NOT NULL,
  `raw_json` text DEFAULT '[]' NOT NULL,
  `target_entity_type` text,
  `target_entity_id` text,
  `import_status` text DEFAULT 'preview' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `import_rows_batch_source_unique` ON `import_rows` (`batch_id`,`source_sheet`,`source_row`,`record_type`,`currency`);
