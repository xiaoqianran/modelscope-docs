<!-- modelscope-docs: CLI Tool Reference | sdk/cli/cli_EN.md -->

# ModelScope CLI Tool

ModelScope CLI provides a complete set of command-line tools for downloading, uploading, managing, and locally running models/datasets. The following subcommands are supported:

| Command | Description |
|---------|-------------|
| `login` | Authentication |
| `download` | Download models/datasets/collections |
| `upload` | Upload files to a repository |
| `create` | Create a remote repository |
| `scan-cache` | Scan local cache |
| `clear-cache` | Clear local cache |
| `llamafile` | Run Llamafile models |
| `server` | Start an inference API server |
| `plugin` | Plugin management |
| `skills add` | Install Skills |
| `modelcard` | Model card management |
| `pipeline` | Generate Pipeline templates |

## Installation & Configuration

### Installation

```shell
pip install modelscope
```

After installation, the `modelscope` command is available. View help information:

```shell
modelscope --help
```

### Authentication (modelscope login)

Authentication is required before accessing private models or datasets. Access tokens can be obtained from [My Page](https://modelscope.cn/my/myaccesstoken).

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `--token` | - | str | Required | ModelScope access token |
| `--endpoint` | - | str | None | ModelScope service endpoint |

```shell
modelscope login --token YOUR_MODELSCOPE_SDK_TOKEN
```

---

## Core Commands

### Download (modelscope download)

Download model, dataset, or collection files from ModelScope Hub to local storage.

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `repo_id` | - | str | Optional | Repository ID (positional argument) |
| `files` | - | str | Variadic | Specify files to download (positional argument) |
| `--model` | - | str | None | Model ID (mutually exclusive with `--dataset`) |
| `--dataset` | - | str | None | Dataset ID (mutually exclusive with `--model`) |
| `--repo-type` | - | choice | `model` | Repository type (model/dataset), used with positional arg repo_id |
| `--collection` | - | str | None | Collection ID |
| `--revision` | - | str | None | Version/branch/tag |
| `--cache_dir` | - | str | None | Cache directory |
| `--local_dir` | - | str | None | Local directory (takes precedence over cache_dir) |
| `--include` | - | list | None | Glob patterns for files to include |
| `--exclude` | - | list | None | Glob patterns for files to exclude |
| `--max-workers` | - | int | Default | Maximum number of concurrent download threads |
| `--token` | - | str | None | Access token |
| `--endpoint` | - | str | None | Service endpoint |

#### Model Download Examples

Using the [Qwen2-7B](https://www.modelscope.cn/models/Qwen/Qwen2-7b) model as an example:

```shell
# Download the entire model to the default cache directory
modelscope download --model 'Qwen/Qwen2-7b'

# Download to a specified local directory
modelscope download --model 'Qwen/Qwen2-7b' --local_dir './local_dir'

# Download a single file
modelscope download --model 'Qwen/Qwen2-7b' tokenizer.json

# Download multiple files
modelscope download --model 'Qwen/Qwen2-7b' tokenizer.json config.json
```

```shell
# Filter downloads using glob patterns
modelscope download --model 'Qwen/Qwen2-7b' --include '*.safetensors'
modelscope download --model 'Qwen/Qwen2-7b' --exclude '*.safetensors'

# Specify cache directory (files stored at cache_dir/Qwen/Qwen2-7b)
modelscope download --model 'Qwen/Qwen2-7b' --include '*.json' --cache_dir './cache_dir'
```

> If both `cache_dir` and `local_dir` are specified, `local_dir` takes precedence and `cache_dir` will be ignored.

#### Dataset Download Examples

Using [SA1B-Dense-Caption](https://modelscope.cn/datasets/Tongyi-DataEngine/SA1B-Dense-Caption) as an example:

```shell
# Download a specific file
modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' dataset_infos.json

# Download multiple files
modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' dataset_infos.json README.md

# Download using pattern matching
modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' --include 'data/train-000*'

# Exclude specific files
modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' --exclude 'data/train-000*'

# Specify local directory
modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' --include 'data/train-000*' --local_dir './local_dir'
```

#### Collection Download Examples

```shell
# Download all models/datasets in a collection
modelscope download --collection 'my_org/my_collection'
```

#### Using the repo_id Positional Argument

When using `repo_id` as a positional argument, specify the repository type with `--repo-type`, or use `--model`/`--dataset` to provide the ID:

```shell
# Equivalent usage
modelscope download --model Qwen/Qwen2-7b
modelscope download --model 'Qwen/Qwen2-7b'
```

---

### Upload (modelscope upload)

Upload local files or folders to a ModelScope remote repository. Authentication must be completed before uploading.

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `repo_id` | - | str | Required | Repository ID (format: owner/repo-name) |
| `local_path` | - | str | Current dir | Local file or folder path (positional argument) |
| `path_in_repo` | - | str | Relative path | Target path in the repository (positional argument) |
| `--repo-type` | - | str | model | Repository type (model/dataset) |
| `--include` | - | list | None | Glob patterns for files to include |
| `--exclude` | - | list | None | Glob patterns for files to exclude |
| `--commit-message` | - | str | None | Commit message |
| `--commit-description` | - | str | None | Commit description |
| `--token` | - | str | None | Access token |
| `--max-workers` | - | int | min(8, cpu+4) | Number of concurrent upload threads |
| `--endpoint` | - | str | None | Service endpoint |

#### Usage Examples

Complete login before uploading: `modelscope login --token YOUR_TOKEN`, or specify the token via the `--token` parameter in the command.

```shell
# Upload a folder to a model repository
modelscope upload owner_name/repo_name /local/path/your_folder path/in/repo/your_folder

# Upload to a dataset repository
modelscope upload owner_name/repo_name /local/path/your_folder path/in/repo/your_folder --repo-type dataset

# Upload a single file
modelscope upload owner_name/repo_name /local/path/data.csv path/in/repo/data.csv --repo-type dataset
```

Where `path/in/repo/your_folder` is the target path of the file in the remote repository.

```shell
# Filter uploads using glob patterns
modelscope upload owner_name/repo_name /local/path/your_folder path/in/repo/your_folder --include '*.safetensors'
modelscope upload owner_name/repo_name /local/path/your_folder path/in/repo/your_folder --exclude '*.pt'

# Specify commit information
modelscope upload owner_name/repo_name /local/path/your_folder path/in/repo/your_folder --commit-message 'update model weights' --commit-description 'v2.0 release'

# Upload with a specified token
modelscope upload owner_name/repo_name /local/path/your_folder path/in/repo/your_folder --token YOUR_TOKEN
```

---

### Create Repository (modelscope create)

Create a new model or dataset repository on ModelScope Hub.

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `repo_id` | - | str | Required | Repository ID (format: owner/repo-name) |
| `--token` | - | str | None | Access token |
| `--repo_type` | - | choice | model | Repository type (model/dataset) |
| `--visibility` | - | choice | public | Visibility (public/internal/private) |
| `--license` | - | choice | Apache-2.0 | License |
| `--chinese_name` | - | str | None | Chinese name |
| `--exist_ok` | - | flag | False | Do not raise an error if the repository already exists |
| `--endpoint` | - | str | None | Service endpoint |

**AIGC Mode** (enabled by appending the `--aigc` flag):

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `--aigc` | - | flag | False | Enable AIGC mode |
| `--model_path` | - | str | Required | Path to model file/folder |
| `--aigc_type` | - | str | Required | AIGC type (Checkpoint/LoRA/VAE) |
| `--base_model_type` | - | str | Required | Base model type (e.g., SD_XL) |
| `--revision` | - | str | v1.0 | Version tag |
| `--base_model_id` | - | str | Empty | Base model ID |
| `--description` | - | str | Default | Model description |
| `--from_json` | - | str | None | JSON configuration file path |

#### Usage Examples

```shell
# Create a public model repository
modelscope create my_org/my_model --repo_type model --visibility public --license Apache-2.0

# Create a private dataset repository with a Chinese name
modelscope create my_org/my_dataset --repo_type dataset --visibility private --chinese_name '我的数据集'

# AIGC mode: upload a LoRA model
modelscope create my_org/my_lora --aigc --model_path ./lora_weights --aigc_type LoRA --base_model_type SD_XL
```

---

## Cache Management

### Scan Cache (modelscope scan-cache)

Scan and display information about locally downloaded model and dataset caches. Only files downloaded via `snapshot_download` or `modelscope download` are recognized.

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `--dir` | - | str | None | Specify cache directory (default: `~/.cache/modelscope/hub`) |

#### Usage Examples

```shell
# Scan the default cache directory
modelscope scan-cache
```

Example output:
```text
REPO ID             REPO TYPE REVISION SIZE ON DISK NB FILES LAST_ACCESSED LAST_MODIFIED LOCAL PATH                                               
------------------- --------- -------- ------------ -------- ------------- ------------- -------------------------------------------------------- 
AI-ModelScope/IQuiz dataset   master        5.23 MB        8 4 hours ago   4 hours ago   /root/.cache/modelscope/hub/datasets/AI-ModelScope/IQuiz 
Qwen/Qwen3-0.6B     model     master        1.41 GB        9 4 hours ago   4 hours ago   /root/.cache/modelscope/hub/models/Qwen/Qwen3-0___6B     

Done in 0.0s. Scanned 2 repo(s) for a total of 1.42 GB.
```

```shell
# Scan a specified directory
modelscope scan-cache --dir /mnt/workspace/.cache/modelscope
```

---

### Clear Cache (modelscope clear-cache)

Clear local cache and temporary files generated during downloads. All operations only affect local cache and do not impact remote repository data.

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `--model` | - | str | None | Clear cache for a specific model (mutually exclusive with `--dataset`) |
| `--dataset` | - | str | None | Clear cache for a specific dataset (mutually exclusive with `--model`) |

> ⚠️ Running without any parameters will clear **all** local cache. Use with caution.

#### Usage Examples

```shell
# Clear cache for a specific model
modelscope clear-cache --model 'Qwen/Qwen2-7b'

# Clear cache for a specific dataset
modelscope clear-cache --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption'

# Clear all local cache
modelscope clear-cache
```

---

## Model Execution

### Llamafile (modelscope llamafile)

Download and run large language models in [Llamafile](https://github.com/Mozilla-Ocho/llamafile) format. Llamafile packages a model and its runtime into a single executable file, supporting one-click execution on Linux/macOS/Windows.

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `--model` | - | str | Required | Model ID (repository must contain a llamafile) |
| `--accuracy` | - | str | q4_k_m | GGUF precision (mutually exclusive with `--file`) |
| `--file` | - | str | None | Specify the llamafile filename |
| `--local_dir` | - | str | None | Download directory |
| `--launch` | - | str | True | Whether to run immediately after downloading |

#### Usage Examples

```shell
# Run the model with default precision (Q4_K_M)
modelscope llamafile --model Qwen-Llamafile/Qwen2.5-3B-Instruct-llamafile

# Specify precision
modelscope llamafile --model Qwen-Llamafile/Qwen2.5-3B-Instruct-llamafile --accuracy Q2_K

# Specify filename (equivalent to the above)
modelscope llamafile --model Qwen-Llamafile/Qwen2.5-3B-Instruct-llamafile --file qwen2.5-3b-instruct-q2_k.llamafile
```

```shell
# Download only without running, specify save path
modelscope llamafile --model Qwen-Llamafile/Qwen2.5-3B-Instruct-llamafile --local_dir ./dir --launch False
```

---

### API Server (modelscope server)

Start a model inference API server. Parameters are dynamically injected by the `modelscope.server.api_server` module and support all configuration options of inference backends such as vLLM.

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| (Dynamic) | - | - | - | Injected by the inference backend module |

#### Usage Examples

```shell
# Start a model inference server
modelscope server --model Qwen/Qwen2-7b

# Specify port and device
modelscope server --model Qwen/Qwen2-7b --port 8000 --device cuda

# View all supported parameters
modelscope server --help
```

> Available parameters depend on the inference backend in use. Run `--help` to view the full list of options.

---

## Extended Features

### Plugin Management (modelscope plugin)

Manage installation, uninstallation, and listing of ModelScope plugins.

#### plugin install

Install one or more ModelScope plugins.

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `package` | - | str | Required | Package name (positional argument, supports multiple) |
| `--index_url` | `-i` | str | None | PyPI index URL |
| `--force_update` | `-f` | str | None | Force update |

#### plugin uninstall

Uninstall one or more ModelScope plugins.

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `package` | - | str | Required | Package name (positional argument, supports multiple) |
| `--yes` | `-y` | flag | False | Skip confirmation prompt |

#### plugin list

List installed or available ModelScope plugins.

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `--all` | `-a` | flag | False | Show all plugins (including uninstalled ones) |

#### Usage Examples

```shell
# Install a plugin
modelscope plugin install ms-swift

# Force update a plugin
modelscope plugin install ms-swift -f

# Uninstall a plugin (skip confirmation)
modelscope plugin uninstall ms-swift -y

# View all available plugins
modelscope plugin list --all
```

---

### Skills Installation (modelscope skills add)

Download and install ModelScope Skills to the local environment.

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `skill_ids` | - | str | Required | Skill IDs (positional argument, supports multiple, format: path/name) |
| `--token` | - | str | None | Access token (required for private skills) |
| `--local_dir` | - | str | ~/.agents/skills | Target installation directory |
| `--max-workers` | - | int | 8 | Maximum number of concurrent download threads |

#### Usage Examples

```shell
# Install a single skill
modelscope skills add modelscope/web_search

# Install multiple skills to a specified directory
modelscope skills add modelscope/web_search modelscope/code_interpreter --local_dir ./my_skills

# Install a private skill
modelscope skills add my_org/private_skill --token YOUR_TOKEN
```

---

## Advanced Commands

### Model Card Management (modelscope modelcard)

Create, upload, and download model cards. Alias: `modelscope model`.

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `--action` | `-act` | choice | Required | Action type (create/upload/download) |
| `--access_token` | `-tk` | str | None | Authentication token |
| `--group_id` | `-gid` | str | damo | Organization name |
| `--model_id` | `-mid` | str | Required | Model name |
| `--visibility` | `-vis` | int | 5 | Visibility (1=public, 3=organization, 5=private) |
| `--license` | `-lic` | str | Apache License 2.0 | License |
| `--chinese_name` | `-ch` | str | Default | Chinese name |
| `--model_dir` | `-md` | str | . | Model file directory |
| `--version_tag` | `-vt` | str | None | Version tag |
| `--version_info` | `-vi` | str | None | Version information |

#### Usage Examples

```shell
# Create a model card
modelscope modelcard -act create -mid my_model -gid my_org -vis 1

# Upload model files
modelscope modelcard -act upload -mid my_model -gid my_org -md ./model_output -vt v1.0

# Download a model
modelscope modelcard -act download -mid my_model -gid my_org -md ./download_dir
```

---

### Pipeline Template (modelscope pipeline)

Generate code templates for ModelScope Pipeline integration, enabling quick integration of custom models.

| Parameter | Short | Type | Default | Description |
|-----------|-------|------|---------|-------------|
| `--action` | `-act` | choice | Required | Only supports create |
| `--task_name` | `-t` | str | Required | Task name |
| `--model_name` | `-m` | str | MyCustomModel | Model class name |
| `--preprocessor_name` | `-p` | str | MyCustomPreprocessor | Preprocessor class name |
| `--pipeline_name` | `-pp` | str | MyCustomPipeline | Pipeline class name |
| `--save_file_path` | `-s` | str | ./ | Output file path |
| `--filename` | `-f` | str | ms_wrapper.py | Output filename |
| `--configuration_path` | `-config` | str | ./ | Configuration file path |

#### Usage Examples

```shell
# Generate a Pipeline template file
modelscope pipeline -act create -t text-classification -m BertClassifier -pp BertPipeline

# Specify output path and filename
modelscope pipeline -act create -t image-segmentation -s ./src -f my_pipeline.py

# Customize all component names
modelscope pipeline -act create -t text-generation -m QwenModel -p QwenTokenizer -pp QwenPipeline -s ./integrations
```

The generated file contains registration code templates for models, preprocessors, and pipelines, ready for direct integration with the ModelScope framework.

---

## Environment Variables

The following environment variables can globally affect CLI behavior:

| Environment Variable | Description |
|----------------------|-------------|
| `MODELSCOPE_CACHE` | Custom default cache directory (default: `~/.cache/modelscope/hub`) |
| `MODELSCOPE_TOKEN` | Default access token (lower priority than the `--token` parameter) |
| `MODELSCOPE_ENDPOINT` | Custom service endpoint |

```shell
# Example: set a global cache directory
export MODELSCOPE_CACHE=/data/modelscope_cache
modelscope download --model 'Qwen/Qwen2-7b'
```
