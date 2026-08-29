import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalAssistant from "@/components/GlobalAssistant";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IntelliHire - AI Career Intelligence",
  description: "AI-powered career intelligence and placement platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <GlobalAssistant />
      </body>
    </html>
  );
}
