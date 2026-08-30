<!-- modelscope-docs: 在创空间中使用 OAuth | studios/oauth/oauth_CN.md -->

创空间内置 ModelScope OAuth。开启后，平台会为创空间创建 OAuth 应用，并在运行时注入客户端信息。Gradio 应用可以直接使用 `gr.LoginButton`；Streamlit、Docker 等服务端应用可以使用标准 OpenID Connect（OIDC）客户端接入。

> 当前 Gradio、Streamlit 和 Docker 创空间支持 OAuth，Static 创空间不支持。OAuth 客户端密钥只应在服务端使用，不要打印到日志、写入代码仓库或返回给浏览器。

# 开启 OAuth

1. 进入创空间的“设置”页面，打开“调整部署设置”。
2. 在“OAuth 设置”中选择“启用”。
3. 设置令牌有效期，并按需勾选权限范围。登录并读取基础用户资料的示例需要 `openid` 和 `profile`。
4. 保存设置并重新部署创空间，使运行时获得最新的 OAuth 配置。

![开启 OAuth](./_resources/oauth-settings.png)

权限范围应按最小权限原则选择。只有在应用确实需要代用户调用对应接口时，才开启仓库读取、API 推理或 MCP 管理等权限。

# 运行时环境变量

普通服务端代码统一使用以下环境变量：

| 环境变量 | 说明 |
| --- | --- |
| `OAUTH_CLIENT_ID` | OAuth 客户端 ID |
| `OAUTH_CLIENT_SECRET` | OAuth 客户端密钥，仅限服务端使用 |
| `OAUTH_SCOPES` | 空格分隔的授权范围 |
| `OPENID_PROVIDER_URL` | OIDC 提供方地址，可用于发现授权、令牌和用户信息端点 |
| `STUDIO_ID` | 创空间标识，格式为 `用户名/创空间名` |
| `STUDIO_HOST` | 创空间独立访问域名，不包含协议 |

为了兼容 Gradio 的 OAuth 能力，运行时还会注入 `SYSTEM`、`SPACE_ID` 和 `SPACE_HOST`。这些名称是 Gradio 兼容变量；非 Gradio 应用请使用上表中的通用变量。

这些变量由平台自动注入，无需在创空间设置中手工添加。

# Gradio：使用 LoginButton

Gradio 会读取兼容环境变量并完成登录跳转、回调校验和用户资料解析。下面的 `app.py` 使用 `gr.LoginButton` 展示登录/退出按钮，并通过 `gr.OAuthProfile` 读取当前用户资料：

```python
from __future__ import annotations

import gradio as gr

def current_user(profile: gr.OAuthProfile | None) -> str:
    if profile is None:
        return "尚未登录，请点击上方按钮。"

    name = profile.get("name") or profile.get("preferred_username") or "用户"
    return f"你好，{name}！"


with gr.Blocks() as demo:
    # gr.LoginButton()
    gr.LoginButton(
        value="使用 ModelScope 登录",
        logout_value="退出登录（{}）",
        icon="https://modelscope.cn/models/modelscope/logos/resolve/master/badge.svg",
    )
    result = gr.Markdown()
    demo.load(current_user, inputs=None, outputs=result)

demo.launch()
```

ModelScope 的 Gradio 创空间运行环境会准备 OAuth 所需依赖。如果需要在本地运行同一示例，请安装 `gradio[oauth]`。

`gr.LoginButton` 只提供登录/退出入口，不会自动限制整个应用。未登录时，事件函数收到的 `gr.OAuthProfile` 或 `gr.OAuthToken` 为 `None`；需要保护的操作仍应在事件函数中检查登录状态和权限范围。需要代用户调用 API 时，可以在事件函数参数中注入 `gr.OAuthToken`，但不要在界面或日志中输出令牌。

