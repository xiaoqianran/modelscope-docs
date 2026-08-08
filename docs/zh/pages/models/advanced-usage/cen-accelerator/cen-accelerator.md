<!-- modelscope-docs: 跨地域内网加速下载（CEN） | models/advanced-usage/cen-accelerator/cen-accelerator_CN.md -->

# 跨地域内网加速下载（CEN）

## 背景

ModelScope 平台在阿里云的**杭州、张家口、乌兰察布**等核心地域部署了全量模型和数据集的 OSS 存储。当您的 ECS/GPU 实例位于这些核心地域时，`modelscope download` 会使用内网直接从 OSS 下载文件，获得极致的下载体验。

但在实际生产中，训练集群往往部署在**非核心地域**（如深圳、成都、新加坡等）。此时本地域没有全量 OSS 存储，对于部分高频度使用的热点模型和数据集文件，SDK 会使用内网从本地域的 OSS 下载文件，获得极佳的下载体验。但是，对于中低频的模型和数据集文件，SDK 将回退到公网 CDN 下载，面临带宽受限、流量费用高、下载耗时长等问题。

**跨地域内网加速（CEN）** 方案正是为解决这一场景而设计。通过阿里云云企业网（CEN）打通 GPU 地域与核心地域的内网链路，SDK 自动将下载流量路由到核心地域的 OSS 内网，实现全链路内网高速下载。该方案既适用于云上阿里云地域的下载加速，也适用于IDC的下载加速。

> **与 PrivateLink 方案的关系**
>
> - [PrivateLink 内网加速](../阿里云内网环境加速.md) 加速的是 ModelScope **控制面**（API 信令通道），即查询文件列表、获取下载地址等请求。
> - 本方案（CEN 跨地域加速）加速的是 ModelScope **数据面**（数据传输通道），即实际的模型文件和数据集下载流量。
> - 两者**互相独立**，可以单独使用，也可以组合使用以获得最佳效果。

## 工作原理

当您使用 ModelScope SDK/CLI 下载模型时，SDK 会按以下优先级依次选择下载路径：

1. **本地域 OSS 内网下载（最优）**：SDK 首先检查本地域的 OSS 是否有该文件的存储。如果有，直接从内网下载，体验极佳，无网络传输费用。
2. **跨地域 OSS 内网下载（本方案）**：当配置了本方案后，ModelScope 将检查 `MODELSCOPE_DOWNLOAD_INTER_CLOUD_REGIONS` 指定的对端地域 OSS 是否有该文件的存储。如果该环境变量指向杭州、张家口、乌兰察布等核心地域，这些地域拥有全量数据，一定可以命中该地域的 OSS 存储，SDK 将通过 CEN 内网链路从对端地域的 OSS 下载文件。
3. **公网 CDN 下载（回退）**：如果以上路径均不可用，SDK 将从公网 CDN 下载，带宽受限且产生流量费用。

```
┌──────────────────────┐         ┌──────────────┐         ┌──────────────────────┐
│   GPU 地域（如深圳）   │         │  CEN 云企业网  │         │  核心地域（如杭州）     │
│                      │         │              │         │                      │
│  ┌────────────────┐  │   CEN   │              │         │  ┌────────────────┐  │
│  │   数据节点       │──┼────────►│  内网骨干链路  ├────────►│  │  OSS 全量存储    │  │
│  │  modelscope SDK │  │         │              │         │  │  modelhub-cn-* │  │
│  └────────────────┘  │         │              │         │  └────────────────┘  │
│                      │         │              │         │                      │
└──────────────────────┘         └──────────────┘         └──────────────────────┘

全链路内网传输 · 无公网流量费 · 带宽可达 10Gbps+
```

## 前提条件

在使用跨地域内网加速前，您需要完成以下准备工作：

### 1. 网络打通：通过 CEN 实现跨地域 OSS 内网访问

您需要先通过阿里云云企业网（CEN）打通 GPU 所在地域与核心地域（杭州/张家口/乌兰察布）之间的内网链路，使 GPU 地域的 ECS 能够通过内网地址访问核心地域的 OSS 服务。

详细的网络打通步骤请参考阿里云官方文档：

