<!-- modelscope-docs: Image Dataset | datasets/examples/image-dataset/image-dataset_EN.md -->

There are three main ways to build image and video datasets: folder structure-based, using metadata files, and using parquet format.

# 1. Folder Structure-Based

Dataset example: [Image Classification Dataset Example](https://modelscope.cn/datasets/AlexEz/image_dataset_example/files)

Datasets can be organized according to the following folder structure. The SDK automatically infers the `split` (`train`, `validation`) and corresponding `label`, which is suitable for image classification scenarios:

```
image_dataset_example
├── train
│   ├── cat
│   │   ├── cat1.jpg
│   │   ├── cat2.jpg
│   └── dog
│       ├── dog1.jpg
│       ├── dog2.jpg
└── validation
    ├── cat
    │   ├── cat_val1.jpg
    │   ├── cat_val2.jpg
    └── dog
        ├── dog_val1.jpg
        ├── dog_val2.jpg

```

- `train` and `validation`: Data splits
- `cat` and `dog`: Data labels
- `dog1.jpg` and `cat1.jpg`: Data files

## Dataset Loading Code

- train split
    ```python
    from modelscope.msdatasets import MsDataset
    dataset = MsDataset.load('AlexEz/image_dataset_example', subset_name='default', split='train')
    ```

- validation split
    ```python
    from modelscope.msdatasets import MsDataset
    dataset = MsDataset.load('AlexEz/image_dataset_example', subset_name='default', split='validation')
    ```


# 2. Using Metadata Files

If you want to include additional information in your dataset, such as text descriptions (image captions) or bounding boxes, add them as a `metadata.csv` file to your folder. This allows you to quickly create datasets for different computer vision tasks, such as text-to-image or object detection. You can also use a JSONL file named `metadata.jsonl`.

## Adding Metadata in Subdirectories

```
folder/
├── train/
│   ├── metadata.csv
│   ├── 0001.png
│   ├── 0002.png
│   └── 0003.png
└── test/
    ├── metadata.csv
    ├── 0004.png
    ├── 0005.png
    └── 0006.png
```


> Your `metadata.csv` file **must contain a `file_name` column** that links image files to their metadata.

- Example content of `folder/train/metadata.csv`:

    ```csv
    file_name,additional_feature
    0001.png,This is the first text feature value you added for the image
    0002.png,This is the second text feature value you added for the image
    0003.png,This is the third text feature value you added for the image
    ```
- Example content of `folder/test/metadata.csv`:
    ```csv
    file_name,additional_feature
    0004.png,This is the first text feature value you added for the image
    0005.png,This is the second text feature value you added for the image
    0006.png,This is the third text feature value you added for the image
    ```

If you choose the `jsonl` format, the `metadata.jsonl` file content would be:

```json
{"file_name": "0001.png", "additional_feature": "This is the first text feature value you added for the image"}
{"file_name": "0002.png", "additional_feature": "This is the second text feature value you added for the image"}
{"file_name": "0003.png", "additional_feature": "This is the third text feature value you added for the image"}
```

## Adding Metadata in Parent Directory

Place the `metadata.csv` file in the parent directory while maintaining the structure of `train` and `test` directories. Here's an example structure:

```
folder/
├── metadata.csv
├── train/
│   ├── 0001.png
│   ├── 0002.png
│   └── 0003.png
└── test/
    ├── 0004.png
    ├── 0005.png
    └── 0006.png
```

Below is an example of the `metadata.csv` file content, containing metadata corresponding to image files in both `train` and `test` directories:

```csv
file_name,additional_feature
train/0001.png,This is the first text feature value you added for the training image
train/0002.png,This is the second text feature value you added for the training image
train/0003.png,This is the third text feature value you added for the training image
test/0004.png,This is the first text feature value you added for the test image
test/0005.png,This is the second text feature value you added for the test image
test/0006.png,This is the third text feature value you added for the test image
```

Please ensure that the `metadata.csv` file is placed in the `folder/` directory and formatted correctly to effectively link image files with their metadata.


## Using ZIP Files

When compressing image files using `.zip` format, you need to organize the folder structure according to the [Adding Metadata in Subdirectories](#adding-metadata-in-subdirectories) format, then compress the corresponding `metadata.jsonl` file together.

> Note: The metadata in zip files must be in `jsonl` format.


Dataset example:
[Image Multiple Choice Question Dataset Example](https://modelscope.cn/datasets/AlexEz/image_mcq_example/files)

Dataset structure:
```
image_mcq_example
├── README.md
├── test.zip
└── train.zip
```

- `train.zip` file structure:
    ```
    train
    ├── AMNH.jpg
    ├── dog.jpg
    ├── metadata.jsonl
    └── tokyo.jpg
    ```

- `test.zip` file structure:
    ```
    test
    ├── metadata.jsonl
    ├── runing.jpg
    └── tesla.jpg
    ```



# 3. Using Parquet Format (Recommended)
For parquet format, you can use libraries such as datasets, pandas, or pyarrow to create it, supporting large-scale dataset sharding and creation.

## Example 1

[MNIST Handwritten Digit Recognition](https://modelscope.cn/datasets/modelscope/mnist/files)

### Dataset Configuration
```yaml
---
dataset_info:
  config_name: mnist
  features:
  - name: image
    dtype: image
  - name: label
    dtype:
      class_label:
        names:
          '0': '0'
          '1': '1'
          '2': '2'
          '3': '3'
          '4': '4'
          '5': '5'
          '6': '6'
          '7': '7'
          '8': '8'
          '9': '9'
configs:
- config_name: mnist
  data_files:
  - split: train
    path: mnist/train-*
  - split: test
    path: mnist/test-*
  default: true
---
```


## Example 2

[Kolors Awesome Prompts](https://modelscope.cn/datasets/modelscope/Kolors_awesome_prompts/files)

### Dataset Configuration

```yaml
---
dataset_info:
- config_name: default
  features:
  - name: NAME_ZH
    dtype: string
  - name: PROMPT
    dtype: string
  - name: NEGATIVE_PROMPT
    dtype: string
  - name: IMAGE
    dtype: image
  - name: PROMPT_EXAMPLE
    dtype: string
configs:
  - config_name: default
    data_files:
    - split: train
      path: "data.parquet"
---
```

Example code for creating a parquet dataset containing images using `datasets`:
```python
# Read image
img = Image.open(image_path)
with io.BytesIO() as output:
    img.save(output, format="PNG")  # Store as PNG, can also use JPEG
    record['IMAGE'] = output.getvalue()
# Create features
features = datasets.Features({
    'IMAGE': datasets.Image(True),
    'NAME_ZH': datasets.Value('string'),
    'PROMPT': datasets.Value('string'),
    'NEGATIVE_PROMPT': datasets.Value('string'),
    'PROMPT_EXAMPLE': datasets.Value('string'),
})
# Create dataset
dataset = datasets.Dataset.from_list(records, features=features)
dataset.to_parquet(output_file)
```