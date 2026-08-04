CREATE TABLE `product_categories` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `parent_id` integer, `code` text NOT NULL, `name_en` text NOT NULL, `name_zh` text NOT NULL, `status` text DEFAULT 'active' NOT NULL, `sort_order` integer DEFAULT 0 NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_categories_code_unique` ON `product_categories` (`code`);
--> statement-breakpoint
INSERT INTO `product_categories` (`code`,`name_en`,`name_zh`,`sort_order`) VALUES ('shutters','Shutters','百叶窗扇',10),('blinds','Blinds','百叶帘',20),('roman-shades','Roman Shades','罗马帘',30),('drapery','Drapery','布艺窗帘',40),('roller-zebra-cellular','Roller / Zebra / Cellular','卷帘 / 斑马帘 / 蜂巢帘',50),('motors-tracks-hardware','Motors / Tracks / Hardware','电机 / 轨道 / 五金',60),('installation-services','Installation Services','安装服务',70);
--> statement-breakpoint
CREATE TABLE `catalog_products` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `category_id` integer NOT NULL, `sku` text NOT NULL, `product_type` text NOT NULL, `name_en` text NOT NULL, `name_zh` text NOT NULL, `description_en` text DEFAULT '' NOT NULL, `description_zh` text DEFAULT '' NOT NULL, `status` text DEFAULT 'draft' NOT NULL, `default_uom` text DEFAULT 'each' NOT NULL, `taxable` integer DEFAULT true NOT NULL, `created_by` integer NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL, `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `catalog_products_sku_unique` ON `catalog_products` (`sku`);
--> statement-breakpoint
CREATE INDEX `catalog_products_type_status_idx` ON `catalog_products` (`product_type`,`status`);
--> statement-breakpoint
CREATE INDEX `catalog_products_category_idx` ON `catalog_products` (`category_id`);
--> statement-breakpoint
CREATE TABLE `shutter_specifications` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `product_id` integer NOT NULL, `material` text NOT NULL, `panel_configuration` text NOT NULL, `louver_size` text NOT NULL, `frame_type` text NOT NULL, `divider_rail_rule` text DEFAULT 'optional' NOT NULL, `tilt_type` text DEFAULT 'traditional' NOT NULL, `hinge_options_json` text DEFAULT '[]' NOT NULL, `shape_options_json` text DEFAULT '[]' NOT NULL, `color_options_json` text DEFAULT '[]' NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `shutter_specifications_product_id_unique` ON `shutter_specifications` (`product_id`);
--> statement-breakpoint
CREATE TABLE `blind_specifications` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `product_id` integer NOT NULL, `blind_type` text NOT NULL, `material` text NOT NULL, `orientation` text NOT NULL, `slat_or_vane_size` text NOT NULL, `lift_type` text NOT NULL, `tilt_type` text NOT NULL, `valance_options_json` text DEFAULT '[]' NOT NULL, `ladder_options_json` text DEFAULT '[]' NOT NULL, `color_options_json` text DEFAULT '[]' NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `blind_specifications_product_id_unique` ON `blind_specifications` (`product_id`);
--> statement-breakpoint
CREATE TABLE `product_audit_events` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `product_id` integer NOT NULL, `user_id` integer NOT NULL, `action` text NOT NULL, `details_json` text DEFAULT '{}' NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE INDEX `product_audit_events_product_idx` ON `product_audit_events` (`product_id`);
--> statement-breakpoint
PRAGMA optimize;
