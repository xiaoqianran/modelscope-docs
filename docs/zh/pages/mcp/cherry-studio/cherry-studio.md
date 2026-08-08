<!-- modelscope-docs: Cherry Studio集成 | mcp/cherry-studio/cherry-studio_CN.md -->

为了方便社区用户更好地使用ModelScope提供的MCP服务，ModelScope MCP广场可以通过 [OpenAPI](https://modelscope.cn/docs/openapi) 接口被广泛的集成。我们与包括Cherry Studio在内的头部MCP客户端，实现了无缝对接。本文介绍如何快速在 Cherry Studio 中使用 ModelScope MCP服务。

# 0. 前置依赖

请首先安装 1.2.9 版本及以上的 **[Cherry Studio 客户端](https://cherry-ai.com/download)**，并确保已通过配置合适的模型API，能在Cherry Studio里使用模型进行基本对话，具体可参考Cherry Studio的[文档](https://docs.cherry-ai.com/pre-basic/installation)。

# 1. 在Cherry Studio中同步ModelScope MCP服务

在Cherry Studio中启用MCP服务，需要在「设置」中添加可用的MCP服务配置。本节介绍如何在Cherry Studio同步您已经在ModelScope MCP广场托管(Hosted)的MCP服务。您也可以参考Cherry Studio官方提供的[文档](https://docs.cherry-ai.com/advanced-basic/mcp/tian-jia-modelscope-mcp-fu-wu-qi)说明。

### 1.1 在ModelScope 发现，以及实现 MCP 服务的托管

> 如果您已经在ModelScope MCP广场完成了感兴趣MCP服务的发现、选择与托管，可跳过此节。

ModelScope通过 [MCP广场](https://www.modelscope.cn/mcp) 为广大开发者提供了海量的MCP服务。在这里您可以发现、了解感兴趣MCP服务。广场中带有Hosted标签的MCP服务，可以直接在ModelScope平台上实现托管，供包括Cherry-Studio在内的不同客户端直接集成使用。

![image.png](./_resources/mcp_homepage.png)

MCP广场上标记了“Hosted”标签的每个MCP，均可点击进入详情页，进行连接配置。在“通过SSE URL连接服务”模块中，您可以直接点击“连接”，来实现该MCP服务的托管，并获取包含SSE URL的服务配置信息。

![image.png](./_resources/connected_fetch.png)

![image.png](./_resources/hosted_fetch.png)

> Note：请注意，部分MCP服务需要填写环境变量后才可以连接，您可以参阅MCP详情页的介绍，了解如何完成环境变量配置。

连接并托管成功的MCP服务，可直接在[ModelScope MCP实验场](https://modelscope.cn/mcp/playground)，本地开发环境，以及包括[Cherry Studio](https://cherry-ai.com/download)在内的各种客户端使用。

通过Cherry Studio与ModelScope MCP广场的集成，您可以在Cherry Studio中直接获取您在ModelScope上选定并已经服务化托管的MCP，并实现在Cherry-Studio里的**一键同步**。

### 1.2 在Cherry Studio中配置ModelScope MCP的同步

在Cherry Studio启用MCP服务需要在「设置」中添加可用的MCP服务配置。您可以前往“设置-MCP服务器-同步服务器”快速同步ModelScope MCP服务。

![image.png](./_resources/cherrystudio_setting.png)

进入后您可以看到 CherryStudio默认选中 ModelScope 作为 MCP 服务提供商。Cherry Studio 与ModelScope（魔搭） 达成官方合作，只需要简单的输入您的魔搭 API 令牌，即可一键同步您魔搭账号下所有已经配置托管的 MCP 服务配置。如果您此前未使用过ModelScope MCP广场，推荐参考步骤1.1，来选择和托管您的MCP服务。

![image.png](./_resources/cherrystudio_mcp_sync.png)


其中 API 令牌可以通过访问[“魔搭首页-访问令牌”](https://www.modelscope.cn/my/myaccesstoken)页面获取。

![image.png](./_resources/modelscope_api_token.png)

在获取ModelScope API令牌后，粘贴到步骤3的空格中，并点击「同步」按钮。

![image.png](./_resources/mcp_sync_token.png)

可以看到所有您已经配置连接的魔搭Hosted MCP服务，都已经同步在Cherry Studio可用MCP服务器列表中。

![image.png](./_resources/mcp_sync_result.png)

然后您可以愉快地在 Cherry Studio 中体验 AI 助手调用MCP服务完成任务～

### 1.3 增量更新

后续如有在ModelSocpe MCP广场新配置托管或删除托管MCP服务，可继续在“设置-MCP服务器-同步服务器”点击同步进行增量更新。

![image.png](./_resources/mcp_sync_token.png)

# 2. 在Cherry Studio中结合模型与MCP的使用

### 2.1 在对话中启用MCP服务

同步MCP服务后，可以在Cherry Studio客户端AI助手消息输入框看到新增的“MCP服务器”图标。

![image.png](./_resources/cherrystudio_chat_mcp_entrance.png)

点击即可查看，通过之前同步操作已导入到Cherry Studio中，可直接使用的MCP服务列表。可从这个列表中，多选本次对话期望启用的MCP。

![image.png](./_resources/cherrystudio_chat_mcplist.png)

### 2.2 效果示例

以[Fetch网页内容提取 MCP](https://www.modelscope.cn/mcp/servers/@modelcontextprotocol/fetch)为例，可以看到当我们要求 AI 助手获取相关网页信息时，AI助手调用了“Fetch网页内容获取”MCP服务的工具来完成任务。

![image.png](./_resources/cherrystudio_chat_example_fetch.png)

同样的，如果其他MCP已经被启用，也可以被AI助手自由调用。例如以下例子，就展示了使用[高德地图MCP](https://www.modelscope.cn/mcp/servers/@amap/amap-maps) 来完成完成路线规划。

![image.png](./_resources/cherrystudio_chat_example_Alimap.png)