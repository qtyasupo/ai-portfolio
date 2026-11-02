import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getStore } from "../lib/store";
const state = await (await getStore()).read();
const result = {
  checkedAt: new Date().toISOString(),
  publicItems: state.items.filter(
    (i) => i.status === "selected" || i.status === "archive",
  ).length,
  platforms: state.sources.map((source) => {
    const items = state.items.filter((i) => i.platform === source.platform);
    return {
      platform: source.platform,
      name: source.name,
      state: source.state,
      lastSuccessAt: source.lastSuccessAt,
      total: items.length,
      public: items.filter(
        (i) => i.status === "selected" || i.status === "archive",
      ).length,
      pending: items.filter((i) => i.status === "pending").length,
      excluded: items.filter((i) => i.status === "excluded").length,
    };
  }),
};
await mkdir(path.join(process.cwd(), ".radar"), { recursive: true });
await writeFile(
  path.join(process.cwd(), ".radar/platform-status.json"),
  JSON.stringify(result, null, 2),
  "utf8",
);
console.log(JSON.stringify(result));
