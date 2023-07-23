import type{ ResultSet } from "@libsql/client";
import type{ ExtractTablesWithRelations } from "drizzle-orm";
import type{ SQLiteTransaction } from "drizzle-orm/sqlite-core";

export type Transaction = SQLiteTransaction<
  "async",
  ResultSet,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;
