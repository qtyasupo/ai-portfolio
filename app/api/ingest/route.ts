import { ingestBatch } from "@/lib/radar";
import { limitedJson, writeAccess } from "@/lib/access";
import { validateCandidates } from "@/lib/pipeline";
export const maxDuration = 60;
const limits = new Map<string, { at: number; count: number }>();
export async function POST(req: Request) {
  if (!writeAccess(req))
    return Response.json(
      { error: "需要管理授权；云端请配置管理令牌与远程数据库" },
      { status: 401 },
    );
  const key = "admin";
  const now = Date.now();
  let v = limits.get(key);
  if (!v || now - v.at > 60_000) {
    v = { at: now, count: 0 };
    limits.set(key, v);
  }
  if (++v.count > 10)
    return Response.json(
      { error: "每分钟最多导入 10 批" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  try {
    const body = (await limitedJson(req)) as {
      items?: unknown;
      backfill?: boolean;
    };
    const candidates = validateCandidates(
      Array.isArray(body) ? body : body.items,
    );
    const result = await ingestBatch(candidates, {
      backfill: !Array.isArray(body) ? !!body.backfill : undefined,
    });
    return Response.json({ ok: true, ...result });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "导入失败" },
      { status: 400 },
    );
  }
}
