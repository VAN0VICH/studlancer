import { MutatorReturn } from "replicache";
import z from "zod";

import { db } from "@acme/db";
import {
  Mutation,
  pushRequestSchema,
  SpaceID,
  STRANGER,
  WORKSPACE,
} from "@acme/types";

import { getLastMutationIds, setLastMutationIds } from "./data";
import { userMutators } from "./mutators/user";
import { workspaceMutators } from "./mutators/workspace";
import { ReplicacheTransaction } from "./transaction";

type CustomMutator = {
  [key: string]: (tx: ReplicacheTransaction, args?: any) => MutatorReturn;
};
export const push = async ({
  req,
  userId,
  spaceID,
}: {
  req: Request;
  userId: string;
  spaceID: SpaceID;
}) => {
  console.log("----------------------------------------------------");

  console.log("Processing push");

  const json = await req.json();

  const push = pushRequestSchema.parse(json);
  if (push.mutations.length === 0) {
    console.log("no mutations");
    return new Response("");
  }
  const t0 = Date.now();

  const processMutations = async () => {
    await db.transaction(async (transaction) => {
      const clientIDs = [...new Set(push.mutations.map((m) => m.clientID))];

      const lastMutationIds = await getLastMutationIds({
        clientGroupID: push.clientGroupID,
        clientIDs,
      });
      let updated = false;

      console.log("lastMutationIDs:", lastMutationIds);
      console.log("clientId", clientIDs);

      const tx = new ReplicacheTransaction(
        spaceID,
        userId,
        clientIDs[0]!,
        1,
        "rebase",
        "server",
      ); //ignore last 4 params, not used anyway

      for (const mutation of push.mutations) {
        const lastMutationId = lastMutationIds[mutation.clientID] || 0;

        const nextMutationId = await processMutation({
          tx,
          lastMutationId,
          mutation,
          userId,
          spaceID,
        });
        lastMutationIds[mutation.clientID] = nextMutationId;
        if (nextMutationId > lastMutationId) {
          updated = true;
        }
      }
      if (updated) {
        await Promise.all([
          setLastMutationIds({
            clientGroupID: push.clientGroupID,
            lastMutationIds: lastMutationIds,
          }),

          tx.flush(),
        ]);
      } else {
        console.log("Nothing to update");
      }
    });
  };

  try {
    await processMutations();
  } catch (error) {
    console.log(error);
    throw new Error("push error");
  }
  console.log("Processed all mutations in", Date.now() - t0);

  return {};
};

const processMutation = async ({
  tx,
  mutation,
  error,
  lastMutationId,
  userId,
  spaceID,
}: {
  tx: ReplicacheTransaction;
  mutation: Mutation;
  lastMutationId: number;
  error?: any;
  userId: string;
  spaceID: string;
}) => {
  const expectedMutationID = lastMutationId + 1;
  if (mutation.id < expectedMutationID) {
    console.log(
      `Mutation ${mutation.id} has already been processed - skipping`,
    );
    return lastMutationId;
  }
  if (mutation.id > expectedMutationID) {
    console.warn(`Mutation ${mutation.id} is from the future - aborting`);

    throw new Error(`Mutation ${mutation.id} is from the future - aborting`);
  }

  if (!error) {
    console.log("Processing mutation:", JSON.stringify(mutation, null, ""));

    const t1 = Date.now();
    // For each possible mutation, run the server-side logic to apply the
    // mutation.

    const mutator =
      spaceID === WORKSPACE
        ? (workspaceMutators as CustomMutator)[mutation.name]
        : (userMutators as CustomMutator)[mutation.name];
    if (!mutator) {
      console.error(`Unknown mutator: ${mutation.name} - skipping`);
      return lastMutationId;
    }

    try {
      await mutator(tx, mutation.args);
    } catch (e) {
      console.error(`Error executing mutator: ${JSON.stringify(mutation)}`, e);
    }
    console.log("Processed mutation in", Date.now() - t1);

    console.log("----------------------------------------------------");

    return expectedMutationID;
  } else {
    // TODO: You can store state here in the database to return to clients to
    // provide additional info about errors.
    console.log(
      "Handling error from mutation",
      JSON.stringify(mutation),
      error,
    );
    return lastMutationId;
  }
};
