"""Bounded, read-only keyword collection. No media download, no login export, no automatic retry.

One rotating query per enabled platform per run. --watch repeats every 30 minutes.
Restricted channels are paused until the operator resolves the issue and clears their state.
"""
import argparse
import email.utils
import html
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parent.parent
STATE=ROOT/".radar"
STATE.mkdir(exist_ok=True)
os.environ.setdefault("PYTHONUTF8","1")
REACH=os.environ.get("AGENT_REACH_BIN") or shutil.which("agent-reach") or str(Path.home()/".local/bin/agent-reach.exe")
TSX=ROOT/"node_modules/tsx/dist/cli.mjs"
NODE=shutil.which("node") or "node"
def node_args(script,*args):return [NODE,"--env-file-if-exists=.env.local",str(TSX),str(ROOT/script),*args]

def now(): return datetime.now(timezone.utc).isoformat().replace("+00:00","Z")
def run_json(argv, timeout=150):
    try:
        p=subprocess.run(argv,cwd=ROOT,capture_output=True,text=True,encoding="utf-8",timeout=timeout)
        # Reach JSON can be preceded by non-data diagnostics. Do not print diagnostic streams.
        lines=p.stdout.strip().splitlines()
        return json.loads(next((s for s in reversed(lines) if s.startswith("{")),"{}")) or {"ok":False,"error":{"code":"EMPTY_OUTPUT","message":"采集工具没有返回有效 JSON"}}
    except subprocess.TimeoutExpired:
        return {"ok":False,"error":{"code":"TIMEOUT","message":"本次采集超时，未自动重试"}}
    except (ValueError,OSError):
        return {"ok":False,"error":{"code":"NEED_SETUP","message":"采集工具不可用，请检查本机 Agent-Reach 安装"}}

def js_ingest(payload, name):
    file=STATE/f"batch-{name}.json"
    file.write_text(json.dumps(payload,ensure_ascii=False),encoding="utf-8")
    p=subprocess.run(node_args("scripts/ingest.ts",str(file)),cwd=ROOT,capture_output=True,text=True,encoding="utf-8",timeout=300)
    if p.returncode: raise RuntimeError("资料入库失败；请检查本机数据库与日志")
    for line in p.stdout.splitlines():
        if line.startswith("{"): print(line,flush=True)

def count(value):
    if isinstance(value,(int,float)) and value>=0: return int(value)
    if isinstance(value,str):
        import re
        m=re.fullmatch(r"([\d,.]+)\s*([万亿kKmM]?)",value.strip())
        if m:
            try:return round(float(m[1].replace(",",""))*{"":1,"万":10000,"亿":100000000,"k":1000,"K":1000,"m":1000000,"M":1000000}[m[2]])
            except ValueError:pass
    return None

def normalize(platform,raw,query):
    r=raw.get("raw") or raw
    title=raw.get("title") or r.get("title") or r.get("desc") or raw.get("text") or r.get("text") or ""
    url=raw.get("url") or r.get("url") or r.get("link") or r.get("note_url")
    if not title or not url:return None
    author=raw.get("author") or r.get("author") or r.get("uploader") or r.get("channel") or ""
    if isinstance(author,dict):author=author.get("nickname") or author.get("name") or ""
    text=raw.get("text") or r.get("text") or r.get("content") or r.get("description") or r.get("desc") or ""
    published=raw.get("published_at") or r.get("created_at") or r.get("published_at") or r.get("upload_date")
    confidence="unknown"
    if platform=="x" and published:
        try:
            if isinstance(published,(int,float)):published=datetime.fromtimestamp(published,timezone.utc).isoformat()
            try:parsed=datetime.fromisoformat(str(published).replace("Z","+00:00"))
            except ValueError:parsed=email.utils.parsedate_to_datetime(str(published))
            if parsed.tzinfo:published=parsed.isoformat();confidence="verified"
        except ValueError:pass
    if platform=="youtube" and published:
        try:
            if len(str(published))==8:published=datetime.strptime(str(published),"%Y%m%d").replace(tzinfo=timezone.utc).isoformat()
            if len(str(published))==10:published=datetime.strptime(str(published),"%Y-%m-%d").replace(tzinfo=timezone.utc).isoformat()
            parsed=datetime.fromisoformat(str(published).replace("Z","+00:00"))
            if parsed.tzinfo:published=parsed.isoformat();confidence="verified"
        except ValueError:pass
    # XHS search dates can be inferred from a note ID by OpenCLI. Never promote them to verified dates.
    if platform=="xiaohongshu" and published:confidence="estimated";published=None
    if platform=="douyin":published=None
    metrics={}
    fields={"likes":["likes","like_count","liked_count","digg_count"],"views":["views","view_count","play_count"],"comments":["comments","comment_count","reply_count"],"favorites":["favorites","collect_count","collected_count"],"shares":["shares","share_count","retweet_count"]}
    if platform=="douyin":fields={"likes":["likes"]} # upstream zero placeholders are NOT observations
    for field,keys in fields.items():
        for key in keys:
            value=count(r.get(key))
            if value is not None:metrics[field]=value;break
    return {"platform":platform,"url":url,"title":html.unescape(str(title))[:240],"author":str(author),"text":html.unescape(str(text))[:8000],"publishedAt":published if confidence=="verified" else None,
            "datePrecision":"day" if platform=="youtube" else "second",
            "dateConfidence":confidence,"metrics":metrics,"query":query,"evidence":str(title)[:220],"access":"search"}

