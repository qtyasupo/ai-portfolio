# 开发 Skills

来源 mattpocock/skills，固定提交 4ae2317ddb22b046e26455e4f9c9b3aaaf62212d。使用官方 skill-installer 安装至 C:/Users/lenovo/.codex/skills。

| Skill              | 用途                                         |
| ------------------ | -------------------------------------------- |
| codebase-design    | 用小接口封装采集入库、事件聚合与持久化行为   |
| domain-modeling    | 统一资料、观察、发布方与热度定义             |
| diagnosing-bugs    | 用可重复的失败信号定位问题                   |
| code-review        | 后续按规格与代码标准审查                     |
| research           | 并行核对 AIHOT 与官方部署资料                |
| tdd                | 后续在与用户约定的验证接口上执行测试驱动开发 |
| implement          | 后续从规格/任务实施并提交                    |
| writing-for-agents | 编写清晰可执行的项目指引                     |

本轮直接应用 codebase-design、domain-modeling、research；安装不意味着所有 Skill 流程均已运行。网站实现按 docs/SPEC.md 验收。

## 2026-11-04 · frontend-ui-ux

用户确认允许注册市场客户端、保存并使用市场凭据后，按 [LobeHub 安装说明](https://lobehub.com/skills/code-yeongyu-oh-my-opencode-frontend-ui-ux/skill.md) 使用 `@lobehub/market-cli` 注册 Codex 并执行 `skills install code-yeongyu-oh-my-opencode-frontend-ui-ux --agent codex`。

实际安装位置：`C:/Users/lenovo/Documents/New project/.agents/skills/code-yeongyu-oh-my-opencode-frontend-ui-ux/SKILL.md`。安装后已完整读取；文件 SHA-256 为 `4D233247DDB3D608AABEE5F313FC8825DD30D4F59786490A435E88AE117B846B`。

已应用其“先确定视觉方向、检查现有代码和历史、沿用项目模式、浏览器验证”要求。本轮选择杂志式创作观察刊，详见 [界面优化与验收](ui-refresh-2026-11-04.md)。该 Skill 安装在本机工作区，属于可选开发工具，不是网站依赖；市场凭据不在本仓库中。其他设备需要时另行安装，不复制市场凭据。
