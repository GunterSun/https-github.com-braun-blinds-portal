ALTER TABLE `customer_orders` ADD `payment_status` text DEFAULT 'unpaid' NOT NULL;
ALTER TABLE `customer_orders` ADD `amount_paid` real DEFAULT 0 NOT NULL;
ALTER TABLE `customer_orders` ADD `payment_currency` text DEFAULT 'usd' NOT NULL;
ALTER TABLE `customer_orders` ADD `stripe_session_id` text;
ALTER TABLE `customer_orders` ADD `stripe_payment_intent_id` text;
ALTER TABLE `customer_orders` ADD `paid_at` text;
CREATE UNIQUE INDEX `customer_orders_stripe_session_id_unique` ON `customer_orders` (`stripe_session_id`);