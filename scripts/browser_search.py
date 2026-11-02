"""Only the installed OpenCLI Douyin public search action, in Reach's managed session."""
import json
import subprocess
import sys
from pathlib import Path

if "--worker" not in sys.argv:
    probe = subprocess.run([sys.executable, "-m", "uv", "tool", "dir"], capture_output=True, text=True, encoding="utf-8", timeout=20)
    interpreter = Path(probe.stdout.strip()) / "agent-reach" / ("Scripts/python.exe" if sys.platform == "win32" else "bin/python")
    if probe.returncode or not interpreter.is_file():
        print(json.dumps({"ok":False,"error":{"code":"NEED_SETUP","message":"Agent-Reach uv environment unavailable"}}))
        sys.exit(1)
    sys.exit(subprocess.call([str(interpreter),"-X","utf8",str(Path(__file__).resolve()),*sys.argv[1:],"--worker"]))

from agent_reach.backends.opencli import _opencli_error
from agent_reach.runtime.browser_binding import query_slot, environment
from agent_reach.runtime.result import ReachError
from agent_reach.runtime.run import run_cmd, CommandFailed

try:
    query=sys.argv[1]
    limit=str(min(10,max(1,int(sys.argv[2]))))
    with query_slot("douyin"):
        # Reach has no Douyin channel. Reuse the existing managed browser binding only;
        # execute the installed OpenCLI DOM action without registering a fictitious Reach channel.
        env=environment("twitter")
        try:
            output=run_cmd(["opencli","douyin","search",query,"--limit",limit,"-f","json"],timeout=60,env=env)
            rows=json.loads(output)
            if isinstance(rows,dict) and rows.get("ok") is False:
                raise _opencli_error(output,"请本人在官方抖音页面登录，不需要提供密码。")
        except CommandFailed as exc:
            raise _opencli_error(exc.stdout or exc.stderr,"请本人在官方抖音页面登录，不需要提供密码。") from None
    if isinstance(rows,dict):
        rows=next((rows[k] for k in ("items","data") if isinstance(rows.get(k),list)),[])
    print(json.dumps({"ok":True,"rows":rows,"route":"installed OpenCLI douyin search (DOM)"},ensure_ascii=False))
except ReachError as exc:
    print(json.dumps({"ok":False,"error":{"code":exc.code,"message":exc.message,"hint":exc.hint}},ensure_ascii=False))
    sys.exit(1)
