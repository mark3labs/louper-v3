CREATE TABLE `diamonds` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`network` text NOT NULL,
	`address` text NOT NULL,
	`name` text NOT NULL,
	`visits` integer DEFAULT 0 NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `diamonds_id_unique` ON `diamonds` (`id`);