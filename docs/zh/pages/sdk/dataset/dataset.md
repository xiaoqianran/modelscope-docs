<!-- modelscope-docs: 数据集使用指南 | sdk/dataset/dataset_CN.md -->

本文档介绍如何使用msdatasets模块提供的方法来加载和处理数据集。
<a name="NAbzQ"></a>
# msdatasets模块介绍
msdatasets作为modelscope数据集的核心管理模块，涵盖了modelscope数据集的主要处理方法和工具。其主类为MsDataset，用户可以通过MsDataset类提供的方法，实现数据集的加载、上传、删除、转换等操作。
<a name="83bd799b"></a>
# 数据集的使用
本章节主要介绍如何使用MsDataset提供的方法来加载和处理数据集，主要包含以下操作：

- 加载数据集
   - 加载本地数据集
   - 加载远程数据集
- 上传数据集
   - 上传数据文件
- 删除数据集文件
- 数据集的转换

<a name="Clu42"></a>
## 加载数据集
我们推荐使用modelscope来托管您的数据集，同时，我们也提供相应的方法来加载和使用本地磁盘上的数据集。
<a name="WsQhN"></a>
### 加载本地数据集
通过MsDataset.load()方法加载本地磁盘上的数据集。目前支持的文件格式包括：csv、txt、json、jsonl、pickle、png、jpeg等
<a name="gpWtv"></a>
#### 1. 加载单个文件
> **csv格式文件**

```py
from modelscope.msdatasets import MsDataset

# 默认分隔符为英文逗号','
ds = MsDataset.load('/path/to/my_file.csv')
print(next(iter(ds)))

# 自定义分隔符
input_kwargs = {'delimiter': '\t'}
ds = MsDataset.load('/path/to/my_file.csv', **input_kwargs)
print(next(iter(ds)))

# 通过data_files参数传入list的形式
my_csv = '/path/to/my_file.csv'
ds = MsDataset.load('csv', data_files=[my_csv])
print(next(iter(ds)))
```
> **json格式文件**

```py
from modelscope.msdatasets import MsDataset

# 直接输入文件路径
ds = MsDataset.load('/path/to/my_file.json')
print(next(iter(ds)))

# 通过data_files参数传入list的形式
my_json = '/path/to/my_file.json'
ds = MsDataset.load('json', data_files=[my_json])
print(next(iter(ds)))
```
> **txt格式文件**

```py
from modelscope.msdatasets import MsDataset

# 直接输入文件路径
ds = MsDataset.load('/path/to/my_file.txt')
print(next(iter(ds)))

# 通过data_files参数传入list的形式
my_txt = '/path/to/my_file.txt'
ds = MsDataset.load('text', data_files=[my_txt])
print(next(iter(ds)))
```

<a name="kFwNL"></a>
#### 2. 加载多个文件
> **批量加载csv/json/txt等格式文件**

```py
from modelscope.msdatasets import MsDataset

# 通过data_files参数传入list来批量加载
my_csv_1 = '/path/to/my_file_1.csv'
my_csv_2 = '/path/to/my_file_2.csv'
ds = MsDataset.load('csv', data_files=[my_csv_1, my_csv_2])
print(next(iter(ds)))

# 通过data_files参数传入dict来批量加载
my_csv_1 = '/path/to/my_file_1.csv'
my_csv_2 = '/path/to/my_file_2.csv'
my_csv_3 = '/path/to/my_file_3.csv'
ds = MsDataset.load('csv', data_files={'train': [my_csv_1, my_csv_2], 'test': [my_csv_3]})
print(next(iter(ds)))

# 以此类推，其它类型（txt/json/jsonl）数据也可采用此方式加载
```
> **批量加载图像文件**

```py
from modelscope.msdatasets import MsDataset

# 加载文件夹
ds = MsDataset.load('imagefolder', data_dir='/path/to/imgs/')
print(next(iter(ds)))

# 加载zip包
ds = MsDataset.load('imagefolder', data_files='/path/to/imgs.zip', split='train')
print(next(iter(ds)))
```

<a name="fLVm9"></a>
#### 3. 加载本地python脚本
用户可将modelscope.cn上的数据集自带的元数据文件{dataset_name}.py脚本，下载到本地磁盘，然后通过load()函数加载；注意此种方式依然需要连接互联网环境。
```py
from modelscope.msdatasets import MsDataset

# 以squad数据集为例，从https://modelscope.cn/datasets/modelscope/squad/files 下载squad.py脚本
my_script = '/path/to/squad.py'
ds = MsDataset.load(my_script, split='train')
print(next(iter(ds)))
```

<a name="RewhH"></a>
### 加载远程数据集
用户可以使用MsDataset.load()函数，从huggingface或modelscope加载数据集。
<a name="XRzrq"></a>
#### 1. 从huggingface hub加载数据集
```python
from modelscope.msdatasets import MsDataset

# 指定split
ds_train = MsDataset.load('glue', subset_name='sst2', split='train', hub='huggingface')
print(next(iter(ds_train)))

# 加载所有split
ds_map = MsDataset.load('glue', subset_name='sst2', hub='huggingface')
print(ds_map)
```

