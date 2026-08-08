<!-- modelscope-docs: 命令行工具参考 | sdk/cli/cli_CN.md -->

# ModelScope CLI 工具

ModelScope CLI 提供一套完整的命令行工具，用于模型/数据集的下载、上传、管理及本地运行。支持以下子命令：

| 命令 | 功能 |
|------|------|
| `login` | 登录认证 |
| `download` | 下载模型/数据集/合集 |
| `upload` | 上传文件到仓库 |
| `create` | 创建远程仓库 |
| `scan-cache` | 扫描本地缓存 |
| `clear-cache` | 清理本地缓存 |
| `llamafile` | 运行 Llamafile 模型 |
| `server` | 启动推理 API 服务 |
| `plugin` | 插件管理 |
| `skills add` | 安装 Skills |
| `modelcard` | 模型卡片管理 |
| `pipeline` | 生成 Pipeline 模板 |

## 安装与配置

### 安装方式

```shell
pip install modelscope
```

安装完成后即可使用 `modelscope` 命令。查看帮助信息：

```shell
modelscope --help
```

### 登录认证（modelscope login）

访问私有模型或数据集前需完成登录认证。访问令牌可在 [个人中心](https://modelscope.cn/my/myaccesstoken) 获取。

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--token` | - | str | 必需 | ModelScope 访问令牌 |
| `--endpoint` | - | str | None | ModelScope 服务端点 |

```shell
modelscope login --token YOUR_MODELSCOPE_SDK_TOKEN
```

---

## 核心命令

### 下载（modelscope download）

从 ModelScope Hub 下载模型、数据集或合集文件到本地。

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `repo_id` | - | str | 可选 | 仓库 ID（位置参数） |
| `files` | - | str | 可变 | 指定下载的文件（位置参数） |
| `--model` | - | str | None | 模型 ID（与 `--dataset` 互斥） |
| `--dataset` | - | str | None | 数据集 ID（与 `--model` 互斥） |
| `--repo-type` | - | choice | `model` | 仓库类型（model/dataset），与位置参数 repo_id 配合使用 |
| `--collection` | - | str | None | 合集 ID |
| `--revision` | - | str | None | 版本/分支/tag |
| `--cache_dir` | - | str | None | 缓存目录 |
| `--local_dir` | - | str | None | 本地目录（优先级高于 cache_dir） |
| `--include` | - | list | None | 包含文件的 glob 模式 |
| `--exclude` | - | list | None | 排除文件的 glob 模式 |
| `--max-workers` | - | int | 默认 | 最大并发下载线程数 |
| `--token` | - | str | None | 访问令牌 |
| `--endpoint` | - | str | None | 服务端点 |

#### 模型下载示例

以 [Qwen2-7B](https://www.modelscope.cn/models/Qwen/Qwen2-7b) 模型为例：

```shell
# 下载整个模型到默认缓存目录
modelscope download --model 'Qwen/Qwen2-7b'

# 下载到指定本地目录
modelscope download --model 'Qwen/Qwen2-7b' --local_dir './local_dir'

# 下载单个文件
modelscope download --model 'Qwen/Qwen2-7b' tokenizer.json

# 下载多个文件
modelscope download --model 'Qwen/Qwen2-7b' tokenizer.json config.json
```

```shell
# 使用 glob 模式过滤下载
modelscope download --model 'Qwen/Qwen2-7b' --include '*.safetensors'
modelscope download --model 'Qwen/Qwen2-7b' --exclude '*.safetensors'

# 指定缓存目录（文件存储于 cache_dir/Qwen/Qwen2-7b）
modelscope download --model 'Qwen/Qwen2-7b' --include '*.json' --cache_dir './cache_dir'
```

> 若同时指定 `cache_dir` 和 `local_dir`，`local_dir` 优先级更高，`cache_dir` 将被忽略。

#### 数据集下载示例

以 [SA1B-Dense-Caption](https://modelscope.cn/datasets/Tongyi-DataEngine/SA1B-Dense-Caption) 为例：

```shell
# 下载指定文件
modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' dataset_infos.json

# 下载多个文件
modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' dataset_infos.json README.md

# 按模式匹配下载
modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' --include 'data/train-000*'

# 排除指定文件
modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' --exclude 'data/train-000*'

# 指定本地目录
modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' --include 'data/train-000*' --local_dir './local_dir'
```

#### 合集下载示例

```shell
# 下载合集中所有模型/数据集
modelscope download --collection 'my_org/my_collection'
```

#### 使用 repo_id 位置参数

`repo_id` 作为位置参数时，可通过 `--repo-type` 指定仓库类型，或使用 `--model`/`--dataset` 指定 ID：

```shell
# 等效写法
modelscope download --model Qwen/Qwen2-7b
modelscope download --model 'Qwen/Qwen2-7b'
```

---

### 上传（modelscope upload）

将本地文件或文件夹上传到 ModelScope 远程仓库。上传前需完成登录认证。

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `repo_id` | - | str | 必需 | 仓库 ID（格式: owner/repo-name） |
| `local_path` | - | str | 当前目录 | 本地文件或文件夹路径（位置参数） |
| `path_in_repo` | - | str | 相对路径 | 仓库中的目标路径（位置参数） |
| `--repo-type` | - | str | model | 仓库类型（model/dataset） |
| `--include` | - | list | None | 包含文件的 glob 模式 |
| `--exclude` | - | list | None | 排除文件的 glob 模式 |
| `--commit-message` | - | str | None | 提交消息 |
| `--commit-description` | - | str | None | 提交描述 |
| `--token` | - | str | None | 访问令牌 |
| `--max-workers` | - | int | min(8, cpu+4) | 上传并发线程数 |
| `--endpoint` | - | str | None | 服务端点 |

#### 使用示例

上传前需完成登录：`modelscope login --token YOUR_TOKEN`，或在命令中通过 `--token` 参数指定。

```shell
# 上传文件夹到模型仓库
modelscope upload owner_name/repo_name /local/path/your_folder path/in/repo/your_folder

# 上传到数据集仓库
modelscope upload owner_name/repo_name /local/path/your_folder path/in/repo/your_folder --repo-type dataset

# 上传单个文件
modelscope upload owner_name/repo_name /local/path/data.csv path/in/repo/data.csv --repo-type dataset
```

其中 `path/in/repo/your_folder` 为文件在远程仓库中的目标路径。

```shell
# 按 glob 模式过滤上传
modelscope upload owner_name/repo_name /local/path/your_folder path/in/repo/your_folder --include '*.safetensors'
modelscope upload owner_name/repo_name /local/path/your_folder path/in/repo/your_folder --exclude '*.pt'

# 指定提交信息
modelscope upload owner_name/repo_name /local/path/your_folder path/in/repo/your_folder --commit-message 'update model weights' --commit-description 'v2.0 release'

# 指定 token 上传
modelscope upload owner_name/repo_name /local/path/your_folder path/in/repo/your_folder --token YOUR_TOKEN
```

---

### 创建仓库（modelscope create）

在 ModelScope Hub 上创建新的模型或数据集仓库。

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `repo_id` | - | str | 必需 | 仓库 ID（格式: owner/repo-name） |
| `--token` | - | str | None | 访问令牌 |
| `--repo_type` | - | choice | model | 仓库类型（model/dataset） |
| `--visibility` | - | choice | public | 可见性（public/internal/private） |
| `--license` | - | choice | Apache-2.0 | 许可证 |
| `--chinese_name` | - | str | None | 中文名称 |
| `--exist_ok` | - | flag | False | 仓库已存在时不报错 |
| `--endpoint` | - | str | None | 服务端点 |

**AIGC 模式**（追加 `--aigc` 标志启用）：

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--aigc` | - | flag | False | 启用 AIGC 模式 |
| `--model_path` | - | str | 必需 | 模型文件/文件夹路径 |
| `--aigc_type` | - | str | 必需 | AIGC 类型（Checkpoint/LoRA/VAE） |
| `--base_model_type` | - | str | 必需 | 基础模型类型（如 SD_XL） |
| `--revision` | - | str | v1.0 | 版本标签 |
| `--base_model_id` | - | str | 空 | 基础模型 ID |
| `--description` | - | str | 默认 | 模型描述 |
| `--from_json` | - | str | None | JSON 配置文件路径 |

#### 使用示例

```shell
# 创建公开模型仓库
modelscope create my_org/my_model --repo_type model --visibility public --license Apache-2.0

# 创建私有数据集仓库并指定中文名称
modelscope create my_org/my_dataset --repo_type dataset --visibility private --chinese_name '我的数据集'

# AIGC 模式：上传 LoRA 模型
modelscope create my_org/my_lora --aigc --model_path ./lora_weights --aigc_type LoRA --base_model_type SD_XL
```

---

## 缓存管理

### 扫描缓存（modelscope scan-cache）

扫描并展示本地已下载的模型和数据集缓存信息。仅识别通过 `snapshot_download` 或 `modelscope download` 下载的文件。

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--dir` | - | str | None | 指定缓存目录（默认: `~/.cache/modelscope/hub`） |

#### 使用示例

```shell
# 扫描默认缓存目录
modelscope scan-cache
```

输出示例：
```text
REPO ID             REPO TYPE REVISION SIZE ON DISK NB FILES LAST_ACCESSED LAST_MODIFIED LOCAL PATH                                               
------------------- --------- -------- ------------ -------- ------------- ------------- -------------------------------------------------------- 
AI-ModelScope/IQuiz dataset   master        5.23 MB        8 4 hours ago   4 hours ago   /root/.cache/modelscope/hub/datasets/AI-ModelScope/IQuiz 
Qwen/Qwen3-0.6B     model     master        1.41 GB        9 4 hours ago   4 hours ago   /root/.cache/modelscope/hub/models/Qwen/Qwen3-0___6B     

Done in 0.0s. Scanned 2 repo(s) for a total of 1.42 GB.
```

```shell
# 扫描指定目录
modelscope scan-cache --dir /mnt/workspace/.cache/modelscope
```

---

### 清理缓存（modelscope clear-cache）

清除本地缓存及下载过程中的临时文件。所有操作仅影响本地缓存，不影响远程仓库数据。

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--model` | - | str | None | 清除指定模型缓存（与 `--dataset` 互斥） |
| `--dataset` | - | str | None | 清除指定数据集缓存（与 `--model` 互斥） |

> ⚠️ 不指定任何参数时将清除**全部**本地缓存，请谨慎操作。

#### 使用示例

```shell
# 清除指定模型缓存
modelscope clear-cache --model 'Qwen/Qwen2-7b'

# 清除指定数据集缓存
modelscope clear-cache --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption'

# 清除全部本地缓存
modelscope clear-cache
```

---

## 模型运行

### Llamafile（modelscope llamafile）

下载并运行 [Llamafile](https://github.com/Mozilla-Ocho/llamafile) 格式的大语言模型。Llamafile 将模型和运行时封装为单个可执行文件，支持 Linux/macOS/Windows 一键运行。

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--model` | - | str | 必需 | 模型 ID（仓库需包含 llamafile 文件） |
| `--accuracy` | - | str | q4_k_m | GGUF 精度（与 `--file` 互斥） |
| `--file` | - | str | None | 指定 llamafile 文件名 |
| `--local_dir` | - | str | None | 下载目录 |
| `--launch` | - | str | True | 下载后是否直接运行 |

#### 使用示例

```shell
# 使用默认精度（Q4_K_M）运行模型
modelscope llamafile --model Qwen-Llamafile/Qwen2.5-3B-Instruct-llamafile

# 指定精度
modelscope llamafile --model Qwen-Llamafile/Qwen2.5-3B-Instruct-llamafile --accuracy Q2_K

# 指定文件名（与上面等效）
modelscope llamafile --model Qwen-Llamafile/Qwen2.5-3B-Instruct-llamafile --file qwen2.5-3b-instruct-q2_k.llamafile
```

```shell
# 仅下载不运行，指定保存路径
modelscope llamafile --model Qwen-Llamafile/Qwen2.5-3B-Instruct-llamafile --local_dir ./dir --launch False
```

---

### API 服务（modelscope server）

启动模型推理 API 服务。参数由 `modelscope.server.api_server` 模块动态注入，支持 vLLM 等推理后端的全部配置项。

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| (动态参数) | - | - | - | 由推理后端模块注入 |

#### 使用示例

```shell
# 启动模型推理服务
modelscope server --model Qwen/Qwen2-7b

# 指定端口和设备
modelscope server --model Qwen/Qwen2-7b --port 8000 --device cuda

# 查看支持的全部参数
modelscope server --help
```

> 具体参数取决于所使用的推理后端，请通过 `--help` 查看完整选项。

---

## 扩展功能

### 插件管理（modelscope plugin）

管理 ModelScope 插件的安装、卸载和列表查看。

#### plugin install

安装一个或多个 ModelScope 插件。

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `package` | - | str | 必需 | 包名（位置参数，支持多个） |
| `--index_url` | `-i` | str | None | PyPI 索引 URL |
| `--force_update` | `-f` | str | None | 强制更新 |

#### plugin uninstall

卸载一个或多个 ModelScope 插件。

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `package` | - | str | 必需 | 包名（位置参数，支持多个） |
| `--yes` | `-y` | flag | False | 跳过确认提示 |

#### plugin list

列出已安装或可用的 ModelScope 插件。

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--all` | `-a` | flag | False | 显示所有插件（包括未安装的） |

#### 使用示例

```shell
# 安装插件
modelscope plugin install ms-swift

# 强制更新插件
modelscope plugin install ms-swift -f

# 卸载插件（跳过确认）
modelscope plugin uninstall ms-swift -y

# 查看所有可用插件
modelscope plugin list --all
```

---

### Skills 安装（modelscope skills add）

下载并安装 ModelScope Skills 到本地环境。

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `skill_ids` | - | str | 必需 | 技能 ID（位置参数，支持多个，格式: path/name） |
| `--token` | - | str | None | 访问令牌（私有技能需要） |
| `--local_dir` | - | str | ~/.agents/skills | 目标安装目录 |
| `--max-workers` | - | int | 8 | 最大并发下载线程数 |

#### 使用示例

```shell
# 安装单个技能
modelscope skills add modelscope/web_search

# 安装多个技能到指定目录
modelscope skills add modelscope/web_search modelscope/code_interpreter --local_dir ./my_skills

# 安装私有技能
modelscope skills add my_org/private_skill --token YOUR_TOKEN
```

---

## 进阶命令

### 模型卡片管理（modelscope modelcard）

创建、上传和下载模型卡片。别名：`modelscope model`。

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--action` | `-act` | choice | 必需 | 操作类型（create/upload/download） |
| `--access_token` | `-tk` | str | None | 认证令牌 |
| `--group_id` | `-gid` | str | damo | 组织名 |
| `--model_id` | `-mid` | str | 必需 | 模型名 |
| `--visibility` | `-vis` | int | 5 | 可见性（1=公开, 3=组织, 5=私有） |
| `--license` | `-lic` | str | Apache License 2.0 | 许可证 |
| `--chinese_name` | `-ch` | str | 默认 | 中文名称 |
| `--model_dir` | `-md` | str | . | 模型文件目录 |
| `--version_tag` | `-vt` | str | None | 版本标签 |
| `--version_info` | `-vi` | str | None | 版本信息 |

#### 使用示例

```shell
# 创建模型卡片
modelscope modelcard -act create -mid my_model -gid my_org -vis 1

# 上传模型文件
modelscope modelcard -act upload -mid my_model -gid my_org -md ./model_output -vt v1.0

# 下载模型
modelscope modelcard -act download -mid my_model -gid my_org -md ./download_dir
```

---

### Pipeline 模板（modelscope pipeline）

生成 ModelScope Pipeline 集成的代码模板，用于快速接入自定义模型。

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--action` | `-act` | choice | 必需 | 仅支持 create |
| `--task_name` | `-t` | str | 必需 | 任务名称 |
| `--model_name` | `-m` | str | MyCustomModel | 模型类名 |
| `--preprocessor_name` | `-p` | str | MyCustomPreprocessor | 预处理器类名 |
| `--pipeline_name` | `-pp` | str | MyCustomPipeline | Pipeline 类名 |
| `--save_file_path` | `-s` | str | ./ | 输出文件路径 |
| `--filename` | `-f` | str | ms_wrapper.py | 输出文件名 |
| `--configuration_path` | `-config` | str | ./ | 配置文件路径 |

#### 使用示例

```shell
# 生成 Pipeline 模板文件
modelscope pipeline -act create -t text-classification -m BertClassifier -pp BertPipeline

# 指定输出路径和文件名
modelscope pipeline -act create -t image-segmentation -s ./src -f my_pipeline.py

# 自定义所有组件名称
modelscope pipeline -act create -t text-generation -m QwenModel -p QwenTokenizer -pp QwenPipeline -s ./integrations
```

生成的文件包含模型、预处理器和 Pipeline 的注册代码模板，可直接用于 ModelScope 框架集成。

---

## 环境变量

以下环境变量可全局影响 CLI 行为：

| 环境变量 | 说明 |
|----------|------|
| `MODELSCOPE_CACHE` | 自定义默认缓存目录（默认: `~/.cache/modelscope/hub`） |
| `MODELSCOPE_TOKEN` | 默认访问令牌（优先级低于 `--token` 参数） |
| `MODELSCOPE_ENDPOINT` | 自定义服务端点 |

```shell
# 示例：设置全局缓存目录
export MODELSCOPE_CACHE=/data/modelscope_cache
modelscope download --model 'Qwen/Qwen2-7b'
```
