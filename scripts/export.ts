import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getStore } from "../lib/store";
import { publicState } from "../lib/publication";
const state = await (await getStore()).read();
const folder = path.join(process.cwd(), "data");
await mkdir(folder, { recursive: true });
const visible = publicState(state);
await writeFile(
  path.join(folder, "public-snapshot.json"),
  JSON.stringify(visible, null, 2),
  "utf8",
);
await writeFile(
  path.join(process.cwd(), ".radar", "collector-config.json"),
  JSON.stringify(
    state.sources.map((source) => {
      const queries = state.tracking?.topics
        .filter(
          (t) =>
            t.enabled && t.confirmed && t.platforms.includes(source.platform),
        )
        .map((t) => t.query);
      return queries?.length
        ? { ...source, queries: [...new Set(queries)].slice(0, 20) }
        : source;
    }),
  ),
  "utf8",
);
console.log(
  JSON.stringify({
    ok: true,
    items: visible.items.length,
    pendingNotExported: state.items.length - visible.items.length,
    updatedAt: state.updatedAt,
  }),
);
