import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "TrustLane | The Trust Operating System for Agentic Commerce",
  description: "Transparent AI research, human approval, and trusted checkout for agentic commerce.",
  icons: { icon: "/brand/trustlane-logo.svg", apple: "/brand/trustlane-logo.svg" },
  manifest: "/site.webmanifest",
  openGraph: { title: "TrustLane | The Trust Operating System for Agentic Commerce", description: "Transparent AI research, human approval, and trusted checkout for agentic commerce.", images: ["/brand/trustlane-og.jpeg"] },
  twitter: { card: "summary_large_image", title: "TrustLane | The Trust Operating System for Agentic Commerce", description: "Transparent AI research, human approval, and trusted checkout for agentic commerce.", images: ["/brand/trustlane-og.jpeg"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html className="dark" lang="en"><head><meta content="#39e3a4" name="theme-color" /></head><body className={inter.variable}>{children}</body></html>;
}
