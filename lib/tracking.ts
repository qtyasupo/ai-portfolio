import { validateTopicBasis } from "./topic-basis";
import topicResearch from "../data/platform-topic-research-2026-11-04.json";
import {
  NEWS_CATEGORIES,
  PLATFORM_LABELS,
  PLATFORMS,
  type Item,
  type Stream,
  type TrackingConfig,
  type WatchTopic,
  type Platform,
} from "./types";

export function formatTopicDraft(topics: WatchTopic[]): string {
  return topics
    .map(
      (t) =>
        `${t.platforms.map((p) => PLATFORM_LABELS[p]).join(",")} | ${t.label} | ${t.query}`,
    )
    .join("\n");
}
export function parseTopicDraft(
  text: string,
  previous: WatchTopic[],
): WatchTopic[] {
  return text
    .split("\n")
    .filter((line) => line.trim())
    .map((line, index) => {
      const [scope, label, ...queryParts] = line
        .split("|")
        .map((v) => v.trim());
      const query = queryParts.join("|");
      if (!scope || !label || !query)
        throw new Error("每行请使用：平台 | 话题名称 | 搜索词");
      const platforms = [
        ...new Set(
          scope.split(/[,，、]/).map((name) => {
            const p = PLATFORMS.find(
              (p) =>
                p === name.trim().toLowerCase() ||
                PLATFORM_LABELS[p].toLowerCase() === name.trim().toLowerCase(),
            );
            if (!p) throw new Error(`不支持的平台：${name}`);
            return p;
          }),
        ),
      ] as Platform[];
      const old = previous.find(
        (t) =>
          t.label === label &&
          t.query === query &&
          t.platforms.length === platforms.length &&
          t.platforms.every((p) => platforms.includes(p)),
      );
      return {
        id: old?.id || `draft-${crypto.randomUUID()}`,
        label,
        query,
        platforms,
        confirmed: true,
        enabled: true,
        ...(old?.basis ? { basis: old.basis } : {}),
      };
    });
}

// Suggestions only; nothing is monitored until the operator confirms and enables it.
export function defaultTracking(): TrackingConfig {
  return {
    accounts: [
      ["sama", "Sam Altman"],
      ["AnthropicAI", "Anthropic"],
      ["OpenAI", "OpenAI"],
      ["GoogleDeepMind", "Google DeepMind"],
      ["NVIDIA", "NVIDIA"],
      ["karpathy", "Andrej Karpathy"],
    ].map(([handle, label]) => ({
      handle,
      label,
      enabled: false,
      confirmed: false,
    })),
    topics: [
      ["drama", "AI 短剧 / AI 漫剧", "AI短剧"],
      ["video", "AI 视频 / 创意短片", "AI视频"],
      ["seedance", "即梦 / Seedance 创作", "即梦AI创作"],
      ["motion", "Claude 代码动画", "Claude animation"],
      ["workflow", "AIGC 制作工作流", "AIGC教程"],
    ].map(([id, label, query]) => ({
      id,
      label,
      query,
      platforms: [...PLATFORMS],
      confirmed: false,
      enabled: false,
    })),
    telegram: { status: "placeholder", channels: [] },
  };
}
// Public page defaults contain only portable research, never the private roster.
export function publishedTracking(): TrackingConfig {
  const defaults = defaultTracking();
  return validateTracking({
    ...defaults,
    accounts: [],
    topics: [
      ...topicResearch.topics,
      ...defaults.topics.map((topic) => ({
        ...topic,
        platforms: topic.platforms.filter((p) => p === "x" || p === "youtube"),
      })),
    ],
  });
}
export function itemStream(item: Pick<Item, "stream" | "category">): Stream {
  return (
    item.stream ||
    (NEWS_CATEGORIES.includes(item.category as (typeof NEWS_CATEGORIES)[number])
      ? "news"
      : "creation")
  );
}
export function normalizeHandle(input: string): string {
  let handle = input.trim();
  if (/^https?:\/\//i.test(handle)) {
    const u = new URL(handle);
    if (
      u.protocol !== "https:" ||
      !["x.com", "www.x.com", "twitter.com", "www.twitter.com"].includes(
        u.hostname,
      ) ||
      u.username ||
      u.password ||
      u.port ||
      !/^\/[A-Za-z0-9_]{1,15}\/?$/.test(u.pathname)
    )
      throw new Error("请输入 X 账号名或个人主页链接");
    handle = u.pathname.replaceAll("/", "");
  }
  handle = handle.replace(/^@/, "");
  if (!/^[A-Za-z0-9_]{1,15}$/.test(handle))
    throw new Error("X 账号名需为1至15位字母、数字或下划线");
  return handle;
}
export function validateTracking(value: unknown): TrackingConfig {
  if (!value || typeof value !== "object") throw new Error("关注配置无效");
  const input = value as TrackingConfig;
  if (
    !Array.isArray(input.accounts) ||
    input.accounts.length > 100 ||
    !Array.isArray(input.topics) ||
    input.topics.length > 30
  )
    throw new Error("账号最多100个，话题最多30条");
  const accounts = input.accounts.map((a) => {
    if (
      !a ||
      typeof a.handle !== "string" ||
      typeof a.label !== "string" ||
      !a.label.trim() ||
      a.label.length > 80 ||
      typeof a.enabled !== "boolean" ||
      typeof a.confirmed !== "boolean"
    )
      throw new Error("关注账号格式无效");
    if (a.enabled && !a.confirmed) throw new Error("请先确认账号，再启用追踪");
    return {
      handle: normalizeHandle(a.handle),
      label: a.label.trim(),
      enabled: a.enabled,
      confirmed: a.confirmed,
    };
  });
  if (
    new Set(accounts.map((a) => a.handle.toLowerCase())).size !==
    accounts.length
  )
    throw new Error("关注账号重复");
  const topics = input.topics.map((t) => {
    if (
      !t ||
      typeof t.id !== "string" ||
      !/^[\w-]{1,60}$/.test(t.id) ||
      typeof t.label !== "string" ||
      !t.label.trim() ||
      t.label.length > 80 ||
      typeof t.query !== "string" ||
      !t.query.trim() ||
      t.query.length > 100 ||
      !Array.isArray(t.platforms) ||
      !t.platforms.length ||
      t.platforms.some((p) => !PLATFORMS.includes(p)) ||
      typeof t.confirmed !== "boolean" ||
      typeof t.enabled !== "boolean"
    )
      throw new Error("话题格式无效");
    if (t.enabled && !t.confirmed) throw new Error("请先确认话题，再启用追踪");
    return {
      id: t.id,
      label: t.label.trim(),
      query: t.query.trim(),
      platforms: [...new Set(t.platforms)],
      confirmed: t.confirmed,
      enabled: t.enabled,
      ...(t.basis ? { basis: validateTopicBasis(t.basis, t.platforms) } : {}),
    };
  });
  if (new Set(topics.map((t) => t.id)).size !== topics.length)
    throw new Error("话题重复");
  const channels = input.telegram?.channels || [];
  if (
    !Array.isArray(channels) ||
    channels.length > 20 ||
    channels.some(
      (c) =>
        typeof c !== "string" ||
        !/^https:\/\/t\.me\/[A-Za-z0-9_]{5,32}\/?$/.test(c),
    )
  )
    throw new Error("Telegram占位仅接受公开频道链接");
  return {
    accounts,
    topics,
    telegram: { status: "placeholder", channels: [...new Set(channels)] },
  };
}
