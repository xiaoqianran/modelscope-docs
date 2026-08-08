<!-- modelscope-docs: Dataset Usage Guide | sdk/dataset/dataset_EN.md -->

This document introduces how to use the methods provided by the msdatasets module to load and process datasets.

<a name="NAbzQ"></a>
# Introduction to msdatasets Module

msdatasets serves as the core management module for ModelScope datasets, encompassing the primary processing methods and tools for ModelScope datasets. Its main class is MsDataset, which allows users to perform operations such as dataset loading, uploading, deletion, and conversion through the methods provided by the MsDataset class.

<a name="83bd799b"></a>
# Dataset Usage

This section primarily introduces how to use the methods provided by MsDataset to load and process datasets, including the following operations:

- Loading datasets
   - Loading local datasets
   - Loading remote datasets
- Uploading datasets
   - Uploading data files
- Deleting dataset files
- Dataset conversion

<a name="Clu42"></a>
## Loading Datasets

We recommend using ModelScope to host your datasets. Additionally, we provide corresponding methods to load and use datasets stored on local disk.

<a name="WsQhN"></a>
### Loading Local Datasets

Load datasets from local disk using the `MsDataset.load()` method. Currently supported file formats include: csv, txt, json, jsonl, pickle, png, jpeg, etc.

<a name="gpWtv"></a>
#### 1. Loading a Single File

> **CSV format files**

```py
from modelscope.msdatasets import MsDataset

# Default delimiter is comma ','
ds = MsDataset.load('/path/to/my_file.csv')
print(next(iter(ds)))

# Custom delimiter
input_kwargs = {'delimiter': '\t'}
ds = MsDataset.load('/path/to/my_file.csv', **input_kwargs)
print(next(iter(ds)))

# Pass as a list via data_files parameter
my_csv = '/path/to/my_file.csv'
ds = MsDataset.load('csv', data_files=[my_csv])
print(next(iter(ds)))
```

> **JSON format files**

```py
from modelscope.msdatasets import MsDataset

# Direct file path input
ds = MsDataset.load('/path/to/my_file.json')
print(next(iter(ds)))

# Pass as a list via data_files parameter
my_json = '/path/to/my_file.json'
ds = MsDataset.load('json', data_files=[my_json])
print(next(iter(ds)))
```

> **TXT format files**

```py
from modelscope.msdatasets import MsDataset

# Direct file path input
ds = MsDataset.load('/path/to/my_file.txt')
print(next(iter(ds)))

# Pass as a list via data_files parameter
my_txt = '/path/to/my_file.txt'
ds = MsDataset.load('text', data_files=[my_txt])
print(next(iter(ds)))
```

<a name="kFwNL"></a>
#### 2. Loading Multiple Files

> **Batch loading CSV/JSON/TXT format files**

```py
from modelscope.msdatasets import MsDataset

# Batch load via data_files parameter as a list
my_csv_1 = '/path/to/my_file_1.csv'
my_csv_2 = '/path/to/my_file_2.csv'
ds = MsDataset.load('csv', data_files=[my_csv_1, my_csv_2])
print(next(iter(ds)))

# Batch load via data_files parameter as a dictionary
my_csv_1 = '/path/to/my_file_1.csv'
my_csv_2 = '/path/to/my_file_2.csv'
my_csv_3 = '/path/to/my_file_3.csv'
ds = MsDataset.load('csv', data_files={'train': [my_csv_1, my_csv_2], 'test': [my_csv_3]})
print(next(iter(ds)))

# Similarly, other data types (txt/json/jsonl) can be loaded using this approach
```

> **Batch loading image files**

```py
from modelscope.msdatasets import MsDataset

# Load from directory
ds = MsDataset.load('imagefolder', data_dir='/path/to/imgs/')
print(next(iter(ds)))

# Load from zip archive
ds = MsDataset.load('imagefolder', data_files='/path/to/imgs.zip', split='train')
print(next(iter(ds)))
```

<a name="fLVm9"></a>
#### 3. Loading Local Python Scripts

Users can download the metadata file `{dataset_name}.py` script that comes with datasets from modelscope.ai to local disk, then load it through the `load()` function. Note that this method still requires an internet connection.

```py
from modelscope.msdatasets import MsDataset

# Taking the squad dataset as an example, download the squad.py script from https://modelscope.ai/datasets/modelscope/squad/files
my_script = '/path/to/squad.py'
ds = MsDataset.load(my_script, split='train')
print(next(iter(ds)))
```

<a name="RewhH"></a>
### Loading Remote Datasets

Users can use the `MsDataset.load()` function to load datasets from Hugging Face or ModelScope.

<a name="XRzrq"></a>
#### 1. Loading Datasets from Hugging Face Hub

```python
from modelscope.msdatasets import MsDataset

# Specify split
ds_train = MsDataset.load('glue', subset_name='sst2', split='train', hub='huggingface')
print(next(iter(ds_train)))

# Load all splits
ds_map = MsDataset.load('glue', subset_name='sst2', hub='huggingface')
print(ds_map)
```

<a name="A9Qfv"></a>
#### 2. Loading Datasets Hosted on Public Hosts

```python
from modelscope.msdatasets import MsDataset

# Regular loading
ds_train = MsDataset.load('squad', target='context', split = 'train')
print(next(iter(ds_train)))

# Streaming load
ds_train = MsDataset.load('squad', target='context', split='train', use_streaming=True)
print(next(iter(ds_train)))
```

<a name="drBD7"></a>
#### 3. Loading Datasets Hosted on ModelScope (Regular Loading)

