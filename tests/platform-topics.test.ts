import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  defaultTracking,
  formatTopicDraft,
  parseTopicDraft,
  validateTracking,
} from "../lib/tracking";
import type { WatchTopic } from "../lib/types";
const research = JSON.parse(
  readFileSync(
    new URL("../data/platform-topic-research-2026-11-04.json", import.meta.url),
    "utf8",
  ),
) as { topics: WatchTopic[] };
describe("platform-specific researched topics", () => {
  it("keeps portable research free of note access tokens and rejects unrelated access URLs", () => {
    expect(JSON.stringify(research)).not.toContain("xsec_token");
    const t = structuredClone(research.topics[0]);
    t.basis!.samples[0].accessUrl = "https://www.douyin.com/video/999999";
    expect(() =>
      validateTracking({ ...defaultTracking(), topics: [t] }),
    ).toThrow("内容不匹配");
  });
  it("keeps each researched topic and its source evidence on the correct platform", () => {
    const t = validateTracking({
      ...defaultTracking(),
      topics: research.topics,
    });
    expect(t.topics.filter((t) => t.platforms.includes("douyin"))).toHaveLength(
      3,
    );
    expect(
      t.topics.filter((t) => t.platforms.includes("xiaohongshu")),
    ).toHaveLength(3);
    expect(
      t.topics.every(
        (t) =>
          t.platforms.length === 1 &&
          t.basis!.samples.every((s) => s.platform === t.platforms[0]),
      ),
    ).toBe(true);
  });
  it("editing and saving a topic list preserves platform scope and source evidence", () => {
    const parsed = parseTopicDraft(
      formatTopicDraft(research.topics),
      research.topics,
    );
    expect(
      parsed.map((t) => ({ platforms: t.platforms, basis: t.basis })),
    ).toEqual(
      research.topics.map((t) => ({ platforms: t.platforms, basis: t.basis })),
    );
  });
  it("changing platform or query clears the previous claim's research evidence", () => {
    const t = research.topics[0];
    const [changed] = parseTopicDraft(`小红书 | ${t.label} | another query`, [
      t,
    ]);
    expect(changed.platforms).toEqual(["xiaohongshu"]);
    expect(changed.basis).toBeUndefined();
  });
  it("does not promote edited or missing-year note dates", () => {
    const xhs = research.topics.filter((t) => t.platforms[0] === "xiaohongshu");
    expect(
      xhs.every((t) =>
        t.basis!.samples.every((s) => !s.dateVerified && !s.publishedAt),
      ),
    ).toBe(true);
  });
  it("rejects mismatched platform evidence and fake verified dates", () => {
    const t = structuredClone(research.topics[0]);
    t.basis!.samples[0].platform = "xiaohongshu";
    expect(() =>
      validateTracking({ ...defaultTracking(), topics: [t] }),
    ).toThrow();
    const undated = structuredClone(
      research.topics.find((t) => t.platforms[0] === "xiaohongshu")!,
    );
    undated.basis!.samples[0].dateVerified = true;
    expect(() =>
      validateTracking({ ...defaultTracking(), topics: [undated] }),
    ).toThrow("日期未核验");
  });
});
