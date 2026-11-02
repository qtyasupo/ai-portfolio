// Operator-only local action: run after the user confirms login or verification is complete.
import { getStore } from "../lib/store";
import { PLATFORMS } from "../lib/types";
const requested = process.argv.slice(2);
if (
  !requested.length ||
  requested.some((p) => !PLATFORMS.includes(p as (typeof PLATFORMS)[number]))
) {
  throw new Error(
    "Specify one or more platforms: douyin xiaohongshu youtube x",
  );
}
await (
  await getStore()
).update((state) => {
  for (const source of state.sources) {
    if (!requested.includes(source.platform)) continue;
    source.state = "idle";
    source.message = "用户已确认完成登录/验证，等待真实采集验收";
  }
});
console.log(JSON.stringify({ ok: true, resumed: requested }));
