const base = process.env.CHECK_URL || "http://127.0.0.1:4318";
const feed = await fetch(`${base}/api/feed`);
if (!feed.ok) throw new Error(`feed ${feed.status}`);
const data = await feed.json();
const source = data.state.sources.find((s) => s.platform === "youtube");
const response = await fetch(`${base}/api/sources`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: base },
  body: JSON.stringify(source),
});
const result = await response.json();
console.log(
  JSON.stringify({ feed: feed.status, save: response.status, result }),
);
if (response.status !== 200 || !result.ok) process.exitCode = 1;
