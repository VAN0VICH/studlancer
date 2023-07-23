import { eq } from "drizzle-orm";

import { CVRPromise } from "@acme/types";

import { db, user } from "..";

export const userCVR = async (userId: string): CVRPromise => {
  const userCVR = await db
    .select({ id: user.id, version: user.version })
    .from(user)
    .where(eq(user.id, userId))
    .get();
  return [{ cvr: [userCVR], tableName: "user" }];
};
