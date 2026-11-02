const base="http://127.0.0.1:4319";
const page=await fetch(base);const feed=await fetch(`${base}/api/feed`);const data=await feed.json();
const write=await fetch(`${base}/api/sources`,{method:"POST",headers:{"Content-Type":"application/json",Origin:base},body:"{}"});
const exported=await fetch(`${base}/api/export`);const records=await exported.json();
const result={page:page.status,feed:feed.status,storage:data.storage,writable:data.writable,items:data.state.items.length,hiddenItems:data.state.items.filter(i=>!["selected","archive"].includes(i.status)).length,write:write.status,export:exported.status,excerptLimit:records.items.every(i=>i.text.length<=400)};
console.log(JSON.stringify(result));
if(page.status!==200||data.storage!=="snapshot"||data.writable||result.hiddenItems||write.status!==401||!result.excerptLimit)process.exitCode=1;
