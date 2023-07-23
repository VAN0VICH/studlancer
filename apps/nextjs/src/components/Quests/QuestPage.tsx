"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { UndoManager } from "@rocicorp/undo";
import { Check, UserPlus } from "lucide-react";
import { MDXRemoteProps } from "next-mdx-remote";
import { useSubscribe } from "replicache-react";
import { toast } from "sonner";

import type { PublishedQuest, Solver } from "@acme/db";
import { solutionStatus, userKey } from "@acme/types";

import { cn } from "~/utils/cn";
import { NonEditableQuestAttributes } from "~/components/Workspace/NonEditableAttributes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/ui/AlertDialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/Avatar";
import { Badge } from "~/ui/Badge";
import { Button } from "~/ui/Button";
import { Card, CardContent, CardHeader } from "~/ui/Card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/ui/Tooltip";
import { ReplicacheInstancesStore } from "~/zustand/rep";
import NonEditableContent from "../Workspace/NonEditableContent";

export default function QuestPage({
  id,
  mdxSource,
}: {
  id: string;
  mdxSource: MDXRemoteProps | null;
}) {
  const { userId, isSignedIn } = useAuth();
  const rep = ReplicacheInstancesStore((state) => state.publishedQuestsRep);
  const globaRep = ReplicacheInstancesStore((state) => state.globalRep);
  const undoManagerRef = useRef(new UndoManager());
  const quest = useSubscribe(
    rep,
    async (tx) => {
      const quest = await tx.get(workKey({ id, type: "QUEST" }));
      if (quest) {
        return quest as PublishedQuest;
      }
    },
    null,
    [id],
  );
  const user = useSubscribe(
    globaRep,
    async (tx) => {
      if (userId) {
        const user = (await tx.get(userKey(userId))) as User | null;
        if (user) {
          return user;
        }
        return null;
      }
    },
    null,
    [],
  );

  const isCreator = userId === quest?.creatorId;

  const solvers = useSubscribe(
    rep,
    async (tx) => {
      const solvers = (await tx
        .scan({ prefix: `SOLVER#${id}` })
        .entries()
        .toArray()) as [key: string, solver: Solver][];
      if (solvers) {
        return solvers;
      }
      return null;
    },
    null,
    [id],
  );
  const handleJoinQuest = useCallback(async () => {
    if (!userId) {
      toast.message("Please sign in to join!");
      return;
    }
    if (rep && user && quest) {
      // await undoManagerRef.current.add({
      //   execute: () =>
      //     rep.mutate.joinQuest({
      //       userId,
      //       questId: id,
      //       level: user.level,
      //       ...(user.profile && { profile: user.profile }),
      //       publisherId: quest.creatorId,
      //       username: user.username,
      //     }),
      //   undo: () =>
      //     rep.mutate.leaveQuest({
      //       userId,
      //       questId: id,
      //       publisherId: quest.creatorId,
      //     }),
      // });

      toast.success(
        "Successfully joined the quest! Let's conquer it! Do not forget to post the solution!",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quest, id, user, rep, userId]);
  const handleLeaveQuest = useCallback(async () => {
    if (rep && userId && user && quest) {
      await undoManagerRef.current.add({
        execute: () =>
          rep.mutate.leaveQuest({
            userId,
            questId: id,
            publisherId: quest.creatorId,
          }),
        undo: () =>
          rep.mutate.joinQuest({
            userId,
            questId: id,
            level: user.level,

            ...(user.profile && { profile: user.profile }),
            publisherId: quest.creatorId,
            username: user.username,
          }),
      });
      toast.success("Successfully leaved the quest. Good luck next time!");
    }
  }, [id, user, quest, rep, userId]);
  const isSolver =
    solvers && solvers.some(([key, solver]) => solver.user.id === userId);

  if (!quest) {
    return <div>No quest found</div>;
  }
  const solversCount = solvers ? solvers.length : 0;
  const emptySlots: Record<string, any>[] = [];
  for (let i = 0; i < quest.slots - solversCount; i++) {
    emptySlots.push({});
  }

  return (
    <div className="mb-20 mt-2 flex w-full flex-col items-center justify-center md:flex-row">
      <div className="mt-16 w-11/12 flex-row-reverse gap-4 md:flex">
        <div className="w-fill mb-4 flex h-fit flex-col items-center justify-center gap-4 md:w-3/12">
          <Publisher publisherId="user1" />
          <div className=" flex items-center justify-center">
            <Button className="bg-blue-9 hover:bg-blue-10 text-white">
              MESSAGE
            </Button>
          </div>

          {quest.winnerId && <Winner winnerId="user1" />}
        </div>

        <div className="w-full md:w-9/12">
          <QuestComponent quest={quest} mdxSource={mdxSource} />
          {/* {isCreator ? (
            <></>
          ) : ( */}
          <div className="flex h-16 w-full items-center justify-center gap-5">
            {isSolver && userId && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-20 bg-red-500 text-white hover:bg-red-600">
                    LEAVE
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-slate-6">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm your action</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure? Please dont. Just kidding, do whatever you
                      want.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        className="w-20 bg-red-500 text-white hover:bg-red-600"
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        onClick={handleLeaveQuest}
                      >
                        LEAVE
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-20 bg-green-500 text-white hover:bg-green-500 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                  disabled={
                    !isSignedIn || isSolver || quest.slots === solversCount
                  }
                >
                  JOIN
                </Button>
              </AlertDialogTrigger>{" "}
              <AlertDialogContent className="border-slate-6">
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm your action</AlertDialogTitle>
                  <AlertDialogDescription>Let win this!</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      className="w-20 bg-green-500 hover:bg-green-600 "
                      disabled={
                        !isSignedIn || isSolver || quest.slots === solversCount
                      }
                      // eslint-disable-next-line @typescript-eslint/no-misused-promises
                      onClick={handleJoinQuest}
                    >
                      JOIN
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          {/* )} */}

          <h2 className="my-5 text-center text-lg">Solution statuses</h2>

          <div className="border-blue-4 mb-5 flex flex-wrap justify-center gap-3 rounded-md border-2 p-2">
            {solutionStatus.map((status, i) => (
              <div className="flex gap-2" key={i}>
                <div
                  className={cn(
                    "flex w-[25px] items-center justify-center rounded-[50%] text-white",
                    {
                      "bg-yellow-400": status === "posted",
                      "bg-green-400 dark:bg-emerald-400":
                        status === "accepted" || status === "acknowledged",
                      "bg-red-400 dark:bg-red-500": status === "rejected",
                    },
                  )}
                >
                  {status === "accepted" && (
                    <Check className="font-extrabold text-white" />
                  )}
                </div>
                <p>{status}</p>
              </div>
            ))}
          </div>

          <SolverComponent
            emptySlots={emptySlots}
            creatorId={quest.creator_id}
            questId={id}
            userId={userId}
            solvers={solvers}
          />
        </div>
        {/* )} */}
      </div>
    </div>
  );
}
const Publisher = ({ publisherId }: { publisherId: string }) => {
  // if (publisher.isLoading) {
  //   return (
  //     <>
  //       <Skeleton className="h-40 w-full rounded-full" />

  //       <Skeleton className="h-10 w-full rounded-full" />
  //       <Skeleton className="h-10 w-full rounded-full" />
  //       <Skeleton className="h-10 w-full rounded-full" />
  //       <Skeleton className="h-10 w-full rounded-full" />
  //     </>
  //   );
  // }

  return (
    <Card className="dark:border-slate-6 dark:bg-slate-3 h-fit w-full max-w-[250px] rounded-xl drop-shadow-md dark:border-[1px]">
      <CardHeader className="flex justify-center p-2 text-center text-xl font-bold">
        Publisher
      </CardHeader>
      <CardContent className="p-2">
        <div className="bg-blue-2 dark:shadow-blue-6 flex h-60 w-full items-center justify-center rounded-md border-[1px] shadow-inner dark:border-none"></div>
        <div className="flex flex-col items-center p-2">
          <Badge className="bg-blue-9">1 LVL</Badge>
          <h3>Pachimari</h3>
        </div>
      </CardContent>
    </Card>
  );
};
const EmptySlot = () => {
  return (
    <div className="flex gap-2">
      <div className="border-blue-4 bg-blue-2 flex h-14 w-36 items-center justify-center rounded-xl border-2 ">
        <UserPlus className="text-blue-9" />
      </div>

      <div className="flex h-14 items-center justify-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "border-blue-6 flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-[50%] border-[1px] text-white",
                )}
              ></div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Status</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
const Winner = ({ winnerId }: { winnerId: string }) => {
  //   const winner = trpc.user.userComponent.useQuery(
  //     { id: winnerId },
  //     { staleTime: 10 * 60 * 6000 }
  //   );
  //   if (winner.isLoading) {
  //     return (
  // <>
  //       <Skeleton className="h-40 w-full rounded-full" />
  //        <Skeleton className="h-10 w-full rounded-full" />
  //        <Skeleton className="h-10 w-full rounded-full" />
  //        <Skeleton className="h-10 w-full rounded-full" />
  //        <Skeleton className="h-10 w-full rounded-full" />
  //      </>
  //     );
  //   }
  return (
    <Card className="dark:border-blue-4 dark:bg-slate-3 h-fit w-full max-w-[250px] rounded-xl drop-shadow-md">
      <CardHeader className="flex justify-center p-2 text-center text-xl font-bold">
        Winner
      </CardHeader>
      <CardContent className="p-2">
        <div className="flex h-60 w-full items-center justify-center rounded-md border-[1px] bg-blue-50 shadow-inner"></div>
        <div className="flex flex-col items-center p-2">
          <Badge className="bg-blue-9">1 LVL</Badge>
          <h3>Pachimari</h3>
        </div>
      </CardContent>
    </Card>
  );
};
const QuestComponent = ({
  quest,
  mdxSource,
}: {
  quest: PublishedQuest;
  mdxSource: MDXRemoteProps | null;
}) => {
  return (
    <Card className="dark:border-slate-6 dark:bg-slate-3 rounded-xl drop-shadow-md">
      <CardHeader>
        <NonEditableQuestAttributes quest={quest} />
      </CardHeader>
      <CardContent className="font-default font-medium">
        {mdxSource && <NonEditableContent mdxSource={mdxSource} />}
      </CardContent>
    </Card>
  );
};
const SolverComponent = ({
  solvers,
  emptySlots,
  creatorId,
  questId,
  userId,
}: {
  solvers: [key: string, solver: Solver][] | null;
  emptySlots: Record<any, any>[];
  creatorId: string;
  questId: string;
  userId: string | null | undefined;
}) => {
  const emptySkeletonSlots: Record<any, any>[] = [];

  for (let i = 0; i < 5; i++) {
    emptySkeletonSlots.push({});
  }
  const solversLoading = false;
  // const solvers= [{id:"user1"}]

  return (
    <div className="flex flex-wrap gap-5">
      {solvers &&
        solvers.map(([key, s]) => (
          <div className="flex" key={s.user.id}>
            <Solver
              solver={s}
              isAuthorised={userId === creatorId || userId === s.id}
              questId={questId}
            />
          </div>
        ))}

      {!solversLoading && emptySlots.map((s, i) => <EmptySlot key={i} />)}
    </div>
  );
};
const Solver = ({
  solver,
  isAuthorised,
  questId,
}: {
  solver: Solver;
  isAuthorised: boolean;
  questId: string;
}) => {
  return (
    <div>
      <div className="flex gap-2">
        <Link href={`/profile/${solver.user.username}`}>
          <Card className="dark:border-slate-6 dark:bg-slate-3 flex h-14 w-36 flex-row items-center gap-2 rounded-xl pl-2 drop-shadow-md">
            {/* <Circle size="40px" ml={2}></Circle> */}

            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden text-ellipsis whitespace-nowrap">
              <Badge className="w-10 bg-blue-400">
                {solver.user.level} LVL
              </Badge>
              <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold">
                {solver.user.username}
              </p>
            </div>
          </Card>
        </Link>

        <div className="flex h-14 items-center justify-center">
          {solver.solution.status ? (
            <TooltipProvider>
              {" "}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "dark:border-slate-6 flex w-[25px] items-center justify-center rounded-[50%] border-[1px] border-blue-400 text-white",
                      {
                        "bg-yellow-400": !solver.solution.status,
                        "bg-green-400":
                          solver.solution.status === "accepted" ||
                          solver.solution.status === "acknowledged",
                        "bg-red-400": solver.solution.status === "rejected",
                      },
                    )}
                  >
                    {solver.solution.status === "accepted" && (
                      <Check className="text-white" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{solver.solution.status}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "dark:border-slate-6 flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-[50%] border-[1px] border-slate-300 text-white",
                    )}
                  ></div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Status</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      {isAuthorised && solver.solution_id && (
        <Link href={`/solutions/${solver.solution_id}?quest=${questId}`}>
          <Button className="bg-green-400">View solution</Button>
        </Link>
      )}
    </div>
  );
};
