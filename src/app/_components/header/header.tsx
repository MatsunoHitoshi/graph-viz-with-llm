"use client";
import Image from "next/image";
import { Button } from "../button/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MixerHorizontalIcon } from "../icons";

export const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <div className="z-20 w-full p-2">
      <div className="flex h-14 w-full flex-row items-center justify-between rounded-2xl bg-slate-700 p-2 text-slate-50">
        <div className="text-lg font-semibold">
          <Button
            className="!py-0"
            onClick={() => {
              if (session) {
                router.push("/dashboard");
              } else {
                router.push("/");
              }
            }}
          >
            <div>ArTraverse</div>
            <div className="text-xs font-normal">
              (DocumentSemanticConnector)
            </div>
          </Button>
        </div>
        {!session ? (
          <Button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="text-sm underline hover:no-underline"
          >
            Sign In
          </Button>
        ) : (
          <div className="flex flex-row items-center gap-1">
            <div className="flex flex-row items-center">
              <Button
                onClick={() => {
                  router.push("/dashboard");
                }}
                className="flex !h-10 cursor-pointer flex-row items-center gap-1 rounded-md p-2 hover:bg-slate-50/10"
              >
                <MixerHorizontalIcon width={18} height={18} />
              </Button>
              <Button
                onClick={() => {
                  router.push("/account");
                }}
                className="flex cursor-pointer flex-row items-center gap-1 rounded-md p-2 hover:bg-slate-50/10"
              >
                <Image
                  alt=""
                  src={session.user.image ?? ""}
                  height={24}
                  width={24}
                  className="rounded-full border border-slate-50"
                />
                <div>{session.user.name}</div>
              </Button>
            </div>

            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm underline hover:no-underline"
            >
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
