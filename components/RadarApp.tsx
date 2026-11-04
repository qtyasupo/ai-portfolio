"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { readingExcerpt } from "@/lib/presentation";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  Command,
  Database,
  ExternalLink,
  FileText,
  Film,
  Flame,
  Globe2,
  Heart,
  LayoutGrid,
  ListFilter,
  LoaderCircle,
  Menu,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Video,
  Workflow,
  X as CloseIcon,
} from "lucide-react";
import {
  CATEGORIES,
  PLATFORMS,
  PLATFORM_LABELS,
  type Category,
  type Item,
  type Overview,
  type Platform,
  type Source,
} from "@/lib/types";

type View = "discover" | "trends" | "brief" | "saved" | "desk";
const NAV = [
  { id: "discover" as const, label: "发现灵感", icon: LayoutGrid },
  { id: "trends" as const, label: "热点追踪", icon: Flame },
  { id: "brief" as const, label: "创作日报", icon: FileText },
  { id: "saved" as const, label: "我的收藏", icon: Bookmark },
];
const LABELS: Record<View, string> = {
  discover: "发现灵感",
  trends: "热点追踪",
  brief: "创作日报",
  saved: "我的收藏",
  desk: "采集工作台",
};
const MARK: Record<Platform, string> = {
  douyin: "♪",
  xiaohongshu: "红",
  youtube: "▶",
  x: "𝕏",
};
const STATUS: Record<Source["state"], string> = {
  idle: "等待采集",
  ok: "已采集",
  needs_login: "需要登录",
  blocked: "需要验证",
  rate_limited: "已暂停 · 限流",
  error: "采集异常",
};
const ICONS = [Film, Video, Code2, Command, Sparkles, Workflow];
function PlatformMark({
  platform,
  small = false,
}: {
  platform: Platform;
  small?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`platform-mark ${platform} ${small ? "small" : ""}`}
    >
      {MARK[platform]}
    </span>
  );
}
function compact(n: number | undefined) {
  return n === undefined
    ? "未读取"
    : n >= 1e8
      ? `${(n / 1e8).toFixed(1)}亿`
      : n >= 1e4
        ? `${(n / 1e4).toFixed(1)}万`
        : n >= 1000
          ? `${(n / 1000).toFixed(1)}k`
          : String(n);
}
function time(iso: string | null, full = false) {
  if (!iso) return "时间待核验";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit",
    ...(full
      ? ({ year: "numeric", hour: "2-digit", minute: "2-digit" } as const)
      : {}),
  }).format(new Date(iso));
}
function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function RadarApp({ initial }: { initial: Overview }) {
  const [data, setData] = useState(initial);
  const [view, setView] = useState<View>("discover");
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("selected");
  const [days, setDays] = useState("all");
  const [saved, setSaved] = useState<string[]>([]);
  const [detail, setDetail] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [menu, setMenu] = useState(false);
  const [token, setToken] = useState("");
  const [importText, setImportText] = useState("");
  const [backfill, setBackfill] = useState(true);
  const [edit, setEdit] = useState<Source | null>(null);
  const [queryText, setQueryText] = useState("");
  const [day, setDay] = useState(today());
  const [about, setAbout] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const navigationRef = useRef<HTMLElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const modalOpen = Boolean(detail || about || edit);
  const currentDay = useRef(day);
  currentDay.current = day;
  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem("yasupo-saved") || "[]",
      );
      if (Array.isArray(stored))
        setSaved(stored.filter((id): id is string => typeof id === "string"));
    } catch {}
    const v = new URLSearchParams(location.search).get("view");
    if (v && v in LABELS) setView(v as View);
  }, []);
  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`/api/feed?date=${currentDay.current}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });
      if (!r.ok) throw new Error("刷新失败，请检查数据连接");
      setData(await r.json());
    } catch (e) {
      setToast(e instanceof Error ? e.message : "刷新失败");
    }
  }, [token]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) void refresh();
    }, 20_000);
    return () => clearInterval(timer);
  }, [refresh]);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDetail(null);
        setAbout(false);
        setEdit(null);
        setMenu(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!document.querySelector('[role="dialog"]'))
          searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    if (!modalOpen && !menu) return;
    const previous =
      menu && !modalOpen
        ? menuTriggerRef.current
        : document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = modalOpen ? dialogRef.current : navigationRef.current;
    if (modalOpen) panel?.focus();
    else panel?.querySelector<HTMLButtonElement>(".nav-close")?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const dialog = panel;
      const nodes = dialog?.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
      );
      const focusable = Array.from(nodes || []).filter(
        (node) => node.getClientRects().length > 0,
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === dialog)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || document.activeElement === dialog)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [modalOpen, menu]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 801px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMenu(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  const navigate = (next: View) => {
    setView(next);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    history.replaceState(
      null,
      "",
      next === "discover" ? "/" : `/?view=${next}`,
    );
  };
  const favorite = (id: string) => {
    const next = saved.includes(id)
      ? saved.filter((x) => x !== id)
      : [...saved, id];
    setSaved(next);
    try {
      localStorage.setItem("yasupo-saved", JSON.stringify(next));
    } catch {
      setToast("浏览器无法保存收藏，本次仅在当前页面保留");
      return;
    }
    setToast(next.includes(id) ? "已加入本机收藏" : "已取消收藏");
  };
  const action = async (path: string, body?: unknown) => {
    setBusy(true);
    try {
      const r = await fetch(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error || "操作失败");
      await refresh();
      return result;
    } catch (e) {
      setToast(e instanceof Error ? e.message : "操作失败");
      return null;
    } finally {
      setBusy(false);
    }
  };
  const visible = useMemo(
    () =>
      data.state.items.filter((i) =>
        ["selected", "archive"].includes(i.status),
      ),
    [data],
  );
  const pending = data.state.items.filter((i) => i.status === "pending");
  const hasFilters = Boolean(
    q.trim() || platform !== "all" || category !== "all" || days !== "all",
  );
  const resetFilters = () => {
    setQ("");
    setPlatform("all");
    setCategory("all");
    setDays("all");
  };
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const cutoff = Date.now() - Number(days) * 86400000;
    return data.state.items
      .filter((i) => {
        if (view === "saved") {
          if (
            !saved.includes(i.id) ||
            !["selected", "archive"].includes(i.status)
          )
            return false;
        } else if (
          tab === "archive"
            ? i.status !== "archive"
            : tab === "latest"
              ? i.status !== "selected"
              : !["selected", "archive"].includes(i.status)
        )
          return false;
        return (
          (platform === "all" || i.platform === platform) &&
          (category === "all" || i.category === category) &&
          (!needle ||
            `${i.title} ${i.text} ${i.author} ${i.tags.join(" ")}`
              .toLowerCase()
              .includes(needle)) &&
          (days === "all" ||
            (i.publishedAt && Date.parse(i.publishedAt) >= cutoff))
        );
      })
      .toSorted((a, b) =>
        tab === "latest"
          ? Date.parse(b.publishedAt || b.firstSeenAt) -
            Date.parse(a.publishedAt || a.firstSeenAt)
          : b.score - a.score ||
            Date.parse(b.publishedAt || b.firstSeenAt) -
              Date.parse(a.publishedAt || a.firstSeenAt),
      );
  }, [data, view, tab, platform, category, q, days, saved]);
  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    visible.forEach((i) =>
      i.tags.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)),
    );
    return [...counts].toSorted((a, b) => b[1] - a[1]).slice(0, 6);
  }, [visible]);
  const card = (item: Item, index: number) => {
    const Icon = ICONS[CATEGORIES.indexOf(item.category)];
    const excerpt = readingExcerpt(item);
    return (
      <article className="signal-card" key={item.id}>
        <div className="signal-meta">
          <span className="source-by">
            <PlatformMark platform={item.platform} small />
            <b>{PLATFORM_LABELS[item.platform]}</b>
            <span>·</span>
            <span className="author">{item.author}</span>
          </span>
          <span>{time(item.publishedAt)}</span>
        </div>
        <div className="signal-body">
          <div
            className={`signal-glyph glyph-${CATEGORIES.indexOf(item.category)}`}
            aria-hidden
          >
            <Icon size={28} strokeWidth={1.4} />
            <span>{String(index + 1).padStart(2, "0")}</span>
          </div>
          <div className="signal-content">
            <div className="card-labels">
              <span className="category-chip">{item.category}</span>
              {item.status === "archive" && <span>归档</span>}
            </div>
            <h2 className="signal-heading">
              <button className="card-title" onClick={() => setDetail(item)}>
                {excerpt.title}
              </button>
            </h2>
            {excerpt.summary && <p>{excerpt.summary}</p>}
            <div className="tag-row">
              {item.tags.slice(0, 3).map((t) => (
                <button key={t} onClick={() => setQ(t)}>
                  #{t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="signal-footer">
          <div className="metrics">
            {item.metrics.views !== undefined && (
              <span title="原平台播放/浏览">
                <Play size={13} />
                {compact(item.metrics.views)}
              </span>
            )}
            {item.metrics.likes !== undefined && (
              <span title="原平台点赞">
                <Heart size={13} />
                {compact(item.metrics.likes)}
              </span>
            )}
            <span className="quality" title="资料质量评分，不是平台热度">
              {item.scoreMode === "rules" ? "规则" : "双模型"} {item.score}
            </span>
          </div>
          <div className="card-actions">
            <button
              className={`icon-button ${saved.includes(item.id) ? "is-saved" : ""}`}
              onClick={() => favorite(item.id)}
              aria-label={`${saved.includes(item.id) ? "取消收藏" : "收藏"} ${item.title}`}
              aria-pressed={saved.includes(item.id)}
            >
              <Bookmark
                size={16}
                fill={saved.includes(item.id) ? "currentColor" : "none"}
              />
            </button>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`打开原文 ${item.title}`}
            >
              <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </article>
    );
  };
  return (
    <div className="app-shell">
      <a className="skip-link" href="#radar-main">
        跳至主要内容
      </a>
      {menu && (
        <button
          className="nav-backdrop"
          aria-label="关闭导航"
          onClick={() => setMenu(false)}
        />
      )}
      <aside
        id="radar-navigation"
        ref={navigationRef}
        inert={modalOpen}
        className={`sidebar ${menu ? "mobile-open" : ""}`}
      >
        <button
          className="nav-close icon-button"
          aria-label="收起导航"
          onClick={() => setMenu(false)}
        >
          <CloseIcon size={20} />
        </button>
        <a className="brand" href="/">
          <span className="brand-logo">
            <Radio size={24} />
          </span>
          <span>
            YASUPO<span className="brand-sub">AI 创作雷达</span>
          </span>
          <span className="beta">BETA</span>
        </a>
        <div className="workspace-label">YOUR CREATIVE INTELLIGENCE</div>
        <nav className="main-nav" aria-label="主要导航">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => navigate(n.id)}
              className={view === n.id ? "active" : ""}
              aria-current={view === n.id ? "page" : undefined}
            >
              <n.icon size={18} />
              <span>{n.label}</span>
              {n.id === "saved" && saved.length > 0 && (
                <small>{saved.length}</small>
              )}
              {view === n.id && <i />}
            </button>
          ))}
        </nav>
        <div className="nav-caption">
          创作领域<span>06</span>
        </div>
        <nav className="domain-nav" aria-label="创作分类">
          {CATEGORIES.map((c, i) => {
            const Icon = ICONS[i];
            return (
              <button
                key={c}
                className={category === c ? "chosen" : ""}
                onClick={() => {
                  setCategory(c);
                  navigate("discover");
                }}
              >
                <Icon size={16} />
                <span>{c}</span>
                <small>
                  {visible.filter((x) => x.category === c).length || "—"}
                </small>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <i />
          <div>
            <b>让创作跟上变化</b>
            <p>少一点噪音，多一条有用线索。</p>
          </div>
        </div>
        <div className="sidebar-bottom">
          <button
            className={view === "desk" ? "active" : ""}
            onClick={() => navigate("desk")}
          >
            <Settings2 size={17} />
            采集工作台
            <ChevronRight size={15} />
          </button>
          <button
            onClick={() => {
              setMenu(false);
              setAbout(true);
            }}
          >
            <CircleHelp size={17} />
            关于雷达
          </button>
          <div className="owner">
            <div className="avatar">Y</div>
            <span>
              Yasupo<small>AI CREATIVE HUB</small>
            </span>
            <i />
          </div>
        </div>
      </aside>
      <div className="app-main" inert={modalOpen || menu}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              ref={menuTriggerRef}
              aria-label="展开导航"
              aria-expanded={menu}
              aria-controls="radar-navigation"
              onClick={() => setMenu(!menu)}
            >
              <Menu size={20} />
            </button>
            <Globe2 size={15} />
            <span>创作情报</span>
            <ChevronRight size={13} />
            <b>{LABELS[view]}</b>
          </div>
          <div className="header-right">
            <span className="system-state">
              <i className={data.collectorRunning ? "pulsing" : ""} />
              {data.collectorRunning
                ? "采集中"
                : data.storage === "snapshot"
                  ? "数据快照"
                  : "本地资料库"}
            </span>
            <button
              className="icon-button"
              aria-label="刷新资料"
              onClick={() => {
                void refresh();
                setToast("正在刷新资料");
              }}
            >
              <RefreshCw size={16} />
            </button>
            <div className="avatar mini">Y</div>
          </div>
        </header>
        <main id="radar-main" tabIndex={-1} className="main-wrap">
          <section
            className={`page-intro ${view === "discover" ? "editorial-intro" : ""}`}
          >
            <div>
              <div className="eyebrow">
                <i />
                AI CREATIVE SIGNALS
                <span />
              </div>
              <h1>
                {view === "discover" ? (
                  <>
                    看见 AI 的变化，
                    <br />
                    找到创作的下一步
                  </>
                ) : (
                  LABELS[view]
                )}
                <span>.</span>
              </h1>
              <p>
                {view === "discover"
                  ? "作品、工具与方法，从四个平台的创作现场，收进你的灵感资料库。"
                  : view === "trends"
                    ? "把同一事件的独立讨论放在一起，看清热度从哪里来。"
                    : view === "brief"
                      ? "把今天读到的线索，整理成下一次创作的起点。"
                      : view === "saved"
                        ? "把值得反复看的线索，留在自己的创作资料夹。"
                        : "维护采集关键词、核对渠道状态，让每一条资料都有出处。"}
              </p>
            </div>
            {view === "discover" ? (
              <div
                className="edition-art"
                aria-label={`${visible.length}条公开资料，覆盖${new Set(visible.map((item) => item.platform)).size}个平台`}
              >
                <span className="edition-caption">
                  THE CREATOR’S OBSERVATORY
                </span>
                <div className="radar-drawing" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <span>Y.</span>
                  <b />
                </div>
                <div className="edition-count">
                  <strong>{String(visible.length).padStart(2, "0")}</strong>
                  <span>
                    条创作线索
                    <br />
                    <b>
                      {new Set(visible.map((item) => item.platform)).size}{" "}
                      个平台 · {CATEGORIES.length} 个领域
                    </b>
                  </span>
                </div>
              </div>
            ) : (
              <button
                className="secondary-button intro-date"
                onClick={() => navigate("brief")}
              >
                <CalendarDays size={15} />
                {new Intl.DateTimeFormat("zh-CN", {
                  timeZone: "Asia/Shanghai",
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                }).format(new Date())}
                <ChevronDown size={13} />
              </button>
            )}
          </section>
          <div className="coverage-strip">
            <span>
              <ShieldCheck size={14} />
              每条资料可追溯
            </span>
            <span>
              更新于{" "}
              {data.state.updatedAt
                ? time(data.state.updatedAt, true)
                : "尚未采集"}
            </span>
            <span className="strip-end">
              {data.model === "rules" ? "规则筛选" : "双模型评分"}
              <i />
              {visible.length} 条已收录
            </span>
          </div>
          {(view === "discover" || view === "saved") && (
            <>
              <section className="platform-grid" aria-label="平台筛选">
                <button
                  onClick={() => setPlatform("all")}
                  className={platform === "all" ? "selected" : ""}
                  aria-pressed={platform === "all"}
                >
                  <span className="all-grid">
                    <LayoutGrid size={19} />
                  </span>
                  <span>
                    <b>全部平台</b>
                    <small>ALL SIGNALS</small>
                  </span>
                  <strong>{visible.length}</strong>
                </button>
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={platform === p ? "selected" : ""}
                    aria-pressed={platform === p}
                  >
                    <PlatformMark platform={p} />
                    <span>
                      <b>{PLATFORM_LABELS[p]}</b>
                      <small>
                        {p === "douyin"
                          ? "短视频创作"
                          : p === "xiaohongshu"
                            ? "灵感与实操"
                            : p === "youtube"
                              ? "长视频与教程"
                              : "全球新鲜事"}
                      </small>
                    </span>
                    <strong>
                      {visible.filter((i) => i.platform === p).length}
                      <ArrowUpRight size={12} />
                    </strong>
                  </button>
                ))}
              </section>
              <div className="content-columns">
                <section className="feed-column">
                  <div className="feed-toolbar">
                    <div className="feed-tabs">
                      {[
                        { id: "selected", label: "精选资料" },
                        { id: "latest", label: "最新动态" },
                        { id: "archive", label: "资料归档" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTab(t.id)}
                          className={tab === t.id ? "active" : ""}
                          aria-pressed={tab === t.id}
                        >
                          {t.id === "selected" && <Sparkles size={14} />}{" "}
                          {t.label}
                          {t.id === "selected" && <span>CURATED</span>}
                        </button>
                      ))}
                    </div>
                    <span
                      className="result-count"
                      role="status"
                      aria-live="polite"
                    >
                      {filtered.length} 条结果
                    </span>
                  </div>
                  <div className="search-controls">
                    <label className="search-box">
                      <Search size={17} />
                      <input
                        ref={searchRef}
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="搜索工具、作品、创作者或关键词…"
                        aria-label="搜索资料"
                      />
                      {q ? (
                        <button onClick={() => setQ("")} aria-label="清除搜索">
                          <CloseIcon size={15} />
                        </button>
                      ) : (
                        <kbd>Ctrl / ⌘ K</kbd>
                      )}
                    </label>
                    <label className="time-select">
                      <ListFilter size={15} />
                      <select
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        aria-label="时间范围"
                      >
                        <option value="all">全部时间</option>
                        <option value="1">近 24 小时</option>
                        <option value="7">近 7 天</option>
                        <option value="30">近 30 天</option>
                      </select>
                    </label>
                  </div>
                  <div className="filter-chips">
                    <button
                      className={category === "all" ? "active" : ""}
                      aria-pressed={category === "all"}
                      onClick={() => setCategory("all")}
                    >
                      全部领域
                    </button>
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        className={category === c ? "active" : ""}
                        aria-pressed={category === c}
                        onClick={() => setCategory(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  {hasFilters && (
                    <div className="active-filters">
                      <span>
                        正在筛选
                        {platform !== "all"
                          ? ` · ${PLATFORM_LABELS[platform]}`
                          : ""}
                        {category !== "all" ? ` · ${category}` : ""}
                        {q.trim() ? ` · “${q.trim()}”` : ""}
                        {days !== "all" ? ` · 近 ${days} 天` : ""}
                      </span>
                      <button onClick={resetFilters}>
                        清除筛选 <CloseIcon size={13} />
                      </button>
                    </div>
                  )}
                  <div className="feed-list">
                    {filtered.length ? (
                      filtered.map(card)
                    ) : (
                      <div className="empty-state">
                        <div>
                          <Search size={27} />
                        </div>
                        <h3>
                          {view === "saved" && !hasFilters
                            ? "这里等着你的第一条灵感"
                            : "暂时没有符合条件的资料"}
                        </h3>
                        <p>
                          {view === "saved" && !hasFilters
                            ? "点击卡片书签，即可保存在当前浏览器。"
                            : hasFilters
                              ? "试试其他关键词、平台或时间范围。"
                              : tab === "selected"
                                ? "首次导入的资料先归档；未知日期的内容在工作台等待核验。"
                                : "试试其他关键词、平台或时间范围。"}
                        </p>
                        <button
                          className="secondary-button"
                          onClick={() => {
                            if (hasFilters) resetFilters();
                            else if (view === "saved") navigate("discover");
                            else {
                              setQ("");
                              setPlatform("all");
                              setCategory("all");
                              setDays("all");
                              setTab("archive");
                            }
                          }}
                        >
                          {hasFilters
                            ? "清除筛选"
                            : view === "saved"
                              ? "去发现灵感"
                              : "查看资料归档"}
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="feed-end">
                    <span />
                    保持好奇，下一条线索正在路上
                    <span />
                  </div>
                </section>
                <aside className="right-rail">
                  <section className="brief-teaser">
                    <div className="rail-eyebrow">
                      <FileText size={14} />
                      THE DAILY BRIEF
                      <span>NO. {today().slice(5).replace("-", "")}</span>
                    </div>
                    <h2>
                      今天，AI 创作
                      <br />
                      有哪些新动向<span>？</span>
                    </h2>
                    <p>
                      {data.brief.total
                        ? `已整理 ${data.brief.total} 条当日线索，来自 ${data.brief.platforms} 个平台。`
                        : "当日新内容到达后，在这里汇成一份有来源的创作摘要。"}
                    </p>
                    <div className="brief-lines" aria-hidden>
                      <i />
                      <i />
                      <i />
                      <span>
                        <Sparkles size={18} />
                      </span>
                    </div>
                    <button onClick={() => navigate("brief")}>
                      阅读创作日报
                      <ArrowUpRight size={17} />
                    </button>
                  </section>
                  <section className="rail-section">
                    <div className="rail-title">
                      <h3>
                        <TrendingUp size={16} />
                        话题索引
                      </h3>
                      <span>已收录资料</span>
                    </div>
                    {topics.length ? (
                      <div className="topic-list">
                        {topics.map(([name, count], i) => (
                          <button
                            key={name}
                            onClick={() => {
                              setQ(name);
                              setTab("archive");
                            }}
                          >
                            <span className={i < 3 ? "topic-top" : ""}>
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <b>{name}</b>
                            <small>{count} 条</small>
                            <ArrowUpRight size={13} />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="rail-muted">实际资料入库后生成话题索引。</p>
                    )}
                  </section>
                  <section className="rail-section">
                    <div className="rail-title">
                      <h3>
                        <Radio size={16} />
                        采集覆盖
                      </h3>
                      <button
                        className="icon-button"
                        aria-label="打开采集工作台"
                        onClick={() => navigate("desk")}
                      >
                        <ArrowUpRight size={15} />
                      </button>
                    </div>
                    <div className="coverage-list">
                      {data.state.sources.map((s) => (
                        <div key={s.platform}>
                          <PlatformMark platform={s.platform} small />
                          <span>{s.name}</span>
                          <small className={`status-${s.state}`}>
                            <i />
                            {STATUS[s.state]}
                          </small>
                        </div>
                      ))}
                    </div>
                    <p className="rail-muted">
                      关键词抽样 · 非平台全量
                      <br />
                      未读取的数据不作推断
                    </p>
                  </section>
                  <a className="source-export" href="/api/export">
                    <Database size={16} />
                    <span>
                      带来源的资料库<small>导出 JSON，继续你的研究</small>
                    </span>
                    <ArrowDownToLine size={16} />
                  </a>
                </aside>
              </div>
            </>
          )}
          {view === "trends" && (
            <div className="trends-layout">
              <section>
                <div className="section-title">
                  <h2>
                    <Flame size={20} />
                    48 小时事件热榜
                  </h2>
                  <span>24 小时半衰期</span>
                </div>
                {data.stories.length ? (
                  data.stories.map((s, index) => (
                    <article className="story-card" key={s.id}>
                      <span className="story-rank">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <span className="category-chip">{s.category}</span>
                        <h3>{s.title}</h3>
                        <p>
                          {s.sourceCount} 个独立发布方 · {s.platformCount}{" "}
                          个平台 · {s.items.length} 条讨论
                        </p>
                        <div className="story-sources">
                          {s.items.map((i) => (
                            <button onClick={() => setDetail(i)} key={i.id}>
                              <PlatformMark platform={i.platform} small />
                              {i.author}
                              <ArrowUpRight size={12} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="story-heat">
                        <strong>{s.heat.toFixed(1)}</strong>
                        <small>样本热度</small>
                        <span>
                          {s.change !== null
                            ? `${s.change > 0 ? "+" : ""}${s.change}% / 6h`
                            : "趋势样本不足"}
                        </span>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-state large">
                    <div>
                      <Flame size={30} />
                    </div>
                    <h3>等到独立讨论汇聚，再判断热点</h3>
                    <p>
                      事件需要最近 48 小时内至少两个独立发布方的证据。
                      <br />
                      首次回灌、未知日期和单一来源不会进入热榜。
                    </p>
                  </div>
                )}
              </section>
              <aside className="method-card">
                <span className="eyebrow">BEHIND THE SIGNAL</span>
                <h3>热度，有据可循。</h3>
                <p>同一事件，每个独立发布方只计一次；证据越新，权重越高。</p>
                <div className="heat-formula">
                  H = Σ 0.5<sup>经过小时 / 24</sup>
                </div>
                <ul>
                  <li>
                    <Check size={14} />
                    最近 48 小时窗口
                  </li>
                  <li>
                    <Check size={14} />
                    同一运营矩阵应合并为一方
                  </li>
                  <li>
                    <Check size={14} />
                    点赞播放保留在原资料上
                  </li>
                  <li>
                    <Check size={14} />
                    无可比快照时不显示增长率
                  </li>
                </ul>
                <p className="rail-muted">
                  首版仅将相同标题或人工指定同一事件的资料归组，避免把宽泛 AI
                  话题误并。
                </p>
              </aside>
            </div>
          )}
          {view === "brief" && (
            <section className="daily-page">
              <div className="daily-top">
                <span className="eyebrow">A LITTLE CLARITY, EVERY DAY</span>
                <label>
                  <CalendarDays size={16} />
                  <input
                    type="date"
                    value={day}
                    max={today()}
                    onChange={async (e) => {
                      setDay(e.target.value);
                      const r = await fetch(`/api/feed?date=${e.target.value}`);
                      if (r.ok) setData(await r.json());
                    }}
                    aria-label="日报日期"
                  />
                </label>
              </div>
              <div className="daily-heading">
                <div>
                  <h2>AI 创作日报</h2>
                  <p>
                    {day.replaceAll("-", " / ")}
                    <span>YASUPO EDITORIAL</span>
                  </p>
                </div>
                <a
                  className="secondary-button"
                  href={`/api/export?format=brief&date=${day}`}
                >
                  <ArrowDownToLine size={15} />
                  导出 Markdown
                </a>
              </div>
              <div className="daily-stats">
                <div>
                  <strong>{data.brief.total}</strong>
                  <span>当日新线索</span>
                </div>
                <div>
                  <strong>{data.brief.selected}</strong>
                  <span>高信息量资料</span>
                </div>
                <div>
                  <strong>
                    {data.brief.platforms}
                    <small> / 4</small>
                  </strong>
                  <span>覆盖平台</span>
                </div>
              </div>
              <p className="daily-note">
                <ShieldCheck size={15} />
                仅基于可信发布日期的当日样本；历史回灌不计入，不代表全网热榜。
              </p>
              {data.brief.entries.length ? (
                <div className="daily-entries">
                  {data.brief.entries.map((i, index) => (
                    <article key={i.id}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <span className="category-chip">{i.category}</span>
                        <h3>
                          <button onClick={() => setDetail(i)}>
                            {i.title}
                          </button>
                        </h3>
                        <p>{i.summary}</p>
                        <a href={i.url} target="_blank" rel="noreferrer">
                          {PLATFORM_LABELS[i.platform]} · {i.author}
                          <ArrowUpRight size={13} />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div>
                    <FileText size={28} />
                  </div>
                  <h3>这一天还没有可生成日报的新资料</h3>
                  <p>
                    首次导入的存量资料在“发现灵感 → 资料归档”中查看。
                    <br />
                    持续采集后，新的当日内容会进入这里。
                  </p>
                </div>
              )}
            </section>
          )}
          {view === "desk" && (
            <div className="desk-page">
              <section className="desk-summary">
                <div>
                  <div className="eyebrow">COLLECTION WORKSPACE</div>
                  <h2>从来源，到有用的线索。</h2>
                  <p>{data.coverage}</p>
                </div>
                <button
                  className="primary-button"
                  disabled={busy || data.collectorRunning || !data.writable}
                  onClick={async () => {
                    const r = await action("/api/collect");
                    if (r) {
                      setData((d) => ({ ...d, collectorRunning: true }));
                      setToast("已启动采集，每个平台检索一个轮换关键词");
                    }
                  }}
                >
                  {data.collectorRunning ? (
                    <LoaderCircle size={16} className="spin" />
                  ) : (
                    <RefreshCw size={16} />
                  )}{" "}
                  {data.collectorRunning ? "采集中…" : "立即采集一轮"}
                </button>
              </section>
              <div className="pipeline-row">
                {[
                  { name: "采集资料", n: data.state.items.length },
                  { name: "可信日期", n: visible.length },
                  {
                    name: "规则精选",
                    n: visible.filter((i) => i.score >= 65).length,
                  },
                  { name: "事件热点", n: data.stories.length },
                  { name: "今日线索", n: data.brief.total },
                ].map((s, i) => (
                  <div key={s.name}>
                    <span>0{i + 1}</span>
                    <strong>{s.n}</strong>
                    <p>{s.name}</p>
                    {i < 4 && <ChevronRight size={15} />}
                  </div>
                ))}
              </div>
              <div className="storage-banner">
                <Database size={20} />
                <div>
                  <b>
                    {data.storage === "snapshot"
                      ? "只读数据快照"
                      : data.storage === "remote"
                        ? "远程持久数据库"
                        : "本机 SQLite 资料库"}
                  </b>
                  <p>
                    {data.storage === "snapshot"
                      ? "本机采集并导出后随网站发布。连接远程 libSQL 数据库可持续同步；当前不接受云端写入。"
                      : "资料和多次观察均持久保存。浏览器登录会话只留在本机，不随资料上传。"}
                  </p>
                </div>
                <span>
                  {data.model === "rules"
                    ? "模型未启用 · 规则筛选"
                    : "双模型已配置"}
                </span>
              </div>
              <div className="section-title">
                <h2>平台与关键词</h2>
                <span>每轮每平台一个关键词 · 最多 5 条</span>
              </div>
              <div className="source-grid">
                {data.state.sources.map((s) => (
                  <article key={s.platform}>
                    <div className="source-card-title">
                      <PlatformMark platform={s.platform} />
                      <div>
                        <h3>{s.name}</h3>
                        <span className={`status-label status-${s.state}`}>
                          <i />
                          {s.enabled ? STATUS[s.state] : "已停用"}
                        </span>
                      </div>
                      <button
                        aria-label={`编辑${s.name}关键词`}
                        className="icon-button"
                        disabled={!data.writable}
                        onClick={() => {
                          setEdit(s);
                          setQueryText(s.queries.join("\n"));
                        }}
                      >
                        <Settings2 size={17} />
                      </button>
                    </div>
                    <div className="source-queries">
                      {s.queries.slice(0, 4).map((q) => (
                        <span key={q}>{q}</span>
                      ))}
                      {s.queries.length > 4 && (
                        <span>+{s.queries.length - 4}</span>
                      )}
                    </div>
                    <p>{s.message}</p>
                    <footer>
                      <span>
                        最近成功{" "}
                        {s.lastSuccessAt ? time(s.lastSuccessAt, true) : "—"}
                      </span>
                      <button
                        disabled={!data.writable || busy}
                        onClick={async () => {
                          const r = await action("/api/sources", {
                            ...s,
                            enabled: !s.enabled,
                          });
                          if (r)
                            setToast(
                              s.enabled ? "已暂停该平台" : "已启用该平台",
                            );
                        }}
                      >
                        {s.enabled ? "暂停" : "启用"}
                      </button>
                    </footer>
                  </article>
                ))}
              </div>
              <div className="desk-columns">
                <section className="import-panel">
                  <div className="section-title">
                    <h2>
                      <Plus size={17} />
                      补充资料
                    </h2>
                    <a href="/api/export">
                      导出现有资料
                      <ArrowUpRight size={13} />
                    </a>
                  </div>
                  <p>
                    粘贴 JSON 数组。必填 platform、url、title；日期使用带时区
                    ISO 格式。未知字段留空。
                  </p>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder='[{"platform":"x", "url":"原帖 HTTPS 链接", "title":"实际标题", "publishedAt":null, "dateConfidence":"unknown"}]'
                    aria-label="导入资料 JSON"
                    spellCheck={false}
                  />
                  <div className="import-actions">
                    <label>
                      <input
                        type="checkbox"
                        checked={backfill}
                        onChange={(e) => setBackfill(e.target.checked)}
                      />
                      历史回灌，不进入今日
                    </label>
                    <button
                      className="primary-button"
                      disabled={!importText.trim() || busy || !data.writable}
                      onClick={async () => {
                        try {
                          const r = await action("/api/ingest", {
                            items: JSON.parse(importText),
                            backfill,
                          });
                          if (r) {
                            setToast(
                              `已入库：${r.created} 条新增，${r.updated} 条更新`,
                            );
                            setImportText("");
                          }
                        } catch {
                          setToast("JSON 格式无效，请检查后重试");
                        }
                      }}
                    >
                      导入资料
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </section>
                <section className="access-panel">
                  <h3>
                    <ShieldCheck size={18} />
                    管理与同步
                  </h3>
                  <p>
                    本机同源操作自动授权。云端需要管理令牌，令牌只保存在当前页面内存中。
                  </p>
                  <label>
                    管理令牌
                    <input
                      type="password"
                      autoComplete="off"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="可选，仅管理者使用"
                    />
                  </label>
                  <button
                    className="secondary-button"
                    onClick={async () => {
                      await refresh();
                      setToast("已刷新管理状态");
                    }}
                  >
                    验证并刷新
                    <ArrowRight size={14} />
                  </button>
                  <p className="rail-muted">
                    模型仅在服务端显式启用后调用。未启用时，所有评分均标记为规则评分。
                  </p>
                </section>
              </div>
              {pending.length > 0 && (
                <section className="pending-panel">
                  <div className="section-title">
                    <h2>
                      <Clock3 size={17} />
                      待核验日期 <span>{pending.length}</span>
                    </h2>
                    <span>不进入公开动态、热点和日报</span>
                  </div>
                  {pending.slice(0, 20).map((i) => (
                    <button key={i.id} onClick={() => setDetail(i)}>
                      <PlatformMark platform={i.platform} small />
                      <span>{i.title}</span>
                      <small>
                        {i.dateConfidence === "estimated"
                          ? "日期为推估"
                          : "未读取日期"}
                      </small>
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
                </section>
              )}
              <section className="run-panel">
                <div className="section-title">
                  <h2>最近运行</h2>
                  <span>真实结果与错误，逐次保留</span>
                </div>
                {data.state.runs.length ? (
                  <div className="run-table">
                    <div className="run-table-head">
                      <span>时间 / 平台</span>
                      <span>查询词</span>
                      <span>结果</span>
                      <span>状态</span>
                    </div>
                    {data.state.runs.slice(0, 12).map((r) => (
                      <div className="run-table-row" key={r.id}>
                        <span>
                          {time(r.completedAt, true)}
                          <small>
                            {r.platform === "import"
                              ? "手动导入"
                              : PLATFORM_LABELS[r.platform]}
                          </small>
                        </span>
                        <span>{r.query || "—"}</span>
                        <span>
                          {r.status === "error"
                            ? r.message
                            : `${r.created} 新增 · ${r.updated} 更新`}
                          <small>{r.status !== "error" && r.message}</small>
                        </span>
                        <span className={`run-state ${r.status}`}>
                          {r.status === "ok"
                            ? "完成"
                            : r.status === "partial"
                              ? "部分完成"
                              : "受限"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rail-muted">
                    还没有运行记录。启动采集，或导入带来源的资料。
                  </p>
                )}
              </section>
            </div>
          )}
          <footer className="site-footer">
            <span>
              <Radio size={13} />
              YASUPO <b>AI 创作雷达</b>
            </span>
            <span>
              保持来源，保持好奇。
              <i />
              {data.storage === "snapshot" ? "SNAPSHOT" : "LOCAL FIRST"} /{" "}
              {new Date().getFullYear()}
            </span>
          </footer>
        </main>
      </div>
      {detail && (
        <div className="modal-backdrop" onClick={() => setDetail(null)}>
          <section
            className="detail-modal"
            role="dialog"
            aria-modal="true"
            aria-label="资料详情"
            tabIndex={-1}
            ref={dialogRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <span>
                <PlatformMark platform={detail.platform} small />
                {PLATFORM_LABELS[detail.platform]} · 来源核对
              </span>
              <button
                className="icon-button"
                aria-label="关闭详情"
                onClick={() => setDetail(null)}
              >
                <CloseIcon size={20} />
              </button>
            </div>
            <div className="detail-content">
              <span className="category-chip">{detail.category}</span>
              <h2>{detail.title}</h2>
              <div className="detail-author">
                {detail.author}
                <span>
                  发布于{" "}
                  {detail.datePrecision === "day"
                    ? time(detail.publishedAt, true).split(" ")[0] +
                      "（按日期记录）"
                    : (detail.datePrecision === "minute" ? "约 " : "") +
                      time(detail.publishedAt, true)}
                </span>
              </div>
              <p className="detail-summary">{detail.summary}</p>
              <div className="detail-facts">
                <div>
                  <span>内容读取</span>
                  <b>
                    {
                      {
                        search: "搜索结果文字",
                        detail: "详情页文字 / 视频简介",
                        subtitle: "已取得字幕",
                        user_import: "手动导入",
                      }[detail.access]
                    }
                  </b>
                </div>
                <div>
                  <span>首次发现</span>
                  <b>{time(detail.firstSeenAt, true)}</b>
                </div>
                <div>
                  <span>最近采集</span>
                  <b>{time(detail.lastSeenAt, true)}</b>
                </div>
                <div>
                  <span>筛选评分</span>
                  <b>
                    {detail.score} / 100 ·{" "}
                    {detail.scoreMode === "rules" ? "规则筛选" : "双模型平均"}
                  </b>
                </div>
              </div>
              <h3>可见文字摘录</h3>
              <blockquote>{detail.evidence || "未读取额外摘录"}</blockquote>
              <p className="detail-caution">
                文字介绍不代表已观看视频或理解笔记图片。完整内容请前往原平台查看。
              </p>
              {detail.scoreDetail && <p>{detail.scoreDetail.reason}</p>}
              <h3>平台互动记录</h3>
              <div className="observation-table">
                {detail.observations
                  .slice(-8)
                  .toReversed()
                  .map((o, index) => (
                    <div key={`${o.at}-${index}`}>
                      <span>{time(o.at, true)}</span>
                      <span>
                        {Object.entries(o.metrics)
                          .map(
                            ([k, v]) =>
                              `${({ likes: "点赞", views: "播放/浏览", comments: "评论", favorites: "收藏", shares: "分享" } as Record<string, string>)[k]} ${compact(v)}`,
                          )
                          .join(" · ") || "互动指标未读取"}
                      </span>
                    </div>
                  ))}
              </div>
              <div className="detail-buttons">
                <button
                  className="secondary-button"
                  onClick={() => favorite(detail.id)}
                >
                  <Bookmark size={15} />
                  {saved.includes(detail.id) ? "已收藏" : "收藏线索"}
                </button>
                <a
                  href={detail.url}
                  className="primary-button"
                  target="_blank"
                  rel="noreferrer"
                >
                  前往原文
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>
          </section>
        </div>
      )}
      {about && (
        <div className="modal-backdrop" onClick={() => setAbout(false)}>
          <section
            className="about-modal"
            role="dialog"
            aria-modal="true"
            aria-label="关于雷达"
            ref={dialogRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="关闭"
              onClick={() => setAbout(false)}
            >
              <CloseIcon size={20} />
            </button>
            <span className="brand-logo">
              <Radio size={25} />
            </span>
            <h2>创作，需要有用的情报。</h2>
            <p>
              Yasupo AI 创作雷达关注四个平台的 AI
              短剧、视频、代码动画与工具实践。
            </p>
            <p>
              工作流参考
              AIHOT：采集、判重、筛选、评分、事件聚合和日报。首版用相同标题或人工事件键保守归组；未启用模型时使用规则评分。
            </p>
            <p>
              有出处的关键词抽样，不代表全平台热搜。收藏保存在当前浏览器，不下载或转载完整媒体。
            </p>
            <div className="about-links">
              <a
                href="https://github.com/KKKKhazix/AIHOT"
                target="_blank"
                rel="noreferrer"
              >
                AIHOT 工作流参考
                <ArrowUpRight size={14} />
              </a>
              <a href="/api/export">
                导出来源
                <ArrowDownToLine size={14} />
              </a>
            </div>
          </section>
        </div>
      )}
      {edit && (
        <div className="modal-backdrop" onClick={() => setEdit(null)}>
          <section
            className="about-modal edit-modal"
            role="dialog"
            aria-modal="true"
            aria-label="编辑平台关键词"
            ref={dialogRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="关闭"
              onClick={() => setEdit(null)}
            >
              <CloseIcon size={20} />
            </button>
            <h2>{edit.name} · 关注关键词</h2>
            <p>每行一个，最多 20 个。每轮只搜索一个，依次轮换。</p>
            <textarea
              aria-label="关注关键词"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
            />
            <button
              className="primary-button"
              disabled={busy}
              onClick={async () => {
                const r = await action("/api/sources", {
                  ...edit,
                  queries: queryText
                    .split("\n")
                    .map((q) => q.trim())
                    .filter(Boolean),
                });
                if (r) {
                  setEdit(null);
                  setToast("关键词已保存");
                }
              }}
            >
              保存关键词
              <Check size={15} />
            </button>
            {["needs_login", "blocked", "rate_limited"].includes(
              edit.state,
            ) && (
              <div className="resume-box">
                <p>处理官方页面登录/验证，或等限流解除后，再手动恢复。</p>
                <button
                  className="secondary-button"
                  disabled={busy}
                  onClick={async () => {
                    const r = await action("/api/sources", {
                      ...edit,
                      resume: true,
                    });
                    if (r) {
                      setEdit(null);
                      setToast("已恢复该渠道");
                    }
                  }}
                >
                  我已处理，恢复采集
                </button>
              </div>
            )}
          </section>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
          <button onClick={() => setToast("")} aria-label="关闭提示">
            <CloseIcon size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
