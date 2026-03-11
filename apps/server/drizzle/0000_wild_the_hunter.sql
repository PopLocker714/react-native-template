CREATE TABLE `bundles` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`should_force_update` integer NOT NULL,
	`enabled` integer NOT NULL,
	`file_hash` text NOT NULL,
	`git_commit_hash` text,
	`message` text,
	`channel` text NOT NULL,
	`storage_uri` text NOT NULL,
	`target_app_version` text,
	`fingerprint_hash` text,
	`metadata` blob NOT NULL
);
--> statement-breakpoint
CREATE TABLE `private_hot_updater_settings` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`version` text(255) DEFAULT '0.21.0' NOT NULL
);
