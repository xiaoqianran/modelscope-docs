<!-- modelscope-docs: Docker Studio Introduction | studios/docker/docker_EN.md -->

ModelScope Studios support using custom [Docker containers](https://docs.docker.com/get-started/), suitable for applications beyond the scope of Gradio, Streamlit, and Static. Docker Studios enable users to break through the limitations of standard SDKs, supporting various types of applications including FastAPI, Golang, Phoenix, MLOps, and more.

This article introduces how to create, develop, and deploy a Docker Studio. It mainly includes the following steps:
1. Create a Docker Studio

2. Complete local project development and create a Dockerfile

3. Submit and deploy the application to Docker Studio

# Creating a Docker Studio
When [creating a Studio - Programmatic Studio](https://www.modelscope.cn/studios/create), select **Docker** as the SDK.
> According to relevant regulatory requirements, Docker Studios are only available to users who have completed real-name verification. Before use, please first [**bind your Alibaba Cloud account**](../../账号管理与组织/阿里云账号绑定与授权教程.md) and complete [**cloud account real-name verification**](https://help.aliyun.com/zh/account/real-name-authentication).

# Local Project Development

## Clone Remote Repository via Git
Assuming your username is `user` and the model name is `Docker_Studio_Example`:
```shell
git lfs install
git clone https://oauth2:YOUR-ACCESS-TOKEN@www.modelscope.cn/user/my-test-studio.git
```
For convenience in subsequent project file uploads, please provide the access token directly during the git clone phase. You can obtain it from the platform's [Access Token](https://modelscope.cn/my/myaccesstoken) page.

After executing the above Git commands, you will get the following project structure:
```markdown
Docker_Studio_Example/
├── .gitattributes
└── README.md
```

## Code Development
This article uses developing a Gradio application as an example. You need to develop and prepare project files under the cloned local project path. The example project directory is as follows:
```markdown
Docker_Studio_Example/
├── .gitattributes
├── app.py
├── README.md
└── requirements.txt
```

The content of the newly added app.py and requirements.txt code files is as follows:
```python
#app.py
import gradio as gr
def modelscope_quickstart(name):
    return "Welcome to modelscope, " + name + "!!"
demo = gr.Interface(fn=modelscope_quickstart, inputs="text", outputs="text")
demo.launch(server_name="0.0.0.0", server_port=7860)
```
```bash
#requirements.txt
gradio
```

**Important Notes:**
* When deploying to Docker Studio, we need to expose the service on `0.0.0.0` and specify the default service port as 7860. Port modification is currently not supported.

* Inside the container, you can open any number of ports. For example, you can install Elasticsearch in the Studio and call it internally through its default port 9200.

* If you want to expose services running on multiple ports to the external network, a workaround is to use a reverse proxy like Nginx to distribute requests from the public network (single port) to different internal ports.

* Since the code uses gradio, we need to add dependencies to the `requirements.txt` file so they can be specified for installation in the Dockerfile later.

## Local Testing
After completing project development and debugging, you need to test locally to ensure the project runs and is accessible normally. Then you can start preparing the Dockerfile.

## Building Dockerfile
You can create a `Dockerfile` and place it in the project root directory.
```markdown
Docker_Studio_Example/
├── .gitattributes
├── app.py
├── Dockerfile
├── README.md
└── requirements.txt
```

When deploying this Gradio application to Docker Studio, you need to build the Dockerfile according to the following content:
```dockerfile
FROM modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/python:3.10
WORKDIR /home/user/app
COPY ./ /home/user/app
# If there's requirements.txt
RUN pip install -r requirements.txt
ENTRYPOINT ["python", "-u", "app.py"]
```

In this example's `Dockerfile`, we sequentially specify the base image, set the working directory inside the container, copy project files to the container's working directory, install necessary dependencies inside the container, and finally define the default command executed when the container starts: launching the container from the `app.py` script. For detailed usage of Dockerfile instruction syntax, you can refer to the [official documentation](https://docs.docker.com/build/concepts/dockerfile/).

# Submit and Deploy to Docker Studio
After configuring the `Dockerfile` and corresponding code files, you can submit the code to the Master branch via Git or by going to "Site Page - Space Files - Add File - Upload File".

After code submission is complete, you also need to go to "Settings" and click "Launch" to deploy the Studio.

## View Logs
After clicking launch, a "View Logs" entry will appear on the right side of the settings page. You can view the Dockerfile packaging process and post-startup code execution logs through the build logs and runtime logs in the log drawer page.
![View Logs](./_resources/log.png)

# Other Settings

## Environment Variables
You can manage environment variables on the Studio's settings page.

#### Build Time
Docker Studios are currently in Beta testing, and variables are not yet supported during Docker image building.

#### Runtime
Variables will be injected into the environment when the container is running. For example, in Python you can use `os.environ.get("ENVIRONMENT_EXAMPLE")`.

## Data Persistence
By default, data written to disk is lost each time a Docker Studio restarts. If persistent storage is needed, you can use the `/mnt/workspace` directory to store data. This directory is mounted on a persistent volume, meaning data written to this directory will be retained after restarts. However, data will still be lost when users transfer or rename the Studio. For higher requirements, we recommend using external storage solutions in your Studio code, such as Alibaba Cloud OSS storage or managed databases.

Note: The `/mnt/workspace` volume can only be used at runtime and is not available during the Dockerfile build phase.