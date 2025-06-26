import type { Metadata } from "next";
import { Toaster } from "sonner";
import { GeistSans, GeistMono } from "geist/font"; // Correct import
import "./globals.css";

export const metadata: Metadata = {
  title: "Werewolf Game",
  description: "A multiplayer Werewolf game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-[#0a0a1a] text-white">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
