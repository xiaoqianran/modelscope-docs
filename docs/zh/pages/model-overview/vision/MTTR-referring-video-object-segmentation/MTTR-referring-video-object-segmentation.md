<!-- modelscope-docs: MTTR_referring_video_object_segmentation | model-overview/vision/MTTR-referring-video-object-segmentation/MTTR-referring-video-object-segmentation_CN.md -->

# 模型概览

文本指导的视频目标分割任务 （Referring Video Object Segmentation， RVOS） 指的是在给定视频的每一帧中对文本指出的对象实例进行分割。
MTTR方法提出了一种基于transformer的端到端RVOS方法。
模型首先利用基于transformer的文本编码器对输入的文本进行编码，并使用时空编码器对视频帧进行编码，然后将这两种特征送入多模态transformer中，并输出若干个预测序列。
为了判断哪个序列更符合输入文本指定的对象实例，模型还为每个预测序列计算了文本相关分数。
模型中的文本编码器和视频编码器分别使用了RoBERTa-base和video swin transformer。
论文见[《End-to-End Referring Video Object Segmentation With Multimodal Transformers》](https://openaccess.thecvf.com/content/CVPR2022/html/Botach_End-to-End_Referring_Video_Object_Segmentation_With_Multimodal_Transformers_CVPR_2022_paper.html)。

论文的摘要信息如下：

	文本指导的视频目标分割任务 (RVOS) 涉及在给定视频的帧中分割文本引用对象实例。由于这种结合了文本推理、视频理解、实例分割和跟踪的多模式任务的复杂性，现有方法通常依赖于复杂的pipeline来解决它。在本文中，我们提出了一种简单的基于transformer的RVOS方法。我们的框架称为多模态跟踪transformer (MTTR)，本文将RVOS任务建模为序列预测问题。随着计算机视觉和自然语言处理的最新进展，MTTR认为视频和文本可以通过单个多模态transformer模型有效而优雅地一起处理 MTTR可以进行端到端的训练，没有与文本相关的归纳偏置组件，也不需要额外的掩码微调的后处理步骤。因此，与现有方法相比，它大大简化了RVOS任务的pipeline流程。在标准数据集上的评估表明，MTTR在多个指标上明显优于以前的方法。特别是，MTTR在A2D-Sentences和JHMDB-Sentences数据集上分别得到了5.7和5.0mAP的增益，同时处理速度可以达到每秒76帧。此外，我们给出了MTTR在Refer-YouTube-VOS验证集上的结果，这是一个更具挑战性的RVOS数据集，尚未受到研究人员的关注。我们的代码可在 https://github.com/mttr2021/MTTR 获得。


模型领先性：

	1.MTTR提出了一个基于transformer的RVOS框架，它将任务建模为并行序列预测问题，并不需要首先选择一个由输入文本指定的对象实例，而是可以直接输出对所有对象的预测结果。
    2.MTTR提出了基于时间分段投票方案的序列选择策略，这种新颖的推理方案允许我们的模型专注于视频中与输入文本更相关的部分。
	3.MTTR是端到端可训练的，没有文本相关的归纳偏置模块，并且不需要额外的掩码细化。因此，它大大简化了RVOS的pipeline。

# 模型配置项

MTTR模型的超参数控制可以在下载下来的模型文件中找到configuration.json文件，配置参数格式如下:

```json
{

    "model": {
        "type": "swinT-referring-video-object-segmentation",
        "num_queries": 50,
        "mask_kernels_dim": 8,
        "aux_loss": true,
        "backbone_name": "swin-t",
        "backbone_pretrained": false,
        "backbone_pretrained_path": "ckp_pth",
        "train_backbone": true,
        "running_mode": "eval",
        "num_encoder_layers": 3,
        "num_decoder_layers": 3,
        "dim_feedforward": 2048,
        "text_encoder_type": "roberta-base",
        "freeze_text_encoder": true,
        "d_model": 256,
        "dropout": 0.1,
        "nheads": 8
    },

}
```

## 参数列表

* **type** (`str`) – The model type.
* **num_queries** (`bool`) – The number of query slots.
* **mask_kernels_dim** (`int`) – The backbone config.
* **aux_loss** (`bool`) - Enable auxiliary decoding losses (loss at each layer).
* **backbone_name** (`str`) - The name of backbone.
* **backbone_pretrained** (`bool`) - Whether to load pretrained weights.
* **backbone_pretrained_path** (`str`) - The path of pretrained weights.
* **train_backbone** (`bool`) - Whether to train backbone.
* **running_mode** (`str`) - The mode of running model.
* **num_encoder_layers** (`int`) - Number of encoding layers in the transformer.
* **num_decoder_layers** (`int`) - Number of decoding layers in the transformer.
* **dim_feedforward** (`int`) - Intermediate size of the feedforward layers in the transformer blocks.
* **text_encoder_type** (`str`) - Text encoder to use.
* **freeze_text_encoder** (`bool`) - Whether to freeze the weights of the text encoder during training.
* **d_model** (`int`) - Size of the embeddings (dimension of the transformer).
* **dropout** (`float`) - Dropout applied in the transformer.
* **nheads** (`int`) - Number of attention heads inside the transformer's attentions.


* **neck** (`dict`) – The neck config.
* **rpn_head** (`dict`) – The rpn_head config.
* **roi_head** (`dict`) – The roi_head config.
* **classes** (`list`) – The class names that the model predicts.


当用户在推理中使用MTTR时，这些参数一般都是固定的。您可以使用Model类直接调用模型：
```python
from modelscope.models.cv.referring_video_object_segmentation import ReferringVideoObjectSegmentation
model = ReferringVideoObjectSegmentation('damo/cv_swin-t_referring_video-object-segmentation')
```


也可以使用pipeline完成一次推理，来查看模型效果。
模型推理是的参数可以在下载下来的模型文件中找到configuration.json文件，配置参数格式如下:

```json
{
    "pipeline": {
        "type": "referring-video-object-segmentation",
        "dataset_name": "ref_youtube_vos",
        "save_masked_video": true,
        "output_path": "output_clip.mp4",
        "output_font": "DejaVuSansMono.ttf",
        "output_font_size": 30
    }
}
```
* **type** (`str`) - The model type.
* **dataset_name** (`str`) - The dataset format.
* **save_masked_video** (`bool`) - Whether to save ouput video.
* **output_path** (`str`) - Where to save output video.
* **output_font** (`str`) - The text font of input text query used in output video.
* **output_font_size** (`int`) - The font size used in output video.

使用pipeline类进行推理的参考代码如下：
```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.outputs import OutputKeys

input_location = 'https://modelscope.oss-cn-beijing.aliyuncs.com/test/videos/referring_video_object_segmentation_test_video.mp4'
text_queries = [
    'guy in black performing tricks on a bike',
    'a black bike used to perform tricks'
]
start_pt, end_pt = 4, 14

input_tuple = (input_location, text_queries, start_pt, end_pt)
pp = pipeline(Tasks.referring_video_object_segmentation, model='damo/cv_swin-t_referring_video-object-segmentation')
result = pp(input_tuple)
print(result)
```

# 模型微调

## 训练配置
用户可根据实际情况对训练参数进行调整（仅作为示例和参考）:
```json
{
    "matcher": {
        "set_cost_is_referred": 2,
        "set_cost_dice": 5
    },

    "loss": {
        "aux_loss": true,
        "is_referred_loss_coef": 2,
        "sigmoid_focal_loss_coef": 2,
        "dice_loss_coef": 5,
        "eos_coef": 0.1
    },

    "train": {
        "lr_backbone": 1e-4,
        "text_encoder_lr": 1e-5,
        "max_epochs": 1,
        "enable_amp": true,
        "dataloader": {
            "batch_size_per_gpu": 1,
            "workers_per_gpu": 4
        },
        "optimizer": {
            "type": "AdamW",
            "lr": 1e-4,
            "weight_decay": 1e-4,
            "options": {
                "grad_clip": {
                    "max_norm": 0.1
                }
            }
        },
        "lr_scheduler": {
            "type": "MultiStepLR",
            "milestones": [20],
            "gamma": 0.4,
            "verbose": true
        },
        "hooks": [{
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
}
```
## 参数列表
* **matcher** (`dict`) – The config for sequence matching strategy.

    set_cost_is_referred: Soft tokens coefficient in the matching cost.

    set_cost_dice: Dice coefficient in the matching cost.
* **loss** (`dict`) – The config for loss function.

    aux_loss: Whether to use aux loss.

    is_referred_loss_coef: Relative weight of referred loss.

    sigmoid_focal_loss_coef: Relative weight of focal loss.

    dice_loss_coef: Relative weight of dice loss.

    eos_coef: Relative classification weight of the no-object class.
* **train** (`dict`) – The config for trainer.

    lr_backbone: The lr rate of update backbone.
    
    text_encoder_lr: The lr rate of update text_encoder.
    
    max_epochs: The max training epoch.
    
    enable_amp: Whether to enable amp.
    
    dataloader: The config for pytorch dataloader.
    
    optimizer: The config for pytorch optimizer.

    lr_scheduler: The config for pytorch lr_scheduler.

    hooks: The hooks of training.

## 模型微调示例
```py
import os
import shutil
import tempfile
import unittest
import zipfile

from modelscope.hub.snapshot_download import snapshot_download
from modelscope.metainfo import Trainers
from modelscope.models.cv.referring_video_object_segmentation import \
    ReferringVideoObjectSegmentation
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.utils.config import Config, ConfigDict
from modelscope.utils.constant import ModelFile
from modelscope.utils.test_utils import test_level

model_id = 'damo/cv_swin-t_referring_video-object-segmentation'
dataset_name = 'referring_vos_toydata'
cache_path = snapshot_download(model_id)
config_path = os.path.join(cache_path, ModelFile.CONFIGURATION)
cfg = Config.from_file(config_path)

train_data_cfg = ConfigDict(
    name=dataset_name,
    split='train',
    test_mode=False,
    cfg=cfg.dataset)
test_data_cfg = ConfigDict(
    name=dataset_name,
    split='test',
    test_mode=True,
    cfg=cfg.dataset)

train_dataset = MsDataset.load(
    dataset_name=train_data_cfg.name,
    split=train_data_cfg.split,
    cfg=train_data_cfg.cfg,
    test_mode=train_data_cfg.test_mode)
assert next(
    iter(train_dataset.config_kwargs['split_config'].values()))
test_dataset = MsDataset.load(
    dataset_name=test_data_cfg.name,
    split=test_data_cfg.split,
    cfg=test_data_cfg.cfg,
    test_mode=test_data_cfg.test_mode)
assert next(
    iter(test_dataset.config_kwargs['split_config'].values()))

kwargs = dict(
    model=model_id,
    train_dataset=train_dataset,
    eval_dataset=test_dataset,
    work_dir='./work_dir')

trainer = build_trainer(
    name=Trainers.referring_video_object_segmentation,
    default_args=kwargs)
trainer.train()
results_files = os.listdir(trainer.work_dir)
self.assertIn(f'{trainer.timestamp}.log.json', results_files)
```

## 数据评估及结果

可通过如下代码对模型进行评估验证:
```python
import os
import shutil
import tempfile
import unittest
import zipfile

from modelscope.hub.snapshot_download import snapshot_download
from modelscope.metainfo import Trainers
from modelscope.models.cv.referring_video_object_segmentation import \
    ReferringVideoObjectSegmentation
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.utils.config import Config, ConfigDict
from modelscope.utils.constant import ModelFile
from modelscope.utils.test_utils import test_level

model_id = 'damo/cv_swin-t_referring_video-object-segmentation'
dataset_name = 'referring_vos_toydata'
cache_path = snapshot_download(model_id)
config_path = os.path.join(cache_path, ModelFile.CONFIGURATION)
cfg = Config.from_file(config_path)

test_data_cfg = ConfigDict(
    name=dataset_name,
    split='test',
    test_mode=True,
    cfg=cfg.dataset)

test_dataset = MsDataset.load(
    dataset_name=test_data_cfg.name,
    split=test_data_cfg.split,
    cfg=test_data_cfg.cfg,
    test_mode=test_data_cfg.test_mode)
assert next(
    iter(test_dataset.config_kwargs['split_config'].values()))

kwargs = dict(
    model=model_id,
    train_dataset=None,
    eval_dataset=test_dataset,
    work_dir='./work_dir')

trainer = build_trainer(
    name=Trainers.referring_video_object_segmentation,
    default_args=kwargs)
metrics = trainer.evaluate()
print(metrics)
```

结果如下:

| DataSet            | mAP  | J&F   |
|:------------------:|:----:|:-----:|
| AD-Sentences       | 46.1 | -     |
| JHMDB-Sentences    | 39.2 | -     |
| Refer-YouTube-VOS  | -    | 55.32 |


# 论文引用
如果你觉得这个该模型对有所帮助，请考虑引用下面的相关的论文：

```BibTeX
@inproceedings{botach2021end,
  title={End-to-End Referring Video Object Segmentation with Multimodal Transformers},
  author={Botach, Adam and Zheltonozhskii, Evgenii and Baskin, Chaim},
  booktitle={Proc. IEEE Conf. Computer Vision and Pattern Recognition (CVPR)},
  year={2022}
}
```