CREATE TABLE `offline_job_packages` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `installation_job_id` integer NOT NULL,
  `assigned_user_id` integer NOT NULL,
  `state` text DEFAULT 'online_only' NOT NULL,
  `source_version` integer NOT NULL,
  `snapshot_json` text NOT NULL,
  `snapshot_sha256` text NOT NULL,
  `expires_at` text NOT NULL,
  `downloaded_at` text,
  `last_synced_at` text,
  `revoked_at` text,
  `created_by` integer NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX `offline_job_packages_job_user_unique` ON `offline_job_packages` (`installation_job_id`,`assigned_user_id`);
CREATE INDEX `offline_job_packages_assigned_idx` ON `offline_job_packages` (`assigned_user_id`,`state`);
CREATE TABLE `offline_sync_operations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `package_id` integer NOT NULL,
  `assigned_user_id` integer NOT NULL,
  `client_operation_id` text NOT NULL,
  `operation_type` text NOT NULL,
  `base_source_version` integer NOT NULL,
  `payload_json` text DEFAULT '{}' NOT NULL,
  `status` text DEFAULT 'accepted' NOT NULL,
  `conflict_json` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX `offline_sync_operations_client_operation_unique` ON `offline_sync_operations` (`client_operation_id`);
CREATE INDEX `offline_sync_operations_package_idx` ON `offline_sync_operations` (`package_id`,`created_at`);
