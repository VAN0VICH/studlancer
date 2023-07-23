/* eslint-disable @typescript-eslint/unbound-method */
import type { InferModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

import { solutionStatus } from "@acme/types";

import { post } from "./post";
import { quest } from "./quest";
import { user } from "./user";

export const Works = ["QUEST", "SOLUTION", "POST"] as const;
export const WorkEnum = z.enum(Works);

export const solution = sqliteTable(
  "solution",
  {
    id: text("id").primaryKey().notNull(),
    title: text("title"),
    version: integer("version").notNull().default(1),
    created_at: text("created_at").notNull(),
    creator_id: text("creator_id").notNull(),
    published: integer("published", { mode: "boolean" })
      .notNull()
      .default(false),
    published_at: text("published_at"),
    in_trash: integer("in_trash", { mode: "boolean" }).notNull().default(false),
    last_updated: text("last_updated"),
    target_quest_id: text("solution_id"),
    status: text("status", { enum: solutionStatus }),
  },
  (solution) => ({
    creatorIdx: uniqueIndex("creatorIdx").on(solution.creator_id),
    versionIdx: uniqueIndex("versionIdx").on(solution.version),
    publishedIdx: uniqueIndex("publishedIdx").on(solution.published),
  }),
);
export const solutionRelations = relations(solution, ({ one, many }) => ({
  creator: one(user, {
    fields: [solution.creator_id],
    references: [user.id],
  }),
  target_quest: one(quest, {
    fields: [solution.target_quest_id],
    references: [quest.id],
  }),
  collaborators: many(collaborator),
}));

export const collaborator = sqliteTable("collaborator", {
  collaborator_id: text("collaborator_id").primaryKey().notNull(),
  solution_id: text("solution_id").references(() => solution.id),

  post_id: text("post_id").references(() => post.id),
  user_id: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const collaboratorRelations = relations(collaborator, ({ one }) => ({
  post: one(post, {
    fields: [collaborator.post_id],
    references: [post.id],
  }),

  solution: one(solution, {
    fields: [collaborator.solution_id],
    references: [solution.id],
  }),
  user: one(user, {
    fields: [collaborator.user_id],
    references: [user.id],
  }),
}));

export type Solution = InferModel<typeof solution>;
export const SolutionSchema = createInsertSchema(solution);
export const UpdateSolutionSchema = SolutionSchema.pick({
  title: true,
  last_updated: true,
}).required({ last_updated: true });
export type UpdateSolution = z.infer<typeof UpdateSolutionSchema>;

export const PublishedSolutionSchema = SolutionSchema.required({
  target_quest_id: true,
});

export type PublishedSolution = z.infer<typeof PublishedSolutionSchema>;
