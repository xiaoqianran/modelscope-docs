<!-- modelscope-docs: MCP广场简介 | mcp/intro/intro_CN.md -->

**欢迎来到 ModelScope MCP 广场！**

模型上下文协议（Model Context Protocol，以下简称 MCP) 是 Anthropic 于2024年11月推出的开源协议，为大语言模型对接不同数据源和工具建立了标准。通过 MCP，大模型能通过统一的接口和各种工具应用实现对接。这使得越来越多的软件及工具厂商参与到 MCP 服务（MCP Server）生态的建设中，将其产品能力包装为 MCP 服务开放给 AI 模型使用。MCP的出现，极大降低了大模型调用外部海量工具、软件、接口的门槛，作为模型开源社区，我们相信MCP的出现，能够更好的拓展开源模型的能力边界，帮助广大开发者实现模型能力在不同具体场景上更好的落地。ModelScope社区也积极拥抱MCP开源生态的建设，推出ModelScope  MCP 广场，欢迎大家一起来玩。

**ModelScope MCP 广场：海量资源、简单易用、服务托管**

ModelScope MCP广场为海量的优质MCP服务以及周边实现，提供了汇聚与展示的场所。在为众多MCP server提供展示平台之外，我们还提供了详细的说明和调试工具，以及简单易上手的教程，来帮助广大开发者迅速实现MCP与大模型的结合开发。同时，基于ModelScope平台提供的弹性云资源，我们也为头部的优质MCP服务，提供了远程托管的服务能力，方便在不同开发环境上，直接获取MCP的能力，进一步降低上手门槛。

我们相信 ModelScope 上众多的开源模型，以及围绕开源模型的服务化 API-Inference 等组件，能通过与 MCP 生态的组合，碰撞出更多的创新火花，使得更多的技术和应用创新成为可能。 

# 功能概览

## 首页

首页是 [ModelScope MCP 广场](https://modelscope.cn/mcp) 的门户，在这里您可以发现社区为您推荐的官方 MCP 实验场等推荐内容以及海量 MCP 服务。

![image.png](./_resources/homepage.png)

在MCP广场首页你可以发现多种多样的分类别的MCP服务，涵盖浏览器自动化、搜索工具、交流协作工具、开发者工具等等多种种类。同时也可以通过MCP实验场的入口，体验大模型和不同MCP服务结合产生的化学效应。在模型广场通过 “Hosted” 标签筛选，就可快速找到平台托管的支持 SSE 连接的 MCP 服务，其中通过平台验证的 Hosted 服务将会被打上“已验证”标识。
![image.png](./_resources/hosted_verified_homepage.jpg)

##  MCP 服务

MCP 服务是 ModelScope 广场分发的核心资源，其通过MCP 服务详情页承载。用户可以通过点击首页分发的具体 MCP 服务或直接通过链接访问指定 MCP 服务的详情页。

MCP 服务详情页包括“查看”、“连接”、“工具测试”三个主要功能。所有在广场分发的 MCP 服务，无论是否托管，均可以在服务详情页查看了解基础信息：包括名称、简介、作者、用法介绍及 Github 仓库地址。

![image.png](./_resources/Amaps_service.png)

对于 ModelScope 托管的 hosted 服务，您还可以在填写必要的环境变量（比如服务可能需要的KEY或TOKEN等信息）后，连接服务、获得您专属的 SSE 链接地址 URL。
<div style="background: #FFF3D5; padding: 10px; border-radius: 5px; border-left: 3px solid #FFB800;">
⚠️ 请注意：Hosted MCP 服务的 SSE URL是为您分配的专属连接地址，为敏感信息，请勿对外泄漏！
</div>
<br>

![image.png](./_resources/Amaps_service_conn.png)

在工具页面，您可以查看该服务所包含的全部工具内容。

![image.png](./_resources/tools_list.png)

对于平台 hosted 服务，您还可以在连接服务后使用平台提供的调试工具测试接口。

![image.png](./_resources/tools_test.png)

### 使用限制
使用MCP广场提供的远程托管服务能力时，您的MCP服务将运行于用户级别隔离的服务环境中，该运行环境的使用权与对应使用责任归属于用户个人 。

## ModelScope MCP实验场

为了方便社区用户快速地在实际场景中体验通过大模型调用 MCP 服务，我们为您提供了 [ModelScope MCP 实验场](https://modelscope.cn/mcp/playground)作为官方体验 MCP 客户端（MCP Client）。

### 体验默认配置的 MCP 服务

ModelScope MCP 实验场基于魔搭创空间搭建，默认为您配置了“时间服务（modelcontextprotocol/time）”、“ArXiv MCP 服务器（blazickjp/arxiv-mcp-server）”等多个MCP服务。

![image.png](./_resources/playground_default.png)

您可以直接点击示例提示词体验或自定义输入提示词开始体验。

![image.png](./_resources/playground_chat.png)

### 体验其他 Hosted MCP服务

对于其他平台 Hosted MCP服务，只需要在服务详情页复制已经正确配置环境变量后的 SSE URL 配置信息，并粘贴在实验场的配置界面中并保存，即可前往“实验场”对话界面体验。这里以添加“Tavily智搜”MCP服务为例：
- 在 MCP 广场找到 Tavily 智搜服务。
- 根据“服务详情”指引，前往Tavily官网获取 API Key。
- 在 Tavily智搜 服务详情页输入 API Key，并点击连接。稍等片刻即可获取SSE连接配置信息。
![image.png](./_resources/Tavily_server_detail.png)
- 复制SSE配置信息，前往 ModelScope MCP 实验场配置界面添加 MCP 服务，并保存配置。
![image.png](./_resources/playground_config.png)
- 前往 ModelScope MCP 实验场界面开始对话体验。
![image.png](./_resources/playground_chat_addnew.jpg)

ModelScope MCP实验场在线使用时，当前仅支持配置Hosted MCP Server。更多使用及配置支持，可前往MCP实验场配置界面查看。您也可以将该创空间下载到本地环境体验或二次开发。

# 反馈与答疑

如果您在使用 MCP 广场功能过程中遇到任何问题，或者有任何建议和想法，欢迎随时联系我们：

*   ModelScope 开发者群（钉钉群号 44837352）<br>  
<img src="https://modelscope-docs-dev.oss-cn-hangzhou.aliyuncs.com/static/dingding.png"  alt=' ModelScope 开发者群' width="200px"/>
<br>

*   联系邮箱：contact@modelscope.cn
*   微信公众号：魔搭ModelScope社区
    
我们期待您的留言，一起为 AI 大模型共建 MCP 服务生态。