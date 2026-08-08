<!-- modelscope-docs: 文本数据集 | datasets/examples/text-dataset/text-dataset_CN.md -->

文本类型的数据集支持`.txt`、`.csv`、`.jsonl`、`.json`等多种格式。

# 简单配置示例

下面是一个简单的例子：
[数据集 hellaswag](https://modelscope.cn/datasets/modelscope/hellaswag/files)

文件结构如下：
```
hellaswag
├── README.md
├── train.jsonl
└── validation.jsonl
```

## 数据集配置

``` yaml
---
configs:
  - config_name: default
    data_files:
    - split: validation
      path: "validation.jsonl"
    - split: train
      path: "train.jsonl"
---
```

## 数据集加载代码
- train split
  ```python
  from modelscope.msdatasets import MsDataset
  ds =  MsDataset.load('opencompass/hellaswag', subset_name='default', split='train')
  ```
- validation split
  ```python
  from modelscope.msdatasets import MsDataset
  ds =  MsDataset.load('opencompass/hellaswag', subset_name='default', split='validation')
  ```


# 多个子数据集示例

下面是包含两个子数据集的例子：
[数据集 mbpp](https://modelscope.cn/datasets/opencompass/mbpp/files)

文件结构如下：
```
mbpp
├── README.md
├── mbpp.jsonl
└── mbpp_sanitized.jsonl
```


## 数据集配置

README.md YAML 配置如下：

> 由于两个子数据集包含的字段不同，需要配置 `dataset_info.features`

```yaml
---
dataset_info:
- config_name: full
  features:
  - name: task_id
    dtype: int32
  - name: text
    dtype: string
  - name: code
    dtype: string
  - name: test_list
    sequence: string
  - name: test_setup_code
    dtype: string
  - name: challenge_test_list
    sequence: string
- config_name: sanitized
  features:
  - name: source_file
    dtype: string
  - name: task_id
    dtype: int32
  - name: prompt
    dtype: string
  - name: code
    dtype: string
  - name: test_imports
    sequence: string
  - name: test_list
    sequence: string
configs:
- config_name: full
  data_files:
  - split: train
    path: mbpp.jsonl
  default: true
- config_name: sanitized
  data_files:
  - split: train
    path: mbpp_sanitized.jsonl
---
```

## 配置解释

这段 YAML 配置描述了 MBPP 包含两个子数据集的结构与信息：

### dataset_info

> 数据集的元数据部分，提供了关于每个子数据集的对应字段的配置信息。
> **该部分可以不设置，数据集SDK将自动根据数据文件进行解析，若自动解析失败，请手动配置**

- **config_name**：每个子数据集的名称。
  - **full**：名称1
  - **sanitized**：名称2

- **features**：描述每个子数据集中的字段（或特征）。
  - **name**：字段的名称。
  - **dtype**：字段的数据类型（如整数`int32`、字符串`string`）。
  - **sequence**：表示该特征是一个序列的字段，例如 `test_list` 和 `test_imports`。

  **Full Dataset Features:**

  1. `task_id` (int32)：任务的唯一标识符。
  2. `text` (string)：与任务相关的文本描述。
  3. `code` (string)：与任务相关的代码。
  4. `test_list` (sequence)：包含多个测试用例的列表。
  5. `test_setup_code` (string)：测试的设置代码。
  6. `challenge_test_list` (sequence)：用于挑战的测试用例列表。

  **Sanitized Dataset Features:**

  1. `source_file` (string)：源文件的名称。
  2. `task_id` (int32)：与完整数据集相同的任务标识符。
  3. `prompt` (string)：与任务相关的提示信息。
  4. `code` (string)：与任务相关的代码。
  5. `test_imports` (sequence)：包含多个测试环境的导入列表。
  6. `test_list` (sequence)：包含多个测试用例的列表。

### configs

> 这部分提供了不同配置的数据文件信息

- **config_name**：每个配置的名称（与上面的 dataset_info 匹配）。
- **data_files**：每个配置所包含的数据文件列表。
  - **split**：数据集的分割（在此案例中都是 `train`）。
  - **path**：数据文件的路径。
  - **default**：指示该配置是否为默认配置，在这里 `full` 作为默认配置。

## 数据集加载代码

- 使用`full`子数据集
    ```python
    from modelscope.msdatasets import MsDataset
    dataset = MsDataset.load('opencompass/mbpp', subset_name='full')
    ```

- 使用`sanitized`子数据集
    ```python
    from modelscope.msdatasets import MsDataset
    dataset = MsDataset.load('opencompass/mbpp', subset_name='sanitized')
    ```
