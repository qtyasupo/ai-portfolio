"use client";

import { useState } from "react";

export default function AiRadar() {
  // 1. 定义新闻数据状态
  const [news, setNews] = useState([
    { id: 1, date: "TODAY", title: "OpenAI 发布 Sora v2，视频生成质量惊人" },
    { id: 2, date: "YESTERDAY", title: "Midjourney v7 更新，专注细节控制" },
    { id: 3, date: "2 DAYS AGO", title: "Google DeepMind 新论文解析" },
    { id: 4, date: "LAST WEEK", title: "React 19 发布 RC 版本" },
  ]);

  // 2. 定义加载状态
  const [isLoading, setIsLoading] = useState(false);

  // 3. 处理点击事件 (连接真实后端)
  const handleSummarize = async () => {
    setIsLoading(true);

    try {
      // A. 发起请求：呼叫我们刚才写的后端接口
      const response = await fetch("/api/summarize", {
        method: "POST",
      });

      // B. 解析结果
      const result = await response.json();

      // C. 如果拿到数据，就更新界面
      if (result.data) {
        setNews(result.data);
      }
    } catch (error) {
      console.error("请求失败:", error);
      alert("AI 似乎开小差了，请检查网络");
    } finally {
      // D. 无论成功失败，都要结束加载状态
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full rounded-3xl bg-surface border border-highlight p-6 flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 blur-[50px] rounded-full"></div>
      
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        AI Radar
      </h2>

      <div className="space-y-4 text-sm text-txt-dim overflow-y-auto flex-1 pr-2 custom-scrollbar">
        {news.map((item) => (
          <div 
            key={item.id} 
            className="p-3 bg-background rounded-xl border border-highlight/50 hover:border-primary transition-colors cursor-pointer"
          >
            <span className="text-xs text-primary font-mono">{item.date}</span>
            <p className="mt-1 text-txt-main truncate">{item.title}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-highlight/50">
        <button 
          onClick={handleSummarize}
          disabled={isLoading} 
          className={`w-full py-2 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-2
            ${isLoading ? "bg-highlight text-txt-dim cursor-wait" : "bg-highlight hover:bg-primary/80 text-white"}
          `}
        >
           {isLoading ? (
             <>
               <span className="animate-spin">⏳</span> AI Thinking...
             </>
           ) : (
             <>✨ AI Summarize</>
           )}
        </button>
      </div>
    </div>
  );
}