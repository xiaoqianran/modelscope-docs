<!-- modelscope-docs: Dataset Download | datasets/download/download_EN.md -->

In this article, we will introduce you to downloading datasets on the ModelScope platform. Whether you prefer using the Python SDK, GIT, or command-line tools, detailed steps are provided here to help you get started quickly.

# Quick Start

## Download Specific Files
1. Visit the dataset page.
2. Click the `Download` button next to each file to download it directly.

![image.png](./_resources/E9C0010F-A041-4770-9D6F-891531680E8C.png)

## Download Entire Dataset
Click the `Download Dataset` button to see specific commands for downloading datasets using the SDK, GIT, or command line.

![image.png](./_resources/download_dataset1.png)

-------

Below is a detailed introduction to each method:

# 1. Download Datasets Using Python SDK
You can easily download datasets using the `modelscope` library and perform related operations (create, delete, update, and retrieve information).

## Install Python SDK

First, ensure you have installed ModelScope's Python SDK using the following command:

```bash
pip install modelscope[framework]
```

## Dataset Download Example

Use the following code to download a dataset:

```python
from modelscope import MsDataset

# Load dataset
ds = MsDataset.load('afqmc_small', split='train')
```

# 2. Download Datasets Using GIT

If you prefer using GIT, you can download datasets as follows.

## Public Dataset Download

```bash
# Install Git LFS (Large File Storage)
git lfs install

# Clone public dataset
git clone https://www.modelscope.cn/datasets/<namespace>/<dataset-name>.git
# Example: git clone https://www.modelscope.cn/datasets/DAMO_NLP/jd.git
```

## Private Dataset Download

**Note:** You need appropriate dataset permissions.

```bash
# Use Git LFS
git lfs install

# Clone private dataset
git clone http://oauth2:<your_access_token>@www.modelscope.cn/datasets/<namespace>/<dataset-name>.git
```

Or use the following method:

```bash
git clone http://<your_user_name>@www.modelscope.cn/datasets/<namespace>/<dataset-name>.git
# Enter your access token as password
```

### Obtain Access Token

1. Log in to [ModelScope official website](https://www.modelscope.cn).
2. Go to Personal Center -> Access Tokens, and copy your access token.

# 3. Download Dataset Files Using Command Line Tools

Through the command line, you can flexibly download dataset files.

## Command Format

```shell
modelscope download --dataset DATASET_NAME [options] [files ...]
```

## Parameters

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `--dataset` | - | str | None | Dataset ID (required) |
| `files` | - | str | - | Positional, files to download (supports multiple) |
| `--revision` | - | str | None | Version/branch/tag |
| `--cache_dir` | - | str | None | Cache directory |
| `--local_dir` | - | str | None | Local directory (takes precedence over cache_dir) |
| `--include` | - | list | None | Glob patterns for files to include |
| `--exclude` | - | list | None | Glob patterns for files to exclude |
| `--token` | - | str | None | Access token (required for private datasets) |
| `--endpoint` | - | str | None | ModelScope server endpoint |
| `--max-workers` | - | int | default | Maximum concurrent download threads |

## Usage Examples

Command examples using [SA1B-Dense-Caption](https://modelscope.cn/datasets/Tongyi-DataEngine/SA1B-Dense-Caption) as an example:

1. Download a single file
    ```shell
    modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' dataset_infos.json
    ```

2. Download multiple files
    ```shell
    modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' dataset_infos.json README.md
    ```

3. Download specific files
    ```shell
    modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' --include 'data/train-000*'
    ```

4. Filter out specific files
    ```shell
    modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' --exclude 'data/train-000*'
    ```

5. Specify cache_dir for download
    ```shell
    modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' --include 'data/train-000*' --cache_dir './cache_dir'
    ```
    Dataset files will be downloaded to `./cache_dir`

6. Specify local_dir for download
    ```shell
    modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' --include 'data/train-000*' --local_dir './local_dir'
    ```
    Dataset files will be downloaded to `./local_dir`

Note: If both `cache_dir` and `local_dir` are specified, `local_dir` takes precedence and `cache_dir` will be ignored.

## Access Token Required for Private Dataset Downloads

> You can obtain your **access token** from [My Page](https://modelscope.cn/my/myaccesstoken)

### Method 1: Login first, then download

```shell
modelscope login --token YOUR_MODELSCOPE_ACCESS_TOKEN
```

### Method 2: Specify token parameter for download

```shell
modelscope --token 'YOUR_MODELSCOPE_ACCESS_TOKEN' download --dataset 'YOUR_DATASET_NAME'
```