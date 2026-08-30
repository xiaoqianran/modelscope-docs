<!-- modelscope-docs: Using OAuth in Studios | studios/oauth/oauth_EN.md -->

Studios include built-in ModelScope OAuth. When OAuth is enabled, the platform creates an OAuth application for the Studio and injects its client configuration at runtime. Gradio apps can use `gr.LoginButton` directly, while Streamlit, Docker, and other server-side apps can use a standard OpenID Connect (OIDC) client.

> OAuth is supported for Gradio, Streamlit, and Docker Studios. Static Studios are not supported. Keep the OAuth client secret on the server. Never print it in logs, commit it to a repository, or return it to a browser.

# Enable OAuth

1. Open the Studio **Settings** page and select **Adjust deployment settings**.
2. Enable **OAuth settings**.
3. Select a token lifetime and the minimum scopes required by the app. The sign-in examples below require `openid` and `profile`.
4. Save the settings and redeploy the Studio so the runtime receives the latest OAuth configuration.

![Enable OAuth](./_resources/oauth-settings.png)

Only select repository, API inference, or MCP management scopes when the app needs to call the corresponding APIs on behalf of a user.

# Runtime environment variables

General server-side code should use the following environment variables:

| Environment variable | Description |
| --- | --- |
| `OAUTH_CLIENT_ID` | OAuth client ID |
| `OAUTH_CLIENT_SECRET` | OAuth client secret; server-side use only |
| `OAUTH_SCOPES` | Space-separated authorization scopes |
| `OPENID_PROVIDER_URL` | OIDC provider URL used to discover authorization, token, and userinfo endpoints |
| `STUDIO_ID` | Studio identifier in `username/studio-name` format |
| `STUDIO_HOST` | Independent Studio hostname without a scheme |

For compatibility with Gradio OAuth, the runtime also injects `SYSTEM`, `SPACE_ID`, and `SPACE_HOST`. These are Gradio compatibility variables. Non-Gradio apps should use the general variables above.

The platform injects these variables automatically. Do not add them manually in Studio settings.

# Gradio: use LoginButton

Gradio reads the compatibility variables and handles the sign-in redirect, callback validation, and user profile parsing. This `app.py` displays a sign-in/sign-out button and reads the current profile through `gr.OAuthProfile`:

```python
from __future__ import annotations

import gradio as gr


def current_user(profile: gr.OAuthProfile | None) -> str:
    if profile is None:
        return "You are not signed in. Select the button above."

    name = profile.get("name") or profile.get("preferred_username") or "user"
    return f"Hello, {name}!"


with gr.Blocks() as demo:
    # gr.LoginButton()
    gr.LoginButton(
        value="Sign in with ModelScope",
        logout_value="Sign out ({})",
        icon="https://modelscope.cn/models/modelscope/logos/resolve/master/badge.svg",
    )
    result = gr.Markdown()
    demo.load(current_user, inputs=None, outputs=result)

demo.launch()
```

The ModelScope Gradio Studio runtime provides the OAuth dependencies. To run the same example locally, install `gradio[oauth]`.

`gr.LoginButton` provides sign-in and sign-out controls; it does not automatically restrict the entire app. Before sign-in, event functions receive `None` for `gr.OAuthProfile` and `gr.OAuthToken`. Check authentication and required scopes in every protected event. If an event receives `gr.OAuthToken` to call an API for the user, never display or log the token.

See the [Gradio LoginButton reference](https://www.gradio.app/main/docs/gradio/loginbutton) and [Gradio OAuth guide](https://www.gradio.app/guides/sharing-your-app) for additional patterns.

# General code (Docker/FastAPI): use Authlib

Non-Gradio apps should read the general environment variables listed above. The following example uses FastAPI in a Docker Studio and relies on Authlib with OIDC discovery to perform the authorization code flow. Authlib validates `state`, exchanges the authorization code, and parses the user profile.

Add these dependencies to `requirements.txt`:

```text
authlib>=1.3
fastapi>=0.115
httpx>=0.27
itsdangerous>=2.2
uvicorn[standard]>=0.30
```

Create `app.py`:

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

# Sign-in button component
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
    Sign in with your ModelScope account
  </a>
</div>
"""

@app.get("/", response_class=HTMLResponse)
async def index(request: Request) -> str:
    user = request.session.get("user")
    if user is None:
        return LOGIN_BUTTON_HTML

    name = html.escape(user.get("name") or user.get("preferred_username") or "user")
    return (
        '<div style="padding:48px 0;text-align:center">'
        f"<p>Hello, {name}!</p><a href='/logout'>Sign out</a></div>"
    )

@app.get("/login")
async def login(request: Request) -> RedirectResponse:
    return await oauth.modelscope.authorize_redirect(request, redirect_uri)


@app.get("/auth/callback")
async def auth_callback(request: Request):
    try:
        token = await oauth.modelscope.authorize_access_token(request)
    except OAuthError:
        return HTMLResponse("<p>Sign-in failed. Return to the home page and retry.</p>", status_code=400)

    userinfo = token.get("userinfo")
    if userinfo is None:
        userinfo = await oauth.modelscope.userinfo(token=token)

    # Store only display data in the signed cookie, not the access token.
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

Create a `Dockerfile`:

```dockerfile
FROM modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/python:3.10

WORKDIR /home/user/app
COPY . /home/user/app
RUN pip install --no-cache-dir -r requirements.txt

ENTRYPOINT ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
```

Commit these three files to a Docker Studio and redeploy it. To run the app locally, execute `uvicorn app:app --host 0.0.0.0 --port 7860`.

Studio pages commonly run inside an iframe, so the example opens sign-in in a new window with `target="_blank"`. If the app must keep access or refresh tokens, store them on the server and associate them with the browser session. Do not put tokens in Starlette's signed cookie: a signature prevents tampering but does not encrypt the cookie contents.

General code in ModelScope Studios should use the general variables listed above and should not depend on the Gradio compatibility variables.

# Troubleshooting

- **OAuth changes do not take effect**: save the settings, redeploy the Studio, and confirm that the new container is running.
- **No profile is returned after sign-in**: make sure the selected scopes include `openid` and `profile`, then inspect the server-side callback logs.
- **A sign-in button is not access control**: enforce sessions on server routes for pages and APIs that must not be public before sign-in.
- **Do not build an authorization request without `state`**: use a maintained OIDC/OAuth client library to prevent login CSRF and missing callback validation.
- **Integrating ModelScope OAuth sign-in in external apps**: see the [Sign in with ModelScope (OAuth)](../../accounts/oauth/oauth_EN.md) documentation.
