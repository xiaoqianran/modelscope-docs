<!-- modelscope-docs: Skills中心简介 | skills/intro/intro_CN.md -->

**欢迎来到 ModelScope Skills 中心！**

## 什么是 Skill
### 本意

**Skill** 即「技能」，指完成某项具体任务所需的方法或能力。

### 技术定义

在 Agent 开发中，**Skill 是一套结构化的能力封装**，让大模型能按需调用外部工具、代码或知识，完成具体任务。

其规范源于 **Anthropic Agent Skills 协议**，核心原则：
> 将「功能说明 + 输入输出定义 + 执行逻辑 + 参考资料」打包为标准文件夹，供智能体发现与执行。

一个 Skill 最少只需一个 `SKILL.md` 文件：

```yaml
---
name: skill_name
description: 一句话说明功能
---

## 使用说明
- 功能：做什么
- 输入：需要什么参数
- 输出：返回什么结果
- 示例：调用代码片段
```

> ✅ 可选扩展：`scripts/`（执行代码）、`resources/`（静态资源）、`reference.md`（详细文档）

**Skill = 标准化描述 + 可执行逻辑 + 上下文管理**，是让大模型从「能聊」到「能做事」的关键组件。

## 如何搜索和发现 Skill

进入魔搭社区 Skills 中心后，你可以通过以下方式找到需要的技能：

**关键词搜索**  
在搜索框输入功能描述，如「天气」「代码执行」「PDF 解析」，系统会匹配技能名称、描述和标签。

**分类筛选**  
按左侧分类栏筛选，常见类别包括：
- 开发工具：代码生成、调试、部署
- 数据处理：格式转换、清洗、分析
- 内容创作：文案、绘图、视频
- 行业应用：医疗、法律、教育、金融
- 通用工具：搜索、计算、翻译

**查看技能卡片**  
每个技能展示名称、简短描述、作者、标签和基础数据。点击名称进入详情页，查看完整说明、输入输出定义和使用示例。

---

## 如何下载和使用 Skill


### 下载 Skill
**方式一：命令行安装（推荐）**

如果技能支持包管理安装，可直接执行：

```bash
# Node.js 环境
npx skills add https://modelscope.cn/skills/<skill-id>

# Bash 执行
curl -fsSL https://modelscope.cn/skills/install.sh | bash -s -- <skill-id>
```

`<skill-id>` 格式为 `@作者/技能名`，可在技能详情页顶部复制。

**方式二：手动下载**

1. 在技能详情页点击「下载」按钮，获取 ZIP 包
2. 解压到本地目录，如 `./skills/weather_query/`
3. 确保目录中包含 `SKILL.md` 文件


### 使用 SKill

**在常见软件中使用 Skill**

## 如何在各类软件中使用 Skill

魔搭 Skills 遵循通用的 Agent Skills 标准协议，本质上是一套「结构化能力包」。只要软件支持加载外部技能或工具，就可以通过以下方式集成使用。

### 核心思路

**把 Skill 当作一个「插件」或「扩展包」**：它包含功能说明、参数定义和执行逻辑，软件只需按规范加载，即可让 AI 调用该能力。

### 通用集成步骤

**1. 获取 Skill 包**
- 从魔搭社区下载 ZIP 包，或通过命令行安装
- 确保本地包含 `SKILL.md` 及必要脚本/资源文件

**2. 放置到软件的技能目录**
- 大多数支持 Skill 的软件都有配置项指定技能加载路径（如 `skills/`、`plugins/`）
- 将 Skill 文件夹放入该目录，或在配置文件中声明路径

**3. 启用并配置**
- 在软件配置中启用该技能（部分软件需手动列出技能名称）
- 如需密钥、端点等参数，按技能说明补充配置

**4. 在对话或工作流中调用**
- 通过自然语言触发（如"帮我查天气"），由软件自动匹配技能
- 或通过命令/指令显式调用（如 `/weather_query city=杭州`）

### 常见软件类型的集成方式

| 软件类型 | 典型集成方式 | 示例 |
|----------|--------------|------|
| **本地 AI 助手** | 配置 `skills_dir` 路径，重启加载 | OpenClaw、CoPaw |
| **IDE 插件** | 在插件设置中添加自定义技能目录 | VS Code、Cursor |
| **聊天机器人** | 通过 webhook 或插件机制接入技能执行逻辑 | 钉钉、飞书机器人 |
| **低代码平台** | 以"自定义工具"形式导入技能配置 | Dify、Flowise |
| **支持 MCP 的平台** | 通过 MCP Server 注册技能端点 | Claude Desktop、其他 MCP 客户端 |

### 关键检查点

- ✅ 软件是否支持加载外部技能/工具（查看文档关键词：`skills`、`tools`、`plugins`、`extensions`）
- ✅ Skill 的 `input_schema` 是否与软件参数传递方式兼容
- ✅ 执行环境是否满足技能依赖（如 Python 版本、网络权限）
- ✅ 是否启用沙箱或权限控制，保障执行安全

**在 ms-agent 中使用**

```python
from ms_agent.agent import create_agent_skill

agent = create_agent_skill(
    skills_dir="./skills/weather_query",  # 本地路径
    # 或引用社区技能
    # skills_dir="@author/skill-name",
    model="Qwen/Qwen3-235B-A22B-Instruct-2507"
)

result = agent.run("杭州今天天气怎么样？")
print(result)
```

**验证技能是否生效**

- 调用 `agent.list_skills()` 查看已加载的技能列表
- 使用 `agent.test_skill("skill_name", **params)` 单独测试某个技能
- 查看日志输出，确认技能是否被正确触发

**注意事项**

- 首次使用建议启用 `use_sandbox=True`，在隔离环境中执行脚本，避免安全风险
- 部分技能依赖第三方 API，需自行配置密钥或网络权限
- 使用前请阅读技能描述中的 `input_schema`，确保参数格式正确
- 如遇问题，可在技能详情页「交流反馈」区留言，或查看作者提供的示例代码