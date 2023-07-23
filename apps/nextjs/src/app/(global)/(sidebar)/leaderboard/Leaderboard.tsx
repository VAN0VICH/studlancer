"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { BookOpenCheck, Gem } from "lucide-react";
import { Replicache } from "replicache";
import { useSubscribe } from "replicache-react";

import { User } from "@acme/db";

import { LEADERBOARD } from "~/utils/constants";
import { env } from "~/env.mjs";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/Avatar";
import { Badge } from "~/ui/Badge";
import { Button } from "~/ui/Button";
import { Card } from "~/ui/Card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/ui/Tooltip";

interface LeaderboardType {
  username: string;
  level: number;
  filter: "quests" | "reward";
  position: number;
  profile: string | null;
  quests_solved: number;
  rewarded: number;
}

const UserComponent = ({
  username,
  level,
  filter,
  position,
  profile,
  quests_solved,
  rewarded,
}: LeaderboardType) => {
  return (
    <Card className="dark:border-slate-6 dark:bg-slate-3 h-16 w-full flex-row items-center gap-2 rounded-sm p-2 shadow-md">
      <Link
        href={`/profile/${username}`}
        className="relative flex items-center gap-2"
      >
        <div className="text-slate-11 flex h-12 w-4 items-center justify-center">
          <p className="font-bold">{position}</p>
        </div>

        <Avatar className="flex items-center justify-center">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">
          <Badge className="bg-blue-9 h-4">{`${level} lvl`}</Badge>
          <p className="overflow-hidden text-ellipsis whitespace-nowrap font-bold">
            {username}
          </p>
        </div>
        <div className="absolute right-1 mr-1 flex items-center gap-2 sm:right-5">
          <BookOpenCheck className="text-blue-9" />
          <p className="text-blue-9 font-bold">{quests_solved || 0}</p>
        </div>
        <div className="absolute right-14 mr-1 flex items-center gap-2 sm:right-20">
          <Gem className="text-purple-9" />
          <p className="text-purple-9 font-bold">{rewarded}</p>
        </div>
      </Link>
    </Card>
  );
};
export default function Leaderboard() {
  const [filter, setFilter] = useState<"reward" | "quests">("quests");
  const [rep, setRep] = useState<Replicache>();
  const [parent, enableAnimations] = useAutoAnimate(/* optional config */);
  // useEffect(() => {
  //   if (rep) {
  //     return;
  //   }
  //   const r = new Replicache({
  //     name: LEADERBOARD,
  //     licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
  //     pushURL: `/api/replicache-push?spaceId=${LEADERBOARD}`,
  //     pullURL: `/api/replicache-pull?spaceId=${LEADERBOARD}`,
  //     pullInterval: null,
  //   });
  //   setRep(r);

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [rep]);
  const leaders = useSubscribe(
    rep,
    async (tx) => {
      const list = (await tx.scan({ prefix: "USER#" }).entries().toArray()) as
        | [key: string, user: User][]
        | null;
      if (list) {
        console.log("leaders", list);
        return list;
      }
      return null;
    },
    null,
    [],
  );
  const leadersByReward = leaders
    ? leaders.sort(
        ([key, user], [key2, user2]) => user2.rewarded - user.rewarded,
      )
    : [];
  const leadersByQuests = leaders
    ? leaders.sort(
        ([key, user], [key2, user2]) =>
          user2.quests_solved || 0 - user.quests_solved || 0,
      )
    : [];

  return (
    <div className="mt-28 flex min-h-screen w-full justify-center">
      <div className="flex w-11/12 flex-col items-center lg:w-3/6">
        <h2>Leaderboard</h2>

        <div className="my-5 flex w-full  justify-around">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="bg-blue-4 hover:bg-blue-5"
                  size="icon"
                  onClick={() => setFilter("quests")}
                >
                  <BookOpenCheck className="text-blue-9" />
                </Button>
              </TooltipTrigger>

              <TooltipContent className="border-slate-6 dark:border-blue-6">
                <p>Filter by number of quests</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="bg-blue-4 hover:bg-blue-5"
                  size="icon"
                  onClick={() => setFilter("reward")}
                >
                  <Gem className="text-purple-9" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="border-slate-6 dark:border-blue-6">
                <p>Filter by reward</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="w-full " ref={parent}>
          {filter === "quests"
            ? leadersByQuests.map(([key, u], i) => (
                <UserComponent
                  key={u.id}
                  filter={filter}
                  username={u.username}
                  level={u.level}
                  position={i + 1}
                  profile={u.profile}
                  quests_solved={u.quests_solved}
                  rewarded={u.rewarded}
                />
              ))
            : leadersByReward.map(([key, u], i) => (
                <UserComponent
                  key={u.id}
                  filter={filter}
                  username={u.username}
                  level={u.level}
                  position={i + 1}
                  profile={u.profile}
                  quests_solved={u.quests_solved}
                  rewarded={u.rewarded}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
