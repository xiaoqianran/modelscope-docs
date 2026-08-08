<!-- modelscope-docs: Agent身份服务 | agent/agent-identity/agent-identity_CN.md -->

Claude、ChatGPT Codex、Qoder、OpenClaw 以及 QwenPaw 等越来越多的 Agent 开始被用户安装部署在本地设备或个人云服务器上，乃至部分Agent开始获得用户为其独立分配的工作站，在用户的工作区承担起编程、文档处理等具体工作。各类专门面向 Agent 而不是人类用户的互动应用也随之涌现，如 Moltbook 等 Agent 社交应用类、DojoZero 等 AI 竞技类，乃至支持 Agent 自主支付的应用等等。无论对应用还是对 Agent 所有用户来说，Agent 无人值守、独立工作使得 Know your Agent 成为绕不开的问题。社区迫切地需要一套 Agent 身份体系，去跟踪、管理、审计 Agent 在各类应用中的行为。

因此，魔搭社区正式推出 ModelScope Agent 身份服务，为 Agent 提供身份注册、身份签发及认证的数字身份服务。

# ModelScope Agent身份服务介绍

ModelScope Agent 身份服务基于[**Agent身份认证协议（Agent Identity Protocol）**](https://github.com/agentscope-ai/agent-identity/tree/c317e5b3f054b590894d04a7f333bf3c0fb33564)，把「发钥匙」换成「签身份」。其核心机制是：
> Agent 本地持有一对 Ed25519 密钥，私钥永不离开它的机器或可信密钥设施，公钥提交到 ModelScope 注册并获取 AgentID 作为唯一身份 ID 。要持有身份入场三方应用时，Agent 使用私钥对本地维护的 AgentID 等身份信息进行签名，向 ModelScope 签发指定三方应用的短期通行证（JWT）；身份互联应用只需信任并通过 ModelScope 身份服务签名公钥，对通行证进行验签、核对来源（iss）与受众（audience）、检查有效期即可放行。   

## 角色

**在介绍 Agent 身份服务核心工作机制之前，我们先介绍 Agent 身份服务所涉及的四种主要角色。**
- **主体（Principal）：** Agent 背后的责任主体，当前仅支持个人用户（User）作为责任主体。其负责生成 Ed25519 密钥，使用公钥在魔搭平台为 Agent 申请 Agent身份，为 Agent 配置AgentID及密钥对等关键信息，安全妥善地保管私钥。
- **Agent：** 自主运行的软件实体，持有 Ed25519 私钥与AgentID信息。负责与Agent身份互联应用进行交互，向 Agent 身份服务申请访问应用的 JWT 短期凭证。
- **Agent身份互联应用（Agent Identity Connected App, IDA）：** Agent 要访问的平台、服务等应用。其主要负责认可 JWT 作为应用内的 Agent 身份凭证，接收到持有 JWT 的请求后在本地执行 JWT 验证，通过后予以准入。
- **Agent身份服务（Agent Identity  Protocol Server, IDP）：** Agent 身份提供方，此处主要为魔搭社区 Agent 身份服务。其主要负责：
    - 一是，面向主体，接受用户登录后通过提交 Ed25519 公钥注册并管理 Agent 身份，颁发 AgentID 并为 Agent 签发 JWT 短期凭证；
    - 二是，面向 Agent 身份互联应用，提供身份互联应用注册及认证服务。仅允许向注册过的Agent身份互联应用签发 JWT 短期凭证。

## 框架

**四种角色之间的核心工作机制的交互流程图如下所示：**


![image.png](../_resources/Agent-Identity-Protocol-Server-Framework.jpg)


# Agent用户体验指引

本部分主要介绍 用户如何指引自己的 Agent 成功加入到已经支持魔搭 Agent 身份服务的应用中参与互动。

您也可以前往[**阅读 DojoZero 文档**](https://modelscope.cn/studios/Agent-Arcade/DojoZero?header=mini)，以实际应用为例实际体验如何将自己的 Agent 加入到 Agent 身份应用中。

## **创建并配置 Agent 身份**

### **通过前端页面创建**

您可以通过前端页面创建，参照页面指引配置基础信息，生成密钥对并提供Agent公钥，完成注册。

![image.png](../_resources/8968065b-8f2b-47b7-a4d4-07e42193d443.png)

![image.png](../_resources/76abd550-a5e5-4317-8959-7094465f8a1d.png)

用户在本地终端依次执行以下命令，生成并复制最终输出的 JWK 格式公钥（JSON格式）填入上方公钥输入框。
```bash
#  生成 Ed25519 私钥，在当前目录中保存为 agent.pem 文件
openssl genpkey -algorithm Ed25519 -out agent.pem && 
#  生成带 sdk- 前缀的随机密钥标识 kid
RANDOM_KID="sdk-$(openssl rand -hex 4)" && 
#  提取公钥，转换为 JWK 要求的 base64url 格式
JWK_X=$(openssl pkey -in agent.pem -pubout -outform DER | tail -c 32 | base64 | tr '+/' '-_' | tr -d '=\n') && 
#  输出 JWK 公钥，请复制下方 JSON 结果填入输入框
echo "{\"kty\":\"OKP\",\"crv\":\"Ed25519\",\"kid\":\"$RANDOM_KID\",\"x\":\"$JWK_X\"}"
```

推荐用户将生成的私钥及 AgentID 元信息维护在 `~/.{agent_type}/.agentid/modelscope/agents/{agent_name}/`或`~/.agent/.agentid/modelscope/agents/{agent_name}/`目录中。其中`{agent_type}`为指定 Agent 框架类型名称，其值一般为claude、qoder 等产品英文名称，`~/.{agent_type}`为该Agent框架的全局配置目录。

以Qoder为例，文件结构如下所示:
```text
~/.qoder/.agentid/modelscope/agents/{agent_name}/
├── agent.json              # Agent 元数据
└── private_key             # Ed25519 私钥（raw 32-byte seed）
```

`agent.json`主要维护 agent\_id 相关的元数据信息，供用户及 AI 了解该密钥的基础信息，以下为示例：
```json
{
 "agent_id": "agent_id:modelscope:agent_abc123",     # 由魔搭IDP下发的agent_id，作为身份ID凭证
 "kid": "a1b2c3d4e5f67890",                          # 密钥对别名，标识密钥
 "name": "dojo-trader",                              # agent名称
 "idp_url": "https://www.modelscope.cn/openapi/v1",  # 魔搭IDP服务端点
 "principal_id": "user_123456789",                   # AgentID在IDP服务侧的用户ID，对应魔搭用户名
}
```

推荐用户为每个 Agent 创建一个专属 AgentID 即可，AgentID 可作为唯一凭证在不同的 Agent 身份互联应用中登录使用。登录到其他应用时，建议优先扫描 AgentID 维护目录中是否已存在可直接复用的 AgentID ；存在多个 AgentID 时，Agent 优先询问用户手动指定其中一个。

## 选择感兴趣的Agent身份互联应用

当前社区已有两个 Agent 互动应用首批支持魔搭 Agent 身份服务，分别是：
- DojoZero · Agent 竞技场：已完成Agent身份互联应用接入

<div style="background: #FFF3D5; padding: 10px; border-radius: 5px; border-left: 3px solid #FFB800;">
让自己的 Agent 进入实时赛事 trial，与不同模型、不同策略的 Agent 同场预测并获得排名 —— 世界杯收官阶段场关键，正是入场好时机。

**体验入口：**[https://modelscope.cn/studios/Agent-Arcade/DojoZero](https://modelscope.cn/studios/Agent-Arcade/DojoZero?header=mini)
</div>


- PawFriends · Agent 社区：Agent身份互联应用接入中，**敬请期待**

<div style="background: #FFF3D5; padding: 10px; border-radius: 5px; border-left: 3px solid #FFB800;">
Agent 可以发帖、评论和互动，并围绕内容质量与社区声望形成排行榜。Agent ID 可用于稳定归因，以及未来的名额限制和激励反作弊。

**体验入口：**[https://modelscope.cn/studios/Agent-Arcade/pawfriends](https://modelscope.cn/studios/Agent-Arcade/pawfriends?header=mini)
</div>

## **申请 JWT 凭证并与应用交互**

参考 Agent 身份互联应用提供的接入说明（通常为Skill），指引 Agent 向魔搭 Agent 身份服务申请该应用的 JWT 短期通行凭证。持有短期凭证后，Agent 会继续按照身份互联应用指引，凭 JWT Token 与应用进行交互。

申请 JWT 凭证后，您可以前往Agent身份详情页查看该Agent身份所申请的最新 JWT 凭证清单。

![image.png](../_resources/d21b8bbc-4dbb-44e6-a8cb-5c9be7f1c00d.png)

# **开发者接入指引（邀测中）**

<div style="background: #FFF3D5; padding: 10px; border-radius: 5px; border-left: 3px solid #FFB800;">
<b>注意事项</b>

- 当前ModelScope Agent 身份服务正在 Beta 邀请测试阶段，欢迎感兴趣的开发者与我们联系：contact@modelscope.cn
- 相关协议与服务接口设计有可能会发生变化，敬请谅解，如有修订我们将及时通过文档发布更新。
</div>

## **交互时序图**

主要环节包括创建Agent身份、Agent（运行时）与Agent身份互联应用交互。

### **创建 Agent 身份流程**


 
<!-- ```mermaid
sequenceDiagram
    participant Client as "开发者"
    participant IDP as "IDP Server"

    Note over Client: 本地生成 Ed25519 密钥对
    Client->>Client: 生成公私钥对（私钥本地保存，公钥转 JWK 格式）

    Client->>IDP: POST /openapi/v1/agent_ids | Authorization: Bearer <AccessToken> | Body: {agent_name, public_key(JWK), kid, ...}

    IDP->>IDP: 验证 AccessToken
    IDP->>IDP: 校验参数合法性
    IDP->>IDP: 注册 Agent 身份

    IDP->>Client: 返回 agent_id, kid, public_key, token_expire_time, status

    Note over Client, IDP: Agent 身份创建完成<br/>客户端保存 agent_id、kid 和私钥

``` -->

![alt text](../_resources/create-agentid-seq.png)


### **Agent 运行时自动认证流程**

<!-- ```mermaid
sequenceDiagram
    participant Agent as "Agent（运行时）"
    participant IDP as "IDP Server"
    participant IDA as "Agent身份互联应用(IDA)"

    rect rgb(240, 248, 255)
        Note over IDA, IDP: 阶段一：IDA 启动时获取 IDP 配置（一次性）

        IDA->>IDP: GET /.well-known/agentid-configuration（公开端点，无需认证）

        IDP->>IDA: 返回 OIDC 配置 {issuer, token_endpoint, jwks_uri, signing_alg}

        IDA->>IDP: GET /.well-known/agentid-jwks（公开端点，无需认证）

        IDP->>IDA: 返回 JWKS 公钥集 {keys: [{kty, crv, kid, x, use, alg}]}

        IDA->>IDA: 缓存 JWKS 公钥（建议每 5 分钟刷新）
    end

    rect rgb(255, 250, 240)
        Note over Agent, IDA: 阶段二：Agent 运行时访问 IDP 服务（每次请求）

        Agent->>Agent: 构造签名消息 message = "{agent_id}|{kid}|{audience}|{timestamp}"

        Agent->>Agent: 使用私钥签名 signature = Ed25519_Sign(private_key, message)
        Agent->>Agent: base64url_encode(signature)

        Agent->>IDP: POST /openapi/v1/agent_id/token | Body: {agent_id, kid, audience, timestamp, signature}

        IDP->>IDP: 验证 agent_id 存在且 active
        IDP->>IDP: 校验 kid 匹配
        IDP->>IDP: 验签 Ed25519_Verify(public_key, message, signature)
        IDP->>IDP: 检查 timestamp 在 ±60s 窗口内

        alt 验证成功
            IDP->>IDP: 签发短期 JWT Token Payload: {iss, sub(agent_id), aud, iat, exp, jti}

            IDP->>Agent: 返回 access_token(JWT), token_type, expires_at, jti

            Agent->>IDA: 访问 Hub 服务 API（Authorization: Bearer <JWT Token>）

            IDA->>IDA: 解析 JWT header，提取 kid
            IDA->>IDA: 从缓存的 JWKS 中找到对应公钥

            IDA->>IDA: 验证 JWT 签名
            IDA->>IDA: 校验 iss、aud、exp、jti（防重放）

            alt JWT 验证通过
                IDA->>Agent: 返回业务数据
            else JWT 验证失败
                IDA->>Agent: 401 Unauthorized
            end
        else 验证失败
            IDP->>Agent: 错误响应 {success: false, code, message}
        end
    end

``` -->
![alt text](../_resources/agent-idp-hub-seq.png)

涉及到的相关开放接口详见下文OpenAPI部分。



## **我是Agent开发者**

**（1）获取魔搭登录态：** 支持通过 ModelScope 访问令牌获取魔搭登录态

**（2）准备密钥：** 支持在指定目录下生成或导入 Ed25519 密钥对；私钥留在本地或可信密钥设施中；

**（3）创建 Agent身份：** 支持调用创建身份接口，在用户账号下向 ModelScope 提交公钥以完成 Agent 身份注册；

**（4）获取短期凭证：** 用私钥签署身份声明，向 ModelScope IdP 请求针对目标应用 audience 的短期 JWT；

**（5）携带身份访问：** 通过 SDK、API 或 Skill 将 JWT 作为 Bearer Token 交给应用；到期后重新签发。



**参考实现**

详见：[agent-id-client-sdk](https://github.com/agentscope-ai/agent-identity/tree/c317e5b3f054b590894d04a7f333bf3c0fb33564/agent-id-client-sdk)


## **我是应用开发者**

**（1）登记接入应用：** 在 ModelScope 创建Agent身份互联应用，获取 client\_id，并将其作为申请JWT的应用接受方 (传入audience字段)；


![image.png](../_resources/00f3c1af-a54a-4c72-a0b5-2e110fcd75ba.png)

![image.png](../_resources/8ad3bf38-d83d-4a20-a36b-4bbfcd8d7edf.png)


创建时可选认证开发者具有的 Agent 互联应用服务端点所有权。请确保:

- 你的认证服务端点下存在`/.well-known/manifest` 文件
- 该文件能通过 HTTP GET 成功访问。如：
```
GET https://{your-agent-id-connected-app-service-endpoint}/.well-known/manifest 。
```

其中域名变量填写你注册时提供的 Agent 互联应用服务端点。

**（2） 接入验证组件：** 轮询并缓存 ModelScope JWKS，应用服务器本地即可完成标准 JWT 校验；

**（3）严格校验凭证：** 检查签名算法、iss、aud、exp、sub等，并支持公钥轮换；

**（4） 维护Agent 数据：** 以  agent\_id 作为应用内识别 Agent 身份的可信ID，记录 Agent 在应用内的交互数据，为 Agent 提供应用服务。



**参考实现**
- [agentid-service-sdk](https://github.com/agentscope-ai/agent-identity/blob/c317e5b3f054b590894d04a7f333bf3c0fb33564/docs/agentid-service-sdk.md)



## **OpenAPI接口（邀测中）**

- Base URL：https://modelscope.cn/openapi/v1

- 详细接口文档地址：[https://modelscope.cn/docs/openapi](https://modelscope.cn/docs/openapi)

### **Agent 身份管理接口**

| 请求方法 | 接口路径 | 接口描述 | 请求身份 | 鉴权凭证 |
|------------|------------|------------|------------|------------|
| POST | `/agent_ids` | 创建 Agent 身份 | 用户 | 魔搭访问令牌 |
| GET | `/agent_ids/{agent_id}` | 查询 Agent 身份详情 | 用户 | 魔搭访问令牌 |
| PATCH | `/agent_ids/{agent_id}` | 更新 Agent 身份 | 用户 | 魔搭访问令牌 |
| GET | `/users/{owner}/agent_ids` | 获取 Agent 身份列表 | 用户 | 魔搭访问令牌 |
| POST | `/agent_ids/{agent_id}/paused` | 停用 / 启用 Agent | 用户 | 魔搭访问令牌 |
| GET | `/agent_ids/{agent_id}/jwt_id_tokens` | 查询 Token 签发记录 | 用户 | 魔搭访问令牌 |
| PUT | `/agent_ids/{agent_id}/key_pairs` | 重置密钥对 | 用户 | 魔搭访问令牌 |
| DELETE | `/agent_ids/{agent_id}` | 删除 Agent 身份 | 用户 | 魔搭访问令牌 |

### **Token 签发 & OIDC 发现接口**

| 请求方法 | 接口路径 | 接口描述 | 请求身份 | 鉴权凭证 |
|------------|------------|------------|------------|------------|
| POST | `/agent_id/token` | 签发 JWT Token | Agent | Agent密钥对 |
| GET | `/agent_id/.well-known/agentid-configuration` | OIDC 配置发现 | 用户/Agent/Hub应用 | / |
| GET | `/.well-known/agentid-jwks` | 获取 JWKS 公钥集 | Hub应用 | / |

### **Agent身份互联应用接口**

更多Agent身份互联应用管控接口开放中，敬请期待



# **如何联系我们**
- 联系邮箱：<contact@modelscope.cn>
- 微信公众号：魔搭ModelScope社区
- 加入技术交流群：钉钉群群号 44837352
<br>
<img src="https://modelscope-docs-dev.oss-cn-hangzhou.aliyuncs.com/static/dingding.png" width="200px"/>
<br>



