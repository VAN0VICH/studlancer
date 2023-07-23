import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { env } from "../env";
import { post } from "./schema/post";
import { quest, solver } from "./schema/quest";
import { replicache_client } from "./schema/replicache-client";
import { solution } from "./schema/solution";
import { user } from "./schema/user";

export * from "./schema/quest";
export * from "./schema/post";
export * from "./schema/solution";
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
