CREATE TABLE `invoice_signatures` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,`request_id` integer NOT NULL,`invoice_version_id` integer NOT NULL,`signer_name` text NOT NULL,`signer_email` text NOT NULL,`signature_points_json` text NOT NULL,`consent_text_version` text NOT NULL,`signed_at_utc` text NOT NULL,`timezone` text NOT NULL,`document_sha256` text NOT NULL,`verification_code` text NOT NULL,`ip_address_hash` text DEFAULT '' NOT NULL,`user_agent_hash` text DEFAULT '' NOT NULL,`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoice_signatures_request_id_unique` ON `invoice_signatures` (`request_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoice_signatures_verification_code_unique` ON `invoice_signatures` (`verification_code`);
