import z from "zod";

import {
  UpdateWork,
  UpdateWorkSchema,
  Work,
  WorkEnum,
  Works,
  WorkSchema,
} from "@acme/db";
import { workKey, WorkType } from "@acme/types";

import { ReplicacheTransaction } from "../transaction";

export type M = typeof workspaceMutators;
export const workspaceMutators = {
  createWork: async (tx: ReplicacheTransaction, work: Work) => {
    console.log("mutators, putQuest");
    const parsedWork = WorkSchema.parse(work);

    await tx.put(
      workKey(parsedWork.id, parsedWork.type),
      parsedWork,
      "workspace",
    );
  },
  updateWork: async (
    tx: ReplicacheTransaction,
    props: { id: string; type: WorkType; updates: UpdateWork },
  ): Promise<void> => {
    const { id, type, updates } = z
      .object({ id: z.string(), type: WorkEnum, updates: UpdateWorkSchema })
      .parse(props);
    const parsedUpdates = UpdateWorkSchema.parse(updates);
    await tx.update(workKey(id, type), parsedUpdates, "workspace");
  },

  deleteWork: async (
    tx: ReplicacheTransaction,
    props: { id: string; type: WorkType },
  ): Promise<void> => {
    const { id, type } = z
      .object({ id: z.string(), type: WorkEnum })
      .parse(props);
    await tx.update(workKey(id, type), { in_trash: true }, "workspace");
  },
  permDeleteWork: async (
    tx: ReplicacheTransaction,
    props: { id: string; type: WorkType },
  ): Promise<void> => {
    const { id, type } = z
      .object({ id: z.string(), type: WorkEnum })
      .parse(props);

    await tx.del(workKey(id, type), "workspace");
  },
  restoreWork: async (
    tx: ReplicacheTransaction,
    props: { id: string; type: WorkType },
  ): Promise<void> => {
    const { id, type } = z
      .object({ id: z.string(), type: WorkEnum })
      .parse(props);
    await tx.update(workKey(id, type), { in_trash: false }, "workspace");
  },
  publishWork: async (
    tx: ReplicacheTransaction,
    props: { id: string; type: WorkType },
  ): Promise<void> => {
    const { id, type } = z
      .object({ id: z.string(), type: WorkEnum })
      .parse(props);
    await tx.update(workKey(id, type), { published: true }, "workspace");
  },
  unpublishWork: async (
    tx: ReplicacheTransaction,
    props: { id: string; type: WorkType },
  ): Promise<void> => {
    const { id, type } = z
      .object({ id: z.string(), type: WorkEnum })
      .parse(props);
    await tx.update(workKey(id, type), { published: false }, "workspace");
  },
};
