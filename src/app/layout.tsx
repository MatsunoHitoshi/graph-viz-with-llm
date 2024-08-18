import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata = {
  title: "Graph Visualization with LLM",
  description: "Graph Visualization with LLM",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <div className="fixed top-0 w-full">
            <div className="flex h-16 w-full flex-row items-center justify-start bg-slate-700 p-4 text-slate-50">
              <div className="text-lg font-semibold">
                <a href="/">Graph Visualization with LLM</a>
              </div>
            </div>
          </div>

          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
