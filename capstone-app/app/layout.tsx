import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/lib/uploadthing";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ericahlicious Cafe | POS & Management",
  description: "Cafe management system for orders, menu, inventory, and reports.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          {children}
          <Toaster richColors position="top-right" />
        </body>
    </html>
  );
}
