import { relations, type InferModel } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

import { GuildRankings, Topics } from "@acme/types";

import { ADMIN, USER } from "../constants";
import { user } from "./user";

export const guild = sqliteTable(
  "guild",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    version: integer("version").notNull().default(1),
    created_at: text("created_at").notNull(),
    emblem: text("emblem"),
    specialty: text("specialty", { enum: Topics }),
    rank: integer("rank", { mode: "number" }).notNull(),
    founder_id: text("founder_id")
      .notNull()
      .references(() => user.id),
    experience: integer("experience", { mode: "number" }).notNull(),
    about: text("about"),
    quests_solved: integer("quests_solved", { mode: "number" })
      .notNull()
      .default(0),
    rewarded: integer("rewarded", { mode: "number" }).notNull().default(0),
  },
  (guild) => ({
    nameIdx: uniqueIndex("nameIdx").on(guild.name),
  }),
);
export const guild_member = sqliteTable(
  "guild_member",
  {
    user_id: text("user_id")
      .notNull()
      .references(() => user.id),
    guild_id: text("guild_id").references(() => guild.id),
    rank: text("rank", { enum: GuildRankings }),
    joined_at: text("joined_at").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey(table.user_id, table.guild_id),
    };
  },
);

export const guildRelations = relations(guild, ({ one, many }) => ({
  founder: one(user, {
    fields: [guild.founder_id],
    references: [user.id],
  }),

  members: many(guild_member),
}));
export const guildMemberRelations = relations(
  guild_member,
  ({ one, many }) => ({
    member: one(user, {
      fields: [guild_member.user_id],
      references: [user.id],
    }),
    guild: one(guild, {
      fields: [guild_member.guild_id],
      references: [guild.id],
    }),
  }),
);
