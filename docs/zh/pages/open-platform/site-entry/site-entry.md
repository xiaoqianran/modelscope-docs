<!-- modelscope-docs: 站点开放入口 | open-platform/site-entry/site-entry_CN.md -->

站点开放入口是魔搭社区面向 AI 抓取方、Agent、搜索引擎与浏览器提供的机器可读入口，用于在不解析 HTML 的前提下获取站点结构、资源内容与接口定义。本文以国内站（`modelscope.cn`）的线上状态为准。

判断入口是否可用，可查看响应状态码与 `Content-Type`：可用入口返回 `200`，类型为对应格式（`text/plain`、`text/markdown`、`application/json` 或 `application/xml`）。

```bash
curl -sI https://modelscope.cn/llms.txt | grep -iE "^HTTP|content-type"
# HTTP/1.1 200 OK
# Content-Type: text/plain; charset=utf-8
```

## 入口清单

| 入口 | 地址 | 面向 | 说明 | 状态 |
| --- | --- | --- | --- | --- |
| 站点 AI 导航 | <https://modelscope.cn/llms.txt> | AI 抓取方 | 声明站点结构、推荐抓取方式与使用约束 | 已上线 |
| 资源详情 Markdown | `https://modelscope.cn/models/{owner}/{repo_name}.md` 等 | AI 抓取方 | 模型、数据集、创空间、论文详情页的 Markdown 版本 | 已上线 |
| 文档 AI 索引 | <https://modelscope.cn/docs/llms.txt> | AI 抓取方 | 文档中心全部文档的 Markdown 导航 | 开放中 |
| 单篇文档 Markdown | `https://modelscope.cn/docs/{path}.md` | AI 抓取方 | 单篇文档的 Markdown 原文 | 开放中 |
| 文档全文合集 | <https://modelscope.cn/docs/llms-full.txt> | AI 抓取方 | 文档中心全部文档的正文合集 | 开放中 |
| MCP 发现文档 | <https://modelscope.cn/.well-known/mcp.json> | MCP 客户端 | 声明官方 MCP Server 的接入方式与认证要求 | 已上线 |
| 公开 OpenAPI 规范 | <https://modelscope.cn/.well-known/openapi.json> | Agent、第三方应用 | 站点公开接口的 OpenAPI 定义 | 已上线 |
| 抓取规则 | <https://modelscope.cn/robots.txt> | 搜索引擎、AI 爬虫 | 声明允许与禁止抓取的范围及站点地图地址 | 已上线 |
| 站点地图 | <https://modelscope.cn/sitemap.xml> | 搜索引擎 | 页面索引，按产品模块拆分为 7 份子清单 | 已上线 |
| 页面元信息 | 各页面 HTML `<head>` | 搜索引擎、社交平台 | 标题、描述、canonical 与 JSON-LD 结构化数据 | 部分覆盖 |
| 浏览器搜索插件 | <https://modelscope.cn/opensearch.xml> | 浏览器 | 将魔搭添加为浏览器搜索引擎 | 已上线 |

<!-- | 热门实体全集 | `https://modelscope.cn/llms-full.txt` | AI 抓取方 | 热门实体全文合集 | 已关闭 | -->

状态说明：

- **已上线**：返回预期的 `Content-Type`。
- **部分覆盖**：部分页面已配置，其余页面使用站点默认值。
- **开放中**：入口正在逐步上线，上线前访问不返回对应格式。

以上入口文件均可匿名访问；通过 MCP Server 或 OpenAPI 访问账号相关资源时需要凭证，见下文「访问授权」。

## 资源详情 Markdown

模型、数据集、创空间、论文的详情页均提供 Markdown 版本，在详情页地址后追加 `.md` 即可获取：

| 资源类型 | 地址模板 |
| --- | --- |
| 模型 | `https://modelscope.cn/models/{owner}/{repo_name}.md` |
| 数据集 | `https://modelscope.cn/datasets/{owner}/{repo_name}.md` |
| 创空间 | `https://modelscope.cn/studios/{owner}/{repo_name}.md` |
| 论文 | `https://modelscope.cn/papers/{id}.md` |

其中 `{owner}` 为用户名或组织名，`{repo_name}` 为仓库名，`{id}` 为论文 ID。仅公开资源提供 Markdown 版本；资源不存在或未公开时返回 `404`，类型仍为 `text/markdown`，正文附站点入口导航。

## 站点地图

`sitemap.xml` 为索引文件，按产品模块拆分为 7 份子清单：

| 子清单 | 收录范围 |
| --- | --- |
| <https://modelscope.cn/sitemap-pages.xml> | 首页与各产品模块首页 |
| <https://modelscope.cn/sitemap-models.xml> | 模型详情页 |
| <https://modelscope.cn/sitemap-datasets.xml> | 数据集详情页 |
| <https://modelscope.cn/sitemap-studios.xml> | 创空间详情页 |
| <https://modelscope.cn/sitemap-mcp.xml> | MCP 服务详情页 |
| <https://modelscope.cn/sitemap-papers.xml> | 论文详情页 |
| <https://modelscope.cn/sitemap-spotlight.xml> | 开发者实践文章页 |

除 `sitemap-pages.xml` 外，各详情页子清单不全量收录，而是按站内搜索的综合排序，收录热度靠前的若干条内容，单份子清单的条目数量有上限。获取完整的资源列表或进行检索，请使用公开 OpenAPI 或官方 MCP Server。

## 访问授权

魔搭提供两类访问凭证，权限范围不同：

| 凭证 | 获取方式 | 权限范围 | 适用场景 |
| --- | --- | --- | --- |
| 访问令牌 | 登录后在[首页 → 访问令牌](https://modelscope.cn/my/myaccesstoken)创建，有效期由用户指定 | 与账号自身权限一致 | 本人使用的 SDK、Git 与脚本 |
| OAuth 访问令牌 | 第三方应用通过 OAuth 2.0 授权流程，经用户授权后动态签发 | 仅限用户授权的 scope，覆盖范围小于访问令牌 | 代表用户访问资源的第三方应用与 MCP 客户端 |

OAuth 当前支持的 scope 及对应接口见[通过魔搭登录（OAuth）](https://modelscope.cn/docs/accounts/oauth)。未被 scope 覆盖的接口，只能使用访问令牌调用。

### 官方 MCP Server

服务地址为 `https://www.modelscope.cn/mcp-server`，使用 OAuth 访问令牌认证，客户端配置见 [ModelScope MCP Server OAuth 配置](https://modelscope.cn/docs/mcp/ms-mcp-oauth)。

### 公开 OpenAPI

| 项 | 地址 |
| --- | --- |
| 接口站点文档 | [OpenAPI 文档](https://modelscope.cn/docs/openapi) |
| 规范文件（机器可读） | <https://modelscope.cn/.well-known/openapi.json> |
| 统一请求地址 | `https://modelscope.cn/openapi/v1` |

认证方式为 Bearer Token，可携带访问令牌或 OAuth 访问令牌；使用 OAuth 访问令牌时，仅能调用已授权 scope 覆盖的接口。
