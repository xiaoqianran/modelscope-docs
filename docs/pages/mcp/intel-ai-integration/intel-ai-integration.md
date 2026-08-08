<!-- modelscope-docs: Intel AI Assistant Builder Integration | mcp/intel-ai-integration/intel-ai-integration_EN.md -->

To facilitate community users in better utilizing the MCP services provided by ModelScope, the ModelScope MCP Plaza can be widely integrated through the [OpenAPI](https://modelscope.cn/docs/openapi) interface. [Intel AI Assistant Builder](https://aibuilder.intel.com/) has integrated the ModelScope MCP Plaza. This article introduces how to quickly use ModelScope MCP services in Intel AI Assistant Builder.

# 1. Prerequisites
Open the [Intel AI Assistant Builder](https://aibuilder.intel.com/) (referred to as AI Builder) official website and download the installation package. After downloading is complete, find and open the downloaded installer, and the system will guide you through the remaining steps via the installation wizard.
<div>
<img src='./_resources/superbuilder-super-agent-mcp.png' alt='setting' width='400'  class='center'/>
</div>

**Note**:
- Intel® AI Assistant Builder requires devices to be equipped with at least an **Intel® Core™ Ultra series processor**. For detailed system requirements and usage instructions, please refer to: [User Guide](https://modelscope.cn/learn/2010).
- Starting from **version v2.2.0**, Intel® AI Assistant Builder began supporting the creation of MCP Super Agents. Please ensure that you have installed version **2.2.0 or higher**.



# 2. Configuring MCP Services in Intel AI Builder

Find the "☁️" icon in the sidebar of the AI Builder software and click it to jump to the MCP Marketplace. Select the MCP service you are interested in and click "Install" to complete the MCP service installation.


For example, if you want to use the **12306-mcp** MCP service, click "Install" and the backend will automatically complete the MCP service installation for you.
<div>
<img src='./_resources/superbuilder-install.png' alt='setting' width='400'  class='center'/>
</div>
Installed MCP server information can be viewed in the MCP Manager.
<div>
<img src='./_resources/superbuilder-mcp-edit.png' alt='setting' width='400'  class='center'/>
</div>


# 2. Using MCP Servers in Intel AI Builder

## 2.1 Creating an MCP Assistant

Click the bottommost icon in the sidebar to enter the AI Builder management interface, click **Add Assistant**, fill in "MCP Assistant Name", "Description", and "System Prompt", and add the MCP servers that have been configured in the previous step. Click **Save** to complete the creation of the MCP Assistant.

<div>
<img src='./_resources/superbuilder-manager.jpg' alt='setting' width='400'  class='center'/>
</div>


<div>
<img src='./_resources/superbuilder-mcp-edit.png' alt='setting' width='400'  class='center'/>
</div>




## 2.2 Calling the MCP Assistant
After the MCP Assistant is created, return to the "Q&A Interface". You can experience calling MCP services to complete tasks in your own **Super Agent(MCP)**.
<div>
<img src='./_resources/superbuilder-demo.jpg' alt='setting' width='400'  class='center'/>
</div>


## Disclaimer

This document is solely for providing technical reference for Intel® AI Assistant Builder and ModelScope MCP services and does not constitute any express or implied warranties.
For complete legal terms, please refer to: [Intel AI Assistant Builder Disclaimer](https://modelscope.cn/learn/2525).