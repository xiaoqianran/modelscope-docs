<!-- modelscope-docs: Model Creation and File Upload | contribute/model-file/create-model-and-upload/create-model-and-upload_EN.md -->

This article introduces how to create models in the ModelScope community and the specific operational procedures.

# Model Repository Creation

Reference: [Model Repository Creation](../../模型库/模型库介绍.md#创建自己的模型库)

# Model File Upload

Reference: [Model File Upload](../../模型库/模型的上传.md)

<!-- If you need to create a model repository on the ModelScope platform and upload model content, you need to first create an account. After logging in, you can create a model repository. ModelScope's model repositories are Git-based model storage repositories that provide you with version control, branch management, and convenient integration with ModelScope library for sharing and discovery features. You can choose the model content to upload, including model files, configuration files, checkpoints, and other file content.
# Account Registration and Login
To create files and share them with the ModelScope community, you need a ModelScope account. If you don't have an account yet, please register a new account to authenticate your identity with the Model Hub.<br>
![image.png](./_resources/1661239584277-3c7a1202-db29-4d7a-a65f-f4d7fc41c757.png)
<br>
![image.png](./_resources/1661239559714-de6924e3-f436-4b06-bfec-2c2c0292dadb.png)
<br>

# Create Model Repository
After registering and logging in, a "Create" button will appear to the left of your avatar. Click it to create a model or dataset. Click "Create Model" to enter the model page and fill in basic information to create the model repository.<br>

![image.png](./_resources/v1.5p1.png)<br>

Model creation consists of two steps:

**1) Fill in basic information.**
You need to fill in the following information:

- Model English Name: This is the unique identifier for the model. English names cannot be duplicated within the same model repository.
- Model Chinese Name: The corresponding Chinese name for the model, which can be modified in settings. We recommend using a name that clearly and intuitively describes the task implemented by the model.
- Owner: Defaults to the creator themselves or their organization.
- License: Model open-source license. Choose an appropriate open-source license for your model. If the license you need is not available, please email contact@modelscope.cn to request its addition.
- Task Type: Refers to what kind of task your created model belongs to. This task type corresponds to the model's input/output and is related to the model's pipeline and configuration files. For registered task types on the platform, the ModelScope community has already encapsulated corresponding code to facilitate model integration for similar task types. You can view [Task Introduction](./各任务最佳实践/任务的介绍.md). If your task type is not among those provided by the ModelScope community, please email contact@modelscope.cn to request registration.
- AI Framework: Similarly, the current ModelScope platform supports mainstream AI frameworks such as PyTorch, TensorFlow, Kaldi, etc. If your model's dependent AI framework is not in the options, please email us to add it.
- Public Visibility: If you want more people to see your model, please set it as public. If you set it as private, only you will be able to see it. You can also modify the model's visibility permissions in settings.
- Model Description: The model description will be displayed on the model listing page, helping users quickly understand your model. We recommend describing model characteristics, advantages, and application scenarios.

![image.png](./_resources/v1.5p2.png)

**2) Upload README document.**
If you already have a README document, you can upload it directly here. If you don't have a README document, the system will automatically create one for you.
To make model descriptions easier to understand and search, we recommend writing according to the model card specification. For details, please see [How to Write Effective Model Cards](模型接入帮助/撰写完善的模型卡片.md) and [Quick Start Page Editing Guide](模型接入帮助/快速使用页编辑指南.md).
<br>
![image.png](./_resources/1659447304275-027198bb-ca6e-4b66-8f20-7b0f26aaa4bb.png)
<br>
Click "Create Model," and the system will parse your uploaded README.md file and display it on the model introduction page.
<br>
![image.png](./_resources/1659697492848-1411018e-d46c-44bc-aab0-8f959b6b3833.png)
<br>
If you don't have a README document, you can find README.md in the model files and click edit to perform online editing.
<br>
![image.png](./_resources/1659447412471-cd1049c7-c796-4cfc-ad83-0e392d9cc153.png)
<br>
Model card editing consists of YAML and Markdown sections. The system parses corresponding fields and model tags by parsing the YAML document.
<br>
![image.png](./_resources/1659447515576-7ccbc093-0857-42d7-b0c7-8491845b1a39.png)
<br>
For the Markdown section, we recommend writing according to the following template, which will improve your model's readability and user understanding.
<br>
![image.png](./_resources/1659447804241-77b79331-2fae-4388-a34c-22da880215f5.png)
<br>

