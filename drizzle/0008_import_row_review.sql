ALTER TABLE `import_rows` ADD `review_status` text DEFAULT 'pending' NOT NULL;
ALTER TABLE `import_rows` ADD `review_note` text DEFAULT '' NOT NULL;
ALTER TABLE `import_rows` ADD `reviewed_by_user_id` integer;
ALTER TABLE `import_rows` ADD `reviewed_at` text;
