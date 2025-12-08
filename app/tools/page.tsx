"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// 引入 AE 相关的数据组件
import { aeShortcutsData } from "@/data/aeShortcuts";
import { aeExpressionsData, aeFunctionsDocs } from "@/data/aeExpressions";
// 引入动画组件
import FadeIn from "@/components/FadeIn";

// 定义 AE 助手的子模式类型
type AeToolMode = 'shortcuts' | 'expressions';
// ✅ 把它贴在这里 (Import 下面，主函数上面)
const KeyCap = ({ children }: { children: React.ReactNode }) => (
  <kbd className="px-2 py-1.5 text-xs font-mono font-semibold bg-[#2a2a2a] border border-b-2 border-white/10 rounded-md shadow-sm text-white whitespace-nowrap mx-0.5">
    {children}
  </kbd>
);


export default function ToolsPage() {
  // --- 1. 全局状态 ---
  const [activeTool, setActiveTool] = useState("prompt-tuner");

  // --- 2. Prompt 工具状态 ---
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- 3. Color 工具状态 ---
  const [bgColor, setBgColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [ratio, setRatio] = useState(21);
  const [level, setLevel] = useState({ aa: true, aaa: true });

  // --- 4. AE 工具状态 ---
  const [aeMode, setAeMode] = useState<AeToolMode>('shortcuts');
  const [expressionTab, setExpressionTab] = useState<'examples' | 'functions'>('examples');

  // --- 逻辑: Prompt 优化 ---
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("已复制！");
  };

  // --- 逻辑: Color 对比度计算 ---
  useEffect(() => {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    }
    const getLuminance = (r: number, g: number, b: number) => {
      const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }
    const rgb1 = hexToRgb(bgColor);
    const rgb2 = hexToRgb(textColor);

    if (rgb1 && rgb2) {
      const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
      const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
      const currentRatio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      
      setRatio(parseFloat(currentRatio.toFixed(2)));
      setLevel({
        aa: currentRatio >= 4.5,
        aaa: currentRatio >= 7
      });
    }
  }, [bgColor, textColor]);

  return (
    <main className="min-h-screen bg-background text-txt-main flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Sidebar - 左侧导航栏 */}
      <aside className="w-full md:w-64 bg-surface border-r border-highlight flex-shrink-0 flex flex-col z-10">
        <div className="p-6 border-b border-highlight">
           <Link href="/" className="text-txt-dim hover:text-white transition-colors font-mono text-sm flex items-center gap-2">
             ← Back to Home
           </Link>
        </div>
        <div className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          
          <p className="text-xs text-txt-dim font-mono mb-4 px-2">AI TOOLS</p>
          <button 
            onClick={() => setActiveTool("prompt-tuner")}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-3
              ${activeTool === "prompt-tuner" ? "bg-primary text-white" : "hover:bg-highlight text-txt-dim"}
            `}
          >
            <span>✨</span> Prompt Tuner
          </button>
          
          <p className="text-xs text-txt-dim font-mono mt-6 mb-4 px-2">DESIGN TOOLS</p>
          <button 
            onClick={() => setActiveTool("color-checker")}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-3
              ${activeTool === "color-checker" ? "bg-primary text-white" : "hover:bg-highlight text-txt-dim"}
            `}
          >
            <span>🎨</span> Color Contrast
          </button>

          <p className="text-xs text-txt-dim font-mono mt-6 mb-4 px-2">VIDEO TOOLS</p>
          <button
            onClick={() => setActiveTool("ae-helper")}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-3
              ${activeTool === "ae-helper" ? "bg-primary text-white" : "hover:bg-highlight text-txt-dim"}
            `}
          >
            <span className="font-bold">Ae</span> AE Helper
          </button>
        </div>
      </aside>

      {/* Main Canvas - 右侧主内容区 */}
      <section className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#0A0A0A]">
        
        {/* === 工具 1: Prompt Tuner === */}
        {activeTool === "prompt-tuner" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
             <header className="mb-8">
               <h1 className="text-2xl font-bold mb-2 text-white">Prompt Optimizer</h1>
               <p className="text-txt-dim">AI 驱动的提示词润色工具</p>
             </header>
             <div className="max-w-3xl space-y-6">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入你的简单想法 (e.g. 赛博朋克猫)..."
                  className="w-full h-32 bg-surface border border-highlight rounded-2xl p-4 text-white focus:border-primary focus:outline-none transition-colors resize-none"
                />
                <div className="flex justify-end">
                  <button onClick={handleOptimize} disabled={isLoading || !input} className="bg-primary hover:bg-secondary transition-colors px-6 py-2 rounded-full text-white font-bold text-sm">
                    {isLoading ? "Optimizing..." : "Magic Optimize"}
                  </button>
                </div>
                {output && (
                  <div className="bg-[#1a1a1a] border border-primary/30 rounded-2xl p-6 relative group animate-fade-in">
                     <p className="text-gray-300 font-mono text-sm leading-relaxed">{output}</p>
                     <button onClick={() => copyToClipboard(output)} className="absolute top-4 right-4 text-xs text-primary hover:text-white transition-colors">Copy</button>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* === 工具 2: Color Checker === */}
        {activeTool === "color-checker" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar flex flex-col items-center justify-center animate-fade-in">
             <header className="mb-8 text-center">
               <h1 className="text-2xl font-bold mb-2 text-white">Color Contrast Analyzer</h1>
               <p className="text-txt-dim">检查配色是否符合 WCAG 无障碍标准</p>
             </header>

             <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
               {/* 预览卡片 */}
               <div 
                 className="aspect-square rounded-3xl flex flex-col items-center justify-center p-8 transition-colors border border-white/10 shadow-2xl relative overflow-hidden"
                 style={{ backgroundColor: bgColor }}
               >
                 <h2 className="text-5xl font-bold mb-4 text-center transition-colors" style={{ color: textColor }}>Aa</h2>
                 <p className="text-lg opacity-90 text-center max-w-xs transition-colors" style={{ color: textColor }}>
                   Good design is accessible design.
                 </p>
                 <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 opacity-50 font-mono text-xs mix-blend-difference text-white">
                    <span>BG: {bgColor}</span>
                    <span>Text: {textColor}</span>
                 </div>
               </div>

               {/* 控制面板 */}
               <div className="bg-surface border border-highlight rounded-3xl p-8 flex flex-col justify-center space-y-8">
                 <div>
                   <label className="text-xs font-mono text-txt-dim mb-2 block">TEXT COLOR</label>
                   <div className="flex items-center gap-4">
                     <div className="relative w-12 h-12 rounded-full overflow-hidden border border-highlight">
                        <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                     </div>
                     <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="bg-background border border-highlight px-3 py-2 rounded-lg font-mono text-white w-full uppercase focus:border-primary focus:outline-none" />
                   </div>
                 </div>
                 <div>
                   <label className="text-xs font-mono text-txt-dim mb-2 block">BACKGROUND COLOR</label>
                   <div className="flex items-center gap-4">
                     <div className="relative w-12 h-12 rounded-full overflow-hidden border border-highlight">
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                     </div>
                     <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="bg-background border border-highlight px-3 py-2 rounded-lg font-mono text-white w-full uppercase focus:border-primary focus:outline-none" />
                   </div>
                 </div>
                 <div className="pt-6 border-t border-highlight">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-white text-sm">Contrast Ratio</span>
                      <span className={`font-mono text-3xl font-bold ${ratio >= 4.5 ? 'text-green-400' : 'text-red-500'}`}>
                        {ratio} : 1
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`flex items-center justify-between p-3 rounded-lg border ${level.aa ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                         <span className="text-xs font-bold text-white">AA Normal</span>
                         <span className={`text-xs font-bold ${level.aa ? 'text-green-400' : 'text-red-500'}`}>{level.aa ? 'PASS' : 'FAIL'}</span>
                      </div>
                      <div className={`flex items-center justify-between p-3 rounded-lg border ${level.aaa ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                         <span className="text-xs font-bold text-white">AAA Normal</span>
                         <span className={`text-xs font-bold ${level.aaa ? 'text-green-400' : 'text-red-500'}`}>{level.aaa ? 'PASS' : 'FAIL'}</span>
                      </div>
                    </div>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* === 工具 3: AE Helper === */}
        {activeTool === "ae-helper" && (
          <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
            {/* Header */}
            <header className="flex-shrink-0 bg-surface border-b border-highlight p-4 md:px-8 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-purple-400">After Effects</span> 助手
                </h1>
                <p className="text-xs text-txt-dim mt-1">提高效率的快捷键与表达式库</p>
              </div>
              <div className="flex bg-background p-1 rounded-lg border border-highlight">
                <button
                  onClick={() => setAeMode('shortcuts')}
                  className={`px-4 py-1.5 text-sm rounded-md transition-all ${aeMode === 'shortcuts' ? 'bg-primary text-white shadow-sm' : 'text-txt-dim hover:text-white'}`}
                >
                  快捷键
                </button>
                <button
                  onClick={() => setAeMode('expressions')}
                  className={`px-4 py-1.5 text-sm rounded-md transition-all ${aeMode === 'expressions' ? 'bg-primary text-white shadow-sm' : 'text-txt-dim hover:text-white'}`}
                >
                  表达式
                </button>
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-[#0A0A0A]">
              
              {/* 快捷键视图 */}
              {aeMode === 'shortcuts' && (
                 <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                   {aeShortcutsData.map((category) => (
                     <div key={category.categoryName} className="bg-surface border border-highlight rounded-2xl overflow-hidden">
                        <div className="bg-white/5 px-6 py-3 border-b border-highlight">
                          <h2 className="text-sm font-bold text-purple-300">{category.categoryName}</h2>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                          {category.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-highlight/20 transition-colors">
                              <span className="text-sm text-txt-dim">{item.description}</span>
                              <div className="flex items-center gap-1">
                                {item.keys.map((key, kIdx) => (
                                  <KeyCap key={kIdx}>{key}</KeyCap>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                     </div>
                   ))}
                 </div>
              )}

              {/* 表达式视图 */}
              {aeMode === 'expressions' && (
                <div className="max-w-5xl mx-auto animate-fade-in">
                   <div className="flex gap-4 mb-8 border-b border-highlight pb-2">
                     <button
                       onClick={() => setExpressionTab('examples')}
                       className={`pb-2 text-sm font-bold transition-colors relative ${expressionTab === 'examples' ? 'text-white' : 'text-txt-dim hover:text-white'}`}
                     >
                       常用案例 (Top 20)
                       {expressionTab === 'examples' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>}
                     </button>
                     <button
                       onClick={() => setExpressionTab('functions')}
                       className={`pb-2 text-sm font-bold transition-colors relative ${expressionTab === 'functions' ? 'text-white' : 'text-txt-dim hover:text-white'}`}
                     >
                       核心函数详解
                       {expressionTab === 'functions' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>}
                     </button>
                   </div>

               {/* 表达式列表 - 改为瀑布流布局 */}
                   {expressionTab === 'examples' && (
                     <div className="columns-1 lg:columns-2 gap-6 space-y-6">
                       {aeExpressionsData.map((expr, idx) => (
                         <div key={idx} className="break-inside-avoid mb-6">
                           <FadeIn delay={idx * 0.05}>
                             <div className="bg-surface border border-highlight rounded-2xl overflow-hidden flex flex-col h-full group hover:border-primary/50 transition-all">
                               {/* 演示图片/GIF区域 (如果有) */}
                               {expr.imageSrc && (
                                 <div className="h-40 bg-black/50 border-b border-highlight relative overflow-hidden">
                                    <img src={expr.imageSrc} alt={expr.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center text-txt-dim text-xs opacity-0 group-hover:opacity-100 pointer-events-none">
                                       (演示预览)
                                    </div>
                                 </div>
                               )}

                               <div className="p-6 flex-1 flex flex-col">
                                 <h3 className="text-lg font-bold text-white mb-2">{expr.title}</h3>
                                 <p className="text-sm text-txt-main mb-4 flex-grow">{expr.description}</p>

                                 {/* 代码块 */}
                                 <div className="bg-[#0d0d0d] border border-white/10 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto relative group/code my-4">
                                   <pre className="whitespace-pre-wrap break-all">{expr.code}</pre>
                                   <button
                                     onClick={() => {
                                        copyToClipboard(expr.code);
                                        alert("代码已复制!");
                                     }}
                                     className="absolute top-2 right-2 bg-primary/20 text-primary text-xs px-2 py-1 rounded opacity-0 group-hover/code:opacity-100 transition-opacity hover:bg-primary hover:text-white"
                                   >
                                     Copy
                                   </button>
                                 </div>

                                 <div className="bg-highlight/10 p-3 rounded-lg text-xs text-txt-dim mt-auto">
                                   <span className="font-bold text-primary">💡 使用方法: </span>
                                   {expr.usage}
                                 </div>
                               </div>
                             </div>
                           </FadeIn>
                         </div>
                       ))}
                     </div>
                   )}

                   {/* 函数文档 */}
                   {expressionTab === 'functions' && (
                     <div className="space-y-4">
                        {aeFunctionsDocs.map((func, idx) => (
                          <div key={idx} className="bg-surface border border-highlight rounded-xl p-6">
                             <h3 className="text-xl font-mono font-bold text-purple-300 mb-2">{func.name}</h3>
                             <p className="text-sm text-txt-dim bg-[#0d0d0d] p-2 rounded font-mono border border-white/10 mb-4 inline-block">
                               语法: {func.syntax}
                             </p>
                             <p className="text-txt-main mb-4">{func.description}</p>
                             <div className="bg-highlight/10 p-3 rounded-lg text-sm font-mono text-txt-dim">
                                <span className="text-primary font-bold mr-2">例:</span>
                                {func.example}
                             </div>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>
        )}

      </section>
    </main>
  );
}