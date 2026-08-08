<!-- modelscope-docs: ModelScope MCP Server OAuth Configuration | mcp/ms-mcp-oauth/ms-mcp-oauth_EN.md -->

# ModelScope MCP Server OAuth Configuration

Welcome to [ModelScope MCP Server](https://www.modelscope.ai/mcp/servers/@modelscope/modelscope-mcp-server)! Your AI assistant can securely and efficiently connect to ModelScope's rich resources, including models, datasets, and Creative Spaces (coming soon), through OAuth.

---

## Client Configuration Guide

### ✅ Cursor

In Cursor's settings (`Settings > MCP` or `cursor.json`), add the following configuration:

```json
{
  "mcpServers": {
    "mcp-server-sse": {
      "url": "https://www.modelscope.ai/mcp-server"
    }
  }
}
```

> ⚠️ Cursor uses SSE (Server-Sent Events) protocol by default, so you don't need to explicitly specify the `type`.

---

### ✅ Cherry Studio

In Cherry Studio's MCP settings, use the following configuration:

```json
{
  "mcpServers": {
    "mcp-server-sse": {
      "type": "sse",
      "url": "https://www.modelscope.ai/mcp-server"
    }
  }
}
```

> 🔔 Note: Cherry Studio requires explicitly declaring `"type": "sse"`.

---

### ✅ MCP Inspector (Debugging Tool)

If you're using [MCP Inspector](https://github.com/modelcontextprotocol/inspector) for debugging, simply specify the server URL when launching:

```bash
mcp-inspector --server-url https://www.modelscope.ai/mcp-server
```

Or include the same address in your configuration file.

---

## Feature Description

After configuration and authorization, your AI assistant will have the following capabilities:

| Feature | Description |
|------|------|
| **Model Discovery** | Find the most suitable models based on task type, framework, language, and other criteria |
| **Dataset Discovery** | Browse high-quality datasets with filtering by domain and scale |
| **Search and Deploy MCP** | Find and deploy MCP services with support for elastic scaling and low-latency calls |
| **Creative Spaces Application Invocation (Coming Soon)** | Directly run or create AI applications on ModelScope (e.g., image generation, speech recognition, etc.) |
---

## Security and Authorization

- All requests are transmitted via HTTPS encryption.
- On first connection, the client will guide you through OAuth authorization (redirecting to the ModelScope login page).

---

> 🚀 Configure your AI client now and embark on your ModelScope intelligence enhancement journey!