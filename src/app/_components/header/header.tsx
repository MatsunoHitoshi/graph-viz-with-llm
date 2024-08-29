"use client";
import Image from "next/image";
import { Button } from "../button/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <div className="z-20 flex h-16 w-full flex-row items-center justify-between bg-slate-700 p-4 text-slate-50">
      <div className="text-lg font-semibold">
        <Button
          onClick={() => {
            router.push("/");
          }}
        >
          Graph Visualization with LLM
        </Button>
      </div>
      {!session ? (
        <Button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="text-sm underline hover:no-underline"
        >
          Sign In
        </Button>
      ) : (
        <div className="flex flex-row items-center gap-1">
          <Button
            onClick={() => {
              router.push("/dashboard");
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

          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm underline hover:no-underline"
          >
            Sign Out
          </Button>
        </div>
      )}
    </div>
  );
};
