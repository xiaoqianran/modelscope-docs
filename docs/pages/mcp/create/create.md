<!-- modelscope-docs: Creating MCP Services | mcp/create/create_EN.md -->

To facilitate users in quickly submitting open-source MCP Servers to the ModelScope MCP Plaza, we provide the **Create MCP Service** feature. Now, you can easily integrate your AI services or tools into the ModelScope platform and share them with more users!
This article will detail how to create your MCP service on the ModelScope platform.

# Prerequisites

Creating and submitting a new MCP service in the ModelScope community typically requires completing the following steps in advance:

1. Complete MCP service code development
2. Publish MCP service to NPM/Pypi (optional, but required if providing STDIO type service configuration and hoping for hosting deployment)
3. Open source MCP service source code to a Github repository (optional)
4. Provide STDIO/StreamableHTTP/SSE type service configuration (providing one or multiple types is acceptable; if providing StreamableHTTP/SSE types, public network service links need to be prepared in advance.)
5. Provide usage configuration and guidance for the MCP service

The ModelScope community encourages community users to build fun and useful MCP services and actively contribute them to the community. Therefore, we encourage you to publish your MCP services to package managers like NPM and Pypi while opening them up, provide detailed usage instructions and service configuration information, and maintain them continuously, which greatly benefits the experience for community users getting started.

# Creating and Submitting Your MCP Service on ModelScope
After completing development and construction, you can start creating and submitting your MCP service in the ModelScope community.

