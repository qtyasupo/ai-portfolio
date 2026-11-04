# 跨设备 / 跨 Agent 交接

**2026-11-04 最新续作入口：用户已授权推送 GitHub 并部署现有 Vercel 项目的开发分支预览。** 继续使用 `rewrite/creator-radar`，不要从旧 `main` 开发。此前“仅本地保存”的记录属于历史阶段。最新代码包含双栏目、平台独立话题与证据面板；公开快照更新为39条（新闻13、创作26），公开默认话题含抖音3个、小红书3个，Following完整名单仍保留本机。

换设备先按下方命令克隆或拉取，再 `npm ci`。希望直接查看与线上相同的资料时，在 PowerShell 执行 `$env:VERCEL='1'` 后运行 `npm run dev`，打开 `http://127.0.0.1:4318/?view=creation`；这是本地只读快照模式，不会连接或部署Vercel。停止服务并移除该环境变量后可恢复普通本机开发。采集、会话与私有名单的迁移边界见 [本轮发布交接](docs/github-vercel-handoff-2026-11-04.md)。

交付日期：2026-11-02（Asia/Singapore）。本次按用户要求保存当前版本，功能暂告一段落。本文描述交付时的状态，不代表下一台设备已经安装依赖或拥有登录会话。

2026-11-04续作：用户已恢复优化，新增创作观察刊界面、阅读摘录与键盘/手机导航改进，详见 [本轮改动与验收](docs/ui-refresh-2026-11-04.md)。以下平台数据与部署地址仍是11月2日交接记录；本轮是否已推送请核对分支实际提交，不能把本地优化视为已上线。

同日第二轮：用户反馈入口仍杂乱，已改为单栏搜索和资料列表，顶部为浏览/收藏/日报/更多；详见 [最新入口与验收](docs/ui-simplification-2026-11-04.md)。用户明确要求先保留本地，尚未授权推送这两轮优化。

同日第三轮：改为AI新闻追踪与AIGC创作两栏；本机已导入用户X Following的40人，读取公开时间线并开启5分钟检查。Telegram为占位，抖音/小红书本轮不采集。**最新结构、运行方式、名单隐私和验收见 [双栏目与监控交接](docs/radar-streams-2026-11-04.md)**；仍仅本地保存，不能把下方11月2日快照数量当作当前主库。

同日第四轮：经用户明确授权实际检索抖音和小红书，已分别提炼3个AI话题并加入来源依据。继续维护话题、迁移配置或核对日期时，读 [平台话题研究与验收](docs/platform-topics-2026-11-04.md)。本轮6条抖音资料核验原发布时间，5条小红书笔记保持待核验；X追踪在收尾时因上游读取失败停止。改动仍仅本地保存。

## 1. 从正确的分支开始

- 仓库：<https://github.com/qtyasupo/ai-portfolio>
- **新版分支：`rewrite/creator-radar`**
- 新站功能提交：`9663421506ba164e1bd47e0c0b4b1381b4d879f2`
- 四平台接入提交：`7f8d1249054153d18daebc087b95a1f399da117c`
- 随后的交接文档提交即本次交付封存点；用 `git log -3 --oneline` 查看。
- `main` 仍是旧站，尚未合并。本次保存交付不代表已批准正式域名切换。

在新设备的任意工作目录执行：

```sh
git clone --branch rewrite/creator-radar --single-branch https://github.com/qtyasupo/ai-portfolio.git
cd ai-portfolio
npm ci
npm run dev
```

本地地址 <http://127.0.0.1:4318>。采集相关命令还需要 Python 3.12+ 和下述本机工具；只开发网页不需要登录社交平台。

## 2. 可运行的网页与数据模式

交付时已验证的预览：<https://ai-portfolio-a74mhaccu-yasupos-projects.vercel.app>

