"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { translations, LocaleType } from "@/data/locales";

// 定义 Context 内容
interface LanguageContextType {
  locale: LocaleType;
  t: typeof translations["en"]; // t 代表当前语言的字典
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<LocaleType>("en"); // 默认英文

  const toggleLanguage = () => {
    setLocale((prev) => (prev === "en" ? "zh" : "en"));
  };

  const value = {
    locale,
    t: translations[locale], // 自动根据 locale 切换字典
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// 这是一个自定义 Hook，方便在任何页面直接用
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}