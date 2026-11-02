import { randomUUID } from "node:crypto";
import { brief, canonicalUrl, ingest, recordHeat, stories } from "./pipeline";
import { modelsEnabled, scoreWithModels } from "./model";
import { getStore, type StateStore } from "./store";
import type { Candidate, Overview, Platform, Run } from "./types";

export async function overview(
  store?: StateStore,
  day?: string,
): Promise<Overview> {
  const db = store || (await getStore());
  const state = await db.read();
  return {
    state,
    stories: stories(state),
    brief: brief(state, day),
    storage: db.mode,
    writable: db.mode !== "snapshot",
    collectorRunning: false,
    model: modelsEnabled() ? "dual-model" : "rules",
    coverage: "关键词抽样与手动导入，非平台全量；仅收集可访问的公开内容",
  };
}
export async function ingestBatch(
  input: Candidate[],
  options: {
    platform?: Platform;
    query?: string;
    startedAt?: string;
    message?: string;
    backfill?: boolean;
  } = {},
  store?: StateStore,
) {
  const db = store || (await getStore());
  const at = new Date().toISOString();
  return db.update(async (state) => {
    const batch = input.map((i) => ({
      ...i,
      backfill: options.backfill ?? i.backfill,
    }));
    const result = ingest(state, batch, at);
    const ids = new Set(batch.map((c) => canonicalUrl(c.url, c.platform)));
    const modelErrors = await scoreWithModels(
      state.items.filter((i) => ids.has(i.url) && i.scoreMode !== "dual-model"),
    );
    const run: Run = {
      id: randomUUID(),
      platform: options.platform || "import",
      query: options.query || "手动导入",
      startedAt: options.startedAt || at,
      completedAt: at,
      status: modelErrors.length ? "partial" : "ok",
      ...result,
      message:
        options.message ||
        `${result.created} 条新增 · ${result.updated} 条更新${modelErrors.length ? "；模型失败，保留规则评分" : ""}`,
    };
    state.runs.unshift(run);
    state.runs = state.runs.slice(0, 150);
    const source = state.sources.find((s) => s.platform === options.platform);
    if (source) {
      source.lastAttemptAt = at;
      source.lastSuccessAt = at;
      source.state = "ok";
      source.message = run.message;
      source.cursor++;
    }
    recordHeat(state, at);
    return { ...result, runId: run.id, modelErrors };
  });
}
export async function collectionError(
  platform: Platform,
  query: string,
  code: string,
  message: string,
  store?: StateStore,
) {
  const db = store || (await getStore());
  const at = new Date().toISOString();
  return db.update((state) => {
    const s = state.sources.find((s) => s.platform === platform)!;
    s.lastAttemptAt = at;
    s.state =
      code === "NEED_LOGIN"
        ? "needs_login"
        : code === "PLATFORM_BLOCKED"
          ? "blocked"
          : code === "RATE_LIMITED"
            ? "rate_limited"
            : "error";
    s.message = message.slice(0, 400);
    state.runs.unshift({
      id: randomUUID(),
      platform,
      query,
      startedAt: at,
      completedAt: at,
      status: "error",
      received: 0,
      created: 0,
      updated: 0,
      message: `${code} · ${message.slice(0, 400)}`,
    });
    state.runs = state.runs.slice(0, 150);
    state.updatedAt = at;
  });
}
