import { and, eq, inArray, sql } from "drizzle-orm";
import type { ReadonlyJSONObject } from "replicache";

import type { SpaceID, TableName } from "@acme/types";

import { db, quest, user } from "..";
import type { InsertUser, Quest } from "..";
import { post } from "../schema/post";
import type { Post } from "../schema/post";
import { replicache_client } from "../schema/replicache-client";
import { solution } from "../schema/solution";
import type { Solution } from "../schema/solution";

export const fullItems = ({
  tableName,
  keys,
}: {
  tableName: TableName;
  keys: string[];
}) => {
  if (tableName === "user") {
    const result = db.select().from(user).where(inArray(user.id, keys)).all();
    return result;
  }

  if (tableName === "quest") {
    const result = db.query.quest.findMany({
      where: (quest) => inArray(quest.id, keys),
      with: {
        solvers: true,
        creator: true,
      },
    });
    return result;
  }
  if (tableName === "post") {
    const result = db.query.post.findMany({
      where: (post) => inArray(post.id, keys),
      with: {
        collaborators: true,
        creator: true,
      },
    });
    return result;
  }
  if (tableName === "solution") {
    const result = db.query.solution.findMany({
      where: (solution) => inArray(solution.id, keys),
      with: {
        collaborators: true,
        target_quest: true,
        creator: true,
      },
    });
    return result;
  }
};
export const resetItems = async ({
  userId,
  spaceID,
}: {
  userId: string;
  spaceID: SpaceID;
}): Promise<
  {
    tableName: TableName;
    cvr: (Record<string, any> & { id: string; version: number })[];
  }[]
