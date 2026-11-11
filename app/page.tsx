import { headers } from "next/headers";
import RadarApp from "@/components/RadarApp";
import { overview } from "@/lib/radar";
import { collectorRunning } from "@/lib/collector";
import { publicOverview } from "@/lib/publication";
export const dynamic = "force-dynamic";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const { view } = await searchParams;
  let data = await overview();
  const h = await headers();
  const local =
    !process.env.VERCEL &&
    /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(h.get("host") || "");
  if (!local) data = publicOverview(data);
  data.collectorRunning = await collectorRunning();
  return <RadarApp initial={data} initialView={view} />;
}
