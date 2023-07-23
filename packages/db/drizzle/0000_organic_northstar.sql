CREATE TABLE `post` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`topics` text,
	`subtopics` text,
	`creator_id` text NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`published_at` text,
	`in_trash` integer DEFAULT false NOT NULL,
	`last_updated` text,
	`destination` text,
	`like` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `quest` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`topics` text,
	`subtopics` text,
	`reward` integer DEFAULT 0 NOT NULL,
	`slots` integer DEFAULT 0 NOT NULL,
	`creator_id` text NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`published_at` text,
	`in_trash` integer DEFAULT false NOT NULL,
	`deadline` text,
	`last_updated` text,
	`allow_unpublish` integer,
	`solvers_count` integer,
	`status` text
);
--> statement-breakpoint
CREATE TABLE `solver` (
	`quest_id` text NOT NULL,
	`user_id` text NOT NULL,
	`solution_id` text,
	PRIMARY KEY(`quest_id`, `user_id`),
	FOREIGN KEY (`quest_id`) REFERENCES `quest`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `replicache_client` (
	`id` text PRIMARY KEY NOT NULL,
	`clientGroupID` text NOT NULL,
	`version` integer NOT NULL,
	`lastMutationID` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `collaborator` (
	`collaborator_id` text PRIMARY KEY NOT NULL,
	`solution_id` text,
	`post_id` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`solution_id`) REFERENCES `solution`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`post_id`) REFERENCES `post`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `solution` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`creator_id` text NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`published_at` text,
	`in_trash` integer DEFAULT false NOT NULL,
	`last_updated` text,
	`solution_id` text,
	`status` text
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`profile` text,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`level` integer NOT NULL,
	`experience` integer NOT NULL,
	`about` text,
	`topics` text,
	`subtopics` text,
	`guild_id` text,
	`quests_solved` integer DEFAULT 0 NOT NULL,
	`rewarded` integer DEFAULT 0 NOT NULL,
	`links` text,
	`verified` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `creatorIdx` ON `post` (`creator_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `versionIdx` ON `post` (`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `publishedIdx` ON `post` (`published`);--> statement-breakpoint
CREATE UNIQUE INDEX `creatorIdx` ON `quest` (`creator_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `versionIdx` ON `quest` (`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `publishedIdx` ON `quest` (`published`);--> statement-breakpoint
CREATE UNIQUE INDEX `groupIdIdx` ON `replicache_client` (`clientGroupID`);--> statement-breakpoint
CREATE UNIQUE INDEX `versionIndex` ON `replicache_client` (`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `creatorIdx` ON `solution` (`creator_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `versionIdx` ON `solution` (`version`);--> statement-breakpoint
CREATE UNIQUE INDEX `publishedIdx` ON `solution` (`published`);--> statement-breakpoint
CREATE UNIQUE INDEX `usernameIdx` ON `user` (`username`);