> => {
  if (spaceID === "user") {
    const userItem = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .get();
    return [{ tableName: "user", cvr: [userItem] }];
  }

  if (spaceID === "workspace") {
    const [quests, solutions, posts] = await Promise.all([
      db.query.quest.findMany({
        where: (quest, { eq }) => eq(quest.creator_id, userId),
        with: {
          solvers: true,
          creator: true,
        },
      }),
      db.query.solution.findMany({
        where: (solution, { eq }) => eq(solution.creator_id, userId),
        with: {
          collaborators: true,
          target_quest: true,
          creator: true,
        },
      }),
      db.query.post.findMany({
        where: (post, { eq }) => eq(post.creator_id, userId),
        with: {
          collaborators: true,
          creator: true,
        },
      }),
    ]);
    return [
      { cvr: quests, tableName: "quest" },
      { cvr: solutions, tableName: "solution" },
      { cvr: posts, tableName: "post" },
    ];
  }
  return [];
};
export const singleItem = ({
  tableName,
  key,
}: {
  tableName: TableName;
  key: string;
}) => {
  if (tableName === "user") {
    const result = db.select().from(user).where(eq(user.id, key)).get();
    return result;
  }

  if (tableName === "quest") {
    const result = db.query.quest.findFirst({
      where: (quest, { eq }) => eq(quest.id, key),
      with: {
        solvers: true,
        creator: true,
      },
    });
    return result;
  }
  if (tableName === "post") {
    const result = db.query.post.findFirst({
      where: (post, { eq }) => eq(post.id, key),
      with: {
        collaborators: true,
        creator: true,
      },
    });
    return result;
  }
  if (tableName === "solution") {
    const result = db.query.solution.findFirst({
      where: (solution, { eq }) => eq(solution.id, key),
      with: {
        collaborators: true,
        target_quest: true,
        creator: true,
      },
    });
    return result;
  }
};
export const insertItem = ({
  tableName,
  value,
}: {
  tableName: TableName;
  value: ReadonlyJSONObject;
}) => {
  if (tableName === "user") {
    return db.insert(user).values(value as InsertUser);
  }
  if (tableName === "quest") {
    return db.insert(quest).values(value as Quest);
  }
  if (tableName === "post") {
    return db.insert(post).values(value as Post);
  }
  if (tableName === "solution") {
    return db.insert(solution).values(value as Solution);
  }
};
export const insertItems = ({
  tableName,
  values,
}: {
  tableName: TableName;
  values: ReadonlyJSONObject[];
}) => {
  if (tableName === "user") {
    const result = db.transaction(async (tx) => {
      for (const value of values) {
        await tx.insert(user).values(value as InsertUser);
      }
    });
    return result;
  }
  if (tableName === "quest") {
    const result = db.transaction(async (tx) => {
      for (const value of values) {
        await tx.insert(quest).values(value as Quest);
      }
    });
    return result;
  }
  if (tableName === "solution") {
    const result = db.transaction(async (tx) => {
      for (const value of values) {
        await tx.insert(solution).values(value as Solution);
      }
    });
    return result;
  }
  if (tableName === "post") {
    const result = db.transaction(async (tx) => {
      for (const value of values) {
        await tx.insert(post).values(value as Post);
      }
    });
    return result;
  }
};
export const updateItemsDB = ({
  tableName,
  items,
}: {
  tableName: TableName;
  items: { key: string; value: ReadonlyJSONObject }[];
}) => {
  if (tableName === "user") {
    const result = db.transaction(async (tx) => {
      for (const { key, value } of items) {
        await tx
          .update(user)
          .set({
            ...value,
            version: sql`${user.version} = ${user.version} + 1`,
          })
          .where(eq(user.id, key));
      }
    });
    return result;
  }
  if (tableName === "quest") {
    const result = db.transaction(async (tx) => {
      for (const { key, value } of items.values()) {
        await tx
          .update(quest)
          .set({
            ...value,
            version: sql`${quest.version} = ${quest.version} + 1`,
          })
          .where(eq(quest.id, key));
      }
    });
    return result;
  }
  if (tableName === "solution") {
    const result = db.transaction(async (tx) => {
      for (const { key, value } of items.values()) {
        await tx
          .update(solution)
          .set({
            ...value,

            version: sql`${solution.version} = ${solution.version} + 1`,
          })
          .where(eq(solution.id, key));
      }
    });
    return result;
  }
  if (tableName === "post") {
    const result = db.transaction(async (tx) => {
      for (const { key, value } of items.values()) {
        await tx
          .update(post)
          .set({
            ...value,
            version: sql`${post.version} = ${post.version} + 1`,
          })
          .where(eq(post.id, key));
      }
    });
    return result;
  }
};
export const deleteItemsDB = ({
  tableName,
  keys,
}: {
  tableName: TableName;
  keys: string[];
}) => {
  if (tableName === "user") {
    const result = db.transaction(async (tx) => {
      for (const key of keys) {
        await tx.delete(user).where(eq(user.id, key));
      }
    });
    return result;
  }
  if (tableName === "quest") {
    const result = db.transaction(async (tx) => {
      for (const key of keys) {
        await tx.delete(quest).where(eq(quest.id, key));
      }
    });
    return result;
  }
  if (tableName === "solution") {
    const result = db.transaction(async (tx) => {
      for (const key of keys) {
        await tx.delete(solution).where(eq(solution.id, key));
      }
    });
    return result;
  }
  if (tableName === "post") {
    const result = db.transaction(async (tx) => {
      for (const key of keys) {
        await tx.delete(post).where(eq(post.id, key));
      }
    });
    return result;
  }
};
//last mutation ids of specific client IDs
export const lastMutationIds = async ({
  clientIDs,
  clientGroupID,
}: {
  clientIDs: string[];
  clientGroupID: string;
}): Promise<Record<string, number>> => {
  const result = await db
    .select({
      id: replicache_client.id,
      version: replicache_client.version,
      lastMutationID: replicache_client.lastMutationID,
    })
    .from(replicache_client)
    .where(
      and(
        inArray(replicache_client.id, clientIDs),
        eq(replicache_client.clientGroupID, clientGroupID),
      ),
    )
    .all();
  const keys = Object.fromEntries(
    result.map((l) => [l.id, l.lastMutationID] as const),
  );
  return keys;
};
export const setLastMutationIdsDB = async ({
  lastMutationIds,
  clientGroupID,
}: {
  lastMutationIds: Record<string, number>;
  clientGroupID: string;
}) => {
  await db.transaction(async (tx) => {
    for (const [key, lastMutationID] of Object.entries(lastMutationIds)) {
      await tx
        .insert(replicache_client)
        .values({ id: key, lastMutationID, version: 1, clientGroupID })
        .onConflictDoUpdate({
          target: replicache_client.id,
          set: {
            version: sql`${replicache_client.version} = ${replicache_client.version} + 1, ${replicache_client.lastMutationID} = ${lastMutationID}`,
          },
        });
    }
  });
};
//last mutation ids of the clients in the client group
export const allLastMutationIDs = async ({
  clientGroupID,
}: {
  clientGroupID: string;
}) => {
  const result = await db
    .select({
      id: replicache_client.id,
      version: replicache_client.version,
      lastMutationID: replicache_client.lastMutationID,
    })
    .from(replicache_client)
    .where(eq(replicache_client.clientGroupID, clientGroupID))
    .all();

  return result;
};
