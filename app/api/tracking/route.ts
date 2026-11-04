import { limitedJson, writeAccess } from "@/lib/access";
import { getStore } from "@/lib/store";
import { validateTracking } from "@/lib/tracking";
export async function POST(req: Request) {
  if (!writeAccess(req))
    return Response.json({ error: "需要管理授权" }, { status: 401 });
  try {
    const tracking = validateTracking(await limitedJson(req, 30_000));
    await (
      await getStore()
    ).update((state) => {
      state.tracking = tracking;
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "保存失败" },
      { status: 400 },
    );
  }
}
