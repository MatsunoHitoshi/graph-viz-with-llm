import React, { useState } from "react";
import { FileTextIcon, GearIcon, PlusIcon, StackIcon } from "../icons";
import { Button } from "../button/button";
import { useRouter } from "next/navigation";
import { TopicSpaceCreateModal } from "../topic-space/topic-space-create-modal";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

const Tab = ({
  label,
  icon,
  path,
}: {
  label: string;
  icon: React.ReactNode;
  path: string;
}) => {
  const router = useRouter();
  console.log("pathname", location.pathname, ",", path);
  return (
    <div
      className={`border-b-2 border-transparent ${location.pathname === path && "!border-slate-50 font-semibold"}`}
    >
      <Button
        onClick={() => {
          router.push(path);
        }}
        className={`flex cursor-pointer flex-row items-center gap-1 bg-transparent py-2 hover:bg-slate-50/10`}
      >
        <div className="h-4 w-4">{icon}</div>
        <div>{label}</div>
      </Button>
    </div>
  );
};

export const Tabs = ({ session }: { session: Session | null }) => {
  const router = useRouter();
  if (!!session) {
    return (
      <div className="flex flex-row items-end gap-4">
        <Button
          className={`rounded-none border-b-2 border-transparent bg-transparent !px-4 py-2 text-xl font-semibold ${location.pathname === "/dashboard" && "!border-slate-50"}`}
          onClick={() => {
            router.push("/dashboard");
          }}
        >
          Dashboard
        </Button>
        <div className="flex flex-row items-end text-sm">
          <Tab
            label="ドキュメント"
            icon={<FileTextIcon width={16} height={16} color="white" />}
            path={"/documents"}
          />
          <Tab
            label="トピックスペース"
            icon={<StackIcon width={16} height={16} color="white" />}
            path={"/topic-spaces"}
          />
          <Tab
            label="アカウント設定"
            icon={<GearIcon width={16} height={16} color="white" />}
            path={"/account"}
          />
        </div>
      </div>
    );
  } else {
    <></>;
  }
};

export const TabsContainer = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [topicSpaceCreateModalOpen, setTopicSpaceCreateModalOpen] =
    useState<boolean>(false);

  const NewContentButton = () => {
    switch (location.pathname) {
      case "/dashboard":
        return (
          <Button
            className="flex flex-row items-center gap-1"
            onClick={() => {
              router.push("/");
            }}
          >
            <PlusIcon width={16} height={16} color="white" />
            <div className="text-sm">新規ドキュメント</div>
          </Button>
        );
      case "/documents":
        return (
          <Button
            className="flex flex-row items-center gap-1"
            onClick={() => {
              router.push("/");
            }}
          >
            <PlusIcon width={16} height={16} color="white" />
            <div className="text-sm">新規ドキュメント</div>
          </Button>
        );
      case "/topic-spaces":
        return (
          <Button
            className="flex flex-row items-center gap-1"
            onClick={() => {
              setTopicSpaceCreateModalOpen(true);
            }}
          >
            <PlusIcon width={16} height={16} color="white" />
            <div className="text-sm">新規トピックスペース</div>
          </Button>
        );
      default:
        return <></>;
    }
  };
  return (
    <div className="h-full w-full p-2">
      <div className="flex h-full w-full flex-col divide-y divide-slate-400 overflow-hidden rounded-md border border-slate-400 text-slate-50">
        <div className="flex flex-row items-center justify-between">
          <Tabs session={session} />

          <div className="px-4">
            <NewContentButton />
          </div>
        </div>

        <div className="w-full overflow-y-scroll">{children}</div>
      </div>
      <TopicSpaceCreateModal
        isOpen={topicSpaceCreateModalOpen}
        setIsOpen={setTopicSpaceCreateModalOpen}
      />
    </div>
  );
};