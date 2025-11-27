"use client";

import Link from "next/link";

export default function LabPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-txt-main p-4 md:p-8 font-mono custom-scrollbar">
      
      {/* 顶部导航 */}
      <div className="max-w-4xl mx-auto mb-12">
        <Link href="/" className="text-txt-dim hover:text-white transition-colors text-sm">
          ← ./return_home.sh
        </Link>
      </div>

      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* 标题区 */}
        <section>
          <span className="text-primary text-xs tracking-widest">SYSTEM STATUS: ONLINE</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-6">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Laboratory</span>
          </h1>
          <p className="text-txt-dim leading-relaxed max-w-2xl">
            这里是项目的控制台。展示了构建此网站所使用的核心技术栈与架构设计。
            <br/>Designed for efficiency, powered by Intelligence.
          </p>
        </section>

        {/* 技术栈展示 (卡片组) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Tech Stack 1: Framework */}
          <div className="p-6 rounded-2xl bg-surface border border-highlight group hover:border-primary/50 transition-all">
            <h3 className="text-lg font-bold mb-4 text-white">01. Core Framework</h3>
            <ul className="space-y-2 text-sm text-txt-dim">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Next.js 14 (App Router)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> React Server Components
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> TypeScript
              </li>
            </ul>
          </div>

          {/* Tech Stack 2: Intelligence */}
          <div className="p-6 rounded-2xl bg-surface border border-highlight group hover:border-secondary/50 transition-all">
            <h3 className="text-lg font-bold mb-4 text-white">02. Artificial Intelligence</h3>
            <ul className="space-y-2 text-sm text-txt-dim">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Google Gemini Pro
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span> Vercel AI SDK
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span> Prompt Engineering
              </li>
            </ul>
          </div>
        </section>

        {/* 代码展示区 (装逼利器) */}
        <section className="border border-highlight rounded-2xl overflow-hidden bg-[#0A0A0A]">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-highlight bg-surface/50">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-xs text-txt-dim">route.ts</span>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-xs md:text-sm text-green-400 font-mono leading-relaxed">
{`// 后端核心逻辑：连接 Google Gemini
export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // High-performance model
  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest" 
  });

  const result = await model.generateContent(prompt);
  return NextResponse.json(result);
}`}
            </pre>
          </div>
        </section>

      </div>
    </main>
  );
}