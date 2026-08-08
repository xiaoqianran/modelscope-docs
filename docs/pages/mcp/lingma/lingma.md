<!-- modelscope-docs: Tongyi Lingma Integration | mcp/lingma/lingma_EN.md -->

To facilitate community users in better utilizing the MCP services provided by ModelScope, the ModelScope MCP Plaza can be widely integrated through the [OpenAPI](https://modelscope.cn/docs/openapi) interface. Tongyi Lingma is an AI R&D assistance tool based on the Tongyi large model and now supports extending the use of MCP and fully integrates the ModelScope MCP Plaza. This article introduces how to use ModelScope MCP services in Tongyi Lingma.

# 0. Prerequisites
Tongyi Lingma is compatible with mainstream programming tools such as Visual Studio Code, Visual Studio, and JetBrains IDEs.
Please refer to the [Tongyi Lingma Installation Tutorial](https://lingma.aliyun.com/download) to install **version 2.5.0 or above** of the Tongyi Lingma plugin (Lingma - Alibaba Cloud AI Coding Assistant) in your programming tool.

This article takes Visual Studio Code as an example, installing version 2.5.0 of the Tongyi Lingma plugin in Visual Studio Code.

# 1. Adding ModelScope MCP Services in Tongyi Lingma
There are two ways to add MCP services in Tongyi Lingma:
- Add through the built-in MCP Plaza in Tongyi Lingma
- Complete the addition manually

After successful addition, you can view the MCP service list on the **My Services** page.

## 1.1 Complete Addition Through Tongyi Lingma's Built-in MCP Plaza
Tongyi Lingma's built-in MCP Plaza integrates all MCP services from the ModelScope community. You can browse the recommended listed MCP services or discover services of interest through search, then click **Install** to complete the addition.

a. Click the **MCP Tools** link in the Tongyi Lingma welcome message, or go to the **Personal Settings > MCP Services** page from the profile picture in the upper right corner.
   > **Note**: After MCP is added, it can be used across local projects and IDEs.

   <img src="./_resources/tianjia1.png"  />


b. Click the **MCP Plaza** tab to enter the **MCP Plaza** tab page. Here you can see the list of MCP services recommended by Lingma official, and you can also search for the MCP services you need.
   - Scroll to the bottom of the page and click **View More** to see all MCP services provided by the ModelScope community.
   - Select the MCP service you need and click **Install**. The background will automatically complete the one-click installation.

   > **Note**: Some MCP Servers require you to provide additional environment variables (such as `API_KEY` or `ACCESS_TOKEN`) during installation.

c. After installation is complete, return to the **My Services** page to see the newly installed service. The icon displays as
   ![Connection Successful](./_resources/lianjieicon.png), indicating successful connection and normal operation.
   - Click the bar to expand details and you can see the list of tools provided by MCP.

   > **Tip**: If the environment required by the command is missing, the service startup exception will be displayed. Please manually install the required dependencies. See [FAQ](https://help.aliyun.com/zh/lingma/user-guide/guide-for-using-mcp?spm=a2c4g.11186623.help-menu-2804669.d_2_2_7.623a689fRlScC6&scm=20140722.H_2877058._.OR_help-T_cn~zh-V_1#NHRht)

   <img src="./_resources/tianjia2.png"  />

## 1.2 Complete Addition Manually
ModelScope provides a large number of MCP services to developers through the [MCP Plaza](https://www.modelscope.cn/mcp). MCP services marked with the Hosted label have been cloud-hosted on the ModelScope platform for direct integration and use by different MCP clients.
You can discover and learn about MCP services of interest on the ModelScope MCP Plaza and add them to Tongyi Lingma manually.

a. Discover MCP Services on ModelScope's MCP Plaza
> If you have already completed the discovery and selection of interested MCP services on the ModelScope MCP Plaza, you can skip this section.



<img src="./_resources/mcp_homepage.png"  />



- You can read the details of the selected MCP service in detail to understand the main functions of the MCP service and obtain locally available STDIO configuration

- For MCP services marked with the Hosted label, you can also connect according to the service details page instructions, fill in the necessary environment variables, implement MCP service hosting on ModelScope, then obtain the SSE configuration of the hosted MCP service and go to Tongyi Lingma to add it manually.

b. In the upper right corner of the **MCP Services** page in Tongyi Lingma, click "+" to select the following methods to complete the addition:

   - **Manual Addition**:
     - **STDIO Type**: Fill in name, command, parameters, and environment variables (optional).
     - **SSE Type**: Fill in name and service address.
   - **Configuration File Addition**:
     - Add the JSON configuration information corresponding to the service in the JSON configuration file.


c. After completion, return to the My Services page to see the newly installed service. The icon displays as
   ![Connection Successful](./_resources/lianjieicon.png), indicating successful connection and normal operation.
   - Expand details to see the list of tools provided by MCP.

 <img src="./_resources/tianjia3.png"  />




# 2 Using My MCP Tools in Tongyi Lingma

## 2.1 Using in Intelligent Session
In the **Intelligent Session** interface of Tongyi Lingma, switch to **Agent** mode to use the added MCP tools. Tongyi Lingma will automatically determine the required MCP tools based on the prompts entered by the user, combined with the names and descriptions of the MCP tools, and input the results returned by the tools into the next processing step.

a. **Enter Prompts**
   - Switch to agent mode in the IDE's dialog box and enter the following prompts in the dialog box.
   <img src="./_resources/shiyong1.png" />

b. **Execute Tools**
   - When Tongyi Lingma needs to call MCP tools, the system will show a prompt. After your confirmation, the operation will continue.
   <img src="./_resources/shiyong2.png" />

c. **View Tool Execution Results**
   - After the tool execution is completed, Tongyi Lingma's interaction window will display the execution results.
   - You can expand to view the detailed input and output information of the MCP tools for further analysis and operation.
   <img src="./_resources/shiyong3.png" />

d. **Code Review and Adoption**
   - After the Q&A interaction is completed, you can review and adopt the final code generation.
   <img src="./_resources/shiyong4.png" />

**⚠️ Important Notes**

- Tongyi Lingma allows connecting up to **10 MCP services** simultaneously.
- In Tongyi Lingma, you can use MCP services based on large models and need to switch to **Agent Mode**.

## 2.2 Practical Scenario Usage Examples


### Scenario One: Using Remote MCP to Fetch Web Content
In this example, select [Fetch Web Content Retrieval](https://www.modelscope.cn/mcp/servers/@modelcontextprotocol/fetch) MCP from the [MCP Plaza](https://www.modelscope.cn/mcp/servers/@modelcontextprotocol/fetch) of the ModelScope community,
and add it to Tongyi Lingma to experience the capability of using remote MCP to fetch content from any webpage.


Prompt:

```
Help me summarize the content of this document: https://help.aliyun.com/zh/lingma/developer-reference/listkbfiles-get-the-list-of-knowledge-base-files

```
<img src="./_resources/fetchcase1.png"  />

```
Generate sample code based on the API documentation: https://help.aliyun.com/zh/lingma/developer-reference/listkbfiles-get-the-list-of-knowledge-base-files
```
<img src="./_resources/fetchcase2.png"  />

### Scenario Two: Using Local MCP to Query City Weather

In this example, add the [Weather MCP Tool](https://www.modelscope.cn/mcp/servers/@le-yo/weather-mcp) to Tongyi Lingma to experience the capability of using local MCP to query city weather.

Configuration Information:
```
{
  "mcpServers": {
    "weather": {
      "command": "npx",
        "args": [
            "-y",
            "@h1deya/mcp-server-weather"
        ],
    }
  }
}
```
Prompt:
```
Help me check the weather in San Francisco, USA
```
<img src="./_resources/tianqicase1.png"  />

```
Is there any weather warning in the US tomorrow?
```
<img src="./_resources/tianqicase2.png"  />