CREATE TABLE `invoice_sequences` (
	`id` integer PRIMARY KEY NOT NULL,
	`last_number` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);--> statement-breakpoint
WITH `ranked_invoices` AS (
	SELECT
		`id`,
		ROW_NUMBER() OVER (
			ORDER BY COALESCE(`confirmed_at`, `created_at`), `id`
		) AS `sequence_number`
	FROM `customer_orders`
	WHERE `status` = 'confirmed'
)
UPDATE `customer_orders`
SET `invoice_number` = (
	SELECT printf('%05d', `sequence_number`)
	FROM `ranked_invoices`
	WHERE `ranked_invoices`.`id` = `customer_orders`.`id`
)
WHERE `id` IN (SELECT `id` FROM `ranked_invoices`);--> statement-breakpoint
INSERT INTO `invoice_sequences` (`id`, `last_number`)
VALUES (
	1,
	COALESCE((
		SELECT MAX(CAST(`invoice_number` AS INTEGER))
		FROM `customer_orders`
		WHERE `status` = 'confirmed'
	), 0)
);
