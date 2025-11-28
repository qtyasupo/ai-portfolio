import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yasupo | AI Creative Hub", // 浏览器标签页显示的标题
  description: "UI/UX Designer & AI Developer Portfolio", // 分享给别人时显示的简介
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        {/* 注意：body 标签上的 className 保持你原本的样子不要动 */}
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* 重点在这里：用 LanguageProvider 包裹住 children */}
          <LanguageProvider>
            {children}
          </LanguageProvider>
          
        </body>
      </html>
    );
}
