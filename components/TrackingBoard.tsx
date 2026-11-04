"use client";
import { useEffect, useState } from "react";
import { Check, ChevronDown, RefreshCw, Settings2 } from "lucide-react";
import { normalizeHandle } from "@/lib/tracking";
import type { Overview, Stream, TrackingConfig } from "@/lib/types";

export default function TrackingBoard({
  stream,
  config,
  writable,
  busy,
  monitor,
  onSave,
  onImport,
  onCollect,
  onTopic,
}: {
  stream: Stream;
  config: TrackingConfig;
  writable: boolean;
  busy: boolean;
  monitor: Overview["newsMonitor"];
  onSave: (config: TrackingConfig) => Promise<boolean>;
  onImport: () => Promise<void>;
  onCollect: (watch: boolean, stop?: boolean) => Promise<void>;
  onTopic: (query: string) => void;
}) {
  const [accounts, setAccounts] = useState("");
  const [topicText, setTopicText] = useState("");
  const [error, setError] = useState("");
  const configKey = JSON.stringify(config);
  useEffect(() => {
    const current: TrackingConfig = JSON.parse(configKey);
    setAccounts(
      current.accounts
        .filter((a) => a.confirmed)
        .map((a) => `@${a.handle}`)
        .join("\n"),
    );
    setTopicText(
      current.topics.map((t) => `${t.label} | ${t.query}`).join("\n"),
    );
  }, [configKey]);
  const count = config.accounts.filter((a) => a.confirmed && a.enabled).length;
  return (
    <div className="tracking-board">
      {stream === "news" ? (
        <div className="monitor-line">
          <span>
            <i className={monitor?.running ? "live-dot" : "idle-dot"} />
            {monitor?.running
              ? monitor.mode === "once"
                ? "正在检查公开发文"
                : "追踪运行中 · 5分钟检查一次"
              : "追踪未运行"}
            <b>Following · {count} 人</b>
          </span>
          <button
            disabled={!writable || busy || count === 0 || monitor?.running}
            onClick={() => void onCollect(false)}
          >
            <RefreshCw size={13} />
            检查更新
          </button>
        </div>
      ) : (
        <div className="topic-shortcuts" aria-label="候选创作话题">
          {config.topics.slice(0, 6).map((t) => (
            <button key={t.id} onClick={() => onTopic(t.query)}>
              #{t.label}
              {!t.confirmed && <small>待定</small>}
            </button>
          ))}
        </div>
      )}
      <details className="tracking-settings">
        <summary>
          <Settings2 size={14} />
          {stream === "news" ? "关注账号与接入状态" : "管理创作标签与话题"}
          <ChevronDown size={13} />
        </summary>
        <div className="tracking-settings-body">
          {stream === "news" ? (
            <>
              <div className="tracking-heading">
                <h3>我的 X Following</h3>
                <button
                  disabled={!writable || busy}
                  onClick={() => void onImport()}
                >
                  从已登录账号导入
                </button>
              </div>
              <p>
                只读读取关注名单与公开发文。实时新闻按模型、硬件、人物与企业筛选；不相关的日常内容不会公开。
              </p>
              {count > 0 ? (
                <div className="account-chips">
                  {config.accounts
                    .filter((a) => a.confirmed && a.enabled)
                    .map((a) => (
                      <a
                        key={a.handle}
                        href={`https://x.com/${a.handle}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        @{a.handle}
                      </a>
                    ))}
                </div>
              ) : (
                <p className="tracking-note">
                  尚未导入Following名单。下方可填写账号；建议名单不代表已关注或已连接。
                </p>
              )}
              <label className="tracking-editor">
                关注账号（每行一个，最多100个）
                <textarea
                  aria-label="新闻关注账号"
                  value={accounts}
                  onChange={(e) => setAccounts(e.target.value)}
                  placeholder="@账号名"
                />
              </label>
              <div className="tracking-actions">
                <button
                  disabled={!writable || busy}
                  onClick={async () => {
                    try {
                      const handles = [
                        ...new Set(
                          accounts
                            .split(/\s+/)
                            .filter(Boolean)
                            .map(normalizeHandle),
                        ),
                      ];
                      const next = {
                        ...config,
                        accounts: handles.map((handle) => ({
                          handle,
                          label:
                            config.accounts.find(
                              (a) =>
                                a.handle.toLowerCase() === handle.toLowerCase(),
                            )?.label || handle,
                          enabled: true,
                          confirmed: true,
                        })),
                      };
                      if (await onSave(next)) setError("");
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "账号格式无效");
                    }
                  }}
                >
                  <Check size={14} />
                  保存关注名单
                </button>
                {monitor?.running ? (
                  <button
                    disabled={!writable || busy}
                    onClick={() => void onCollect(false, true)}
                  >
                    停止追踪
                  </button>
                ) : (
                  <button
                    disabled={!writable || busy || count === 0}
                    onClick={() => void onCollect(true)}
                  >
                    开启5分钟追踪
                  </button>
                )}
              </div>
              {monitor?.message && (
                <p className="tracking-note">{monitor.message}</p>
              )}
              <div className="telegram-placeholder">
                <b>Telegram · 待接入</b>
                <p>
                  预留公开频道资讯入口。尚未配置频道与读取方式，当前不会采集
                  Telegram 消息。
                </p>
              </div>
            </>
          ) : (
            <>
              <h3>先放候选话题，我们一起筛选</h3>
              <p>
                每行写“话题名称 |
                搜索词”。目前是候选词，不代表平台实时热榜。作品的原文链接、文字摘录和可见互动保留在列表中。
              </p>
              <textarea
                aria-label="创作追踪话题"
                value={topicText}
                onChange={(e) => setTopicText(e.target.value)}
              />
              <div className="tracking-actions">
                <button
                  disabled={!writable || busy}
                  onClick={async () => {
                    const topics = topicText
                      .split("\n")
                      .filter((line) => line.trim())
                      .map((line, index) => {
                        const [label, query] = line
                          .split("|")
                          .map((v) => v.trim());
                        return {
                          id: `custom-${index}`,
                          label,
                          query: query || label,
                          platforms: [
                            "x",
                            "douyin",
                            "xiaohongshu",
                            "youtube",
                          ] as const,
                          confirmed: true,
                          enabled: true,
                        };
                      });
                    if (
                      await onSave({
                        ...config,
                        topics: topics.map((t) => ({
                          ...t,
                          platforms: [...t.platforms],
                        })),
                      })
                    )
                      setError("");
                  }}
                >
                  <Check size={14} />
                  确认并保存话题
                </button>
              </div>
              <p className="tracking-note">
                保存后供四个平台轮换检索。抖音、小红书优先关注近7天样本与平台点赞；不会把关键词结果标成全平台热榜。
              </p>
            </>
          )}
          {!writable && (
            <p className="tracking-note">
              当前是只读快照；请在本机资料库模式下配置和运行追踪。
            </p>
          )}
          {error && <p role="alert">{error}</p>}
        </div>
      </details>
    </div>
  );
}
