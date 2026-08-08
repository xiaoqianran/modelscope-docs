<!-- modelscope-docs: 通过魔搭登录(OAuth) | accounts/oauth/oauth_CN.md -->

本文档介绍基于 OAuth 2.0标准集成通过魔搭登录到三方应用的流程及相关接入接口等信息。

# 创建互联应用

在启动接入前，您首先需要前往 [魔搭首页 → 访问令牌 → 互联应用 → 我创建的应用](https://modelscope.cn/my/access/apps?insideTab=MyCreate) 页面创建互联应用。您也可以直接点击[这里](https://modelscope.cn/my/createApplications?status=create)快速前往创建。

![我创建的互联应用](./_resources/my_connected_app.png)

然后完成创建所需的基础信息填写与配置并确认创建：

![创建互联应用](./_resources/create_connected_app.png)

创建后，系统将为您生成 Client ID、Client Secret 关键信息。

![我创建的应用信息](./_resources/my_connected_app_info.png)

> 安全提示：Client Secret 为高敏感凭证，严禁在前端代码或公开环境中暴露。

# 接入说明
魔搭社区互联应用支持 OAuth 2.0 标准及 OIDC 身份认证协议，相关接入信息可通过 [OpenID metadata](https://modelscope.cn/.well-known/openid-configuration)  查询获取，开发者可遵循对应标准完成接入。
完成接入后，经用户授权，开发者可获取 OAuth 访问令牌，凭借该令牌可在授权范围内，通过相关 OpenAPI 请求访问用户已授权的资源。

当前可用授权项（scope）列表：
| scope                     | 描述                                                                 | 支持的OpenAPI                                                                 |
|:---------------------------|----------------------------------------------------------------------|:-----------------------------------------------------------------------------|
| openid                    | 必选，获取 id_token 及 access token                                   | /                                                         |
| profile                   | 用于获取用户公开信息，包含用户名、昵称、头像等                         | /                                                      |
| manage-mcp-deployment     | 代表用户管理 MCP 服务部署，包括部署与解除部署指定 MCP 服务             | `POST /mcp/servers/{id}/deploy`<br>`DELETE /mcp/servers/{id}/undeploy`       |
| list-operational-mcp      | 获取用户已部署的 MCP 服务列表                                           | `GET /mcp/servers/operational`                                              |
| read-repos                | 获取用户个人仓库的访问权限                                           | `GET /models`<br>`GET /datasets`<br>`GET /models/{owner}/{repo_name}`<br>`GET /datasets/{owner}/{repo_name}` |
|api-inference|代表您调用魔搭账户下的推理API-Inference| `POST https://api-inference.modelscope.cn/v1` [文档](../../model-service/API-Inference/intro)|

> 更多授权项陆续支持中，敬请期待。如有额外的授权项需求，请联系我们沟通。

## OpenAPI统一请求地址

https://modelscope.cn/openapi/v1

更多接口相关信息详见 [OpenAPI 文档](https://modelscope.cn/docs/openapi)。

## 访问组织权限

互联应用通过OAuth所申请的 Scope 默认仅包括用户权限。但对于部分授权项，如 read-repos 也可以关联授权组织权限。当开发者申请的授权项包括这类授权项时，用户在拉起的魔搭 OAuth 授权页时可以手动指定是否授权组织权限，进一步可以指定具体希望授权的组织。


## 温馨提示
- 魔搭互联应用当前为Beta测试阶段，结束 Beta 测试前相关接口及字段有可能发生调整。
- 接入过程中如有任何反馈，欢迎通过邮箱联系我们。
- 联系邮箱：<contact@modelscope.cn>

