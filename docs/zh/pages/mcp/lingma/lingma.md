<!-- modelscope-docs: 通义灵码集成 | mcp/lingma/lingma_CN.md -->

为了方便社区用户更好地使用ModelScope提供的MCP服务，ModelScope MCP广场可以通过 [OpenAPI](https://modelscope.cn/docs/openapi) 接口被广泛的集成。通义灵码是基于通义大模型的 AI 研发辅助工具，现已支持扩展使用 MCP 并全面集成 ModelScope MCP 广场。本文介绍如何在通义灵码中使用 ModelScope MCP 服务。

# 0. 前置依赖
通义灵码兼容 Visual Studio Code、Visual Studio、JetBrains IDEs 等主流编程工具，
可请参考[通义灵码安装教程](https://lingma.aliyun.com/download)，在您的编程工具中安装 **2.5.0 版本及以上** 通义灵码插件（Lingma - Alibaba Cloud AI Coding Assistant）。

本文以Visual Studio Code为例，在Visual Studio Code中安装了2.5.0版本的通义灵码插件。

# 1. 在通义灵码中添加 ModelScope MCP 服务
在通义灵码中添加MCP服务有两种方式：
- 通过通义灵码内置 MCP 广场添加
- 通过手动的方式完成添加

添加成功后，可在 **我的服务** 页面，查看MCP服务列表。

## 1.1 通过通义灵码内置的 MCP 广场完成添加
通义灵码内置的MCP广场集成了魔搭社区全量 MCP 服务，您可以浏览推荐列出的 MCP 服务或通过搜索发现感兴趣的 MCP 服务后，点击 **安装** 来完成添加。

a. 单击通义灵码欢迎语中的 **MCP 工具** 链接，或在右上角头像处进入 **个人设置 > MCP 服务** 页面。
   > **说明**：MCP 添加后，可跨本地工程和 IDE 使用。

   <img src="./_resources/tianjia1.png"  />


b. 单击 **MCP 广场** 标签，进入 **MCP 广场** 标签页，在这里您可以看到灵码官方推荐的 MCP 服务列表，也可以搜索您需要的MCP服务。
   - 滑到页面最下方，点击 **查看更多** ，可以看到魔搭社区提供的全部 MCP 服务。
   - 选定您所需的 MCP 服务，单击 **安装** ，后台会自动完成一键安装。

   > **注意**：部分 MCP Server 在安装时需要您额外提供环境变量（如 `API_KEY` 或 `ACCESS_TOKEN`）。

c. 安装完成后，返回 **我的服务** 页面，即可看到新安装的服务。图标显示为  
   ![连接成功](./_resources/lianjieicon.png)，表示连接成功且可正常使用。
   - 单击条形框，展开详情，可以看到 MCP 提供的工具列表。

   > **提示**：如果命令所依赖的环境缺失，会显示服务启动异常，请手动安装所需依赖。请参见 [常见问题](https://help.aliyun.com/zh/lingma/user-guide/guide-for-using-mcp?spm=a2c4g.11186623.help-menu-2804669.d_2_2_7.623a689fRlScC6&scm=20140722.H_2877058._.OR_help-T_cn~zh-V_1#NHRht)

   <img src="./_resources/tianjia2.png"  />

## 1.2 通过手动的方式完成添加
ModelScope通过 [MCP广场](https://www.modelscope.cn/mcp) 为广大开发者提供了海量的MCP服务，其中带有Hosted标签的MCP服务，已在ModelScope平台上实现云端托管，可供不同 MCP 客户端直接集成使用。
您可以在ModelScope MCP广场 发现、了解 感兴趣MCP服务，通过手动的方式添加到通义灵码中。

a. 在 ModelScope的  MCP广场 发现 MCP 服务
> 如果您已经在ModelScope MCP广场完成了感兴趣MCP服务的发现与选择，可跳过此节。



<img src="./_resources/mcp_homepage.png"  />



- 您可以详细阅读选中的 MCP 服务详情，了解MCP服务的主要功能并获取本地可用的 STDIO 配置

- 对于带有 Hosted 标签的 MCP 服务，您还可以根据服务详情页指引、填写必要的环境变量后进行连接，实现 MCP 服务在魔搭的托管，然后您可以获取托管MCP服务的 SSE 配置，并前往通义灵码手动添加。

b. 在通义灵码 **MCP 服务** 页面右上角单击 “+” 选择以下方式完成添加：

   - **手工添加**：
     - **STDIO 类型**：填写名称、命令、参数和环境变量（选填）。
     - **SSE 类型**：填写名称和服务地址。
   - **配置文件添加**：
     - 在 JSON 配置文件中增加服务对应的 JSON 配置信息。


c. 添加完成后，返回 我的服务 页面，即可看到新安装的服务。图标显示为  
   ![连接成功](./_resources/lianjieicon.png)，表示连接成功且可正常使用。
   - 展开详情，可以看到 MCP 提供的工具列表。

 <img src="./_resources/tianjia3.png"  />




# 2 在通义灵码中使用我的 MCP 工具

## 2.1 在智能会话中使用
在通义灵码的 **智能会话** 界面，切换至 **智能体** 模式，即可使用已添加的MCP工具。通义灵码会根据用户输入的提示词，结合 MCP 工具的名字及描述，自动判断所需调用的 MCP 工具，并将工具返回的结果输入下一步的处理流程中。

a. **输入提示词**
   - 在 IDE 的对话框中切换为智能体模式，并在对话框中输入如下提示词。
   <img src="./_resources/shiyong1.png" />

b. **执行工具**
   - 当通义灵码需要调用 MCP 工具时，系统会出现提示，等您确认后将继续操作。
   <img src="./_resources/shiyong2.png" />

c. **查看工具执行结果**
   - 工具执行完成后，通义灵码的交互窗口将显示执行结果。
   - 可展开查看 MCP 工具的详细输入与输出信息，便于进一步分析和操作。
   <img src="./_resources/shiyong3.png" />

d. **代码审查与采纳**
   - 问答交互完成后，您可审查并采纳最终的代码生成。
   <img src="./_resources/shiyong4.png" />

**⚠️ 重要说明**

- 通义灵码允许同时连接最多 **10 个 MCP 服务**。
- 在通义灵码中可基于大模型使用MCP服务，并需切换至 **智能体模式**。

## 2.2 实际场景使用示例


### 场景一：使用远端 MCP 抓取网页内容
在本示例中，从魔搭社区的 [MCP 广场 ](https://www.modelscope.cn/mcp/servers/@modelcontextprotocol/fetch)选用  [Fetch 网页内容抓取 ](https://www.modelscope.cn/mcp/servers/@modelcontextprotocol/fetch)MCP
，并添加至通义灵码中，体验使用远端MCP抓取任意网页内容的能力。


提示词：

```
帮我总结这篇文档的内容：https://help.aliyun.com/zh/lingma/developer-reference/listkbfiles-get-the-list-of-knowledge-base-files

```
<img src="./_resources/fetchcase1.png"  />

```
基于API文档生成调用示例代码：https://help.aliyun.com/zh/lingma/developer-reference/listkbfiles-get-the-list-of-knowledge-base-files
```
<img src="./_resources/fetchcase2.png"  />

### 场景二：使用本地 MCP 查询城市天气

在本示例中，将[ 天气MCP工具 ](https://www.modelscope.cn/mcp/servers/@le-yo/weather-mcp)添加至通义灵码，体验使用本地MCP查询城市天气的能力。  

配置信息：
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
提示词：
```
帮我查询美国旧金山的天气
```
<img src="./_resources/tianqicase1.png"  />

```
明天美国有天气预警吗？
```
<img src="./_resources/tianqicase2.png"  />