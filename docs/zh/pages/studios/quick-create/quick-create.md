<!-- modelscope-docs: 快速创建并部署 | studios/quick-create/quick-create_CN.md -->

本文介绍如何快速创建并部署项目代码到魔搭创空间。

# 快速创建并部署介绍

您可以前往[创空间列表页-创建创空间-编程式创空间](https://modelscope.cn/studios/create?template=quick)页面，并通过顶部标题栏切换为“快速部署并创建”模式。创建过程大致可以分为以下四步：

1. 填写基础信息
2. 生成`ms_deploy.json`部署配置文件及其他部署必要的依赖文件
3. 上传项目文件
4. 确认创建并部署

## 前置依赖
- 在本地准备好项目代码文件
- 确保项目代码可以正常构建及运行

## 步骤1：填写基础信息
填写基础信息包括您的创空间英文名称、中文名、所有者、许可证类型、是否公开和创空间描述、封面图等。

## 步骤2：在本地项目中编写配置文件

魔搭定义了一套 `JSON` 格式的部署配置文件`ms_deploy.json`，以向平台“快速创建并部署”模式提供必要的配置字段。这些字段包括但不限于：

- sdk_type：部署 SDK 类型。可选值为"gradio", "streamlit", "static", "docker"之一。
- sdk_version：SDK版本。当sdk_type="gradio"时，需根据json_schema中sdk_version枚举值列表，提供详细的gradio版本信息。
- base_image：基础镜像版本。当sdk_type="gradio"或sdk_type="streamlit"时，需根据json_schema中base_image枚举值列表，提供详细的镜像版本信息。
- resource_configuration：关联的云资源。为待部署项目配置适合的云资源，当前选择“快速创建并部署时”可选值为"platform/2v-cpu-16g-mem", "xgpu/8v-cpu-32g-mem-16g", "xgpu/8v-cpu-64g-mem-48g"之一，暂不支持选择其他个人云资源。如需选择 xgpu 资源，请先申请加入 [「xGPU乐园」](https://www.modelscope.cn/organization/xGPU-Explorers) 组织，审批通过后才能开通 xGPU 体验资格，否则将会报错，详情可阅读 [xGPU创空间介绍文档](./xGPU创空间介绍.md)了解。
- environment_variables：环境变量。项目运行期间必须依赖的环境变量，为字典类型，name为环境变量名称，value为环境变量值。
- port：服务端口。当sdk_type="docker"时，必须提供port字段，当前必须填写值为7860。

详细的配置文件字段及相关说明，请通过 [JSON Schema](https://modelscope.cn/api/v1/studios/deploy_schema.json) 获取，并根据schema完成配置文件编写。您可以根据相关说明手动完成编写，也可以通过将 ms_deploy.json 的 Schema 要求及相关项目文件提供给 AI 编程工具，通过 AI 辅助生成。

### ms_deploy.json 示例
一个完整、适合提交给平台部署的配置文件示例如下：
1. Gradio类型
```json
{
  "sdk_type": "gradio",
  "sdk_version": "6.2.0",
  "resource_configuration": "platform/2v-cpu-16g-mem",
  "base_image": "ubuntu22.04-py311-torch2.3.1-modelscope1.31.0",
  "environment_variables": [
    {"name": "MODEL_NAME", "value": "my-model"},
    {"name": "API_KEY", "value": "sk-xxxxxx"}
  ]
}
```
2. Docker类型
```json
{
	"$schema": "https://modelscope.cn/api/v1/studios/deploy_schema.json",
	"sdk_type": "docker",
	"resource_configuration": "platform/2v-cpu-16g-mem",
	"port": 7860,
    "environment_variables": [
        {"name": "MODEL_NAME", "value": "my-model"},
        {"name": "API_KEY", "value": "sk-xxxxxx"}
  ]
}
```
3. Static类型
```json
{
	"$schema": "https://modelscope.cn/api/v1/studios/deploy_schema.json",
	"sdk_type": "static",
	"resource_configuration": "platform/2v-cpu-16g-mem",
}
```
## 步骤3：上传项目文件
在完成上述步骤的配置文件生成后，请将 `ms_deploy.json` 置于项目文件根目录中。然后您可以通过点击或拖拉拽上传文件夹，创空间服务将会自动解析项目文件夹，判断是否具备 `ms_deploy.json` 配置文件及必要配置字段是否提供。

![创建并上传项目](./_resources/创建并上传项目.png)

## 步骤4：确认创建并部署
点击“确认创建并部署”按钮，系统将开始创建并部署项目。整个步骤将分为四步：
- 检验上传文件
- 推送至Git并校验
- 更新部署信息
- 应用部署

![快速创建并部署流程](./_resources/快速创建并部署流程.png)

当前三个步骤执行完成后，应用状态将变更为`发布中`，并在此状态保持少许时间直到部署成功`运行中`或部署失败`运行错误`。在这个过程中，您可以随时**查看日志**，了解应用在构建阶段、运行阶段的日志，帮助排查问题、找到解决方案。

如果某一步执行失败，您可以直接重试当前步骤，也可以根据**弹出提示**或通过**查看日志**进行排查，并于本地项目文件修复问题后**重新上传并部署**。

部署成功后，您可以看到“空间内容”模块正确展示项目页面，空间状态展示`运行中`。

# 示例：通过 AI 部署项目到创空间
本部分介绍通过 AI 辅助 及”快速创建并部署“模式，成功部署实际项目到魔搭创空间的一个具体例子。

## 项目文件介绍
待部署项目为一个带简单前后端服务的 HelloWorld 应用，其主要功能及 UI 界面如下图所示。

![HelloWorld应用本地预览](./_resources/HelloWorld应用本地预览.png)

当提交用户名称后，系统将返回欢迎信息：“Welcome to ModelScope, {用户名称}!”。示例项目目录如下：

```markdown
HelloWorld/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/
│   ├── app.py
│   └── requirements.txt
├── README.md
└── .start_backend.sh
```

## 通过 AI 生成部署配置文件
本例使用 Visual Studio Code中安装的 Cline 插件 作为 Coding Copilot，模型 API 设置为阿里云百炼提供的`qwen3-coder-plus`，启用 Cline 默认的 Act 模式。

### 步骤1：向 AI 输入部署提示词

```shell
现在我需要在生产环境部署这个项目，目标环境是魔搭创空间。请完整阅读整个项目，并根据魔搭创空间部署schema要求，帮我制定部署方案，并生成ms_deploy.json及其他必要的部署配置文件。
schema参见："https://modelscope.cn/api/v1/studios/deploy_schema.json"
注意事项：
- 当前项目已经能在本地运行，请务必尽量不改动或少改动项目代码文件本身，以避免引入更多问题。
- 如需选择Docker类型部署，请尽量直接从Docker官方拉取已经安装好必要依赖的Docker镜像文件，减少构建时安装，以免引入更多问题
```

#### AI 开始执行任务并输出过程

- 分析项目结构，阅读项目文件

```
我需要分析当前项目并制定魔搭创空间的部署方案。首先让我查看项目文件内容来了解项目的结构和功能。

从环境信息可以看到项目包含：

- backend/: 包含app.py和requirements.txt
- frontend/: 包含index.html, script.js, style.css
- start_backend.sh: 启动后端脚本
- README.md

我需要先查看这些文件的内容来了解项目的具体实现。
```
然后依次读取了相关文件的内容。

- 总结项目信息，继续阅读魔搭部署配置要求

```
现在我已经了解了项目结构：

- 这是一个前后端分离的项目
- 后端使用 Flask 框架，监听在 8080 端口
- 前端是静态 HTML/CSS/JS，通过 AJAX 调用后端 API
- 项目需要部署到魔搭创空间

接下来我需要研究魔搭创空间的部署要求。根据用户提供的 schema URL，我需要访问该 schema 来了解部署配置的具体要求。

```
然后执行 `curl https://modelscope.cn/api/v1/studios/deploy_schema.json` 命令，读取 deploy_schema.json 中信息。

- 总结任务进度
```
我需要继续完成部署方案的制定。根据魔搭创空间的要求，我需要计划如何部署这个前后端分离的应用。

<task_progress>

- [x] Analyze project structure and code
- [x] Research魔搭创空间部署要求
- [x] Plan deployment configuration
- [ ] Generate ms_deploy.json
- [ ] Create necessary deployment files
- [ ] Verify deployment configuration </task_progress>
```
- 创建 `ms_deploy.json`
```
现在我需要生成部署配置文件。根据魔搭创空间的 schema，我需要创建 ms_deploy.json 文件。对于这个前后端分离的应用，我将使用 Docker 部署模式。
```
内容如下：
```json
{
  "sdk_type": "docker",
  "resource_configuration": "platform/2v-cpu-16g-mem",
  "port": 7860
}
```
- 创建其他必要的部署文件 Dockerfile
```
现在我需要创建 Dockerfile 来构建容器镜像。魔搭创空间要求 Docker 镜像暴露 7860 端口，但我需要修改后端应用使其监听在 7860 端口而不是 8080 端口。同时，我还需要修改前端代码以适应新的 API 地址。
```
内容如下：
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Copy backend files
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/

# Copy frontend files
COPY frontend/ ./frontend/

# Expose port 7860 as required by ModelScope
EXPOSE 7860

# Start the backend server
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--workers", "1", "backend.app:app"]
```

- 修改前端代码
```
现在我需要修改前端代码，使其在生产环境中能够正确调用后端 API。由于魔搭创空间要求应用运行在 7860 端口，我需要修改前端的 API 基础 URL，使其指向正确的后端地址。在生产环境中，前后端将在同一个端口上运行，所以前端应直接调用相对路径。
```
`/frontend/script.js` 文件修改内容如下：
```shell
------- SEARCH
// API配置
const API_BASE_URL = 'http://localhost:8080';
=======
// API配置 - 在魔搭创空间中，前后端在同一端口上运行
const API_BASE_URL = '';
+++++++ REPLACE
```
然后 AI 继续完成后续必要检查步骤，直至判定任务完成，并输出总结如下：

- 第一轮任务完成并总结
```text
我已经完成了魔搭创空间的部署配置，具体包括以下内容：

1. 创建了 `ms_deploy.json` 配置文件：

   - 设置了 "sdk_type": "docker"，使用 Docker 部署模式
   - 设置了 "resource_configuration": "platform/2v-cpu-16g-mem"，使用免费资源配置
   - 设置了 "port": 7860，符合魔搭创空间的要求

2. 创建了 `Dockerfile`：

   - 使用 python:3.10-slim 作为基础镜像
   - 安装了后端依赖（Flask, flask-cors, gunicorn）
   - 复制了前后端所有文件
   - 暴露 7860 端口
   - 使用 Gunicorn 启动后端服务，绑定到 7860 端口

3. 修改了前端代码 `frontend/script.js`：

   - 更新了 API_BASE_URL 为空字符串，使前端在生产环境中能正确调用后端 API

整个部署方案采用 Docker 部署模式，将前后端合并部署在一个容器中，通过 Gunicorn 运行 Flask 应用并监听在 7860 端口，完全符合魔搭创空间的部署要求。

项目代码基本保持不变，仅对部署相关配置进行了必要的调整，最大程度减少了引入新问题的风险。
```
### 步骤2：快速创建并部署创空间

获得 AI 的输出确认后，我们前往[创空间列表页-创建创空间-编程式创空间](https://modelscope.cn/studios/create?template=quick)页面，并通过顶部标题栏切换为“快速部署并创建”模式，开始创建创空间。在输入必要的基础信息后，将第一轮AI处理后的项目文件夹，整体上传并创建、部署创空间。

![创建并上传项目](./_resources/创建并上传项目.png)

平台开始逐步处理前置工作及应用部署任务：

![快速创建并部署流程](./_resources/快速创建并部署流程.png)

等候稍许片刻后，项目正确转为`运行中`，但注意到前端页面未正确加载:

![HelloWolrd部署结果1](./_resources/HelloWolrd部署结果1.png)

### 步骤3：向 AI 输入问题日志与信息

我们点击右上角“...”的“查看日志”，切换到“运行日志”阅读并复制日志。然后将日志与前端页面展示的文本内容一并发送给AI处理：

```text
运行日志如下：
[2026-01-13 15:49:22] =========== Begin Of Program (name: /bin/sh) ===========
[2026-01-13 15:49:22] [/bin/sh]: [2026-01-13 07:49:22 +0000] [1104] [INFO] Starting gunicorn 21.2.0
[2026-01-13 15:49:22] [/bin/sh]: [2026-01-13 07:49:22 +0000] [1104] [INFO] Listening at: http://0.0.0.0:7860 (1104)
[2026-01-13 15:49:22] [/bin/sh]: [2026-01-13 07:49:22 +0000] [1104] [INFO] Using worker: sync
[2026-01-13 15:49:22] [/bin/sh]: [2026-01-13 07:49:22 +0000] [1120] [INFO] Booting worker with pid: 1120

运行成功了，但似乎只有后端服务运行了，前端页面显示的是：
{"status":"Backend API is running"}
```

#### AI开始解决问题并输出过程

- 修改后端服务，增加静态页面托管

```
我理解了问题所在。目前的配置只启动了后端Flask服务，没有提供前端HTML文件的访问。为了让前端页面也能被访问，我需要在Flask应用中添加静态文件服务功能，这样前端页面就可以通过Web服务器访问了。

让我修改后端应用以提供前端静态文件服务：
```

继续执行修改 `/backend/app.py 文件`，添加静态文件服务功能：

```shell
------- SEARCH
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests from frontend
=======
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

# 配置静态文件目录，指向frontend文件夹
app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)  # Enable CORS for cross-origin requests from frontend
+++++++ REPLACE
```

- 修改后端服务，定义前端index.html的路由

进一步修改后端 `/backend/app.py` 文件，确保根路径 '/' 返回前端的 index.html 文件

```shell
------- SEARCH
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'status': 'Backend API is running'})
=======
@app.route('/', methods=['GET'])
def serve_frontend():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)
+++++++ REPLACE
```

- 问题解决并总结

```text
我已经完成了魔搭创空间的部署配置，具体包括以下内容：

