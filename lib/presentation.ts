import type { Item } from "./types";

// Reading excerpts only. Original titles and evidence remain intact in details/exports.
const clean = (text: string) =>
  text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/#[^\s#]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
const clip = (text: string, length: number) => {
  const chars = Array.from(text);
  return chars.length > length
    ? chars.slice(0, length).join("").trimEnd() + "…"
    : text;
};
export function readingExcerpt(item: Pick<Item, "title" | "summary">) {
  const original = clean(item.title) || item.title.trim();
  const lines = item.title.split(/\n/).map(clean).filter(Boolean);
  const firstLine =
    /[，,:：]$/.test(lines[0] || "") && lines[1]
      ? `${lines[0]} ${lines[1]}`
      : lines[0] || "";
  const title = clip(firstLine || original, 92);
  let summary = clean(item.summary);
  if (summary.startsWith(original))
    summary = summary.slice(original.length).trim();
  else if (summary.startsWith(firstLine))
    summary = summary.slice(firstLine.length).trim();
  // Many platforms use the entire post as its title. Avoid repeating it below.
  if (original.startsWith(summary) || title.startsWith(summary)) summary = "";
  summary = summary.replace(/^[\s.。,，:：;；!！?？…–—-]+/, "");
  return { title, summary: clip(summary, 160) };
}
