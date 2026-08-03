CREATE TABLE `app_users` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `email` text NOT NULL,
  `username` text,
  `password_hash` text NOT NULL,
  `password_salt` text NOT NULL,
  `display_name` text DEFAULT '' NOT NULL,
  `phone` text DEFAULT '' NOT NULL,
  `role` text DEFAULT 'customer' NOT NULL,
  `status` text DEFAULT 'active' NOT NULL,
  `customer_id` integer,
  `last_login_at` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX `app_users_email_unique` ON `app_users` (`email`);
CREATE UNIQUE INDEX `app_users_username_unique` ON `app_users` (`username`);

CREATE TABLE `app_sessions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL,
  `token_hash` text NOT NULL,
  `expires_at` text NOT NULL,
  `revoked_at` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX `app_sessions_token_hash_unique` ON `app_sessions` (`token_hash`);

CREATE TABLE `order_assignments` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `order_id` integer NOT NULL,
  `user_id` integer NOT NULL,
  `access_level` text DEFAULT 'view' NOT NULL,
  `assigned_by_user_id` integer,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX `order_assignments_order_user_unique` ON `order_assignments` (`order_id`,`user_id`);

CREATE TABLE `audit_logs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer,
  `action` text NOT NULL,
  `entity_type` text NOT NULL,
  `entity_id` text DEFAULT '' NOT NULL,
  `details_json` text DEFAULT '{}' NOT NULL,
  `ip_address` text DEFAULT '' NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
