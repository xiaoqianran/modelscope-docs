<!-- modelscope-docs: MCP Plaza Introduction | mcp/intro/intro_EN.md -->

**Welcome to ModelScope MCP Plaza!**

Model Context Protocol (MCP, hereinafter referred to as MCP) is an open-source protocol launched by Anthropic in November 2024 that establishes standards for connecting large language models to different data sources and tools. Through MCP, large models can connect to various tool applications through unified interfaces. This has led to increasing participation of software and tool manufacturers in building the MCP service (MCP Server) ecosystem, packaging their product capabilities as MCP services for AI models to use. The emergence of MCP has significantly lowered the threshold for large models to call external massive tools, software, and interfaces. As an open-source model community, we believe that MCP's appearance can better expand the capability boundaries of open-source models and help developers achieve better implementation of model capabilities in different specific scenarios. The ModelScope community actively embraces the construction of the MCP open-source ecosystem and launches the ModelScope MCP Plaza. Everyone is welcome to join in the fun.

**ModelScope MCP Plaza: Massive Resources, Simple and Easy to Use, Service Hosting**

The ModelScope MCP Plaza provides a place for aggregation and display of massive high-quality MCP services and related implementations. In addition to providing a display platform for numerous MCP servers, we also offer detailed instructions and debugging tools, as well as simple-to-get-started tutorials to help developers quickly achieve combined development of MCP and large models. Meanwhile, based on the elastic cloud resources provided by the ModelScope platform, we also provide remote hosting service capabilities for top-quality MCP services, making it convenient to directly obtain MCP capabilities in different development environments, further lowering the threshold for getting started.

We believe that the numerous open-source models on ModelScope, along with service-oriented API-Inference components around open-source models, can generate more innovative sparks through combination with the MCP ecosystem, making more technological and application innovations possible.

# Feature Overview

## Homepage

The homepage is the portal of [ModelScope MCP Plaza](https://modelscope.cn/mcp), where you can discover official MCP playgrounds and other recommended content recommended by the community, as well as massive MCP services.

![image.png](./_resources/homepage.png)

On the MCP Plaza homepage, you can discover various categorized MCP services, covering browser automation, search tools, communication and collaboration tools, developer tools, and many other types. You can also experience the chemical effects produced by combining large models with different MCP services through the MCP playground entrance. On the model plaza, you can quickly find platform-hosted MCP services that support SSE connections by filtering with the "Hosted" label. Hosted services verified by the platform will be marked with a "Verified" identifier.
![image.png](./_resources/hosted_verified_homepage.jpg)

## MCP Services

MCP services are the core distributed resources of the ModelScope Plaza, carried through MCP service detail pages. Users can access specific MCP service detail pages by clicking on specific MCP services distributed on the homepage or directly accessing them via links.

MCP service detail pages include three main functions: "View", "Connect", and "Tool Testing". All MCP services distributed on the plaza, regardless of whether they are hosted, can be viewed and understood for basic information on the service detail page: including name, introduction, author, usage introduction, and Github repository address.

![image.png](./_resources/Amaps_service.png)

For ModelScope hosted services, you can also connect to the service and obtain your exclusive SSE URL address after filling in necessary environment variables (such as KEY or TOKEN information that the service may require).
<div style="background: #FFF3D5; padding: 10px; border-radius: 5px; border-left: 3px solid #FFB800;">
⚠️ Please note: The SSE URL of Hosted MCP services is your exclusive connection address and is sensitive information. Please do not leak it externally!
</div>
<br>

![image.png](./_resources/Amaps_service_conn.png)

On the tool page, you can view all the tool content included in the service.

![image.png](./_resources/tools_list.png)

For platform hosted services, you can also use the debugging tools provided by the platform to test interfaces after connecting to the service.

![image.png](./_resources/tools_test.png)

### Usage Limitations
When using the remote hosting service capabilities provided by the MCP Plaza, your MCP service will run in a user-level isolated service environment. The usage rights and corresponding usage responsibilities of this runtime environment belong to the individual user.

## ModelScope MCP Playground

To facilitate community users in quickly experiencing large model calls to MCP services in practical scenarios, we provide the [ModelScope MCP Playground](https://modelscope.cn/mcp/playground) as an official experience MCP client (MCP Client).

### Experiencing Default Configured MCP Services

The ModelScope MCP Playground is built based on ModelScope Studios and comes pre-configured with multiple MCP services by default: "Time Service (modelcontextprotocol/time)", "ArXiv MCP Server (blazickjp/arxiv-mcp-server)", and others.

![image.png](./_resources/playground_default.png)

You can directly click on example prompts to experience or customize input prompts to start experiencing.

![image.png](./_resources/playground_chat.png)

### Experiencing Other Hosted MCP Services

For other platform Hosted MCP services, you only need to copy the SSE URL configuration information after correctly configuring environment variables on the service detail page, paste it into the playground configuration interface, and save it to go to the "Playground" conversation interface for experience. Here's an example of adding the "Tavily Smart Search" MCP service:
- Find the Tavily Smart Search service on the MCP Plaza.
- According to the "Service Details" guide, go to the Tavily official website to obtain an API Key.
- Enter the API Key on the Tavily Smart Search service detail page and click Connect. Wait a moment to obtain the SSE connection configuration information.
![image.png](./_resources/Tavily_server_detail.png)
- Copy the SSE configuration information, go to the ModelScope MCP Playground configuration interface to add the MCP service, and save the configuration.
![image.png](./_resources/playground_config.png)
- Go to the ModelScope MCP Playground interface to start the conversation experience.
![image.png](./_resources/playground_chat_addnew.jpg)

When using the ModelScope MCP Playground online, only Hosted MCP Servers are currently supported for configuration. For more usage and configuration support, please go to the MCP Playground configuration interface to view. You can also download this studio to your local environment for experience or secondary development.

# Feedback and Q&A

If you encounter any problems during the use of MCP Plaza features, or have any suggestions and ideas, please feel free to contact us anytime:

*   ModelScope Developer Group (DingTalk group number 44837352)<br>
<img src="https://modelscope-docs-dev.oss-cn-hangzhou.aliyuncs.com/static/dingding.png"  alt=' ModelScope Developer Group' width="200px"/>
<br>

*   Contact email: contact@modelscope.cn
*   WeChat Official Account: ModelScope Community

We look forward to your messages and working together to build the MCP service ecosystem for AI large models.