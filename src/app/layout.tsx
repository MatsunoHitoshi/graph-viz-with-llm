import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "@/trpc/react";
import { UrlCopy } from "./_components/url-copy/url-copy";
import NextAuthProvider from "@/providers/next-auth";
import { Header } from "./_components/header/header";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "ArTraverse(DocumentSemanticConnector)",
  description: "関係性の宇宙を横断する可視化ツール",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <Analytics />
      <body>
        <TRPCReactProvider>
          <NextAuthProvider>
            <div className="fixed top-0 w-full">
              <Header />
            </div>
            <div>
              <div className="flex flex-col gap-8 pt-16 sm:hidden">
                <div className="flex flex-row items-center justify-center pt-[200px] text-center text-xl font-semibold">
                  このアプリはスマートフォンの
                  <br />
                  画面サイズに対応していません😖
                  <br />
                  <br />
                  PC・タブレットにてご利用ください🙇‍♂️
                </div>
                <div className="flex flex-row justify-center">
                  <UrlCopy>このページのURLをコピーする</UrlCopy>
                </div>
              </div>
              <div className="hidden sm:block">{children}</div>
            </div>
          </NextAuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
