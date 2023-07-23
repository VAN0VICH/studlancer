import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const replicache_client = sqliteTable(
  "replicache_client",
  {
    id: text("id").primaryKey().notNull(),

    clientGroupID: text("clientGroupID").notNull(),
    version: integer("version", { mode: "number" }).notNull(),
    lastMutationID: integer("lastMutationID", { mode: "number" }).notNull(),
  },
  (client) => ({
    groupIdIdx: uniqueIndex("groupIdIdx").on(client.clientGroupID),
    versionIndex: uniqueIndex("versionIndex").on(client.version),
  }),
);
