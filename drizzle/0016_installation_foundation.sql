CREATE TABLE `installation_jobs` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,`order_id` integer NOT NULL,`status` text DEFAULT 'scheduled' NOT NULL,`scheduled_start` text NOT NULL,`scheduled_end` text NOT NULL,`timezone` text DEFAULT 'America/Los_Angeles' NOT NULL,`address_snapshot` text NOT NULL,`contact_snapshot` text NOT NULL,`instructions` text DEFAULT '' NOT NULL,`balance_due_snapshot` real DEFAULT 0 NOT NULL,`job_type` text DEFAULT 'initial' NOT NULL,`version` integer DEFAULT 1 NOT NULL,`idempotency_key` text NOT NULL UNIQUE,`created_by` integer NOT NULL,`updated_by` integer NOT NULL,`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE INDEX `installation_jobs_schedule_idx` ON `installation_jobs` (`scheduled_start`,`status`);
--> statement-breakpoint
CREATE INDEX `installation_jobs_order_idx` ON `installation_jobs` (`order_id`);
--> statement-breakpoint
CREATE TABLE `installation_assignments` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,`installation_job_id` integer NOT NULL,`installer_user_id` integer NOT NULL,`role` text DEFAULT 'lead' NOT NULL,`accepted_at` text,`started_at` text,`completed_at` text,`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `installation_assignments_job_installer_unique` ON `installation_assignments` (`installation_job_id`,`installer_user_id`);
--> statement-breakpoint
CREATE INDEX `installation_assignments_installer_idx` ON `installation_assignments` (`installer_user_id`);
--> statement-breakpoint
CREATE TABLE `installation_status_events` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,`installation_job_id` integer NOT NULL,`from_status` text NOT NULL,`to_status` text NOT NULL,`actor_user_id` integer NOT NULL,`source` text DEFAULT 'portal' NOT NULL,`note` text DEFAULT '' NOT NULL,`idempotency_key` text NOT NULL UNIQUE,`occurred_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL);
--> statement-breakpoint
CREATE INDEX `installation_status_events_job_idx` ON `installation_status_events` (`installation_job_id`);
