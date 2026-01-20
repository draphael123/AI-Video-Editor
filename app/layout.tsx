import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClipCraft AI - AI-Powered Video Editor",
  description:
    "Edit videos with natural language. Cut, enhance, add captions, and export—all with simple prompts.",
  keywords: [
    "video editor",
    "AI video editing",
    "natural language video editing",
    "automatic captions",
    "video processing",
  ],
  authors: [{ name: "ClipCraft AI" }],
  openGraph: {
    title: "ClipCraft AI - AI-Powered Video Editor",
    description: "Edit videos with natural language prompts",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

