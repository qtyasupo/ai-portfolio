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
    // 3. 准备提示词 (Prompt) - 升级版
    const prompt = `
      你是一个科技新闻编辑。
      请联网搜索实时新闻并生成 4 条关于目前最新人工智能发展的新闻。
      
      格式要求：纯 JSON 数组，不包含 Markdown。
      数组对象字段: 
      - id (数字)
      - date (例如 'TODAY', '2 DAYS AGO')
      - title (新闻标题，中文)
      - insight (一段简短的深度解读，50字左右，分析对行业的影响，中文)
      - link (生成一个 Google 搜索链接，格式为 'https://www.google.com/search?q=' 加上新闻标题)
      
      例如：[{"id":1, "date":"TODAY", "title":"...", "insight":"...", "link":"..."}]
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