ALTER TABLE `customers` ADD `customer_number` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_customer_number_unique` ON `customers` (`customer_number`);
--> statement-breakpoint
ALTER TABLE `customers` ADD `customer_type` text DEFAULT 'retail' NOT NULL;
--> statement-breakpoint
ALTER TABLE `customers` ADD `display_name` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `customers` ADD `legal_name` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `customers` ADD `source` text DEFAULT 'manual' NOT NULL;
--> statement-breakpoint
ALTER TABLE `customers` ADD `sales_owner_user_id` integer;
--> statement-breakpoint
ALTER TABLE `customers` ADD `default_discount_type` text DEFAULT 'percent' NOT NULL;
--> statement-breakpoint
ALTER TABLE `customers` ADD `default_discount_value` real DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `customers` ADD `payment_terms` text DEFAULT 'due_on_receipt' NOT NULL;
--> statement-breakpoint
ALTER TABLE `customers` ADD `tax_exempt_status` text DEFAULT 'taxable' NOT NULL;
--> statement-breakpoint
ALTER TABLE `customers` ADD `tax_document_id` text;
--> statement-breakpoint
ALTER TABLE `customers` ADD `preferred_language` text DEFAULT 'en' NOT NULL;
--> statement-breakpoint
ALTER TABLE `customers` ADD `first_order_at` text;
--> statement-breakpoint
ALTER TABLE `customers` ADD `last_order_at` text;
--> statement-breakpoint
ALTER TABLE `customers` ADD `archived_at` text;
--> statement-breakpoint
CREATE TABLE `customer_sequences` (`id` integer PRIMARY KEY NOT NULL, `last_number` integer DEFAULT 0 NOT NULL, `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE TABLE `customer_contacts` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `customer_id` integer NOT NULL, `name` text NOT NULL, `title` text DEFAULT '' NOT NULL, `phone_raw` text DEFAULT '' NOT NULL, `phone_normalized` text DEFAULT '' NOT NULL, `email_raw` text DEFAULT '' NOT NULL, `email_normalized` text DEFAULT '' NOT NULL, `preferred_channel` text DEFAULT 'email' NOT NULL, `is_primary` integer DEFAULT false NOT NULL, `customer_visible` integer DEFAULT true NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL, `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE INDEX `customer_contacts_customer_id_idx` ON `customer_contacts` (`customer_id`);
--> statement-breakpoint
CREATE INDEX `customer_contacts_phone_idx` ON `customer_contacts` (`phone_normalized`);
--> statement-breakpoint
CREATE INDEX `customer_contacts_email_idx` ON `customer_contacts` (`email_normalized`);
--> statement-breakpoint
CREATE UNIQUE INDEX `customer_contacts_one_primary` ON `customer_contacts` (`customer_id`) WHERE `is_primary` = 1;
--> statement-breakpoint
CREATE TABLE `customer_addresses` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `customer_id` integer NOT NULL, `address_type` text NOT NULL, `label` text DEFAULT '' NOT NULL, `line1` text NOT NULL, `line2` text DEFAULT '' NOT NULL, `city` text NOT NULL, `state` text DEFAULT '' NOT NULL, `postal_code` text DEFAULT '' NOT NULL, `country` text DEFAULT 'US' NOT NULL, `normalized_address_hash` text DEFAULT '' NOT NULL, `access_notes` text DEFAULT '' NOT NULL, `is_default` integer DEFAULT false NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL, `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE INDEX `customer_addresses_customer_id_idx` ON `customer_addresses` (`customer_id`);
--> statement-breakpoint
CREATE INDEX `customer_addresses_hash_idx` ON `customer_addresses` (`normalized_address_hash`);
--> statement-breakpoint
CREATE UNIQUE INDEX `customer_addresses_one_default_per_type` ON `customer_addresses` (`customer_id`, `address_type`) WHERE `is_default` = 1;