1. 创建了 `ms_deploy.json` 配置文件：

   - 设置了 "sdk_type": "docker"，使用 Docker 部署模式
   - 设置了 "resource_configuration": "platform/2v-cpu-16g-mem"，使用免费资源配置
   - 设置了 "port": 7860，符合魔搭创空间的要求

2. 创建了 `Dockerfile`：

   - 使用 python:3.10-slim 作为基础镜像
   - 安装了后端依赖（Flask, flask-cors, gunicorn）
   - 复制了前后端所有文件
   - 暴露 7860 端口
   - 使用 Gunicorn 启动后端服务，绑定到 7860 端口

3. 修改了后端代码 `backend/app.py`：

   - 添加了对前端静态文件的支持，使 Flask 应用可以提供前端 HTML、CSS、JS 文件服务
   - 配置根路径 '/' 返回 index.html
   - 配置 '/<path:path>' 返回其他静态资源文件
   - 保留了原有的 API 接口

4. 修改了前端代码 `frontend/script.js`：

   - 更新了 API_BASE_URL 为空字符串，使前端在生产环境中能正确调用后端 API

整个部署方案采用 Docker 部署模式，将前后端合并部署在一个容器中，通过 Gunicorn 运行 Flask 应用并监听在 7860 端口。Flask 应用既提供后端 API 服务，也提供前端静态文件服务，完全符合魔搭创空间的部署要求。

项目代码基本保持不变，仅对部署相关配置进行了必要的调整，最大程度减少了引入新问题的风险。
```

### 步骤4：重新上传并部署
点击当前创空间右上角“...”打开更多操作，选择“重新上传并部署”，重新添加项目文件夹，确认“上传并部署”。重新进入部署流程并等候稍许时间后，项目运行成功：
![Helloworld部署成功](./_resources/Helloworld部署成功.png)

至此，我们看到该项目已经成功在魔搭创空间完成部署，并成功运行了前端页面。由于本地环境与云端环境的差异，通过 AI 辅助部署的过程，需要我们耐心的查看每次部署的问题日志，并将日志及相关信息、部署状态正确的反馈给 AI 。一般来说，在与 AI 的多轮交互中，部署过程遇到的问题将会逐渐解决、收敛，最终实现成功部署并运行。