👉 [通过企业版转发路由器实现 ECS 私网访问跨地域的 OSS 服务](https://help.aliyun.com/zh/cen/use-cases/use-enterprise-edition-transit-routers-to-enable-ecs-instances-to-access-oss-across-regions-over-vpc-connections)

核心步骤包括：

1. **创建 CEN 实例**，绑定 GPU 地域和核心地域的 VPC
2. **创建转发路由器（Transit Router）** 和 VPC 连接
3. **购买跨地域带宽包**（按下载峰值需求配置）
4. **配置路由**：在 VPC 路由表和转发路由器中添加核心地域 OSS 内网网段的路由

> **支持全量存储的核心地域**
>
> 以下地域拥有 ModelScope 全量模型和数据集的 OSS 存储，建议优先选择：
>
> | 地域 | RegionId |
> |------|----------|
> | 杭州 | cn-hangzhou |
> | 张家口 | cn-zhangjiakou |
> | 乌兰察布 | cn-wulanchabu |

### 2. 验证网络连通性

在完成 CEN 网络打通后，**请务必验证** GPU 地域的 ECS 是否能通过 OSS 内网地址访问核心地域的 OSS 服务：

```bash
# 测试是否能通过 OSS 内网地址访问（替换为你实际通过 CEN 连接的核心地域）
curl -I http://www.oss-cn-hangzhou-internal.aliyuncs.com
```

如果返回 `200` 或 `403` 等非超时响应，说明内网链路已打通。如果超时无响应，请检查 CEN 路由配置和安全组规则。

## 版本要求

跨地域内网加速功能需要 modelscope_hub 0.1.7 及以上版本。**ModelScope 1.x 版本不支持此功能**。

**检查当前版本：**

```bash
$ modelscope --version

 _   .-')                _ .-') _     ('-.             .-')                              _ (`-.    ('-.
( '.( OO )_             ( (  OO) )  _(  OO)           ( OO ).                           ( (OO  ) _(  OO)
 ,--.   ,--.).-'),-----. \     .'_ (,------.,--.     (_)---\_)   .-----.  .-'),-----.  _.`     \(,------.
 |   `.'   |( OO'  .-.  ',`'--..._) |  .---'|  |.-') /    _ |   '  .--./ ( OO'  .-.  '(__...--'' |  .---'
 |         |/   |  | |  ||  |  \  ' |  |    |  | OO )\  :` `.   |  |('-. /   |  | |  | |  /  | | |  |
 |  |'.'|  |\_) |  |\|  ||  |   ' |(|  '--. |  |`-' | '..`''.) /_) |OO  )\_) |  |\|  | |  |_.' |(|  '--.
 |  |   |  |  \ |  | |  ||  |   / : |  .--'(|  '---.'.-._)   \ ||  |`-'|   \ |  | |  | |  .___.' |  .--'
 |  |   |  |   `'  '-'  '|  '--'  / |  `---.|      | \       /(_'  '--'\    `'  '-'  ' |  |      |  `---.
 `--'   `--'     `-----' `-------'  `------'`------'  `-----'    `-----'      `-----'  `--'      `------'

modelscope-hub 0.1.7
```

如果版本不满足要求，可通过以下命令升级：

```bash
pip install "modelscope_hub>=0.1.7"
```

## 使用方法

### 配置环境变量

跨地域内网加速通过环境变量 `MODELSCOPE_DOWNLOAD_INTER_CLOUD_REGIONS` 进行配置，值为逗号分隔的对端地域列表（即已通过 CEN 连接的拥有 OSS 存储的核心地域）：

```bash
# 设置已通过 CEN 连接的对端地域
export MODELSCOPE_DOWNLOAD_INTER_CLOUD_REGIONS="cn-hangzhou"
```

SDK 或 CLI 在启动下载时，会自动探测这些地域的 OSS 内网是否有相应的模型或数据集存储。探测成功后，所有文件下载流量将通过 CEN 内网链路转发至对应地域的 OSS 存储。

> **说明**
> - SDK 会自动按列表顺序探测各地域，使用第一个可达的地域进行下载加速。
> - 如果所有地域均不可达，SDK 将自动回退到默认路径（公网 CDN），不影响正常使用。
> - 该配置对同一仓库的多个文件会复用探测结果，不会重复探测。

### 下载模型

`MODELSCOPE_DOWNLOAD_INTER_CLOUD_REGIONS` 环境变量配置完成后，使用方式与正常下载完全一致，无需修改任何代码或命令。SDK 和命令行均支持此功能：

**CLI 方式：**

```bash
# 下载数据集
modelscope download --dataset="agibot_world/AgiBotWorld2026" --local_dir /mnt/ossbucket/AgiBotWorld2026
```

**Python SDK 方式：**

```python
from modelscope.msdatasets import MsDataset
ds = MsDataset.load("agibot_world/AgiBotWorld2026", cache_dir="/mnt/ossbucket/AgiBotWorld2026")
```

### 下载状态标识

开启跨地域加速后，SDK 的进度条会显示加速状态前缀，帮助您快速判断当前的下载路径：

| 前缀 | 含义 |
|------|------|
| ⚡ | 本地域 OSS 内网下载（从本地域下载，最优路径） |
| ⇄ | 对端地域 OSS 内网下载（通过 CEN 跨地域加速） |
| （空） | 公网 CDN 下载（未配置加速或探测未成功） |

## 完整示例：从深圳 GPU 集群通过 CEN 加速下载

以下是一个完整的使用场景示例：

**场景**：GPU 训练集群部署在深圳地域（cn-shenzhen），需要通过 CEN 访问杭州地域的 OSS 来下载数据集。

**步骤 1：网络打通（一次性配置）**

参考[阿里云 CEN 文档](https://help.aliyun.com/zh/cen/use-cases/use-enterprise-edition-transit-routers-to-enable-ecs-instances-to-access-oss-across-regions-over-vpc-connections)，完成以下操作：
- 创建 CEN 实例，绑定深圳 VPC 和杭州 VPC
- 创建转发路由器和跨地域连接
- 购买跨地域带宽包（建议按模型下载峰值配置，如 2Gbps）
- 在深圳 VPC 路由表中添加杭州 OSS 内网网段路由

**步骤 2：验证连通性**

```bash
# 在深圳 ECS 上执行
curl -I http://www.oss-cn-hangzhou-internal.aliyuncs.com
# 返回 200/403 即表示内网链路已打通
```

**步骤 3：配置并下载**

```bash
# 设置环境变量
export MODELSCOPE_DOWNLOAD_INTER_CLOUD_REGIONS="cn-hangzhou"

# 下载数据集，SDK 自动通过 CEN 内网链路加速下载
modelscope download --dataset="agibot_world/AgiBotWorld2026" --local_dir /mnt/ossbucket/AgiBotWorld2026
```

## 费用说明

使用跨地域内网加速涉及以下费用（均由阿里云收取，与 ModelScope 平台无关）：

| 费用项 | 说明 |
|--------|------|
| CEN 跨地域带宽包 | 按带宽峰值计费，可根据下载需求灵活配置 |
| 转发路由器（TR）流量处理费 | 按经过 TR 的流量大小计费 |
| OSS 请求费用 | 标准 OSS 请求费用（通常可忽略） |

> **对比公网下载**：公网 CDN 下载会产生 ECS 公网出流量费，且带宽受限（EIP 限速通常 ≤ 200Mbps）。CEN 可配置更高带宽（10Gbps+），且全链路内网传输质量更稳定。建议根据实际下载频率和数据量综合评估成本。

## 常见问题

**Q：配置了环境变量但进度条没有显示 ⚡ 或 ⇄ 前缀？**

请检查：
1. 环境变量值是否正确（地域 ID 用逗号分隔，无多余空格），例如 `MODELSCOPE_DOWNLOAD_INTER_CLOUD_REGIONS="cn-hangzhou"`
2. CEN 网络是否已打通，运行 `curl -I http://www.oss-cn-hangzhou-internal.aliyuncs.com` 验证
3. 查看 SDK 日志中是否有 `Inter-region acceleration` 相关的日志输出

**Q：可以和 PrivateLink 方案一起使用吗？**

可以。PrivateLink 加速控制面（API 请求），CEN 加速数据面（文件下载），两者互不冲突，组合使用可获得最佳效果。

**Q：需要修改现有代码吗？**

不需要。只需设置环境变量，SDK 会自动探测并启用加速。现有的 `modelscope download` 命令和 `snapshot_download` API 调用方式完全不变。

**Q：探测失败会影响正常下载吗？**

不会。如果所有对端地域探测均失败，SDK 会自动回退到默认的公网 CDN 下载路径，不会中断下载过程。

**Q：如何选择合适的跨地域带宽？**

建议根据数据集大小和下载时间要求来估算。例如下载一个 100GB 的数据集，如果希望在 1 小时内完成，则需要约 100GB / 3600s ≈ 222Mbps 的有效带宽。建议购买 300Mbps 以上的带宽包以获得合理的下载体验。
