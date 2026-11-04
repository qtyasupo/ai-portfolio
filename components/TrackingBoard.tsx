"use client";
import { useEffect, useState } from "react";
import { Check, ChevronDown, RefreshCw, Settings2 } from "lucide-react";
import {
  normalizeHandle,
  formatTopicDraft,
  parseTopicDraft,
} from "@/lib/tracking";
import PlatformTopics from "./PlatformTopics";
import type { Overview, Stream, TrackingConfig, Platform } from "@/lib/types";

export default function TrackingBoard({
  stream,
  config,
  platform,
  query,
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
  platform: Platform | "all" | "telegram";
  query: string;
  writable: boolean;
  busy: boolean;
  monitor: Overview["newsMonitor"];
  onSave: (config: TrackingConfig) => Promise<boolean>;
  onImport: () => Promise<void>;
  onCollect: (watch: boolean, stop?: boolean) => Promise<void>;
  onTopic: (query: string, platform?: Platform) => void;
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
    setTopicText(formatTopicDraft(current.topics));
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
        <PlatformTopics
          topics={config.topics}
          platform={platform}
          query={query}
          onTopic={onTopic}
        />
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
              <h3>按平台管理话题</h3>
              <p>
                每行写“平台 | 话题名称 |
                搜索词”。平台可用抖音、小红书、X、YouTube，多平台用逗号分隔。已核对的样本依据会保留；更改话题或平台后重新验证。
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
                    try {
                      const topics = parseTopicDraft(topicText, config.topics);
                      if (await onSave({ ...config, topics })) setError("");
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "话题格式无效");
                    }
                  }}
                >
                  <Check size={14} />
                  确认并保存话题
                </button>
              </div>
              <p className="tracking-note">
                话题只进入所选平台的轮换词。高赞样本与近期趋势分开：编辑日期、缺年份日期不视为已核验的原发布日期。
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
