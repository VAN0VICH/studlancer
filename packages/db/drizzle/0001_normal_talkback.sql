/*
 SQLite does not support "Set default to column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
/*
 SQLite does not support "Set not null to column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
ALTER TABLE post ADD `type` text NOT NULL;--> statement-breakpoint
ALTER TABLE post ADD `text_content` text;--> statement-breakpoint
ALTER TABLE quest ADD `type` text NOT NULL;--> statement-breakpoint
ALTER TABLE quest ADD `text_content` text;--> statement-breakpoint
ALTER TABLE quest ADD `winner_id` text;--> statement-breakpoint
ALTER TABLE solution ADD `type` text NOT NULL;--> statement-breakpoint
ALTER TABLE solution ADD `text_content` text;