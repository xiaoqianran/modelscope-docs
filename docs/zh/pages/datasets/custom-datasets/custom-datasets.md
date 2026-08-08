<!-- modelscope-docs: 自定义数据集接入流程 | datasets/custom-datasets/custom-datasets_CN.md -->

本文档介绍如何使用msdatasets模块提供的方法来加载和处理数据集（custom datasets）。
<a name="NAbzQ"></a>
# 1. 相关定义
ModelScope的标准数据集，指的是在完成数据集创建后，可直接加载并转换为标准数据集对象（例如torch dataset等），中间只需进行标准操作（tokenize/embedding/to tensor 等）即可接入trainer进行finetune任务的数据集。除此以外，均属于自定义数据集。通常一个自定义数据集包含以下几个特性：

- 需要数据贡献者自行对数据集结构进行解析
- 自定义预处理流程，涉及数据集合并/采样/样本预处理等工作

另外，标准数据集的概念是相对的，比如对于FAQ任务中的标准数据集squad，在其他任务中可能需要增加相应的自定义处理逻辑，以适配该任务finetune流程，此时可看成是自定义数据集。


<a name="hzAtV"></a>
# 2. 自定义数据集接入流程
自定义数据集总体接入流程，如下图所示：<br />![自定义数据集接入流程-流程图 (1).jpg](https://intranetproxy.alipay.com/skylark/lark/0/2023/jpeg/69636/1678862877904-a53b2837-dc01-471c-bab7-97495083e159.jpeg#clientId=ub47d3fd9-7320-4&from=ui&id=u927bf42b&name=%E8%87%AA%E5%AE%9A%E4%B9%89%E6%95%B0%E6%8D%AE%E9%9B%86%E6%8E%A5%E5%85%A5%E6%B5%81%E7%A8%8B-%E6%B5%81%E7%A8%8B%E5%9B%BE%20%281%29.jpg&originHeight=860&originWidth=2482&originalType=binary&ratio=1&rotation=0&showTitle=false&size=149073&status=done&style=stroke&taskId=uadb81f4c-771f-41e9-ab11-ab630341e8f&title=)

- **Step1：创建数据集**
   - 在modelscope.cn完成数据集创建
   - 参考文档： [https://modelscope.cn/docs/%E6%95%B0%E6%8D%AE%E9%9B%86%E4%BB%8B%E7%BB%8D](https://modelscope.cn/docs/%E6%95%B0%E6%8D%AE%E9%9B%86%E4%BB%8B%E7%BB%8D)

- **Step2：自定义数据类**
   - 自定义数据类，统一管理和描述前文所上传的数据集，可实现的特性包括但不限于：
      - dataset structure定义和解析
      - labels的处理
      - 数据的清洗/过滤等
      - 样本的预处理和转换等操作
   - 建议自定义数据类 YourCustomDataset 继承父类TorchCustomDataset
   - 注册到CUSTOM_DATASETS，以关联下游的模型训练任务
   - 参考案例：class ImageInstanceSegmentationCocoDataset
   - 示例代码（以ImageInstanceSegmentationCocoDataset为例）
```python
# An example for custom dataset class

from modelscope.metainfo import Models
from modelscope.utils.constant import Tasks
from modelscope.msdatasets.dataset_cls.custom_datasets import TorchCustomDataset
from modelscope.msdatasets.dataset_cls.custom_datasets import CUSTOM_DATASETS


DATASET_STRUCTURE = {
    'train': {
        'annotation': 'annotations/instances_train.json',
        'images': 'images/train'
    },
    'validation': {
        'annotation': 'annotations/instances_val.json',
        'images': 'images/val'
    }
}

@CUSTOM_DATASETS.register_module(module_name=Models.cascade_mask_rcnn_swin, group_key=Tasks.image_segmentation)
class ImageInstanceSegmentationCocoDataset(TorchCustomDataset):
    def __init__(self, *args, **kwargs):
        ...
        super().__init__(*args, **kwargs)
        
    def get_annotations(self):
        ...
        
    def parse_dataset_structure(self):
        ...
        
    def filter_imgs(self):
        ...
  
```

- **Step3：自定义预处理器**
   - 预处理器主要进行数据集samples的预处理工作
   - 可以选择复用已有的Preprocessor
   - 定义预处理器：YourPreprocessor(Preprocessor)，统一继承父类：modelscope.preprocessors.base.Preprocessor
   - 注册到PREPROCESSORS
   - 代码示例（以ImageInstanceSegmentationPreprocessor为例）：
```python
# An example for Preprocessor class

from modelscope.metainfo import Preprocessors
from modelscope.preprocessors.builder import PREPROCESSORS
from modelscope.utils.constant import Fields


@PREPROCESSORS.register_module(
    Fields.cv,
    module_name=Preprocessors.image_instance_segmentation_preprocessor)
class ImageInstanceSegmentationPreprocessor(Preprocessor):
    def __init__(self, *args, **kwargs):
        ...
        super().__init__(*args, **kwargs)
        
    def __call__(self):
        ...
        
    def process_samples(self):
        ...
  
```

- **Step4：转换为标准DataLoader**
   - sdk已内置，trainer会将传入的YourCutomDataset对象，转换成标准的torch.utils.data.DataLoader对象
   - 转换为tensorflow标准dataloader（work in process）

- **Step5：train流程**
   - sdk已内置

- **Step6：evaluation及后续流程**
   - sdk已内置


<a name="O3JaH"></a>
# 3. 使用场景
自定义数据集的使用，支持以下场景：

- 单独加载和使用数据集，即用户通过MsDataset.load()加载该自定义数据集后，load()函数可选择将数据转换为YourCustomDataset，或者不做转换（返回ExternalDataset形式），用户拿到的dataset对象可以在其它二次开发任务中使用
- 对接modelscope提供的finetune任务，用户可联合使用MsDataset.load()、build_trainer()、trainer.train()等函数，实现自定义数据集与模型finetune任务的对接

<a name="AzzgK"></a>
### **3.1 数据集单独使用**

- 使用默认的ExternalDataset对象
```python
from modelscope.msdatasets import MsDataset

train_dataset = MsDataset.load(
            dataset_name='modelscope/movie_scene_seg_toydata',
            split='train',
            custom_cfg=None)

print(next(iter(train_dataset)))
```
备注：在此场景下，custom_cfg为None，对train_dataset对象iter后，得到split和数据路径的映射(tuple)，形式为 ('train', '/to/path/your-dataset-cache-path')；或者也可通过train_dataset.ds_instance.split_path_dict拿到mapping关系。

- 转换为YourCustomDataset对象
```python
from modelscope.hub.snapshot_download import snapshot_download
from modelscope.msdatasets import MsDataset
from modelscope.utils.config import Config
from modelscope.utils.constant import ModelFile

model_id = 'damo/cv_resnet50-bert_video-scene-segmentation_movienet'
cache_path = snapshot_download(model_id)
config_path = os.path.join(cache_path, ModelFile.CONFIGURATION)
model_cfg = Config.from_file(config_path)

train_dataset = MsDataset.load(
            dataset_name='modelscope/movie_scene_seg_toydata',
            split='train',
            custom_cfg=model_cfg)

print(next(iter(train_dataset)))
```
备注：在此场景下，要求custom_cfg参数不为空。其中YourCustomDataset继承了TorchCustomDataset，而TorchCustomDataset继承自torch.utils.data.Dataset，可直接对接其它相关torch类任务。

<a name="CsQTJ"></a>
### **3.2 对接modelscope提供的下游模型finetune任务**
代码示例：
```python
import tempfile
from modelscope.hub.snapshot_download import snapshot_download
from modelscope.metainfo import Trainers
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.utils.config import Config
from modelscope.utils.constant import ModelFile, Tasks

model_id = 'damo/cv_resnet50-bert_video-scene-segmentation_movienet'
cache_path = snapshot_download(model_id)
config_path = os.path.join(cache_path, ModelFile.CONFIGURATION)
model_cfg = Config.from_file(config_path)
tmp_dir = tempfile.TemporaryDirectory().name

train_dataset = MsDataset.load(
  dataset_name='modelscope/movie_scene_seg_toydata',
  split='train',
  custom_cfg=model_cfg,
  test_mode=False)

test_dataset = MsDataset.load(
  dataset_name='modelscope/movie_scene_seg_toydata',
  split='test',
  custom_cfg=model_cfg,
  test_mode=True)

kwargs = dict(
  model=model_id,
  train_dataset=train_dataset,
  eval_dataset=test_dataset,
  work_dir=tmp_dir)

trainer = build_trainer(name=Trainers.movie_scene_segmentation, default_args=kwargs)
trainer.train()
results_files = os.listdir(trainer.work_dir)
print(results_files)

```
备注：该场景下，MsDataset.load()函数的custom_cfg参数也可以选择传None（默认值），此时加载后得到的dataset对象，如train_dataset.is_custom=False，表示尚未进行to_custom_dataset操作；train_dataset被传入trainer之后，在EpochBasedTrainer.__init__()过程中，会自行对该数据集进行判断，若train_dataset.is_custom=False则选择进行to_custom_dataset()操作，将dataset对象转为YourCustomDataset。