Vercel 项目 `ai-portfolio`，项目 ID `prj_IpRFNyCVYRSbbfY0Zt5x4xESlITq`，团队 ID `team_VogzSWryDB6ESS1ARkt3ZWtl`。域名 `yasupo-hub.cn / www.yasupo-hub.cn` 仍指向旧生产站。开发分支推送会创建预览部署；后续新部署请在 Vercel 中按分支确认，不把旧的固定部署地址当成最新部署。

| 运行方式        | 数据来源                                | 可写性                                   |
| --------------- | --------------------------------------- | ---------------------------------------- |
| 普通本机开发    | 自动创建 `.radar/radar.db`              | 本机同源管理可写                         |
| 配置远程 libSQL | `TURSO_DATABASE_URL / TURSO_AUTH_TOKEN` | 已配置管理授权时可写；远程模式未在线验收 |
| Vercel 无远程库 | Git 内的 `data/public-snapshot.json`    | 只读快照                                 |

**新克隆的本地数据库为空是正常的。** 仓库保留18条公开快照，未包含原开发机的28条主库记录及完整观察历史。若只是复现已有页面，可在本地模拟已验证的快照模式：

PowerShell：

```powershell
$env:VERCEL = '1'
npm run dev
# 停止服务器后，恢复普通本地开发模式：
Remove-Item Env:VERCEL
```

macOS / Linux：

```sh
VERCEL=1 npm run dev
```

这里仅设置当前进程的运行模式，不是连接/部署 Vercel。快照模式禁止写入和本机采集启动。切回普通本地模式时重启服务器。

如用户需要迁移完整采集主库，可在采集与服务器停止后，通过用户选定的私有文件渠道复制原机 `.radar/radar.db`；不要把它加入当前公开 Git 仓库。平台浏览器会话仍需在新设备由用户本人建立。

## 3. 已实现的产品与边界

发现页、关键词/平台/分类/时间筛选、本机收藏、来源详情、多次互动观察、热点页、日报 Markdown、资料 JSON 导出，以及采集工作台的关键词配置、渠道启停、手动导入和本机单轮采集。

工作流为采集 → URL判重 → 日期隔离与相关性筛选 → 规则评分 → 保守事件归组 → 样本热度 → 日报。参考 AIHOT 独立实现；完整语义聚类、评分校准、周/月报尚未实现。

- 未启用模型：摘要是来源文字节选，评分明确标记规则评分。
- 双模型适配器已写，未配置密钥、未在线实测。显式启用才会向提供商发送请求并产生费用。
- 热度是48h内独立发布方的证据经24h半衰期衰减，不是把点赞/播放相加。样本未形成合格同一事件时，热榜为空。
- 事件仅按规范化相同标题或人工 `eventKey` 归组，不能声称已经做了 LLM 语义判断。
- 所有公开出口经同一过滤层；未知日期/估算日期不能放行，首次回灌与旧内容不刷当日动态。
- 运行时主库目前是单个 SQLite/libSQL 状态记录，适合当前小样本；扩大规模前应评估分表、索引、并发和任务队列。

## 4. 平台接入现状（原设备实测）

| 平台    | 主库累计 | 公开快照 | 待核验 | 排除 |
| ------- | -------: | -------: | -----: | ---: |
| 抖音    |        5 |        5 |      0 |    0 |
| 小红书  |        5 |        1 |      4 |    0 |
| YouTube |        7 |        6 |      1 |    0 |
| X       |       11 |        6 |      1 |    4 |
| 合计    |       28 |       18 |      6 |    4 |

