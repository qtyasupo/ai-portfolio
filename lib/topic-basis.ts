import type { Platform, WatchTopic } from "./types";
export function validateTopicBasis(
  b: WatchTopic["basis"],
  platforms: Platform[],
): WatchTopic["basis"] {
  if (b === undefined) return undefined;
  if (
    !b ||
    typeof b.summary !== "string" ||
    b.summary.length > 300 ||
    typeof b.observedAt !== "string" ||
    !Number.isFinite(Date.parse(b.observedAt)) ||
    !Array.isArray(b.samples) ||
    !b.samples.length ||
    b.samples.length > 6
  )
    throw new Error("话题依据格式无效");
  const samples = b.samples.map((sample) => {
    if (
      !sample ||
      !platforms.includes(sample.platform) ||
      typeof sample.title !== "string" ||
      sample.title.length > 240 ||
      typeof sample.url !== "string" ||
      typeof sample.dateVerified !== "boolean"
    )
      throw new Error("话题样本格式无效");
    const url = new URL(sample.url);
    const domains = {
      douyin: "www.douyin.com",
      xiaohongshu: "www.xiaohongshu.com",
      x: "x.com",
      youtube: "www.youtube.com",
    };
    if (
      url.protocol !== "https:" ||
      url.hostname !== domains[sample.platform] ||
      url.username ||
      url.password ||
      url.port ||
      sample.url.length > 300
    )
      throw new Error("话题样本链接与平台不匹配");
    if (
      sample.likes !== undefined &&
      (!Number.isFinite(sample.likes) || sample.likes < 0)
    )
      throw new Error("话题互动值无效");
    let accessUrl: string | undefined;
    if (sample.accessUrl !== undefined) {
      const observed = new URL(sample.accessUrl);
      if (
        observed.protocol !== "https:" ||
        observed.hostname !== url.hostname ||
        observed.username ||
        observed.password ||
        observed.port ||
        sample.accessUrl.length > 2500 ||
        observed.pathname.split("/").filter(Boolean).at(-1) !==
          url.pathname.split("/").filter(Boolean).at(-1)
      )
        throw new Error("观察到的来源链接与内容不匹配");
      accessUrl = observed.href;
    }
    if (
      sample.publishedAt !== undefined &&
      (typeof sample.publishedAt !== "string" ||
        !Number.isFinite(Date.parse(sample.publishedAt)))
    )
      throw new Error("话题样本日期无效");
    if (sample.dateVerified && !sample.publishedAt)
      throw new Error("日期未核验的样本不能标记为已核验");
    return {
      platform: sample.platform,
      url: url.href,
      ...(accessUrl ? { accessUrl } : {}),
      title: sample.title,
      likes: sample.likes,
      publishedAt: sample.dateVerified ? sample.publishedAt : undefined,
      dateVerified: sample.dateVerified,
      dateEvidence:
        typeof sample.dateEvidence === "string"
          ? sample.dateEvidence.slice(0, 100)
          : undefined,
    };
  });
  return {
    observedAt: new Date(b.observedAt).toISOString(),
    summary: b.summary,
    samples,
  };
}
