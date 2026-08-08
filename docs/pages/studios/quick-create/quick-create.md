<!-- modelscope-docs: Quick Creation and Deployment | studios/quick-create/quick-create_EN.md -->

This article introduces how to quickly create and deploy project code to ModelScope Studios.

# Introduction to Quick Creation and Deployment

You can navigate to the [Studios List Page - Create Studio - Programmatic Studio](https://modelscope.cn/studios/create?template=quick) page and switch to "Quick Deploy and Create" mode using the top title bar. The creation process can be roughly divided into the following four steps:

1. Fill in basic information
2. Generate the `ms_deploy.json` deployment configuration file and other necessary dependency files for deployment
3. Upload project files
4. Confirm creation and deployment

## Prerequisites
- Prepare your project code files locally
- Ensure that the project code can build and run properly

## Step 1: Fill in Basic Information
Fill in basic information including your studio's English name, Chinese name, owner, license type, visibility status, studio description, cover image, etc.

## Step 2: Write Configuration Files in Your Local Project

ModelScope defines a JSON-formatted deployment configuration file called `ms_deploy.json` to provide necessary configuration fields to the platform's "Quick Create and Deploy" mode. These fields include but are not limited to:

- sdk_type: Deployment SDK type. Valid values are one of "gradio", "streamlit", "static", or "docker".
- sdk_version: SDK version. When sdk_type="gradio", you must provide detailed gradio version information according to the sdk_version enumeration values listed in the json_schema.
- base_image: Base image version. When sdk_type="gradio" or sdk_type="streamlit", you must provide detailed image version information according to the base_image enumeration values listed in the json_schema.
- resource_configuration: Associated cloud resources. Configure appropriate cloud resources for your deployment project. When selecting "Quick Create and Deploy", valid values are "platform/2v-cpu-16g-mem", "xgpu/8v-cpu-32g-mem-16g", or "xgpu/8v-cpu-64g-mem-48g". Other personal cloud resources are not currently supported. If you need to select xgpu resources, please first apply to join the [「xGPU Playground」](https://www.modelscope.cn/organization/xGPU-Explorers) organization. You can only activate xGPU trial eligibility after approval; otherwise, an error will occur. For more details, please refer to the [xGPU Studio Introduction Document](./xGPU创空间介绍.md).
- environment_variables: Environment variables. Environment variables that the project must depend on during runtime, provided as a dictionary type where "name" is the environment variable name and "value" is the environment variable value.
- port: Service port. When sdk_type="docker", the port field must be provided, and the current required value is 7860.

For detailed configuration file fields and related explanations, please obtain them through the [JSON Schema](https://modelscope.cn/api/v1/studios/deploy_schema.json) and complete the configuration file writing according to the schema. You can manually complete the writing based on the relevant instructions, or provide the ms_deploy.json Schema requirements and related project files to an AI programming tool to assist with generation.

### ms_deploy.json Examples
A complete, suitable configuration file example for platform deployment submission is as follows:

1. Gradio Type
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

2. Docker Type
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

3. Static Type
```json
{
	"$schema": "https://modelscope.cn/api/v1/studios/deploy_schema.json",
	"sdk_type": "static",
	"resource_configuration": "platform/2v-cpu-16g-mem",
}
```

## Step 3: Upload Project Files
After completing the configuration file generation in the above steps, please place `ms_deploy.json` in the root directory of your project files. Then you can upload the folder by clicking or dragging and dropping it. The studio service will automatically parse the project folder to determine whether it contains the `ms_deploy.json` configuration file and whether the necessary configuration fields are provided.

![Create and Upload Project](./_resources/创建并上传项目.png)

## Step 4: Confirm Creation and Deployment
Click the "Confirm Create and Deploy" button, and the system will start creating and deploying the project. The entire process will be divided into four steps:
- Validate uploaded files
- Push to Git and validate
- Update deployment information
- Apply deployment

![Quick Creation and Deployment Process](./_resources/快速创建并部署流程.png)

After the first three steps are completed, the application status will change to `Publishing`, and remain in this state for a short period until deployment succeeds (`Running`) or fails (`Runtime Error`). During this process, you can随时 **view logs** at any time to understand the build phase and runtime phase logs of your application, helping you troubleshoot issues and find solutions.

If any step fails, you can directly retry the current step, or troubleshoot based on **popup prompts** or by **viewing logs**, then fix the issue in your local project files and **re-upload and deploy**.

After successful deployment, you can see the "Studio Content" module correctly displaying your project page, with the studio status showing `Running`.

# Example: Deploying a Project to Studio via AI
This section introduces a concrete example of successfully deploying an actual project to ModelScope Studio using AI assistance and the "Quick Create and Deploy" mode.

## Project File Introduction
The project to be deployed is a HelloWorld application with a simple frontend and backend service. Its main functionality and UI interface are shown in the figure below.

![HelloWorld Application Local Preview](./_resources/HelloWorld应用本地预览.png)

When a username is submitted, the system returns a welcome message: "Welcome to ModelScope, {username}!". The example project directory structure is as follows:

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

## Generating Deployment Configuration Files via AI
In this example, we use the Cline plugin installed in Visual Studio Code as a Coding Copilot, with the model API set to Alibaba Cloud Bailian's `qwen3-coder-plus`, and Cline's default Act mode enabled.

### Step 1: Input Deployment Prompt to AI

```shell
I now need to deploy this project to a production environment, targeting ModelScope Studio. Please thoroughly read the entire project and, according to ModelScope Studio's deployment schema requirements, help me develop a deployment plan and generate ms_deploy.json along with other necessary deployment configuration files.
Schema reference: "https://modelscope.cn/api/v1/studios/deploy_schema.json"
Important notes:
- The project already runs locally, so please try to avoid or minimize changes to the project code files themselves to prevent introducing additional issues.
- If Docker deployment is required, please try to directly pull Docker images from Docker official that already have the necessary dependencies installed, reducing installation during build time to avoid introducing more problems.
```

#### AI Begins Executing Tasks and Outputs Process

- Analyzes project structure and reads project files

```
I need to analyze the current project and develop a ModelScope Studio deployment plan. First, let me examine the project file contents to understand the project structure and functionality.

From the environment information, I can see the project includes:

- backend/: containing app.py and requirements.txt
- frontend/: containing index.html, script.js, style.css
- start_backend.sh: backend startup script
- README.md

I need to first check the contents of these files to understand the specific implementation of the project.
```
Then sequentially reads the contents of the relevant files.

- Summarizes project information and continues reading ModelScope deployment configuration requirements

```
Now I understand the project structure:

- This is a frontend-backend separated project
- Backend uses Flask framework, listening on port 8080
- Frontend is static HTML/CSS/JS, calling backend API via AJAX
- Project needs to be deployed to ModelScope Studio

Next, I need to research ModelScope Studio's deployment requirements. According to the schema URL provided by the user, I need to access this schema to understand the specific requirements for deployment configuration.
```
Then executes `curl https://modelscope.cn/api/v1/studios/deploy_schema.json` command to read information from deploy_schema.json.

- Summarizes task progress
```
I need to continue completing the deployment plan. According to ModelScope Studio's requirements, I need to plan how to deploy this frontend-backend separated application.

<task_progress>

- [x] Analyze project structure and code
- [x] Research ModelScope Studio deployment requirements
- [x] Plan deployment configuration
- [ ] Generate ms_deploy.json
- [ ] Create necessary deployment files
- [ ] Verify deployment configuration </task_progress>
```

- Creates `ms_deploy.json`
```
Now I need to generate the deployment configuration file. According to ModelScope Studio's schema, I need to create the ms_deploy.json file. For this frontend-backend separated application, I will use Docker deployment mode.
```
Content as follows:
```json
{
  "sdk_type": "docker",
  "resource_configuration": "platform/2v-cpu-16g-mem",
  "port": 7860
}
```

- Creates other necessary deployment files Dockerfile
```
Now I need to create a Dockerfile to build the container image. ModelScope Studio requires the Docker image to expose port 7860, but I need to modify the backend application to listen on port 7860 instead of port 8080. Additionally, I need to modify the frontend code to adapt to the new API address.
```
Content as follows:
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

- Modifies frontend code
```
Now I need to modify the frontend code so it can correctly call the backend API in the production environment. Since ModelScope Studio requires the application to run on port 7860, I need to modify the frontend's API base URL to point to the correct backend address. In the production environment, frontend and backend will run on the same port, so the frontend should directly call relative paths.
```
Modified content for `/frontend/script.js` file:
```shell
------- SEARCH
// API configuration
const API_BASE_URL = 'http://localhost:8080';
=======
// API configuration - In ModelScope Studio, frontend and backend run on the same port
const API_BASE_URL = '';
+++++++ REPLACE
```
Then AI continues with subsequent necessary verification steps until determining the task is complete, and outputs the following summary:

- First round task completion and summary
```text
I have completed the ModelScope Studio deployment configuration, which includes the following:

1. Created the `ms_deploy.json` configuration file:

   - Set "sdk_type": "docker" to use Docker deployment mode
   - Set "resource_configuration": "platform/2v-cpu-16g-mem" to use free resource configuration
   - Set "port": 7860 to comply with ModelScope Studio requirements

2. Created the `Dockerfile`:

   - Used python:3.10-slim as the base image
   - Installed backend dependencies (Flask, flask-cors, gunicorn)
   - Copied all frontend and backend files
   - Exposed port 7860
   - Used Gunicorn to start the backend service, binding to port 7860

3. Modified frontend code `frontend/script.js`:

   - Updated API_BASE_URL to an empty string so the frontend can correctly call the backend API in the production environment

The entire deployment solution uses Docker deployment mode, deploying both frontend and backend in a single container, running the Flask application via Gunicorn and listening on port 7860, fully complying with ModelScope Studio's deployment requirements.

The project code remains largely unchanged, with only necessary adjustments made to deployment-related configurations, minimizing the risk of introducing new issues.
```

### Step 2: Quick Create and Deploy Studio

After receiving AI's output confirmation, we navigate to the [Studios List Page - Create Studio - Programmatic Studio](https://modelscope.cn/studios/create?template=quick) page and switch to "Quick Deploy and Create" mode using the top title bar to start creating the studio. After entering the necessary basic information, we upload the entire project folder processed by AI in the first round and create/deploy the studio.

![Create and Upload Project](./_resources/创建并上传项目.png)

The platform begins gradually processing preliminary work and application deployment tasks:

![Quick Creation and Deployment Process](./_resources/快速创建并部署流程.png)

After waiting a short while, the project correctly changes to `Running`, but we notice the frontend page doesn't load correctly:

![HelloWolrd Deployment Result 1](./_resources/HelloWolrd部署结果1.png)

### Step 3: Input Problem Logs and Information to AI

We click the "..." in the top right corner and select "View Logs", switch to "Runtime Logs" to read and copy the logs. Then we send the logs along with the frontend page display text to AI for processing:

```text
Runtime logs as follows:
[2026-01-13 15:49:22] =========== Begin Of Program (name: /bin/sh) ===========
[2026-01-13 15:49:22] [/bin/sh]: [2026-01-13 07:49:22 +0000] [1104] [INFO] Starting gunicorn 21.2.0
[2026-01-13 15:49:22] [/bin/sh]: [2026-01-13 07:49:22 +0000] [1104] [INFO] Listening at: http://0.0.0.0:7860 (1104)
[2026-01-13 15:49:22] [/bin/sh]: [2026-01-13 07:49:22 +0000] [1104] [INFO] Using worker: sync
[2026-01-13 15:49:22] [/bin/sh]: [2026-01-13 07:49:22 +0000] [1120] [INFO] Booting worker with pid: 1120

The runtime was successful, but it seems only the backend service is running. The frontend page displays:
{"status":"Backend API is running"}
```

#### AI Begins Solving the Problem and Outputs Process

- Modifies backend service to add static page hosting

```
I understand the issue. The current configuration only starts the backend Flask service without providing access to frontend HTML files. To make the frontend page accessible, I need to add static file serving functionality to the Flask application so that frontend pages can be accessed via the web server.

Let me modify the backend application to provide frontend static file serving:
```

Continues to modify `/backend/app.py` file to add static file serving functionality:

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

# Configure static file directory pointing to frontend folder
app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)  # Enable CORS for cross-origin requests from frontend
+++++++ REPLACE
```

- Modifies backend service to define frontend index.html routing

Further modifies backend `/backend/app.py` file to ensure root path '/' returns frontend's index.html file

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

- Problem resolution and summary

```text
I have completed the ModelScope Studio deployment configuration, which includes the following:

1. Created the `ms_deploy.json` configuration file:

   - Set "sdk_type": "docker" to use Docker deployment mode
   - Set "resource_configuration": "platform/2v-cpu-16g-mem" to use free resource configuration
   - Set "port": 7860 to comply with ModelScope Studio requirements

2. Created the `Dockerfile`:

   - Used python:3.10-slim as the base image
   - Installed backend dependencies (Flask, flask-cors, gunicorn)
   - Copied all frontend and backend files
   - Exposed port 7860
   - Used Gunicorn to start the backend service, binding to port 7860

3. Modified backend code `backend/app.py`:

   - Added support for frontend static files, enabling the Flask application to serve frontend HTML, CSS, and JS files
   - Configured root path '/' to return index.html
   - Configured '/<path:path>' to return other static resource files
   - Preserved existing API endpoints

4. Modified frontend code `frontend/script.js`:

   - Updated API_BASE_URL to an empty string so the frontend can correctly call the backend API in the production environment

The entire deployment solution uses Docker deployment mode, deploying both frontend and backend in a single container, running the Flask application via Gunicorn and listening on port 7860. The Flask application provides both backend API services and frontend static file serving, fully complying with ModelScope Studio's deployment requirements.

The project code remains largely unchanged, with only necessary adjustments made to deployment-related configurations, minimizing the risk of introducing new issues.
```

### Step 4: Re-upload and Deploy
Click the "..." in the top right corner of the current studio to open more operations, select "Re-upload and Deploy", re-add the project folder, and confirm "Upload and Deploy". Re-enter the deployment process and wait a short while, then the project runs successfully:
![Helloworld Deployment Success](./_resources/Helloworld部署成功.png)

Thus, we can see that the project has been successfully deployed and is running on ModelScope Studio with the frontend page working correctly. Due to differences between local and cloud environments, the AI-assisted deployment process requires us to patiently review the problem logs from each deployment attempt and correctly feedback the logs, related information, and deployment status to AI. Generally, through multiple rounds of interaction with AI, deployment issues will gradually be resolved and converge, ultimately achieving successful deployment and operation.