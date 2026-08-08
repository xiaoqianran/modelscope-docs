<!-- modelscope-docs: Kimi Playground Integration | mcp/kimi-playground/kimi-playground_EN.md -->

To facilitate community users in better utilizing the MCP services provided by ModelScope, the ModelScope MCP Plaza can be widely integrated through the [OpenAPI](https://modelscope.cn/docs/openapi) interface. We have achieved seamless integration with leading model application spaces, including Kimi Playground. This article introduces how to quickly use ModelScope MCP services in Kimi Playground.

# 0. Prerequisites

Log in to [Kimi Playground](https://platform.moonshot.cn/playground) and ensure you can use models with tool-calling capabilities such as kimi-k2 for basic conversations.

# 1. Synchronizing ModelScope MCP Services in Kimi Playground

To enable MCP services in Kimi Playground, you need to add available MCP service configurations in "Settings". This section describes how to synchronize MCP services you have already hosted on the ModelScope MCP Plaza in Kimi Playground. You can also refer to the official Kimi Playground [documentation](https://platform.moonshot.cn/docs/guide/configure-the-modelscope-mcp-server#%E5%9C%A8-kimi-playground-%E4%B8%AD%E9%85%8D%E7%BD%AE-modelscope-mcp-%E5%90%8C%E6%AD%A5) for instructions.

### 1.1 Discovering and Hosting MCP Services on ModelScope

> If you have already completed the discovery, selection, and hosting of interested MCP services on the ModelScope MCP Plaza, you can skip this section.

ModelScope provides a large number of MCP services to developers through the [MCP Plaza](https://www.modelscope.cn/mcp). Here you can discover and learn about MCP services of interest. MCP services marked with the "Hosted" label in the plaza can be directly hosted on the ModelScope platform for direct integration and use by leading model application spaces, including Kimi Playground.

![image.png](./_resources/mcp_homepage.png)

Each MCP marked with the "Hosted" label on the MCP Plaza can be clicked to enter the details page for connection configuration. In the "Connect to Service via SSE URL" module, you can directly click "Connect" to host the MCP service and obtain service configuration information containing the SSE URL.

![image.png](./_resources/connected_fetch.png)

![image.png](./_resources/hosted_fetch.png)

> Note: Please note that some MCP services require environment variables to be filled in before they can be connected. You can refer to the introduction on the MCP details page to learn how to complete environment variable configuration.

MCP services that have been successfully connected and hosted can be directly used in the [ModelScope MCP Playground](https://modelscope.cn/mcp/playground), local development environments, [Cherry Studio](https://cherry-ai.com/download) and other clients, as well as leading model application spaces including [Kimi Playground](https://platform.moonshot.cn/playground).

Through the integration of Kimi Playground and ModelScope MCP Plaza, you can directly obtain MCP services you have selected and hosted on ModelScope in Kimi Playground, achieving **one-click synchronization** in Kimi Playground.

### 1.2 Configuring ModelScope MCP Synchronization in Kimi Playground

Enabling MCP services in Kimi Playground requires adding available MCP service configurations in "Settings". You can go to "MCP Server Settings-Synchronize External Platforms" to quickly synchronize ModelScope MCP services.

<div>
<img src='./_resources/kimi-mcp-setting.png' alt='setting' width='400'  class='center'/>
</div>

<div>
<img src='./_resources/kimi-mcp-integration.png' alt='setting' width='600'  class='center'/>
</div>

After entering, you can see that Kimi Playground defaults to selecting ModelScope as the external MCP service provider. Kimi Playground and ModelScope (ModelScope) have officially partnered, and you only need to simply input your ModelScope API access token to one-click sync all MCP service configurations you have configured and hosted under your ModelScope account. If you have not previously used the ModelScope MCP Plaza, we recommend referring to step 1.1 to select and host your MCP services.

<div>
<img src='./_resources/kimi-modelscope.png' alt='setting' width='400'  class='center'/>
</div>

The API token can be obtained by visiting the ["ModelScope Homepage-Access Token"](https://www.modelscope.cn/my/myaccesstoken) page.

![image.png](./_resources/modelscope_api_token.png)

After obtaining the ModelScope API token, paste it into the blank space in step 3 and click the "Start Sync" button.

<div>
<img src='./_resources/kimi-key.png' alt='setting' width='400'  class='center'/>
</div>

You can see that all ModelScope Hosted MCP services you have configured and connected have been synchronized to the list of available MCP servers in Kimi Playground.

<div>
<img src='./_resources/kimi-get-mcps.png' alt='setting' width='600'  class='center'/>
</div>

Then you can enjoy experiencing Kimi's various models calling MCP services to complete tasks in Kimi Playground~

### 1.3 Incremental Updates

In the future, if you newly configure hosting or delete hosting of MCP services on the ModelScope MCP Plaza, you can continue to click sync in "Settings-MCP Server-Sync Server" for incremental updates.

<div>
<img src='./_resources/kimi-update-mcp.png' alt='setting' width='400'  class='center'/>
</div>

# 2. Using Models and MCP Together in Kimi Playground

### 2.1 Enabling MCP Services in Conversations

After synchronizing MCP services, you will see the newly added "MCP Server" icon in the AI assistant message input box on the Kimi Playground web end. Clicking this icon allows you to view the list of MCP services that have been imported through previous sync operations and can be used directly. In this list, you can multi-select, enable, and connect to the MCP services you wish to use in this conversation.

<div>
<img src='./_resources/kimi-mcp-lists.png' alt='setting' width='400'  class='center'/>
</div>

### 2.2 Example Results

Taking [Amap MCP](https://www.modelscope.cn/mcp/servers/@amap/amap-maps) as an example, you can select and enable related MCP services in this list. Through simple conversations, you can have the model use Amap MCP to complete route planning.

![image.png](./_resources/kimi-amap-mcp.png)

Easily get your Kimi + Amap customized travel assistant!