import { readFile } from "node:fs/promises";
import { getStore } from "../lib/store";
import {
  defaultTracking,
  normalizeHandle,
  validateTracking,
} from "../lib/tracking";
const file = process.argv[2];
if (!file) throw new Error("需要本机Following结果文件");
const result = JSON.parse(await readFile(file, "utf8"));
if (
  !result.ok ||
  !Array.isArray(result.rows) ||
  !result.rows.length ||
  result.rows.length >= 60
)
  throw new Error(
    "Following名单为空、读取失败或达到本轮上限，请核对完整性后再导入",
  );
const store = await getStore();
const accounts = result.rows.map(
  (row: { screen_name: string; name: string }) => ({
    handle: normalizeHandle(row.screen_name),
    label: row.name || row.screen_name,
    enabled: true,
    confirmed: true,
  }),
);
await store.update((state) => {
  state.tracking = validateTracking({
    ...(state.tracking || defaultTracking()),
    accounts,
  });
});
console.log(JSON.stringify({ ok: true, count: accounts.length }));
