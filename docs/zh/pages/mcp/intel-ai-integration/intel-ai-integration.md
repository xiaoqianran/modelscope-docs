<!-- modelscope-docs: Intel AI Assistant Builder集成 | mcp/intel-ai-integration/intel-ai-integration_CN.md -->

为了方便社区用户更好地使用ModelScope提供的MCP服务，ModelScope MCP广场可以通过 [OpenAPI](https://modelscope.cn/docs/openapi)接口被广泛的集成。[英特尔 AI Assistant Builder](https://aibuilder.intel.com/) 集成了ModelScope MCP广场。本文介绍如何快速在英特尔 AI Assistant Builder 中使用 ModelScope MCP服务。

# 1. 前置依赖
打开 [英特尔 AI Assistant Builder](https://aibuilder.intel.com/) （简称 AI Builder）官网, 下载安装包。下载完成后，找到并打开下载的安装程序，系统将通过安装向导引导您完成后续步骤。
<div>
<img src="./_resources/superbuilder-super-agent-mcp.png" alt='setting' width='400'  class='center'/> 
</div>
 
**注意**: 
- Intel® AI Assistant Builder 要求设备至少搭载 **Intel® Core™ Ultra 系列处理器**，详细系统要求与使用说明请参考：[使用指南](https://modelscope.cn/learn/2010)。  
- 自 **v2.2.0 版本起**，Intel® AI Assistant Builder 开始支持 MCP Super Agent 的创建，请确保您安装的版本为 **2.2.0 或更高**。



# 2. 在英特尔AI Builder中配置MCP服务

在AI Builder软件的侧边栏中找到“☁️”图标，点击即可跳转到MCP Marketplace，选中您感兴趣的MCP服务，点击“Install"，即可完成MCP服务安装。


例如，您想使用 **12306-mcp** 这个MCP服务，点击“Install"，后台会自动帮您完成MCP服务的安装。
<div>
<img src="./_resources/superbuilder-install.png" alt='setting' width='400'  class='center'/> 
</div>
安装完成的MCP服务器信息，可以在MCP Manager中查看。
<div>
<img src="./_resources/superbuilder-mcp-edit.png" alt='setting' width='400'  class='center'/> 
</div>


# 2. 在英特尔 AI Builder中使用MCP服务器

## 2.1 创建MCP助理

点击侧边栏中最下面的图标，进入AI Builder的管理界面，点击**添加助理**， 填写”MCP助理名称”、“描述”和“系统提示词”，并添加在上一步骤中已经配置好的MCP服务器，点击**保存**，即可完成MCP助理的创建。

<div>
<img src="./_resources/superbuilder-manager.jpg" alt='setting' width='400'  class='center'/> 
</div>


<div>
<img src="./_resources/superbuilder-mcp-edit.png" alt='setting' width='400'  class='center'/> 
</div>




## 2.2 调用MCP助理
MCP助理创建完成后，返回至“问答界面”，您可以在自己的 **Super Agent(MCP)** 中，体验调用 MCP 服务完成任务。
<div>
<img src="./_resources/superbuilder-demo.jpg" alt='setting' width='400'  class='center'/> 
</div>


## 免责声明

本文档仅用于提供 Intel® AI Assistant Builder 与 ModelScope MCP 服务的技术参考，不构成任何明示或暗示的担保。
完整法律条款请参阅：[Intel AI Assistant Builder 免责声明](https://modelscope.cn/learn/2525)。