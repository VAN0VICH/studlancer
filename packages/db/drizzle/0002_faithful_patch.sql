CREATE TABLE `guild` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`emblem` text,
	`specialty` text,
	`rank` integer NOT NULL,
	`founder_id` text NOT NULL,
	`experience` integer NOT NULL,
	`about` text,
	`quests_solved` integer DEFAULT 0 NOT NULL,
	`rewarded` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`founder_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `guild_member` (
	`user_id` text NOT NULL,
	`guild_id` text,
	`rank` text,
	`joined_at` text NOT NULL,
	PRIMARY KEY(`guild_id`, `user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`guild_id`) REFERENCES `guild`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP INDEX IF EXISTS `creatorIdx`;--> statement-breakpoint
DROP INDEX IF EXISTS `versionIdx`;--> statement-breakpoint
DROP INDEX IF EXISTS `publishedIdx`;--> statement-breakpoint
CREATE UNIQUE INDEX `nameIdx` ON `guild` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `creatorIdx1` ON `post` (`creator_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `versionIdx1` ON `post` (`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `publishedIdx1` ON `post` (`published`);--> statement-breakpoint
CREATE UNIQUE INDEX `creatorIdx2` ON `solution` (`creator_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `versionIdx2` ON `solution` (`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `publishedIdx2` ON `solution` (`published`);--> statement-breakpoint
/*
 SQLite does not support "Creating foreign key on existing column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/