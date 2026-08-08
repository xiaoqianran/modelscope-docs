<!-- modelscope-docs: ModelScope MCP Server OAuth 配置 | mcp/ms-mcp-oauth/ms-mcp-oauth_CN.md -->

# ModelScope MCP Server OAuth 配置

欢迎使用 [ModelScope MCP Server](https://www.modelscope.cn/mcp/servers/@modelscope/modelscope-mcp-server) ！您的 AI 助手可以通过OAuth安全、高效地连接到 ModelScope 平台上的模型、数据集、创空间（即将推出）等丰富资源。

---

## 客户端配置指南

### ✅ Cursor

在 Cursor 的设置中（`Settings > MCP` 或 `cursor.json`），添加如下配置：

```json
{
  "mcpServers": {
    "mcp-server-sse": {
      "url": "https://www.modelscope.cn/mcp-server"
    }
  }
}
```

> ⚠️ Cursor 默认使用 SSE（Server-Sent Events）协议，无需显式指定 `type`。

---

### ✅ Cherry Studio

在 Cherry Studio 的 MCP 设置中，使用以下配置：

```json
{
  "mcpServers": {
    "mcp-server-sse": {
      "type": "sse",
      "url": "https://www.modelscope.cn/mcp-server"
    }
  }
}
```

> 🔔 注意：Cherry Studio 要求显式声明 `"type": "sse"`。

---

### ✅ MCP Inspector（调试工具）

如果您使用 [MCP Inspector](https://github.com/modelcontextprotocol/inspector) 进行调试，启动时指定服务器 URL 即可：

```bash
mcp-inspector --server-url https://www.modelscope.cn/mcp-server
```

或在配置文件中写入相同地址。

---

## 功能说明

配置并授权后，您的 AI 助手将具备以下能力：

| 功能 | 描述 |
|------|------|
| **模型发现** | 根据任务类型、框架、语言等条件查找最合适的模型 |
| **数据集发现** | 浏览高质量数据集，支持按领域、规模筛选 |
| **搜索并部署MCP** | 查找并部署MCP服务，支持弹性扩缩容与低延迟调用 |
| **创空间应用调用(即将推出)** | 直接运行或创建 ModelScope 上的 AI 应用（如图像生成、语音识别等） |
---

## 安全与授权

- 所有请求均通过 HTTPS 加密传输。
- 首次连接时，客户端将引导您完成 OAuth 授权（跳转至 ModelScope 登录页）。

---

> 🚀 现在就配置您的 AI 客户端，开启 ModelScope 智能增强之旅！