<!-- modelscope-docs: Creating and Building Studios | studios/create/create_EN.md -->

This article introduces the process of creating and building ModelScope Studios.

>  **Special Note:** You can freely create multiple Studios and share them with your friends. However, considering the quality of space display on the homepage, the Studios you create will not automatically enter the featured list on the Studios homepage. If you wish to apply for inclusion in the homepage list, please feel free to contact us (DingTalk group: 8010015744, email: contact@modelscope.cn)

# Create Your Own Studio

## Prerequisites
1. Please complete account registration and login on ModelScope community first.
2. Confirm that your device has `Git` and `Git LFS` installed.

## Studio Creation Steps
Currently, the ModelScope community provides two main ways to create Studios: "Programmatic Creation" and "Interactive Creation." This article primarily introduces "Programmatic Creation." Programmatic creation consists of four main steps:
- Create a Studio using the site page
- Studio development
- Upload Studio project files
- Deploy the Studio

Next, we will introduce the operational guide for each step.

### Step 1: Create a Studio Using the Site Page
You can create a Studio through the ModelScope site page. You have two ways to start creating a Studio:
1. After registering and logging in, click the avatar in the top-right corner of any site page, open the dropdown menu, and click "Create Studio" to enter the creation process.
2. Navigate to the [Studios homepage](https://modelscope.cn/studios) via the top navigation bar of the site page, then click "Create Now" at the top of the page to enter the creation process.

#### Fill in Basic Information and Complete Creation
Basic information includes your model's English name, Chinese name, owner, license type, visibility status, and Studio description.
  - License: Open-source license that determines which open-source agreement your Studio follows.
  - Visibility: Determines whether your Studio can be searched and viewed by other users. If set as private, other users cannot view it—only you can access it. You can also modify permissions in the settings page after creation.
  - Studio Description: We recommend introducing the Studio's features and application scenarios, which will be displayed on Studio-related pages to help users understand and search for it.
  - SDK Integration: Currently supports deployment and operation of applications using various frameworks including Gradio, Streamlit, Static, Docker, etc. You can choose based on your actual needs.
  - Cloud Resources: Provides different types of CPU/GPU cloud resources, including free CPU cloud resources, xGPU cloud resources, and paid higher-configuration CPU/GPU cloud resources. You can flexibly choose based on your application's actual deployment requirements.
  - Image Version: Provides image files with different system versions, Python versions, PyTorch versions, and ModelScope main library versions. If you have no special dependencies, we recommend using the default selected latest image. You can also flexibly choose based on your application's actual dependencies.

After completing the basic information, click "Create Studio" to submit the creation. This usually takes some time, so please wait a moment.

### Step 2: Studio Development
> If you have already completed Studio development according to relevant documentation and prepared the related project files, you can skip this step.

Key files for Studio operation:
- Startup file: The startup script that must be specified for Studio deployment and operation. If using Gradio/Streamlit SDK, the default is app.py; if using Static HTML, the default is index.html. You can also modify this in the `entry_file` field of the Studio card (README.md) YAML header.
- requirements.txt: List of Python dependencies that need to be pre-installed. Simply add dependencies line by line in the file, as shown in the example below:
  ```shell
  wget
  openssl
  ```
  Note: Studios come with all Notebook environment dependencies pre-installed, so users don't need to install them additionally. Gradio is also installed by default in Studios.

- packages.txt: For Gradio/Streamlit apps that require system packages such as `ffmpeg`, `libsm6`, or `cmake`, you can add a `packages.txt` file to the repository root. Add one Debian/Ubuntu package name per line. Blank lines and lines starting with `#` are ignored, as shown below:
  ```text
  # Video processing dependency
  ffmpeg

  # Image processing dependencies
  libsm6
  cmake
  ```
  During deployment, Studio installs the system dependencies declared in `packages.txt` before installing Python dependencies from `requirements.txt`. Only write package names in this file, not installation commands. If a package does not exist or installation fails, check the deployment logs for details.

- README.md: Studio card, a file that every Studio must include. For specific meaning, see the Studio Card section.

For specific Studio project development, please refer to the development documentation of the corresponding SDK framework:

#### Gradio
- Official tutorial: [https://gradio.app/quickstart/](https://gradio.app/quickstart/)
- More examples: [https://gradio.app/demos/](https://gradio.app/demos/)

#### Streamlit
- Official tutorial: [https://docs.streamlit.io/](https://docs.streamlit.io/)

### Step 3: Upload Studio Project Files
After completing Studio creation on the site page, the platform will assign a Git repository address to this Studio, which can be obtained on the "Studio Details - Space Content" page. Example as follows:

 ![image.png](./_resources/pre-studio-card.png)

You can use Git to upload files to this Studio repository, or upload related files through the page.

1. Add Studio files using Git
```bash
git lfs install
# Fill in according to actual situation
git clone http://oauth2:<your_access_token>@www.modelscope.cn/studios/<your_studio_path>/<your_studio_name>.git

# After creating app.py, add it to the git repository
git add app.py
git commit -m "add app.py"
git push
```
>  You can obtain the ACCESS_TOKEN by logging into the website with your account credentials and navigating to [【Personal Center】->【Access Token】](https://modelscope.cn/my/myaccesstoken).

2. Add Studio files using the site page
You can also go to the "Studio Details Page - Space Files" page, click the "Add File" button, and choose "Upload File" or "Create New File" to submit your project files from local storage.

### Step 4: Deploy the Studio
You can perform basic settings and deployment for your Studio on the "Studio Details Page - Settings" page.

#### Launch Studio
- After uploading Studio project files to the repository, you need to manually "launch" your Studio. You can see the "Publish Now" button on the space content page, or easily find the "Launch" button in the "Studio Management" section on the right side of the settings page.

- Clicking either the "Publish Now" or "Launch" button will immediately trigger deployment and publish the Studio online. This process will take some time, so please check back later.

- After successful launch, the application page will be displayed in the space content.

- If deployment fails, you can contact us through official support channels for assistance.
  - Contact email: <contact@modelscope.cn>
  - WeChat Official Account: ModelScope Community
  - Join technical discussion group: DingTalk group number 44837352
  <br>
  <img src="https://modelscope-docs-dev.oss-cn-hangzhou.aliyuncs.com/static/dingding.png" width="200px"/>
  <br>

#### Other Settings
- **Take Offline**: If the Studio is no longer needed, you can click the "Take Offline" button on the settings page.
- **Restart Studio**: When Studio code is updated, you can directly click the "Settings Page - Restart Studio" button to republish online. The system will pull the latest Studio files for deployment, and the "Space Content" page will display the latest results after deployment.
- **Environment Variable Management**: Studios support creating environment variables to store sensitive fields that you don't want to write plainly in Studio project code files, such as API keys or tokens. Note that after adding and saving environment variables, you cannot query the variable values.
  ![image](./_resources/env_variable.png)
  - Note: Environment variables must be accompanied by a Studio restart to take effect after creation or update.
  - Usage:
    ```python
    import os
    # Get the value of the corresponding environment variable; the variable name in the image above must match the parameter here
    app_key = os.getenv('AppKey')
    # Use app_key for subsequent operations
    ```

## Data Persistence
By default, data written to disk is lost each time a  Studio restarts. If persistent storage is needed, you can use the `/mnt/workspace` directory to store data. This directory is mounted on a persistent volume, meaning data written to this directory will be retained after restarts. However, data will still be lost when users transfer or rename the Studio. For higher requirements, we recommend using external storage solutions in your Studio code, such as Alibaba Cloud OSS storage or managed databases.
