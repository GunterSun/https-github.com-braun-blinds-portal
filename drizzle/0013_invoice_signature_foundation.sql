CREATE TABLE `invoice_versions` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,`order_id` integer NOT NULL,`invoice_number` text NOT NULL,`version` integer NOT NULL,`snapshot_json` text NOT NULL,`document_sha256` text NOT NULL,`created_by` integer NOT NULL,`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoice_versions_invoice_version_unique` ON `invoice_versions` (`invoice_number`,`version`);
--> statement-breakpoint
CREATE TABLE `invoice_signature_requests` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,`invoice_version_id` integer NOT NULL,`invoice_number` text NOT NULL,`signer_email` text NOT NULL,`token_hash` text NOT NULL,`idempotency_key` text NOT NULL,`status` text DEFAULT 'pending' NOT NULL,`expires_at` text NOT NULL,`created_by` integer NOT NULL,`viewed_at` text,`signed_at` text,`declined_at` text,`revoked_at` text,`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoice_signature_requests_token_hash_unique` ON `invoice_signature_requests` (`token_hash`);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoice_signature_requests_idempotency_key_unique` ON `invoice_signature_requests` (`idempotency_key`);
--> statement-breakpoint
CREATE INDEX `invoice_signature_requests_invoice_status_idx` ON `invoice_signature_requests` (`invoice_number`,`status`);
--> statement-breakpoint
CREATE TABLE `invoice_signature_events` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,`request_id` integer NOT NULL,`event_type` text NOT NULL,`actor_type` text NOT NULL,`actor_id` text DEFAULT '' NOT NULL,`metadata_json` text DEFAULT '{}' NOT NULL,`occurred_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE INDEX `invoice_signature_events_request_idx` ON `invoice_signature_events` (`request_id`);
--> statement-breakpoint
PRAGMA optimize;
