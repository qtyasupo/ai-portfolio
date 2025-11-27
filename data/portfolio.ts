// src/data/portfolio.ts (虽然你没有 src，但逻辑是一样的)

export const portfolioItems = [
  {
    id: 1,
    title: "Cyberpunk City",
    category: "Scene", // 场景
    tool: "Midjourney",
    image: "/images/work2.png", // 记得稍后往 public/images 里放图，不然是空的
    video: "", 
  },
  {
    id: 2,
    title: "Neon Character",
    category: "Character", // 角色
    tool: "Stable Diffusion",
    image: "/images/work1.jpg",
  },
  {
    id: 3,
    title: "Commercial Demo",
    category: "Video", // 视频
    tool: "Runway Gen-2",
    image: "/images/work3.png",
  },
  {
    id: 4,
    title: "Future UI Interface",
    category: "UI", // UI界面
    tool: "Figma + AI",
    image: "/images/work4.png",
  },
];

// 定义所有的分类选项
export const categories = ["All", "Scene", "Character", "Video", "UI"];