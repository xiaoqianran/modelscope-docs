<!-- modelscope-docs: Model Upload | models/upload/upload_EN.md -->

This article introduces different methods for uploading models to the ModelScope community, including:

1. Creating and uploading models using the ModelScope command line or Python SDK
2. Uploading models using GIT

# Preparation

Before uploading your model, please complete account registration and login. Additionally, please prepare your model content in a **local model folder**.

# Uploading Models Using ModelScope Command Line or SDK

## Prerequisites

* Ensure you have installed the `modelscope` library. If not installed, use the following command to install:
    ```shell
    pip install modelscope
    ```
* Obtain your access token from the [ModelScope site](https://www.modelscope.ai/my/myaccesstoken).

## Uploading via Command Line CLI Tool

**In most cases, you can complete model upload with a single command**. Assuming your model files are stored locally at `/path/to/model_folder`, and you want to upload the model to a ModelScope repository named `owner/awesome-new-model`, you can achieve this with the following command:

```bash
modelscope upload owner/awesome-new-model /path/to/model_folder --token YOUR-MODELSCOPE-TOKEN
```

Here, `owner` can be your personal account name; if uploading to an organization, use the organization name instead. Please ensure that the access token you provide has edit permissions for the corresponding repository.

**Note**: Please note that if the model does not exist on ModelScope, executing this command will create a **public model** by default. If you need to change the model to private, you can modify it on the model editing page of the ModelScope site after uploading.

Additionally, you can perform operations such as uploading individual model files through the command line. For a detailed list of command line parameters, please refer to the following instructions:

```bash
# Upload a single file
modelscope upload owner/awesome-new-model /path/to/your/local/file /relative/path/in/repo

# Complete usage example
modelscope upload [repo_id] [local_path] [path_in_repo] --repo-type model --include '*.bin' --exclude '*.log' --commit-message 'init' --commit-description 'my first commit' --token 'xxx-xxx' --max-workers 16 --endpoint 'https://www.modelscope.ai'

```

**Parameter Description**

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `repo_id` | - | str | required | Positional, repository ID (format: owner/repo-name) |
| `local_path` | - | str | None | Positional, local file or folder path (optional) |
| `path_in_repo` | - | str | None | Positional, target path in repository (optional) |
| `--repo-type` | - | choice | `model` | Repository type (model/dataset) |
| `--include` | - | list | None | Glob patterns for files to include |
| `--exclude` | - | list | None | Glob patterns for files to exclude |
| `--commit-message` | - | str | None | Commit message |
| `--commit-description` | - | str | None | Commit description |
| `--token` | - | str | None | Access token |
| `--max-workers` | - | int | min(8, cpu+4) | Upload concurrency threads |
| `--endpoint` | - | str | None | ModelScope server endpoint |

You can also use `modelscope upload --help` to view detailed parameters of the CLI tool.

## Uploading Models Using ModelScope Python SDK

Through the ModelScope Python SDK, you have multiple convenient ways to upload models to the ModelScope platform.

### 0. Login with Access Token in SDK

```python
from modelscope.hub.api import HubApi

YOUR_ACCESS_TOKEN = 'Please obtain your access token from https://modelscope.ai/my/myaccesstoken'
api = HubApi()
api.login(YOUR_ACCESS_TOKEN)
```

Access tokens can be obtained from the [Account Settings -> Access Tokens](https://modelscope.ai/my/myaccesstoken) page.

### 1. Create Model Repository

Assuming your account name is `user` and your desired model English name is `my-test-model`:

```python
from modelscope.hub.constants import Licenses, ModelVisibility

owner_name = 'user'
model_name = 'my-test-model'
model_id = f"{owner_name}/{model_name}"

api.create_model(
    model_id,
    visibility=ModelVisibility.PUBLIC,
    license=Licenses.APACHE_V2,
    chinese_name="My Test Model"
)
```

**Parameter Description**

| **Field Name** | **Required** | **Type** | **Description** |
| ------------------- | :---------: | :----------: |------------------------|
| model_id | Yes | str | Model ID |
| visibility | No | int | Model visibility, 1-private, 5-public, defaults to 5 if not specified |
| license | No | str | Model license, defaults to Apache-2.0 if not specified |
| chinese_name | No | str | Model Chinese name, defaults to None |

For more parameters, please refer to the open-source code interface documentation.

### 2. Upload Models Using SDK

#### Via upload_folder Interface

The ModelScope library provides HTTP-based folder and file upload interfaces to ensure a more stable upload experience.

- Upload model folder

```Python
api.upload_folder(
    repo_id=f"{owner_name}/{model_name}",
    folder_path='/path/to/your_model_dir',
    commit_message='upload model folder to repo',
)
```

**Parameter Description**

| **Field Name** | **Required** | **Type** | **Description** |
|----------------|:------: |--------|--------------------------------------------|
| repo_id | Yes | str | Model ID, ensure your access token has permission to upload to the corresponding repository |
| folder_path | Yes | str | Absolute path of the local folder to be uploaded |
| path_in_repo | No | str | Specific path and folder name where the folder will be uploaded |
| commit_message | No | str | Change information included in this upload commit |
| token | No | str | User access token with upload permissions. Can be omitted if already logged in |
| repo_type | No | str | Repository type, defaults to `model` if not specified |
| allow_patterns | No | str | Template for allowed file types to upload, e.g., `*.json`, defaults to `None` |
| ignore_patterns | No | str | Template for file types to ignore during upload, e.g., `*.log`, defaults to `None` |
| max_workers | No | int | Number of threads to open during upload, defaults to `min(8,os.cpu_count() + 4))` |
| revision | No | str | Branch to upload to, defaults to "master" |

For more parameters, please refer to the open-source code interface documentation.

- Upload model file

```Python
api.upload_file(
    path_or_fileobj='/path/to/local/your_file.suffix',
    path_in_repo='repo_path/your_file.suffix',
    repo_id=f"{owner_name}/{model_name}",
    commit_message='upload model file to repo',
)
```

**Parameter Description**

| **Field Name** | **Required** | **Type** | **Description** |
| --------------------- |:------:|--------|--------------------------------|
| path_or_fileobj | Yes | str | Absolute path of the local file to be uploaded |
| path_in_repo | Yes | str | Specific path and file name where the file will be uploaded |
| repo_id | Yes | str | Model ID, ensure your access token has permission to upload to the corresponding repository |
| token | No | str | User access token with upload permissions. Can be omitted if already logged in |
| repo_type | No | str | Repository type, defaults to `model` if not specified |
| commit_message | No | str | Commit message for this upload |
| commit_description | No | str | Commit description for this upload |
| buffer_size_mb | No | int | Buffer size for hash calculation, in MB, defaults to 1 |
| tqdm_desc | No | str | Progress bar description, defaults to `[Uploading]` |
| disable_tqdm | No | bool | Whether to disable progress bar, defaults to False |

For more parameters, please refer to the open-source code interface documentation.

#### Using push_model Interface (deprecated)

The ModelScope library also provides a Git-wrapped interface `push_model` for uploading to model repositories. However, this interface will be deprecated in the future, and it's recommended to use HTTP-based upload interfaces like `upload_folder`.

```python
api.push_model(
    model_id=model_id, # If the model repository corresponding to model_id doesn't exist, it will be automatically created
    model_dir="my_local_model_dir" # Specify the local directory containing the model
)
```

**Parameter Description**

| **Field Name** | **Required** | **Type** | **Description** |
| --------------------- |:------: | --------------------- |----------------------------------|
| model_id | Yes | str | Model ID, ensure your access token has permission to upload the model |
| model_dir | Yes | str | Absolute path of the local model to be uploaded |
| visibility | No | int | Visibility of newly created model, 1-private, 5-public, defaults to 5 if not specified |
| license | No | str | License of newly created model, defaults to None |
| chinese_name | No | str | Chinese name of newly created model, defaults to None, and English name will be displayed on frontend |
| commit_message | No | str | Commit message for push request, defaults to None |

For more parameters, please refer to the open-source code interface documentation.

### 3. Uploading AIGC Models

AIGC model upload is similar to regular model upload but simplified. When creating a repository, the model upload step is automatically completed synchronously.

Additionally, the upload file path can point to either a model file or folder. The system will automatically identify the upload type and upload the model files to the model repository.

#### Via create_model Interface

- Create repository and upload AIGC model file

```python
from modelscope.hub.utils.aigc import AigcModel
from modelscope.hub.constants import Licenses, ModelVisibility
from modelscope.hub.api import HubApi

YOUR_ACCESS_TOKEN = 'Your ModelScope Access Token'
api = HubApi()
api.login(YOUR_ACCESS_TOKEN)

owner_name = 'user'
model_name = 'my-test-model'
model_id = f"{owner_name}/{model_name}"

aigc_model = AigcModel(
    aigc_type='Checkpoint',
    base_model_type='WAN_VIDEO_2_2_I2V_14_B',
    model_path='/Your/path/to/your/model.safetensors',
    base_model_id='AI-ModelScope/FLUX.1-dev',
    description='Simple AIGC model creation example',
    revision='v1.0'
)

model_repo_url = api.create_model(
    model_id,
    visibility=ModelVisibility.PUBLIC,
    license=Licenses.APACHE_V2,
    chinese_name='My AIGC Model',
    aigc_model=aigc_model
)

```

**AigcModel Parameter Description**

| **Field Name** | **Required** | **Type** | **Description** |
|-------------------| :---------: | :----------: |------------------------------------------------------------------------|
| aigc_type | Yes | str | AIGC model type, options: 'Checkpoint', 'LoRA', 'VAE' |
| base_model_type | Yes | str | Base model type, check interface documentation for specific options |
| model_path | Yes | str | Path to weight file or folder |
| revision | Yes | str | AIGC model version number, defaults to 'v1.0' |
| base_model_id | No | str | Base model name, e.g., 'AI-ModelScope/FLUX.1-dev', defaults to empty string |
| description | No | str | Model description, defaults to 'this is an aigc model' |
| cover_images | No | List[str] | List of cover image URLs, default AIGC cover image used if not provided |
| path_in_repo | No | str | Path in target repository after upload, defaults to empty string |

#### Via Command Line CLI Tool

Assuming your model file is stored locally at `/path/to/model_folder_or_file`, and you want to upload it to a ModelScope repository named `owner/awesome-aigc-model`, you can achieve this with the following command:

```bash
modelscope create owner/awesome-new-model --aigc -model_path /path/to/model_folder_or_file --token YOUR-MODELSCOPE-TOKEN --aigc_type Checkpoint --base_model_type QWEN_IMAGE_20_B --revision v1.0 --description "create an aigc model"
```

Parameter descriptions are as above.

# Uploading Models Using GIT

You can synchronize local models to remote repositories using Git commands. Since Git itself introduces file version history management and corresponding additional local storage overhead, **if you don't have explicit multi-version management requirements, we recommend using the ModelScope command line or SDK directly for model upload** rather than GIT.

## Prerequisites

Please ensure `Git` and `Git LFS` are installed.

## Steps

### 1. Create Model Repository via ModelScope Site Page

On the ModelScope homepage, find the "Create Model" quick access in the top-right corner under your profile avatar, and click to enter the model creation interface. Fill in the necessary basic information according to the page instructions and submit the creation. For detailed creation process, please refer to: [Creating Your Own Model Repository](./model-repository-introduction.md)

### 2. Complete Local Model Upload via GIT

* Clone remote model repository

Assuming your account name is `user` and model name is `my-test-model`:

```shell
git lfs install
git clone https://oauth2:YOUR-ACCESS-TOKEN@www.modelscope.ai/user/my-test-model.git
```

For your convenience in subsequent model uploads, please provide the access token directly during the git clone phase. You can obtain it from the platform's [Access Token](https://modelscope.ai/my/myaccesstoken) page.

* Move your model files to the cloned model directory and complete the model upload through operations like `git add`, `git commit`, `git push`.

# Notes

* Upload file size limits:
    - Individual file size must not exceed 50 GB
    - Total number of files must not exceed 100,000
    - Total number of files in a single subfolder must not exceed 10,000
    - Total size of all files not marked as LFS must not exceed 500 MB

> To ensure smooth and efficient upload process, when individual file size exceeds 5MB, or total file size exceeds 500MB, we recommend using `GIT LFS` for file upload;

* When uploading via file/folder upload interfaces, files meeting the following conditions are automatically marked for GIT LFS upload:
    - File size exceeds 5 MB
    - Platform automatically uses LFS to upload files with the following extensions:
    ```shell
    *.7z, *.arrow, *.bin, *.bin.*, *.bz2, *.ftz, *.gz, *.h5, *.joblib, *.lfs.*, *.model, *.msgpack, *.onnx, *.ot, *.parquet, *.pb, *.pt, *.pth, *.rar, saved_model/**/*, *.tar.*, *.tflite, *.tgz, *.xz, *.zip, *.zstandard, *.tfevents*, *.db*, *.ark*, **/*ckpt*data*, **/*ckpt*.meta, **/*ckpt*.index, *.safetensors, *.ckpt, *.gguf*, *.ggml, *.llamafile*, *.pt2
    ```

* When uploading via GIT, you need to manually scan all files larger than 5MB in your local model directory and mark them with `git lfs track <your_file_name>`;

# Versioning Your Model

To ensure your model is used correctly, you need to assign appropriate versions to avoid affecting services that use your model when you update it. Refer to [Model Versioning](./model-versioning.md)