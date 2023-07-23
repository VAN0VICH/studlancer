import z from "zod";

import { PublishedQuest, User } from "@acme/db";
import {
  accepted,
  acknowledged,
  closed,
  rejected,
  solverKey,
  userKey,
  workKey,
} from "@acme/types";

import { levelUp } from "../../utils";
import { getItem } from "../data";
import { ReplicacheTransaction } from "../transaction";

export type M = typeof questMutators;
export const questMutators = {
  join: async (
    tx: ReplicacheTransaction,
    props: { userId: string; questId: string },
  ) => {
    const value = z
      .object({ userId: z.string(), questId: z.string() })
      .parse(props);
    await tx.put(solverKey(value), value, "solver");
  },
  leave: async (
    tx: ReplicacheTransaction,
    props: { userId: string; questId: string },
  ) => {
    const value = z
      .object({ userId: z.string(), questId: z.string() })
      .parse(props);
    await tx.del(solverKey(value), "solver");
  },
  acceptSolution: async (
    tx: ReplicacheTransaction,
    props: { solverId: string; questId: string; solutionId: string },
  ) => {
    const value = z
      .object({
        solverId: z.string(),
        questId: z.string(),
        solutionId: z.string(),
      })
      .parse(props);
    const [quest, user] = (await Promise.all([
      getItem(workKey(value.questId, "QUEST"), "workspace"),

      getItem(userKey(value.solverId), "user"),
    ])) as [quest: PublishedQuest | undefined, user: User | undefined];
    if (user && quest) {
      const deterministicExperience = quest.reward * 1; // multiplier
      const randomExperience = Math.floor(Math.random() * quest.reward);
      const experience = deterministicExperience + randomExperience;
      const { newExperience, newLevel } = levelUp({
        currentLevel: user.level,
        currentExperience: user.experience,
        experience,
      });
      await Promise.all([
        tx.update(
          workKey(value.solutionId, "SOLUTION"),
          { status: accepted },
          "workspace",
        ),

        tx.update(
          workKey(value.questId, "QUEST"),
          { status: closed },
          "workspace",
        ),
        tx.update(
          userKey(value.solverId),
          {
            experience: newExperience,
            level: newLevel,
            questsSolved: user.quests_solved || 0 + 1,
            rewarded: user.rewarded || 0 + quest.reward,
          },
          "user",
        ),
      ]);
    }
  },
  acknowledgeSolution: async (
    tx: ReplicacheTransaction,
    props: { solverId: string; questId: string; solutionId: string },
  ) => {
    const value = z
      .object({
        solverId: z.string(),
        questId: z.string(),
        solutionId: z.string(),
      })
      .parse(props);
    const [quest, user] = (await Promise.all([
      getItem(workKey(value.questId, "QUEST"), "workspace"),

      getItem(userKey(value.solverId), "user"),
    ])) as [quest: PublishedQuest | undefined, user: User | undefined];
    if (user && quest) {
      const deterministicExperience = quest.reward * 0.5; // multiplier
      const randomExperience = Math.floor(Math.random() * quest.reward);
      const experience = deterministicExperience + randomExperience;
      const { newExperience, newLevel } = levelUp({
        currentLevel: user.level,
        currentExperience: user.experience,
        experience,
      });
      await Promise.all([
        tx.update(
          workKey(value.solutionId, "SOLUTION"),
          { status: acknowledged },
          "workspace",
        ),

        tx.update(
          userKey(value.solverId),
          {
            experience: newExperience,
            level: newLevel,
          },
          "user",
        ),
      ]);
    }
  },
  rejectSolution: async (
    tx: ReplicacheTransaction,
    props: { solverId: string; questId: string; solutionId: string },
  ) => {
    const value = z
      .object({
        solverId: z.string(),
        questId: z.string(),
        solutionId: z.string(),
      })
      .parse(props);
    await tx.update(
      workKey(value.solutionId, "SOLUTION"),
      { status: rejected },
      "workspace",
    );
  },
};
