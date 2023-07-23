"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ArrowBigRightDash } from "lucide-react";
import { Replicache } from "replicache";

import { STRANGER, WORKSPACE } from "~/utils/constants";
import { env } from "~/env.mjs";
import { wokrspaceMutators } from "~/repl/client/mutators/workspace";
import { Button } from "~/ui/Button";
import { WorkspaceStore } from "~/zustand/workspace";
import List from "./List";

export default function ListComponent({ children }: { children: ReactNode }) {
  const [showList, toggleShowList] = useState(true);
  const rep = WorkspaceStore((state) => state.rep);
  const setRep = WorkspaceStore((state) => state.setRep);

  const toggle = () => {
    toggleShowList((val) => !val);
    localStorage.setItem("workspaceList", JSON.stringify(!showList));
  };
  useEffect(() => {
    const showList = JSON.parse(
      localStorage.getItem("workspaceList") as string,
    ) as boolean | undefined | null;
    if (showList !== null && showList !== undefined) {
      toggleShowList(showList);
    }
  }, []);

  const { userId } = useAuth();

  useEffect(() => {
    if (rep) {
      return;
    }
    const r = new Replicache({
      name: `${WORKSPACE}#${userId ? userId : STRANGER}`,
      licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
      pushURL: `/api/replicache-push?spaceId=${WORKSPACE}`,
      pullURL: `/api/replicache-pull?spaceId=${WORKSPACE}`,
      mutators: wokrspaceMutators,
      pullInterval: null,
    });
    setRep(r);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rep, userId]);

  return (
    <>
      <List
        showList={showList}
        toggleShowList={toggle}
        rep={rep}
        userId={userId || STRANGER}
      />
      <div className={`workspaceContainer ${showList ? "adjust" : ""}`}>
        {!showList ? (
          <Button
            className="bg-blue-4 hover:bg-blue-5 absolute z-30 m-2"
            aria-label="open list"
            size="icon"
            onClick={() => toggle()}
          >
            <ArrowBigRightDash className="text-blue-9" />
          </Button>
        ) : null}
        {children}
      </div>
    </>
  );
}
