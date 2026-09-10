<!-- modelscope-docs: AgentHub | agent/agent-hub/agent-hub_CN.md -->

欢迎来到 ModelScope AgentHub！AgentHub 是魔搭社区「智能工坊」的核心组成部分，与 Skills 中心、MCP 广场共同构成面向 AI Agent 开发者与用户的一站式资源平台。AgentHub 专注于为社区开发者提供**发现、使用、分享、交流不同 Agent 框架的领域/专家 Agent 模板**的服务，帮助你快速找到合适的 Agent 解决具体问题，或将自己构建的 Agent 分享给社区。

> 💡 **智能工坊** = AgentHub + Skills 中心 + MCP 广场。三者提供的 Agent、Skills、MCP 均可前往 [Agent 实验场](https://modelscope.cn/docs/agents/playground) 在线试用，也可导出到本地集成使用。

## 功能概览

### 首页：发现与探索

进入 [modelscope.cn/agents](https://modelscope.cn/agents) 即可看到 AgentHub 首页。页面顶部展示平台当前收录的 Agent 总数与分类筛选入口；下方以卡片形式呈现热门和最新发布的 Agent，每张卡片包含名称、简介、所属框架、查看量、点赞量、下载量等关键信息，方便快速浏览与筛选。

![AgentHub 首页](../_resources/01-agenthub-hero.png)

支持按**框架**（MS-Agent、QwenPaw 等）、**任务类型**、**热度**等多维度过滤；也可通过顶部搜索框按关键词检索 Agent。

### Agent 详情页：了解与获取

点击任意 Agent 卡片进入详情页。详情页完整展示该 Agent模板 的能力说明、使用示例、依赖要求、作者信息及版本历史，并提供一键复制的下载命令，帮助开发者在本地快速拉起 Agent模板。

![Agent 详情页](../_resources/04-agent-detail.png)

详情页右侧提供的下载命令基于 `modelscope-hub` CLI，可直接将远端 Agent模板 文件拉取到本地工作区：

```bash
pip install --upgrade modelscope-hub
modelscope agent download -r <owner>/<agent-name> --local-dir <本地工作区路径>
```
其中，`<本地工作区路径>` 须指向您本地安装对应框架的工作目录（WorkSpace），当前 MS-Agent WebUI 默认为 `./ms_agent` ，QwenPaw 默认为 `~/.qwenpaw/workspace`，实际须以该项目最新官方文档介绍或您本地实际安装为准。

<!-- 此外，QwenPaw Agent模板下载到本地后，拉起前可能还需要补充其他必要文件。 -->

除了导出到本地，你还可以：
- **前往 Agent 实验场在线试用**：无需本地部署，直接在浏览器中验证 Agent 效果
- **跨框架转换后导入**：基于 MS-Agent 提供的转换能力，将 Agent 转换为其他框架格式后使用（详见下方命令行工具章节）

在 Agent 详情页，您还可以查看 Agent 模板所涉及的全部文件，或前往交流反馈与贡献者及社区用户讨论。如果您上传的 Agent 模板还包括Skills、MCPs 等元素，Agent详情页将会自动触发解析，支持可视化查看 Skills 与 MCPs 列表。


## 命令行工具

AgentHub 提供两套互补的命令行工具，分别覆盖**原始文件传输**与**框架感知的 Agent 管理**两类场景。建议根据需求选择：

| 工具 | 安装方式 | 适用场景 | 核心能力 |
| --- | --- | --- | --- |
| `modelscope-hub`（命令别名 `modelscope`） | `pip install modelscope-hub` | 仅需上传/下载 Agent 仓库中的原始文件 | `agent upload/download/list`（纯文件传输，不感知框架结构） |
| `ms-agent` | `pip install ms-agent` | 需要框架感知的 Agent 管理、跨框架转换、后台同步 | `agent upload/download/watch/convert/status/backups/restore/stop` |

> ⚠️ 请注意：`modelscope-hub` 的 `agent` 子命令只做原始文件搬运，不理解任何 Agent 框架的目录约定；如需在不同框架之间迁移或保持双向同步，请使用 `ms-agent`。

### modelscope-hub：原始文件传输

适合只想把 Agent 仓库当作普通文件存储使用的场景。常用命令：

```bash
# 列出远端 Agent 仓库
modelscope agent list -r <owner>/<agent-name>

# 下载 Agent 仓库中的所有文件到本地
modelscope agent download -r <owner>/<agent-name> --local-dir ./my-agent

# 将本地目录上传为 Agent 仓库
modelscope agent upload -r <owner>/<agent-name> --local-dir ./my-agent
```

详细参数说明请参考 [modelscope_hub GitHub 仓库](https://github.com/modelscope/modelscope_hub)。

### ms-agent：框架感知的 Agent 管理

`ms-agent` 理解主流 Agent 框架（`ms-agent`、`qwenpaw`、`qoder`、`openclaw`、`hermes`、`nanobot`、`openhuman`）的工作区结构，提供更丰富的管理能力。其中 `ms-agent` 与 `qwenpaw` 默认可用，其余框架为实验性支持，需 `export TRY_EXP_FRAMEWORKS=1` 后启用。

#### 上传 / 下载

```bash
# 上传本地 QwenPaw Agent 到远端
ms-agent agent upload -f qwenpaw -r <owner>/<agent-name>

# 下载远端 Agent 到本地 QwenPaw 工作区
ms-agent agent download -f qwenpaw -r <owner>/<agent-name>

# 下载时直接转换为 MS-Agent 格式（QwenPaw → MS-Agent）
ms-agent agent download -f qwenpaw -r <owner>/<agent-name> \
    --target-framework ms-agent
```

#### 跨框架转换（纯本地，无需联网）

在不同 Agent 框架之间迁移时，可使用 `convert` 子命令在本地完成格式转换，跳过默认模板文件并自动备份已存在的目标文件：

```bash
# QwenPaw → MS-Agent
ms-agent agent convert \
    --from-framework qwenpaw \
    --target-framework ms-agent

# MS-Agent → QwenPaw
ms-agent agent convert \
    --from-framework ms-agent \
    --target-framework qwenpaw
```

#### 其他实用子命令

- `ms-agent agent status -f <framework>`：查看本地工作区状态
- `ms-agent agent watch -f <framework> -r <owner>/<agent-name> [--pull]`：后台同步本地变更到远端（默认只推不拉，加 `--pull` 双向同步），用 `ms-agent agent stop` 停止
- `ms-agent agent backups [-f <framework>] [-n <name>]`：列出本地可用备份
- `ms-agent agent restore --from-backup last -f <framework>`：从最近一次备份恢复
- `ms-agent agent list [--owner <user>]`：分页查询远端 Agent 仓库

`convert`、`download`、`watch --pull` 等会改动本地工作区的操作，在写盘前都会自动备份当前状态（可通过 `backups` 查看）；转换或同步结果不满意时，用 `restore` 可随时回滚到任一次备份前的样子，让尝试与迁移没有后顾之忧。

完整参数说明请参考 [ms-agent 命令行文档](https://ms-agent.readthedocs.io/zh-cn/latest/GetStarted/cli.html)。

## 未来规划

- **更多框架支持**：持续扩展支持更多 Agent 框架的上传与管理
- **跨框架互转**：基于 MS-Agent 的 convert 能力，在平台上直接提供跨框架转换与导入体验
- **更丰富的生态联动**：与 Skills 中心、MCP 广场深度打通，让 Agent 能更方便地调用社区资源

## 反馈与答疑

如果在使用过程中遇到问题或有改进建议，欢迎通过以下方式联系我们：

*   ModelScope 开发者群（钉钉群号 44837352）<br>  
<img src="https://modelscope-docs-dev.oss-cn-hangzhou.aliyuncs.com/static/dingding.png"  alt=' ModelScope 开发者群' width="200px"/>
<br>

*   联系邮箱：contact@modelscope.cn
*   微信公众号：魔搭ModelScope社区

我们期待您的反馈！
