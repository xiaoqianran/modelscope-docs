<!-- modelscope-docs: Agent实验场 | agent/playground/playground_CN.md -->

# Agent实验场

欢迎来到 ModelScope Agent 实验场（Playground）！Agent 实验场是魔搭社区面向开发者的**云端 Agent 托管体验平台**，支持一站式自由组合站内模型、Skills、MCPs 或 Agent 模板等AI资源。Agent实验场内置QwenPaw、MS-Agent等多种开源Agent项目与框架，开发者无需本地部署，开箱即用。

在 Agent 实验场，开发者可以轻松为其 Agent 配置社区内外模型API（如魔搭免费 API-Inference ），并通过魔搭智能工坊的 Skills （ Skills 中心）、MCPs（ MCP 广场）、Agent 模板（ AgentHub ）自由组合扩展 Agent 能力边界，或通过导入 AgentHub 的社区 Agent 模板，一键复刻、打包定制您的 Agent 。您也可以将您在实验场配置好的 Agent 发布到 AgentHub 向社区开源分享。



## 功能概览

### 主界面：即开即用的 Agent 体验

您可以从导航栏选择 Agent 实验场 或 点击[这里](https://modelscope.cn/agents/playground) 进入实验场主界面。

![Agent 实验场主界面](../_resources/03-playground-main.png)


### 支持多种Agent框架

#### 默认预置：MS-Agent WebUI

实验场预置了 **MS-Agent WebUI** 作为默认 Agent —— 这是魔搭官方基于自研 MS-Agent 框架推出的长程任务 Agent 应用，其内置了[魔搭平台交互 Skills](https://modelscope.cn/skills/modelscope/ms-hub) 和[魔搭创空间部署 Skills](https://modelscope.cn/skills/modelscope/modelscope-studio)，开发者可以无缝体验魔搭平台各项基础设施。在 Agent实验场，用户首次体验无需手动创建，登录后在输入框中输入对话文本，点击发送即可拉起 Agent 并进行对话。

![MS-Agent WebUI 工作台](../_resources/06-msagent-webui.png)

除了在实验场体验 MS-Agent 外，您也可以在本地安装并运行 MS-Agent WebUI ，更多用法与详情可前往 [MS-Agent Github 仓库](https://github.com/modelscope/ms-agent) 了解。

#### 轻松创建并运行社区热门 Agent

Agent 实验场支持同时创建并运行多个 Agent实例，并致力于为用户提供多种热门开源 Agent （如 OpenClaw、QwenPaw等）。

当前除 MS-Agent WebUI 外，已经完成对 **[QwenPaw](https://qwenpaw.agentscope.io/)** 的支持，开发者可以创建一个默认的QwenPaw Agent实例，或前往 AgentHub 上发现一个感兴趣的 QwenPaw Agent 导入到实验场中试用体验。

| 支持框架 | 状态 | 
| --- | --- | 
| MS-Agent WebUI | ✅ 已支持 | 
| QwenPaw | ✅ 已支持 |
| Hermes Agent | 🔜 规划中 | 
| OpenClaw | 🔜 规划中 | 
| 更多框架 | 🗓️ 规划中 | 

### 管理我的 Agent

实验场在输入框右下方提供了统一的实验场管理入口，点击进入后开发者可以查看、管理创建的全部 Agent 实例，并前往“立即体验”。此外，在实验场管理页面，用户还可以添加、管理模型 API 供应商、常用 Skills、常用 MCPs，以便在创建、编辑 Agent 实例时快速复用。

除了统一的管理页面，实验场还提供了快速创建以及最近使用入口，以便用户便捷操作。

- 创建Agent：实验场提供「自定义创建」和「从 AgentHub 导入」两种创建方式。其中自定义创建用户可以任意定制系统文件、模型、Skills、MCPs等配置，完成后即可确认创建；从 AgentHub 导入则可通过搜索、选择 AgentHub 模板快速创建。
     
- 最近使用：在实验场中可以通过「最近使用」入口浏览常用的 Agent 实例，点击即可唤醒。


### 从详情页前往实验场体验

Agent 实验场的核心价值在于将魔搭社区的多种 AI 资源整合到一个统一的体验环境中：

| 资源类型 | 来源 | 在实验场中的体验方式 |
| --- | --- | --- |
| **Agent** | AgentHub | 直接添加并对话 |
| **Skills** | Skills 中心 | 通过 Agent 调用体验 |
| **MCPs** | MCP 广场 | 通过 Agent 挂载体验 |
| **Models** | 模型库/API-Inference | 作为 Agent 底层模型驱动 |

在 Skills、MCPs、Agent 详情页，您可以找到试用入口，点击即可一键前往实验场体验。这种整合让你无需下载到本地、搭建环境，即可体验 Agent、Skills 与 MCPs 。


## 使用建议

1. **先试后用**：在将 Agent/Skills/MCPs 集成到您的生产环境或发布分享之前，您可先在实验场中用真实问题验证其表现，确认能力边界与响应质量。
2. **对比选型**：可同时添加多个同类 Agent，通过相同 prompt 横向对比效果，辅助决策。
3. **全链路验证**：利用实验场对 Skills、MCPs、Models 的整合能力，验证 Agent 与其依赖资源的协同效果。
4. **反馈闭环**：如果在实验场中发现 Agent 存在问题，可直接回到该 Agent 的详情页向作者反馈，帮助社区共同提升 Agent 质量。

## 反馈与答疑

社区将积极拓展更多热门开源 Agent ，并不断探索各种 Agent 高阶特性与玩法。如果您有任何建议或需求，欢迎通过以下方式、联系我们反馈：

*   ModelScope 开发者群（钉钉群号 44837352）<br>  
<img src="https://modelscope-docs-dev.oss-cn-hangzhou.aliyuncs.com/static/dingding.png"  alt=' ModelScope 开发者群' width="200px"/>
<br>

*   联系邮箱：contact@modelscope.cn
*   微信公众号：魔搭ModelScope社区

我们期待您的反馈，一起让 Agent 实验场变得更好！
