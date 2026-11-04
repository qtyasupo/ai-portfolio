import { readFile } from "node:fs/promises";
import { getStore } from "../lib/store";
import { defaultTracking, validateTracking } from "../lib/tracking";
import type { WatchTopic } from "../lib/types";
const research = JSON.parse(
  await readFile(
    new URL("../data/platform-topic-research-2026-11-04.json", import.meta.url),
    "utf8",
  ),
) as { topics: WatchTopic[] };
// Preserve actually observed note access parameters only in private local configuration.
// The portable research JSON contains canonical URLs without these parameters.
try {
  const rows = JSON.parse(
    await readFile(
      new URL(
        "../.radar/research/platform-topics-20261104/xiaohongshu-details.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const byId = new Map<string, string>(
    rows
      .filter((row: { detail: { ok: boolean } }) => row.detail.ok)
      .map(
        (row: {
          search: { url: string };
          detail: { data: { url: string } };
        }) => {
          const access = row.detail.data.url || row.search.url;
          return [new URL(access).pathname.split("/").at(-1), access];
        },
      ),
  );
  for (const topic of research.topics)
    for (const sample of topic.basis?.samples || []) {
      const access = byId.get(new URL(sample.url).pathname.split("/").at(-1)!);
      if (access) sample.accessUrl = access;
    }
} catch {
  /* On another device, platform search remains available. */
}
await (
  await getStore()
).update((state) => {
  const old = state.tracking || defaultTracking();
  const ids = new Set(research.topics.map((t) => t.id));
  const legacyIds = new Set(defaultTracking().topics.map((t) => t.id));
  // Legacy shared, unconfirmed suggestions remain only on X/YouTube.
  // Confirmed custom topics and the private Following roster are preserved.
  const retained = old.topics
    .filter((t) => !ids.has(t.id))
    .map((t) =>
      !t.confirmed && legacyIds.has(t.id)
        ? {
            ...t,
            platforms: t.platforms.filter((p) => p === "x" || p === "youtube"),
          }
        : t,
    )
    .filter((t) => t.platforms.length);
  state.tracking = validateTracking({
    ...old,
    topics: [...research.topics, ...retained],
  });
});
console.log(
  JSON.stringify({
    ok: true,
    researchedTopics: research.topics.length,
    followingPreserved: true,
  }),
);
