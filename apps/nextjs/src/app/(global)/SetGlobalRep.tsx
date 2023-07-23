"use client";
import { Replicache } from "replicache";
import { env } from "~/env.mjs";
import { GLOBAL_CHAT, PUBLISHED_QUESTS, STRANGER, USER } from "~/utils/constants";
import { ReplicacheInstancesStore } from "~/zustand/rep";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { userMutators } from "~/repl/client/mutators/user";
import { GlobalStore } from "~/zustand/global";
export default function SetGlobalRep() {
//   const rep = ReplicacheInstancesStore((state) => state.globalRep);
//   const setRep = ReplicacheInstancesStore((state) => state.setGlobalRep);
//   const globalChatRep = ReplicacheInstancesStore(
//     (state) => state.globalChatRep
//   );
//   const setGlobalChatRep = ReplicacheInstancesStore(
//     (state) => state.setGlobalChatRep
//   );
//   const globalChatChannel = GlobalStore((state) => state.channel);

//   const { userId } = useAuth();

//   useEffect(() => {
//     if (rep) {
//       return;
//     }

//     const r = new Replicache({
//       name: `${USER}#${userId ? userId : STRANGER}`,
//       licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
//       pushURL: `/api/replicache-push?spaceId=${USER}`,
//       pullURL: `/api/replicache-pull?spaceId=${USER}`,
//       mutators: userMutators,
//       pullInterval: null,
//     });

   
//     setRep(r);

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [rep, userId]);
  // useEffect(() => {
  //   if (rep) {
  //     return;
  //   }

  //   const r = new Replicache({
  //     name: "GLOBAL_CHAT",
  //     licenseKey: env.NEXT_PUBLIC_REPLICACHE_KEY,
  //     pushURL: `/api/replicache-push?spaceId=${GLOBAL_CHAT}`,
  //     pullURL: `/api/replicache-pull?spaceId=${GLOBAL_CHAT}`,
  //     mutators: globalChatMutators,
  //     pullInterval: null,
  //   });

   
  //   setGlobalChatRep(r);

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [rep]);
  return <></>;
}
