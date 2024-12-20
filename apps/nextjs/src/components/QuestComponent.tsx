import Link from "next/link";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Gem, Users2 } from "lucide-react";

import { PublishedQuest } from "@acme/db";

import { TopicColor } from "~/utils/topicsColor";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/Avatar";
import { Badge } from "~/ui/Badge";
import { Card, CardContent, CardFooter, CardHeader } from "~/ui/Card";

export default function QuestComponent({
  quest,
  includeContent,
  includeDetails,
}: {
  quest: PublishedQuest;
  includeContent: boolean;
  includeDetails: boolean;
}) {
  return (
    <Card className="dark:border-slate-6 dark:bg-slate-3 h-fit w-full rounded-xl border-[1px]  border-slate-200 bg-white drop-shadow-sm">
      <CardHeader className="flex w-full p-2">
        <div className="flex w-full justify-between gap-5">
          <div className="flex w-full items-center gap-4">
            {quest.creator.username && (
              // <Link href={`/profile/${quest.username}`}>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              // </Link>
            )}

            <div className="w-full">
              <div className="flex w-full items-center justify-between gap-1">
                <div className=" flex flex-wrap items-center gap-1">
                  <p className="text-sm font-extrabold md:text-lg">
                    {quest.creator.username}
                  </p>
                  <p className=" text-xs font-bold opacity-70  md:text-sm">
                    {formatDistanceToNowStrict(new Date(quest.published_at))}{" "}
                    ago
                  </p>
                </div>

                <div className="flex flex-wrap ">
                  <div className="flex h-8  items-center gap-1">
                    <div className="hidden gap-2 sm:flex">
                      <p>due</p>
                      <Badge className="wax-w-28 bg-blue-9 flex h-6  min-w-[90px]">
                        <p>{format(new Date(quest.deadline), "PP")} </p>
                      </Badge>
                    </div>

                    <Badge className="h-6 w-16 justify-center bg-green-400 text-center">
                      <p className="text-sm font-bold">{quest.status}</p>
                    </Badge>
                  </div>
                </div>
              </div>
              <div className=" flex flex-wrap gap-2">
                <Badge className={TopicColor({ topic: quest.topic })}>
                  {quest.topic}
                </Badge>

                {(JSON.parse(quest.subtopics) as string[]).map(
                  (subtopic, i) => (
                    <Badge className="hidden bg-blue-400 sm:block" key={i}>
                      {subtopic}
                    </Badge>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <Link href={`/quests/${quest.id}`}>
        <CardContent className="md:16 h-30 max-h-[300px] min-h-[100px] overflow-x-hidden text-ellipsis  p-3 pt-0">
          <h3 className="font-default  text-xl font-bold dark:text-white">
            {quest.title}
          </h3>
          {includeContent && (
            <p className="font-default ">{quest.text_content}</p>
          )}
        </CardContent>
      </Link>

      {includeDetails && (
        <CardFooter className="dark:border-slate-6 flex gap-2 border-t-2 px-3 pb-2  pt-2">
          <span className="flex gap-2">
            <Gem className="text-purple-9" size={20} />

            <p className="text-purple-9">{quest.reward}</p>
          </span>

          <span className="flex gap-2">
            <Users2 className="text-slate-500 dark:text-slate-100" size={22} />
            <p className="text-slate-500 dark:text-slate-100">{`${quest.solvers_count}/${quest.slots}`}</p>
          </span>
        </CardFooter>
      )}
    </Card>
  );
}
