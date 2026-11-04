import { describe, expect, it } from "vitest";
import {
  defaultTracking,
  itemStream,
  normalizeHandle,
  validateTracking,
} from "../lib/tracking";
import { emptyState, ingest } from "../lib/pipeline";
import { publicState } from "../lib/publication";
import type { Candidate } from "../lib/types";
const NOW = "2026-11-04T08:00:00Z";
const news = (overrides: Partial<Candidate> = {}): Candidate => ({
  platform: "x",
  stream: "news",
  title: "OpenAI launches a new model",
  url: "https://x.com/OpenAI/status/12345",
  publishedAt: NOW,
  dateConfidence: "verified",
  ...overrides,
});
describe("news and creative tracking", () => {
  it("corporate reports are not classified as model announcements merely for mentioning Claude", () => {
    const s = emptyState();
    ingest(
      s,
      [news({ title: "Anthropic IPO discussion mentioning Claude" })],
      NOW,
    );
    expect(s.items[0].category).toBe("人物与企业");
  });
  it("news classification and stream persist through an older client updating metrics", () => {
    const s = emptyState();
    ingest(s, [news()], NOW);
    expect(s.items[0].category).toBe("AI 模型");
    ingest(s, [news({ stream: undefined, metrics: { likes: 42 } })], NOW);
    expect(itemStream(s.items[0])).toBe("news");
    expect(s.items[0].category).toBe("AI 模型");
    expect(s.items[0].metrics.likes).toBe(42);
  });
  it("hardware gets its own category and undated news stays quarantined", () => {
    const s = emptyState();
    ingest(
      s,
      [news({ title: "NVIDIA AI GPU hardware launch", publishedAt: null })],
      NOW,
    );
    expect(s.items[0].category).toBe("AI 硬件");
    expect(s.items[0].status).toBe("pending");
    expect(publicState(s).items).toHaveLength(0);
  });
  it("legacy creative records stay in creative stream", () => {
    expect(itemStream({ category: "Claude 动画" })).toBe("creation");
  });
  it("accepts forty confirmed following accounts and rejects unconfirmed activation", () => {
    const t = defaultTracking();
    t.accounts = Array.from({ length: 40 }, (_, n) => ({
      handle: `test_${n}`,
      label: `Test ${n}`,
      enabled: true,
      confirmed: true,
    }));
    expect(validateTracking(t).accounts).toHaveLength(40);
    t.accounts[0].confirmed = false;
    expect(() => validateTracking(t)).toThrow("先确认");
  });
  it("keeps the user's following list out of public snapshots", () => {
    const s = emptyState();
    s.tracking = defaultTracking();
    expect(publicState(s).tracking).toBeUndefined();
    expect(s.tracking.accounts.length).toBeGreaterThan(0);
  });
  it("accepts account home URLs but rejects status URLs and operator injection", () => {
    expect(normalizeHandle("https://x.com/OpenAI")).toBe("OpenAI");
    expect(() => normalizeHandle("https://x.com/OpenAI/status/1")).toThrow();
    expect(() => normalizeHandle("name OR from:other")).toThrow();
    expect(() => normalizeHandle("https://x.com.evil.test/OpenAI")).toThrow();
  });
});
