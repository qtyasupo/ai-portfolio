import type { Metadata } from "next";
import "./globals.css";
import "./editorial.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://www.yasupo-hub.cn"),
  title: "Yasupo · AI 雷达与 AIGC 创作热点",
  description:
    "AI 模型、硬件、人物企业资讯与 AIGC 创作话题；追踪公开发文，保留作品来源。",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
