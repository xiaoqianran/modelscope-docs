<!-- modelscope-docs: 模型的上传 | models/upload/upload_CN.md -->

本文介绍在 ModelScope 社区上传模型的不同方式，包括

1. 使用 ModelScope 命令行，或者 Python SDK 创建并上传模型 
2. 使用 GIT 上传模型

# 准备

在进行模型上传之前，请先完成账号注册、登陆。此外需要上传的模型内容，也请另外在**本地模型文件夹**准备好。

# 使用 ModelScope 命令行 或 SDK 上传模型

## 前提条件

* 确保您已经安装了`modelscope`库。如果没有安装，可以使用以下命令进行安装：
    ```shell
    pip install modelscope
    ```
* 从 [ModelScope站点](https://www.modelscope.cn/my/myaccesstoken) 获取您的访问令牌(Access Token)。

## 使用命令行 CLI 工具上传
**在大多数情况下，您可以通过一个命令行就完成模型的上传**。假设你要上传的模型文件存储于本地 `/path/to/model_folder`路径，您希望把模型上传到名为`owner/awesome-new-model`的ModelScope repo上，那么通过如下命令即可实现：

```bash
modelscope upload owner/awesome-new-model /path/to/model_folder --token YOUR-MODELSCOPE-TOKEN
```
其中`owner`可以是您的个人账号名；如果是要上传到组织下的话，则使用组织名。请确保您提供的访问令牌，具备对应repo的编辑权限。

**Note**： 请注意，如果模型在ModelScope上不存在，执行该命令行将默认创建一个对应的**公共模型**，如果您需要修改模型为私有，可在上传完成后，前往ModelScope站点的模型编辑页面进行修改。

此外，通过命令行还可进行上传单个模型文件等操作。关于命令行的详细参数列表，可参见如下说明：
```bash
# 上传单个文件
modelscope upload owner/awesome-new-model /path/to/your/local/file /relative/path/in/repo

# 完整用法示例
modelscope upload [repo_id] [local_path] [path_in_repo] --repo-type model --include '*.bin' --exclude '*.log' --commit-message 'init' --commit-description 'my first commit' --token 'xxx-xxx' --max-workers 16 --endpoint 'https://www.modelscope.cn'

```
**参数说明**

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `repo_id` | - | str | 必需 | 位置参数，仓库 ID（格式：owner/repo-name） |
| `local_path` | - | str | None | 位置参数，本地文件或文件夹路径（可选） |
| `path_in_repo` | - | str | None | 位置参数，仓库中的目标路径（可选） |
| `--repo-type` | - | choice | `model` | 仓库类型（model/dataset） |
| `--include` | - | list | None | 包含的文件 glob 模式 |
| `--exclude` | - | list | None | 排除的文件 glob 模式 |
| `--commit-message` | - | str | None | 提交消息 |
| `--commit-description` | - | str | None | 提交描述 |
| `--token` | - | str | None | 访问令牌 |
| `--max-workers` | - | int | min(8, cpu+4) | 上传并发线程数 |
| `--endpoint` | - | str | None | ModelScope 服务端点 |

您也可以使用`modelscope upload --help`查看 CLI 工具的详细参数。

## 使用 ModelScope 的 Python SDK 进行上传

通过 ModelScope 的 Python SDK，您有多种方式可以方便地将模型上传到 ModelScope 平台。

### 0. 在 SDK 中完成访问令牌登陆
    ```python
    from modelscope.hub.api import HubApi
  
    YOUR_ACCESS_TOKEN = '请从https://modelscope.cn/my/myaccesstoken 获取访问令牌'
    api = HubApi()
    api.login(YOUR_ACCESS_TOKEN)
    ```

访问令牌（Access Token）可前往 [【账号设置】->【访问令牌】](https://modelscope.cn/my/myaccesstoken) 页面获取。

### 1. 创建模型库

假设您的账户名是`user`，期望的模型英文名称为`my-test-model`

```python
from modelscope.hub.constants import Licenses, ModelVisibility

owner_name = 'user'
model_name = 'my-test-model'
model_id = f"{owner_name}/{model_name}"

api.create_model(
    model_id,
    visibility=ModelVisibility.PUBLIC,
    license=Licenses.APACHE_V2,
    chinese_name="我的测试模型"
)
```

**参数说明**

|  **字段名**          |  **必填**  |  **类型**   | **描述**                 |
| ------------------- |  :---------: | :----------: |------------------------|
|  model_id           |  是        |  str       | 模型ID                   |
|  visibility         |  否        |  int       | 模型的可见性,1-私有，5-公开，不填默认5 |
|  license            |  否        |  str       | 模型的许可证，不填默认为Apache-2.0 |
|  chinese_name       |  否        |  str       | 模型的中文名称，默认None               |

更多的参数可以参见开源代码的接口文档。

### 2. 使用SDK上传模型

#### 通过upload_folder接口

ModelScope 库提供基于 http 的文件夹以及文件上传接口，保障更稳定的上传体验。

- 上传模型文件夹

```Python
api.upload_folder(
    repo_id=f"{owner_name}/{model_name}",
    folder_path='/path/to/your_model_dir',
    commit_message='upload model folder to repo',
)
```
**参数说明**

| **字段名**        | **必填** | **类型** | **描述**                                     |
|----------------|:------: |--------|--------------------------------------------|
| repo_id        |  是     | str    | 模型ID，确保您的访问令牌具有上传至对应仓库的权限。                 |
| folder_path    |  是     | str    | 本地待上传文件夹的绝对路径                              |
| path_in_repo   |  否     | str    | 文件夹将被上传到的具体路径及设置的文件夹名称                     |
| commit_message |  否     | str    | 此次上传提交所包含的更改信息                             |
| token          |  否     | str    | 有权限上传的用户访问令牌。前置已经登陆时，可缺省                  |
| repo_type      |  否     | str    | 仓库类型，不填默认为`model`                          |
| allow_patterns            |  否     | str    | 允许上传的文件类型模板，例如`*.json`， 默认为`None`           |
| ignore_patterns            |  否     | str    | 上传时忽略的文件类型模板，例如`*.log`，默认为`None`             |
| max_workers            |  否     | int    | 上传时开启的线程数量，默认为 `min(8,os.cpu_count() + 4))` |
| revision            |  否     | str    | 上传的分支，默认为"master"                          |

更多的参数可以参见开源代码的接口文档。

- 上传模型文件

```Python
api.upload_file(
    path_or_fileobj='/path/to/local/your_file.suffix',
    path_in_repo='repo_path/your_file.suffix',
    repo_id=f"{owner_name}/{model_name}",
    commit_message='upload model file to repo',
)
```

**参数说明**

|  **字段名**            | **必填** | **类型** | **描述**                         |
| --------------------- |:------:|--------|--------------------------------|
|  path_or_fileobj             |   是    | str    | 本地待上传文件的绝对路径                   |
|  path_in_repo            |   是    | str    | 文件将被上传到的具体路径及设置的文件名称           |
|  repo_id            |   是    | str    | 模型ID，确保您的访问令牌具有上传至对应仓库的权限。     |
|  token                |   否    | str    | 有权限上传的用户访问令牌。前置已经登陆时，可缺省      |
|  repo_type            |   否    | str    | 仓库类型，如不填则默认为`model`  |
|  commit_message       |   否    | str    | 本次提交的信息                        |
|  commit_description       |   否    | str    | 本次提交的描述                        |
|  buffer_size_mb       |   否    | int    | 计算hash时的buffer size，单位为MB，默认为1 |
|  tqdm_desc       |   否    | str    | 进度条描述，默认为`[Uploading]`         |
|  disable_tqdm       |   否    | bool   | 是否禁用进度条，默认为False               |

更多的参数可以参见开源代码的接口文档。

#### 使用push_model接口 (deprecated)

ModelScope 库也提供基于 Git 封装的上传到模型repo的接口`push_model`。但这个接口后续将被 deprecate ，推荐使用`upload_folder`等基于 Http 上传的接口。

```python
api.push_model(
    model_id=model_id, # 如果model_id对应的模型库不存在，将会被自动创建
    model_dir="my_local_model_dir" # 指定本地模型所在目录
)
```

**参数说明**

|  **字段名**            | **必填** |  **类型**               | **描述**                           |
| --------------------- |:------: | ---------------------  |----------------------------------|
|  model_id             |  是     |  str                    | 模型ID，确保您的访问令牌具有上传模型的权限           |
|  model_dir            |  是     |  str                    | 本地待上传模型的绝对路径                     |
|  visibility           |  否     |  int                    | 新创建模型的可见性,1-私有，5-公开，不填默认为5。      |
|  license              |  否     |  str                    | 新创建模型的许可证，默认None。                |
|  chinese_name         |  否     |  str                    | 新创建模型的中文名称。默认None，且前端展示为英文名称     |
|  commit_message       |  否     |  str                    | 推送请求的提交信息，默认None                 |

更多的参数可以参见开源代码的接口文档。

### 3. 上传AIGC模型
AIGC模型的上传与普通模型上传类似，但经过简化，在创建仓库时会自动将上传模型的步骤也同步完成。

此外上传文件路径可指向模型文件或文件夹。系统会自动识别上传的类型并将模型文件上传到模型仓库。
#### 通过create_model接口
- 创建仓库并上传AIGC模型文件

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
    description='简单AIGC模型创建示例',
    revision='v1.0'
)

model_repo_url = api.create_model(
    model_id,
    visibility=ModelVisibility.PUBLIC,
    license=Licenses.APACHE_V2,
    chinese_name='我的AIGC模型',
    aigc_model=aigc_model
)

```
**AigcModel参数说明**
| **字段名**          | **必填** | **类型**   | **描述**                                                                 |
|-------------------| :---------: | :----------: |------------------------------------------------------------------------|
| aigc_type         | 是        | str       | AIGC模型类型，可选值：'Checkpoint', 'LoRA', 'VAE'                     |
| base_model_type   | 是        | str       | 基础模型类型，具体可前往接口文档查看 |
| model_path        | 是        | str       | 权重文件或文件夹的路径。
| revision          | 是        | str       | AIGC模型的版本号，默认为'v1.0'                                        |
| base_model_id     | 否        | str       | 基础模型名称，例如：'AI-ModelScope/FLUX.1-dev'，默认为空字符串        |
| description       | 否        | str       | 模型描述，默认为'this is an aigc model'                               |
| cover_images      | 否        | List[str] | 封面图片URL列表，如未提供则使用默认AIGC封面图                                |
| path_in_repo      | 否        | str       | 上传后在目标仓库中的路径，默认为空字符串                                           |



#### 通过命令行CLI工具
假设你要上传的模型文件存储于本地 `/path/to/model_folder_or_file`路径，您希望把模型上传到名为`owner/awesome-aigc-model`的ModelScope repo上，那么通过如下命令即可实现：
```bash
modelscope create owner/awesome-new-model --aigc -model_path /path/to/model_folder_or_file --token YOUR-MODELSCOPE-TOKEN  --aig_type Checkpoint --base_model_type QWEN_IMAGE_20_B --revision v1.0  --description "create an aigc model"
```
参数说明同上

# 使用 GIT 上传模型
您可以通过 Git 命令将本地模型同步至远程仓库。由于Git本身会引入文件历史版本管理以及其对应的额外本地存储等overhead，所以**如果您没有明确的多版本管理需求，建议您直接使用ModelScope命令行或SDK来进行模型上传**，而不是GIT。

## 前提条件
请确保安装`Git`和`Git LFS`。

## 步骤
### 1. 通过ModelScope站点页面创建模型库

在 Modelscope 首页右上角「个人头像」处找到“创建模型”的快速入口，点击进入创建模型界面。 根据页面指引，填写必要的基础信息即可提交创建。详细创建流程请参考：[创建自己的模型库](./模型库介绍.md)

### 2. 通过 GIT 完成本地模型上传

*   远程模型仓库克隆

    假设您的账户名是`user`，模型名称为` my-test-model`：

    ```shell
    git lfs install
    git clone https://oauth2:YOUR-ACCESS-TOKEN@www.modelscope.cn/user/my-test-model.git
    ```
    为了方便您后续的模型上传，请在git clone阶段，就直接提供访问令牌（Access Token）。您可以从平台[访问令牌](https://modelscope.cn/my/myaccesstoken)页面获取。

*   将您的模型文件，移动到clone下来的模型目录中，并通过 `git add`, `git commit`, `git push`等操作完成模型的上传。

# 注意事项

* 上传文件容量限制：
    - 单个文件大小不得超过 50 GB
    - 全部文件总数不得超过 100,000 个
    - 单个子文件夹内文件总数不得超过 10,000 个
    - 未标记为 LFS 的所有文件总大小不得超过 500 MB
> 为了确保上传过程的顺畅和高效，当单个文件大小超过5MB，或者所有文件的总大小超过500MB时，我们推荐使用 `GIT LFS` 来上传文件；

* 通过文件/文件夹上传接口时，符合以下条件自动标记为 GIT LFS 上传：
    - 文件大小超过 5 MB
    - 平台会自动利用 LFS 上传以下后缀的文件：
    ```shell
    *.7z、*.arrow、*.bin、*.bin.*、*.bz2、*.ftz、*.gz、*.h5、*.joblib、*.lfs.*、*.model、*.msgpack、*.onnx、*.ot、*.parquet、*.pb、*.pt、*.pth、*.rar、saved_model/**/*、*.tar.*、*.tflite、*.tgz、*.xz、*.zip、*.zstandard、*.tfevents*、*.db*、*.ark*、**/*ckpt*data*、**/*ckpt*.meta、**/*ckpt*.index、*.safetensors、*.ckpt、*.gguf*、*.ggml、*.llamafile*、*.pt2
    ```

* 基于GIT上传的时候，您需要提前扫描本地模型目录下所有大于5MB的文件，并通过手动标记 `git lfs track <your_file_name>`；


# 给模型打版本
为保证模型被正确使用，您需要给您的模型合适的版本，以免您在更新模型时影响使用模型的服务。参考[模型的版本](./模型的版本.md)
