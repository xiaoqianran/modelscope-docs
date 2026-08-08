<!-- modelscope-docs: CascadeMaskRCNNSwin | model-overview/vision/CascadeMaskRCNNSwin-instance-segmentation/CascadeMaskRCNNSwin/CascadeMaskRCNNSwin_CN.md -->

# 模型概览

模型基于Cascade mask rcnn分割框架，backbone选用先进的swin transformer模型。

Swin transformer是一种具有金字塔结构的transformer架构，其表征通过shifted windows计算。
Shifted windows方案将自注意力的计算限制在不重叠的局部窗口上，同时还允许跨窗口连接，从而带来更高的计算效率。
分层的金字塔架构则让其具有在各种尺度上建模的灵活性。这些特性使swin transformer与广泛的视觉任务兼容，
并在密集预测任务如COCO实例分割上达到SOTA性能。
论文见[Swin Transformer: Hierarchical Vision Transformer using Shifted Windows](https://arxiv.org/abs/2103.14030)


Cascade R-CNN是一种多阶段目标检测架构，该架构由一系列经过不断提高的IOU阈值的检测器组成。
检测器串联进行训练，前一个检测器的输出作为下一个检测器的输入。通过重采样不断提高proposal质量，
达到高质量检测定位的效果。Cascade R-CNN可以被推广到实例分割，并对Mask R-CNN产生重大改进。
论文见[Cascade R-CNN: Delving into High Quality Object Detection](https://arxiv.org/abs/1712.00726)

模型领先性：

	1.Shifted windows方案将自注意力的计算限制在不重叠的局部窗口上，同时还允许跨窗口连接，建模能力强同时计算效率高。
    2.Cascade R-CNN通过级联检测方案提高了目标定位和分割的精度。
	3.在COCO数据集上进行的实验表明了该模型具有较高的先进性。

# 模型配置项

CascadeMaskRCNNSwinB模型的超参数控制可以在下载下来的模型文件中找到configuration.json文件，配置参数与[mmdetection](https://github.com/open-mmlab/mmdetection)库类似，格式如下

```json
{
    "model": {
        "type": "cascade_mask_rcnn_swin",
        "pretrained": true,
        "backbone": {
            "type": "SwinTransformer",
            "embed_dim": 128,
            "depths": [2, 2, 18, 2],
            "num_heads": [4, 8, 16, 32],
            "window_size": 7,
            "mlp_ratio": 4,
            "qkv_bias": true,
            "qk_scale": null,
            "drop_rate": 0,
            "attn_drop_rate": 0,
            "drop_path_rate": 0.3,
            "ape": false,
            "patch_norm": true,
            "out_indices": [0, 1, 2, 3],
            "use_checkpoint": false
        },
        "neck": { 
            "type": "FPN",
            "in_channels": [128, 256, 512, 1024],
            "out_channels": 256,
            "num_outs": 5
        },
        "rpn_head": {
            "type": "RPNHead",
            "in_channels": 256,
            "feat_channels": 256,
            "anchor_generator": {
                "type": "AnchorGenerator",
                "scales": [8],
                "ratios": [0.5, 1, 2],
                "strides": [4, 8, 16, 32, 64]
            },
            "bbox_coder": {
                "type": "DeltaXYWHBBoxCoder",
                "target_means": [0, 0, 0, 0],
                "target_stds": [1, 1, 1, 1]
            }
        },
        "roi_head": {
            "type": "CascadeRoIHead",
            "num_stages": 3,
            "stage_loss_weights": [1, 0.5, 0.25],
            "bbox_roi_extractor": {
                "type": "SingleRoIExtractor",
                "roi_layer": {
                    "type": "RoIAlign",
                    "output_size": 7,
                    "sampling_ratio": 0
                },
                "out_channels": 256,
                "featmap_strides": [4, 8, 16, 32]
            },
            "bbox_head": [{
                    "type": "ConvFCBBoxHead",
                    "num_shared_convs": 4,
                    "num_shared_fcs": 1,
                    "in_channels": 256,
                    "conv_out_channels": 256,
                    "fc_out_channels": 1024,
                    "roi_feat_size": 7,
                    "num_classes": 80,
                    "bbox_coder": {
                        "type": "DeltaXYWHBBoxCoder",
                        "target_means": [0, 0, 0, 0],
                        "target_stds": [0.1, 0.1, 0.2, 0.2]
                    },
                    "reg_class_agnostic": false,
                    "reg_decoded_bbox": true,
                    "norm_cfg": {
                        "type": "BN"
                    }
                },
                {
                    "type": "ConvFCBBoxHead",
                    "num_shared_convs": 4,
                    "num_shared_fcs": 1,
                    "in_channels": 256,
                    "conv_out_channels": 256,
                    "fc_out_channels": 1024,
                    "roi_feat_size": 7,
                    "num_classes": 80,
                    "bbox_coder": {
                        "type": "DeltaXYWHBBoxCoder",
                        "target_means": [0, 0, 0, 0],
                        "target_stds": [0.05, 0.05, 0.1, 0.1]
                    },
                    "reg_class_agnostic": false,
                    "reg_decoded_bbox": true,
                    "norm_cfg": {
                        "type": "BN"
                    }
                },
                {
                    "type": "ConvFCBBoxHead",
                    "num_shared_convs": 4,
                    "num_shared_fcs": 1,
                    "in_channels": 256,
                    "conv_out_channels": 256,
                    "fc_out_channels": 1024,
                    "roi_feat_size": 7,
                    "num_classes": 80,
                    "bbox_coder": {
                        "type": "DeltaXYWHBBoxCoder",
                        "target_means": [0, 0, 0, 0],
                        "target_stds": [0.033, 0.033, 0.067, 0.067]
                    },
                    "reg_class_agnostic": false,
                    "reg_decoded_bbox": true,
                    "norm_cfg": {
                        "type": "BN"
                    }
                }
            ],
            "mask_roi_extractor": {
                "type": "SingleRoIExtractor",
                "roi_layer": {
                    "type": "RoIAlign",
                    "output_size": 14,
                    "sampling_ratio": 0
                },
                "out_channels": 256,
                "featmap_strides": [4, 8, 16, 32]
            },
            "mask_head": {
                "type": "FCNMaskHead",
                "num_convs": 4,
                "in_channels": 256,
                "conv_out_channels": 256,
                "num_classes": 80
            }
        },
        "classes": ["person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck",
                    "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat",
                    "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", 
                    "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", 
                    "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket", "bottle", 
                    "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple", 
                    "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", 
                    "chair", "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", 
                    "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", 
                    "refrigerator", "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"
        ]
    }
}
```

## 参数列表

* **type** (`str`, defaults: cascade_mask_rcnn_swin) – The model type.
* **pretrained** (`bool`, defaults: True) – Whether to use the pretrained model weights.
* **backbone** (`dict`) – The backbone config.
* **neck** (`dict`) – The neck config.
* **rpn_head** (`dict`) – The rpn_head config.
* **roi_head** (`dict`) – The roi_head config.
* **classes** (`list`) – The class names that the model predicts.

# 模型主体
## 模型类
CascadeMaskRCNNSwinModel模型继承TorchModel基类
```py
@MODELS.register_module(
    Tasks.image_segmentation, module_name=Models.cascade_mask_rcnn_swin)
class CascadeMaskRCNNSwinModel(TorchModel):

    def __init__(self, model_dir=None, *args, **kwargs):
        """
        Args:
            model_dir (str): model directory.

        """
        super(CascadeMaskRCNNSwinModel, self).__init__(
            model_dir=model_dir, *args, **kwargs)
        self.model = CascadeMaskRCNNSwin(model_dir=model_dir, **kwargs)
```

### 参数列表   

* **model_dir** (str) – The directory to load the pretrained model.
* **kwargs** (dict, optional) 

CascadeMaskRCNNSwin定义了基本模型
```py
class CascadeMaskRCNNSwin(nn.Module):

    def __init__(self,
                 backbone,
                 neck,
                 rpn_head,
                 roi_head,
                 pretrained=None,
                 **kwargs):
        """
        Args:
            backbone (dict): backbone config.
            neck (dict): neck config.
            rpn_head (dict): rpn_head config.
            roi_head (dict): roi_head config.
            pretrained (bool): whether to use pretrained model
        """
```
### 参数列表
* **backbone** (dict) – The backbone config.
* **neck** (dict) – The neck config.
* **rpn_head** (dict) – The rpn_head config.
* **roi_head** (dict) – The roi_head config.
* **pretrained** (bool) – Whether to use pretrained model weights.

## 模型Forward函数

```py
def forward(self, input: dict) -> dict:
    pass
```
### 参数列表 
* **input** (dict) – input data.
```py
img = input['img']
img_metas = input['img_metas']
```

### 模型输出
```py
outputs = {
    "eval_result": [], # list[tuple]: The outer list corresponds to each image, 
                       # and first element of tuple is bbox results, second element is mask results.
    "img_metas": [],  # image meta information
}
```

# Pipeline使用示例

```py
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

input_img = 'https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/image_instance_segmentation.jpg'
output = './result.jpg'
segmentation_pipeline = pipeline(Tasks.image_segmentation, 'damo/cv_swin-b_image-instance-segmentation_coco')
result = segmentation_pipeline(input_img)

# if you want to show the result, you can run
from modelscope.preprocessors.image import LoadImage
from modelscope.models.cv.image_instance_segmentation.postprocess_utils import show_result

numpy_image = LoadImage.convert_to_ndarray(input_img)[:, :, ::-1]   # in bgr order
show_result(numpy_image, result, out_file=output, show_box=True, show_label=True, show_score=False)

from PIL import Image
Image.open(output).show()
```

# 模型微调
## 修改参数配置

### 数据预处理
preprocessor的配置参数如下
```json
{
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
}
}
```
## 参数列表
* **type** (`str`, defaults: image-instance-segmentation-preprocessor) – The preprocessor type.
* **train** (`list`) – The preprocessor config for training.
* **val** (`list`) – The preprocessor config for evaluation.

# 训练配置
用户可根据实际情况对训练参数进行调整
```json
{
    "train": {
        "dataloader": {
            "batch_size_per_gpu": 1,
            "workers_per_gpu": 1
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
        "max_epochs": 1
    }
}
```
## 参数列表
* **dataloader** (`dict`) – The config for pytorch dataloader.
* **optimizer** (`dict`) – The config for pytorch optimizer.
* **lr_scheduler** (`dict`) – The config for pytorch lr_scheduler.
* **max_epochs** (`dict`) – The max number of training epochs.

## 模型微调示例

```py
import os
import tempfile
from functools import partial

from modelscope.hub.snapshot_download import snapshot_download
from modelscope.metainfo import Trainers
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.utils.config import Config, ConfigDict
from modelscope.utils.constant import DownloadMode, ModelFile

model_id = 'damo/cv_swin-b_image-instance-segmentation_coco'
cache_path = snapshot_download(model_id)
config_path = os.path.join(cache_path, ModelFile.CONFIGURATION)
cfg = Config.from_file(config_path)

samples_per_gpu = cfg.train.dataloader.batch_size_per_gpu

# 训练数据集
train_dataset = MsDataset.load(
    dataset_name='pets_small',
    split='train',
    test_mode=False,
    download_mode=DownloadMode.FORCE_REDOWNLOAD)

# 测试数据集
eval_dataset = MsDataset.load(
    dataset_name='pets_small',
    split='validation',
    test_mode=True,
    download_mode=DownloadMode.FORCE_REDOWNLOAD)

from mmcv.parallel import collate

collate_fn = partial(collate, samples_per_gpu=samples_per_gpu)

tmp_dir = tempfile.TemporaryDirectory().name
if not os.path.exists(tmp_dir):
    os.makedirs(tmp_dir)
    
kwargs = dict(
    model=model_id,
    data_collator=collate_fn,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    work_dir=tmp_dir)
trainer = build_trainer(
    name=Trainers.image_instance_segmentation, default_args=kwargs)
# 开始训练
trainer.train()
```

## 数据评估及结果

可通过如下代码对模型进行评估验证


```python
from functools import partial
import os
import tempfile

from modelscope.metainfo import Trainers
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.utils.constant import DownloadMode

from mmcv.parallel import collate


tmp_dir = tempfile.TemporaryDirectory().name
if not os.path.exists(tmp_dir):
    os.makedirs(tmp_dir)

# 定义评估数据集
eval_dataset = MsDataset.load('COCO2017_Instance_Segmentation', 
                              namespace='hejunjie_hjj',
                              split='validation',  
                              download_mode=DownloadMode.FORCE_REDOWNLOAD)
kwargs = dict(
    model='damo/cv_swin-b_image-instance-segmentation_coco',
    data_collator=partial(collate, samples_per_gpu=1),
    train_dataset=None,
    eval_dataset=eval_dataset,
    work_dir=tmp_dir)
trainer = build_trainer(name=Trainers.image_instance_segmentation, default_args=kwargs)
metric_values = trainer.evaluate()
print(metric_values)
```

结果如下

| Backbone |  Pretrain   | box mAP | mask mAP | #params | FLOPs  | Remark       | 
|:--------:|:-----------:|:-------:|:--------:|:-------:|:------:|--------------|
|  Swin-B  | ImageNet-1k |  51.9   |   45.0   |  145M   |  982G  | [official](https://github.com/SwinTransformer/Swin-Transformer-Object-Detection) |
|  Swin-B  | ImageNet-1k |  52.7   |   46.1   |  145M   |  982G  | modelscope   |


# 论文引用
如果你觉得这个该模型对有所帮助，请考虑引用下面的相关的论文：

```BibTeX
@inproceedings{liu2021Swin,
  title={Swin Transformer: Hierarchical Vision Transformer using Shifted Windows},
  author={Liu, Ze and Lin, Yutong and Cao, Yue and Hu, Han and Wei, Yixuan and Zhang, Zheng and Lin, Stephen and Guo, Baining},
  booktitle={Proceedings of the IEEE/CVF International Conference on Computer Vision (ICCV)},
  year={2021}
}
```
```BibTeX
@article{Cai_2019,
   title={Cascade R-CNN: High Quality Object Detection and Instance Segmentation},
   ISSN={1939-3539},
   url={http://dx.doi.org/10.1109/tpami.2019.2956516},
   DOI={10.1109/tpami.2019.2956516},
   journal={IEEE Transactions on Pattern Analysis and Machine Intelligence},
   publisher={Institute of Electrical and Electronics Engineers (IEEE)},
   author={Cai, Zhaowei and Vasconcelos, Nuno},
   year={2019},
   pages={1–1}
}
```
