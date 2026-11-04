import { limitedJson, writeAccess } from "@/lib/access";
import { getStore } from "@/lib/store";
import { startNewsMonitor, stopNewsMonitor } from "@/lib/news-monitor";
export async function POST(req: Request) {
  if (!writeAccess(req))
    return Response.json({ error: "需要管理授权" }, { status: 401 });
  try {
    const body = (await limitedJson(req, 1000)) as {
      watch?: boolean;
      stop?: boolean;
    };
    if (body.stop === true) {
      await stopNewsMonitor();
      return Response.json({ ok: true, stopping: true });
    }
    const config = (await (await getStore()).read()).tracking;
    if (!config?.accounts.some((a) => a.confirmed && a.enabled))
      throw new Error("请先导入或确认Following名单");
    return Response.json(
      { ok: true, ...(await startNewsMonitor(body.watch === true)) },
      { status: 202 },
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "启动失败" },
      { status: 409 },
    );
  }
}
