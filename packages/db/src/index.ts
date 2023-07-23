import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { env } from "../env";
import { replicache_client } from "./schema/replicache-client";
import { user } from "./schema/user";
import { solver, quest } from "./schema/quest";
import {post } from "./schema/post"
import {solution } from "./schema/solution"

export * from "./schema/quest";
export * from "./schema/Post";
export * from "./schema/Solution";
export * from "./schema/user";
export * from "./types";
export * from "./query/user";
export * from "./query/workspace";
export * from "./query/common";

const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, {
  logger: true,
  schema: { user, solver, quest, replicache_client, post, solution },
});
