import type { Config } from "drizzle-kit";

import { env } from "./env";

export default {
  schema: "./src/schema/*.ts",
  driver: "turso",
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
  verbose: true,
  strict: true,
  out: "./drizzle",
} satisfies Config;
