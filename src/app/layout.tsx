import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/lib/auth";
import { NavigationGuardProvider } from "next-navigation-guard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beatmappd",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(nextAuthOptions);

  return (
    <html lang="en">
      <SessionProvider session={session}>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <NavigationGuardProvider>{children}</NavigationGuardProvider>
        </body>
      </SessionProvider>
    </html>
  );
}
