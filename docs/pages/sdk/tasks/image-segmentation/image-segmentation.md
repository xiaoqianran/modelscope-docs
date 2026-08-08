<!-- modelscope-docs: Image Segmentation Task | sdk/tasks/image-segmentation/image-segmentation_EN.md -->

This document demonstrates how to fine-tune the pre-trained ModelScope vision instance segmentation model CascadeMaskRCNN-Swin on a custom dataset.

### Loading Data
This model supports any dataset in COCO format, including the official COCO dataset and user-defined custom datasets. The required fields for COCO-format instance segmentation annotations are as follows. For complete details, please refer to [here](https://cocodataset.org/#format-data):

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

We provide a toy dataset called Pets, which originates from [Oxford-IIIT Pet](https://www.robots.ox.ac.uk/~vgg/data/pets/), has been converted to the appropriate format, and is hosted on DataHub. Users can access it as follows:

```python
from modelscope.msdatasets import MsDataset


train_dataset = MsDataset.load(dataset_name='pets_small',split='train')
eval_dataset = MsDataset.load(dataset_name='pets_small', split='validation', test_mode=True)
```

Here, `train_dataset` and `eval_dataset` define the training and validation datasets respectively.

### Data Preprocessing
Preprocessing for both training and testing is implemented in the Preprocessor. ModelScope provides a relatively general-purpose instance segmentation preprocessor: `image-instance-segmentation-preprocessor`. By passing this preprocessor in the configuration file, the trainer will automatically load it during the build phase and automatically switch between preprocessing configurations corresponding to `train` or `eval` modes based on the current model state.

The following example shows the specific preprocessor configuration, where the `type` field specifies the preprocessor type as `image-instance-segmentation-preprocessor`, the `train` field defines the preprocessing steps for model training, and the `val` field defines the preprocessing steps for model inference:

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

The current `image-instance-segmentation-preprocessor` provides commonly used image segmentation preprocessing methods, including `Resize`, `RandomFlip`, `Normalize`, `Pad`, etc. These processing functions are adapted from mmdetection. For specific usage details, please refer to mmdetection's [documentation](https://mmdetection.readthedocs.io/en/stable/api.html#module-mmdet.datasets.pipelines).

Note that `meta_keys` must include "ann_file" and "classes" to facilitate subsequent metric evaluation.

Users can also customize their own Preprocessor according to their needs.

### Training
As indicated in the trainer-related API documentation, the core training process consists of components such as dataset, dataloader, optimizer, lr_scheduler, and hooks. These are registered into the trainer's workflow by declaration in the `configuration.json` configuration file.

#### Basic Configuration
Before starting training, you need to properly configure the trainer configuration file. Below is a complete example configuration for fine-tuning an instance segmentation downstream task.

In practical usage, if the provided example doesn't meet your needs, you can customize the optimizer/lr_scheduler/hooks according to your actual training requirements and declare the corresponding custom methods using the `type` field in the configuration file.

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

Here, the `train` field defines parameters related to the training process, while the `evaluation` field defines the configuration used for model evaluation.

Additionally, set the model's pretrain status to true:

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

With the above configuration, you can perform fine-tune training of the model using the following code:

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

Here, the `data_collator` function leverages mmcv's implementation.

#### Advanced Configuration
In practice, users may frequently adjust configurations—not only training-related parameters but also potentially the corresponding downstream tasks. Therefore, we provide an advanced configuration method for algorithm users to reduce unnecessary rewriting of configuration files.

Customize cfg file by overriding and updating the cfg_file within the code for in-code configuration adjustments:

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

# Modify configuration.json file
cache_path = snapshot_download(model_id)
config_path = os.path.join(cache_path, ModelFile.CONFIGURATION)
cfg = Config.from_file(config_path)
# Modify maximum training epochs
cfg.train.max_epochs = 2
# Modify log interval
for i in range(len(cfg.train.hooks)):
    if cfg.train.hooks[i].type == "TextLoggerHook":
        cfg.train.hooks[i].interval = 10
        break
# Modify model output class dimensions, randomly initialize the last layer
classes = ('Cat', 'Dog')
for i in range(len(cfg.model.roi_head.bbox_head)):
    cfg.model.roi_head.bbox_head[i].num_classes = len(classes)
cfg.model.roi_head.mask_head.num_classes = len(classes)
# Save new configuration file
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

### Evaluation

#### Cross-validation
Cross-validation is performed synchronously during training, based on the EvaluationHook in train.hooks of the configuration file. The specific configuration is as follows:

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

Users can adjust this according to their actual situation, or register their own corresponding hook and invoke it by registering it in the configuration file through the type field.

#### Post-training Validation

1. Specify and load the validation dataset
2. Build trainer
3. Call the evaluate method

The following code demonstrates the model validation process:

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

# Modify configuration.json file
cache_path = snapshot_download(model_id)
config_path = os.path.join(cache_path, ModelFile.CONFIGURATION)
cfg = Config.from_file(config_path)
# Modify maximum training epochs
cfg.train.max_epochs = 2
# Modify log interval
for i in range(len(cfg.train.hooks)):
    if cfg.train.hooks[i].type == "TextLoggerHook":
        cfg.train.hooks[i].interval = 10
        break
# Modify model output class dimensions, randomly initialize the last layer
classes = ('Cat', 'Dog')
for i in range(len(cfg.model.roi_head.bbox_head)):
    cfg.model.roi_head.bbox_head[i].num_classes = len(classes)
cfg.model.roi_head.mask_head.num_classes = len(classes)
# Save new configuration file
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

### Metrics
Metrics are used to measure the validation results of specific tasks. Users can check the following package to find the list of supported metric classes:

```python
import modelscope.metrics
```

For instance segmentation, ModelScope provides a relatively general-purpose metric:

- ImageInstanceSegmentationCOCOMetric
   - Metric name: image-ins-seg-coco-metric
   - Standard COCO mAP metric, returning mask mAP and box mAP, etc.

In our code, we have specified default metric classes for each task type that supports fine-tuning:

```python
from modelscope.metrics.builder import task_default_metrics
```

The image-segmentation task defaults to calling the `image_ins_seg_coco_metric` metric. Users can also register and use custom metric types in ModelScope according to their needs.