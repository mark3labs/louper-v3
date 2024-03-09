CREATE TABLE `contracts` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`chainId` integer NOT NULL,
	`address` text NOT NULL,
	`name` text NOT NULL,
	`abi` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contracts_id_unique` ON `contracts` (`id`);