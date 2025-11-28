
// src/data/knowledge.ts

export const knowledgeBase = [
    // ... 现有的数据 ...
  {
    id: "lab-01", // 给个特殊的 ID
    type: "tech", // 新类型：技术
    title: "架构揭秘：如何构建这个 AI 创意中台",
    source: "Yasupo's Lab",
    tags: ["FullStack", "Next.js", "Gemini"],
    date: "2025-11-28",
    content: [
      { type: "text", value: "很多人问我这个网站是用什么构建的。这是一个基于 React 生态的现代全栈应用，旨在探索设计与 AI 的边界。以下是核心架构蓝图：" },
      
      { type: "text", value: "⚡️ 01. 核心框架 (Core Framework)" },
      { type: "list", value: [
        "Next.js 14 (App Router) - 用于前后端一体化开发",
        "TypeScript - 保证代码健壮性",
        "Tailwind CSS - 实现原子化设计系统"
      ]},

      { type: "text", value: "🧠 02. 人工智能 (Artificial Intelligence)" },
      { type: "list", value: [
        "Google Gemini Pro - 强劲的自然语言处理模型",
        "Vercel AI SDK - 处理流式传输与 API 通信",
        "Prompt Engineering - 精心调试的系统指令"
      ]},

      { type: "text", value: "这是后端连接 Gemini 模型的真实核心代码片段：" },
      { type: "code", value: `// src/app/api/summarize/route.ts

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 使用最新的 Flash 模型以获得最快响应
  const model = genAI.getGenerativeModel({ 
    model: "gemini-flash-latest" 
  });

  const result = await model.generateContent(prompt);
  return NextResponse.json(result);
}` },
      { type: "quote", value: "Designed for efficiency, powered by Intelligence." }
    ]
  },
  // ... 之前的其他文章 (id: 1, id: 2) ...
  {
    id: "1",
    type: "video", // 类型：视频解析
    title: "Sora 深度解析：物理世界的模拟器",
    source: "YouTube / OpenAI",
    tags: ["AIGC", "Video", "Tech"],
    date: "2024-02-18",
    // 模拟 Notion 的内容块：一段字、一张图、一段字...
    content: [
      { type: "text", value: "OpenAI 发布的 Sora 不仅仅是视频生成工具，它是物理世界的模拟器。它展示了 AI 对三维空间、光影甚至物理碰撞的理解能力。" },
      { type: "image", value: "/images/work1.png" }, // 暂时借用之前的图，演示用
      { type: "quote", value: "Sora 理解了物体在三维空间中的运动方式，这是它与 Runway 最大的区别。" },
      { type: "text", value: "对于设计师来说，这意味着未来的动态样机（Mockup）可能不再需要 AE，而是直接通过文字描述生成。" },
      { type: "link", value: "https://openai.com/sora" }
    ]
  },
  {
    id: "2",
    type: "article", // 类型：文章笔记
    title: "2025 UI 设计趋势报告：去扁平化",
    source: "WeChat / 设计大号",
    tags: ["UI/UX", "Trend"],
    date: "2024-11-20",
    content: [
      { type: "text", value: "随着 Vision Pro 等空间计算设备的普及，UI 设计正在从极致的扁平化回归到带有'体积感'的设计。" },
      { type: "image", value: "/images/work2.png" },
      { type: "text", value: "关键特征包括：更细腻的磨砂玻璃质感、动态的光影边缘（Border Light）以及深邃的空间层级。" },
      { type: "quote", value: "设计不再是平面的纸张，而是光的容器。" }
    ]
  },
  {
    id: "3",
    type: "note", // 类型：随笔
    title: "关于 AI 辅助工作流的思考",
    source: "Yasupo's Note",
    tags: ["Workflow", "Thinking"],
    date: "2024-11-25",
    content: [
      { type: "text", value: "最近尝试用 Gemini 优化 Prompt，发现结构化的提示词比自然语言更有效。..." }
    ]
  }
];