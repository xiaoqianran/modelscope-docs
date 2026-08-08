<!-- modelscope-docs: 图像分割任务 | sdk/tasks/image-segmentation/image-segmentation_CN.md -->

本篇文档展示了如何在自定义数据集上微调预训练的modelscope视觉实例分割模型CascadeMaskRCNN-Swin。
### 载入数据
本模型支持任意具有COCO格式的数据集，包括官方COCO数据集和用户自定义数据集。COCO 格式的实例分割标注的必要字段如下，完整的细节可参考[这里](https://cocodataset.org/#format-data)：
```json
{
    "images": [image],
    "annotations": [annotation],
    "categories": [category]
}


image = {
    "id": int,
    "width": int,
    "height": int,
    "file_name": str,
}

annotation = {
    "id": int,
    "image_id": int,
    "category_id": int,
    "segmentation": RLE or [polygon],
    "area": float,
    "bbox": [x,y,width,height],
    "iscrowd": 0 or 1,
}

categories = [{
    "id": int,
    "name": str,
    "supercategory": str,
}]
```

我们提供了一个toy数据集Pets，该数据集来自[Oxford-IIIT Pet](https://www.robots.ox.ac.uk/~vgg/data/pets/)，已做过格式转换，并存放在DataHub上，用户可通过如下方式调用：
```python
from modelscope.msdatasets import MsDataset


train_dataset = MsDataset.load(dataset_name='pets_small',split='train')
eval_dataset = MsDataset.load(dataset_name='pets_small', split='validation', test_mode=True)
```
其中，train_dataset和eval_dataset分别定义训练数据集和验证数据集。
### 数据预处理
训练和测试时的预处理均在Preprocessor中实现。ModelScope提供了一个较为通用的实例分割preprocessor：`image-instance-segmentation-preprocessor`。在配置文件中传入该preprocessor，trainer在build阶段就会自动加载该preprocessor，并根据当前Model状态自动切换为`train`或`eval`所对应的预处理。
下面示例展示了具体preprocessor的配置，其中type指定preprocessor类型为`image-instance-segmentation-preprocessor`，`train`字段表示模型训练时所对应的预处理，`val`字段表示模型推理时所对应的预处理：
```json
"preprocessor": {
    "type": "image-instance-segmentation-preprocessor",
    "train": [
        {
        "type": "LoadImageFromFile"
        },
        {
            "type": "LoadAnnotations",
            "with_bbox": true,
            "with_mask": true
        },
        {
            "type": "Resize",
            "img_scale": [
                [666, 320],
                [666, 400]
            ],
            "multiscale_mode": "range",
            "keep_ratio": true
        },
        {
            "type": "RandomFlip",
            "flip_ratio": 0.5
        },
        {
            "type": "Normalize",
            "mean": [123.675, 116.28, 103.53],
            "std": [58.395, 57.12, 57.375],
            "to_rgb": true
        },
        {
            "type": "Pad",
            "size_divisor": 32
        },
        {
            "type": "DefaultFormatBundle"
        },
        {
            "type": "Collect",
            "keys": ["img", "gt_bboxes", "gt_labels", "gt_masks"],
            "meta_keys": [
                "filename", "ori_filename", "ori_shape",
                "img_shape", "pad_shape", "scale_factor", "flip",
                "flip_direction", "img_norm_cfg", "ann_file",
                "classes"
            ]
        }
    ],
    "val": [
        {
        "type": "LoadImageFromFile"
        },
        {
            "type": "Resize",
            "img_scale": [1333, 800],
            "keep_ratio": true
        },
        {
            "type": "RandomFlip",
            "flip_ratio": 0.0
        },
        {
            "type": "Normalize",
            "mean": [123.675, 116.28, 103.53],
            "std": [58.395, 57.12, 57.375],
            "to_rgb": true
        },
        {
            "type": "Pad",
            "size_divisor": 32
        },
        {
            "type": "ImageToTensor",
            "keys": ["img"]
        },
        {
            "type": "Collect",
            "keys": ["img"],
            "meta_keys": [
                "filename", "ori_filename", "ori_shape",
                "img_shape", "pad_shape", "scale_factor", "flip",
                "flip_direction", "img_norm_cfg", "ann_file",
                "classes"
            ]
        }
    ]
},
```
当前`image-instance-segmentation-preprocessor`提供了常用的图像分割预处理方法，包括`Resize`，`RandomFlip`，`Normalize`，`Pad`等，此处各处理函数借鉴了mmdetetcion，具体使用方式可参考mmdetection的[使用文档](https://mmdetection.readthedocs.io/en/stable/api.html#module-mmdet.datasets.pipelines)。
注意，此处`meta_keys`需包涵"ann_file"，"classes"，方便后续Metric做评估。
用户也可根据需要定制自己的Preprocessor。 
### 训练
由trainer相关的接口文档可以了解到，训练过程核心流程由dataset、dataloader、optimizer、lr_scheduler和hooks等组件功能组成，具体是通过在configuration.json配置文件中申明的方式注册进入trainer的流程中。
#### 基础配置
在训练开始前需要配置好相应的trainer配置文件， 下面给一个完整的实例分割下游任务finetune的配置。
用户在实际使用过程中，如果示例无法提供帮助，可以根据自己实际训练要求，针对optimizer/lr_scheduler/hooks进行定制注册，并在配置文件中通过type字段申明相应定制方法进行使用。
```json
"train": {
    "dataloader": {
        "batch_size_per_gpu": 1,
        "workers_per_gpu": 0
    },
    "optimizer": {
        "type": "AdamW",
        "lr": 0.00001,
        "weight_decay": 0.05
    },
    "lr_scheduler": {
        "type": "MultiStepLR",
        "milestones": [],
        "gamma": 0.1
    },
    "max_epochs": 1,
    "hooks": [
        {
            "type": "CheckpointHook",
            "interval": 1
        },
        {
            "type": "TextLoggerHook",
            "interval": 1
        },
        {
            "type": "IterTimerHook"
        },
        {
            "type": "EvaluationHook",
            "interval": 1
        }
    ]
},

"evaluation": {
    "dataloader": {
        "batch_size_per_gpu": 1,
        "workers_per_gpu": 0
    },
    "metrics": ["image-ins-seg-coco-metric"]
},
```
其中，`train`字段定义了训练流程相关的参数配置，`evaluation`字段定义了模型评估时所用的配置。
同时，设置模型pretrain状态为true：
```json
{
    ...
    "model": {
        ...
        "pretrained": true,
        ...
    },
    ...
    
}
```
有了上述配置，可通过如下代码进行模型的finetune训练：
```python
from functools import partial

from modelscope.metainfo import Trainers
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.utils.hub import read_config


WORKSPACE = './work_dir'
model_id = 'damo/cv_swin-b_image-instance-segmentation_coco'

samples_per_gpu = read_config(model_id).train.dataloader.batch_size_per_gpu
train_dataset = MsDataset.load(dataset_name='pets_small',split='train')
eval_dataset = MsDataset.load(dataset_name='pets_small', split='validation', test_mode=True)
max_epochs = 1

from mmcv.parallel import collate
    
kwargs = dict(
            model=model_id,
            data_collator=partial(collate, samples_per_gpu=samples_per_gpu),
            train_dataset=train_dataset,
            eval_dataset=eval_dataset,
            work_dir=WORKSPACE,
            max_epochs=max_epochs)

trainer = build_trainer(
    name=Trainers.image_instance_segmentation, default_args=kwargs)

print('===============================================================')
print('pre-trained model loaded, training started:')
print('===============================================================')

trainer.train()

print('===============================================================')
print('train success.')
print('===============================================================')

for i in range(max_epochs):
    eval_results = trainer.evaluate(f'{WORKSPACE}/epoch_{i+1}.pth')
    print(f'epoch {i} evaluation result:')
    print(eval_results)


print('===============================================================')
print('evaluate success')
print('===============================================================')
```
这里data_collator函数借助mmcv的实现。
#### 高级配置
在实际过程用户可能会频繁对配置进行调整，不光是训练相关的参数，很可能对应的下游任务都会变化，因此我们提供了高级配置方式供算法用户使用，从而减少不必要的configuration文件改写。
自定义cfg file， 通过覆盖更新cfg_file文件进行代码内的配置调整：
```python
import os
from functools import partial

from modelscope.hub.snapshot_download import snapshot_download
from modelscope.metainfo import Trainers
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.utils.config import Config
from modelscope.utils.constant import ModelFile


WORKSPACE = './work_dir'
model_id = 'damo/cv_swin-b_image-instance-segmentation_coco'

# 修改configuration.json文件
cache_path = snapshot_download(model_id)
config_path = os.path.join(cache_path, ModelFile.CONFIGURATION)
cfg = Config.from_file(config_path)
# 修改最大训练epoch数
cfg.train.max_epochs = 2
# 修改log间隔
for i in range(len(cfg.train.hooks)):
    if cfg.train.hooks[i].type == "TextLoggerHook":
        cfg.train.hooks[i].interval = 10
        break
# 修改模型输出类别维度，最后一层随机初始化
classes = ('Cat', 'Dog')
for i in range(len(cfg.model.roi_head.bbox_head)):
    cfg.model.roi_head.bbox_head[i].num_classes = len(classes)
cfg.model.roi_head.mask_head.num_classes = len(classes)
# 保存新配置文件
cfg_file = os.path.join(WORKSPACE, 'config.json')
cfg.dump(cfg_file)

train_dataset = MsDataset.load(dataset_name='pets_small',split='train')
eval_dataset = MsDataset.load(dataset_name='pets_small', split='validation', test_mode=True)

from mmcv.parallel import collate

max_epochs = cfg.train.max_epochs
samples_per_gpu = cfg.train.dataloader.batch_size_per_gpu
kwargs = dict(
            cfg_file=cfg_file,
            model=model_id,
            data_collator=partial(collate, samples_per_gpu=samples_per_gpu),
            train_dataset=train_dataset,
            eval_dataset=eval_dataset,
            work_dir=WORKSPACE,
            max_epochs=max_epochs)

trainer = build_trainer(
    name=Trainers.image_instance_segmentation, default_args=kwargs)

print('===============================================================')
print('pre-trained model loaded, training started:')
print('===============================================================')

trainer.train()

print('===============================================================')
print('train success.')
print('===============================================================')
```
### 评估
#### 交叉验证
交叉验证是在train时同步进行的，基于在配置文件中的 train.hooks的 EvaluationHook，具体配置如下：
```json
{
    ...
    "train": 
    {
        ...
        "hooks": 
        [
            ..., 
            {
            "type": "EvaluationHook",
            "by_epoch": true,
            "interval": 1
            }，
        ]
    },
}
```

用户可以根据自己实际情况进行调整，也可自行注册相应hook，并通过type字段注册在配置文件中进行调用。
#### 训练后验证

1. 指定并加载验证数据集
2. build_trainer
3. 调用evaluate方法

如下代码展示了模型的验证流程
```python
import os
from functools import partial

from modelscope.hub.snapshot_download import snapshot_download
from modelscope.metainfo import Trainers
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.utils.config import Config
from modelscope.utils.constant import ModelFile


WORKSPACE = './work_dir'
model_id = 'damo/cv_swin-b_image-instance-segmentation_coco'

# 修改configuration.json文件
cache_path = snapshot_download(model_id)
config_path = os.path.join(cache_path, ModelFile.CONFIGURATION)
cfg = Config.from_file(config_path)
# 修改最大训练epoch数
cfg.train.max_epochs = 2
# 修改log间隔
for i in range(len(cfg.train.hooks)):
    if cfg.train.hooks[i].type == "TextLoggerHook":
        cfg.train.hooks[i].interval = 10
        break
# 修改模型输出类别维度，最后一层随机初始化
classes = ('Cat', 'Dog')
for i in range(len(cfg.model.roi_head.bbox_head)):
    cfg.model.roi_head.bbox_head[i].num_classes = len(classes)
cfg.model.roi_head.mask_head.num_classes = len(classes)
# 保存新配置文件
cfg_file = os.path.join(WORKSPACE, 'config.json')
cfg.dump(cfg_file)

train_dataset = MsDataset.load(dataset_name='pets_small',split='train')
eval_dataset = MsDataset.load(dataset_name='pets_small', split='validation', test_mode=True)

from mmcv.parallel import collate

max_epochs = cfg.train.max_epochs
samples_per_gpu = cfg.train.dataloader.batch_size_per_gpu
kwargs = dict(
            cfg_file=cfg_file,
            model=model_id,
            data_collator=partial(collate, samples_per_gpu=samples_per_gpu),
            train_dataset=train_dataset,
            eval_dataset=eval_dataset,
            work_dir=WORKSPACE,
            max_epochs=max_epochs)

trainer = build_trainer(
    name=Trainers.image_instance_segmentation, default_args=kwargs)

print('===============================================================')
print('pre-trained model loaded, training started:')
print('===============================================================')

trainer.train()

print('===============================================================')
print('train success.')
print('===============================================================')

for i in range(max_epochs):
    eval_results = trainer.evaluate(f'{WORKSPACE}/epoch_{i+1}.pth')
    print(f'epoch {i} evaluation result:')
    print(eval_results)

print('===============================================================')
print('evaluate success')
print('===============================================================')
```
### 指标
指标用来衡量某个具体任务的验证结果，用户可以查看如下package找到已支持指标类的列表：
```python
import modelscope.metrics
```
对于实例分割，modelscope提供了一个较为通用的指标：

- ImageInstanceSegmentationCOCOMetric
   - 指标名称为image-ins-seg-coco-metric
   - 为COCO标准mAP指标，返回mask mAP和box mAP等

代码中我们为支持finetune的各任务类型指定了默认metric类：
```python
from modelscope.metrics.builder import task_default_metrics
```
image-segmentation任务默认调用`image_ins_seg_coco_metric`指标。用户也可以根据需要在modelscope中注册使用自定义的指标类型。
 