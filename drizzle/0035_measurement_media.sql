CREATE TABLE `measurement_media` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,`property_id` integer NOT NULL,`window_id` integer NOT NULL,`measurement_version_id` integer NOT NULL,`uploaded_by` integer NOT NULL,`object_key` text NOT NULL,`content_type` text NOT NULL,`file_name` text NOT NULL,`size_bytes` integer NOT NULL,`sha256` text NOT NULL,`annotation` text DEFAULT '' NOT NULL,`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
CREATE UNIQUE INDEX `measurement_media_object_key_unique` ON `measurement_media` (`object_key`);
CREATE INDEX `measurement_media_version_idx` ON `measurement_media` (`measurement_version_id`,`created_at`);
CREATE INDEX `measurement_media_window_idx` ON `measurement_media` (`window_id`);
PRAGMA optimize;
