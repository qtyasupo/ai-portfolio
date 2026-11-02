# AI 创作者情报站：AIHOT 工作流核验与落地边界

核验日期：2026-11-02。AIHOT 固定版本：`38d130f26bf4807054ec8e71a732795761cfe438`。本文是研究与设计约束，不表示以下采集、云数据库、模型或定时任务已接通。现有仓库是 Next.js 应用；本任务尚未提供 LLM key、尚未建立云数据库。

## 1. AIHOT 已实现的规则

### 收集、精选、归组

- 流程：判重与正文补取 → 行业预筛 → 独立两次评分及事实结构化 → 中文标题摘要 → 事件归组及新信息判断 → 精选 → 报告。只有标题的普通文章等待正文，不能凭标题生成事实摘要。
- 两次评分 `s1,s2 ∈ [0,100]`；`s1+s2 ≥ 2T` 才够分，展示 `floor((s1+s2)/2)`。分级门槛 T1=60、T1_5=65、T2=76；类别门槛只抬高、不降低。够分仍须归组及新信息检查；模型失败不会等待后自动放行。
- 候选召回回看两周：可用向量，否则文字重合度；最终关系判断依靠模型。`SAME_OCCURRENCE` 是同一次发生，`SAME_STORY` 是同一具体事件后续，`UNRELATED` 是不同事件，`ROUNDUP` 是多话题汇总。相同产品名不等于同一事件。
- 同一新闻可有多个来源；机器出口只选一篇代表报道，优先官方一手。无新增事实的重复解读不能再次占精选位置。