Additionally, you can also create model repositories via API:

```py
from modelscope.hub.constants import Licenses, ModelVisibility
api.create_model(
    model_id="damo/cv_unet_image-matting_damo",
    visibility=ModelVisibility.PUBLIC,
    license=Licenses.APACHE_V2,
    chinese_name="这是我的第一个模型",
)
```

# Add Model Files and Set Model Version

After completion, the platform will assign you a storage address in the format https://www.modelscope.cn/namesapce/model-name.git, for example:

    git clone https://www.modelscope.cn/damo/ofa_image-caption_coco_large_en.git

You can choose any of the following methods—**web interface**, **git**, or **Python SDK**—to add files to this model repository and set model versions.

> If your model files are relatively small (e.g., less than 100MB), uploading via the web interface is more convenient.

***Why set model versions***

Models on the ModelScope platform must have version identifiers to be usable. For model developers, during model integration and updates, you need to consciously label versions. If you don't perform this operation, the tests triggered in pull requests will still use the previous model version, and model changes made in the git repo **will not take effect**. Of course, if the model file changes don't affect the model's usage in the SDK (e.g., just updating the README or adding a model card dependency image), you can skip this operation.

- When developing on the master branch of the local library, all model files uploaded/updated on ModelHub are immediately visible and usable.
- After debugging model code through ModelScope Library integration, before merging to GitHub, if you depend on model file changes (e.g., model checkpoint updates or configuration file updates), you need to create a new tag for the current model repo via web interface, git commands, or SDK. This tag will serve as the basis for model version management.

- All released SDK branches will default to using the **latest model version before the SDK release date**, rather than the latest model files from the latest model repo.

***SDK or git methods require tokens***

If you need **to upload files or create versions using git or SDK methods, you need to obtain a token from the web interface**. The method is as follows:

- Log in to https://www.modelscope.cn with your account, click "Access Tokens," and copy your git token.<br>
  Please note that the ModelScope platform provides two different access tokens for SDK access and git access modes.
  - **Access Token** is used for **SDK access**. If you don't have an SDK token on your page, you can create one.
  - **Git token** is used for **git command access**,

![image.png](./_resources/get_token.png)
<br>



## Upload via Web Interface and Set Version

In the "Model Files" section of the model card page, click "Add File" to add files via the web interface. You can choose the upload directory path, drag and drop or click to upload files, and submit important file update content.

![image.png](./_resources/1659697567576-fd6d2742-3e47-4898-be4f-760abe275d95.png)
<br>
![image.png](./_resources/1655891466820-1773f597-76f7-42aa-998a-5709a739e232.png)

The platform supports online preview for the following document types:
.md, .txt, .json, .py, .yaml, .yml, .gitattributes, .gitignore, .html, .bmp, .jpg, .jpeg, .png, Dockerfile, .sh. If file content exceeds 1MB, the system will no longer support preview, but users can download the file for viewing.

After clicking the upload file button, you can see the new file on the page and preview its content. At this point, entering the model files tab will show an "Add Version" button on the right:

![image.png](./_resources/model_version_page.jpg)

After clicking to enter, set the version number, branch information, and description as needed to correctly set the version.


## Upload Using Git and Set Version
> Note: Ensure **git-lfs >=2.5.0, git >= 2.3.0**, and configure **git access token**.

