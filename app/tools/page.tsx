"use client";

import { useState } from "react";
import Link from "next/link";

export default function ToolsPage() {
  // 1. 状态管理：当前选中的工具 ID
  const [activeTool, setActiveTool] = useState("prompt-tuner");
  
  // Prompt 工具的状态
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 调用 AI 的逻辑
  const handleOptimize = async () => {
    if (!input) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      setOutput(data.result);
    } catch (e) {
      alert("Error generating prompt");
    } finally {
      setIsLoading(false);
    }
  };

  // 复制功能
  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert("已复制到剪贴板！");
  };

  return (
    <main className="min-h-screen bg-background text-txt-main flex flex-col md:flex-row overflow-hidden">
      
      {/* === 左侧侧边栏 (Figma Sidebar Style) === */}
      <aside className="w-full md:w-64 bg-surface border-r border-highlight flex-shrink-0 flex flex-col">
        {/* Logo / Home Area */}
        <div className="p-6 border-b border-highlight">
           <Link href="/" className="text-txt-dim hover:text-white transition-colors font-mono text-sm flex items-center gap-2">
             ← Back to Home
           </Link>
        </div>

        {/* 菜单列表 */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="text-xs text-txt-dim font-mono mb-4 px-2">AI TOOLS</p>
          
          <button 
            onClick={() => setActiveTool("prompt-tuner")}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-3
              ${activeTool === "prompt-tuner" ? "bg-primary text-white" : "hover:bg-highlight text-txt-dim"}
            `}
          >
            <span>✨</span> Prompt Tuner
          </button>

          <button 
            disabled
            className="w-full text-left px-4 py-3 rounded-lg text-sm text-txt-dim/50 cursor-not-allowed flex items-center gap-3"
          >
            <span>🎨</span> Color Gen (Soon)
          </button>
        </div>
      </aside>


      {/* === 右侧主内容区 (Canvas Area) === */}
      <section className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* 顶部标题栏 (统一左对齐) */}
        <header className="p-6 md:p-8 border-b border-highlight flex items-center gap-4 bg-background/50 backdrop-blur-md z-10">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
             P
           </div>
           <div>
             <h1 className="text-xl font-bold">Prompt Optimizer</h1>
             <p className="text-xs text-txt-dim">让 AI 帮你把简单想法变成大师级咒语</p>
           </div>
        </header>

        {/* 工具操作区 (居中显示的卡片) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-[#0A0A0A]">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* 输入区 */}
            <div className="space-y-2">
              <label className="text-sm text-txt-dim font-mono">YOUR IDEA (CHINESE/ENGLISH)</label>
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="例如：一只赛博朋克风格的猫，在雨夜的街道..."
                className="w-full h-32 bg-surface border border-highlight rounded-2xl p-4 text-white focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* 执行按钮 */}
            <div className="flex justify-end">
              <button 
                onClick={handleOptimize}
                disabled={isLoading || !input}
                className={`px-6 py-2 rounded-full font-mono text-sm transition-all flex items-center gap-2
                  ${isLoading ? "bg-highlight cursor-wait" : "bg-primary hover:bg-secondary text-white"}
                `}
              >
                {isLoading ? "Optimizing..." : "✨ Magic Optimize"}
              </button>
            </div>

            {/* 输出区 (仅当有结果时显示) */}
            {output && (
              <div className="space-y-2 animate-pulse-once">
                <div className="flex justify-between items-end">
                  <label className="text-sm text-primary font-mono">OPTIMIZED PROMPT</label>
                  <button onClick={copyToClipboard} className="text-xs text-txt-dim hover:text-white underline">
                    Copy Result
                  </button>
                </div>
                <div className="bg-[#1a1a1a] border border-primary/30 rounded-2xl p-6 text-gray-300 leading-relaxed font-mono text-sm relative group">
                   {output}
                   <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs bg-primary px-2 py-1 rounded text-white">Midjourney Ready</span>
                   </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

    </main>
  );
}