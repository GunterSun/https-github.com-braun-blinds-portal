CREATE TABLE `order_sequences` (
  `id` integer PRIMARY KEY NOT NULL,
  `last_number` integer DEFAULT 0 NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `order_number` text NOT NULL UNIQUE,
  `external_prefix` text DEFAULT '' NOT NULL,
  `customer_id` integer NOT NULL,
  `project_name` text DEFAULT '' NOT NULL,
  `project_address` text DEFAULT '' NOT NULL,
  `sales_user_id` integer,
  `status` text DEFAULT 'draft' NOT NULL,
  `payment_status` text DEFAULT 'unpaid' NOT NULL,
  `currency` text DEFAULT 'USD' NOT NULL,
  `subtotal` real DEFAULT 0 NOT NULL,
  `discount_amount` real DEFAULT 0 NOT NULL,
  `tax_amount` real DEFAULT 0 NOT NULL,
  `installation_fee` real DEFAULT 0 NOT NULL,
  `shipping_charge` real DEFAULT 0 NOT NULL,
  `grand_total` real DEFAULT 0 NOT NULL,
  `amount_paid` real DEFAULT 0 NOT NULL,
  `balance_due` real DEFAULT 0 NOT NULL,
  `confirmed_at` text,
  `completed_at` text,
  `archived_at` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_items` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `order_id` integer NOT NULL,
  `source_calculator` text DEFAULT 'manual' NOT NULL,
  `product_type` text NOT NULL,
  `style` text DEFAULT '' NOT NULL,
  `fabric_code` text DEFAULT '' NOT NULL,
  `width` real,
  `height` real,
  `quantity` integer DEFAULT 1 NOT NULL,
  `mount_type` text DEFAULT '' NOT NULL,
  `control_type` text DEFAULT '' NOT NULL,
  `lining` text DEFAULT '' NOT NULL,
  `unit_price` real DEFAULT 0 NOT NULL,
  `line_total` real DEFAULT 0 NOT NULL,
  `cost_estimate_usd` real,
  `notes` text DEFAULT '' NOT NULL,
  `sort_order` integer DEFAULT 0 NOT NULL,
  `import_batch_id` integer,
  `import_row_id` integer,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_items_import_row_unique` ON `order_items` (`import_row_id`);
--> statement-breakpoint
CREATE TABLE `unified_order_assignments` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `order_id` integer NOT NULL,
  `user_id` integer NOT NULL,
  `access_level` text DEFAULT 'view' NOT NULL,
  `assigned_by_user_id` integer,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unified_order_assignments_order_user_unique` ON `unified_order_assignments` (`order_id`,`user_id`);
