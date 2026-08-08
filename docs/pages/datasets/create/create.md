<!-- modelscope-docs: Creating Datasets | datasets/create/create_EN.md -->

# Creating Datasets on the Web Interface

### 1. Log in before creating a dataset, click on your profile avatar in the top right corner of the page, and select "Create Dataset"
<img src="resources/create_dataset.png" alt="Image" width="30%" />


### 2. Fill in the required dataset information
![image.png](./_resources/E616AAA4-0AA7-4AD0-B14F-CD200B2FC3DE.png)


### 3. Empty dataset creation completed:
![image.png](./_resources/98345C37-FE02-4D58-8471-93FBB7907A55.png)


### 4. Prepare your data

For guidance on how to organize your dataset, please refer to the [Organizing Your Dataset Repository](#organizing-your-dataset-repository) section below. We also provide some [reference examples](./dataset-examples/text-datasets.md).

### 5. Upload your dataset

Click on the `Dataset Files` tab to upload your dataset files. Refer to [Dataset Upload](dataset-upload.md).

# Organizing Your Dataset Repository

After creating a dataset repository on ModelScope, this guide will show you how to organize your dataset repository when uploading.

Datasets with good structure and specific file formats (such as `.txt`, `.csv`, `.parquet`, `.jsonl`, `.mp3`, `.jpg`, `.zip`, etc.) will be automatically loaded through `MsDataset` and will have **data preview** available on the dataset page.

## Basic Example

The simplest dataset structure contains two files: `train.csv` and `test.csv`. Your repository should also include a `README.md` file to display the [dataset card](./dataset-card.md) on the dataset page.

```text
my_dataset_repository/
├── README.md
├── train.csv
└── test.csv
```

In this simple case, you will get a dataset with two splits: `train` (samples from `train.csv`) and `test` (samples from `test.csv`).

## Defining Splits and Subsets in YAML

### Splits

If you have multiple files and want to define which files belong to which split, you can use the `configs` field in the YAML block at the top of your `README.md`. For example, given a repository like this:

```text
my_dataset_repository/
├── README.md
├── data.csv
└── holdout.csv
```

You can define your splits by adding a `configs` field in the YAML block at the top of `README.md`:

```yaml
---
configs:
- config_name: default
  data_files:
  - split: train
    path: "data.csv"
  - split: test
    path: "holdout.csv"
---
```

You can select multiple files as one split using a path list:

```text
my_dataset_repository/
├── README.md
├── data/
│   ├── abc.csv
│   └── def.csv
└── holdout/
    └── ghi.csv
```

```yaml
---
configs:
- config_name: default
  data_files:
  - split: train
    path:
    - "data/abc.csv"
    - "data/def.csv"
  - split: test
    path: "holdout/ghi.csv"
---
```

You can also use wildcard patterns to automatically list all required files:

```yaml
---
configs:
- config_name: default
  data_files:
  - split: train
    path: "data/*.csv"
  - split: test
    path: "holdout/*.csv"
---
```

> **Note**: The `config_name` field is required even if you only have one configuration.

### Configurations

If your dataset has multiple sub-datasets that you want to load separately, you can define a list of configurations in the `configs` field of the YAML:

```text
my_dataset_repository/
├── README.md
├── main_data.csv
└── additional_data.csv
```

```yaml
---
configs:
- config_name: main_data
  data_files: "main_data.csv"
- config_name: additional_data
  data_files: "additional_data.csv"
---
```

Each configuration will be displayed separately on the data preview page and can be loaded by passing its name as the `subset_name` parameter:

```python
from modelscope import MsDataset
main_data = MsDataset.load("my_dataset_repository", subset_name="main_data")
additional_data = MsDataset.load("my_dataset_repository", subset_name="additional_data")
```

### Builder Parameters

Not only can you pass `data_files` through YAML, but you can also pass other builder-specific parameters to provide more flexibility when loading data. For example, you can define which separator to use when loading `csv` files in different configurations:

```yaml
---
configs:
- config_name: tab
  data_files: "main_data.csv"
  sep: "\t"
- config_name: comma
  data_files: "additional_data.csv"
  sep: ","
---
```


> **Tip**: You can set a default configuration by using `default: true`. For example, if you set:
> ```yaml
> - config_name: main_data
>   data_files: "main_data.csv"
>   default: true
> ```
> Then you can load the dataset using `main_data = MsDataset.load("my_dataset_repository")`.

## Automatic Split Detection

If no YAML is provided, the system will automatically infer dataset splits based on specific patterns in your dataset repository. The priority order is to first try custom filename split formats, and if none are found, treat all files as a single split.

### Folder Names

You can place data files in different directories named `train`, `test`, and `validation`, with each directory containing data files for that split:

```text
my_dataset_repository/
├── README.md
└── data/
    ├── train/
    │   └── bees.csv
    ├── test/
    │   └── more_bees.csv
    └── validation/
        └── even_more_bees.csv
```

### Filename Splits

If you're not using any non-traditional splits, you can place the split name anywhere in your data filenames, and the system will automatically infer it. The only rule is that the split name must be separated by non-alphanumeric characters. For example, `test-file.csv` is valid, while `testfile.csv` is not. Supported separators include underscores, hyphens, spaces, periods, and numbers.

For example, the following filenames are all acceptable:
- Training split: `train.csv`, `my_train_file.csv`, `train1.csv`
- Validation split: `validation.csv`, `my_validation_file.csv`, `validation1.csv`
- Test split: `test.csv`, `my_test_file.csv`, `test1.csv`

For example, a structure with all files in a directory named `data` would look like this:

```text
my_dataset_repository/
├── README.md
└── data/
    ├── train.csv
    ├── test.csv
    └── validation.csv
```

### Custom Filename Splits

If your dataset splits have custom names (i.e., neither `train`, `test`, nor `validation`), you can name your data files as `data/<split_name>-xxxxx-of-xxxxx.csv`.

For example, with three splits: `train`, `test`, and `random`:

```text
my_dataset_repository/
├── README.md
└── data/
    ├── train-00000-of-00003.csv
    ├── train-00001-of-00003.csv
    ├── train-00002-of-00003.csv
    ├── test-00000-of-00001.csv
    ├── random-00000-of-00003.csv
    ├── random-00001-of-00003.csv
    └── random-00002-of-00003.csv
```

### Single Split

When the system cannot recognize any of the above patterns, all files will be treated as a single training split. If your dataset splits are not loading as expected, it may be due to incorrect patterns.

### Split Name Keywords

Split names can be named in various ways. Validation splits are sometimes called "dev", and test splits may be called "eval". These alternative names are also supported. The following keywords are equivalent:
- train, training
- validation, valid, val, dev
- test, testing, eval, evaluation

The following structure is a valid repository:

```text
my_dataset_repository/
├── README.md
└── data/
    ├── training.csv
    ├── eval.csv
    └── valid.csv
```

### Multiple Files per Split

If a split contains multiple files, the system can still infer whether it's training, validation, or test based on the filename. For example, if your training and test sets span multiple files:

```text
my_dataset_repository/
├── README.md
├── train_0.csv
├── train_1.csv
├── train_2.csv
├── train_3.csv
├── test_0.csv
└── test_1.csv
```

Ensure that all files in the `train` set contain *train* in their names (similarly for validation and test sets). Even if you add prefixes or suffixes to the filename (e.g., `my_train_file_00001.csv`), the system can still infer the corresponding split.

For convenience, you can also place data files in different directories. In this case, the split name is inferred from the directory name.

```text
my_dataset_repository/
├── README.md
└── data/
    ├── train/
    │   ├── shard_0.csv
    │   ├── shard_1.csv
    │   ├── shard_2.csv
    │   └── shard_3.csv
    └── test/
        ├── shard_0.csv
        └── shard_1.csv
```

By organizing your repository according to the above structure, you will be able to easily upload and use your dataset, and have data preview available in your dataset repository.



## (Optional) Organizing Datasets Using Python Scripts

In your dataset repository, you can define a Python script with the same name as your dataset repository to organize your dataset:

```python
my_dataset/
├── README.md
├── my_dataset.py
└── data/  # optional
    ├── a1.csv or a1.json or a1.parquet or a1.zip
    └── a2.csv or a2.json or a2.parquet or a2.zip
```

Refer to the dataset [ceval-exam](https://modelscope.cn/datasets/modelscope/ceval-exam/files)

> Tip: When developing locally, it's recommended to use the `MsDataset.load` method to load local datasets to verify that the dataset format is correct.