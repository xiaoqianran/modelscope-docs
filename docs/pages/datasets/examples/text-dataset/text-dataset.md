<!-- modelscope-docs: Text Dataset | datasets/examples/text-dataset/text-dataset_EN.md -->

Text datasets support multiple formats including `.txt`, `.csv`, `.jsonl`, and `.json`.

# Simple Configuration Example

Below is a simple example:
[Dataset hellaswag](https://modelscope.cn/datasets/modelscope/hellaswag/files)

File structure:
```
hellaswag
├── README.md
├── train.jsonl
└── validation.jsonl
```

## Dataset Configuration

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

## Dataset Loading Code
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


# Multiple Sub-datasets Example

Below is an example containing two sub-datasets:
[Dataset mbpp](https://modelscope.cn/datasets/opencompass/mbpp/files)

File structure:
```
mbpp
├── README.md
├── mbpp.jsonl
└── mbpp_sanitized.jsonl
```


## Dataset Configuration

README.md YAML configuration:

> Since the two sub-datasets contain different fields, `dataset_info.features` needs to be configured

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

## Configuration Explanation

This YAML configuration describes the structure and information of MBPP containing two sub-datasets:

### dataset_info

> The metadata section of the dataset provides configuration information about the corresponding fields for each sub-dataset.
> **This section can be omitted; the dataset SDK will automatically parse based on data files. If automatic parsing fails, please configure manually**

- **config_name**: Name of each sub-dataset.
  - **full**: Name 1
  - **sanitized**: Name 2

- **features**: Describes the fields (or features) in each sub-dataset.
  - **name**: Name of the field.
  - **dtype**: Data type of the field (e.g., integer `int32`, string `string`).
  - **sequence**: Indicates that this feature is a sequence field, such as `test_list` and `test_imports`.

  **Full Dataset Features:**

  1. `task_id` (int32): Unique identifier for the task.
  2. `text` (string): Text description related to the task.
  3. `code` (string): Code related to the task.
  4. `test_list` (sequence): List containing multiple test cases.
  5. `test_setup_code` (string): Test setup code.
  6. `challenge_test_list` (sequence): List of test cases for challenges.

  **Sanitized Dataset Features:**

  1. `source_file` (string): Name of the source file.
  2. `task_id` (int32): Same task identifier as in the full dataset.
  3. `prompt` (string): Prompt information related to the task.
  4. `code` (string): Code related to the task.
  5. `test_imports` (sequence): List containing multiple test environment imports.
  6. `test_list` (sequence): List containing multiple test cases.

### configs

> This section provides data file information for different configurations

- **config_name**: Name of each configuration (matching the dataset_info above).
- **data_files**: List of data files included in each configuration.
  - **split**: Dataset split (both are `train` in this case).
  - **path**: Path to the data file.
  - **default**: Indicates whether this configuration is the default one; here `full` is set as the default configuration.

## Dataset Loading Code

- Using the `full` sub-dataset
    ```python
    from modelscope.msdatasets import MsDataset
    dataset = MsDataset.load('opencompass/mbpp', subset_name='full')
    ```

- Using the `sanitized` sub-dataset
    ```python
    from modelscope.msdatasets import MsDataset
    dataset = MsDataset.load('opencompass/mbpp', subset_name='sanitized')
    ```