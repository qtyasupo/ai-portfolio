import { useState, type FormEvent } from "react";
import { ArrowUpRight, Bookmark, Plus } from "lucide-react";

export type GitHubBookmark = { title: string; url: string };
export const GITHUB_BOOKMARKS_KEY = "yasupo-github-bookmarks";

export function normalizeGitHubBookmark(
  title: unknown,
  link: unknown,
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
    return {
      title: label || path.slice(1).split("/").slice(0, 2).join("/"),
      url: url.origin + path,
    };
  } catch {
    return null;
  }
}

export function GitHubBookmarkForm({
  onSave,
}: {
  onSave: (bookmark: GitHubBookmark) => void;
}) {
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const bookmark = normalizeGitHubBookmark(
      fields.get("title"),
      fields.get("url"),
    );
    if (!bookmark) {
      setError("请输入有效的 GitHub 仓库或文章链接。");
      return;
    }
    onSave(bookmark);
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
      <label>
        标题（可选）
        <input name="title" maxLength={160} placeholder="仓库或文章标题" />
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
      <h2 className="signal-heading">
        <a
          className="card-title"
          href={bookmark.url}
          target="_blank"
          rel="noreferrer"
        >
          {bookmark.title} <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </h2>
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
