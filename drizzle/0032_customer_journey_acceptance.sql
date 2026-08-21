CREATE TABLE `customer_journey_acceptances` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`property_id` integer NOT NULL,
	`evidence_sha256` text NOT NULL,
	`evidence_json` text NOT NULL,
	`certified_by` integer NOT NULL,
	`certified_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customer_journey_acceptances_evidence_sha256_unique` ON `customer_journey_acceptances` (`evidence_sha256`);
--> statement-breakpoint
CREATE INDEX `customer_journey_acceptances_property_idx` ON `customer_journey_acceptances` (`property_id`,`certified_at`);
