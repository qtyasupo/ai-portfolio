"use client";

import { useEffect } from "react";

interface NewsModalProps {
  news: {
    id: number;
    date: string;
    title: string;
  };
  onClose: () => void;
}

export default function NewsModal({ news, onClose }: NewsModalProps) {
  // 锁住背景滚动
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 1. 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>

      {/* 2. 弹窗主体 */}
      <div className="relative bg-[#1a1a1a] border border-highlight rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl animate-scale-up">
        
        {/* 关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-txt-dim hover:text-white transition-colors"
        >
          ✕
        </button>

        {/* 顶部标签 */}
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 font-mono">
            AI NEWS
          </span>
          <span className="text-xs text-txt-dim font-mono">{news.date}</span>
        </div>

        {/* 标题 */}
        <h3 className="text-xl md:text-2xl font-bold text-white mb-6 leading-relaxed">
          {news.title}
        </h3>

        {/* 模拟的 AI 深度解读 (因为 API 只返回了标题，这里我们模拟一段 AI 分析) */}
        <div className="bg-surface border border-highlight/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2 text-primary text-xs font-bold tracking-wider">
            <span>✨</span> GEMINI INSIGHT
          </div>
          <p className="text-sm text-txt-dim leading-relaxed">
            该事件标志着生成式 AI 领域的又一次重大突破。技术专家认为，这将显著改变现有的工作流，尤其是在创意产业与自动化领域。建议关注后续的 API 开放计划及商业化落地场景。
          </p>
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            Got it
          </button>
          <a 
            href="https://openai.com/news" // 这里可以放一个通用的科技新闻链接
            target="_blank"
            className="px-4 py-2 rounded-lg border border-highlight text-txt-dim text-sm hover:text-white hover:border-primary transition-all"
          >
            Read Source ↗
          </a>
        </div>

      </div>
    </div>
  );
}