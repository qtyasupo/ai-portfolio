"use client";

import { useState } from "react";
import Link from "next/link";
import AiRadar from "@/components/AiRadar";
import FadeIn from "@/components/FadeIn";
// 1. 引入我们的语言 Hook
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const [showContact, setShowContact] = useState(false);
  // 2. 获取当前字典 t 和切换函数 toggleLanguage
  const { t, locale, toggleLanguage } = useLanguage();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`${t.contact.copied}: ${text}`);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 flex justify-center text-txt-main custom-scrollbar relative">
      
      {/* --- 语言切换浮窗 (右上角) --- */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={toggleLanguage}
          className="px-4 py-2 rounded-full bg-surface border border-highlight text-xs font-mono hover:border-primary transition-all flex items-center gap-2 backdrop-blur-md"
        >
          <span>🌐</span>
          <span className={locale === 'en' ? 'text-white' : 'text-txt-dim'}>EN</span>
          <span className="text-txt-dim">/</span>
          <span className={locale === 'zh' ? 'text-white' : 'text-txt-dim'}>中</span>
        </button>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px] mt-12 md:mt-0">
        
        {/* 1. Hero 区域 */}
        <FadeIn className="row-span-2 md:col-span-2 md:row-span-2 rounded-3xl bg-surface border border-highlight p-6 flex flex-col justify-between hover:border-primary/50 transition-colors duration-300">
          <div>
             <div className="w-12 h-12 mb-4 rounded-xl overflow-hidden">
                <img src="/icon.png" alt="Logo" className="w-full h-full object-cover" />
             </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mt-4 flex flex-col gap-2">
              <span>{t.hero.title_1}</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary w-fit pb-2">
                {t.hero.title_2}
              </span>
            </h1>
          </div>
          <p className="text-txt-dim max-w-md text-lg mt-auto pt-4">
            {t.hero.desc} {/* 替换成变量 */}
          </p>
        </FadeIn>

        {/* 2. AI News */}
        <FadeIn delay={0.1} className="md:col-span-1 md:row-span-2 h-full">
           <AiRadar />
        </FadeIn>

        {/* 3. Showreel */}
        <FadeIn delay={0.2} className="md:col-span-3 md:row-span-2">
          <Link 
            href="/gallery" 
            className="w-full h-full rounded-3xl bg-surface border border-highlight flex items-center justify-center relative overflow-hidden group cursor-pointer block"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
            <h2 className="z-20 text-3xl font-bold tracking-widest text-white/20 group-hover:text-white transition-all duration-500 uppercase">
              {t.cards.showreel} {/* 替换成变量 */}
            </h2>
            <video 
              autoPlay loop muted playsInline 
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
            >
              <source src="/demo.mp4" type="video/mp4" />
            </video>
          </Link>
        </FadeIn>

        {/* 4. Tools */}
        <FadeIn delay={0.3} className="md:col-span-1 md:row-span-1">
          <Link 
            href="/tools"
            className="w-full h-full rounded-3xl bg-surface border border-highlight p-6 flex items-center justify-center hover:bg-highlight/20 transition-colors cursor-pointer"
          >
             <span className="font-mono text-xl">🛠️ {t.cards.tools}</span>
          </Link>
        </FadeIn>

        {/* 5. Contact */}
        <FadeIn delay={0.4} className="md:col-span-1 md:row-span-1">
          <div 
            onClick={() => setShowContact(true)}
            className="w-full h-full rounded-3xl bg-primary text-white p-6 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
          >
             <span className="font-bold text-xl">{t.cards.talk} &rarr;</span>
          </div>
        </FadeIn>

        {/* 6. Knowledge */}
        <FadeIn delay={0.5} className="md:col-span-1 md:row-span-1">
          <Link 
             href="/knowledge"
             className="w-full h-full rounded-3xl bg-surface border border-highlight p-6 flex items-center justify-center hover:bg-highlight/20 transition-colors"
          >
             <span className="font-mono text-xl">📚 {t.cards.lab}</span>
          </Link>
        </FadeIn>

      </div>

      {/* --- 弹窗组件 --- */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowContact(false)}
          ></div>
          
          <div className="relative bg-[#1a1a1a] border border-highlight p-8 rounded-3xl max-w-sm w-full shadow-2xl animate-pulse-once">
            <button 
              onClick={() => setShowContact(false)}
              className="absolute top-4 right-4 text-txt-dim hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-6 text-white">{t.contact.title}</h3>
            
            <div className="space-y-4">
              <div 
                onClick={() => handleCopy("your-email@example.com")}
                className="p-4 bg-surface rounded-xl border border-highlight/50 hover:border-primary cursor-pointer group transition-colors"
              >
                <p className="text-xs text-txt-dim mb-1">Email</p>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">your-email@example.com</span>
                  <span className="text-xs text-primary opacity-0 group-hover:opacity-100">{t.contact.copy}</span>
                </div>
              </div>

              <div 
                onClick={() => handleCopy("138-0000-0000")}
                className="p-4 bg-surface rounded-xl border border-highlight/50 hover:border-primary cursor-pointer group transition-colors"
              >
                <p className="text-xs text-txt-dim mb-1">Phone / WeChat</p>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">138-0000-0000</span>
                  <span className="text-xs text-primary opacity-0 group-hover:opacity-100">{t.contact.copy}</span>
                </div>
              </div>
            </div>
            
            <p className="mt-6 text-xs text-center text-txt-dim">
              {t.contact.hint}
            </p>
          </div>
        </div>
      )}

    </main>
  );
}