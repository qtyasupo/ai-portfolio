import { getStore } from "@/lib/store";
import { limitedJson, writeAccess } from "@/lib/access";
import { PLATFORMS, type Platform } from "@/lib/types";
export async function POST(req: Request) {
  if (!writeAccess(req))
    return Response.json({ error: "需要管理授权" }, { status: 401 });
  try {
    const body = (await limitedJson(req, 20_000)) as {
      platform: Platform;
      enabled: boolean;
      queries: string[];
      resume?: boolean;
    };
    if (
      !PLATFORMS.includes(body.platform) ||
      typeof body.enabled !== "boolean" ||
      !Array.isArray(body.queries) ||
      body.queries.length > 20 ||
      body.queries.some(
        (q) => typeof q !== "string" || !q.trim() || q.length > 100,
      )
    )
      throw new Error("每个平台最多 20 个有效关键词，每词不超过 100 字");
    await (
      await getStore()
    ).update((s) => {
      const source = s.sources.find((i) => i.platform === body.platform);
      if (!source) throw new Error("找不到信源");
      source.enabled = body.enabled;
      source.queries = [...new Set(body.queries.map((q) => q.trim()))];
      if (body.resume) {
        source.state = "idle";
        source.message = "已由操作员恢复，等待下一次采集";
      }
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "保存失败" },
      { status: 400 },
    );
  }
}
