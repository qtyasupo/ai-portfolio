import { beforeEach, afterEach, describe, expect, it } from "vitest";
import { createClient, type Client } from "@libsql/client";
import { sqliteStore, snapshotStore, type StateStore } from "../lib/store";
import {
  emptyState,
  ingest,
  stories,
  brief,
  validateCandidates,
} from "../lib/pipeline";
import { ingestBatch, overview } from "../lib/radar";
import { writeAccess, limitedJson } from "../lib/access";
import type { Candidate } from "../lib/types";
const NOW = "2026-11-02T12:00:00.000Z";
const sample = (overrides: Partial<Candidate> = {}): Candidate => ({
  platform: "youtube",
  url: "https://youtu.be/abcdefghijk?si=tracking",
  title: "Claude animation with Remotion",
  author: "Creator",
  text: "A practical workflow for Claude code animation.",
  publishedAt: "2026-11-02T08:00:00Z",
  dateConfidence: "verified",
  access: "detail",
  metrics: { views: 1200 },
  ...overrides,
});
let client: Client;
let db: StateStore;
beforeEach(() => {
  client = createClient({ url: "file::memory:" });
  db = sqliteStore(client);
});
afterEach(() => {
  client.close();
  delete process.env.VERCEL;
  delete process.env.RADAR_ADMIN_TOKEN;
});
describe("资料入库与公开出口", () => {
  it("同一视频不同分享链接更新同一资料，保留两次观察", async () => {
    await ingestBatch([sample()], {}, db);
    await ingestBatch(
      [
        sample({
          url: "https://www.youtube.com/watch?v=abcdefghijk&utm_source=x",
          metrics: { views: 2300 },
          access: "search",
          text: "short",
        }),
      ],
      {},
      db,
    );
    const r = await overview(db);
    expect(r.state.items).toHaveLength(1);
    const item = r.state.items[0];
    expect(item.url).toBe("https://www.youtube.com/watch?v=abcdefghijk");
    expect(item.metrics.views).toBe(2300);
    expect(item.text).toBe("A practical workflow for Claude code animation.");
    expect(item.observations).toHaveLength(2);
  });
  it("未知、推估、未来日期隔离，不进入事件或当日日报", () => {
    const s = emptyState();
    ingest(
      s,
      [
        sample({ publishedAt: null }),
        sample({
          url: "https://youtu.be/bbcdefghijk",
          dateConfidence: "estimated",
        }),
        sample({
          url: "https://youtu.be/cccdefghijk",
          publishedAt: "2026-11-03T08:00:00Z",
        }),
      ],
      NOW,
    );
    expect(s.items.map((i) => i.status)).toEqual([
      "pending",
      "pending",
      "pending",
    ]);
    expect(brief(s, "2026-11-02").total).toBe(0);
    expect(stories(s, NOW)).toEqual([]);
  });
  it("首次回灌与超过48小时的内容可归档，但不刷当日日报", () => {
    const s = emptyState();
    ingest(
      s,
      [
        sample({ backfill: true }),
        sample({
          url: "https://youtu.be/bbcdefghijk",
          publishedAt: "2026-10-20T08:00:00Z",
        }),
      ],
      NOW,
    );
    expect(s.items.map((i) => i.status)).toEqual(["archive", "archive"]);
    expect(brief(s, "2026-11-02").total).toBe(0);
  });
  it("隔离资料补齐可信日期后仍保留首次回灌资格", () => {
    const s = emptyState();
    ingest(s, [sample({ publishedAt: null, backfill: true })], NOW);
    ingest(s, [sample()], NOW);
    expect(s.items[0].status).toBe("archive");
    expect(s.items[0].observations).toHaveLength(1);
  });
  it("日报按中国自然日归集，不拿发现时间当发布时间", () => {
    const s = emptyState();
    ingest(s, [sample({ publishedAt: "2026-11-01T17:00:00Z" })], NOW);
    expect(brief(s, "2026-11-02").total).toBe(1);
    expect(brief(s, "2026-11-01").total).toBe(0);
  });
  it("无模型配置时保留明确的规则评分，不生成伪模型结果", async () => {
    await ingestBatch([sample()], {}, db);
    const r = await overview(db);
    expect(r.model).toBe("rules");
    expect(r.state.items[0].scoreMode).toBe("rules");
    expect(r.state.items[0].scoreDetail).toBeUndefined();
  });
  it("拒绝不匹配平台、危险链接及伪造的负互动值", () => {
    expect(() =>
      validateCandidates([
        sample({ url: "https://evil.test/watch?v=abcdefghijk" }),
      ]),
    ).toThrow();
    expect(() =>
      validateCandidates([sample({ metrics: { views: -1 } })]),
    ).toThrow();
    expect(() =>
      validateCandidates([sample({ url: "javascript:alert(1)" })]),
    ).toThrow();
  });
  it("数据库事务失败不留半批资料", async () => {
    await expect(
      db.update((s) => {
        ingest(s, [sample()], NOW);
        throw new Error("aborted");
      }),
    ).rejects.toThrow("aborted");
    expect((await db.read()).items).toEqual([]);
  });
  it("只读快照拒绝写入，不悄悄使用临时云文件", async () => {
    const s = snapshotStore(async () => emptyState());
    await expect(ingestBatch([sample()], {}, s)).rejects.toThrow("只读");
    expect(s.mode).toBe("snapshot");
  });
});
describe("跨发布方样本热度", () => {
  it("同一发布方重复发帖只计一次，24h证据贡献半个权重", () => {
    const s = emptyState();
    ingest(
      s,
      [
        sample({
          eventKey: "release",
          publisherId: "company",
          publishedAt: "2026-11-01T12:00:00Z",
        }),
        sample({
          url: "https://youtu.be/bbcdefghijk",
          eventKey: "release",
          publisherId: "company",
          publishedAt: "2026-11-01T12:00:00Z",
        }),
        sample({
          platform: "x",
          url: "https://x.com/a/status/12345",
          eventKey: "release",
          publisherId: "independent",
          publishedAt: NOW,
          metrics: { likes: 900000 },
        }),
      ],
      NOW,
    );
    const hot = stories(s, NOW)[0];
    expect(hot.sourceCount).toBe(2);
    expect(hot.platformCount).toBe(2);
    expect(hot.heat).toBe(15);
    expect(hot.change).toBeNull();
    expect(hot.trend).toBe("unavailable");
  });
  it("同一平台的两个独立作者也可形成事件，单一发布方不进榜", () => {
    const s = emptyState();
    ingest(
      s,
      [sample({ eventKey: "same", publisherId: "one", publishedAt: NOW })],
      NOW,
    );
    expect(stories(s, NOW)).toEqual([]);
    ingest(
      s,
      [
        sample({
          url: "https://youtu.be/bbcdefghijk",
          eventKey: "same",
          publisherId: "two",
          publishedAt: NOW,
        }),
      ],
      NOW,
    );
    expect(stories(s, NOW)[0].heat).toBe(20);
  });
  it("共享宽泛关键词不自动当作同一事件", () => {
    const s = emptyState();
    ingest(
      s,
      [
        sample({ title: "Claude creates a bouncing ball" }),
        sample({
          url: "https://youtu.be/bbcdefghijk",
          title: "Claude creates a sunset",
          author: "Other",
        }),
      ],
      NOW,
    );
    expect(stories(s, NOW)).toEqual([]);
  });
});
describe("写入访问控制", () => {
  it("Next内部重写为localhost时按实际Host核对浏览器同源", () => {
    expect(
      writeAccess(
        new Request("http://localhost:4318/api/sources", {
          headers: { Host: "127.0.0.1:4318", Origin: "http://127.0.0.1:4318" },
        }),
      ),
    ).toBe(true);
  });
  it("本机同源允许，跨站和云端无令牌拒绝", () => {
    expect(
      writeAccess(
        new Request("http://127.0.0.1:4318/api/ingest", {
          headers: { Origin: "http://127.0.0.1:4318" },
        }),
      ),
    ).toBe(true);
    expect(
      writeAccess(
        new Request("http://127.0.0.1:4318/api/ingest", {
          headers: { Origin: "https://evil.test" },
        }),
      ),
    ).toBe(false);
    process.env.VERCEL = "1";
    expect(writeAccess(new Request("http://localhost/api/ingest"))).toBe(false);
  });
  it("服务端令牌要求足够长度，错误令牌拒绝", () => {
    process.env.VERCEL = "1";
    process.env.RADAR_ADMIN_TOKEN = "a-long-test-token-at-least-24-characters";
    expect(
      writeAccess(
        new Request("https://radar.test/api/ingest", {
          headers: {
            Authorization: "Bearer a-long-test-token-at-least-24-characters",
          },
        }),
      ),
    ).toBe(true);
    expect(
      writeAccess(
        new Request("https://radar.test/api/ingest", {
          headers: { Authorization: "Bearer wrong" },
        }),
      ),
    ).toBe(false);
  });
  it("不信任缺少Content-Length的过大请求", async () => {
    const req = new Request("http://localhost/api/ingest", {
      method: "POST",
      body: JSON.stringify({ x: "a".repeat(100) }),
    });
    await expect(limitedJson(req, 20)).rejects.toThrow("过大");
  });
});
