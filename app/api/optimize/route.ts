// src/app/api/optimize/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return NextResponse.json({ result: "请配置 API Key" });

  try {
    // 1. 获取前端传来的用户输入
    const { prompt } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // 2. 核心 Prompt：教 AI 做事
    const systemInstruction = `
      你是一个 AI 绘画提示词(Prompt)优化专家。
      用户的输入可能很简单（例如“一只猫”）。
      请将其重写为适用于 Midjourney 或 Stable Diffusion 的高质量英文 Prompt。
      
      要求：
      1. 增加细节描述（光照、风格、渲染引擎、构图）。
      2. 保持结构清晰。
      3. 只返回优化后的英文 Prompt 内容，不要包含任何解释性文字或引号。
      
      用户输入：${prompt}
    `;

    const result = await model.generateContent(systemInstruction);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });

  } catch (error) {
    console.error("Optimize Error:", error);
    return NextResponse.json({ result: "AI 思考超时，请重试" });
  }
}