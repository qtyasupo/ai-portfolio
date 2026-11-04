import type { Metadata } from "next";
import "./globals.css";
import "./editorial.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://www.yasupo-hub.cn"),
  title: "Yasupo · AI 创作雷达",
  description:
    "从抖音、小红书、YouTube 与 X，追踪 AI 视频、短剧与代码动画的创作线索。",
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
