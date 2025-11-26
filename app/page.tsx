import AiRadar from "@/components/AiRadar";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 flex justify-center text-txt-main custom-scrollbar">
      {/* 核心容器 */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
        
        {/* 1. Hero 区域 (左上角) */}
        <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-surface border border-highlight p-6 flex flex-col justify-between hover:border-primary/50 transition-colors duration-300">
          {/* 1. Hero 区域 (左上角) - 已修复移动端高度 */}
        <div className="row-span-2 md:col-span-2 md:row-span-2 rounded-3xl bg-surface border border-highlight p-6 flex flex-col justify-between hover:border-primary/50 transition-colors duration-300">
          <div>
            <span className="text-primary font-mono text-sm tracking-wider">FULL STACK DESIGNER</span>
            {/* 字体调整：手机 text-4xl，电脑 text-5xl */}
            <h1 className="text-4xl md:text-5xl font-bold mt-4 leading-tight">
              Designing with <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Intelligence.</span>
            </h1>
          </div>
          <p className="text-txt-dim max-w-md text-lg">
            我是 [Yasupo]，连接 UI/UX 与人工智能的数字工匠。
          </p>
        </div>
          </div>
          <p className="text-txt-dim max-w-md text-lg">
            我是 [Yasupo]，连接 UI/UX 与人工智能。
          </p>
        </div>

        {/* 2. AI News (这里引用了刚才做的组件) */}
        <AiRadar />

        {/* 3. 影视作品 Showreel (中间视频) */}
        <div className="md:col-span-3 md:row-span-2 rounded-3xl bg-surface border border-highlight flex items-center justify-center relative overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
          <h2 className="z-20 text-3xl font-bold tracking-widest text-white/20 group-hover:text-white transition-all duration-500">
            SHOWREEL 2025
          </h2>
          {/* 视频背景层 */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
          >
            <source src="/demo.mp4" type="video/mp4" />
          </video>
        </div>

        {/* 4. 小方块 (工具栈) */}
        <div className="md:col-span-1 md:row-span-1 rounded-3xl bg-surface border border-highlight p-6 flex items-center justify-center hover:bg-highlight/20 transition-colors">
           <span className="font-mono text-xl">🛠️ Tools</span>
        </div>

        {/* 5. 小方块 (联系我) */}
        <div className="md:col-span-1 md:row-span-1 rounded-3xl bg-primary text-white p-6 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer">
           <span className="font-bold text-xl">Let's Talk &rarr;</span>
        </div>

        {/* 6. 小方块 (AIGC 实验室) */}
        <div className="md:col-span-1 md:row-span-1 rounded-3xl bg-surface border border-highlight p-6 flex items-center justify-center hover:bg-highlight/20 transition-colors">
           <span className="font-mono text-xl">🧪 Lab</span>
        </div>

      </div>
    </main>
  );
}