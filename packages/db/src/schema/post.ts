import type { InferModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

import { PostDestination, Topics } from "../constants";
import { collaborator } from "./solution";
import { user } from "./user";

export const post = sqliteTable(
  "post",
  {
    id: text("id").primaryKey().notNull(),
    title: text("title"),
    version: integer("version").notNull().default(1),
    created_at: text("created_at").notNull(),
    topic: text("topics", { enum: Topics }),
    subtopics: text("subtopics"),
    creator_id: text("creator_id").notNull(),
    published: integer("published", { mode: "boolean" })
      .notNull()
      .default(false),
    published_at: text("published_at"),
    in_trash: integer("in_trash", { mode: "boolean" }).notNull().default(false),
    last_updated: text("last_updated"),
    destination: text("destination", { enum: PostDestination }),
    like: integer("like", { mode: "number" }).default(0),
  },
  (works) => ({
    creatorIdx: uniqueIndex("creatorIdx").on(works.creator_id),
    versionIdx: uniqueIndex("versionIdx").on(works.version),
    publishedIdx: uniqueIndex("publishedIdx").on(works.published),
  }),
);
export const postRelations = relations(post, ({ one, many }) => ({
  creator: one(user, {
    fields: [post.creator_id],
    references: [user.id],
  }),
  collaborators: many(collaborator),
}));
export type Post = InferModel<typeof post>;
export const PostSchema = createInsertSchema(post);
