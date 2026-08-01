import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "TrustLane | The Trust Layer for Agentic Commerce",
  description: "Transparent AI decisions for confident commerce.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html className="dark" lang="en"><body className={inter.variable}>{children}</body></html>;
}
