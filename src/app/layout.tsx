import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Retiro Convergir :: Rede 12 e 17",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={cn('antialiased w-full min-h-screen flex items-center justify-center bg-[url(/bg-layout.jpg)] bg-cover p-6', inter.className)}>
        {children}
      </body>
    </html>
  );
}
