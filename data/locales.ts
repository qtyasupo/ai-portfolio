// src/data/locales.ts

export const translations = {
  en: {
    nav: {
      back: "← Back",
      home: "Home",
    },
    hero: {
      role: "FULL STACK DESIGNER",
      title_1: "Designing with",
      title_2: "Intelligence.",
      desc: "bridging UI/UX and Artificial Intelligence.",
    },
    radar: {
      title: "AI Radar",
      btn_idle: "✨ AI Summarize",
      btn_loading: "⏳ AI Thinking...",
    },
    cards: {
      showreel: "SHOWREEL 2025",
      tools: "Tools",
      talk: "Let's Talk",
      lab: "Wiki", // 之前叫 Lab，现在叫 Wiki
    },
    contact: {
      title: "Contact Me",
      copy: "Copy",
      copied: "Copied!",
      hint: "Click to copy",
    }
  },
  zh: {
    nav: {
      back: "← 返回",
      home: "首页",
    },
    hero: {
      role: "全栈设计师",
      title_1: "人工智能",
      title_2: "未来设计",
      desc: "连接 UI/UX 设计与人工智能",
    },
    radar: {
      title: "AI 情报局",
      btn_idle: "✨ AI 一键总结",
      btn_loading: "⏳ AI 思考中...",
    },
    cards: {
      showreel: "影视作品集 2025",
      tools: "AI 工具箱",
      talk: "联系我",
      lab: "知识库",
    },
    contact: {
      title: "联系方式",
      copy: "复制",
      copied: "已复制！",
      hint: "点击卡片即可复制",
    }
  }
};

// 定义类型方便提示
export type LocaleType = "en" | "zh";