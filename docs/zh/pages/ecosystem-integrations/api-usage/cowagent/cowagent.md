<!-- modelscope-docs: CowAgent | ecosystem-integrations/api-usage/cowagent/cowagent_CN.md -->

# CowAgent

## 概述

CowAgent（原名 ChatGPT-on-WeChat）是开源的个人 AI 助手和 Agent 框架。项目经历了从简单的微信聊天机器人到完整 Agent 平台的演进，目前支持任务规划、长期记忆、知识库、技能系统和 MCP 协议。

它的架构围绕"Agent Harness"设计：消息从各个渠道进来后，Agent Core 负责规划任务、在记忆和知识库中检索上下文、调用工具和技能，最后通过模型生成回复，返回到来源渠道。每一层都是解耦的，可以独立扩展。

核心能力：

- **任务规划**：将复杂任务分解为多个步骤逐步执行，循环调用工具直到完成
- **三层记忆架构**：对话上下文（短期）→ 每日记忆（中期）→ MEMORY.md（长期），夜间自动进行记忆蒸馏
- **知识库**：自动从对话中提炼结构化知识，构建 Markdown wiki 和可视化知识图谱
- **技能系统**：支持从 Skill Hub、GitHub 一键安装技能，或通过自然语言对话创建自定义技能
- **工具系统**：内置文件读写、终端、浏览器、定时器、记忆检索、网页搜索等工具，原生支持 MCP 协议
- **多渠道**：Web 控制台、微信、飞书、钉钉、企业微信、QQ、微信公众号、Telegram、Slack、Discord

安装方式支持一行命令安装（Linux/macOS/Windows）、Docker 和桌面客户端（macOS/Windows）。

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [zhayujie/chatgpt-on-wechat](https://github.com/zhayujie/chatgpt-on-wechat) |
| 官方网站 | [cowagent.ai](https://cowagent.ai) |
| 文档 | [docs.cowagent.ai](https://docs.cowagent.ai) |
| 技能市场 | [skills.cowagent.ai](https://skills.cowagent.ai) |

## ModelScope 集成

CowAgent 通过 ModelScope API-Inference 接入 ModelScope 上的开源模型，包括：

- ModelScope 作为模型提供商，支持 Qwen、DeepSeek 等系列的 LLM 对话
- 文生图支持：可通过 ModelScope 调用文生图模型（如 `Qwen/Qwen-Image-2512`）



## 接入流程

在 `config.json` 中配置 ModelScope 作为模型提供商：

```json
{
  "bot_type": "modelscope",
  "model": "Qwen/Qwen3.5-397B-A17B",
  "modelscope_api_key": "your_api_key",
  "modelscope_base_url": "https://api-inference.modelscope.cn/v1/chat/completions",
  "text_to_image": "Qwen/Qwen-Image-2512"
}
```

支持的可选模型包括：`Qwen/Qwen3.5-397B-A17B`、`deepseek-ai/DeepSeek-V4-Flash-0731`、`deepseek-ai/DeepSeek-V4-Pro`、`Qwen/Qwen3.5-27B` 等。更多模型可参考：[ModelScope 推理模型列表](https://www.modelscope.cn/models?filter=inference_type&page=1)

在设置的模型配置中，选择 ModelScope 作为模型提供商，填入 API-Key 即可使用。

![CowAgent 使用 ModelScope 效果图 2](../_resources/cow2.png)

配置完成后即可开始使用。ModelScope 在 CowAgent 中不仅支持 LLM 对话，还支持文生图功能。关于 ModelScope 支持的文生图模型，可参考：[ModelScope 文生图模型列表](https://modelscope.cn/models?filter=inference_type&page=1&tabKey=task&tasks=hotTask:text-to-image-synthesis&type=tasks)

![CowAgent 使用 ModelScope 效果图 1](../_resources/cow1.png)

![CowAgent 使用 ModelScope 效果图 3](../_resources/cow3.png)

此外，CowAgent 还支持标准 Agent 功能，包括任务规划、知识库、技能系统、工具系统等。

如需接入微信、钉钉、QQ 等即时聊天工具，可在通道选项中选择并填入所需字段。以接入钉钉为例，需要填入 Client ID 和 Client Secret。

![CowAgent 使用 ModelScope 效果图 4](../_resources/cow4.png)

CowAgent 同时支持 Skills 技能管理。在技能选项中可查看、启用或禁用 Agent 工具和技能，也可点击右上角的「探索技能广场」发现和安装新的技能。

![CowAgent 使用 ModelScope 效果图 5](../_resources/cow5.png)