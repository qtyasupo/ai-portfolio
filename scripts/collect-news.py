"""Bounded X Following monitor. Local five-minute polling; no login automation."""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time
from collect import ROOT, STATE, node_args, normalize, run_json, js_ingest, now

def eligible_rows(rows, accounts):
    allowed = {a["handle"].lower() for a in accounts if a.get("confirmed") and a.get("enabled")}
    kept = []
    for row in rows:
        # The installed timeline action returns author as a screen_name.
        author = str(row.get("author") or "").lstrip("@").lower()
        if author not in allowed:
            continue
        candidate = normalize("x", row, "X Following · 最新公开发文")
        if not candidate:
            continue
        text = f'{candidate["title"]} {candidate["text"]}'
        creative = re.search(r"短剧|漫剧|短片|动画|分镜|提示词|生图|出图|AIGC|animation|filmmak|short film|storyboard|image generation|AI video", text, re.I)
        release = re.search(r"发布|推出|上线|released?|launch|announc|introducing|new model|新模型", text, re.I)
        candidate["stream"] = "creation" if creative and not release else "news"
        candidate["publisherId"] = f"x:{author}"
        candidate["evidence"] = candidate["text"][:220] or candidate["title"]
        kept.append(candidate)
    return kept

def load_config():
    p = subprocess.run(node_args("scripts/tracking-config.ts"), cwd=ROOT, capture_output=True, text=True, encoding="utf-8", timeout=30)
    if p.returncode: raise RuntimeError("无法读取关注配置")
    return json.loads(p.stdout.strip().splitlines()[-1])

def collect_once(file=None):
    config = load_config()
    if not any(a.get("enabled") and a.get("confirmed") for a in config["accounts"]):
        raise RuntimeError("请先导入或确认Following名单")
    result = json.loads(Path(file).read_text(encoding="utf-8-sig")) if file else run_json([sys.executable, "-X", "utf8", str(ROOT/"scripts/x_feed.py"), "timeline"], timeout=150)
    at = now()
    if not result.get("ok"):
        error = result.get("error") or {"code": "UNKNOWN", "message": "X读取未成功"}
        js_ingest({"platform": "x", "query": "X Following", "error": error}, "news-error")
        receipt = {"at": at, "ok": False, "message": f'{error.get("code")} · {error.get("message", "读取受限")[:180]}'}
        (STATE/"news-result.json").write_text(json.dumps(receipt, ensure_ascii=False), encoding="utf-8")
        print(json.dumps(receipt, ensure_ascii=False), flush=True)
        return False # Stops watch on any failure; no browser/backend switching.
    rows = result.get("rows") or []
    items = eligible_rows(rows[:30], config["accounts"])
    initialized = STATE/"news-initialized.json"
    first = not initialized.exists()
    js_ingest({"platform": "x", "query": "X Following", "items": items, "backfill": first, "message": f"Following时间线读取{len(rows[:30])}条，名单内{len(items)}条；首次存量归档" if first else f"Following时间线读取{len(rows[:30])}条，名单内{len(items)}条"}, "news")
    initialized.write_text(json.dumps({"at": at}), encoding="utf-8")
    receipt = {"at": at, "ok": True, "received": len(rows[:30]), "matched": len(items), "message": f"最近检查 {at} · 读取{len(rows[:30])}条，名单内{len(items)}条；每轮最多30条，不保证漏帖率为零"}
    (STATE/"news-result.json").write_text(json.dumps(receipt, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(receipt, ensure_ascii=False), flush=True)
    return True

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--watch", action="store_true")
    parser.add_argument("--from-file")
    args = parser.parse_args()
    if args.watch and args.from_file: parser.error("存量文件不能作为实时轮询来源")
    STATE.mkdir(exist_ok=True)
    lock = STATE/"news-collector.lock"
    with lock.open("a+b") as handle:
        if handle.tell() == 0: handle.write(b"0"); handle.flush()
        handle.seek(0)
        try:
            if sys.platform == "win32":
                import msvcrt
                msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
            else:
                import fcntl
                fcntl.flock(handle, fcntl.LOCK_EX|fcntl.LOCK_NB)
        except OSError:
            print(json.dumps({"ok": False, "error": "已有新闻追踪任务运行"})); return 1
        (STATE/"news-stop.json").unlink(missing_ok=True)
        running = STATE/"news-running.json"
        running.write_text(json.dumps({"pid": os.getpid(), "watch": args.watch, "startedAt": now()}), encoding="utf-8")
        try:
            while True:
                if (STATE/"news-stop.json").exists(): break
                if not collect_once(args.from_file) or not args.watch: break
                deadline = time.monotonic() + 300
                while time.monotonic() < deadline and not (STATE/"news-stop.json").exists(): time.sleep(2)
        except Exception as exc:
            receipt = {"at": now(), "ok": False, "message": str(exc)[:200]}
            (STATE/"news-result.json").write_text(json.dumps(receipt, ensure_ascii=False), encoding="utf-8")
            print(json.dumps(receipt, ensure_ascii=False), flush=True)
            return 1
        finally:
            running.unlink(missing_ok=True)
    return 0

if __name__ == "__main__": sys.exit(main())
