import { createHash } from "node:crypto";
import {
  CATEGORIES,
  PLATFORMS,
  PLATFORM_LABELS,
  type Candidate,
  type Item,
  type Platform,
  type RadarState,
  type Story,
  type Brief,
  type Metrics,
} from "./types";

const HOUR = 3_600_000;
const TOPICS = [
  "AI 视频",
  "AI 短剧",
  "AIGC",
  "代码动画",
  "Claude 动画",
  "Seedance",
];
export function emptyState(): RadarState {
  return {
    version: 1,
    updatedAt: null,
    items: [],
    runs: [],
    heatHistory: [],
    sources: PLATFORMS.map((platform) => ({
      platform,
      name: PLATFORM_LABELS[platform],
      enabled: true,
      queries:
        platform === "youtube" || platform === "x"
          ? [
              "AI video",
              "AI short film",
              "Claude animation",
              "code animation",
              "Seedance",
              "AIGC",
            ]
          : [...TOPICS],
      cursor: 0,
      state: "idle",
      lastAttemptAt: null,
      lastSuccessAt: null,
      message: "尚未运行采集",
    })),
  };
}
export function canonicalUrl(value: string, platform: Platform): string {
  const u = new URL(value);
  if (u.protocol !== "https:" || u.username || u.password || u.port)
    throw new Error("仅接受平台公开 HTTPS 链接");
  const h = u.hostname.toLowerCase().replace(/^www\./, "");
  if (platform === "douyin" && h === "douyin.com") {
    const m = u.pathname.match(/^\/video\/(\d+)\/?$/);
    if (m) return `https://www.douyin.com/video/${m[1]}`;
  }
  if (platform === "xiaohongshu" && h === "xiaohongshu.com") {
    const m = u.pathname.match(
      /^\/(?:explore|search_result)\/([a-f\d]{24})\/?$/i,
    );
    if (m) return `https://www.xiaohongshu.com/explore/${m[1].toLowerCase()}`;
  }
  if (platform === "x" && ["x.com", "twitter.com"].includes(h)) {
    const m = u.pathname.match(/^\/([\w]+)\/status\/(\d+)(?:\/.*)?$/);
    if (m) return `https://x.com/i/status/${m[2]}`;
  }
  if (
    platform === "youtube" &&
    ["youtube.com", "m.youtube.com", "youtu.be"].includes(h)
  ) {
    const id =
      h === "youtu.be"
        ? u.pathname.slice(1)
        : u.pathname.match(/^\/(?:shorts|live)\/([\w-]+)/)?.[1] ||
          (u.pathname === "/watch" ? u.searchParams.get("v") : null);
    if (id && /^[\w-]{11}$/.test(id))
      return `https://www.youtube.com/watch?v=${id}`;
  }
  throw new Error("链接与平台不匹配，或不是可识别的公开内容链接");
}
export function validateCandidates(input: unknown): Candidate[] {
  if (!Array.isArray(input) || input.length > 50)
    throw new Error("每批需为最多 50 条的 JSON 数组");
  return input.map((row, index) => {
    if (!row || typeof row !== "object")
      throw new Error(`第 ${index + 1} 条格式无效`);
    const r = row as Record<string, unknown>;
    if (
      !PLATFORMS.includes(r.platform as Platform) ||
      typeof r.title !== "string" ||
      !r.title.trim() ||
      typeof r.url !== "string"
    )
      throw new Error(`第 ${index + 1} 条缺少有效 platform/title/url`);
    canonicalUrl(r.url, r.platform as Platform);
    for (const key of [
      "author",
      "text",
      "evidence",
      "query",
      "publisherId",
      "eventKey",
    ]) {
      if (r[key] !== undefined && typeof r[key] !== "string")
        throw new Error(`第 ${index + 1} 条 ${key} 必须为文字`);
    }
    if (r.publishedAt != null && typeof r.publishedAt !== "string")
      throw new Error("publishedAt 需为带时区 ISO 时间或 null");
    if (
      r.dateConfidence !== undefined &&
      !["verified", "estimated", "unknown"].includes(String(r.dateConfidence))
    )
      throw new Error("dateConfidence 无效");
    if (
      r.datePrecision !== undefined &&
      !["day", "minute", "second"].includes(String(r.datePrecision))
    )
      throw new Error("datePrecision 无效");
    if (
      r.access !== undefined &&
      !["search", "detail", "subtitle", "user_import"].includes(
        String(r.access),
      )
    )
      throw new Error("access 无效");
    const metrics: Metrics = {};
    if (
      r.metrics !== undefined &&
      (!r.metrics || typeof r.metrics !== "object" || Array.isArray(r.metrics))
    )
      throw new Error("metrics 需为对象");
    for (const [k, v] of Object.entries(r.metrics || {})) {
      if (
        !["likes", "views", "comments", "favorites", "shares"].includes(k) ||
        typeof v !== "number" ||
        !Number.isFinite(v) ||
        v < 0
      )
        throw new Error("互动数据需为非负数字；未知值请省略");
      metrics[k as keyof Metrics] = Math.round(v);
    }
    return {
      ...r,
      title: r.title.trim().slice(0, 240),
      text: typeof r.text === "string" ? r.text.slice(0, 8000) : undefined,
      evidence:
        typeof r.evidence === "string" ? r.evidence.slice(0, 400) : undefined,
      metrics,
    } as unknown as Candidate;
  });
}
function verifiedDate(c: Candidate, now: number): string | null {
  if (
    c.dateConfidence !== "verified" ||
    !c.publishedAt ||
    !/^\d{4}-\d\d-\d\dT.*(?:Z|[+-]\d\d:\d\d)$/.test(c.publishedAt)
  )
    return null;
  const n = Date.parse(c.publishedAt);
  return Number.isFinite(n) && n <= now + 5 * 60_000 && n > 946684800000
    ? new Date(n).toISOString()
    : null;
}
const TAG_RULES: [string, RegExp][] = [
  ["Claude", /claude|克劳德/i],
  ["Seedance", /seedance|即梦/i],
  ["Sora", /sora/i],
  ["可灵", /kling|可灵/i],
  ["Veo", /\bveo\b/i],
  ["Remotion", /remotion/i],
  ["Manim", /manim/i],
  ["Runway", /runway/i],
  ["AI 短剧", /短剧|漫剧|short drama/i],
  ["代码动画", /代码动画|code animation|svg|canvas|three\.js|webgl/i],
];
export function classify(
  title: string,
  text: string,
): {
  category: (typeof CATEGORIES)[number];
  tags: string[];
  score: number;
  relevant: boolean;
} {
  const corpus = `${title} ${text}`;
  const tags = TAG_RULES.filter(([, re]) => re.test(corpus)).map(
    ([name]) => name,
  );
  const relevant =
    /\bAI\b|AIGC|人工智能|生成式|seedance|sora|kling|可灵|veo|即梦|claude|remotion|manim|代码动画|code animation/i.test(
      corpus,
    );
  let category: (typeof CATEGORIES)[number] = "AIGC 工具";
  if (
    /claude/i.test(corpus) &&
    /animat|动画|motion|svg|canvas|可视化/i.test(corpus)
  )
    category = "Claude 动画";
  else if (
    /代码动画|code animation|remotion|manim|three\.js|webgl|svg animation/i.test(
      corpus,
    )
  )
    category = "代码动画";
  else if (/短剧|漫剧|short drama|AI drama/i.test(corpus)) category = "AI 短剧";
  else if (/视频|短片|film|video|电影|seedance|sora|kling|veo/i.test(corpus))
    category = "AI 视频";
  else if (/教程|tutorial|workflow|工作流|how to|指南/i.test(corpus))
    category = "创作教程";
  // Quality measures information and practical evidence, never engagement or novelty claims.
  const score = relevant
    ? Math.min(
        95,
        40 +
          (text.length > 80 ? 15 : 0) +
          (text.length > 300 ? 10 : 0) +
          (/教程|tutorial|workflow|工作流|步骤|prompt|提示词|开源|github/i.test(
            corpus,
          )
            ? 15
            : 0) +
          (tags.length ? 10 : 0),
      )
    : 0;
  return { category, tags, score, relevant };
}
export function refreshClassification(item: Item, at: number) {
  const analysis = classify(item.title, item.text);
  item.category = analysis.category;
  item.tags = analysis.tags;
  if (item.scoreMode === "rules") item.score = analysis.score;
  item.status = !analysis.relevant
    ? "excluded"
    : !item.publishedAt
      ? "pending"
      : item.backfill || at - Date.parse(item.publishedAt) > 48 * HOUR
        ? "archive"
        : "selected";
}
function fingerprint(title: string): string {
  return title
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[#@][^\s]+/g, "")
    .replace(/[\p{P}\p{S}\s]/gu, "")
    .slice(0, 120);
}
export function ingest(
  state: RadarState,
  input: Candidate[],
  at = new Date().toISOString(),
) {
  const candidates = validateCandidates(input);
  const now = Date.parse(at);
  let created = 0,
    updated = 0;
  for (const c of candidates) {
    const url = canonicalUrl(c.url, c.platform);
    const id = createHash("sha256").update(url).digest("hex").slice(0, 20);
    const old = state.items.find((i) => i.id === id);
    const date = verifiedDate(c, now);
    const analysis = classify(c.title, c.text || "");
    const observation = {
      at,
      metrics: c.metrics || {},
      access: c.access || ("user_import" as const),
      evidence: c.evidence || c.title.slice(0, 200),
    };
    if (old) {
      old.lastSeenAt = at;
      old.metrics = { ...old.metrics, ...c.metrics };
      if (
        !old.observations.some(
          (o) =>
            o.at === at &&
            JSON.stringify(o.metrics) === JSON.stringify(observation.metrics),
        )
      )
        old.observations.push(observation);
      old.observations = old.observations.slice(-100);
      // A search card cannot replace already read details or shorten the available text.
      const depth = { search: 0, user_import: 1, detail: 2, subtitle: 3 };
      if (depth[c.access || "user_import"] >= depth[old.access]) {
        old.title = c.title;
        if ((c.text || "").length >= old.text.length) {
          old.text = c.text || old.text;
          old.summary = old.text.slice(0, 180) || old.title;
        }
        old.access = c.access || old.access;
        old.evidence = c.evidence || old.evidence;
      }
      if (c.author) {
        old.author = c.author;
        old.publisherId =
          c.publisherId || `${c.platform}:${c.author.toLowerCase().trim()}`;
      }
      if (date && !old.publishedAt) {
        old.publishedAt = date;
        old.datePrecision = c.datePrecision;
        old.dateConfidence = "verified";
        old.status = analysis.relevant
          ? old.backfill || now - Date.parse(date) > 48 * HOUR
            ? "archive"
            : "selected"
          : "excluded";
      }
      if (c.eventKey) old.eventKey = c.eventKey.slice(0, 160);
      refreshClassification(old, now);
      updated++;
      continue;
    }
    const backfill = !!c.backfill;
    const status = !analysis.relevant
      ? "excluded"
      : !date
        ? "pending"
        : backfill || now - Date.parse(date) > 48 * HOUR
          ? "archive"
          : "selected";
    const author = c.author || "作者未读取";
    state.items.push({
      id,
      platform: c.platform,
      url,
      title: c.title,
      author,
      text: c.text || "",
      publishedAt: date,
      dateConfidence: date
        ? "verified"
        : c.dateConfidence === "estimated"
          ? "estimated"
          : "unknown",
      datePrecision: c.datePrecision,
      firstSeenAt: at,
      lastSeenAt: at,
      metrics: c.metrics || {},
      query: c.query || "",
      evidence: c.evidence || c.title.slice(0, 200),
      access: c.access || "user_import",
      publisherId:
        c.publisherId ||
        `${c.platform}:${c.author?.toLowerCase().trim() || id}`,
      category: analysis.category,
      tags: analysis.tags,
      summary: (c.text || c.title).slice(0, 180),
      score: analysis.score,
      scoreMode: "rules",
      status,
      eventKey:
        c.eventKey?.slice(0, 160) || `title:${fingerprint(c.title) || id}`,
      backfill,
      observations: [observation],
    });
    created++;
  }
  state.updatedAt = at;
  return {
    created,
    updated,
    received: candidates.length,
    pending: state.items.filter((i) => i.status === "pending").length,
  };
}
export function stories(
  state: RadarState,
  at = new Date().toISOString(),
): Story[] {
  const now = Date.parse(at);
  const groups = new Map<string, Item[]>();
  for (const item of state.items) {
    if (item.status !== "selected" || !item.publishedAt || item.backfill)
      continue;
    if (
      now - Date.parse(item.publishedAt) > 48 * HOUR ||
      Date.parse(item.publishedAt) > now
    )
      continue;
    groups.set(item.eventKey, [...(groups.get(item.eventKey) || []), item]);
  }
  const baseline = state.heatHistory
    .filter(
      (p) =>
        Date.parse(p.at) <= now - 6 * HOUR &&
        Date.parse(p.at) >= now - 8 * HOUR,
    )
    .at(-1);
  return [...groups]
    .flatMap(([id, items]) => {
      const publishers = new Map<string, number>();
      for (const i of items)
        publishers.set(
          i.publisherId,
          Math.max(
            publishers.get(i.publisherId) || 0,
            Date.parse(i.publishedAt!),
          ),
        );
      if (publishers.size < 2) return [];
      const raw = [...publishers.values()].reduce(
        (s, t) => s + 0.5 ** ((now - t) / (24 * HOUR)),
        0,
      );
      const heat = Math.round(raw * 100) / 10;
      const prev = baseline?.values[id];
      // Coverage changes invalidate a comparison; a fresh source is not organic growth.
      const comparable =
        !!baseline &&
        !items.some((i) => Date.parse(i.firstSeenAt) > Date.parse(baseline.at));
      const change =
        comparable && prev ? Math.round(((heat - prev) / prev) * 100) : null;
      const first = items.toSorted((a, b) => b.score - a.score)[0];
      return [
        {
          id,
          title: first.title,
          category: first.category,
          items: items.toSorted(
            (a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!),
          ),
          sourceCount: publishers.size,
          platformCount: new Set(items.map((i) => i.platform)).size,
          heat,
          trend: !comparable
            ? ("unavailable" as const)
            : !prev
              ? ("new" as const)
              : change! > 10
                ? ("rising" as const)
                : ("steady" as const),
          change,
        },
      ];
    })
    .toSorted((a, b) => b.heat - a.heat)
    .slice(0, 10);
}
export function dateInShanghai(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}
export function brief(
  state: RadarState,
  day = dateInShanghai(new Date().toISOString()),
): Brief {
  const entries = state.items
    .filter(
      (i) =>
        i.status === "selected" &&
        !i.backfill &&
        i.publishedAt &&
        dateInShanghai(i.publishedAt) === day,
    )
    .toSorted((a, b) => b.score - a.score);
  return {
    date: day,
    total: entries.length,
    selected: entries.filter((i) => i.score >= 65).length,
    platforms: new Set(entries.map((i) => i.platform)).size,
    entries: entries.slice(0, 12),
    themes: CATEGORIES.map((name) => ({
      name,
      count: entries.filter((i) => i.category === name).length,
    }))
      .filter((i) => i.count)
      .toSorted((a, b) => b.count - a.count),
  };
}
export function recordHeat(state: RadarState, at = new Date().toISOString()) {
  const values = Object.fromEntries(
    stories(state, at).map((s) => [s.id, s.heat]),
  );
  state.heatHistory.push({ at, values });
  state.heatHistory = state.heatHistory
    .filter((p) => Date.parse(at) - Date.parse(p.at) < 72 * HOUR)
    .slice(-300);
}
