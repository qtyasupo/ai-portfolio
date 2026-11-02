export const PLATFORMS = ["douyin", "xiaohongshu", "youtube", "x"] as const;
export type Platform = (typeof PLATFORMS)[number];
export const PLATFORM_LABELS: Record<Platform, string> = {
  douyin: "抖音",
  xiaohongshu: "小红书",
  youtube: "YouTube",
  x: "X",
};
export const CATEGORIES = [
  "AI 短剧",
  "AI 视频",
  "代码动画",
  "Claude 动画",
  "AIGC 工具",
  "创作教程",
] as const;
export type Category = (typeof CATEGORIES)[number];
export type Metrics = Partial<
  Record<"likes" | "views" | "comments" | "favorites" | "shares", number>
>;
export interface Candidate {
  platform: Platform;
  url: string;
  title: string;
  author?: string;
  text?: string;
  publishedAt?: string | null;
  dateConfidence?: "verified" | "estimated" | "unknown";
  datePrecision?: "day" | "second";
  metrics?: Metrics;
  query?: string;
  evidence?: string;
  access?: "search" | "detail" | "subtitle" | "user_import";
  publisherId?: string;
  eventKey?: string;
  backfill?: boolean;
}
export interface Observation {
  at: string;
  metrics: Metrics;
  access: Candidate["access"];
  evidence: string;
}
export interface Item {
  id: string;
  platform: Platform;
  url: string;
  title: string;
  author: string;
  text: string;
  publishedAt: string | null;
  dateConfidence: "verified" | "estimated" | "unknown";
  datePrecision?: "day" | "second";
  firstSeenAt: string;
  lastSeenAt: string;
  metrics: Metrics;
  query: string;
  evidence: string;
  access: NonNullable<Candidate["access"]>;
  publisherId: string;
  category: Category;
  tags: string[];
  summary: string;
  score: number;
  scoreMode: "rules" | "dual-model";
  scoreDetail?: { a: number; b: number; reason: string };
  status: "selected" | "archive" | "pending" | "excluded";
  eventKey: string;
  backfill: boolean;
  observations: Observation[];
}
export interface Source {
  platform: Platform;
  name: string;
  enabled: boolean;
  queries: string[];
  cursor: number;
  state: "idle" | "ok" | "needs_login" | "blocked" | "rate_limited" | "error";
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  message: string;
}
export interface Run {
  id: string;
  platform: Platform | "import";
  query: string;
  startedAt: string;
  completedAt: string;
  status: "ok" | "error" | "partial";
  received: number;
  created: number;
  updated: number;
  message: string;
}
export interface HeatPoint {
  at: string;
  values: Record<string, number>;
}
export interface RadarState {
  version: 1;
  updatedAt: string | null;
  items: Item[];
  sources: Source[];
  runs: Run[];
  heatHistory: HeatPoint[];
}
export interface Story {
  id: string;
  title: string;
  category: Category;
  items: Item[];
  sourceCount: number;
  platformCount: number;
  heat: number;
  trend: "new" | "rising" | "steady" | "unavailable";
  change: number | null;
}
export interface Brief {
  date: string;
  total: number;
  selected: number;
  platforms: number;
  entries: Item[];
  themes: { name: Category; count: number }[];
}
export interface Overview {
  state: RadarState;
  stories: Story[];
  brief: Brief;
  storage: "local" | "remote" | "snapshot";
  writable: boolean;
  collectorRunning: boolean;
  model: "rules" | "dual-model";
  coverage: string;
}
