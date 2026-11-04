import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { writeAccess } from "@/lib/access";
import { getStore } from "@/lib/store";
import {
  defaultTracking,
  normalizeHandle,
  validateTracking,
} from "@/lib/tracking";
let importing = false;
export async function POST(req: Request) {
  if (!writeAccess(req))
    return Response.json({ error: "需要管理授权" }, { status: 401 });
  if (process.env.VERCEL)
    return Response.json(
      { error: "Following名单在本机专用会话读取" },
      { status: 409 },
    );
  if (importing)
    return Response.json({ error: "正在读取Following名单" }, { status: 409 });
  importing = true;
  try {
    const { stdout } = await promisify(execFile)(
      process.env.RADAR_PYTHON || "python",
      [
        "-X",
        "utf8",
        path.join(process.cwd(), "scripts/x_feed.py"),
        "following",
      ],
      {
        cwd: process.cwd(),
        timeout: 180_000,
        maxBuffer: 2_000_000,
        windowsHide: true,
      },
    );
    const result = JSON.parse(
      stdout
        .trim()
        .split(/\r?\n/)
        .filter((line) => line.startsWith("{"))
        .at(-1) || "{}",
    );
    if (
      !result.ok ||
      !Array.isArray(result.rows) ||
      !result.rows.length ||
      result.rows.length >= 60
    )
      throw new Error(
        result.error?.message || "名单为空或本次未完整读取，请核对后再导入",
      );
    const accounts = result.rows.map(
      (row: { screen_name: string; name: string }) => ({
        handle: normalizeHandle(row.screen_name),
        label: row.name || row.screen_name,
        enabled: true,
        confirmed: true,
      }),
    );
    await (
      await getStore()
    ).update((state) => {
      state.tracking = validateTracking({
        ...(state.tracking || defaultTracking()),
        accounts,
      });
    });
    return Response.json({ ok: true, count: accounts.length });
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof Error && !("cmd" in e)
            ? e.message
            : "X名单读取未完成，请检查本机专用会话与工具状态；未自动重试",
      },
      { status: 409 },
    );
  } finally {
    importing = false;
  }
}
