<!-- modelscope-docs: MCP Deployment Service Usage Limits | mcp/limits/limits_EN.md -->

The ModelScope MCP Plaza provides service hosting for MCP Servers listed on the platform that are suitable for remote calls through MCP deployment services, and offers developers certain **free deployment resources** for experience. For specific usage methods, please refer to the [Introduction Document](./MCP Plaza Introduction.md).

To serve developers as widely as possible under limited platform resources and ensure fairness in resource usage, the MCP deployment service sets clear limits on the usage quota and concurrent capabilities of free resources, and will dynamically adjust based on real-time resource load conditions. The specific rules are as follows:

# MCP Service Deployment Usage Limits
- Resource Types: The platform provides two deployment options: "Platform Free Resources" and "Personal Dedicated Cloud Resources". Among these, free resources are intended to support developers in experiencing MCP service hosting and remote calls; for commercial or production environment use, it is recommended to use personal dedicated cloud resources for deployment.
- Deployment Quantity Limit: Each user can create up to **20** free-deployed MCP services, and each MCP service is allowed to have at most **1** free-deployment instance.
- Request Rate Limit: To ensure fairness, the total number of requests for all free-deployed MCP services within any 5-second window shall not exceed 500 times, and individual user MCP request numbers are limited to 50,000 times. Note: Requests include all request types of MCP services, including initialize, tool list, tool call, etc.

> ⚠️ Important Notice: Free deployment resources are not suitable for high-concurrency scenarios or online tasks that require SLA guarantees. For stability and performance requirements, please choose personal dedicated cloud resource deployment.