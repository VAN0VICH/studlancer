import type { PatchOperation, ReadonlyJSONObject } from "replicache";
import { ulid } from "ulid";

import { redis } from "@acme/clients";
import {
  allLastMutationIDs,
  deleteItemsDB,
  fullItems,
  insertItem,
  insertItems,
  lastMutationIds,
  resetItems,
  setLastMutationIdsDB,
  singleItem,
  updateItemsDB,
  userCVR,
  workspaceCVR,
} from "@acme/db";
import { ClientViewRecord, SpaceID, TableName } from "@acme/types";

export const makeCVR = ({
  props,
  cvrId,
}: {
  props: {
    cvr: {
      id: string;
      version: number;
    }[];
  }[];
  cvrId: string | undefined;
}) => {
  const cvr: ClientViewRecord = {
    id: cvrId ? cvrId : ulid(),
    keys: {},
  };

  for (const { cvr: _cvr } of props) {
    for (const item of _cvr) {
      cvr.keys[item.id] = item.version;
    }
  }
  return cvr;
};
export const getPatch = async ({
  spaceID,
  prevCVR,
  userId,
}: {
  spaceID: SpaceID;
  prevCVR: ClientViewRecord | undefined;
  userId: string;
}): Promise<{ patch: PatchOperation[]; cvr: ClientViewRecord }> => {
  if (!prevCVR) {
    const result = await getResetPatch(spaceID, userId);
    return result;
  }
  const clientViewRecord = await getClientViewRecord(spaceID, userId);
  try {
    const nextCVR = makeCVR({
      props: clientViewRecord,
      cvrId: prevCVR.id,
    });

    const putKeys: Map<TableName, string[]> = new Map();
    const delKeys = [];
    for (const { cvr, tableName } of clientViewRecord) {
      const keys = putKeys.get(tableName) ?? [];
      for (const { id, version } of cvr) {
        const prevVersion = prevCVR.keys[id];
        if (prevVersion === undefined || prevVersion < version) {
          keys.push(id);
        }
      }
      putKeys.set(tableName, keys);
    }
    for (const key of Object.keys(prevCVR.keys)) {
      if (nextCVR.keys[key] === undefined) {
        delKeys.push(key);
      }
    }
    const fullItems = await getFullItems(putKeys);

    const patch: PatchOperation[] = [];
    for (const key of delKeys) {
      patch.push({
        op: "del",
        key,
      });
    }
    for (const item of fullItems) {
      if (item)
        patch.push({
          op: "put",
          key: item.id,
          value: item,
        });
    }

    return { patch, cvr: nextCVR };
  } catch (error) {
    console.log(error);
    throw new Error("failed to get changed entries");
  }
};
const getClientViewRecord = async (
  spaceID: SpaceID,
  userId: string,
): Promise<
  {
    tableName: TableName;
    cvr: { id: string; version: number }[];
  }[]
> => {
  try {
    if (spaceID === "user") {
      const cvr = await userCVR(userId);
      return cvr;
    }
    if (spaceID === "workspace") {
      const cvr = await workspaceCVR(spaceID);
      return cvr;
    }
    return [];
  } catch (error) {
    console.log(error);
    throw new Error("failed to get client view record");
  }
};
const getFullItems = async (props: Map<TableName, string[]>) => {
  const queries = [];
  try {
    for (const [tableName, keys] of props.entries()) {
      queries.push(fullItems({ keys, tableName }));
    }
    const items = await Promise.all(queries);
    return items.flat();
  } catch (error) {
    console.log(error);
    throw new Error("failed to get client view record");
  }
};
const getResetPatch = async (
  spaceID: SpaceID,
  userId: string,
): Promise<{ patch: PatchOperation[]; cvr: ClientViewRecord }> => {
  try {
    const items = await resetItems({ spaceID, userId });
    const cvr = makeCVR({ props: items, cvrId: undefined });
    const patch: PatchOperation[] = [
      {
        op: "clear",
      },
    ];
    for (const { cvr } of items) {
      for (const item of cvr) {
        patch.push({
          op: "put",
          key: item.id,
          value: item,
        });
      }
    }
    return { patch, cvr };
  } catch (error) {
    console.log(error);
    throw new Error("failed to get reset patch");
  }
};
export const getItem = async (key: string, tableName: TableName) => {
  try {
    const result = singleItem({ key, tableName });
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("failed to get item");
  }
};
export const putItem = async (
  tableName: TableName,
  value: ReadonlyJSONObject,
) => {
  try {
    return await insertItem({ tableName, value });
  } catch (error) {
    console.log(error);
    throw new Error("failed to put item");
  }
};
export const putItems = async (props: Map<TableName, ReadonlyJSONObject[]>) => {
  try {
    const queries = [];
    for (const [tableName, values] of props.entries()) {
      queries.push(insertItems({ tableName, values }));
    }
    return await Promise.all(queries);
  } catch (error) {
    console.log(error);
    throw new Error("failed to put items");
  }
};
export const updateItems = async (
  props: Map<TableName, { key: string; value: ReadonlyJSONObject }[]>,
) => {
  try {
    const queries = [];
    for (const [tableName, values] of props.entries()) {
      queries.push(updateItemsDB({ tableName, items: values }));
    }
    return await Promise.all(queries);
  } catch (error) {
    console.log(error);
    throw new Error("failed to update items");
  }
};

