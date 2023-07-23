import {
  cookieSchema,
  cookieSchemaType,
  pullRequestSchema,
  PullRequestSchemaType,
  PullResponse,
  SpaceID,
  STRANGER,
} from "@acme/types";

import { getLastMutationIdsSince, getPatch, getPrevCVR, setCVR } from "./data";

export async function pull({
  spaceID,
  req,
}: {
  spaceID: SpaceID;
  req: Request;
}) {
  console.log("----------------------------------------------------");

  //   const userId: string = auth().userId ? (auth().userId as string) : STRANGER;
  const userId = STRANGER;
  const json = (await req.json()) as PullRequestSchemaType;

  console.log("Processing mutation pull:", JSON.stringify(json, null, ""));

  const pull = pullRequestSchema.parse(json);
  const requestCookie = pull.cookie
    ? cookieSchema.parse(JSON.parse(pull.cookie))
    : undefined;
  const startTransact = Date.now();
  const processPull = async () => {
    const [prevCVR, prevLastMutationIdsCVR] = await Promise.all([
      getPrevCVR({
        key:
          requestCookie && spaceID === "workspace"
            ? requestCookie.WORKSPACE_CVR
            : requestCookie && spaceID === "published_quests"
            ? requestCookie.PUBLISHED_QUESTS_CVR
            : requestCookie && spaceID === "user"
            ? requestCookie.USER_CVR
            : // : requestCookie && spaceID === LEADERBOARD
              // ? requestCookie.LEADERBOARD_CVR
              undefined,
      }),
      getPrevCVR({
        key: requestCookie ? requestCookie.lastMutationIdsCVRKey : undefined,
      }),
    ]);
    console.log("Getting CVR time", Date.now() - startTransact);

    const patchPromise = getPatch({
      prevCVR,
      spaceID,
      userId,
    });

    const lastMutationIDsPromise = getLastMutationIdsSince({
      clientGroupID: pull.clientGroupID,
      prevLastMutationIdsCVR,
    });

    return Promise.all([patchPromise, lastMutationIDsPromise]);
  };

  const [
    { cvr: nextCVR, patch },
    { lastMutationIDChanges, nextLastMutationIdsCVR },
  ] = await processPull();

  console.log("transact took", Date.now() - startTransact);

  console.log("lastMutationIDsChanges: ", lastMutationIDChanges);

  const resp: PullResponse = {
    lastMutationIDChanges,
    cookie: JSON.stringify({
      ...requestCookie,

      ...(spaceID === "user" && { USER_CVR: nextCVR.id }),
      ...(spaceID === "workspace" && { WORKSPACE_CVR: nextCVR.id }),
      ...(spaceID === "published_quests" && {
        PUBLISHED_QUESTS_CVR: nextCVR.id,
      }),
      // ...(spaceID === LEADERBOARD && { LEADERBOARD_CVR: nextCVR.id }),
      ...(nextLastMutationIdsCVR && {
        lastMutationIdsCVRKey: nextLastMutationIdsCVR.id,
      }),
    } satisfies cookieSchemaType),
    patch,
  };
  console.log("patch", resp);
  try {
    if (nextLastMutationIdsCVR) {
      await Promise.allSettled([
        setCVR({ CVR: nextCVR, key: nextCVR.id }),
        setCVR({
          CVR: nextLastMutationIdsCVR,
          key: nextLastMutationIdsCVR.id,
        }),
      ]);
    } else {
      await setCVR({ CVR: nextCVR, key: nextCVR.id });
    }
  } catch (error) {
    console.log(error);
  }
  console.log("total time", Date.now() - startTransact);

  console.log("----------------------------------------------------");

  return new Response(JSON.stringify(resp));
}
