<!-- modelscope-docs: MCP SDK接口 | mcp/sdk/sdk_CN.md -->

# MCP SDK接口

## ModelScope SDK MCP API函数速查表
| 函数名                          | 核心用途                  | 典型返回内容                  |
|---------------------------------|---------------------------|-------------------------------|
| `list_mcp_servers`              |          查询mcp服务 | MCP服务列表、总数等              |   
| `list_operational_mcp_servers`  | 查询自己已激活的MCP服务    | 可调用地址（SSE/Streamable HTTP等）      |
| `get_mcp_server`                | 单个MCP服务详情查询        | 描述、参数、调用地址          |


## 一、初始化

在使用MCP SDK函数前，需完成以下准备工作，为所有调用提供基础环境：

- **获取访问令牌（token）方式**：从[ModelScope访问令牌](https://modelscope.cn/my/myaccesstoken)获取SDK TOKEN即可
- **使用规则**：传入token后可获取更多MCP服务信息。通过接口登录后，无需开发者额外传入令牌。

```python
# pip install modelscope

from modelscope.hub.mcp_api import MCPApi

# Initialize the instance
api = MCPApi()
api.login("YOUR_MODELSCOPE_TOKEN")
```


## 二、函数列表

### 1. `list_mcp_servers`：批量查询MCP服务
#### 功能
获取MCP服务列表，支持按类别、标签筛选及关键词搜索，适合批量检索MCP服务资源。

#### 核心参数
| 参数名        | 作用                                                                 | 示例值                          |
|---------------|----------------------------------------------------------------------|---------------------------------|
| `token`       | 可选，传入后可获取更多MCP服务信息                    | `token=token`                   |
| `filter`      | 可选，按 `category`（类别）、`tag`（标签）、`is_hosted`（是否托管）筛选 | `filter={"category": "vision", "is_hosted": True}` |
| `total_count` | 可选，限制返回数量（1-100，默认20）                                  | `total_count=50`                |
| `search`      | 可选，针对服务中文名称、服务英文名称、作者/所有者用户名进行搜索                               | `search="地图"`            |

#### 返回数据结构
```python
{
    'total_count': 20,
    'servers': [
        {
            'name': 'ServerA', 
            'id': '@demo/ServerA', 
            'description': 'This is a demo server for xxx.'
        },
        {
            'name': 'ServerB', 
            'id': '@demo/ServerB', 
            'description': 'This is another demo server.'
        }
        ......
    ]
}
```

#### 示例代码
```python
servers = api.list_mcp_servers()
print(f"MCP Count: {servers['total_count']}")

# Query with filters
servers = api.list_mcp_servers(
    filter={"category": "location-services", "is_hosted": True},
    total_count=50
)

# Query with search
servers = api.list_mcp_servers(search="地图")

# Query with filters and search
servers = api.list_mcp_servers(
    filter={"is_hosted": True},
    search="地图",
    total_count=20
)
```


### 2. `list_operational_mcp_servers`：查询已激活的可运行MCP服务
#### 功能
获取用户已托管部署的MCP服务列表，包含实际调用地址（如SSE、HTTP流接口），适合查看可直接使用的MCP服务。

#### 核心参数
| 参数名  | 作用                          | 说明                          |
|---------|-------------------------------|-------------------------------|
| `token` | 若未登陆则必选            | 未登录或未传入token时会抛出权限错误         |

#### 返回数据结构
```python
{
    'total_count': 10,
    'servers': [
        {
            'name': 'ServerA',
            'id': '@Group1/ServerA',
            'description': 'This is a demo server for xxx.',
            'mcp_servers': [
                {
                    'type': 'sse',
                    'url': 'https://mcp.api-inference.modelscope.net/{uuid}/sse'
                },
                {
                    'type': 'streamable_http',
                    'url': 'https://mcp.api-inference.modelscope.net/{uuid}/streamable_http'
                }
            ]
        }
    ]
}
```

#### 示例代码
```python
operational_servers = api.list_operational_mcp_servers()

# Get MCP server information
for server in operational_servers['servers']:
    print(f"name: {server['name']}")
    
    # Get the URL
    for mcp_server in server['mcp_servers']:
        print(f"  {mcp_server['type']}: {mcp_server['url']}")
```


### 3. `get_mcp_server`：查询单个MCP服务的详细信息
#### 功能
获取指定MCP服务的详细配置（如描述、调用地址、参数说明等），适合深入了解MCP服务的具体能力。

#### 核心参数
| 参数名      | 作用                                  | 说明                          |
|-------------|---------------------------------------|-------------------------------|
| `server_id` | 必选，MCP服务唯一标识（格式：`@group/name`） | 可从 `list_mcp_servers`结果或MCP广场中获取 |
| `token`     | 可选，登陆或手动传入后可获取更多信息            | 可省略              |

#### 返回数据结构
```python
{
    'name': 'ServerA',
    'description': 'This is a demo server for xxx.',
    'id': '@demo/serverA',
    'servers': [
        {
            'type': 'sse',
            'url': 'https://mcp.api-inference.modelscope.net/{uuid}/sse'
        },
        {
            'type': 'streamable_http',
            'url': 'https://mcp.api-inference.modelscope.net/{uuid}/streamable_http'
        }
    ]
}
```

#### 示例代码
```python
server_info = api.get_mcp_server(server_id="@modelscope/ocr-server")

# Get basic information of the MCP server
print(f"name: {server_info['name']}")
print(f"description: {server_info['description']}")

# Get the MCP server config
for server_config in server_info['servers']:
    print(f"{server_config['type']}: {server_config['url']}")
```




## 三、常见问题与解决方案

### 1. 认证相关
- **问题**: `Authentication failed: no valid cookies found`
- **解决**: 确保传入有效的token或先调用`api.login()`

### 2. 参数验证
- **问题**: `total_count must be between 1 and 100`
- **解决**: 确保`total_count`参数在1-100范围内

### 3. MCP服务不存在
- **问题**: `Failed to get MCP server @xxx/yyy`
- **解决**: 检查server_id格式是否正确，确认MCP服务确实存在

### 4. 网络错误
- **问题**: 各种网络相关异常
- **解决**: 检查网络连接，考虑使用重试机制