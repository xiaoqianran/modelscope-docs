<!-- modelscope-docs: Cherry Studio Integration | mcp/cherry-studio/cherry-studio_EN.md -->

To facilitate community users in better utilizing the MCP services provided by ModelScope, ModelScope MCP Plaza can be widely integrated through the [OpenAPI](https://modelscope.cn/docs/openapi) interface. We have achieved seamless integration with leading MCP clients, including Cherry Studio. This article introduces how to quickly use ModelScope MCP services in Cherry Studio.

# 0. Prerequisites

Please first install version 1.2.9 or higher of the **[Cherry Studio client](https://cherry-ai.com/download)**, and ensure that you can use models for basic conversations in Cherry Studio by configuring appropriate model APIs. For details, please refer to Cherry Studio's [documentation](https://docs.cherry-ai.com/pre-basic/installation).

# 1. Synchronizing ModelScope MCP Services in Cherry Studio

To enable MCP services in Cherry Studio, you need to add available MCP service configurations in "Settings". This section describes how to synchronize MCP services you have already hosted on the ModelScope MCP Plaza in Cherry Studio. You can also refer to the official Cherry Studio [documentation](https://docs.cherry-ai.com/advanced-basic/mcp/tian-jia-modelscope-mcp-fu-wu-qi) for instructions.

### 1.1 Discovering and Hosting MCP Services on ModelScope

> If you have already completed the discovery, selection, and hosting of interested MCP services on the ModelScope MCP Plaza, you can skip this section.

ModelScope provides a large number of MCP services to developers through the [MCP Plaza](https://www.modelscope.cn/mcp). Here you can discover and learn about MCP services of interest. MCP services marked with the "Hosted" tag in the plaza can be directly hosted on the ModelScope platform for direct integration and use by various clients, including Cherry-Studio.

![image.png](./_resources/mcp_homepage.png)

Each MCP marked with the "Hosted" label on the MCP Plaza can be clicked to enter the details page for connection configuration. In the "Connect to Service via SSE URL" module, you can directly click "Connect" to host the MCP service and obtain service configuration information containing the SSE URL.

![image.png](./_resources/connected_fetch.png)

![image.png](./_resources/hosted_fetch.png)

> Note: Please note that some MCP services require environment variables to be filled in before they can be connected. You can refer to the introduction on the MCP details page to learn how to complete environment variable configuration.

MCP services that have been successfully connected and hosted can be directly used in the [ModelScope MCP Playground](https://modelscope.cn/mcp/playground), local development environments, and various clients including [Cherry Studio](https://cherry-ai.com/download).

Through the integration of Cherry Studio and ModelScope MCP Plaza, you can directly obtain MCP services you have selected and hosted on ModelScope in Cherry Studio, achieving **one-click synchronization** in Cherry-Studio.

### 1.2 Configuring ModelScope MCP Synchronization in Cherry Studio

Enabling MCP services in Cherry Studio requires adding available MCP service configurations in "Settings". You can go to "Settings-MCP Server-Sync Server" to quickly synchronize ModelScope MCP services.

![image.png](./_resources/cherrystudio_setting.png)

After entering, you can see that CherryStudio defaults to selecting ModelScope as the MCP service provider. Cherry Studio and ModelScope (ModelScope) have officially partnered, and you only need to simply input your ModelScope API token to one-click sync all MCP service configurations you have configured and hosted under your ModelScope account. If you have not previously used the ModelScope MCP Plaza, we recommend referring to step 1.1 to select and host your MCP services.

![image.png](./_resources/cherrystudio_mcp_sync.png)

The API token can be obtained by visiting the ["ModelScope Homepage-Access Token"](https://www.modelscope.cn/my/myaccesstoken) page.

![image.png](./_resources/modelscope_api_token.png)

After obtaining the ModelScope API token, paste it into the blank space in step 3 and click the "Sync" button.

![image.png](./_resources/mcp_sync_token.png)

You can see that all ModelScope Hosted MCP services you have configured and connected have been synchronized to the list of available MCP servers in Cherry Studio.

![image.png](./_resources/mcp_sync_result.png)

Then you can enjoy experiencing AI assistants calling MCP services to complete tasks in Cherry Studio~

### 1.3 Incremental Updates

In the future, if you newly configure hosting or delete hosting of MCP services on the ModelScope MCP Plaza, you can continue to click sync in "Settings-MCP Server-Sync Server" for incremental updates.

![image.png](./_resources/mcp_sync_token.png)

# 2. Using Models and MCP Together in Cherry Studio

### 2.1 Enabling MCP Services in Conversations

After synchronizing MCP services, you can see the newly added "MCP Server" icon in the AI assistant message input box of the Cherry Studio client.

![image.png](./_resources/cherrystudio_chat_mcp_entrance.png)

Clicking it will allow you to view the list of MCP services that have been imported into Cherry Studio through previous sync operations and can be used directly. From this list, you can multi-select MCP services expected to be enabled for this conversation.

![image.png](./_resources/cherrystudio_chat_mcplist.png)

### 2.2 Example Results

Taking the [Fetch Web Content Extraction MCP](https://www.modelscope.cn/mcp/servers/@modelcontextprotocol/fetch) as an example, you can see that when we ask the AI assistant to obtain relevant web information, the AI assistant calls the "Fetch Web Content Acquisition" MCP service tool to complete the task.

![image.png](./_resources/cherrystudio_chat_example_fetch.png)

Similarly, if other MCPs have been enabled, they can also be freely called by the AI assistant. For example, the following example demonstrates using [Amap MCP](https://www.modelscope.cn/mcp/servers/@amap/amap-maps) to complete route planning.

![image.png](./_resources/cherrystudio_chat_example_Alimap.png)