<!-- modelscope-docs: SCRFD_card_detection | model-overview/vision/SCRFD-card-detection/SCRFD-card-detection_CN.md -->

# 模型概览
在实人认证、文档电子化等场景中需要自动化提取卡证的信息，以便进一步做录入处理。这类场景通常存在两类问题，一是识别卡证类型时易受背景干扰，二是卡证拍摄角度造成的文字畸变影响OCR准确率。鉴于证件类数据的敏感性，我们采用大量合成卡证数据做训练(参见：[SyntheticCards](https://modelscope.cn/datasets/shaoxuan/SyntheticCards)), 并改造人脸检测SOTA方法SCRFD([论文地址](https://arxiv.org/abs/2105.04714), [代码地址](https://github.com/deepinsight/insightface/tree/master/detection/scrfd))训练了卡证检测矫正模型，可以对各类国际常见卡证（如，身份证、护照、驾照等）进行检测、定位及矫正，得到去除背景的正视角卡证图像，便于后续卡证分类或OCR内容提取。 

### 训练数据：
![训练数据](./_resources/traindata.jpg)

### 效果展示：
![效果展示](./_resources/card_detect.jpg)

## 技术特点
本模型采用合成证件数据，利用改造后的人脸检测算法训练，可用于多种卡证类目标进行检测和定位，并利用角点进行透视变换矫正。

## 论文摘要
（*以下摘要来自为本模型采用的人脸检测算法SCRFD的论文*）
近年来在自然场景下的人脸检测取得了显著的进步，但高效且高精度的人脸检测器仍为开放性的挑战。本论文指出，训练数据采样和算力分布策略是高效且精准的人脸检测器的关键问题。基于此，我们提出两个简单但有效的方法: 
- Sample Redistribution(SR), 统计训练数据的人脸size分布，在固定分辨率输入下增广更多小样本来训练shallow stage; 
- Computation Redistribution(CR), 简化搜索空间，采用RegNet的思路对backbone，neck, head网络结构进行搜索; 

通过在WIDER FACE上的大量实验表明，所提出的SCRFD family通过平衡效率和精度，在一个较大的算力范围内都取得了state-of-the-art。特别的，SCRFD-34GF模型的mAP超过竞争方法TinaFace 3.86%，同时GPU推理速度快3倍。

# 模型推理

## 参数说明
- 输入：仅有一个检测分的阈值参数，位于配置文件`mmcv_scrfd.py`的`model.test_cfg.score_thr`,默认0.45
- 输出：按照如下格式输出检测分、矩形框和关键点坐标（其中矩形框坐标为左上角、右下角；关键点为左下角、左上角、右上角、右下角）
```
    {
       "scores": [0.9, 0.1, 0.05, 0.05]
       "boxes": [
           [x1, y1, x2, y2],
           [x1, y1, x2, y2],
           [x1, y1, x2, y2],
           [x1, y1, x2, y2],
       ],
       "keypoints": [
           [x1, y1, x2, y2, x3, y3, x4, y4],
           [x1, y1, x2, y2, x3, y3, x4, y4],
           [x1, y1, x2, y2, x3, y3, x4, y4],
           [x1, y1, x2, y2, x3, y3, x4, y4],
       ],
   }
```
## 推理示例代码
```python
import cv2
from modelscope.pipelines import pipeline
from modelscope.utils.constant import  Tasks

card_detection = pipeline(Tasks.card_detection, 'damo/cv_resnet_carddetection_scrfd34gkps')
img_path = 'https://design3d.oss-cn-qingdao.aliyuncs.com/MS_test_img/card_detection.jpg'
result = card_detection(img_path)

# if you want to show the result, you can run
from modelscope.utils.cv.image_utils import draw_card_detection_result
from modelscope.preprocessors.image import LoadImage
import matplotlib.pyplot as plt
img = LoadImage.convert_to_ndarray(img_path)
cv2.imwrite('srcImg.jpg', img)
img_list = draw_card_detection_result('srcImg.jpg', result)
for i, img in enumerate(img_list):
    plt.figure()
    plt.imshow(img_list[i])
```
备注：以上示例代码使用卡证角点坐标进行矫正，矫正后的卡证图片默认为短边500、宽高比1.59(横卡)或1/1.59(竖卡)的尺寸，相关代码见：`modelscope/util/cv/image_util.py`的`draw_card_detection_result()`

# 模型训练

## 参数说明
所有参数位于配置文件`mmcv_scrfd.py`中，分为通用训练参数，数据集参数，模型结构参数三个部分。其中可配置的重要参数说明如下：
### 通用训练参数
包含训练过程相关的参数，如学习率变化、日志打印、模型评测频率等
```python
optimizer = dict(type='SGD', lr=0.02, momentum=0.9, weight_decay=0.0005)
optimizer_config = dict(grad_clip=None)
lr_config = dict(
    policy='step',
    warmup='linear',
    warmup_iters=600,
    warmup_ratio=0.001,
    step=[120, 200, 240])
total_epochs = 280
checkpoint_config = dict(interval=40)
log_config = dict(interval=25, hooks=[dict(type='TextLoggerHook')])
dist_params = dict(backend='nccl')
log_level = 'INFO'
load_from = None
resume_from = None
workflow = [('train', 1)]
dataset_type = 'RetinaFaceDataset'
data_root = '/data/vdc/yuxiang.tyx/OCR_resource/'
train_root = data_root + 'SyntheticCards_train100k/'
val_root = data_root + 'SyntheticCards_val1k/'
evaluation = dict(interval=40, metric='mAP')
```
* **optimizer**: 配置优化器相关参数
  * type: 优化器方法，默认为SGD
  * lr: 初始学习率，默认0.02
  * momentum: 动量，默认0.9
  * weight_decay: 权重衰减参数，默认5e-4
* **lr_config**: 配置学习率衰减计划
  * policy: 学习率衰减方法，默认step，即按照epoch数衰减
  * warmup: 设置warmup方式，默认linear，即线性warmup
  * warmup_iters: 设置warmup的迭代次数
  * warmup_ratio: 设置每次迭代时warmup的学习率变化比例
  * step: 设置学习率衰减为0.1的epoch计数
* **total_epochs**： 最大训练epoch数
* **checkpoint_config**: 设置保存checkpoint的间隔，单位为epoch数
* **log_config**: 设置打印log的间隔，单位为iter数
* **resume_from**: 恢复训练时载入的checkpoint的路径，用于恢复意外终止的训练任务，或finetune
* **data_root**: 数据集的存放路径，通常包含训练数据和评测数据
* **evaluation**: 跑评测集评估当前模型的间隔，单位为epoch数
### 数据集参数
包含训练集、验证集、测试集的加载及处理参数
```python
data = dict(
    samples_per_gpu=8,
    workers_per_gpu=3,
    train=dict(
        type='RetinaFaceDataset',
        ann_file=train_root+'labelv2.txt',
        img_prefix=train_root,
        num_kps=4,
        pipeline=[
            dict(type='LoadImageFromFile', to_float32=True),
            dict(type='LoadAnnotationsV2', with_bbox=True, with_keypoints=True),
            dict(
                type='RandomSquareCrop',
                crop_choice=[0.9, 1.0, 1.2, 1.4, 1.6],
                big_face_ratio=0.2,
                big_face_crop_choice=[0.85, 0.9, 0.95],
                bbox_clip_border=False),
            dict(type='RotateV2', level=5, prob=0.2, max_rotate_angle=180, random_negative_prob=0.5),
            dict(type='RotateV2', level=5, prob=0.2, max_rotate_angle=360, random_negative_prob=0.5),
            dict(
                type='ResizeV2',
                img_scale=(640, 640),
                keep_ratio=False,
                bbox_clip_border=False),
            dict(type='RandomFlipV2', flip_ratio=0.5),
            dict(
                type='PhotoMetricDistortion',
                brightness_delta=32,
                contrast_range=(0.5, 1.5),
                saturation_range=(0.5, 1.5),
                hue_delta=18),
            dict(
                type='Normalize',
                mean=[127.5, 127.5, 127.5],
                std=[128.0, 128.0, 128.0],
                to_rgb=True),
            dict(type='DefaultFormatBundleV2'),
            dict(
                type='Collect',
                keys=[
                    'img', 'gt_bboxes', 'gt_labels', 'gt_bboxes_ignore',
                    'gt_keypointss'
                ])
        ]))
```
* **samples_per_gpu**: 每个GPU的样本数，所有GPU的样本数之和即batch_size
* **workers_per_gpu**: 每个GPU准备训练数据时的worker数，建议>1，默认3
* **train**: 训练集相关的参数
  * ann_file: 标注文件的路径
  * img_prefix: 标注文件中，图片路径的前缀，如不需要，可设置为`''`
  * num_kps: 关键点的数量，此处指证件角点，默认为4
  * pipeline: 训练数据按照所配置的模块依次做预处理的过程，之后输入模型进行训练
    * LoadImageFromFile: 从文件载入图片
    * LoadAnnotationsV2: 从文件载入标注信息
    * RandomSquareCrop: 随机裁减正方形区域
      * crop_choice: 随机选择一个比例系数对原图缩放，>1则容易采样到小目标，<1则容易采样到大目标
      * big_face_ratio: 从原图中选择一个目标区域替换为待裁剪原图的比例
      * big_face_crop_choice: 处于big_face模式时，随机选择的缩放比例，用于采样到超大目标
    * RotateV2: 将图片旋转±90°/180°的概率
    * ResizeV2: 图像缩放到固定尺寸，默认为640x640
    * RandomFlipV2: 图片水平翻转的概率
    * PhotoMetricDistortion: 图片光度变化的数据增强，如亮度、对比度等
    * Normalize: 图片归一化，如均值，方差
* **val**: 验证集相关的参数, 略
* **test**: 测试集相关的参数, 略
### 模型结构参数
```python
model = dict(
    type='SCRFD',
    backbone=dict(
        type='ResNetV1e',
        ...),
    neck=dict(
        type='PAFPN',
        ...),
    bbox_head=dict(
        type='SCRFDHead',
        num_kps=4,
        ...)
    )
```
包括backbone, neck, head部分的网络结构信息，一般无需修改，值得注意的是卡证模型检测角点的个数为4，此处`bbox_head.num_kps=4`
## 训练示例代码
通过使用托管在modelscope DatasetHub上的数据集[SyntheticCards](https://modelscope.cn/datasets/shaoxuan/SyntheticCards)进行训练（简便起见，以下示例代码使用迷你数据集，并缩短了训练时长和batch_size，使用单卡做训练）：
```python
import os
import tempfile
from modelscope.msdatasets import MsDataset
from modelscope.metainfo import Trainers
from modelscope.trainers import build_trainer
from modelscope.hub.snapshot_download import snapshot_download

model_id = 'damo/cv_resnet_carddetection_scrfd34gkps'
ms_ds_widerface = MsDataset.load('SyntheticCards_mini', namespace='shaoxuan')  # remove '_mini' for full dataset

data_path = ms_ds_widerface.config_kwargs['split_config']
train_dir = data_path['train']
val_dir = data_path['validation']

def get_name(dir_name):
    names = [i for i in os.listdir(dir_name) if not i.startswith('_')]
    return names[0]

train_root = train_dir + '/' + get_name(train_dir) + '/'
val_root = val_dir + '/' + get_name(val_dir) + '/'
cache_path = snapshot_download(model_id)
tmp_dir = tempfile.TemporaryDirectory().name
if not os.path.exists(tmp_dir):
    os.makedirs(tmp_dir)
    
def _cfg_modify_fn(cfg):
        cfg.checkpoint_config.interval = 1
        cfg.log_config.interval = 10
        cfg.evaluation.interval = 1
        cfg.data.workers_per_gpu = 1
        cfg.data.samples_per_gpu = 2
        return cfg

kwargs = dict(
        cfg_file=os.path.join(cache_path, 'mmcv_scrfd.py'),
        work_dir=tmp_dir,
        train_root=train_root,
        val_root=val_root,
        total_epochs=1,  # run #epochs
        cfg_modify_fn=_cfg_modify_fn)

trainer = build_trainer(name=Trainers.card_detection_scrfd, default_args=kwargs)
trainer.train()
```
- 更多示例(如，多卡训练)请参阅：`tests/trainers/test_card_detection_scrfd_trainer.py`
- 本模型使用8卡v100，使用SGD优化器，lr=0.02，在120/200/240epoch时降低10倍学习率，并在280epoch时产出模型, 其余训练超参数详见`mmcv_scrfd.py`
- 如需使用自己的数据优化模型，请按照如下格式准备标注信息，其中角点顺序为左下、左上、右上、右下，每个角点格式为(x,y,1)
```
# <image_path> image_width image_height
bbox_x1 bbox_y1 bbox_x2 bbox_y2 (<keypoint,3>*4)
...
...
# <image_path> image_width image_height
bbox_x1 bbox_y1 bbox_x2 bbox_y2 (<keypoint,3>*4)
...
...
```