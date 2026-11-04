# 2026-11-04 · GitHub / Vercel 跨设备续作

用户明确要求“推送到github 并部署 晚上我换设备继续”。授权范围是将当前开发分支推送到既有仓库，并部署既有Vercel项目的预览环境，沿用现有登录。部署状态与URL需按Git提交在Vercel核对，历史部署地址不代表最新版。

- 仓库：`https://github.com/qtyasupo/ai-portfolio`
- 分支：`rewrite/creator-radar`。`main`仍为旧网站，现有生产域名没有在本轮切换。
- Vercel：`yasupos-projects / ai-portfolio`，项目ID `prj_IpRFNyCVYRSbbfY0Zt5x4xESlITq`。
- 代码入口：`HANDOFF.md`；双栏目详见 `radar-streams-2026-11-04.md`；平台话题来源详见 `platform-topics-2026-11-04.md`。

## 新设备复现

```sh
git clone --branch rewrite/creator-radar --single-branch https://github.com/qtyasupo/ai-portfolio.git
cd ai-portfolio
npm ci
```

已有仓库时，先检查工作区，切换上述分支后 `git pull --ff-only`。保留本机未提交改动，发生分叉时先核对，不强制覆盖。

PowerShell查看公开快照：

```powershell
$env:VERCEL = '1'
npm run dev
# 停止服务后，恢复普通本机数据库模式：
Remove-Item Env:VERCEL
```

macOS/Linux可用 `VERCEL=1 npm run dev`。默认开发端口4318。普通本机模式首次运行数据库为空是正常情况；`node --import tsx scripts/apply-platform-topics.ts`可将6个研究话题写入新设备本机配置，但不会导入原机资料或浏览器会话。

## 本轮发布内容

公开快照39条：新闻13、创作26。6个研究话题会在没有私有tracking配置的公开页面中显示，来源是可移植研究JSON。31项TypeScript测试、类型检查和生产构建通过。

公开部署为只读资料快照，未开通远程数据库或云端采集。平台截图、原始检索回执、本地数据库、Following完整40人名单、登录状态及凭据均不通过Git上传。小红书5条原发布日期待核验的笔记不进入公开资料列表；其公开链接、可见互动和待核验状态仅作为话题研究依据展示。

原设备X追踪因上游读取失败已停止。另一台设备需要本人建立专用会话并在本地验证；不能把页面上线理解为已迁移或恢复实时采集。Telegram继续为占位。

新增部署兼容处理位于 `lib/tracking.ts` 的 `publishedTracking()`：提供公开话题默认值并保持空账号列表。`publicState`仍剥离私有tracking；本轮未放宽公开接口的写入鉴权。
