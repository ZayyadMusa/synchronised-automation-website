import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/site-shell";

export const metadata: Metadata = {
  title: { default: "Synchronised Automation LTD | Smart Homes. Connected Businesses.", template: "%s | Synchronised Automation LTD" },
  description: "Smart home automation, security, network engineering, communications and renewable energy solutions. Synchronised Automation LTD, Port Harcourt, Nigeria.",
  other: {
    "robots": "noindex, nofollow",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><SiteHeader />{children}<SiteFooter /></body>
    </html>
  );
}
