import { overview } from "@/lib/radar";
import { writeAccess } from "@/lib/access";
import { collectorRunning } from "@/lib/collector";
import { publicOverview } from "@/lib/publication";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    let data = await overview(
      undefined,
      new URL(req.url).searchParams.get("date") || undefined,
    );
    if (!writeAccess(req)) data = publicOverview(data);
    data.collectorRunning = await collectorRunning();
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json(
      { error: "数据暂时不可用，请检查数据库配置" },
      { status: 503 },
    );
  }
}
