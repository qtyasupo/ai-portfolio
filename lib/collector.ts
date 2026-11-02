import { spawn } from "node:child_process";
import { readFile, mkdir, open, rm } from "node:fs/promises";
import path from "node:path";

export async function collectorRunning() {
  try {
    const file = JSON.parse(
      await readFile(
        path.join(process.cwd(), ".radar/collector-running.json"),
        "utf8",
      ),
    );
    process.kill(file.pid, 0);
    return true;
  } catch {
    return false;
  }
}
let launching = false;
export async function startCollector() {
  if (process.env.VERCEL)
    throw new Error("浏览器采集在本机运行；请从本机同步数据到远程数据库");
  if (launching || (await collectorRunning()))
    throw new Error("已有采集任务运行");
  launching = true;
  try {
    await mkdir(path.join(process.cwd(), ".radar"), { recursive: true });
    const log = await open(
      path.join(process.cwd(), ".radar/collector.log"),
      "a",
    );
    try {
      const child = spawn(
        /*turbopackIgnore: true*/ process.env.RADAR_PYTHON || "python",
        ["-X", "utf8", path.join(process.cwd(), "scripts/collect.py")],
        {
          cwd: process.cwd(),
          env: process.env,
          stdio: ["ignore", log.fd, log.fd],
          windowsHide: true,
          detached: false,
        },
      );
      child.on("exit", () => {
        launching = false;
      });
      child.on("error", () => {
        launching = false;
      });
      child.unref();
      await new Promise<void>((resolve, reject) => {
        child.once("spawn", () => resolve());
        child.once("error", reject);
      });
      return { pid: child.pid };
    } finally {
      await log.close();
    }
  } catch (e) {
    launching = false;
    await rm(path.join(process.cwd(), ".radar/collector-running.json"), {
      force: true,
    });
    throw e;
  }
}
