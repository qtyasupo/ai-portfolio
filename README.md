# Yasupo · AI 创作雷达

将 ai-portfolio 重写为 AI 创作情报站。目标域名 **www.yasupo-hub.cn**，Vercel 项目 **ai-portfolio**。旧站基线 `00102433f83e70ea3f4fea701ee39eb364f7b95f`；开发分支 `rewrite/creator-radar`。参考 AIHOT 工作流独立实现，未使用其品牌或产品代码。

## 本机运行

需要 Node.js 24.11+、Python 3.12+。本机已安装 Agent-Reach，无需重装。

```powershell
Set-Location 'C:\Users\lenovo\Documents\New project\ai-creator-radar'
npm ci
npm run dev
```

打开 http://127.0.0.1:4318 。本地数据库自动创建在 `.radar/radar.db`，不提交 Git。工作台支持关键词配置、启停渠道、JSON导入、单轮采集和运行记录。本机同源自动授权；配置令牌后必须使用令牌。

## 采集

```powershell
# 每个平台一个轮换关键词，每词最多5条；失败平台不影响其他平台。
npm run collect
# 单独采集已登录渠道
python -X utf8 scripts/collect.py --platform youtube --platform x --limit 5
# 每30分钟一轮，电脑和进程必须保持运行，Ctrl+C停止。
npm run collector
# 导入实际读到的批次
npm run ingest -- 'C:\path\batch.json'
# 导出已过滤的公开快照及采集配置
npm run snapshot
```

YouTube/X/小红书使用现有 Agent-Reach。抖音用已安装 OpenCLI 的 `douyin search` DOM 读取，在现有采集专用浏览器中运行；Agent-Reach原版没有抖音渠道。不下载媒体，不导出 Cookie，不调用自写签名接口。

遇到 NEED_LOGIN、PLATFORM_BLOCKED、RATE_LIMITED 会持久暂停该渠道。用户处理官方页面后，在工作台编辑平台，点击“我已处理，恢复采集”。BUSY/超时本轮不重试。使用OS锁防止同时采集。

## 导入格式

数组或 `{items:[], backfill:true}`，每批最多50条。平台 `douyin / xiaohongshu / youtube / x`；必填 `platform,url,title`。可选 `author,text,evidence,publishedAt,dateConfidence,datePrecision,metrics,query,access,publisherId,eventKey`。

只有核对过的原文日期可设 `dateConfidence:"verified"`，带时区ISO格式。纯日期用 `datePrecision:"day"`；笔记ID推估日期仍待核验。简介不是字幕，`access` 为 search/detail/subtitle/user_import。metrics支持likes/views/comments/favorites/shares，未知省略。publisherId用于合并同一运营矩阵，eventKey用于人工确认同一具体事件。

## 工作流与简化

采集 → URL去重 → 日期隔离/相关性筛选 → 质量评分 → 事件归组 → 热点 → 日报。

- 未知、推估或不合理未来日期不进公开资讯/热点/日报。首次存量导入、backfill和首次发现超过48h的内容归档，原文时间与采集时间分开。
- 同URL更新指标并保留观察；搜索文字不覆盖详情。X分享路径按帖子ID归一。
- 默认规则分类与评分，摘要为来源文字节选。未配置模型时没有模型调用，也不声称双模型已运行。
- 服务端可选OpenAI兼容模型A/B，两个独立评分成功才标双模型，失败保留规则评分。每批最多10条，每请求25秒超时。当前未配置、未实测；启用前运营者需核对提供商费用和预算。
- 事件首版只支持相同规范化标题或人工eventKey，没有实现原版embedding召回和LLM事件复核。共享宽泛主题不自动合并。
- 热度为48h内每独立发布方的最新证据，24h半衰期；显示round(sum*100)/10。至少两方才进榜，不使用平台点赞/播放。缺少可比6h快照不显示增长率，不代表全网热搜。
- 日报按Asia/Shanghai原文自然日整理合格样本，可导出Markdown，不是模型撰写的事件综述。
- 所有公开出口共用publication过滤；隔离/排除资料不随快照发布。只展示短摘录，原文跳转平台。

原版精确规则与一手资料见 [研究记录](docs/research/aihot-workflow.md)。此最小版不等同于AIHOT完整生产系统。

## Vercel与持续同步

未配置远程数据库时，Vercel只读 `data/public-snapshot.json`。页面标明快照与采集时间，云端写入关闭。新内容需要本机导出后部署，不把Vercel临时文件当持久主库。

后续由运营者创建远程libSQL/Turso数据库，在本机`.env.local`和Vercel设置 `TURSO_DATABASE_URL / TURSO_AUTH_TOKEN`；再设置至少24字符 `RADAR_ADMIN_TOKEN`。本机采集写同一远程库即可持续更新网站。仅服务端变量，不加NEXT_PUBLIC_前缀，不提交Git。远程适配器已实现，但本轮未开通远程数据库，在线持续同步尚未验证。

外部推送：POST `/api/ingest`，`Authorization: Bearer <管理令牌>`，JSON数组或`{items:[...],backfill:true}`。每进程每分钟10次、每批50条、请求最多1MB；单实例限流不替代公网网关限流，当前供单一运营者管理。

目标项目ID `prj_IpRFNyCVYRSbbfY0Zt5x4xESlITq`，团队 `team_VogzSWryDB6ESS1ARkt3ZWtl`。先验证独立开发分支预览，生产替换前交付可审阅结果。

## 检查

```powershell
npm test
npm run typecheck
npm run build
node scripts/check-http.mjs
```

核心行为通过公开读写接口验证。已实测和未配置能力见 [验收记录](docs/verification.md)。
