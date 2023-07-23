import type { InferModel } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

import { ADMIN, USER } from "../constants";

export const user = sqliteTable(
  "user",
  {
    id: text("id").primaryKey().notNull(),
    username: text("username").notNull(),
    version: integer("version").notNull().default(1),
    created_at: text("created_at").notNull(),
    profile: text("profile"),
    email: text("email").notNull(),
    role: text("role", { enum: [USER, ADMIN] }).notNull(),
    level: integer("level", { mode: "number" }).notNull(),
    experience: integer("experience", { mode: "number" }).notNull(),
    about: text("about"),
    topics: text("topics"),
    subtopics: text("subtopics"),
    guild_id: text("guild_id"),
    quests_solved: integer("quests_solved", { mode: "number" })
      .notNull()
      .default(0),
    rewarded: integer("rewarded", { mode: "number" }).notNull().default(0),
    links: text("links"),
    verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  },
  (users) => ({
    usernameIdx: uniqueIndex("usernameIdx").on(users.username),
  }),
);

export type User = InferModel<typeof user>;
export const InsertUserSchema = createInsertSchema(user);
export type InsertUser = z.infer<typeof InsertUserSchema>;
export const UpdateUserSchema = InsertUserSchema.pick({
  about: true,
  username: true,
  profile: true,
  subtopics: true,
  topics: true,
}).partial();
export type UserUpdates = z.infer<typeof UpdateUserSchema>;
