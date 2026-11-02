# Yasupo AI 创作雷达 · Agent 入口

先读 [HANDOFF.md](HANDOFF.md)，再读 [README.md](README.md)、[规格](docs/SPEC.md)、[术语](GLOSSARY.md) 与 [验收记录](docs/verification.md)。用户的最新要求优先。

- 当前交付分支：`rewrite/creator-radar`。`main` 仍对应旧网站；不能把旧站当成最新版本。预览开发完成，正式域名尚未切换。
- 用户当前要求是保存交付，方便其他设备继续优化。后续改动按用户在新会话中的要求执行，不自行合并生产分支、切换域名或开通付费服务。
- 技术栈：Next.js 16.4.3 / React 19.3.1 / TypeScript；Node.js 24.11+，采集使用 Python 3.12+。依赖锁定在 package-lock.json，使用 npm ci。
- 数据入口看 `lib/radar.ts`；规则与日期/热度在 `lib/pipeline.ts`；所有公开出口经过 `lib/publication.ts`。不要通过改变页面数字伪造采集结果。
- 本机 SQLite 主库在忽略目录 `.radar/`，Git 中只有公开快照 `data/public-snapshot.json`。另一台设备不会自动获得原设备的数据库、平台会话、模型密钥或全局 Skills。
- 未知/推估日期隔离，历史回灌归档；平台互动与跨发布方热度分开。读到简介不能声称已看完视频或获得字幕。
- 采集器调用 Agent-Reach 与已安装 OpenCLI；抖音/小红书只补读公开 DOM。遇到登录、验证、限流或超时停止该渠道，不切换账号绕过。登录由用户本人完成。
- 采集代码调整后运行 Python 行为测试；数据规则/API 调整后运行 TypeScript 测试与类型检查。改网页后用当前可用浏览器工具实际核对。不要把旧设备上的验收结果当作新设备已验证。
- 不提交 `.radar/`、`.env.local`、浏览器配置或凭据。Next 发布追踪也排除了本地运行目录。

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
