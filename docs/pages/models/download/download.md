<!-- modelscope-docs: Model Download | models/download/download_EN.md -->

This article introduces three ways to download models from ModelScope:

1. Download using command-line tools
2. Download using SDK
3. Download via Git

# Default Model Download Location

Whether using the command line or ModelScope SDK, models are downloaded to the default path `~/.cache/modelscope/hub`. If you need to modify the cache directory, you can manually set the environment variable: `MODELSCOPE_CACHE`. After setting this variable, models will be downloaded to the directory specified by this environment variable.

# Download Using Command-Line Tools

**`modelscope download` Parameters**

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `repo_id` | - | str | - | Positional, repository ID (optional, can also use `--model`) |
| `files` | - | str | - | Positional, files to download (supports multiple) |
| `--model` | - | str | None | Model ID (mutually exclusive with `--dataset`) |
| `--dataset` | - | str | None | Dataset ID (mutually exclusive with `--model`) |
| `--repo-type` | - | choice | `model` | Repository type (model/dataset), used with positional repo_id |
| `--revision` | - | str | None | Version/branch/tag |
| `--cache_dir` | - | str | None | Cache directory |
| `--local_dir` | - | str | None | Local directory (takes precedence over cache_dir) |
| `--include` | - | list | None | Glob patterns for files to include |
| `--exclude` | - | list | None | Glob patterns for files to exclude |
| `--token` | - | str | None | Access token (required for private models) |
| `--endpoint` | - | str | None | ModelScope server endpoint |
| `--max-workers` | - | int | default | Maximum concurrent download threads |

## Usage Examples