## Go to MCP Creation Page
The creation entry is located at the top right corner of the MCP Plaza homepage, or you can click [here](https://modelscope.cn/mcp/servers/create) to go directly. To balance convenience and flexibility, we provide community users with two methods: "Quick Create from GitHub Repository" and "Custom Create". When entering through the homepage creation entry, it defaults to "Quick Create from GitHub Repository", and you can switch to custom creation in the top left corner.
![Creation Entry](./_resources/create_entrance.png)

## Quick Create from GitHub Repository (Recommended)
If you have already open-sourced and hosted your MCP service code and related usage instructions on GitHub, we recommend using quick creation to submit your MCP service. The ModelScope community will automatically parse your repository information, confirm the completeness of essential fields, and then complete the creation directly.

> Currently, quick creation only supports cases where valid STDIO type service configuration is provided in the Github repository README body.

### Fill Out Creation Form

On the [Quick Create](https://modelscope.cn/mcp/servers/create) page, you only need to fill in the following core information:

![Quick Create](./_resources/quick_create.png)

- Github Address: Fill in the GitHub repository link corresponding to your MCP service. Ensure that the root directory of the repository contains a Readme.md file whose main content introduces the usage guide and service configuration of the MCP service.
- English Name: The English name will be used together with your selected owner name to form the MCP service ID, in the format owner_name/mcp_server_name.
- Display Name: Optional, the main name displayed on distribution cards throughout the ModelScope community.
- Owner: Defaults to "Current User". You can also click to modify and choose to assign the MCP service to an "Organization" you belong to.
- Public: Defaults to "Public" and currently only supports public.
- Hosting Type: You can choose "Local Only" and "Can be Hosted Deployed". To facilitate community users, we strongly encourage MCP service contributors to provide judgments on whether they are suitable for hosting deployment. If choosing "Local Only", it means the creator believes using this MCP service depends on certain local resources or other reasons, making it unsuitable for remote hosting deployment; the platform will automatically skip automatic deployment detection for this MCP service, and the tool testing page does not support viewing the available tool list. If choosing "Can be Hosted Deployed", the platform will attempt to perform automatic deployment detection on this MCP service, and upon passing, will provide community users with hosting deployment connection services for this MCP service.
- Service Icon: Submit the icon for the current MCP service to establish user brand recognition for the MCP service.

### Confirm Creation and Automatic Parsing

After filling out, click the "Create" button in the bottom right corner. The system will enter "Creating" and prompt to wait for automatic parsing to complete. If the GitHub repository address you submitted has already been submitted by other users, the system will pop up a prompt and list existing MCP services pointing to that address. You can browse and decide whether to continue creating.

During the creation process, the system will automatically parse and extract the following information and perform mandatory validation on some fields:

- **Service Introduction**: Extracted from the Readme.md file in the repository root directory. If empty, quick creation will be interrupted.
- Service Description: Summarized by AI based on the content of the Readme.md body.
- Type: Selected by AI from candidate categories based on the content of the Readme.md body.
- **Service Configuration**: Extracted from the Readme.md file (Server config). If empty, quick creation will be interrupted.
- Environment Variable Configuration: Automatically extracted from the service configuration, extracting key-value pairs named `env` and parsing them sequentially.

Among these, service introduction and service configuration are mandatory validation fields. If successful parsing cannot be achieved, quick creation will be interrupted, and you will be directed to [Custom Create](https://pre.modelscope.cn/mcp/servers/create?template=customize).

After successful creation, the page will automatically redirect to the "Settings" tab of the MCP service. At this point, you will see all the basic field information of the MCP service, including those filled in during creation and those automatically parsed by AI. You can further edit basic field information on the settings page to ensure accuracy.

## Custom Create

If you want to completely manually fill in the basic information of the MCP service, or if your code is not open-sourced to GitHub, you can choose custom creation. You can switch to the custom creation page through the dropdown menu in the top left corner of the creation page, or click [here](https://modelscope.cn/mcp/servers/create?template=customize) to go directly.

On the custom creation page, you need to manually fill in all fields:

![Custom Create](./_resources/customize_create.png)

After filling out, click the "Create" button, and your MCP service will be created successfully and redirected to the service details page.

In custom creation mode, the platform provides three ways to create MCP services. After quick creation through a Github repository, you can also modify or supplement related settings in the MCP service settings page.

1. STDIO: You can package and publish your MCP to Pypi or npm platforms. MCP services created using this method will be hosted and deployed by the platform.

2. StreamableHttp: Provide a publicly accessible deployed MCP service link, and the interface format is Streamable Http format. The configuration format is as follows:
```json
{
    "mcpServers": {
        "my-mcp": {
            "type": "streamable_http",
            "url": "https://example.my.endpint/mcp"
        }
    }
}
```
Parameter configuration is also supported, including two types: URL parameters and request header parameters.

![Creation Entry](./_resources/mcp_param.png)

When adding "Request Header" parameters, simply fill in the parameter name and test value according to the situation. When adding "URL parameters", ensure that the parameter name corresponds to the "template variable" in the service configuration URL of the corresponding type. We use template variables enclosed in `<>` to identify parameters that need values passed.

Here are two examples:
- Query parameters

For example, if your service configuration information is as follows, where you need to provide a URL query parameter with the key name test_param, you need to enclose the query parameter value in the service configuration URL with `<>` to indicate that this value is a template variable.
```json
{
    "mcpServers": {
        "my-mcp": {
            "type": "streamable_http",
            "url": "https://example.my.endpint/mcp?test_param=<Test_Param>"
        }
    }
}
```
At the same time, you need to add parameters for this service configuration, filling in as follows:

(Note: Test values must be valid, otherwise deployment detection will fail).

- Path parameters

For example, if your service configuration information is as follows, where you need to provide a URL path parameter with the key name test_param, you need to enclose the path parameter value in the service configuration URL with `<>` to indicate that this value is a template variable.
```json
{
    "mcpServers": {
        "my-mcp": {
            "type": "streamable_http",
            "url": "https://example.my.endpint/mcp/<Test_Param>"
        }
    }
}
```
At the same time, you need to add parameters for this service configuration, filling in the same as the above "Query Parameter" example.

3. SSE: Provide a publicly accessible deployed MCP service link, and the interface format is SSE format. The configuration format is as follows:
```json
{
    "mcpServers": {
        "my-mcp": {
            "type": "sse",
            "url": "https://example.my.endpint/sse"
        }
    }
}
```
Parameter configuration is similar to StreamableHttp.

# Automated Deployment Detection
Regardless of which creation method you choose, after successfully creating an MCP service, the platform will decide whether to execute automatic deployment detection based on the "Hosting Type" you set.

If you set it to "Can be Hosted Deployed", the platform will immediately start deployment detection to confirm whether your MCP service can be deployed. If the final deployment detection is not passed, even if the hosting type you set during creation was "Can be Hosted Deployed", the current MCP service will still not be hosted and deployed, and the page will not display `deployable` and `hosted` labels.

The core steps of deployment detection are as follows:

1. **Service Configuration Parsing**: Check if the service configuration field has a value
- Generally speaking, when entering the deployment detection state through any creation method, this item has already passed detection.
<br>
2. **Validate Service Configuration Availability**: Detect the JSON integrity, key-value pairs, etc. of the filled service configuration
- Currently supports hosting and deploying STDIO type service configurations, and proxy forwarding for StreamableHttp and SSE type service configurations. When providing multiple types of service configurations, we default to selecting one for deployment detection in the order of STDIO > StreamableHttp > SSE priority. If the deployment of that type of service configuration fails, we will not deploy other types of service configurations.
- For STDIO type service configurations, currently only service configurations with the `command` field value of `npx` and `uvx` can pass this detection step;
- Comments are temporarily not supported in the service configuration JSON code block, otherwise detection cannot pass;
- When multiple service configurations are provided, the platform currently defaults to using the first service configuration for deployment and detection.
<br>
3. **Try to deploy and connect to the MCP service**:
- STDIO type service configuration
    - Get the package name from the `args` field of the service configuration, and download and install the corresponding development toolkit from NPM/Pypi;
    - Try to deploy and connect to the MCP service;
    - After successful connection, automatically call the list_tools method. If the request succeeds, the detection passes; otherwise, it fails.
- StreamableHTTP/SSE type service configuration
    - Parse and fill in necessary path parameters or request header parameters
    - Connect to the public network link of the MCP service and try to forward through the ModelScope MCP service proxy
    - After successful connection, automatically call the list_tools method. If the request succeeds, the detection passes; otherwise, it fails.

When your MCP service passes the deployment detection of the above three steps, the platform will label it as `deployable`, and if it is a public MCP service, it will also be labeled as `hosted`.

## Tips for STDIO Service Configuration to Pass Deployment Detection
- Currently, hosting and deploying from downloading source code from GitHub repositories or providing remote URLs directly is not supported. Please ensure that the engineering code of the MCP Server you developed has been packaged and published to NPM/Pypi so that the platform can complete the download and installation successfully.
- Ensure that the `args` field in the service configuration correctly specifies the MCP Server package name, and does not require providing any local absolute paths or parameters that require users to fill in themselves.
- Ensure that the `command` field value in the service configuration is either `npx` or `uvx`. When providing multiple service configurations, ensure that the first service configuration in the array meets this requirement.
- It is recommended to consolidate environment variables in the `env` field. If designing them in startup parameters is necessary, use uppercase format, such as `--api-key=YOUR_API_KEY`.
- In the JSON data of the service configuration, ensure there are no comments.
- It is recommended to uniformly add the `@latest` suffix to the NPM/Pypi package names provided in the service configuration so that community users can always use the latest version when connecting.

## Notes
- Not all MCP services are suitable for deployment to remote use, which often relates to whether the MCP service depends on local resources, whether there are potential security issues with remotely hosting and deploying the service, etc. Therefore, when creating and submitting, we strongly urge you to carefully judge and accurately set the hosting type of the MCP service.
- The current automated deployment detection strategy only verifies successful calls to the list_tools method. Factors such as whether the hosted MCP service depends on local resources, whether the APIs it relies on are functioning normally, etc., cannot be fully covered by the detection strategy. Therefore, not every tool of all platform-hosted MCP services can be used normally. We recommend that after connection is completed, you manually test the tools of interest on the tool testing page. If you have any problems, please feel free to contact us to provide feedback.

Now you have understood the entire process of creating an MCP service on ModelScope. Welcome to participate in contributions together!