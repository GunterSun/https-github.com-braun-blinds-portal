CREATE TABLE `room_sketch_versions` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,`room_id` integer NOT NULL,`version` integer NOT NULL,`objects_json` text DEFAULT '[]' NOT NULL,`scale_label` text DEFAULT 'not_to_scale' NOT NULL,`internal_notes` text DEFAULT '' NOT NULL,`created_by` integer NOT NULL,`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
CREATE UNIQUE INDEX `room_sketch_versions_room_version_unique` ON `room_sketch_versions` (`room_id`,`version`);
CREATE INDEX `room_sketch_versions_room_idx` ON `room_sketch_versions` (`room_id`);
