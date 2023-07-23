import type { InferModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

import { questStatus } from "@acme/types";

import { Topics } from "../constants";
import { solution } from "./solution";
import { user } from "./user";


export const quest = sqliteTable(
  "quest",
  {
    id: text("id").primaryKey().notNull(),
    title: text("title"),
    version: integer("version").notNull().default(1),
    created_at: text("created_at").notNull(),
    topic: text("topics", { enum: Topics }),
    subtopics: text("subtopics"),
    reward: integer("reward", { mode: "number" }).notNull().default(0),
    slots: integer("slots", { mode: "number" }).notNull().default(0),
    creator_id: text("creator_id").notNull(),
    published: integer("published", { mode: "boolean" })
      .notNull()
      .default(false),
    published_at: text("published_at"),
    in_trash: integer("in_trash", { mode: "boolean" }).notNull().default(false),
    deadline: text("deadline"),
    last_updated: text("last_updated"),
    allow_unpublish: integer("allow_unpublish", { mode: "boolean" }),
    solvers_count: integer("solvers_count", { mode: "number" }),
    status: text("status", { enum: questStatus }),
  },
  (works) => ({
    creatorIdx: uniqueIndex("creatorIdx").on(works.creator_id),
    versionIdx: uniqueIndex("versionIdx").on(works.version),
    publishedIdx: uniqueIndex("publishedIdx").on(works.published),
  }),
);
export const questRelations = relations(quest, ({ one, many }) => ({
  creator: one(user, {
    fields: [quest.creator_id],
    references: [user.id],
  }),
  solvers: many(solver),
}));
export const solver = sqliteTable(
  "solver",
  {
    quest_id: text("quest_id")
      .notNull()
      .references(() => quest.id),
    user_id: text("user_id")
      .notNull()
      .references(() => user.id),
    solution_id: text("solution_id"),
  },
  (t) => ({
    pk: primaryKey(t.user_id, t.quest_id),
  }),
);

export const solverRelations = relations(solver, ({ one }) => ({
  quest: one(quest, {
    fields: [solver.quest_id],
    references: [quest.id],
  }),
  user: one(user, {
    fields: [solver.user_id],
    references: [user.id],
  }),
  solution: one(solution, {
    fields: [solver.solution_id],
    references: [solution.id],
  }),
}));

export type Quest = InferModel<typeof quest>;
export const QuestSchema = createInsertSchema(quest);
export const UpdateQuestSchema = QuestSchema.pick({
  title: true,
  topic: true,
  subtopics: true,
  deadline: true,
  slots: true,
  reward: true,
  last_updated: true,
}).required({ last_updated: true });
export type UpdateWork = z.infer<typeof UpdateQuestSchema>;

export const PublishedQuestSchema = QuestSchema.required({
  title: true,
  topic: true,
  subtopic: true,
  deadline: true,
  slots: true,
  reward: true,
});

export type PublishedQuest = z.infer<typeof PublishedQuestSchema>;
