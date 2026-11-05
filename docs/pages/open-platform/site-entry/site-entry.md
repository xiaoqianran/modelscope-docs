<!-- modelscope-docs: Site Open Entry Points | open-platform/site-entry/site-entry_EN.md -->

## Overview

Site open entry points are machine-readable entry points that ModelScope provides for AI crawlers, agents, search engines, and browsers. They expose the site structure, resource content, and interface definitions without requiring HTML parsing. This document reflects the live status of the China site (`modelscope.cn`).

To check whether an entry point is available, inspect the response status code and `Content-Type`. An available entry point returns `200` with the corresponding format (`text/plain`, `text/markdown`, `application/json`, or `application/xml`).

```bash
curl -sI https://modelscope.cn/llms.txt | grep -iE "^HTTP|content-type"
# HTTP/1.1 200 OK
# Content-Type: text/plain; charset=utf-8
```

## Entry Point List

| Entry point | URL | Audience | Description | Status |
| --- | --- | --- | --- | --- |
| Site AI navigation | <https://modelscope.cn/llms.txt> | AI crawlers | Declares the site structure, recommended crawling methods, and usage constraints | Live |
| Resource detail Markdown | `https://modelscope.cn/models/{owner}/{repo_name}.md`, etc. | AI crawlers | Markdown version of model, dataset, studio, and paper detail pages | Live |
| Documentation AI index | <https://modelscope.cn/docs/llms.txt> | AI crawlers | Markdown navigation of all documents in the documentation center | Rolling out |
| Single document Markdown | `https://modelscope.cn/docs/{path}.md` | AI crawlers | Original Markdown of a single document | Rolling out |
| Full documentation collection | <https://modelscope.cn/docs/llms-full.txt> | AI crawlers | Full text of all documents in the documentation center | Rolling out |
| MCP discovery document | <https://modelscope.cn/.well-known/mcp.json> | MCP clients | Declares the access method and authentication requirements of the official MCP Server | Live |
| Public OpenAPI specification | <https://modelscope.cn/.well-known/openapi.json> | Agents, third-party applications | OpenAPI definition of the site's public interfaces | Live |
| Crawling rules | <https://modelscope.cn/robots.txt> | Search engines, AI crawlers | Declares allowed and disallowed crawling scopes and the sitemap URL | Live |
| Sitemap | <https://modelscope.cn/sitemap.xml> | Search engines | Page index, split into 7 sub-sitemaps by product module | Live |
| Page metadata | HTML `<head>` of each page | Search engines, social platforms | Title, description, canonical, and JSON-LD structured data | Partially covered |
| Browser search plugin | <https://modelscope.cn/opensearch.xml> | Browsers | Adds ModelScope as a browser search engine | Live |

<!-- | Popular entity collection | `https://modelscope.cn/llms-full.txt` | AI crawlers | Full text of popular entities | Closed | -->

Status definitions:

- **Live**: Returns the expected `Content-Type`.
- **Partially covered**: Configured on some pages; other pages use the site defaults.
- **Rolling out**: The entry point is being rolled out and does not return the corresponding format until it goes live.

All the entry point files above can be accessed anonymously. Credentials are required only when accessing account-related resources through the MCP Server or OpenAPI. See "Access Authorization" below.

## Resource Detail Markdown

Detail pages of models, datasets, studios, and papers all provide a Markdown version. Append `.md` to the detail page URL to retrieve it:

| Resource type | URL template |
| --- | --- |
| Model | `https://modelscope.cn/models/{owner}/{repo_name}.md` |
| Dataset | `https://modelscope.cn/datasets/{owner}/{repo_name}.md` |
| Studio | `https://modelscope.cn/studios/{owner}/{repo_name}.md` |
| Paper | `https://modelscope.cn/papers/{id}.md` |

`{owner}` is the user name or organization name, `{repo_name}` is the repository name, and `{id}` is the paper ID. Only public resources provide a Markdown version. If a resource does not exist or is not public, `404` is returned with `Content-Type` still set to `text/markdown`, and the body includes site entry navigation.

## Sitemap

`sitemap.xml` is an index file split into 7 sub-sitemaps by product module:

| Sub-sitemap | Coverage |
| --- | --- |
| <https://modelscope.cn/sitemap-pages.xml> | Homepage and product module homepages |
| <https://modelscope.cn/sitemap-models.xml> | Model detail pages |
| <https://modelscope.cn/sitemap-datasets.xml> | Dataset detail pages |
| <https://modelscope.cn/sitemap-studios.xml> | Studio detail pages |
| <https://modelscope.cn/sitemap-mcp.xml> | MCP server detail pages |
| <https://modelscope.cn/sitemap-papers.xml> | Paper detail pages |
| <https://modelscope.cn/sitemap-spotlight.xml> | Developer Practices article pages |

Except for `sitemap-pages.xml`, the detail page sub-sitemaps are not exhaustive. Each one includes the top-ranked content by the site search's overall ranking, and the number of entries per sub-sitemap is capped. To retrieve the complete resource list or perform searches, use the public OpenAPI or the official MCP Server.

## Access Authorization

ModelScope provides two types of access credentials with different permission scopes:

| Credential | How to obtain | Permission scope | Use cases |
| --- | --- | --- | --- |
| Access token | After logging in, create one at [Homepage -> Access Token](https://modelscope.cn/my/myaccesstoken), with a validity period specified by the user | Same as the account's own permissions | SDK, Git, and scripts used by the account owner |
| OAuth access token | Issued dynamically to a third-party application through the OAuth 2.0 authorization flow after user authorization | Limited to the scopes authorized by the user, narrower than an access token | Third-party applications and MCP clients accessing resources on behalf of users |

For the scopes currently supported by OAuth and their corresponding interfaces, see [Log in via ModelScope (OAuth)](https://modelscope.cn/docs/accounts/oauth). Interfaces not covered by any scope can only be called with an access token.

### Official MCP Server

The service URL is `https://www.modelscope.cn/mcp-server`, authenticated with an OAuth access token. For client configuration, see [ModelScope MCP Server OAuth Configuration](https://modelscope.cn/docs/mcp/ms-mcp-oauth).

### Public OpenAPI

| Item | URL |
| --- | --- |
| API documentation site | [OpenAPI Documentation](https://modelscope.cn/docs/openapi) |
| Specification file (machine-readable) | <https://modelscope.cn/.well-known/openapi.json> |
| Unified request URL | `https://modelscope.cn/openapi/v1` |

Authentication uses a Bearer Token, which can be either an access token or an OAuth access token. When using an OAuth access token, only interfaces covered by the authorized scopes can be called.
