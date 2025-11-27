"use client";

import { useState } from "react";
// 引用刚才建立的数据文件
import { portfolioItems, categories } from "@/data/portfolio";
import Link from "next/link";

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  // 筛选逻辑：如果是 All 就显示全部，否则只显示对应分类
  const filteredItems = activeCategory === "All" 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeCategory);

  return (
    <main className="min-h-screen bg-background text-txt-main p-4 md:p-8 custom-scrollbar">
      {/* 1. 顶部导航栏 */}
      <div className="max-w-6xl mx-auto mb-8 md:mb-12 flex items-center gap-8">
        <Link href="/" className="text-txt-dim hover:text-white transition-colors font-mono text-sm">
          ← Back
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          AIGC Gallery
        </h1>
      </div>

      {/* 2. 分类筛选按钮组 */}
      <div className="max-w-6xl mx-auto mb-8 flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-mono transition-all whitespace-nowrap border
              ${activeCategory === cat 
                ? "bg-primary text-white border-primary" 
                : "bg-surface border-highlight hover:border-primary/50 text-txt-dim"}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. 作品网格展示区 */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredItems.map((item) => (
          <div key={item.id} className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-surface border border-highlight cursor-pointer">
            
            {/* 图片区域 - 这里的 img 标签负责显示真图 */}
<div className="absolute inset-0 bg-gray-900">
    <img 
      src={item.image} 
      alt={item.title} 
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
    />
</div>
            
            {/* 悬停时浮现的信息遮罩 */}
            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <span className="text-primary text-xs font-mono mb-2 uppercase tracking-wider">{item.tool}</span>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <span className="text-txt-dim text-xs mt-1">{item.category}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}