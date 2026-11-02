# 给接手 Agent 的提示词

把下面这段和你的具体优化要求一起发给其他设备上的 Agent：

```text
请接手这个项目：https://github.com/qtyasupo/ai-portfolio
务必使用 rewrite/creator-radar 分支，main 还是旧网站。

先读仓库根目录 AGENTS.md、HANDOFF.md 和 README.md，再读 docs/SPEC.md、
GLOSSARY.md、docs/verification.md。请先核对当前分支、工作区改动和本机依赖，
复述当前已完成内容与尚未接通的部分，然后按我接下来给出的要求继续优化。

这是 Yasupo AI 创作雷达：收集抖音、小红书、YouTube、X 的 AI/AIGC、AI短剧、
AI视频、代码动画和Claude动画线索。当前原机四平台已采集验收，仓库含18条公开快照。
采集主库、浏览器登录会话、模型密钥和全局Skills不随Git迁移，请验证自己的环境。

当前为规则评分与保守事件归组，云端只读快照；远程数据库、模型调用和完整语义聚类
尚未在线验收。不要把已有接口写成“已全部接通”，不要编造素材、日期、热度或测试结果。
原文时间和采集时间分开保存，未知日期隔离，平台互动和跨来源热度分开。

先在当前开发分支或新分支实现并验证，给我可审阅结果。未经我的新指令，不合并到
生产分支，不切换 www.yasupo-hub.cn，不开通付费服务或搬运浏览器凭据。
```