def config():
    # Export also refreshes the collector configuration from durable storage.
    p=subprocess.run(node_args("scripts/export.ts"),cwd=ROOT,capture_output=True,text=True,encoding="utf-8",timeout=30)
    if p.returncode:raise RuntimeError("无法读取采集配置")
    return json.loads((STATE/"collector-config.json").read_text(encoding="utf-8"))

def collect_once(args):
    statuses=[]
    for s in config():
        platform=s["platform"]
        if not s["enabled"] or (args.platform and platform not in args.platform):continue
        if s["state"] in {"needs_login","blocked","rate_limited"}:
            print(json.dumps({"platform":platform,"skipped":True,"reason":s["state"]}),flush=True);continue
        if not s["queries"]:continue
        query=args.query or s["queries"][s["cursor"]%len(s["queries"])]
        started=now()
        print(json.dumps({"platform":platform,"query":query,"state":"running"},ensure_ascii=False),flush=True)
        if platform=="douyin":
            result=run_json([sys.executable,"-X","utf8",str(ROOT/"scripts/browser_search.py"),query,str(args.limit)])
        else:
            channel="twitter" if platform=="x" else platform
            # Recent search is expressed using the platform's own public query operators.
            if platform=="x":query=f"({query}) since:{datetime.now(timezone.utc).strftime('%Y-%m')}-01 -filter:replies"
            result=run_json([REACH,channel,"search",query,"--limit",str(args.limit),"--timeout","75"])
        if not result.get("ok"):
            error=result.get("error") or {"code":"UNKNOWN","message":"平台采集失败"}
            js_ingest({"platform":platform,"query":query,"error":{"code":error.get("code","UNKNOWN"),"message":str(error.get("message", "平台暂不可用"))[:400]}},platform)
            statuses.append({"platform":platform,"status":"error","code":error.get("code")});continue
        rows=result.get("items") or result.get("rows") or []
        items=[c for row in rows if (c:=normalize(platform,row,query))]
        # Search-only YouTube output often lacks a date; read a bounded number of metadata pages.
        if platform=="youtube":
            for i,item in enumerate(items[:args.limit]):
                if item["dateConfidence"]!="verified":
                    detail=run_json([REACH,"youtube","read",item["url"],"--timeout","45"],timeout=65)
                    if detail.get("ok") and detail.get("items"):
                        enriched=normalize(platform,detail["items"][0],query)
                        if enriched:enriched["access"]="detail";items[i]=enriched
        first_import=not s.get("lastSuccessAt")
        js_ingest({"platform":platform,"query":query,"startedAt":started,"items":items,"backfill":first_import,
                   "message":f"{len(items)} 条真实检索结果；首次导入归档" if first_import else f"{len(items)} 条真实检索结果"},platform)
        statuses.append({"platform":platform,"status":"ok","count":len(items)})
    subprocess.run(node_args("scripts/export.ts"),cwd=ROOT,check=True)
    (STATE/"collector-result.json").write_text(json.dumps({"completedAt":now(),"platforms":statuses},ensure_ascii=False),encoding="utf-8")

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--platform",action="append",choices=["douyin","xiaohongshu","youtube","x"])
    parser.add_argument("--query")
    parser.add_argument("--limit",type=int,default=5)
    parser.add_argument("--watch",action="store_true")
    args=parser.parse_args();args.limit=min(10,max(1,args.limit))
    lock=STATE/"collector.lock"
    # OS lock is released on process exit, including abnormal exits. Prevent concurrent website/CLI runs.
    with lock.open("a+b") as handle:
        if handle.tell()==0:handle.write(b"0");handle.flush()
        handle.seek(0)
        try:
            if sys.platform=="win32":
                import msvcrt
                msvcrt.locking(handle.fileno(),msvcrt.LK_NBLCK,1)
            else:
                import fcntl
                fcntl.flock(handle,fcntl.LOCK_EX|fcntl.LOCK_NB)
        except OSError:
            print(json.dumps({"ok":False,"error":"已有采集任务运行"}));return 1
        (STATE/"collector-running.json").write_text(json.dumps({"pid":os.getpid(),"startedAt":now()}),encoding="utf-8")
        try:
            while True:
                collect_once(args)
                if not args.watch:break
                time.sleep(1800)
        finally:
            (STATE/"collector-running.json").unlink(missing_ok=True)
    return 0

if __name__=="__main__":sys.exit(main())
