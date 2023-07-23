"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BookOpenCheck, Search } from "lucide-react";

import { PublishedPost, PublishedQuest, User } from "@acme/db";

import { cn } from "~/utils/cn";
import { globalSearch } from "~/app/_actions/global-search";
import { useDebounce } from "~/hooks/use-debounce";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/Avatar";
import { Button } from "~/ui/Button";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "~/ui/Commang";
import { Skeleton } from "~/ui/Sceleton";

export default function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 700);
  const [data, setData] = React.useState<Record<string, any>[] | []>([]);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (debouncedQuery.length === 0) setData([]);

    if (debouncedQuery.length > 0) {
      startTransition(async () => {
        const data = await globalSearch(debouncedQuery);

        console.log("network", data);
        setData(data);
      });
    }
  }, [debouncedQuery]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((isOpen) => !isOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = React.useCallback((callback: () => unknown) => {
    setIsOpen(false);
    callback();
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  return (
    <>
      <Button
        variant="outline"
        className="bg-blue-2 dark:border-slate-6 dark:bg-slate-3 relative h-9 w-20 border-[1px] border-slate-200 p-0 lg:w-[300px] xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setIsOpen(true)}
      >
        <Search className="text-blue-9 h-4 w-4 xl:mr-2" aria-hidden="true" />
        <span className="text-blue-9 hidden xl:inline-flex">
          Global search...
        </span>
        <span className="sr-only">Search products</span>
        <kbd className="bg-slate-6 text-blue-9 pointer-events-none absolute  right-1.5 hidden h-6 select-none items-center gap-1 rounded px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-blue-9 text-xs">Ctrl</span>K
        </kbd>
      </Button>
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput
          placeholder="Search for users, quests, guild, posts..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {data.length === 0 && (
            <CommandEmpty
              className={cn(isPending ? "hidden" : "py-6 text-center text-sm")}
            >
              Nothing found.
            </CommandEmpty>
          )}
          {isPending ? (
            <div className="flex flex-col gap-2 space-y-1 overflow-hidden px-1 py-2">
              <Skeleton className="h-8 rounded-sm" />
              <Skeleton className="h-8 rounded-sm" />
            </div>
          ) : (
            data.map((_item) => {
              if (_item.type === "USER") {
                const item = _item as User;
                return (
                  <div
                    className="hover:bg-slate-4 flex h-14 w-full cursor-pointer items-center gap-2 p-2"
                    key={item.id}
                    onClick={() =>
                      handleSelect(() =>
                        router.push(`/profile/${item.username}`),
                      )
                    }
                  >
                    <Avatar className="flex items-center justify-center">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap font-bold">
                      {item.username}
                    </p>
                  </div>
                );
              }
              if (_item.type === "QUEST" || _item.type === "POST") {
                const item = _item as PublishedQuest & PublishedPost;
                return (
                  <div
                    className="hover:bg-slate-4 flex h-14 w-full cursor-pointer items-center gap-2 p-2"
                    key={item.id}
                    onClick={() =>
                      handleSelect(() =>
                        router.push(
                          item.type === "POST"
                            ? `/${item.destination}/${item.id}`
                            : `/quests/${item.id}`,
                        ),
                      )
                    }
                  >
                    <Avatar className="flex items-center justify-center">
                      <BookOpenCheck className="text-blue-9" />
                    </Avatar>
                    <div>
                      <p className="overflow-hidden text-ellipsis whitespace-nowrap font-bold dark:text-white">
                        {item.title}
                      </p>
                      <p>{item.text_content}</p>
                    </div>
                  </div>
                );
              }
            })
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
