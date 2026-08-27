CREATE TABLE IF NOT EXISTS `manufacturing_drawings` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `window_id` integer NOT NULL,
  `measurement_version_id` integer NOT NULL,
  `version` integer NOT NULL,
  `status` text DEFAULT 'draft' NOT NULL,
  `source_snapshot_json` text NOT NULL,
  `production_json` text NOT NULL,
  `document_sha256` text NOT NULL,
  `created_by` integer NOT NULL,
  `approved_by` integer,
  `approved_at` text,
  `superseded_by_id` integer,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `manufacturing_drawings_window_version_unique` ON `manufacturing_drawings` (`window_id`,`version`);
CREATE INDEX IF NOT EXISTS `manufacturing_drawings_window_idx` ON `manufacturing_drawings` (`window_id`,`created_at`);
CREATE INDEX IF NOT EXISTS `manufacturing_drawings_measurement_idx` ON `manufacturing_drawings` (`measurement_version_id`);
CREATE INDEX IF NOT EXISTS `manufacturing_drawings_status_idx` ON `manufacturing_drawings` (`status`);

CREATE TABLE IF NOT EXISTS `manufacturing_factory_assignments` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `drawing_id` integer NOT NULL,
  `factory_name` text NOT NULL,
  `factory_code` text DEFAULT '' NOT NULL,
  `scope_json` text DEFAULT '{}' NOT NULL,
  `status` text DEFAULT 'assigned' NOT NULL,
  `notes` text DEFAULT '' NOT NULL,
  `created_by` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS `manufacturing_factory_assignments_drawing_idx` ON `manufacturing_factory_assignments` (`drawing_id`);
CREATE INDEX IF NOT EXISTS `manufacturing_factory_assignments_factory_idx` ON `manufacturing_factory_assignments` (`factory_code`,`status`);
