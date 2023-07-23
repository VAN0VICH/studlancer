import {
  KeyTypeForScanOptions,
  ReadonlyJSONObject,
  ScanOptions,
  ScanResult,
  TransactionEnvironment,
  TransactionReason,
} from "replicache";

import { TableName } from "@acme/types";

import { deleteItems, putItems, putRedisItems, updateItems } from "./data";

const DELETE = "DELETE" as const;
const PUT = "PUT" as const;
const REDIS_PUT = "REDIS_PUT" as const;
const UPDATE = "UPDATE" as const;

interface CustomWriteTransaction {
  redisPut(key: string, value: string): Promise<void>;

  put(
    key: string,
    value: ReadonlyJSONObject,
    tableName: TableName,
  ): Promise<void>;
  update(
    key: string,
    value: ReadonlyJSONObject,
    tableName: TableName,
  ): Promise<void>;
  del(key: string, tableName: TableName): Promise<void>;
}

export class ReplicacheTransaction implements CustomWriteTransaction {
  private readonly _spaceID: string;
  private readonly _cache: Map<
    string,
    {
      method: typeof PUT | typeof UPDATE | typeof REDIS_PUT | typeof DELETE;
      value?: ReadonlyJSONObject | string;
      tableName?: TableName;
    }
  > = new Map();
  private readonly _userId: string;
  private readonly _clientID: string;
  private readonly _mutationID: number;
  private readonly _reason: TransactionReason;
  private readonly _environment: TransactionEnvironment;

  constructor(
    spaceID: string,
    userId: string,
    clientID: string,
    mutationID: number,
    reason: TransactionReason,
    environment: TransactionEnvironment,
  ) {
    this._spaceID = spaceID;
    this._userId = userId;
    this._clientID = clientID;
    this._mutationID = mutationID;
    this._reason = reason;
    this._environment = environment;
  }

  async put(key: string, value: ReadonlyJSONObject, tableName: TableName) {
    this._cache.set(key, { method: PUT, value, tableName });
  }
  async update(key: string, value: ReadonlyJSONObject, tableName: TableName) {
    this._cache.set(key, { method: UPDATE, value, tableName });
  }
  async redisPut(key: string, value: string) {
    this._cache.set(key, { method: REDIS_PUT, value });
  }
  async del(key: string, tableName: TableName) {
    this._cache.set(key, { method: DELETE, tableName });
  }
  /* --------------------- */
  /* not implemented */
  async get(key: string) {
    return {};
  }
  async has(key: string) {
    return true;
  }
  async isEmpty() {
    return true;
  }
  scan(): ScanResult<string>;
  scan<Options extends ScanOptions>(
    _options?: Options,
  ): ScanResult<KeyTypeForScanOptions<Options>> {
    throw new Error("Method scan not implemented.");
  }
  /* --------------------- */

  get clientID(): string {
    return this._clientID;
  }
  get mutationID(): number {
    return this._mutationID;
  }
  get reason() {
    return this._reason;
  }
  get environment() {
    return this._environment;
  }

  async flush(): Promise<void> {
    const items = [...this._cache.entries()].map((item) => item);
    if (items.length === 0) {
      return;
    }

    const itemsToPut: Map<TableName, ReadonlyJSONObject[]> = new Map();
    const redisItemsToPut: {
      [key: string]: unknown;
    } = {};
    const itemsToUpdate: Map<
      TableName,
      { key: string; value: ReadonlyJSONObject }[]
    > = new Map();

    const itemsToDel: Map<TableName, string[]> = new Map();
    for (const item of items) {
      if (item[1].method === PUT && item[1].value && item[1].tableName) {
        const currentItems = itemsToPut.get(item[1].tableName) ?? [];
        currentItems.push(item[1].value as ReadonlyJSONObject);
        itemsToPut.set(item[1].tableName, currentItems);
      } else if (
        item[1].method === UPDATE &&
        item[1].value &&
        item[1].tableName
      ) {
        const currentItems = itemsToUpdate.get(item[1].tableName) ?? [];
        currentItems.push({
          key: item[0],
          value: item[1].value as ReadonlyJSONObject,
        });
        itemsToUpdate.set(item[1].tableName, currentItems);
      } else if (item[1].method === DELETE && item[1].tableName) {
        const currentItems = itemsToDel.get(item[1].tableName) ?? [];
        currentItems.push(item[0]);
        itemsToDel.set(item[1].tableName, currentItems);
      } else if (item[1].method === REDIS_PUT && item[1].value) {
        redisItemsToPut[item[0]] = item[1].value;
      }
    }

    await Promise.all([
      deleteItems(itemsToDel),
      putItems(itemsToPut),
      putRedisItems({ items: redisItemsToPut }),
      updateItems(itemsToUpdate),
    ]);
    this._cache.clear();
  }
}
