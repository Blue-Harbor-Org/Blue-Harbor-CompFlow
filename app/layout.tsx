import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blue Harbor — Competitive Intelligence",
  description: "Find out exactly where you're losing to your competition. Free AI-powered competitive analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
