CREATE TABLE `business_ledger_entries` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `import_batch_id` integer NOT NULL,
  `import_row_id` integer NOT NULL UNIQUE,
  `record_type` text NOT NULL,
  `order_id` integer,
  `order_number` text DEFAULT '' NOT NULL,
  `counterparty` text DEFAULT '' NOT NULL,
  `project` text DEFAULT '' NOT NULL,
  `description` text DEFAULT '' NOT NULL,
  `amount` real NOT NULL,
  `currency` text NOT NULL,
  `business_status` text DEFAULT '' NOT NULL,
  `notes` text DEFAULT '' NOT NULL,
  `source_sheet` text NOT NULL,
  `source_row` integer NOT NULL,
  `created_by_user_id` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `business_ledger_entries_import_row_id_unique` ON `business_ledger_entries` (`import_row_id`);
--> statement-breakpoint
CREATE INDEX `business_ledger_entries_batch_idx` ON `business_ledger_entries` (`import_batch_id`);
