import { readFile } from "node:fs/promises";
import { getStore } from "../lib/store";
import { ingestBatch, collectionError } from "../lib/radar";
import { PLATFORMS, type Platform } from "../lib/types";

const file = process.argv[2];
if (!file) throw new Error("用法：npm run ingest -- <batch.json>");
const payload = JSON.parse(await readFile(file, "utf8"));
if (payload.error) {
  if (!PLATFORMS.includes(payload.platform)) throw new Error("无效平台");
  await collectionError(
    payload.platform,
    payload.query || "",
    payload.error.code || "ERROR",
    payload.error.message || "采集失败",
  );
  console.log(
    JSON.stringify({
      ok: false,
      platform: payload.platform,
      error: payload.error,
    }),
  );
} else if (payload.sources) {
  const store = await getStore();
  await store.update((state) => {
    for (const s of payload.sources) {
      const old = state.sources.find((i) => i.platform === s.platform);
      if (old) {
        old.enabled = !!s.enabled;
        old.queries = s.queries;
      }
    }
  });
} else {
  const items = Array.isArray(payload) ? payload : payload.items;
  const result = await ingestBatch(items, {
    platform: payload.platform as Platform | undefined,
    query: payload.query,
    startedAt: payload.startedAt,
    backfill: payload.backfill,
    message: payload.message,
  });
  console.log(JSON.stringify({ ok: true, ...result }));
}
