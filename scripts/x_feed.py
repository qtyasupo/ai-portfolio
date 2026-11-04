"""Installed OpenCLI read-only X following/timeline actions in Reach's owned session."""
import json
from pathlib import Path
import subprocess
import sys

if "--worker" not in sys.argv:
    probe = subprocess.run([sys.executable, "-m", "uv", "tool", "dir"], capture_output=True, text=True, encoding="utf-8", timeout=20)
    interpreter = Path(probe.stdout.strip()) / "agent-reach" / ("Scripts/python.exe" if sys.platform == "win32" else "bin/python")
    if probe.returncode or not interpreter.is_file():
        print(json.dumps({"ok": False, "error": {"code": "NEED_SETUP", "message": "本机 Agent-Reach 运行环境不可用"}}))
        sys.exit(1)
    sys.exit(subprocess.call([str(interpreter), "-X", "utf8", str(Path(__file__).resolve()), *sys.argv[1:], "--worker"]))

from agent_reach.backends.opencli import _opencli_error
from agent_reach.runtime.browser_binding import query_slot, environment
from agent_reach.runtime.result import ReachError
from agent_reach.runtime.run import run_cmd, CommandFailed

try:
    action = sys.argv[1]
    if action == "following":
        args = ["following", "--limit", "60"]
    elif action == "timeline":
        args = ["timeline", "--type", "following", "--limit", "30"]
    elif action == "search" and len(sys.argv[2]) <= 300:
        args = ["search", sys.argv[2], "--product", "live", "--limit", "10"]
    else:
        raise ReachError("BAD_INPUT", "只支持following、timeline与有界实时搜索")
    with query_slot("twitter"):
        env = environment("twitter")
        try:
            raw = run_cmd(["opencli", "twitter", *args, "-f", "json"], timeout=90, env=env)
            rows = json.loads(raw)
            if isinstance(rows, dict) and rows.get("ok") is False:
                raise _opencli_error(raw, "请本人在X官方页面完成登录或验证")
        except CommandFailed as exc:
            raise _opencli_error(exc.stdout or exc.stderr, "请本人在X官方页面完成登录或验证") from None
    if isinstance(rows, dict):
        rows = next((rows[k] for k in ("items", "data") if isinstance(rows.get(k), list)), [])
    print(json.dumps({"ok": True, "rows": rows, "route": "installed OpenCLI in Agent-Reach session"}, ensure_ascii=False))
except ReachError as exc:
    print(json.dumps({"ok": False, "error": {"code": exc.code, "message": exc.message}}, ensure_ascii=False))
    sys.exit(1)
except (ValueError, IndexError):
    print(json.dumps({"ok": False, "error": {"code": "BAD_OUTPUT", "message": "本次没有读取到可用数据"}}, ensure_ascii=False))
    sys.exit(1)
