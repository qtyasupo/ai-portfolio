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
  // 1. 设置基础域名 (解决图片路径问题)，填你 Vercel 的网址
  metadataBase: new URL("https://ai-portfolio-ashy.vercel.app"), 
  
  title: "Yasupo | AI Creative Hub",
  description: "UI/UX Designer & AI Developer Portfolio",
  
  // 2. 显式指定 Open Graph 图片
  openGraph: {
    title: "Yasupo | AI Creative Hub",
    description: "UI/UX Designer & AI Developer Portfolio",
    url: "/",
    siteName: "Yasupo's Portfolio",
    images: [
      {
        url: "/opengraph-image.png", // 指向 public 文件夹里的图
        width: 1200,
        height: 630,
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
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
