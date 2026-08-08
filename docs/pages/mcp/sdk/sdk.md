<!-- modelscope-docs: MCP SDK Interface | mcp/sdk/sdk_EN.md -->

# MCP SDK Interface

## ModelScope SDK MCP API Function Quick Reference
| Function Name                      | Core Purpose               | Typical Return Content           |
|------------------------------------|----------------------------|----------------------------------|
| `list_mcp_servers`                 | Query MCP services         | MCP service list, total count, etc. |
| `list_operational_mcp_servers`     | Query your activated MCP services | Callable addresses (SSE/Streamable HTTP, etc.) |
| `get_mcp_server`                   | Single MCP service details query | Description, parameters, callable address |

## 1. Initialization

Before using MCP SDK functions, you need to complete the following preparations to provide the basic environment for all calls:

- **How to obtain access token (token)**: Obtain the SDK TOKEN from [ModelScope Access Token](https://modelscope.cn/my/myaccesstoken)
- **Usage rules**: After passing the token, more MCP service information can be obtained. After logging in via the interface, developers do not need to pass the token additionally.

```python
# pip install modelscope

from modelscope.hub.mcp_api import MCPApi

# Initialize the instance
api = MCPApi()
api.login("YOUR_MODELSCOPE_TOKEN")
```

## 2. Function List

### 1. `list_mcp_servers`: Batch Query MCP Services
#### Function
Get the MCP service list, support filtering by category, tags, and keyword search, suitable for batch retrieval of MCP service resources.

#### Core Parameters
| Parameter Name | Purpose                                                                 | Example Value                          |
|----------------|-------------------------------------------------------------------------|----------------------------------------|
| `token`        | Optional, pass to get more MCP service information                     | `token=token`                          |
| `filter`       | Optional, filter by `category`, `tag`, `is_hosted`                     | `filter={"category": "vision", "is_hosted": True}` |
| `total_count`  | Optional, limit return quantity (1-100, default 20)                    | `total_count=50`                       |
| `search`       | Optional, search by service Chinese name, service English name, author/owner username | `search="地图"`                        |

#### Return Data Structure
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

#### Sample Code
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

### 2. `list_operational_mcp_servers`: Query Activated Runnable MCP Services
#### Function
Get the list of MCP services deployed by the user, including actual call addresses (such as SSE, HTTP stream interfaces), suitable for viewing MCP services that can be used directly.

#### Core Parameters
| Parameter Name | Purpose                          | Description                          |
|----------------|----------------------------------|--------------------------------------|
| `token`        | Required if not logged in        | Will throw permission error if not logged in or token not passed |

#### Return Data Structure
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

#### Sample Code
```python
operational_servers = api.list_operational_mcp_servers()

# Get MCP server information
for server in operational_servers['servers']:
    print(f"name: {server['name']}")

    # Get the URL
    for mcp_server in server['mcp_servers']:
        print(f"  {mcp_server['type']}: {mcp_server['url']}")
```

### 3. `get_mcp_server`: Query Detailed Information of a Single MCP Service
#### Function
Get detailed configuration of the specified MCP service (such as description, call address, parameter description, etc.), suitable for in-depth understanding of specific capabilities of MCP services.

#### Core Parameters
| Parameter Name | Purpose                                  | Description                          |
|----------------|------------------------------------------|--------------------------------------|
| `server_id`    | Required, MCP service unique identifier (format: `@group/name`) | Can be obtained from `list_mcp_servers` results or MCP Plaza |
| `token`        | Optional, log in or pass manually to get more information | Can be omitted              |

#### Return Data Structure
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

#### Sample Code
```python
server_info = api.get_mcp_server(server_id="@modelscope/ocr-server")

# Get basic information of the MCP server
print(f"name: {server_info['name']}")
print(f"description: {server_info['description']}")

# Get the MCP server config
for server_config in server_info['servers']:
    print(f"{server_config['type']}: {server_config['url']}")
```

## 3. Common Issues and Solutions

### 1. Authentication Related
- **Issue**: `Authentication failed: no valid cookies found`
- **Solution**: Ensure to pass a valid token or call `api.login()` first

### 2. Parameter Validation
- **Issue**: `total_count must be between 1 and 100`
- **Solution**: Ensure the `total_count` parameter is within the range of 1-100

### 3. MCP Service Does Not Exist
- **Issue**: `Failed to get MCP server @xxx/yyy`
- **Solution**: Check if the server_id format is correct and confirm that the MCP service actually exists

### 4. Network Errors
- **Issue**: Various network-related exceptions
- **Solution**: Check network connection, consider using retry mechanism