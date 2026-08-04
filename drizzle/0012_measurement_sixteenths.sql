ALTER TABLE `order_items` ADD `width_sixteenths` integer;
--> statement-breakpoint
ALTER TABLE `order_items` ADD `height_sixteenths` integer;
--> statement-breakpoint
ALTER TABLE `order_items` ADD `width_source_value` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `order_items` ADD `height_source_value` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `order_items` ADD `source_unit` text DEFAULT 'in' NOT NULL;
--> statement-breakpoint
UPDATE `order_items` SET `width_sixteenths`=ROUND(`width`*16),`width_source_value`=CAST(`width` AS text) WHERE `width` IS NOT NULL;
--> statement-breakpoint
UPDATE `order_items` SET `height_sixteenths`=ROUND(`height`*16),`height_source_value`=CAST(`height` AS text) WHERE `height` IS NOT NULL;