原设备已安装 Agent-Reach 1.6.1、OpenCLI 1.8.7，并由用户本人完成抖音、小红书和 X 的专用浏览器登录。新设备应先验证工具版本与支持动作；安装方法参考 [Agent-Reach 官方说明](https://github.com/Panniantong/Agent-Reach)。这些程序与会话不在本仓库中，全球开发 Skills 也不属于应用运行依赖。

- YouTube：Agent-Reach search/read，元数据与视频简介；未把简介冒充字幕。
- X：Agent-Reach twitter search，复用本机专用会话。
- 小红书：Agent-Reach search + 公开页面正文/自身日期区域补读；不从笔记 ID 或评论日期推导发布时间。
- 抖音：原版 Agent-Reach 没有抖音渠道，调用已安装 OpenCLI `douyin search`，再补读公开视频自身“发布时间”标签。
- DOM选择器和上游工具会变，日期缺字段时保持待核验，不改为默认“今天”。
- 登录、验证、限流、超时会停止该平台的后续请求，保留已经取得的内容。由用户处理后恢复，不自动换账号/后端绕过。

`scripts/collect.py` 对 `AGENT_REACH_BIN`、`RADAR_PYTHON`、PATH 与 uv 工具环境有依赖。已实测平台为 Windows/PowerShell；Python 脚本包含其他操作系统分支，但 macOS/Linux 尚未实机验收。新 Agent 应先只跑单个平台、少量样本，再报告本机的成功或失败。

## 5. 文件地图

| 文件                                                         | 用途                                         |
| ------------------------------------------------------------ | -------------------------------------------- |
| `app/page.tsx`、`components/RadarApp.tsx`、`app/globals.css` | 页面与交互                                   |
| `lib/types.ts`                                               | 资料、观察、信源、事件的数据约定             |
| `lib/radar.ts`                                               | 公开读写入口与采集回执                       |
| `lib/pipeline.ts`                                            | URL规范化、相关性/分类、日期隔离、热度、日报 |
| `lib/store.ts`                                               | 本机SQLite、远程libSQL、只读快照             |
| `lib/publication.ts`                                         | 公开过滤与摘录限制                           |
| `lib/access.ts`、`app/api/*`                                 | 管理鉴权、请求校验、API路由                  |
| `scripts/collect.py`                                         | 有界采集、轮换词、补读、停止条件             |
| `scripts/browser_search.py`                                  | 抖音搜索适配                                 |
| `scripts/public_detail.py`、`scripts/public_dates.py`        | 中文平台公开DOM与日期解析                    |
| `scripts/export.ts`、`scripts/platform-status.ts`            | 公开快照与本机状态报告                       |
| `scripts/reclassify.ts`                                      | 只重算已存证据的派生分类，不新增伪观察       |
| `docs/SPEC.md`、`GLOSSARY.md`                                | 规格与术语                                   |
| `docs/research/aihot-workflow.md`                            | 对照AIHOT原版的规则与简化                    |
| `docs/verification.md`                                       | 验收及已修复问题                             |

## 6. 验证与已踩过的问题

```sh
npm test
python -X utf8 -m unittest discover -s tests -p 'test_*.py'
npm run typecheck
npm run build
```

交付时通过17项TypeScript测试、7项Python测试、类型检查与生产构建。浏览器实测桌面与375px窄屏、搜索、收藏、来源详情、日报、配置保存，以及线上18条快照与平台筛选。

- Next.js可能把本机请求URL主机写为localhost，而实际Host/Origin是127.0.0.1；鉴权已按实际Host核对，避免误拦保存。
- Windows采集器锁文件曾被Next打包追踪误扫。`next.config.ts` 排除了 `.radar/`，不要删除该排除项，也不要把本机运行文件打包到云端。
- 补读正文后必须重新计算相关性与分类；不能永久保留标题阶段的排除结果。已添加回归测试。
- 新设备应重新验证，不把以上原机结果描述为自己的验收结果。

## 7. 下一轮适合优先处理

1. 按用户选择接远程持久数据库，打通本机采集到网页的持续同步；当前线上仍是部署快照。
2. 精简卡片标题与正文摘录，减少重复文字；提升中英文内容的可读性与移动端体验。
3. 用有来源的近期样本改进关键词、时间筛选、推广内容过滤与质量规则，保留未知值和日期证据。
4. 用户提供模型配置后再验证双评分、中文摘要、预算与失败回执；之后考虑语义事件归组。
5. 扩容时再规划分表和任务队列，保持幂等、历史观察与公开过滤。

上述是待办方向，不是已获准自动开通付费服务、启用常驻任务或替换生产域名。
