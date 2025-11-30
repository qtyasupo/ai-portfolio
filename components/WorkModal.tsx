"use client";

import { useEffect } from "react";

// 定义 props 类型，告诉组件它会收到什么数据
interface WorkModalProps {
  item: {
    title: string;
    category: string;
    tool: string;
    image: string;
    prompt?: string; // 问号表示这个字段可能有，也可能没有
  };
  onClose: () => void; // 关闭函数
}

export default function WorkModal({ item, onClose }: WorkModalProps) {
  // 阻止背景滚动 (打开弹窗时，背景网页不能滚)
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleCopy = () => {
    if (item.prompt) {
      navigator.clipboard.writeText(item.prompt);
      alert("Prompt Copied!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* 1. 黑色半透明背景遮罩 (点击关闭) */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>

      {/* 2. 弹窗主体 (左右布局：左图右文) */}
      <div className="relative bg-[#1a1a1a] border border-highlight rounded-3xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl animate-scale-up">
        
        {/* 关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-colors"
        >
          ✕
        </button>

        {/* 左侧：大图区域 */}
        <div className="w-full md:w-2/3 bg-[#050505] flex items-center justify-center p-4">
          <img 
            src={item.image} 
            alt={item.title} 
            className="max-w-full max-h-[50vh] md:max-h-full object-contain rounded-lg shadow-lg" 
          />
        </div>

        {/* 右侧：信息与 Prompt */}
        <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col bg-surface border-l border-highlight">
          
          {/* 标题信息 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
               <span className="px-2 py-1 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/30 uppercase">
                 {item.tool}
               </span>
               <span className="text-xs text-txt-dim uppercase tracking-wider">{item.category}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">{item.title}</h2>
          </div>

          {/* Prompt 区域 (核心亮点) */}
          {item.prompt && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-end mb-2">
                <label className="text-xs font-mono text-txt-dim">GENERATION PROMPT</label>
                <button 
                  onClick={handleCopy}
                  className="text-xs flex items-center gap-1 text-primary hover:text-white transition-colors"
                >
                  📋 Copy
                </button>
              </div>
              <div className="flex-1 bg-[#0A0A0A] border border-highlight rounded-xl p-4 overflow-y-auto custom-scrollbar group relative">
                <p className="text-sm text-gray-400 font-mono leading-relaxed break-words">
                  {item.prompt}
                </p>
                {/* 底部渐变遮罩，提示下面还有内容 (可选) */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none"></div>
              </div>
            </div>
          )}

          {/* 底部版权或其他信息 */}
          <div className="mt-6 pt-6 border-t border-highlight/50">
             <p className="text-xs text-txt-dim">Created by [Yasupo] · 2025</p>
          </div>

        </div>
      </div>
    </div>
  );
}