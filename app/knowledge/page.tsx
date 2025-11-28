"use client";

import { useState } from "react";
import Link from "next/link";
import { knowledgeBase } from "@/data/knowledge";

export default function KnowledgePage() {
  // 状态：当前正在阅读哪篇文章（默认第一篇）
  const [activeDoc, setActiveDoc] = useState(knowledgeBase[0]);

  return (
    <main className="h-screen bg-[#191919] text-txt-main flex overflow-hidden font-sans">
      
      {/* === 左侧侧边栏 (Notion Sidebar) === */}
      <aside className="w-72 bg-[#202020] border-r border-[#2f2f2f] flex flex-col flex-shrink-0">
        
        {/* 顶部返回区 */}
        <div className="p-4 border-b border-[#2f2f2f] flex items-center gap-3">
           <Link href="/" className="w-6 h-6 rounded hover:bg-[#3f3f3f] flex items-center justify-center text-xs text-txt-dim transition-colors">
             ←
           </Link>
           <div className="flex items-center gap-2">
             <div className="w-4 h-4 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">Y</div>
             <span className="font-bold text-sm text-gray-200">Yasupo's Wiki</span>
           </div>
        </div>

        {/* 文章列表 */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <p className="text-[10px] text-gray-500 font-bold px-3 py-2 mt-2 tracking-wider">RECENT READS</p>
          <div className="space-y-0.5">
            {knowledgeBase.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setActiveDoc(doc)}
                className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
                  ${activeDoc.id === doc.id ? "bg-[#2f2f2f] text-white" : "text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-300"}
                `}
              >
                {/* 根据类型显示不同 emoji 图标 */}
                <span className="opacity-70">
                  {doc.type === 'video' ? '📺' : doc.type === 'article' ? '📄' : '📝'}
                </span>
                <span className="truncate">{doc.title}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* 底部状态栏 */}
        <div className="p-3 border-t border-[#2f2f2f] text-[10px] text-gray-600 flex justify-between">
           <span>Updated just now</span>
           <span>v1.0.2</span>
        </div>
      </aside>

      {/* === 右侧阅读区 (Notion Canvas) === */}
      <section className="flex-1 overflow-y-auto custom-scrollbar bg-[#191919]">
        <div className="max-w-3xl mx-auto py-16 px-8 md:px-12">
          
          {/* 1. 文章头部信息 */}
          <div className="mb-10 pb-8 border-b border-[#2f2f2f]">
            {/* 图标大标题 */}
            <div className="text-5xl mb-6">
               {activeDoc.type === 'video' ? '📺' : activeDoc.type === 'article' ? '📄' : '📝'}
            </div>
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">{activeDoc.title}</h1>
            
            {/* 属性信息 (Properties) */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-4">
                 <span className="w-20 text-gray-500">Source</span>
                 <span className="bg-[#2f2f2f] px-2 py-0.5 rounded text-gray-300 border border-[#3f3f3f] underline decoration-dotted">
                   {activeDoc.source}
                 </span>
              </div>
              <div className="flex items-center gap-4">
                 <span className="w-20 text-gray-500">Date</span>
                 <span className="text-gray-300">{activeDoc.date}</span>
              </div>
              <div className="flex items-center gap-4">
                 <span className="w-20 text-gray-500">Tags</span>
                 <div className="flex gap-2">
                    {activeDoc.tags.map(tag => (
                      <span key={tag} className="px-2 rounded bg-purple-500/10 text-purple-400">#{tag}</span>
                    ))}
                 </div>
              </div>
            </div>
          </div>

          {/* 2. 内容渲染器 (把 Block 变成 HTML) */}
          <div className="space-y-6 text-gray-300 leading-relaxed text-lg font-light">
            {activeDoc.content.map((block, index) => {
              // 渲染文字
              if (block.type === 'text') return <p key={index}>{block.value}</p>;
              
              // 渲染图片
              if (block.type === 'image') return (
                <div key={index} className="rounded-xl overflow-hidden border border-[#2f2f2f] my-6 shadow-2xl">
                  <img src={block.value} alt="content" className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity" />
                </div>
              );
              
              // 渲染引用 (Quote)
              if (block.type === 'quote') return (
                <div key={index} className="border-l-4 border-white pl-6 py-2 my-8 text-xl text-white italic font-serif">
                  "{block.value}"
                </div>
              );
              
              // 渲染链接
              if (block.type === 'link') return (
                <a key={index} href={block.value} target="_blank" className="flex items-center gap-2 text-blue-400 hover:underline p-4 rounded bg-[#2f2f2f]/50 border border-[#2f2f2f] hover:border-blue-500/50 transition-colors">
                  🔗 <span className="truncate">{block.value}</span>
                </a>
              );

              // --- 新增：列表渲染 (用于展示技术栈) ---
              if (block.type === 'list') return (
                <ul key={index} className="list-disc pl-5 space-y-2 marker:text-primary">
                  {(block.value as string[]).map((item, i) => (
                    <li key={i} className="text-gray-300">{item}</li>
                  ))}
                </ul>
              );

              // --- 新增：代码块渲染 (用于展示核心代码) ---
              if (block.type === 'code') return (
                <div key={index} className="my-6 rounded-lg overflow-hidden border border-[#333] bg-[#0d0d0d]">
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border-b border-[#333]">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span className="ml-2 text-xs text-gray-500 font-mono">source_code.ts</span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm font-mono text-green-400 leading-relaxed">
                    {block.value}
                  </pre>
                </div>
              );
            })}
          </div>

        </div>
      </section>
    </main>
  );
}