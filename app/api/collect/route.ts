import { startCollector } from "@/lib/collector";
import { writeAccess } from "@/lib/access";
export async function POST(req: Request) {
  if (!writeAccess(req))
    return Response.json({ error: "需要管理授权" }, { status: 401 });
  try {
    return Response.json(
      { ok: true, ...(await startCollector()) },
      { status: 202 },
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "启动失败" },
      { status: 409 },
    );
  }
}
