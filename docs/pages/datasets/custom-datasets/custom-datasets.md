<!-- modelscope-docs: Custom Dataset Integration Process | datasets/custom-datasets/custom-datasets_EN.md -->

This document describes how to use the methods provided by the `msdatasets` module to load and process custom datasets.

<a name="NAbzQ"></a>
# 1. Related Definitions

ModelScope's standard datasets refer to datasets that, after creation, can be directly loaded and converted into standard dataset objects (e.g., torch dataset, etc.) with only standard operations (tokenize/embedding/to tensor, etc.) required to integrate with the trainer for finetune tasks. All other datasets are considered custom datasets. Typically, a custom dataset has the following characteristics:

- Requires data contributors to parse the dataset structure themselves
- Involves custom preprocessing workflows, including dataset merging/sampling/sample preprocessing, etc.

Additionally, the concept of "standard dataset" is relative. For example, the standard dataset squad for FAQ tasks might require additional custom processing logic to adapt to finetune workflows for other tasks, in which case it can be considered a custom dataset.

<a name="hzAtV"></a>
# 2. Custom Dataset Integration Process

The overall integration process for custom datasets is shown in the diagram below:<br />![Custom Dataset Integration Process - Flowchart (1).jpg](https://intranetproxy.alipay.com/skylark/lark/0/2023/jpeg/69636/1678862877904-a53b2837-dc01-471c-bab7-97495083e159.jpeg#clientId=ub47d3fd9-7320-4&from=ui&id=u927bf42b&name=%E8%87%AA%E5%AE%9A%E4%B9%89%E6%95%B0%E6%8D%AE%E9%9B%86%E6%8E%A5%E5%85%A5%E6%B5%81%E7%A8%8B-%E6%B5%81%E7%A8%8B%E5%9B%BE%20%281%29.jpg&originHeight=860&originWidth=2482&originalType=binary&ratio=1&rotation=0&showTitle=false&size=149073&status=done&style=stroke&taskId=uadb81f4c-771f-41e9-ab11-ab630341e8f&title=)

- **Step1: Create Dataset**
   - Complete dataset creation on modelscope.cn
   - Reference documentation: [https://modelscope.cn/docs/%E6%95%B0%E6%8D%AE%E9%9B%86%E4%BB%8B%E7%BB%8D](https://modelscope.cn/docs/%E6%95%B0%E6%8D%AE%E9%9B%86%E4%BB%8B%E7%BB%8D)

- **Step2: Custom Dataset Class**
   - Create a custom dataset class to uniformly manage and describe the previously uploaded dataset. Implementable features include but are not limited to:
      - Dataset structure definition and parsing
      - Label processing
      - Data cleaning/filtering, etc.
      - Sample preprocessing and transformation operations
   - It's recommended that your custom dataset class `YourCustomDataset` inherit from the parent class `TorchCustomDataset`
   - Register to `CUSTOM_DATASETS` to associate with downstream model training tasks
   - Reference example: `class ImageInstanceSegmentationCocoDataset`
   - Sample code (using `ImageInstanceSegmentationCocoDataset` as an example):
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

- **Step3: Custom Preprocessor**
   - The preprocessor primarily handles sample preprocessing for the dataset
   - You can choose to reuse existing preprocessors
   - Define preprocessor: `YourPreprocessor(Preprocessor)`, uniformly inheriting from parent class: `modelscope.preprocessors.base.Preprocessor`
   - Register to `PREPROCESSORS`
   - Code example (using `ImageInstanceSegmentationPreprocessor` as an example):
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

- **Step4: Convert to Standard DataLoader**
   - Built into SDK; the trainer will convert the passed `YourCutomDataset` object into a standard `torch.utils.data.DataLoader` object
   - Conversion to TensorFlow standard dataloader (work in progress)

- **Step5: Training Process**
   - Built into SDK

- **Step6: Evaluation and Subsequent Processes**
   - Built into SDK

<a name="O3JaH"></a>
# 3. Usage Scenarios

Custom dataset usage supports the following scenarios:

- Loading and using datasets independently: Users can load custom datasets via `MsDataset.load()`, where the `load()` function can optionally convert data into `YourCustomDataset` or leave it unconverted (returning `ExternalDataset` format). The resulting dataset object can be used in other secondary development tasks.
- Integration with ModelScope's provided finetune tasks: Users can combine `MsDataset.load()`, `build_trainer()`, `trainer.train()`, and other functions to connect custom datasets with model finetune tasks.

<a name="AzzgK"></a>
### **3.1 Independent Dataset Usage**

- Using the default `ExternalDataset` object
```python
from modelscope.msdatasets import MsDataset

train_dataset = MsDataset.load(
            dataset_name='modelscope/movie_scene_seg_toydata',
            split='train',
            custom_cfg=None)

print(next(iter(train_dataset)))
```
Note: In this scenario, `custom_cfg` is `None`. After iterating over the `train_dataset` object, you get a mapping tuple of split and data path, in the form of `('train', '/to/path/your-dataset-cache-path')`; alternatively, you can obtain the mapping relationship via `train_dataset.ds_instance.split_path_dict`.

- Converting to `YourCustomDataset` object
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
Note: In this scenario, the `custom_cfg` parameter must not be empty. `YourCustomDataset` inherits from `TorchCustomDataset`, which in turn inherits from `torch.utils.data.Dataset`, allowing direct integration with other related PyTorch tasks.

<a name="CsQTJ"></a>
### **3.2 Integration with ModelScope's Downstream Model Finetune Tasks**

Code example:
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
Note: In this scenario, the `custom_cfg` parameter of the `MsDataset.load()` function can also be set to `None` (default value). In this case, the loaded dataset object will have `train_dataset.is_custom=False`, indicating that the `to_custom_dataset` operation has not been performed yet. When `train_dataset` is passed to the trainer, during the `EpochBasedTrainer.__init__()` process, the dataset will be automatically evaluated, and if `train_dataset.is_custom=False`, the `to_custom_dataset()` operation will be performed to convert the dataset object to `YourCustomDataset`.