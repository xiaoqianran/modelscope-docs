<!-- modelscope-docs: 数据集的上传 | datasets/upload/upload_CN.md -->

本文介绍在 ModelScope 社区上传数据集的三种主要方式：

1. 使用 Python SDK 上传
2. 使用 GIT 命令上传
3. 通过网页上传


# 使用 Python SDK 上传

ModelScope 库提供基于 http 的文件及文件夹上传接口，保障更稳定的上传体验，同时也对文件的大小、文件夹的数量进行必要的检查。因此，您可以方便地上传本地数据集文件夹或指定上传本地具体的数据文件。

## 前提条件

* 确保您已经安装了`modelscope`库。如果没有安装，可以使用以下命令进行安装：

    ```shell
    pip install modelscope
    ```
* 在 SDK 中完成访问令牌登陆

    ```python
    from modelscope.hub.api import HubApi
  
    YOUR_ACCESS_TOKEN = '请从https://modelscope.cn/my/myaccesstoken 获取SDK令牌'
    api = HubApi()
    api.login(YOUR_ACCESS_TOKEN)
    ```

    访问的SDK令牌（token）可前往[【账号设置】->【访问令牌】](https://modelscope.cn/my/myaccesstoken)获取。

## 使用文件接口上传
假定您已经创建好数据集仓库，账户名是`user`，数据集英文名称为`my-test-data`。
### 上传数据文件夹

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
**参数说明**

| **字段名**        | **必填** | **类型** | **描述**                                    |
|----------------|:------: |--------|-------------------------------------------|
| repo_id        |  是     | str    | 数据集ID，确保您的访问令牌具有上传至对应仓库的权限。               |
| folder_path    |  是     | str    | 本地待上传文件夹的绝对路径                             |
| path_in_repo   |  否     | str    | 文件夹将被上传到的具体路径及设置的文件夹名称                    |
| commit_message |  否     | str    | 此次上传提交所包含的更改内容                            |
| token          |  否     | str    | 有权限上传的用户访问令牌。前置已经登陆时，可缺省                 |
| repo_type      |  否     | str    | 仓库类型：`model`, `dataset`,不填默认为`model`      |
| allow_patterns            |  否     | str    | 允许上传的文件类型模板，例如`*.json`， 默认为`None`         |
| ignore_patterns            |  否     | str    | 上传时忽略的文件类型模板，例如`*.log`，默认为`None`           |
| max_workers            |  否     | int    | 上传时开启的线程数量，默认为 `min(8,os.cpu_count() + 4))` |
| revision            |  否     | str    | 上传的分支，默认为`master`                          |

更多的参数可以参见开源代码的接口文档。

### 上传数据文件

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

**参数说明**

|  **字段名**            | **必填** | **类型** | **描述**                                        |
| --------------------- |:------:|--------|-----------------------------------------------|
|  path_or_fileobj             |   是    | str    | 本地待上传文件的绝对路径                                  |
|  path_in_repo            |   是    | str    | 文件将被上传到的具体路径及设置的文件名称                          |
|  repo_id            |   是    | str    | 模型ID/数据集ID，确保您的访问令牌具有上传至对应仓库的权限。上传数据集时填写数据集ID |
|  token                |   否    | str    | 有权限上传的用户访问令牌。前置已经登陆时，可缺省                     |
|  repo_type            |   否    | str    | 数据集仓库指定为`dataset`，如不填则默认为`model`              |
|  commit_message       |   否    | str    | 本次提交的信息                                       |
|  commit_description       |   否    | str    | 本次提交的描述                                       |
|  buffer_size_mb       |   否    | int    | 计算hash时的buffer size，单位为MB，默认为1                |
|  tqdm_desc       |   否    | str    | 进度条描述，默认为`[Uploading]`                        |
|  disable_tqdm       |   否    | bool   | 是否禁用进度条，默认为False                              |


更多的参数可以参见开源代码的接口文档。

## 使用 CLI 工具上传
在安装完成`modelscope`库后，您也可以直接使用 CLI 命令行完成数据集文件夹或文件的上传。假定 owner_name 为您期望上传的用户账户名或组织名，repo_name 为数据集英文名称，即 owner_name/repo_name 为数据集ID。

```bash
# 登陆
modelscope login --token Your-Modelscope-Token

# 上传文件夹
modelscope upload owner_name/repo_name /path/to/your_folder --repo-type dataset

# 上传文件
modelscope upload owner_name/repo_name /path/to/your_file.suffix data/your_file.suffix --repo-type dataset

# 完整用法示例
modelscope upload [repo_id] [local_path] [path_in_repo] --repo-type dataset --include '*.json' --exclude '*.log' --commit-message 'init' --commit-description 'my first commit' --token 'xxx-xxx' --max-workers 16 --endpoint 'https://www.modelscope.cn'
```

**参数说明**

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `repo_id` | - | str | 必需 | 位置参数，仓库 ID（格式：owner/repo-name） |
| `local_path` | - | str | None | 位置参数，本地文件或文件夹路径（可选） |
| `path_in_repo` | - | str | None | 位置参数，仓库中的目标路径（可选） |
| `--repo-type` | - | choice | `dataset` | 仓库类型（model/dataset） |
| `--include` | - | list | None | 包含的文件 glob 模式 |
| `--exclude` | - | list | None | 排除的文件 glob 模式 |
| `--commit-message` | - | str | None | 提交消息 |
| `--commit-description` | - | str | None | 提交描述 |
| `--token` | - | str | None | 访问令牌 |
| `--max-workers` | - | int | min(8, cpu+4) | 上传并发线程数 |
| `--endpoint` | - | str | None | ModelScope 服务端点 |

您也可以使用`modelscope upload --help`查看 CLI 工具的详细参数。

## 注意事项
    
*   单个文件大小不超过 50 GB，所有文件总数不超过 100000个，单个子文件夹内文件总数不超过 10000个，否则将会报错；
*   文件上传及文件夹上传接口将自动对格式在下文Git部分指定后缀列表中的文件或大于 5 MB的文件标记为`GIT LFS`上传；
*   未标记为 LFS 上传的所有文件总大小不能超过 500 MB。

# 使用 GIT 命令上传
您可以通过 Git 命令将本地数据集同步至远程仓库。开始前，请确保已经安装`Git`和`Git LFS`。

## 步骤

*   远程数据集仓库克隆。假设您的账户名是`user`，数据集名称为` my-test-dataset`：

    ```shell
    git lfs install
    git clone https://oauth2:YOUR-ACCESS-TOKEN@www.modelscope.cn/user/my-test-dataset.git
    ```
    为了方便您后续的数据集上传，请在git clone阶段，就直接提供访问令牌。您可以从平台[访问令牌](https://modelscope.cn/my/myaccesstoken)页面获取。

*   将您的数据集文件，移动到clone下来的数据集目录中，并通过 `git add`, `git commit`, `git push`等操作完成数据集的上传。

## 注意事项

*   当上传的单个文件大小超过 5 MB 时，推荐使用 `GIT LFS` 上传文件，以优化页面加载速度；
    
*   通过 `GIT LFS` 上传的单文件不能超过 50 GB；
    
*   平台会自动利用 LFS 上传以下后缀的文件：
    ```shell
    *.7z、*.arrow、*.bin、*.bin.*、*.bz2、*.ftz、*.gz、*.h5、*.joblib、*.lfs.*、*.model、*.msgpack、*.onnx、*.ot、*.parquet、*.pb、*.pt、*.pth、*.rar、saved_model/**/*、*.tar.*、*.tflite、*.tgz、*.xz、*.zip、*.zstandard、*.tfevents*、*.db*、*.ark*、**/*ckpt*data*、**/*ckpt*.meta、**/*ckpt*.index、*.safetensors、*.ckpt、*.gguf*、*.ggml、*.llamafile*、*.pt2
    ```

*   您也可以提前扫描本地数据集目录下所有大于5MB的文件，并通过手动标记 `git lfs track <your_file_name>`；

# 通过网页上传

如果您是数据集的创建者或拥有相应的权限，也可以直接通过网页端创建或上传数据文件。页面当前支持单次最多上传1000个，总计500MB以内的文件，其他情况推荐使用Python SDK中`upload_folder`等基于 Http 上传的接口。
