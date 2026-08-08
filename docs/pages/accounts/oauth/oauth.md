<!-- modelscope-docs: Log in via ModelScope (OAuth) | accounts/oauth/oauth_EN.md -->

This document introduces the process of integrating login via ModelScope into third-party applications based on the OAuth 2.0 standard, along with relevant integration interfaces and information.

# Create a Connected Application

Before starting integration, you first need to go to the [ModelScope homepage → Access Tokens → Connected Applications → My Created Applications](https://modelscope.cn/my/access/apps?insideTab=MyCreate) page to create a connected application. You can also click [here](https://modelscope.cn/my/createApplications?status=create) to quickly navigate to the creation page.

![My Connected Applications](./_resources/my_connected_app.png)

Then complete the required basic information filling and configuration, and confirm creation:

![Create Connected Application](./_resources/create_connected_app.png)

After creation, the system will generate critical information including Client ID and Client Secret for you.

![My Application Information](./_resources/my_connected_app_info.png)

> Security Notice: Client Secret is a highly sensitive credential and must never be exposed in frontend code or public environments.

# Integration Instructions
ModelScope connected applications support the OAuth 2.0 standard and OIDC authentication protocol. Relevant integration information can be queried and obtained through [OpenID metadata](https://modelscope.cn/.well-known/openid-configuration). Developers can follow the corresponding standards to complete integration.
After successful integration, developers can obtain an OAuth access token upon user authorization. With this token, developers can access user-authorized resources within the authorized scope through relevant OpenAPI requests.

Current available authorization scopes (scope) list:
| scope                     | Description                                                                 | Supported OpenAPI                                                                 |
|:---------------------------|----------------------------------------------------------------------|:-----------------------------------------------------------------------------|
| openid                    | Required, to obtain id_token and access token                                   | /                                                         |
| profile                   | Used to obtain user public information, including username, nickname, avatar, etc.                         | /                                                      |
| manage-mcp-deployment     | Represents user management of MCP service deployment, including deploying and undeploying specified MCP services             | `POST /mcp/servers/{id}/deploy`<br>`DELETE /mcp/servers/{id}/undeploy`       |
| list-operational-mcp      | Get the list of MCP services deployed by the user                                           | `GET /mcp/servers/operational`                                              |
| read-repos                | Get access permissions to user's personal repositories                                           | `GET /models`<br>`GET /datasets`<br>`GET /models/{owner}/{repo_name}`<br>`GET /datasets/{owner}/{repo_name}` |
|api-inference|Invoke ModelScope API-Inference on your behalf| `POST https://api-inference.modelscope.cn/v1` [文档](../../model-service/API-Inference/intro)|

> More authorization scopes are coming soon. Stay tuned! If you have additional authorization scope requirements, please contact us.

## Unified OpenAPI Request Address

https://modelscope.cn/openapi/v1

For more interface-related information, please refer to the [OpenAPI Documentation](https://modelscope.cn/docs/openapi).

## Organization Access Permissions

The scopes requested by connected applications through OAuth default to only include user permissions. However, for certain authorization scopes such as read-repos, organization permissions can also be associated. When developers request authorization scopes that include such items, users can manually specify whether to authorize organization permissions on the ModelScope OAuth authorization page that appears, and can further specify the specific organizations they wish to authorize.


## Friendly Reminders
- ModelScope connected applications are currently in Beta testing phase. Related interfaces and fields may be adjusted before the Beta testing ends.
- If you have any feedback during the integration process, please feel free to contact us via email.
- Contact email: <contact@modelscope.cn>