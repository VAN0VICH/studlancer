import { ClientID, PatchOperation } from "replicache";
import z from "zod";

export * from "./file-types";
export * from "./mime-types";
export const TableNameSchema = z.enum([
  "user",
  "quest",
  "solver",
  "post",
  "solution",
  "collaborator",
]);
export type TableName = z.infer<typeof TableNameSchema>;
type Literal = boolean | null | number | string;
type Json = Literal | { [key: string]: Json } | Json[];
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
export const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
);
export type JSONType = z.infer<typeof jsonSchema>;
export type ClientViewRecord = {
  id: string;
  keys: Record<string, number>;
};
export type CVRPromise = Promise<
  {
    tableName: TableName;
    cvr: { id: string; version: number }[];
  }[]
>;
const mutationNames = [
  "createWork",
  "updateWork",
  "deleteWork",
  "deleteWorkPermanently",
  "duplicateWork",
  "restoreWork",
  "updateContent",
  "publishWork",
  "unpublishWork",
  "createUser",
  "updateUser",
  "joinQuest",
  "leaveQuest",
  "acceptSolution",
  "acknowledgeSolution",
  "rejectSolution",
  "createGuild",
  "acceptMemberInquiry",
  "rejectMemberInquiry",
  "inviteMember",
  "acceptGuildInvitation",
  "createMemberInquiry",
  "createMessage",
  "updateChannel",
] as const;
export const MutationNamesZod = z.enum(mutationNames);
export type Mutation = z.infer<typeof mutationSchema>;
export const mutationSchema = z.object({
  id: z.number(),
  name: MutationNamesZod,
  args: jsonSchema,
  clientID: z.string(),
  timestamp: z.number(),
});

export const pushRequestSchema = z.object({
  pushVersion: z.literal(1),
  profileID: z.string(),
  clientGroupID: z.string(),
  mutations: z.array(mutationSchema),
});
export type PullResponse = {
  cookie: string;
  lastMutationIDChanges: Record<string, number>;
  patch: PatchOperation[];
};
export const cookieSchema = z.object({
  PUBLISHED_QUESTS_CVR: z.optional(z.string()),
  WORKSPACE_CVR: z.optional(z.string()),
  USER_CVR: z.optional(z.string()),
  LEADERBOARD_CVR: z.optional(z.string()),

  lastMutationIdsCVRKey: z.optional(z.string()),
});
export type cookieSchemaType = z.infer<typeof cookieSchema>;
export const pullRequestSchema = z.object({
  pullVersion: z.literal(1),
  profileID: z.string(),
  clientGroupID: z.string(),
  cookie: z.union([z.string(), z.null()]),
  schemaVersion: z.string(),
});
export type PullRequestSchemaType = {
  clientGroupID: string;

  cookie: string | null;
};
export const SPACE_ID = ["workspace", "user", "published_quests"] as const;
export const SpaceIDZod = z.enum(SPACE_ID);
export type SpaceID = z.infer<typeof SpaceIDZod>;
export const STRANGER = "STRANGER" as const;
export const WORKSPACE = "WORKSPACE" as const;
export const USER = "USER" as const;
export const PUBLISHED_QUESTS = "PUBLISHED_QUESTS" as const;
export const LEADERBOARD = "LEADERBOARD" as const;
export type WorkType = "QUEST" | "POST" | "SOLUTION";

export const workKey = (id: string, type: WorkType) => {
  return `WORK/${type}/${id}`;
};
export const userKey = (id: string) => {
  return `USER/${id}`;
};

export const acknowledged = "acknowledged" as const;
export const accepted = "accepted" as const;
export const rejected = "rejected" as const;
export const posted = "posted" as const;
export const solutionStatus = [
  accepted,
  acknowledged,
  rejected,
  posted,
] as const;
export const open = "open" as const;
export const closed = "closed" as const;
export const questStatus = ["open", "closed"] as const;
export const Subtopics = [
  "LOGO",
  "AI",
  "MACHINE LEARNING",
  "WEB",
  "MOBILE-DEV",
  "ESSAY",
] as const;
export const Topics = [
  "MARKETING",
  "BUSINESS",
  "PROGRAMMING",
  "SCIENCE",
  "DESIGN",
  "ART",
  "VIDEOGRAPHY",
  "GAMING",
] as const;
export const GuildRankings = ["NEWBIE", "MID", "LORD", "FOUNDER"] as const;
export const Channel = ["GENERAL", ...Topics] as const;
export const ChannelZod = z.enum(Channel);
export type ChannelType = z.infer<typeof ChannelZod>;
const TopicsZod = z.enum(Topics);
export type Topic = z.infer<typeof TopicsZod>;
export type Subtopics = typeof Subtopics;