Command examples (using the [Qwen2-7B](https://www.modelscope.ai/models/Qwen/Qwen2-7b) model as an example)

### Download the entire model repository (to the default cache location)

```shell
    modelscope download --model 'Qwen/Qwen2-7b'
```

### Download the entire model repository to a specified directory

```shell
    modelscope download --model 'Qwen/Qwen2-7b' --local_dir 'path/to/dir'
```

### Download a single file (using 'tokenizer.json' as an example)

```shell
    modelscope download --model 'Qwen/Qwen2-7b' tokenizer.json
```

### Download multiple files

```shell
    modelscope download --model 'Qwen/Qwen2-7b' tokenizer.json config.json
```

### Download specific files

```shell
    modelscope download --model 'Qwen/Qwen2-7b' --include '*.safetensors'
```

### Exclude specific files

```shell
    modelscope download --model 'Qwen/Qwen2-7b' --exclude '*.safetensors'
```

### Specify cache_dir for download

```shell
    modelscope download --model 'Qwen/Qwen2-7b' --include '*.json' --cache_dir './cache_dir'
```

Model files will be downloaded to `'cache_dir/Qwen/Qwen2-7b'`.

### Specify local_dir for download

```shell
    modelscope download --model 'Qwen/Qwen2-7b' --include '*.json' --local_dir './local_dir'
```

Model files will be downloaded to `'./local_dir'`.

If both `cache_dir` and `local_dir` parameters are specified, `local_dir` takes precedence and `cache_dir` will be ignored.

## Downloading Private Models Requires Login

### Via login command

When downloading private models, you need to log in first. The command to log in via CLI is `modelscope login`. Detailed usage instructions are as follows:

    usage: modelscope <command> [<args>] login [-h] --token TOKEN

    options:
      -h, --help     show this help message and exit
      --token TOKEN  The Access Token for modelscope.

      modelscope login --token YOUR_MODELSCOPE_ACCESS_TOKEN

You can obtain your **Access Token** on the [My Access Tokens](https://modelscope.ai/my/myaccesstoken) page.

# Download Using ModelScope SDK

## Download the Entire Model Repository

You can use `snapshot_download` to download the entire model repository. Example:

```python
from modelscope.hub.snapshot_download import snapshot_download

model_dir = snapshot_download('iic/nlp_xlmr_named-entity-recognition_viet-ecommerce-title')
```

**Parameter Description**

|  **Field Name**       |  **Required**  |  **Type**   | **Description**                 |
| ------------------- |  :---------: | :----------: |------------------------|
|  model_id           |  Yes        |  str       | Model ID                   |
|  revision         |  No        |  str       | Git revision of the model, branch name or tag |
|  cache_dir            |  No        |  str,Path | Specifies the cache directory for this model download. When provided, the downloaded model files will be stored in cache_dir/model_id/THE_MODEL_FILES |
|  allow_patterns       |  No        |  str,List       | Specifies file patterns to download, such as filenames or file extensions |
|  ignore_patterns       |  No        |  str,List       | Specifies file patterns to ignore during download, such as filenames or file extensions|
|  local_dir       |  No        |  str       | Specifies the download directory for the model. When provided, the downloaded model files will be stored in local_dir/THE_MODEL_FILES|

If both `cache_dir` and `local_dir` parameters are specified, `local_dir` takes precedence and `cache_dir` will be ignored. For more parameter usage instructions, please refer to the interface documentation in the open-source code. To specify downloading or filtering certain file patterns, you can use the `allow_patterns` or `ignore_patterns` parameters. Examples:

- **Download specific files**

For example, to download the `q4_k_m` quantized version from `Qwen/QwQ-32B-GGUF` to the `path/to/local/dir` directory:

```python
from modelscope.hub.snapshot_download import snapshot_download

model_dir = snapshot_download('Qwen/QwQ-32B-GGUF',allow_patterns='qwq-32b-q4_k_m.gguf',local_dir='path/to/local/dir')
```

- **Exclude specific files**

For example, to download all files from the `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` repository except the `figures` subdirectory to the specified `path/to/local/dir` directory:

```python
from modelscope.hub.snapshot_download import snapshot_download

model_dir = snapshot_download('deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',ignore_patterns='figures/',local_dir='path/to/local/dir')
```

## Download Specific Model Files

You can also use `model_file_download` to download specific model files. Example:

```python
from modelscope.hub.file_download import model_file_download

model_dir = model_file_download(model_id='Qwen/QwQ-32B-GGUF',file_path='qwq-32b-q4_k_m.gguf')
```

**Parameter Description**

|  **Field Name**       |  **Required**  |  **Type**   | **Description**                 |
| ------------------- |  :---------: | :----------: |------------------------|
|  model_id           |  Yes        |  str       | Model ID                   |
|  file_path       |  Yes        |  str      | Relative path of the file to be downloaded in the remote model repository|
|  revision         |  No        |  str       | Git revision of the model, branch name or tag |
|  cache_dir            |  No        |  str,Path | Specifies the cache directory for this model download. When provided, the downloaded model files will be stored in cache_dir/models/model_id/THE_MODEL_FILES |
|  local_dir       |  No        |  str       | Specifies the download directory for the model. When provided, the downloaded model files will be stored in local_dir/THE_MODEL_FILES|

If both `cache_dir` and `local_dir` parameters are specified, `local_dir` takes precedence and `cache_dir` will be ignored. For more parameter usage instructions, please refer to the interface documentation in the open-source code.

## Download Private Models

When downloading non-public models or application-required models, you need to log in first, then follow the steps described above to download the model. Here's an example of downloading a non-public model using `snapshot_download`:

```python
from modelscope import HubApi
from modelscope import snapshot_download

# login to ModelScope
api=HubApi()
api.login('YOUR_MODELSCOPE_ACCESS_TOKEN')

# download your model, the model_path is downloaded model path.
model_path =snapshot_download(model_id='the_model_id')
```

ModelScope SDK provides multiple login methods. You can also complete login through other methods such as command line.

## Trigger Download by Loading Models

In addition to directly downloading model files, model download is automatically triggered when loading models using ModelScope SDK. If the model is bound to ModelScope SDK, you can load the model with just a few lines of code. ModelScope also supports loading models through interfaces like AutoModel. Here's an example using `Model` to load a model:

```python
from modelscope.models import Model
model = Model.from_pretrained('iic/nlp_xlmr_named-entity-recognition_viet-ecommerce-title', revision='v1.0.1')
# revision is an optional parameter. If not specified, the default model version will be used. The default version is the last version before the ModelScope library release.

# How to get the release date
import modelscope
print(modelscope.version.__release_datetime__)
```

# Download Models Using GIT

Models on the ModelScope server are stored via Git, so you can also download models locally using `git clone` after installing Git LFS.

```shell
# Download public models
git lfs install
git clone https://www.modelscope.ai/<owner_name>/<model-name>.git
# Example: git clone https://www.modelscope.ai/iic/ofa_image-caption_coco_large_en.git

# Download private models (assuming you have the appropriate model permissions)
# Method 1
git lfs install
git clone http://oauth2:your_access_token@www.modelscope.ai/<owner_name>/<model-name>.git
# Method 2
git clone http://your_user_name@www.modelscope.ai/<owner_name>/<model-name>.git
# Password for 'http://your_user_name@modelscope.ai':
# input access token
```

If you **want to skip downloading LFS large files**, you can add `GIT_LFS_SKIP_SMUDGE=1` before the git clone command to only fetch LFS pointers without downloading the actual large files:

```shell
GIT_LFS_SKIP_SMUDGE=1 https://www.modelscope.ai/<namespace>/<model-name>.git
```


# How to Obtain Access Token

Log in to <https://www.modelscope.ai> with your account, go to Personal Center -> Access Tokens, create and copy your access token.
<!-- ![image.png](./_resources/1661399339161-32fe4a95-0ad0-47e0-a360-b2522762022d.png) -->
![image.png](./_resources/access_token.jpeg)