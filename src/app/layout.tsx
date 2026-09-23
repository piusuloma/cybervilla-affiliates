import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/layout/Shell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CyberVilla Affiliate Portal",
  description: "Track your performance, links, codes, transactions, and payouts as a CyberVilla affiliate.",
  icons: {
    icon: "/images/Login-bg.png",
    shortcut: "/images/Login-bg.png",
    apple: "/images/Login-bg.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col dark">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
