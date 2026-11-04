import assert from "node:assert/strict";
const base = "http://127.0.0.1:4319";
const local = await (await fetch(`${base}/api/feed`)).json();
assert.equal(local.storage, "local");
assert.ok(local.state.tracking.accounts.length > 0);
const anonymous = await (
  await fetch(`${base}/api/feed`, {
    headers: { Origin: "https://example.invalid" },
  })
).json();
assert.equal(anonymous.state.tracking, undefined);
assert.ok(
  anonymous.state.items.every((i) =>
    ["selected", "archive"].includes(i.status),
  ),
);
const exported = await (await fetch(`${base}/api/export`)).json();
assert.equal(exported.tracking, undefined);
const blocked = await fetch(`${base}/api/news-collect`, {
  method: "POST",
  headers: {
    Origin: "https://example.invalid",
    "Content-Type": "application/json",
  },
  body: "{}",
});
assert.equal(blocked.status, 401);
const invalid = await fetch(`${base}/api/tracking`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    accounts: [
      { handle: "test", label: "Test", enabled: true, confirmed: false },
    ],
    topics: [],
    telegram: { status: "placeholder", channels: [] },
  }),
});
assert.equal(invalid.status, 400);
const after = await (await fetch(`${base}/api/feed`)).json();
assert.deepEqual(after.state.tracking, local.state.tracking);
console.log(
  JSON.stringify({
    localAccounts: local.state.tracking.accounts.length,
    publicItems: anonymous.state.items.length,
    privateFollowingHidden: true,
    unauthorizedMonitor: blocked.status,
    invalidTracking: invalid.status,
    unchangedConfig: true,
  }),
);
