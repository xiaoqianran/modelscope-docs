<!-- modelscope-docs: Dataset Upload | datasets/upload/upload_EN.md -->

This article introduces three main methods for uploading datasets to the ModelScope community:

1. Upload using Python SDK
2. Upload using GIT commands
3. Upload via web interface


# Upload using Python SDK

The ModelScope library provides HTTP-based file and folder upload interfaces, ensuring a more stable upload experience while also performing necessary checks on file size and folder quantity. Therefore, you can conveniently upload local dataset folders or specify particular local data files for upload.

## Prerequisites

* Ensure you have installed the `modelscope` library. If not installed, use the following command to install it:

    ```shell
    pip install modelscope
    ```
* Complete access token login in the SDK

    ```python
    from modelscope.hub.api import HubApi

    YOUR_ACCESS_TOKEN = 'Get your SDK token from https://modelscope.cn/my/myaccesstoken'
    api = HubApi()
    api.login(YOUR_ACCESS_TOKEN)
    ```

    You can obtain your SDK access token from [Account Settings -> Access Tokens](https://modelscope.cn/my/myaccesstoken).

## Upload using File Interface
Assume you have already created a dataset repository with username `user` and dataset name `my-test-data`.
### Upload Dataset Folder

```Python
owner_name = 'user'
dataset_name = 'my-test-data'

api.upload_folder(
    repo_id=f"{owner_name}/{dataset_name}",
    folder_path='/path/to/local/dir',
    commit_message='upload dataset folder to repo',
    repo_type = 'dataset'
)
```
**Parameter Description**

| **Field Name**        | **Required** | **Type** | **Description**                                    |
|----------------|:------: |--------|-------------------------------------------|
| repo_id        |  Yes     | str    | Dataset ID. Ensure your access token has permission to upload to the corresponding repository.               |
| folder_path    |  Yes     | str    | Absolute path of the local folder to be uploaded                             |
| path_in_repo   |  No     | str    | Specific path and folder name where the folder will be uploaded                    |
| commit_message |  No     | str    | Description of changes included in this upload commit                            |
| token          |  No     | str    | User access token with upload permissions. Can be omitted if already logged in                 |
| repo_type      |  No     | str    | Repository type: `model`, `dataset`. Defaults to `model` if not specified      |
| allow_patterns            |  No     | str    | File type patterns to allow for upload, e.g., `*.json`. Defaults to `None`         |
| ignore_patterns            |  No     | str    | File type patterns to ignore during upload, e.g., `*.log`. Defaults to `None`           |
| max_workers            |  No     | int    | Number of threads to use for upload. Defaults to `min(8,os.cpu_count() + 4))` |
| revision            |  No     | str    | Branch to upload to. Defaults to `master`                          |

For more parameters, please refer to the interface documentation in the open-source code.

### Upload Data File

```Python
owner_name = 'user'
dataset_name = 'my-test-data'

api.upload_file(
    path_or_fileobj='/path/to/local/your_file.suffix',
    path_in_repo='repo_path/your_file.suffix',
    repo_id=f"{owner_name}/{dataset_name}",
    repo_type = 'dataset',
    commit_message='upload dataset file to repo',
)
```

**Parameter Description**

|  **Field Name**            | **Required** | **Type** | **Description**                                        |
| --------------------- |:------:|--------|-----------------------------------------------|
|  path_or_fileobj             |   Yes    | str    | Absolute path of the local file to be uploaded                                  |
|  path_in_repo            |   Yes    | str    | Specific path and filename where the file will be uploaded                          |
|  repo_id            |   Yes    | str    | Model ID/Dataset ID. Ensure your access token has permission to upload to the corresponding repository. Use dataset ID when uploading datasets |
|  token                |   No    | str    | User access token with upload permissions. Can be omitted if already logged in                     |
|  repo_type            |   No    | str    | Specify as `dataset` for dataset repositories. Defaults to `model` if not specified              |
|  commit_message       |   No    | str    | Commit message for this upload                                       |
|  commit_description       |   No    | str    | Commit description for this upload                                       |
|  buffer_size_mb       |   No    | int    | Buffer size in MB for hash calculation. Defaults to 1                |
|  tqdm_desc       |   No    | str    | Progress bar description. Defaults to `[Uploading]`                        |
|  disable_tqdm       |   No    | bool   | Whether to disable progress bar. Defaults to False                              |


For more parameters, please refer to the interface documentation in the open-source code.

## Upload using CLI Tool
After installing the `modelscope` library, you can also directly use CLI commands to upload dataset folders or files. Assume owner_name is your desired username or organization name, and repo_name is the dataset name, so owner_name/repo_name is the dataset ID.

```bash
# Login
modelscope login --token Your-Modelscope-Token

# Upload folder
modelscope upload owner_name/repo_name /path/to/your_folder --repo-type dataset

# Upload file
modelscope upload owner_name/repo_name /path/to/your_file.suffix data/your_file.suffix --repo-type dataset

# Complete usage example
modelscope upload [repo_id] [local_path] [path_in_repo] --repo-type dataset --include '*.json' --exclude '*.log' --commit-message 'init' --commit-description 'my first commit' --token 'xxx-xxx' --max-workers 16 --endpoint 'https://www.modelscope.cn'
```

**Parameter Description**

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `repo_id` | - | str | required | Positional, repository ID (format: owner/repo-name) |
| `local_path` | - | str | None | Positional, local file or folder path (optional) |
| `path_in_repo` | - | str | None | Positional, target path in repository (optional) |
| `--repo-type` | - | choice | `dataset` | Repository type (model/dataset) |
| `--include` | - | list | None | Glob patterns for files to include |
| `--exclude` | - | list | None | Glob patterns for files to exclude |
| `--commit-message` | - | str | None | Commit message |
| `--commit-description` | - | str | None | Commit description |
| `--token` | - | str | None | Access token |
| `--max-workers` | - | int | min(8, cpu+4) | Upload concurrency threads |
| `--endpoint` | - | str | None | ModelScope server endpoint |

You can also use `modelscope upload --help` to view detailed CLI tool parameters.

## Notes

*   Individual file size cannot exceed 50 GB, total number of files cannot exceed 100,000, and files within a single subfolder cannot exceed 10,000, otherwise an error will occur;
*   File and folder upload interfaces will automatically mark files with extensions listed in the Git section below or files larger than 5 MB as `GIT LFS` uploads;
*   Total size of all files not marked for LFS upload cannot exceed 500 MB.

# Upload using GIT Commands
You can synchronize local datasets to remote repositories using Git commands. Before starting, ensure you have installed `Git` and `Git LFS`.

## Steps

*   Clone remote dataset repository. Assuming your username is `user` and dataset name is `my-test-dataset`:

    ```shell
    git lfs install
    git clone https://oauth2:YOUR-ACCESS-TOKEN@www.modelscope.cn/user/my-test-dataset.git
    ```
    For convenience in future dataset uploads, please provide the access token directly during the git clone phase. You can obtain it from the platform's [Access Tokens](https://modelscope.cn/my/myaccesstoken) page.

*   Move your dataset files to the cloned dataset directory and complete the dataset upload using operations like `git add`, `git commit`, `git push`.

## Notes

*   When uploading individual files larger than 5 MB, it's recommended to use `GIT LFS` to optimize page loading speed;

*   Individual files uploaded via `GIT LFS` cannot exceed 50 GB;

*   The platform automatically uses LFS to upload files with the following extensions:
    ```shell
    *.7z、*.arrow、*.bin、*.bin.*、*.bz2、*.ftz、*.gz、*.h5、*.joblib、*.lfs.*、*.model、*.msgpack、*.onnx、*.ot、*.parquet、*.pb、*.pt、*.pth、*.rar、saved_model/**/*、*.tar.*、*.tflite、*.tgz、*.xz、*.zip、*.zstandard、*.tfevents*、*.db*、*.ark*、**/*ckpt*data*、**/*ckpt*.meta、**/*ckpt*.index、*.safetensors、*.ckpt、*.gguf*、*.ggml、*.llamafile*、*.pt2
    ```

*   You can also scan all files larger than 5MB in your local dataset directory in advance and manually mark them with `git lfs track <your_file_name>`.

# Upload via Web Interface

If you are the dataset creator or have appropriate permissions, you can also directly create or upload data files through the web interface. The current page supports uploading up to 1,000 files at once with a total size of up to 500MB. For other scenarios, we recommend using HTTP-based upload interfaces like `upload_folder` in the Python SDK.