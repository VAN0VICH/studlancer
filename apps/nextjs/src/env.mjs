import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app isn't
   * built with invalid env vars.
   */
  server: {
    CLERK_SECRET_KEY: z.string(),
    UPLOADTHING_SECRET: z.string(),
    UPSTASH_REDIS_URL:z.string(),
    UPSTASH_REDIS_TOKEN:z.string(),
  },
  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_REPLICACHE_KEY: z.string(),
    NEXT_PUBLIC_YJS_PARTYKIT_URL:z.string()
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  runtimeEnv: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_REPLICACHE_KEY: process.env.NEXT_PUBLIC_REPLICACHE_KEY,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    UPSTASH_REDIS_TOKEN:process.env.UPSTASH_REDIS_TOKEN,
    UPSTASH_REDIS_URL:process.env.UPSTASH_REDIS_URL,
    NEXT_PUBLIC_YJS_PARTYKIT_URL:process.env.NEXT_PUBLIC_YJS_PARTYKIT_URL
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