更多用法可参考 [Gradio LoginButton 文档](https://www.gradio.app/main/docs/gradio/loginbutton) 和 [Gradio OAuth 指南](https://www.gradio.app/guides/sharing-your-app)。

# 普通代码（Docker/FastAPI）：使用 Authlib

非 Gradio 应用应读取上表中的通用环境变量。下面以 Docker 创空间中的 FastAPI 应用为例，使用 Authlib 根据 OIDC 发现文档完成授权码流程，并由 Authlib 校验 `state`、处理令牌交换和解析用户资料。

在 `requirements.txt` 中添加：

```text
authlib>=1.3
fastapi>=0.115
httpx>=0.27
itsdangerous>=2.2
uvicorn[standard]>=0.30
```

创建 `app.py`：

```python
from __future__ import annotations

import hashlib
import html
import os

from authlib.integrations.starlette_client import OAuth, OAuthError
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from starlette.middleware.sessions import SessionMiddleware

client_id = os.environ["OAUTH_CLIENT_ID"]
client_secret = os.environ["OAUTH_CLIENT_SECRET"]
scopes = os.environ["OAUTH_SCOPES"]
provider_url = os.environ["OPENID_PROVIDER_URL"].rstrip("/")
studio_host = os.environ["STUDIO_HOST"]
redirect_uri = f"https://{studio_host}/auth/callback"

app = FastAPI()
app.add_middleware(
    SessionMiddleware,
    secret_key=hashlib.sha256(client_secret.encode()).hexdigest(),
    same_site="lax",
    https_only=True,
)

oauth = OAuth()
oauth.register(
    name="modelscope",
    client_id=client_id,
    client_secret=client_secret,
    server_metadata_url=f"{provider_url}/.well-known/openid-configuration",
    client_kwargs={"scope": scopes},
)

# 登录按钮组件
LOGIN_BUTTON_HTML = """
<style>
  .ms-login-wrap { display: flex; justify-content: center; padding: 48px 0; }
  .ms-login-btn {
    min-width: 233px;
    width: auto;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 16px;
    gap: 8px;
    border-radius: 12px;
    background: #27254C;
    color: #fff;
    font-size: 14px;
    line-height: 20px;
    text-decoration: none;
    white-space: nowrap;
    box-sizing: border-box;
  }
  .ms-login-btn:hover { background: #33306B; }
  .ms-login-btn img { height: 16px; }
</style>
<div class="ms-login-wrap">
  <a class="ms-login-btn" href="/login" target="_blank" rel="noopener">
    <img src="https://modelscope.cn/models/modelscope/logos/resolve/master/badge.svg" alt="ModelScope" />
    使用 ModelScope 账号登录
  </a>
</div>
"""

@app.get("/", response_class=HTMLResponse)
async def index(request: Request) -> str:
    user = request.session.get("user")
    if user is None:
        return LOGIN_BUTTON_HTML

    name = html.escape(user.get("name") or user.get("preferred_username") or "用户")
    return (
        '<div style="padding:48px 0;text-align:center">'
        f"<p>你好，{name}！</p><a href='/logout'>退出登录</a></div>"
    )

@app.get("/login")
async def login(request: Request) -> RedirectResponse:
    return await oauth.modelscope.authorize_redirect(request, redirect_uri)


@app.get("/auth/callback")
async def auth_callback(request: Request):
    try:
        token = await oauth.modelscope.authorize_access_token(request)
    except OAuthError:
        return HTMLResponse("<p>登录失败，请返回首页重试。</p>", status_code=400)

    userinfo = token.get("userinfo")
    if userinfo is None:
        userinfo = await oauth.modelscope.userinfo(token=token)

    # 签名 Cookie 中只保存显示所需的资料，不保存访问令牌。
    request.session["user"] = {
        "sub": userinfo["sub"],
        "name": userinfo.get("name"),
        "preferred_username": userinfo.get("preferred_username"),
    }
    return RedirectResponse("/", status_code=303)


@app.get("/logout")
async def logout(request: Request) -> RedirectResponse:
    request.session.clear()
    return RedirectResponse("/", status_code=303)
```

创建 `Dockerfile`：

```dockerfile
FROM modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/python:3.10

WORKDIR /home/user/app
COPY . /home/user/app
RUN pip install --no-cache-dir -r requirements.txt

ENTRYPOINT ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
```

将这三个文件提交到 Docker 创空间后重新部署。若要在本地运行，可执行 `uvicorn app:app --host 0.0.0.0 --port 7860`。

创空间页面通常运行在 iframe 中，示例使用 `target="_blank"` 在新窗口打开登录流程。若应用需要长期保存访问令牌或刷新令牌，请使用服务端存储，并将浏览器会话与服务端记录关联；不要把令牌写入 Starlette 的签名 Cookie，因为签名 Cookie 可以防篡改，但不会加密内容。

在 ModelScope 创空间中，普通代码应使用上表列出的通用变量，不要依赖 Gradio 兼容变量。

# 常见问题

- **修改 OAuth 设置后没有生效**：保存后重新部署创空间，确认新容器已启动。
- **登录后没有用户资料**：确认权限范围中包含 `openid` 和 `profile`，并检查回调请求的服务端日志。
- **登录按钮不等于访问控制**：登录前就不应公开的页面或接口，需要在服务端路由中检查会话。
- **不要手工拼接不带 `state` 的授权请求**：使用成熟的 OIDC/OAuth 客户端库，避免登录 CSRF 和回调校验缺失。
- **外部应用接入魔搭OAuth登录**：请参阅[](../../accounts/oauth/oauth_CN.md)
