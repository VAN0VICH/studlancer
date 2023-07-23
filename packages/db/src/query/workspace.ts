import { desc, eq } from "drizzle-orm";

import { CVRPromise, TableName } from "@acme/types";

import { db, quest, user } from "..";
import { post } from "../schema/post";
import { solution } from "../schema/solution";

export const workspaceCVR = async (userId: string): CVRPromise => {
  const quests = db
    .select({ id: quest.id, version: quest.version })
    .from(quest)
    .where(eq(quest.creator_id, userId))
    .orderBy(desc(quest.created_at))
    .all();

  const solutions = db
    .select({ id: solution.id, version: solution.version })
    .from(solution)
    .where(eq(solution.creator_id, userId))
    .orderBy(desc(solution.created_at))
    .all();

  const posts = db
    .select({ id: post.id, version: post.version })
    .from(post)
    .where(eq(post.creator_id, userId))
    .orderBy(desc(post.created_at))
    .all();
  const [questCVR, solutionCVR, postCVR] = await Promise.all([
    quests,
    solutions,
    posts,
  ]);
  return [
    { tableName: "quest", cvr: questCVR },
    { tableName: "solution", cvr: solutionCVR },
    { tableName: "post", cvr: postCVR },
  ];
};
