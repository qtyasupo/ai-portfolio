import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google"; // 假设你用了这两个字体，如果没有就保留你原有的
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { Analytics } from "@vercel/analytics/react";
// 1. 引入 Clerk 提供者
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "Yasupo | AI Creative Hub",
  description: "UI/UX Designer & AI Developer Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 2. 关键点：ClerkProvider 必须包在最最外面（包住 html）
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
          <LanguageProvider>
            {children}
            <Analytics />
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}