You can create a model in the ModelScope community, then synchronize the model repository to your local machine via git commands based on page information, copy your desired model files to the corresponding repository, and complete the model upload operation via git commands.
```shell
# Model download, assuming your account name is user, and you created a model named my_test_model via the web interface
git lfs install
git clone https://www.modelscope.cn/user/my_test_model.git

# Private model download, assuming you have the corresponding model permissions Method 1
git lfs install
git clone http://oauth2:your_git_token@www.modelscope.cn/user/my_test_model.git
# Method 2
git clone http://user@www.modelscope.cn/user/my_test_model.git
# Password for 'http://user@modelscope.cn':
# input git token

# Assuming your model files are located in /work/my_model_dir directory
cd my_test_model
cp -rf /work/my_model_dir/* .
git add -A .
git commit -m "commit message"
git push
```
> Note that the platform currently automatically uses LFS to upload files with the following extensions:
> *.7z, *.arrow, *.bin, *.bin.*, *.bz2, *.ftz, *.gz, *.h5, *.joblib, *.lfs.*, *.model, *.msgpack, *.onnx, *.ot, *.parquet, *.pb, *.pt, *.pth, *.rar, saved_model/**/*, *.tar.*, *.tflite, *.tgz, *.xz, *.zip, *.zstandard, *.tfevents*, *.db*, *.ark*, **/*ckpt*data*, **/*ckpt*.meta, **/*ckpt*.index
>
> If you have other types of large files (greater than 100MB) in your model files, please execute the following command before git add to upload them via LFS:
> **git lfs track <your_file_name>**

Next, use git to set the model version:

```shell
git tag 'v0.1' -m 'validate on imagenet test set, accuracy 98.9%'  # create tag
git push origin v0.1  # push tag to remote for version control
# v0.1 can be defined by you
```

Here, v0.1 is the tag name and will also serve as the new version name. The content after -m serves as the model version description.<br />

## Upload Models Using Python SDK and Set Version
You can use modelscope modelhub to upload trained models to the ModelScope platform. You can create the corresponding model in advance on the ModelScope community webpage, then upload the local model directory via the push_model interface, or directly use push_model to automatically complete model creation and upload.
```py
from modelscope.hub.api import HubApi

YOUR_ACCESS_TOKEN = 'Please obtain the SDK access token from ModelScope Personal Center -> Access Tokens page'
# Please note that the ModelScope platform provides two different access tokens for SDK access and git access modes. Please use the SDK access token here.


api = HubApi()
api.login(YOUR_ACCESS_TOKEN)
api.push_model(
    model_id="yourname/your_model_id",
    model_dir="my_model_dir" # Local model directory, which must contain configuration.json
)
```
Below you can set the model version:

```py
from modelscope.hub.api import HubApi
from modelscope.hub.repository import Repository

YOUR_ACCESS_TOKEN = 'Please obtain the SDK access token from ModelScope Personal Center -> Access Tokens page'
# Please note that the ModelScope platform provides two different access tokens for SDK access and git access modes. Please use the SDK access token here.
api = HubApi()
api.login(YOUR_ACCESS_TOKEN)
repo = Repository(model_dir, clone_from=model_id)
repo.tag_and_push('v1.0.0', 'Test revision')
```

## Solution for Large File Upload Rejection by Server

For files larger than 100MB, the platform uses git-lfs for management.
If you encounter the error shown in the figure below during the push process, it means that your current commit contains files larger than 100MB that are not marked as LFS files, and the server has rejected this push.

![image.png](./_resources/large-file-upload.png)

Where d084b5a represents the branch containing files larger than 100MB, and test is the filename. When encountering the above error, you can refer to the following solution:
```
# Initialize LFS
git lfs install
# Reset to the commit before d084b5a
git reset d084b5a~1
# Track files larger than 100MB using LFS
git lfs track test
# Re-commit
git add .
git commit -m "your commit"
# Push branch to remote
git push
# Recreate tag and push to remote, skip this step if it's a branch
git tag -d v1.0.0
git tag v1.0.0 tmp1
git push origin v1.0.0
``` -->

# Model Management and Maintenance
After uploading your model, you can subsequently update model files or manage and maintain basic model repository information and deletion. For details, please see [Model Management Settings](模型接入帮助/模型管理设置.md).