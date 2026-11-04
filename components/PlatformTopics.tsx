"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { PLATFORM_LABELS, type Platform, type WatchTopic } from "@/lib/types";
const likes = (n?: number) =>
  n === undefined
    ? "互动未读取"
    : `${n >= 10000 ? (n / 10000).toFixed(1) + "万" : n}赞`;
export default function PlatformTopics({
  topics,
  platform,
  query,
  onTopic,
}: {
  topics: WatchTopic[];
  platform: Platform | "all" | "telegram";
  query: string;
  onTopic: (query: string, platform?: Platform) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const active = topics.find(
    (t) =>
      t.id === selected &&
      t.query === query &&
      (platform === "all" || t.platforms.includes(platform as Platform)),
  );
  const groups: Platform[] =
    platform === "all"
      ? ["douyin", "xiaohongshu"]
      : platform === "telegram"
        ? []
        : [platform];
  return (
    <div className="platform-topic-board">
      <div className="platform-topic-groups">
        {groups.map((p) => {
          const scoped = topics.filter((t) => t.platforms.includes(p));
          return (
            <section
              className="platform-topic-group"
              key={p}
              aria-label={`${PLATFORM_LABELS[p]}AI话题`}
            >
              <h2>
                {PLATFORM_LABELS[p]}{" "}
                <span>
                  {scoped.some((t) => t.basis) ? "AI热门话题" : "AI话题候选"}
                </span>
              </h2>
              {scoped.length ? (
                <div className="topic-shortcuts">
                  {scoped.slice(0, 6).map((t) => (
                    <button
                      key={t.id}
                      aria-pressed={active?.id === t.id}
                      onClick={() => {
                        setSelected(t.id);
                        onTopic(t.query, p);
                      }}
                    >
                      #{t.label}
                      {!t.basis && !t.confirmed && <small>待定</small>}
                    </button>
                  ))}
                </div>
              ) : (
                <p>尚未设置该平台话题</p>
              )}
              <p className="topic-method">
                {scoped.some((t) => t.basis)
                  ? scoped
                      .flatMap((t) => t.basis?.samples || [])
                      .every((s) => !s.dateVerified)
                    ? "高互动线索；原发布日期待核验，不认定近期热榜"
                    : "近期作品样本提炼 · 非官方AI分区榜单"
                  : "候选词，等待验证"}
              </p>
            </section>
          );
        })}
      </div>
      {active && (
        <section className="topic-evidence" aria-label="话题依据">
          <div className="topic-evidence-heading">
            <b>#{active.label}</b>
            <a
              href={
                platform === "douyin"
                  ? `https://www.douyin.com/search/${encodeURIComponent(active.query)}`
                  : platform === "xiaohongshu"
                    ? `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(active.query)}`
                    : platform === "x"
                      ? `https://x.com/search?q=${encodeURIComponent(active.query)}`
                      : `https://www.youtube.com/results?search_query=${encodeURIComponent(active.query)}`
              }
              target="_blank"
              rel="noreferrer"
            >
              去平台看话题 <ArrowUpRight size={13} />
            </a>
          </div>
          {active.basis ? (
            <>
              <p>{active.basis.summary}</p>
              <ul>
                {active.basis.samples.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.accessUrl || s.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {s.title}
                      <ArrowUpRight size={13} />
                    </a>
                    <span>
                      {likes(s.likes)} ·{" "}
                      {s.dateVerified && s.publishedAt
                        ? new Intl.DateTimeFormat("zh-CN", {
                            month: "2-digit",
                            day: "2-digit",
                            timeZone: "Asia/Shanghai",
                          }).format(new Date(s.publishedAt))
                        : "原发布日期待核验"}
                    </span>
                  </li>
                ))}
              </ul>
              <small>
                检索于{" "}
                {new Intl.DateTimeFormat("zh-CN", {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Shanghai",
                }).format(new Date(active.basis.observedAt))}
                。编辑日期不作为原发布日期；待核验笔记仅作研究依据，不进入近期资讯排序。
              </small>
            </>
          ) : (
            <p>这是候选搜索词，尚未取得足够的热门依据。</p>
          )}
        </section>
      )}
    </div>
  );
}
