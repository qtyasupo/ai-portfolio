"""Read public DOM metadata using the installed OpenCLI and the existing Reach-owned session.

No private APIs, cookie exports, media downloads or alternate accounts. One bounded request, no retry.
"""
import argparse
import json
import subprocess
import sys
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument("platform",choices=["douyin","xiaohongshu"])
parser.add_argument("url")
parser.add_argument("--worker",action="store_true",help=argparse.SUPPRESS)
parser.add_argument("--existing",action="store_true",help=argparse.SUPPRESS)
args=parser.parse_args()
parts=urlsplit(args.url)
expected="www.douyin.com" if args.platform=="douyin" else "www.xiaohongshu.com"
if parts.scheme!="https" or parts.hostname!=expected or parts.username or parts.password:
    parser.error("Use a public HTTPS content URL on the selected platform")
content_pattern=r"/video/(\d+)" if args.platform=="douyin" else r"/(?:explore|search_result)/([a-fA-F0-9]{24})"
content_match=re.fullmatch(content_pattern,parts.path.rstrip("/"))
if not content_match:parser.error("Use a direct public video/note URL")
if not args.worker:
    probe=subprocess.run([sys.executable,"-m","uv","tool","dir"],capture_output=True,text=True,encoding="utf-8",timeout=20)
    runtime=Path(probe.stdout.strip())/"agent-reach"/("Scripts/python.exe" if sys.platform=="win32" else "bin/python")
    if probe.returncode or not runtime.is_file():
        print(json.dumps({"ok":False,"error":{"code":"NEED_SETUP","message":"Agent-Reach runtime unavailable"}}));sys.exit(1)
    command=[str(runtime),"-X","utf8",str(Path(__file__).resolve()),args.platform,args.url,"--worker"]
    if args.existing:command.append("--existing")
    sys.exit(subprocess.call(command))

from agent_reach.runtime.browser_binding import environment, query_slot
from agent_reach.runtime.run import run_cmd, CommandFailed
from agent_reach.runtime.result import ReachError
from agent_reach.backends.opencli import _opencli_error

script=r"""(() => {
  const scope = document.querySelector('#noteContainer') || document.body;
  const visible = el => !!el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
  const clean = el => (el?.innerText || el?.textContent || '').replace(/\s+/g,' ').trim();
  const leaves = [...scope.querySelectorAll('*')].filter(el => !el.children.length && visible(el));
  // Own-note metadata observed on the real page. Comment/recommendation dates never qualify.
  const ownDate = scope.querySelector('.bottom-left > .date');
  const dateNodes = location.hostname.endsWith('xiaohongshu.com') ? (ownDate && visible(ownDate) ? [ownDate] : []) : leaves.filter(el => /^发布时间[：:]/.test(clean(el)));
  const dates = dateNodes.slice(0,1).map(el => ({text:clean(el).slice(0,180)}));
  const meta = [...document.querySelectorAll('meta[content]')].filter(el => /date|time|published/i.test([el.getAttribute('name'),el.getAttribute('property'),el.getAttribute('itemprop')].join(' ')))
    .map(el => ({name:el.getAttribute('name')||el.getAttribute('property')||el.getAttribute('itemprop'),content:el.getAttribute('content')}));
  const bodyText = document.body.innerText || '';
  const scopedText = clean(scope);
  const gate = !dates.length && /登录后查看|请先登录/.test(bodyText);
  const blocked = /安全验证|验证后继续|访问过于频繁|拖动滑块|验证码/.test(bodyText);
  return {url:location.href,title:document.title,dates,meta,gate,blocked,noteText:clean(scope.querySelector('#detail-desc')).slice(0,8000),noteTitle:clean(scope.querySelector('#detail-title')),author:clean(scope.querySelector('.username')),counts:{likes:clean(document.querySelector('.interact-container .like-wrapper .count')),favorites:clean(document.querySelector('.interact-container .collect-wrapper .count')),comments:clean(document.querySelector('.interact-container .chat-wrapper .count'))}};
})()"""

def unwrap(value):
    if isinstance(value,dict):
        for k in ("result","data"):
            if isinstance(value.get(k),dict):return value[k]
    return value

try:
    site="xiaohongshu" if args.platform=="xiaohongshu" else "twitter"
    session=f"yasupo-public-{args.platform}"
    with query_slot(args.platform):
        env=environment(site)
        def command(argv,timeout=25):
            try:
                output=run_cmd(["opencli","browser",session,*argv],timeout=timeout,env=env)
                try:return json.loads(output)
                except ValueError:
                    if argv[0] in {"wait","close"}:return None
                    raise
            except CommandFailed as exc:
                raise _opencli_error(exc.stdout or exc.stderr,"请在现有专用浏览器中本人完成登录或验证。") from None
        if not args.existing:
            command(["open",args.url])
            # Official CLI waits for visible content on this same public page; no navigation retry.
            command(["wait","selector","#noteContainer" if args.platform=="xiaohongshu" else "body"])
        data=unwrap(command(["eval",script]))
        if not isinstance(data,dict):raise ReachError("UPSTREAM_BROKEN","公开页面元数据格式异常")
        resolved=urlsplit(str(data.get("url") or ""))
        actual_match=re.fullmatch(content_pattern,resolved.path.rstrip("/"))
        if resolved.hostname!=expected or not actual_match or actual_match[1]!=content_match[1]:
            raise ReachError("UPSTREAM_BROKEN","页面没有停留在指定内容，未采用返回的日期或正文")
        if isinstance(data,dict) and data.get("blocked"):
            raise ReachError("PLATFORM_BLOCKED","官方页面要求验证，已停止本次读取")
        if isinstance(data,dict) and data.get("gate"):
            raise ReachError("NEED_LOGIN","官方内容页要求登录")
        command(["close"])
        print(json.dumps({"ok":True,"platform":args.platform,"observedAt":datetime.now(timezone.utc).isoformat(),"data":data},ensure_ascii=False))
except ReachError as exc:
    print(json.dumps({"ok":False,"error":{"code":exc.code,"message":exc.message}},ensure_ascii=False));sys.exit(1)
except (ValueError,TypeError) as exc:
    print(json.dumps({"ok":False,"error":{"code":"PARSE_ERROR","message":str(exc)[:200]}},ensure_ascii=False));sys.exit(1)
