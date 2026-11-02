import { createClient, type Client } from "@libsql/client";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { emptyState } from "./pipeline";
import type { RadarState } from "./types";

export interface StateStore {
  read(): Promise<RadarState>;
  update<T>(fn: (state: RadarState) => T | Promise<T>): Promise<T>;
  mode: "local" | "remote" | "snapshot";
}
export function snapshotStore(load: () => Promise<RadarState>): StateStore {
  return {
    mode: "snapshot",
    read: load,
    update: async () => {
      throw new Error("当前为只读数据快照，请配置远程数据库后启用云端写入");
    },
  };
}
export function sqliteStore(
  client: Client,
  mode: "local" | "remote" = "local",
): StateStore {
  let ready: Promise<unknown> | undefined;
  const init = () =>
    (ready ??= (async () => {
      await client.execute(
        "CREATE TABLE IF NOT EXISTS radar_state (id INTEGER PRIMARY KEY CHECK(id=1), payload TEXT NOT NULL)",
      );
      await client.execute({
        sql: "INSERT OR IGNORE INTO radar_state(id,payload) VALUES(1,?)",
        args: [JSON.stringify(emptyState())],
      });
    })());
  return {
    mode,
    async read() {
      await init();
      const r = await client.execute(
        "SELECT payload FROM radar_state WHERE id=1",
      );
      return JSON.parse(String(r.rows[0].payload)) as RadarState;
    },
    async update(fn) {
      await init();
      const tx = await client.transaction("write");
      try {
        const r = await tx.execute(
          "SELECT payload FROM radar_state WHERE id=1",
        );
        const state = JSON.parse(String(r.rows[0].payload)) as RadarState;
        const result = await fn(state);
        await tx.execute({
          sql: "UPDATE radar_state SET payload=? WHERE id=1",
          args: [JSON.stringify(state)],
        });
        await tx.commit();
        return result;
      } catch (e) {
        await tx.rollback();
        throw e;
      } finally {
        tx.close();
      }
    },
  };
}
let singleton: Promise<StateStore> | undefined;
export function getStore(): Promise<StateStore> {
  return (singleton ??= (async () => {
    if (process.env.TURSO_DATABASE_URL)
      return sqliteStore(
        createClient({
          url: process.env.TURSO_DATABASE_URL,
          authToken: process.env.TURSO_AUTH_TOKEN,
        }),
        "remote",
      );
    if (process.env.VERCEL)
      return snapshotStore(async () => {
        try {
          return JSON.parse(
            await readFile(
              path.join(process.cwd(), "data/public-snapshot.json"),
              "utf8",
            ),
          );
        } catch {
          return emptyState();
        }
      });
    const folder = path.join(process.cwd(), ".radar");
    await mkdir(folder, { recursive: true });
    return sqliteStore(
      createClient({
        url: `file:${path.join(folder, "radar.db").replaceAll("\\", "/")}`,
      }),
    );
  })());
}
