import { overview } from "@/lib/radar";
import { publicOverview } from "@/lib/publication";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const day = url.searchParams.get("date") || undefined;
  if (day && !/^\d{4}-\d\d-\d\d$/.test(day))
    return Response.json({ error: "日期格式应为 YYYY-MM-DD" }, { status: 400 });
  const data = publicOverview(await overview(undefined, day));
  if (url.searchParams.get("format") === "brief") {
    const b = data.brief;
    const text =
      `# Yasupo AI / AIGC 日报 · ${b.date}\n\n关键词抽样，非平台全量。${b.total} 条当日内容，${b.platforms} 个平台。当前筛选方式：${data.model === "rules" ? "规则筛选" : "双模型评分"}。\n\n` +
      b.entries
        .map(
          (i) =>
            `## ${i.title}\n\n${i.summary}\n\n来源：[${i.author}](${i.url})\n发布时间：${i.publishedAt}；采集时间：${i.lastSeenAt}\n`,
        )
        .join("\n");
    return new Response(text, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="yasupo-brief-${b.date}.md"`,
      },
    });
  }
  return Response.json(
    {
      exportedAt: new Date().toISOString(),
      coverage: data.coverage,
      items: data.state.items.filter((i) =>
        ["selected", "archive"].includes(i.status),
      ),
    },
    {
      headers: {
        "Content-Disposition": 'attachment; filename="yasupo-sources.json"',
      },
    },
  );
}
