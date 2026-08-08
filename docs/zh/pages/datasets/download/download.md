<!-- modelscope-docs: 数据集的下载 | datasets/download/download_CN.md -->

在本篇文章中，我们将向您介绍如何在ModelScope平台下载数据集。无论您是想使用Python SDK、GIT还是相应的命令行工具，这里都有详细的步骤帮助您快速上手。

# 快速使用

## 下载指定的文件
1. 访问数据集页面。
2. 点击每个文件的`下载`按钮直接下载该文件。

![image.png](./_resources/E9C0010F-A041-4770-9D6F-891531680E8C.png)

## 下载整个数据集
点击`下载数据集`按钮，即可看到使用SDK、GIT或命令行下载数据集的具体命令。

![image.png](./_resources/download_dataset1.png)

-------

下面对每种方法进行详细介绍：


#  1. 使用Python SDK下载数据集
您可以通过`modelscope`库轻松下载数据集，并进行相关的操作（创建、删除、更新和检索信息）。

## 安装Python SDK

首先，确保您已安装ModelScope的Python SDK，使用以下命令：

```bash
pip install modelscope[framework]
```

## 下载数据集示例

使用以下代码下载数据集：

```python
from modelscope import MsDataset

# 加载数据集
ds = MsDataset.load('afqmc_small', split='train')
```

# 2. 使用GIT下载数据集

如果您更喜欢使用GIT，可以通过以下方式下载数据集。


## 公开数据集下载

```bash
# 安装Git LFS（大文件存储）
git lfs install

# 克隆公开数据集
git clone https://www.modelscope.cn/datasets/<namespace>/<dataset-name>.git
# 示例: git clone https://www.modelscope.cn/datasets/DAMO_NLP/jd.git
```

## 私有数据集下载

**注意：** 您需要相应的数据集权限。

```bash
# 使用Git LFS
git lfs install

# 克隆私有数据集
git clone http://oauth2:<your_access_token>@www.modelscope.cn/datasets/<namespace>/<dataset-name>.git
```

或者使用以下方法：

```bash
git clone http://<your_user_name>@www.modelscope.cn/datasets/<namespace>/<dataset-name>.git
# 输入您的访问令牌（Access Token）作为密码
```

### 获取访问令牌

1. 登录 [ModelScope官网](https://www.modelscope.cn)。
2. 进入个人中心 -> 访问令牌，复制您的访问令牌。


# 3. 使用命令行工具下载数据集文件

通过命令行，您可以灵活下载数据集文件。

## 命令格式

```shell
modelscope download --dataset DATASET_NAME [options] [files ...]
```

## 参数说明

| 参数 | 简写 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--dataset` | - | str | None | 数据集 ID（必需） |
| `files` | - | str | - | 位置参数，指定要下载的文件（支持多个） |
| `--revision` | - | str | None | 版本/分支/tag |
| `--cache_dir` | - | str | None | 缓存目录 |
| `--local_dir` | - | str | None | 本地目录（优先于 cache_dir） |
| `--include` | - | list | None | 包含的文件 glob 模式 |
| `--exclude` | - | list | None | 排除的文件 glob 模式 |
| `--token` | - | str | None | 访问令牌（私有数据集需要） |
| `--endpoint` | - | str | None | ModelScope 服务端点 |
| `--max-workers` | - | int | 默认 | 最大并发下载线程数 |


## 使用示例

命令示例（以[SA1B-Dense-Caption](https://modelscope.cn/datasets/Tongyi-DataEngine/SA1B-Dense-Caption)）为例

1. 指定下载单个文件
    ```shell
    modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' dataset_infos.json
    ```

2. 指定下载多个个文件  
    ```shell
    modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' dataset_infos.json README.md
    ```

3. 指定下载某些文件 
    ```shell
    modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' --include 'data/train-000*'
    ```

4. 过滤指定文件
    ```shell
    modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' --exclude 'data/train-000*'
    ```
5. 指定下载cache\_dir 
    ```shell
    modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' --include 'data/train-000*' --cache_dir './cache_dir'
    ```
    模型文件将被下载在`./cache_dir`

6. 指定下载local\_dir    
    ```shell
    modelscope download --dataset 'Tongyi-DataEngine/SA1B-Dense-Caption' --include 'data/train-000*' --local_dir './local_dir'
    ```
    模型文件将被下载在`./local_dir`

注意：若`cache_dir`和`local_dir`同时指定，`local_dir`优先级高，`cache_dir`将被忽略

## 下载私有模型时需要访问令牌

> 您可以在[我的页面](https://modelscope.cn/my/myaccesstoken)获取**访问令牌**

### 方式1：先登录再下载

```shell
modelscope login --token YOUR_MODELSCOPE_ACCESS_TOKEN
```

### 方式二：指定token参数下载

```shell
modelscope --token 'YOUR_MODELSCOPE_ACCESS_TOKEN' download --dataset 'YOUR_DATASET_NAME' 
```