<a name="A9Qfv"></a>
#### 2. 加载托管在公开host上的数据集
```python
from modelscope.msdatasets import MsDataset

# 常规加载
ds_train = MsDataset.load('squad', target='context', split = 'train')
print(next(iter(ds_train)))

# streaming load方式加载
ds_train = MsDataset.load('squad', target='context', split='train', use_streaming=True)
print(next(iter(ds_train)))
```

<a name="drBD7"></a>
#### 3. 加载托管在modelscope上的数据集（常规加载）
```python
from modelscope.msdatasets import MsDataset

# 以cats_and_dogs数据集为例，数据集链接： https://modelscope.cn/datasets/tany0699/cats_and_dogs/summary
ds = MsDataset.load('cats_and_dogs', namespace='tany0699', split='train')
print(next(iter(ds)))

# 也可以通过namespace/dataset_name的形式传入数据集名称
ds = MsDataset.load('tany0699/cats_and_dogs', split='train')
print(next(iter(ds)))

# 使用强制加载模式（删除该数据集的本地缓存并强制重新下载）
ds = MsDataset.load('cats_and_dogs', namespace='tany0699', split='train', download_mode=DownloadMode.FORCE_REDOWNLOAD)
print(next(iter(ds)))

```

<a name="ysrSl"></a>
#### 4. 使用streaming load模式加载超大型数据集

   1. streaming load模式无需用户下载整个数据集
   2. 返回迭代器对象，每次访问只load一条数据或一个文件
```python
from modelscope.msdatasets import MsDataset

# 以uni-fold蛋白质折叠数据集为例，链接：https://modelscope.cn/datasets/DPTech/Uni-Fold-Data/summary
ds = MsDataset.load(dataset_name='Uni-Fold-Data', namespace='DPTech', split='train', use_streaming=True)
print(next(iter(ds)))
```

<a name="RjjSw"></a>
#### 5. 加载public/private/internal权限的数据集

   1. public权限（公开数据集，无需注册或登录即可正常加载） 
   2. private权限（私有数据集，必须是owner或组织内成员，登录后可加载）
   3. internal权限（内部数据集，登录后可加载）
```python
from modelscope.msdatasets import MsDataset
from modelscope.hub.api import HubApi

# public权限数据集-正常加载即可，参考上文示例

# private/internal权限数据集加载
api = HubApi()
api.login('my-sdk-token')  # 备注：my-sdk-token 需要从modelscope-个人中心-访问令牌获取

input_kwargs = {'delimiter': '\t'}
ds = MsDataset.load('Alimeeting4MUG', subset_name="only_topic_segmentation", **input_kwargs)
print(ds["test"][0])

```

<a name="y1qud"></a>
## 上传数据集
用户可以通过git命令行，来更新modelscope数据集的数据文件。注意：上传数据的功能要求您拥有该数据集的管理权限。如果是较大文件，建议使用git lfs上传。
```py
# 示例
git lfs track your_file
git add .
git commit -m 'update data'
git push
```


<a name="j8z1M"></a>
## 删除数据集文件
用户通过MsDataset.delete()方法删除数据集的文件（要求对此数据集有管理权限并处于登录态）。注意，该方法无法删除整个数据集，如有此需求，请访问modelscope.cn登录后操作。
```py
from modelscope.msdatasets import MsDataset
from modelscope.hub.api import HubApi

# 登录
api = HubApi()
api.login('my-sdk-token')  # 备注：my-sdk-token 需要从modelscope-个人中心-访问令牌获取

# 删除单个文件（其中my-data.zip为您上传到数据集-数据文件的压缩文件名称）
MsDataset.delete(object_name='my-data.zip', dataset_name='my-dataset-name', namespace='my-namespace')

# 删除文件夹（其中my-data-dir为您上传到数据集-数据文件的文件夹名称）
MsDataset.delete(object_name='my-data-dir', dataset_name='my-dataset-name', namespace='my-namespace')

# 删除文件夹中的某个文件
MsDataset.delete(object_name='my-data-dir/train/001/img_001.png', dataset_name='my-dataset-name', namespace='my-namespace')

```

<a name="mggLw"></a>
## 数据集的转换
用户可以将MsDataset对象转换到pytorch、tensorflow和huggingface dataset对象。同时，也支持从huggingface dataset对象转换为MsDataset对象。
> **转换为torch对象**

```python
from modelscope.msdatasets import MsDataset

# 转换为pytorch对象
ds = MsDataset.load('cats_and_dogs', namespace='tany0699', split='train')
pt_dataset = ds.to_torch_dataset()
print(pt_dataset)
```

> **转换为tensorflow对象**

```python
# 转换为tensorflow对象（建议在GPU环境运行）
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

> **转换为huggingface dataset对象**

```python
from modelscope.msdatasets import MsDataset

ds = MsDataset.load('cats_and_dogs', namespace='tany0699', split='train')
hf_dataset = ds.to_hf_dataset()
print(hf_dataset)
```

> **huggingface dataset转换为MsDataset对象**

```python
from datasets.load import load_dataset
from modelscope.msdatasets import MsDataset

hf_ds = load_dataset("beans", split="train")
ms_ds = MsDataset.to_ms_dataset(hf_ds)
print(next(iter(ms_ds)))
```

