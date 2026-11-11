import { useState, type FormEvent } from "react";
import { ArrowUpRight, Bookmark, ChevronDown, Plus } from "lucide-react";

export type GitHubBookmark = { title: string; url: string; text?: string };
export const GITHUB_BOOKMARKS_KEY = "yasupo-github-bookmarks";
const MAX_BOOKMARK_TEXT = 30_000;

export function normalizeGitHubBookmark(
  title: unknown,
  link: unknown,
  text?: unknown,
): GitHubBookmark | null {
  if (typeof title !== "string" || typeof link !== "string") return null;
  const label = title.trim();
  if (label.length > 160 || link.length > 2048) return null;
  try {
    const url = new URL(link.trim());
    if (
      url.origin !== "https://github.com" ||
      url.username ||
      url.password ||
      !/^\/[a-z\d-]+\/[a-z\d_.-]+(?:\/.*)?$/i.test(url.pathname)
    )
      return null;
    const path = url.pathname.replace(/\/+$/, "");
    const savedText =
      typeof text === "string" ? text.trim().slice(0, MAX_BOOKMARK_TEXT) : "";
    return {
      title: label || path.slice(1).split("/").slice(0, 2).join("/"),
      url: url.origin + path,
      ...(savedText && { text: savedText }),
    };
  } catch {
    return null;
  }
}

export function GitHubBookmarkForm({
  onSave,
}: {
  onSave: (bookmark: GitHubBookmark, hasTitle: boolean) => void;
}) {
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const title = String(fields.get("title") ?? "").trim();
    const bookmark = normalizeGitHubBookmark(
      title,
      fields.get("url"),
      fields.get("text"),
    );
    if (!bookmark) {
      setError("请输入有效的 GitHub 仓库或文章链接。");
      return;
    }
    onSave(bookmark, Boolean(title));
    form.reset();
    setError("");
  };
  return (
    <form
      className="github-bookmark-form"
      onSubmit={submit}
      aria-label="添加 GitHub 收藏"
    >
      <label>
        GitHub 链接
        <input
          name="url"
          type="url"
          maxLength={2048}
          placeholder="https://github.com/…"
          required
          aria-describedby={error ? "github-bookmark-error" : undefined}
        />
      </label>
      <label className="github-bookmark-title-input">
        标题（可选）
        <input name="title" maxLength={160} placeholder="仓库或文章标题" />
      </label>
      <label className="github-bookmark-text-input">
        正文或笔记（可选）
        <textarea
          name="text"
          rows={4}
          maxLength={MAX_BOOKMARK_TEXT}
          placeholder="粘贴要在站内阅读的文字"
        />
      </label>
      <button type="submit" className="secondary-button">
        <Plus size={16} /> 加入收藏
      </button>
      {error && (
        <p id="github-bookmark-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export function GitHubBookmarkCard({
  bookmark,
  onRemove,
}: {
  bookmark: GitHubBookmark;
  onRemove: () => void;
}) {
  const repository = new URL(bookmark.url).pathname
    .split("/")
    .slice(1, 3)
    .join("/");
  return (
    <article className="signal-card github-bookmark">
      <div className="signal-meta">
        <span className="source-by">
          <b>GitHub</b>
          <span>·</span>
          <span className="author">{repository}</span>
        </span>
      </div>
      <details className="github-bookmark-reader">
        <summary className="card-title">
          {bookmark.title} <ChevronDown size={16} aria-hidden="true" />
        </summary>
        <div className="github-bookmark-reading">
          {bookmark.text ? (
            <div className="github-bookmark-text">{bookmark.text}</div>
          ) : (
            <p>
              这条收藏还没有站内文字。可以在 GitHub 栏用同一链接补充正文或笔记。
            </p>
          )}
          <a href={bookmark.url} target="_blank" rel="noreferrer">
            GitHub 原文 <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </details>
      <div className="signal-footer">
        <div className="card-actions">
          <button
            type="button"
            className="icon-button is-saved"
            onClick={onRemove}
            aria-label={`取消收藏 ${bookmark.title}`}
          >
            <Bookmark size={16} fill="currentColor" />
            <span>已收藏</span>
          </button>
        </div>
      </div>
    </article>
  );
}
