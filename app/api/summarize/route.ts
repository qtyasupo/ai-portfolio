import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. 保底逻辑：如果没有 Key，还是返回假数据
  if (!apiKey || apiKey === "AIzaSy...") {
    return NextResponse.json({ 
      data: [
        { id: 1, date: "DEMO", title: "请配置 Gemini Key 以获取真实数据" },
        { id: 2, date: "TIPS", title: "Gemini 1.5 Flash 速度非常快且免费" },
      ] 
    });
  }

  try {
    // 2. 初始化 Google Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    // 使用截图里显示的最新版 ID
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    // 3. 准备提示词 (Prompt)
    // 我们要求它必须返回 JSON 格式，不要废话
    const prompt = `
      你是一个科技新闻编辑。
      请生成 4 条简短的、关于 2025 年人工智能发展的未来新闻标题。
      
      格式要求：
      1. 必须是纯 JSON 数组格式。
      2. 数组里包含对象，字段为: id (数字), date (例如 'TODAY', '2 DAYS AGO'), title (中文).
      3. 不要包含 Markdown 标记（不要写 \`\`\`json），直接返回数组字符串。
      
      例如：[{"id":1, "date":"TODAY", "title":"..."}]
    `;

    // 4. 发送请求
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // 5. 数据清洗 (Gemini 有时候喜欢加 markdown 符号，我们要把它洗掉)
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // 6. 解析并返回
    const newsArray = JSON.parse(text);
    return NextResponse.json({ data: newsArray });

  } catch (error) {
    console.error("Gemini 调用失败:", error);
    return NextResponse.json({ 
      data: [{ id: 0, date: "ERROR", title: "AI 生成失败，请检查网络或 Key" }] 
    });
  }
}