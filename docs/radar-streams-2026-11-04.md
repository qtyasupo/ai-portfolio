# 2026-11-04 · AI新闻与AIGC创作双栏目

用户要求将浏览入口分为两条线，并明确关注自己X账号Following里的40人。用户本轮允许使用X专用会话、允许恢复同版本Agent-Reach依赖；抖音与小红书明确选择“先保留候选话题，稍后采集”。用户仍要求仅保留本地，不推送。

## 页面和数据

- 根页面：**AI 雷达热点实时追踪**。X与Telegram入口；模型、硬件、人物与企业分类。Telegram是明确的待接入占位，没有消息、凭据或虚假成功状态。
- `/?view=creation`：**AIGC 创作热点话题**。X、抖音、小红书、YouTube；既有作品链接、可见文字与平台互动。默认候选词为AI短剧/漫剧、AI视频/短片、即梦/Seedance、Claude动画、AIGC工作流，均标“待定”。用户可一起筛选、编辑并确认，确认后才供轮换采集使用。
- 主要导航只保留两栏和更多。收藏、日报、事件热榜、采集工作台等在更多里；避免重新堆回左右侧栏。
- `Candidate.stream / Item.stream` 区分 `news / creation`；旧资料默认创作栏目。新增三个新闻类别；后续更新旧资料时保留明确的stream。未知日期仍隔离，首次存量仍归档。
- 新闻卡片明确标“来源发文 · 未独立核实”；文字出现谣言、据传、别当真等时显示“传闻 / 待核实”。不能把作者的段子或观点作为已确认的产品/企业事实。
- AIGC的“平台点赞”是可见指标排序，不是跨平台标准化热榜。近期选项按原文时间筛选；不承诺平台全量、全站实时热点或语义聚类。

## X接入与本机运行

本机旧Agent-Reach启动器指向的Python环境已不存在。经用户明确确认，恢复uv 0.13.6，并从工作区保存的本地源码恢复Agent-Reach 1.6.1；没有升级该工具或重新登录，也没有移动/导出浏览器凭据。

`scripts/x_feed.py`仅封装已安装OpenCLI的只读 `twitter following`、`twitter timeline --type following`、有界 `twitter search --product live`，复用Agent-Reach管理的专用会话。没有自写签名、私有接口客户端或自建CDP连接。关注名单通过不指定user的原生命令读取当前登录用户Following。

- Following实读40人，已写入本机SQLite的 `state.tracking.accounts`，并实际验证配置保存。
- 每轮读取Following时间线最近最多30条，再按确认且启用的作者名单过滤。AI相关内容按规则进入新闻/创作两栏；日常无关内容被排除。转推出现的名单外作者不会自动放行。
- 首次批次实读30条、名单内30条；重启验证批次实读30条、名单内29条，新建1条资料、更新28条。2026-11-04 15:13（UTC+8）本机累计59条，公开32条，其中新闻12、创作20；这些数字是验收截面，后台继续检查后会变化。
- 已通过页面开启每5分钟检查一次，验证停止后再启动。每次检查后再等待300秒；这是本机轮询，不是平台推送。每轮条数有上限，不保证不漏帖。
- 遇到登录、验证、限流、超时及其他读取失败停止追踪，保留回执；不换账号、后端或循环重试。用户处理后才能重新启动。
- 本机正常资料库模式运行在 `http://127.0.0.1:4319`；电脑及本机进程需保持运行。预览服务器在同一有权限的本机环境读取worker状态；受限沙箱无法探测外部进程时，不能据此声称监控已停止。

常用操作：新闻栏 → 关注账号与接入状态 → 导入名单/保存账号/开启或停止追踪。单次检查在主界面。命令入口 `npm run news:once`、`npm run news:watch`；停止通过网页写停止信号，worker最多约2秒发现（正在读平台时等本轮退出）。

Telegram后续可以按[官方用户API申请说明](https://core.telegram.org/api/obtaining_api_id)或[Bot消息范围说明](https://core.telegram.org/bots/faq#what-messages-will-my-bot-get)选择方案；未配置频道及授权方式之前保持占位。本轮未创建Telegram账号、Bot或外部服务。

## 文件入口与隐私

- `components/RadarApp.tsx`：双栏目、筛选、原文与文字展示。
- `components/TrackingBoard.tsx`：账号管理、候选话题、监控控制；同一配置的后台刷新不会覆盖未保存草稿。
- `lib/tracking.ts`：配置校验、账号主页规范化、栏目分流；账号最多100个，话题最多30条，未确认项不能启用。
- `lib/pipeline.ts`：新增新闻分类与stream保留；仍保持原有去重、日期、归档规则。
- `lib/news-monitor.ts`、`scripts/collect-news.py`：启动/状态/停止、独立进程锁、轮询、作者过滤和失败停止。
- `/api/tracking`、`/api/following`、`/api/news-collect`：管理鉴权入口，云端不启动本机浏览器。
- `scripts/tracking-config.ts`、`scripts/import-following.ts`：本机配置读入与从实际Following读取结果导入。
- `scripts/export.ts`：已确认的创作话题进入平台轮换词配置；未确认候选不替换现有来源词。

Following名单及配置仅在本机数据库/忽略目录里。`publicState`主动剥离整个tracking配置，公开feed与导出均不包含完整Following名单。`.radar/x-following.json`、`.radar/x-news-timeline.json`、数据库、运行日志和截图都被Git忽略。跨设备迁移需私下转移主库，并在新设备由用户本人登录；Git内旧公开快照不会携带这40人配置或本轮新闻主库。

## 验证

- 24项TypeScript测试、10项Python测试、类型检查、最终生产构建通过。
- 新测试覆盖新闻类别、无日期隔离、stream跨更新保留、40人配置、未确认禁止启用、账号URL校验、公开出口不泄露名单、名单外作者过滤、创作/模型发布分流、读取失败只记一次并停止。
- `node scripts/check-tracking-http.mjs`：同源读到40人，公开feed与export隐藏完整名单；无权启动监控401，非法配置400且没有覆盖原配置。需在有本机localhost访问权的环境运行。
- 桌面与375px手机无横向溢出；双栏目、Telegram占位、候选话题、搜索、筛选、配置保存、启动/停止/重启、原文和详情入口均检查。Claude动画候选词实测匹配2条资料。
- 自动刷新后未保存的话题草稿仍保留；测试草稿未保存并已丢弃。
- 浏览器日志捕获到一条第三方Chrome扩展的fetchError，来源为chrome-extension；未观察到本站运行报错，未修改该扩展。
- 本机截图：`.radar/screenshots/ai-news-desktop-2026-11-04.png`、`aigc-topics-desktop-2026-11-04.png`，另有同名mobile图。截图不随Git传输。

尚未完成：Telegram真实采集、抖音/小红书本轮新采集、全站热榜、全量不漏监控、云端常驻采集和远程持续同步。这些不应描述为已上线能力。
