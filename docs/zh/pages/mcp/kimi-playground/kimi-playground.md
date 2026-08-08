<!-- modelscope-docs: Kimi Playground集成 | mcp/kimi-playground/kimi-playground_CN.md -->

为了方便社区用户更好地使用ModelScope提供的MCP服务，ModelScope MCP广场可以通过 [OpenAPI](https://modelscope.cn/docs/openapi) 接口被广泛的集成。我们与包括Kimi Playground在内的头部模型应用空间，实现了无缝对接。本文介绍如何快速在 Kimi Playground 中使用 ModelScope MCP服务。

# 0. 前置依赖

登录[Kimi Playground](https://platform.moonshot.cn/playground), 确保可以使用 kimi-k2 等具备工具调用能力的模型进行基本对话。

# 1. 在Kimi Playground 中同步ModelScope MCP服务

在Kimi Playground 中启用MCP服务，需要在「设置」中添加可用的MCP服务配置。本节介绍如何在Kimi Playground 同步您已经在ModelScope MCP广场托管(Hosted)的MCP服务。您也可以参考Kimi Playground官方提供的[文档](https://platform.moonshot.cn/docs/guide/configure-the-modelscope-mcp-server#%E5%9C%A8-kimi-playground-%E4%B8%AD%E9%85%8D%E7%BD%AE-modelscope-mcp-%E5%90%8C%E6%AD%A5)说明。

### 1.1 在ModelScope 发现，以及实现 MCP 服务的托管

> 如果您已经在ModelScope MCP广场完成了感兴趣MCP服务的发现、选择与托管，可跳过此节。

ModelScope通过 [MCP广场](https://www.modelscope.cn/mcp) 为广大开发者提供了海量的MCP服务。在这里您可以发现、了解感兴趣MCP服务。广场中带有Hosted标签的MCP服务，可以直接在ModelScope平台上实现托管，供包括Kimi Playground在内的头部模型应用空间直接集成使用。

![image.png](./_resources/mcp_homepage.png)

MCP广场上标记了“Hosted”标签的每个MCP，均可点击进入详情页，进行连接配置。在“通过SSE URL连接服务”模块中，您可以直接点击“连接”，来实现该MCP服务的托管，并获取包含SSE URL的服务配置信息。

![image.png](./_resources/connected_fetch.png)

![image.png](./_resources/hosted_fetch.png)

> Note：请注意，部分MCP服务需要填写环境变量后才可以连接，您可以参阅MCP详情页的介绍，了解如何完成环境变量配置。

连接并托管成功的MCP服务，可直接在[ModelScope MCP实验场](https://modelscope.cn/mcp/playground)、本地开发环境、[Cherry Studio](https://cherry-ai.com/download)等客户端，以及包括[Kimi Playground](https://platform.moonshot.cn/playground)在内的头部模型应用空间中使用。

通过Kimi Playground与ModelScope MCP广场的集成，您可以在Kimi Playground中直接获取您在ModelScope上选定并已经服务化托管的MCP，并实现在Kimi Playground里的**一键同步**。

### 1.2 在Kimi Playground中配置ModelScope MCP的同步

在Kimi Playground启用MCP服务需要在「设置」中添加可用的MCP服务配置。您可以前往“MCP服务器设置-同步外部平台”快速同步ModelScope MCP服务。

<div>
<img src="./_resources/kimi-mcp-setting.png" alt='setting' width='400'  class='center'/> 
</div>

<div>
<img src="./_resources/kimi-mcp-integration.png" alt='setting' width='600'  class='center'/> 
</div>

进入后您可以看到 Kimi Playground 默认选中 ModelScope 作为外部 MCP 服务提供商。Kimi Playground与ModelScope（魔搭） 达成官方合作，只需要简单的输入您的魔搭 API 访问令牌，即可一键同步您魔搭账号下所有已经配置托管的 MCP 服务配置。如果您此前未使用过ModelScope MCP广场，推荐参考步骤1.1，来选择和托管您的MCP服务。

<div>
<img src="./_resources/kimi-modelscope.png" alt='setting' width='400'  class='center'/> 
</div>

其中 API 令牌可以通过访问[“魔搭首页-访问令牌”](https://www.modelscope.cn/my/myaccesstoken)页面获取。

![image.png](./_resources/modelscope_api_token.png)

在获取ModelScope API令牌后，粘贴到步骤3的空格中，并点击「开始同步」按钮。

<div>
<img src="./_resources/kimi-key.png" alt='setting' width='400'  class='center'/> 
</div>

可以看到所有您已经配置连接的魔搭Hosted MCP服务，都已经同步在Kimi Playground可用MCP服务器列表中。

<div>
<img src="./_resources/kimi-get-mcps.png" alt='setting' width='600'  class='center'/> 
</div>

然后您可以愉快地在 Kimi Playground 中体验 Kimi 各种模型调用MCP服务完成任务～

### 1.3 增量更新

后续如有在ModelSocpe MCP广场新配置托管或删除托管MCP服务，可继续在“设置-MCP服务器-同步服务器”点击同步进行增量更新。

<div>
<img src="./_resources/kimi-update-mcp.png" alt='setting' width='400'  class='center'/> 
</div>

# 2. 在Kimi Playground中结合模型与MCP的使用

### 2.1 在对话中启用MCP服务

同步 MCP 服务后，您将在 Kimi Playground 网页端的 AI 助手消息输入框中看到新增的“MCP 服务器”图标。点击该图标，您可以查看通过之前同步操作已导入的可直接使用的 MCP 服务列表。在该列表中，您可以多选、启用并连接到您希望在本次对话中使用的 MCP 服务。

<div>
<img src="./_resources/kimi-mcp-lists.png" alt='setting' width='400'  class='center'/> 
</div>

### 2.2 效果示例

以[高德地图MCP](https://www.modelscope.cn/mcp/servers/@amap/amap-maps) 为例，您可以在此列表中选择启用相关的 MCP 服务。通过简单对话，您就可以让模型使用高德地图 MCP 来完成路线规划。

![image.png](./_resources/kimi-amap-mcp.png)

轻松get你的Kimi + 高德打造的专属行程助理！ 