export const putRedisItems = async ({
  items,
}: {
  items: {
    [key: string]: unknown;
  };
}) => {
  if (Object.entries(items).length === 0) {
    return;
  }
  try {
    await redis.mset(items);
  } catch (error) {
    console.log(error);
    throw new Error("failed to put in redis");
  }
};
export const deleteItems = async (props: Map<TableName, string[]>) => {
  const queries = [];
  try {
    for (const [tableName, keys] of props.entries()) {
      queries.push(deleteItemsDB({ tableName, keys }));
    }
    return await Promise.all(queries);
  } catch (error) {
    console.log(error);
    throw new Error("failed to update items");
  }
};
export const getPrevCVR = async ({ key }: { key: string | undefined }) => {
  if (!key) {
    return undefined;
  }

  try {
    const cvr = (await redis.get(key)) as ClientViewRecord;
    return cvr;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get prev CVR");
  }
};
export const setCVR = async ({
  key,
  CVR,
}: {
  key: string;
  CVR: ClientViewRecord;
}) => {
  try {
    return await redis.set(key, CVR);
  } catch (error) {
    console.log(error);
    throw new Error("failed to set CVR");
  }
};
export const getLastMutationIds = async ({
  clientIDs,
  clientGroupID,
}: {
  clientIDs: string[];
  clientGroupID: string;
}) => {
  try {
    const result = await lastMutationIds({ clientGroupID, clientIDs });
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get client IDS");
  }
};
export const setLastMutationIds = async ({
  clientGroupID,
  lastMutationIds,
}: {
  clientGroupID: string;
  lastMutationIds: Record<string, number>;
}) => {
  try {
    await setLastMutationIdsDB({ lastMutationIds, clientGroupID });
  } catch (error) {
    console.log(error);
    throw new Error("Transact update lastMutationIds failed");
  }
};
export const getLastMutationIdsSince = async ({
  clientGroupID,
  prevLastMutationIdsCVR,
}: {
  clientGroupID: string;
  prevLastMutationIdsCVR: ClientViewRecord | undefined;
}): Promise<{
  nextLastMutationIdsCVR: ClientViewRecord;
  lastMutationIDChanges: Record<string, number>;
}> => {
  try {
    const lastMutationIDs = await allLastMutationIDs({ clientGroupID });
    const nextCVR = makeCVR({
      props: [{ cvr: lastMutationIDs }],
      cvrId: prevLastMutationIdsCVR ? prevLastMutationIdsCVR.id : undefined,
    });

    if (!prevLastMutationIdsCVR) {
      return {
        nextLastMutationIdsCVR: nextCVR,
        lastMutationIDChanges: Object.fromEntries(
          lastMutationIDs.map((l) => [l.id, l.lastMutationID] as const),
        ),
      };
    }
    const lastMutationIDChanges: {
      [k: string]: number;
    } = {};
    for (const { id, lastMutationID, version } of lastMutationIDs) {
      const prevVersion = prevLastMutationIdsCVR.keys[id];
      if (prevVersion && prevVersion < version) {
        lastMutationIDChanges[id] = lastMutationID;
      }
    }

    return {
      nextLastMutationIdsCVR: nextCVR,
      lastMutationIDChanges,
    };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get client IDS that changed");
  }
};
