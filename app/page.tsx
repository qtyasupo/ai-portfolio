"use client";

import { useState } from "react";
import Link from "next/link";
import AiRadar from "@/components/AiRadar";

export default function Home() {
  // 定义控制弹窗的状态
  const [showContact, setShowContact] = useState(false);

  // 复制功能的小助手
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`已复制: ${text}`);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 flex justify-center text-txt-main custom-scrollbar relative">
      {/* 核心容器 */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
        
        {/* 1. Hero 区域 */}
        <div className="row-span-2 md:col-span-2 md:row-span-2 rounded-3xl bg-surface border border-highlight p-6 flex flex-col justify-between hover:border-primary/50 transition-colors duration-300">
          <div>
            <span className="text-primary font-mono text-sm tracking-wider">FULL STACK</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 flex flex-col gap-2">
              <span>Designing with</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary w-fit pb-2">
                Intelligence.
              </span>
            </h1>
          </div>
          <p className="text-txt-dim max-w-md text-lg mt-auto pt-4">
            连接 UI/UX 与人工智能。
          </p>
        </div>

        {/* 2. AI News */}
        <AiRadar />

        {/* 3. Showreel */}
        <Link 
          href="/gallery" 
          className="md:col-span-3 md:row-span-2 rounded-3xl bg-surface border border-highlight flex items-center justify-center relative overflow-hidden group cursor-pointer block"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
          <h2 className="z-20 text-3xl font-bold tracking-widest text-white/20 group-hover:text-white transition-all duration-500">
            SHOWREEL 2025
          </h2>
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
          >
            <source src="/demo.mp4" type="video/mp4" />
          </video>
        </Link>

        {/* 4. Tools */}
        <Link 
          href="/tools"
          className="md:col-span-1 md:row-span-1 rounded-3xl bg-surface border border-highlight p-6 flex items-center justify-center hover:bg-highlight/20 transition-colors cursor-pointer"
        >
           <span className="font-mono text-xl">🛠️ Tools</span>
        </Link>

        {/* 5. Contact (点击弹出) */}
        <div 
          onClick={() => setShowContact(true)}
          className="md:col-span-1 md:row-span-1 rounded-3xl bg-primary text-white p-6 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
        >
           <span className="font-bold text-xl">Let's Talk &rarr;</span>
        </div>

        {/* 6. Lab */}
        <Link 
           href="/lab"
           className="md:col-span-1 md:row-span-1 rounded-3xl bg-surface border border-highlight p-6 flex items-center justify-center hover:bg-highlight/20 transition-colors"
        >
           <span className="font-mono text-xl">🧪 Lab</span>
        </Link>

      </div>

      {/* --- 弹窗组件 (Modal) --- */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowContact(false)}
          ></div>
          
          {/* 弹窗卡片 */}
          <div className="relative bg-[#1a1a1a] border border-highlight p-8 rounded-3xl max-w-sm w-full shadow-2xl animate-pulse-once">
            <button 
              onClick={() => setShowContact(false)}
              className="absolute top-4 right-4 text-txt-dim hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-6 text-white">Contact Me</h3>
            
            <div className="space-y-4">
              {/* 邮箱 */}
              <div 
                onClick={() => handleCopy("your-email@example.com")}
                className="p-4 bg-surface rounded-xl border border-highlight/50 hover:border-primary cursor-pointer group transition-colors"
              >
                <p className="text-xs text-txt-dim mb-1">Email</p>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">lcx552443469ai@gmail.com</span>
                  <span className="text-xs text-primary opacity-0 group-hover:opacity-100">Copy</span>
                </div>
              </div>

              {/* 电话 */}
              <div 
                onClick={() => handleCopy("138-0000-0000")}
                className="p-4 bg-surface rounded-xl border border-highlight/50 hover:border-primary cursor-pointer group transition-colors"
              >
                <p className="text-xs text-txt-dim mb-1">Phone / WeChat</p>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">177-0000-0000</span>
                  <span className="text-xs text-primary opacity-0 group-hover:opacity-100">Copy</span>
                </div>
              </div>
            </div>
            
            <p className="mt-6 text-xs text-center text-txt-dim">
              点击卡片即可复制信息
            </p>
          </div>
        </div>
      )}

    </main>
  );
}