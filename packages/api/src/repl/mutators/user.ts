import {
  InsertUserSchema,
  UpdateUserSchema,
  User,
  UserUpdates,
} from "@acme/db";
import { userKey } from "@acme/types";

import { ReplicacheTransaction } from "../transaction";

export type M = typeof userMutators;
export const userMutators = {
  createUser: async (tx: ReplicacheTransaction, user: User) => {
    const parsedUser = InsertUserSchema.parse(user);

    await tx.put(userKey(user.id), parsedUser, "user");
  },
  updateUser: async (
    tx: ReplicacheTransaction,
    { id, updates }: { id: string; updates: UserUpdates },
  ) => {
    const parsedUpdates = UpdateUserSchema.parse(updates);

    await tx.put(userKey(id), parsedUpdates, "user");
  },
};