```py
from modelscope.msdatasets import MsDataset

# Taking the cats_and_dogs dataset as an example, dataset link: https://modelscope.ai/datasets/tany0699/cats_and_dogs/summary
ds = MsDataset.load('cats_and_dogs', namespace='tany0699', split='train')
print(next(iter(ds)))

# Dataset name can also be passed in namespace/dataset_name format
ds = MsDataset.load('tany0699/cats_and_dogs', split='train')
print(next(iter(ds)))

# Force reload mode (delete local cache of this dataset and force re-download)
ds = MsDataset.load('cats_and_dogs', namespace='tany0699', split='train', download_mode=DownloadMode.FORCE_REDOWNLOAD)
print(next(iter(ds)))
```

<a name="ysrSl"></a>
#### 4. Loading Very Large Datasets Using Streaming Load Mode

   1. Streaming load mode doesn't require users to download the entire dataset
   2. Returns an iterator object, loading only one data record or file per access

```python
from modelscope.msdatasets import MsDataset

# Taking the uni-fold protein folding dataset as an example, link: https://modelscope.ai/datasets/DPTech/Uni-Fold-Data/summary
ds = MsDataset.load(dataset_name='Uni-Fold-Data', namespace='DPTech', split='train', use_streaming=True)
print(next(iter(ds)))
```

<a name="RjjSw"></a>
#### 5. Loading Datasets with public/private/internal Permissions

   1. public permission (public datasets, can be loaded normally without registration or login)
   2. private permission (private datasets, must be owner or organization member, can be loaded after login)
   3. internal permission (internal datasets, can be loaded after login)

```python
from modelscope.msdatasets import MsDataset
from modelscope.hub.api import HubApi

# public permission datasets - load normally, refer to examples above

# private/internal permission dataset loading
api = HubApi()
api.login('my-sdk-token')  # Note: my-sdk-token needs to be obtained from ModelScope Personal Center - Access Tokens

input_kwargs = {'delimiter': '\t'}
ds = MsDataset.load('Alimeeting4MUG', subset_name="only_topic_segmentation", **input_kwargs)
print(ds["test"][0])
```

<a name="y1qud"></a>
## Uploading Datasets

Users can update ModelScope dataset data files through git command line. Note: The upload functionality requires you to have management permissions for this dataset. For larger files, it's recommended to use git lfs for uploading.

```py
# Example
git lfs track your_file
git add .
git commit -m 'update data'
git push
```


<a name="j8z1M"></a>
## Deleting Dataset Files

Users can delete dataset files using the `MsDataset.delete()` method (requires management permissions for this dataset and being logged in). Note that this method cannot delete the entire dataset; if needed, please visit modelscope.ai and operate after logging in.

```py
from modelscope.msdatasets import MsDataset
from modelscope.hub.api import HubApi

# Login
api = HubApi()
api.login('my-sdk-token')  # Note: my-sdk-token needs to be obtained from ModelScope Personal Center - Access Tokens

# Delete a single file (where my-data.zip is the compressed file name you uploaded to the dataset's data files)
MsDataset.delete(object_name='my-data.zip', dataset_name='my-dataset-name', namespace='my-namespace')

# Delete a directory (where my-data-dir is the directory name you uploaded to the dataset's data files)
MsDataset.delete(object_name='my-data-dir', dataset_name='my-dataset-name', namespace='my-namespace')

# Delete a specific file within a directory
MsDataset.delete(object_name='my-data-dir/train/001/img_001.png', dataset_name='my-dataset-name', namespace='my-namespace')
```

<a name="mggLw"></a>
## Dataset Conversion

Users can convert MsDataset objects to PyTorch, TensorFlow, and Hugging Face dataset objects. Additionally, conversion from Hugging Face dataset objects to MsDataset objects is also supported.

> **Convert to torch object**

```python
from modelscope.msdatasets import MsDataset

# Convert to PyTorch object
ds = MsDataset.load('cats_and_dogs', namespace='tany0699', split='train')
pt_dataset = ds.to_torch_dataset()
print(pt_dataset)
```

> **Convert to tensorflow object**

```python
# Convert to TensorFlow object (recommended to run in GPU environment)
import tensorflow as tf
from modelscope.models import Model
from modelscope.msdatasets import MsDataset
from modelscope.preprocessors import TextClassificationTransformersPreprocessor

tf.compat.v1.enable_eager_execution()

model_id = 'damo/nlp_structbert_sentence-similarity_chinese-tiny'
nlp_model = Model.from_pretrained(model_id)
preprocessor = TextClassificationTransformersPreprocessor(
    nlp_model.model_dir,
    first_sequence='premise',
    second_sequence=None)

ms_ds_train = MsDataset.load(
    'xcopa',
    subset_name='translation-et',
    namespace='damotest',
    split='test')

tf_dataset = ms_ds_train.to_tf_dataset(
    batch_size=5,
    shuffle=True,
    preprocessors=preprocessor,
    drop_remainder=True)

print(next(iter(tf_dataset)))
```

> **Convert to huggingface dataset object**

```python
from modelscope.msdatasets import MsDataset

ds = MsDataset.load('cats_and_dogs', namespace='tany0699', split='train')
hf_dataset = ds.to_hf_dataset()
print(hf_dataset)
```

> **Convert huggingface dataset to MsDataset object**

```python
from datasets.load import load_dataset
from modelscope.msdatasets import MsDataset

hf_ds = load_dataset("beans", split="train")
ms_ds = MsDataset.to_ms_dataset(hf_ds)
print(next(iter(ms_ds)))
```