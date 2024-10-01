"use client";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { TabsContainer } from "../tab/tab";
export const Account = () => {
  const { data: session } = useSession();
  const { data: documents } = api.sourceDocument.getListBySession.useQuery();
  if (!session) return null;
  return (
    <TabsContainer>
      <></>
    </TabsContainer>
  );
};
