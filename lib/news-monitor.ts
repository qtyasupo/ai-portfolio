import { spawn } from "node:child_process";
import { mkdir, open, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
const localFile = (name: string) => path.join(process.cwd(), ".radar", name);
export async function newsMonitorStatus() {
  let running = false;
  let once = false;
  try {
    const info = JSON.parse(
      await readFile(localFile("news-running.json"), "utf8"),
    );
    process.kill(info.pid, 0);
    running = true;
    once = !info.watch;
  } catch {}
  let result: { at?: string; message?: string } = {};
  try {
    result = JSON.parse(await readFile(localFile("news-result.json"), "utf8"));
  } catch {}
  return {
    mode: once ? ("once" as const) : ("watch" as const),
    running,
    lastAttemptAt: result.at || null,
    message:
      running && once
        ? "正在检查公开发文"
        : result.message || "尚未运行Following新闻检查",
  };
}
let launching = false;
export async function startNewsMonitor(watch: boolean) {
  if (process.env.VERCEL) throw new Error("请在本机资料库模式运行X追踪");
  if (launching || (await newsMonitorStatus()).running)
    throw new Error("已有新闻追踪任务运行");
  launching = true;
  try {
    await mkdir(path.dirname(localFile("news.log")), { recursive: true });
    await rm(localFile("news-stop.json"), { force: true });
    const log = await open(localFile("news.log"), "a");
    try {
      const child = spawn(
        /*turbopackIgnore: true*/ process.env.RADAR_PYTHON || "python",
        [
          "-X",
          "utf8",
          path.join(process.cwd(), "scripts/collect-news.py"),
          ...(watch ? ["--watch"] : []),
        ],
        {
          cwd: process.cwd(),
          env: process.env,
          windowsHide: true,
          stdio: ["ignore", log.fd, log.fd],
        },
      );
      child.once("exit", () => {
        launching = false;
      });
      child.once("error", () => {
        launching = false;
      });
      child.unref();
      await new Promise<void>((resolve, reject) => {
        child.once("spawn", resolve);
        child.once("error", reject);
      });
      return { pid: child.pid };
    } finally {
      await log.close();
    }
  } catch (e) {
    launching = false;
    throw e;
  }
}
export async function stopNewsMonitor() {
  if (process.env.VERCEL) throw new Error("只能停止本机追踪");
  await mkdir(path.dirname(localFile("news-stop.json")), { recursive: true });
  await writeFile(
    localFile("news-stop.json"),
    JSON.stringify({ at: new Date().toISOString() }),
  );
}
