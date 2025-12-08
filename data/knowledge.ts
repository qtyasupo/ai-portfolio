
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
  },
  {
    id: "tool-guide-2025",
    type: "article",
    title: "2025 全球主流 AIGC 工具生态地图",
    source: "Yasupo's Selection",
    tags: ["AIGC", "Tools", "Guide"],
    date: "2025-11-29",
    content: [
      { type: "text", value: "AIGC 领域发展日新月异，工具层出不穷。为了帮助大家快速建立工具库，我整理了目前（2025年）在文本、图像和视频生成领域最值得关注的“第一梯队”工具。这些工具代表了当前的行业最高标准。" },
      
      { type: "image", value: "/images/work3.jpg" }, // 占位图：建议换成一张包含多个工具Logo的集合图

      { type: "text", value: "## 01. 文本生成 (LLM)" },
      { type: "text", value: "大语言模型是所有 AIGC 的基石。目前的“三巨头”格局已经形成：" },
      { type: "list", value: [
        "ChatGPT (OpenAI) - 综合能力最强，GPT-4o/5 依然是行业标杆，适合通用任务和逻辑推理。",
        "Claude (Anthropic) - 也就是我们常用的 Sonnet 3.5/3.7，在代码编写和长文本理解上表现卓越，语气更自然。",
        "Gemini (Google) - 原生多模态模型，能同时理解图、文、视频。深度集成在 Google Workspace 中，拥有超长上下文窗口。"
      ]},
      { type: "link", value: "https://chat.openai.com/" },
      { type: "link", value: "https://claude.ai/" },
      { type: "link", value: "https://gemini.google.com/" },

      { type: "text", value: "## 02. 图像生成 (Image Gen)" },
      { type: "text", value: "设计师的主战场。除了 Midjourney，国产工具也在迅速崛起：" },
      { type: "list", value: [
        "Midjourney - 依然是“审美”的天花板。V6.1 版本在光影质感和构图上无出其右，是广告级图像的首选。",
        "即梦 (Jimeng/Dreamina) - 字节跳动出品。也就是原来的“剪映AI”，生成速度快，中文理解能力极强，且支持局部重绘等高级编辑功能。",
        "Stable Diffusion - 开源界的王者。配合 ControlNet 可以实现对画面的精准控制，是工作流整合的必备基石。",
        "Flux - 后起之秀，由 Black Forest Labs 开发，在文字生成准确性和人像真实感上表现惊人。"
      ]},
      { type: "link", value: "https://www.midjourney.com/" },
      { type: "link", value: "https://jimeng.jianying.com/" },

      { type: "text", value: "## 03. 视频生成 (Video Gen)" },
      { type: "text", value: "这是 2025 年竞争最激烈的赛道，视频生成正在从“玩具”走向“生产力”：" },
      { type: "list", value: [
        "Sora (OpenAI) - 视频生成的“ChatGPT 时刻”，虽然公测名额有限，但其物理模拟能力令人震撼。",
        "可灵 (Kling) - 快手出品。目前公认的第一梯队视频模型，支持长达 2 分钟的视频生成，动作流畅度极高，支持首尾帧控制。",
        "Runway (Gen-3) - 视频赛道的老牌玩家，提供非常丰富的“视频重绘”和“笔刷控制”功能，适合专业影视工作流。",
        "Hailuo (海螺) - MiniMax 出品，近期在语义理解和画面连贯性上进步神速。"
      ]},
      { type: "image", value: "/images/work1.jpg" }, // 占位图：建议换成一张视频生成的动图封面
      { type: "link", value: "https://klingai.com/" },
      { type: "link", value: "https://runwayml.com/" },

      { type: "quote", value: "工具只是延伸了我们的手，审美和创意才是设计师的大脑。" }
    ]
  }
];