来源：[selection.md](https://github.com/KKKKhazix/AIHOT/blob/38d130f26bf4807054ec8e71a732795761cfe438/docs/selection.md)、[grouping.md](https://github.com/KKKKhazix/AIHOT/blob/38d130f26bf4807054ec8e71a732795761cfe438/docs/grouping.md)。这些阈值是原站标准；创作者领域需要标注样本重新校准。

### 日期与历史回灌

- 保存原文发布时间、首次发现时间、证据及日期可信度。未知可信发布时间的条目先隔离，不能进公开列表、精选、报告、热点或推送；不得拿采集时间冒充发布时间。
- 首次发现时已发布超过 48 小时、新信源首次导入的存量、显式 backfill：按原文时间归档，不进“今天”或推送。首次默认最多 30 条、最近 12 个月；后续不再追收首次导入前超过 48 小时的旧存量（X 按自身游标）。
- `publishedAfter` 为严格晚于指定 UTC 时间；未知日期也排除。外部脚本可以推送，默认新 external 信源隔离，管理员启用后才公开。
- 信源分工是 `editorial`（公开内容）、`hot_signal`（只作讨论证据）、`isolated`（不公开）；全文展示默认关闭，保留摘要与原文链接。

来源：[sources.md](https://github.com/KKKKhazix/AIHOT/blob/38d130f26bf4807054ec8e71a732795761cfe438/docs/sources.md)。

### 热度：独立参与方，不是平台播放量

令 `P_e(t)` 为事件 e 在 `(t−48h,t]` 有有效证据的独立参与方集合，`last_p` 为该参与方窗口内最新的原始证据时间。原版计算：

```text
H(e,t) = Σ[p∈P_e(t)] 0.5 ^ ((t − last_p) / 24h)
displayHeat = round(H × 100) / 10
```

同一参与方窗口内只贡献一次；重复采集不能增加热度。运营矩阵按 `signal_group_id`、公司多渠道按 `owner_entity_id` 合并；否则用 source id，指定社区按作者区分。至少 2 个独立参与方、至少 1 个 editorial，按 H 排前 10。趋势比较 6 小时前，并剔除新增信源或采集落后导致的不可比较部分。撤回、隔离材料不能继续贡献证据。[已核对 hot.ts](https://github.com/KKKKhazix/AIHOT/blob/38d130f26bf4807054ec8e71a732795761cfe438/packages/backend/src/events/hot.ts)。

因此必须分别建模：

| 字段                              | 含义                                     | 展示约束                                           |
| --------------------------------- | ---------------------------------------- | -------------------------------------------------- |
| `sourceHeat` / `participantCount` | 独立参与方关注事件的强度                 | 可解释、跨源去重，不能称全网热度                   |
| `platformMetrics`                 | 单帖点赞、收藏、评论、播放，及其采样时间 | 按平台、指标原样标注；缺失为 null，不能填 0 或混加 |
| `platformCount`                   | 已观察到的平台数                         | 覆盖范围，不能代替独立参与方或权威度               |

后两项为本站建议数据模型，不是声称 AIHOT 使用平台互动加权。

### 运行架构

AIHOT 为 api、worker、web 三进程，Postgres/pg-boss 管任务；所有公开出口共享 publication 层。页面只读预先计算结果，不能打开页面才调模型；付费调用有回执与预算上限。它不是可直接塞入 Vercel Function 的常驻采集器。[architecture.md](https://github.com/KKKKhazix/AIHOT/blob/38d130f26bf4807054ec8e71a732795761cfe438/docs/architecture.md)。

## 2. 本站建议的可运行最小方案（明确属于简化）

```text
本机 Windows 定时任务 / 手动执行
  → Agent-Reach 或已验证的公开 RSS/API 适配器
  → 原始证据 JSONL + 本地 SQLite + 采集游标/错误状态
  → 规范化 URL/平台帖子 ID、日期隔离、内容哈希去重
  → 规则分类与人工精选/事件归组
  → 导出经过公开过滤的版本化 JSON 快照
  → 现有 Next.js/Vercel 网站只读该快照
```

1. 没有 LLM key：只显示原始标题、来源文字节选与原链；`analysisMode=rules/manual`。允许确定性的关键词分类、精确 URL 去重及人工事件合并；相似标题只产生候选，不自动断言同一事件。缺少模型时不得给出“两次独立 AI 评分”或模型事件综述。
2. 没有云数据库：本地 SQLite 是采集主库；已审核 JSON 作为部署快照随构建发布。网站显著显示快照更新时间、来源覆盖与失败状态。运行时 API 写本地 JSON 或 `/tmp` 不算持久化。此阶段不能承诺网站后台写入或无人值守持续同步。
3. 有云数据库后：使用 Neon/Supabase/Prisma Postgres 等托管 Postgres，入库端鉴权、校验与幂等 upsert；事件、原始条目、采集运行、信源健康分表。本机保留凭据及平台会话，云端仅存必要公开内容和结果。数据库及连接池与 Function 尽量同区。
4. 再有模型 key：引入可配置评分标准、回执缓存、版本号与日预算，先运行小样本人工校准，再逐步启用语义归组和事件摘要。不要在读者请求链调用模型。

Vercel 官方规定 Function 文件系统只读，`/tmp` 是临时空间；持久化数据应进入外部存储。Marketplace 支持 Postgres 等提供商并注入环境变量。[Function 文件系统](https://vercel.com/docs/functions/runtimes#file-system-support)、[Marketplace Storage](https://vercel.com/docs/marketplace-storage)。

Vercel Cron 当前 Hobby 只支持每天一次，触发时间可在指定小时内；Pro/Enterprise 可每分钟。Cron 仍是 Function 调用，受执行限制，不是常驻 worker。本机任务可先承担较高频采集；电脑关机则停止，页面必须显示最后成功时间。不要为未知套餐配置 30 分钟 Cron。[Cron 限制](https://vercel.com/docs/cron-jobs/usage-and-pricing)。

## 3. 四个平台的真实边界与最小字段

根据本机已安装 Agent-Reach skill（`C:/Users/lenovo/.agents/skills/agent-reach/SKILL.md`）核验：YouTube 有 read/search/subtitle/transcribe；X 有 search/profile/tweets/thread，标记 experimental；小红书有 search/read/comments，read 仅返回文字描述；渠道表没有抖音。渠道声明不证明当前登录、请求成功或数据完整，应以本次采集回执为准。Agent-Reach 上游：[官方仓库](https://github.com/Panniantong/Agent-Reach)。

| 平台    | 首版策略                                      | 不能承诺                           |
| ------- | --------------------------------------------- | ---------------------------------- |
| YouTube | 已验证搜索/读取；有字幕才存字幕证据           | 所有视频都有字幕、已观看画面       |
| X       | 已验证公开读取或本机会话；原帖链接与帖子时间  | 全量实时 firehose、稳定不限流      |
| 小红书  | 已验证文字笔记/评论；登录及风控失败停本次     | 已理解图文中的图片或视频、全站覆盖 |
| 抖音    | 适配器预留、手工 URL/文字导入，状态标“待接入” | 已由本机 Agent-Reach 自动持续抓取  |

条目最低字段：`id, platform, platformItemId, canonicalUrl, authorId, sourceId, title, textExcerpt, publishedAt, discoveredAt, dateStatus, contentHash, evidenceType, collectedAt, backfill, visibility, reviewStatus, eventId, platformMetrics`。运行记录另存 `status, attemptedAt, lastSuccessAt, errorCode, itemCount`；缺失数据必须显示未知。时区统一存 UTC，站内日期按 Asia/Shanghai；“今天”以可信原文日期和 backfill 资格判定。

## 4. 可评审的首版验收

- 原始条目可追溯到真实原文；每个平台独立报告接入状态，失败不展示为“全平台已同步”。
- 未知日期隔离、历史导入归档、同 URL 重跑不增条，抓取失败不推进游标。
- 未配置模型/数据库时网站仍能读取明确标识的快照；规则分类与人工归组有标记。
- 当前热点与平台互动值分开；样本不足就显示“待形成事件”，不能用造出的 0–100 分代替事实。
- 公开流、事件页、搜索、日报从同一已过滤数据集读取，隔离或撤回条目不能从其他出口泄漏。
