import { timingSafeEqual } from "node:crypto";
export function writeAccess(req: Request): boolean {
  const configured = process.env.RADAR_ADMIN_TOKEN;
  if (configured && configured.length >= 24) {
    const got = req.headers.get("authorization")?.replace(/^Bearer /, "") || "";
    const a = Buffer.from(got),
      b = Buffer.from(configured);
    return a.length === b.length && timingSafeEqual(a, b);
  }
  if (process.env.VERCEL) return false;
  const url = new URL(req.url);
  const host = url.hostname;
  if (!["127.0.0.1", "localhost", "[::1]"].includes(host)) return false;
  const incomingHost = req.headers.get("host") || url.host;
  let incoming: URL;
  try {
    incoming = new URL(`${url.protocol}//${incomingHost}`);
  } catch {
    return false;
  }
  if (!["127.0.0.1", "localhost", "[::1]"].includes(incoming.hostname))
    return false;
  const origin = req.headers.get("origin");
  return !origin || origin === incoming.origin;
}
export async function limitedJson(
  req: Request,
  max = 1_000_000,
): Promise<unknown> {
  if (Number(req.headers.get("content-length") || 0) > max)
    throw new Error("请求过大");
  const reader = req.body?.getReader();
  if (!reader) throw new Error("缺少 JSON 内容");
  let size = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) {
      await reader.cancel();
      throw new Error("请求过大");
    }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
