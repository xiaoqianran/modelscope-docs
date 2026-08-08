<!-- modelscope-docs: LaMa-image-inpainting | model-overview/vision/LaMa-image-inpainting/LaMa-image-inpainting_CN.md -->

# 模型概览

LaMa 采用 FFT卷积 + 普通卷积 的方式进行模型结构的搭建，可以更有效地感知图片的整体数据分布，从而推理出更加真实的填充内容；此外，LaMa可以在任意高分辨率图像下进行推理，得到清晰真实的图像补全效果图。
详见论文 [Resolution-robust Large Mask Inpainting with Fourier Convolutions](https://arxiv.org/abs/2109.07161)。

论文的摘要信息如下：

```text
现代图像修补系统，尽管取得了显著的进步，但经常与大的缺失区域、复杂的几何结构和高分辨率图像作斗争。作者发现，造成这种现象的一个主要原因是在嵌入网络和损失函数中都缺乏有效的接受域。为了缓解这一问题，作者提出了一种新的方法称为大掩模inpainting (LaMa)。LaMa是基于i)一种新的嵌入网络结构，它使用快速傅立叶卷积(FFCs)，具有全图像的接受域; ii)高感受野知觉损失; iii)大的训练面具，它释放了前两个组成部分的潜力。作者提出的inpainting网络在一系列数据集上提高了inpainting的性能，即使在具有挑战性的场景下也能取得优异的性能，例如完成周期结构。该模型的泛化效果十分出色，比训练时见到的分辨率更高，并以比竞争基线更低的参数和时间成本实现这一目标。
```

模型领先性：

	1.	LaMa旨在提出更加通用的图像inpainting方案，释放训练测试图片分辨率大小的彼此依赖性，为任意高分辨率的恢复提供可能；
	2.	LaMa在常用的图像inpainting benchmark上均取得过SOTA的效果。

# 模型训练配置项

LaMa模型的训练超参数控制可以在下载下来的模型文件中找到config.json文件，该文件种可配置的参数的一般格式如下：

```text
"dataset":{
    "type": "ImageInpaintingDataset",
    "name": "PlacesToyDataset",
    "mask_gen_kwargs":{
       "irregular_proba": 1,
       "irregular_kwargs":{
         "max_angle": 4,
         "max_len": 200,
         "max_width": 100,
         "max_times": 5,
         "min_times": 1
        },
       "box_proba": 1,
       "box_kwargs":{
         "margin": 10,
         "bbox_min_size": 30,
         "bbox_max_size": 150,
         "max_times": 3,
         "min_times": 1
       }
    },
    "train_out_size": 256,
    "val_out_size": 512
}
```

## 参数列表

    
* **irregular_proba** (`float`, optional, defaults to 1/3) – 无规则形状mask生成概率。


* **irregular_kwargs** (`dict`, optional, defaults to None) – 无规则形状mask生成控制参数dict。

** **max_angle** (`int`, optional, defaults to 4) – 最大旋转角度。

** **max_len** (`int`, optional, defaults to 60) – 最大mask长度。

** **max_width** (`int`, optional, defaults to 20) – 最大mask宽度。

** **max_times** (`int`, optional, defaults to 10) – 最大生成次数。

** **min_times** (`int`, optional, defaults to 0) – 最小生成次数。


* **box_proba** (`float`, optional, defaults to 1/3) – 矩形mask生成概率。


* **box_kwargs** (`dict`, optional, defaults to None) – 矩形mask生成控制参数dict。

** **margin** (`int`, optional, defaults to 10) – 距离边界最小距离。

** **bbox_min_size** (`int`, optional, defaults to 30) – 矩形框最小尺寸。

** **bbox_max_size** (`int`, optional, defaults to 100) – 矩形框最大尺寸。

** **min_times** (`int`, optional, defaults to 0) – 最小重复生成次数。

** **max_times** (`int`, optional, defaults to 3) – 最大重复生成次数。

当用户在推理中使用LaMa的模型时，这些参数一般都是固定的。您可以使用Model类直接拉起模型：
```python
from modelscope.models.cv.image_inpainting import FFTInpainting
model = FFTInpainting('damo/cv_fft_inpainting_lama')
```
也可以自定义修改config后再拉起

## 训练方式

### 源码安装的modelscope：

```python
python -m unittest tests/trainers/test_image_inpainting_trainer.py
```
可以参考示例代码 test_image_inpainting_trainer.py 进行自定义修改

### pip install安装的modelscope:

```python
import os
import shutil
import tempfile
import unittest

from modelscope.hub.snapshot_download import snapshot_download
from modelscope.metainfo import Trainers
from modelscope.models.cv.image_inpainting import FFTInpainting
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.utils.config import Config, ConfigDict
from modelscope.utils.constant import ModelFile
from modelscope.utils.test_utils import test_level



model_id = 'damo/cv_fft_inpainting_lama'
cache_path = snapshot_download(model_id)
cfg = Config.from_file(
    os.path.join(cache_path, ModelFile.CONFIGURATION))

train_data_cfg = ConfigDict(
    name='PlacesToydataset',
    split='train',
    mask_gen_kwargs=cfg.dataset.mask_gen_kwargs,
    out_size=cfg.dataset.train_out_size,
    test_mode=False)

test_data_cfg = ConfigDict(
    name='PlacesToydataset',
    split='test',
    mask_gen_kwargs=cfg.dataset.mask_gen_kwargs,
    out_size=cfg.dataset.val_out_size,
    test_mode=True)

train_dataset = MsDataset.load(
    dataset_name=train_data_cfg.name,
    split=train_data_cfg.split,
    mask_gen_kwargs=train_data_cfg.mask_gen_kwargs,
    out_size=train_data_cfg.out_size,
    test_mode=train_data_cfg.test_mode)
assert next(
    iter(train_dataset.config_kwargs['split_config'].values()))

test_dataset = MsDataset.load(
    dataset_name=test_data_cfg.name,
    split=test_data_cfg.split,
    mask_gen_kwargs=test_data_cfg.mask_gen_kwargs,
    out_size=test_data_cfg.out_size,
    test_mode=test_data_cfg.test_mode)
assert next(
    iter(test_dataset.config_kwargs['split_config'].values()))

kwargs = dict(
    model=model_id,
    train_dataset=train_dataset,
    eval_dataset=test_dataset)

trainer = build_trainer(
    name=Trainers.image_inpainting, default_args=kwargs)
trainer.train()

```

# 模型推理

* 普通推理

```python
import cv2
from modelscope.outputs import OutputKeys
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

input_location = 'https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/image_inpainting/image_inpainting.png'
input_mask_location = 'https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/image_inpainting/image_inpainting_mask.png'
input = {
        'img':input_location,
        'mask':input_mask_location,
}

inpainting = pipeline(Tasks.image_inpainting, model='damo/cv_fft_inpainting_lama')
result = inpainting(input)
vis_img = result[OutputKeys.OUTPUT_IMG]
cv2.imwrite('result.png', vis_img)
```

* 精细推理

可对高分辨率图像(~2k)进行精细的图像填充，修复等，获得更加逼真的修复图片。
```python
import cv2
from modelscope.outputs import OutputKeys
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

input_location = 'https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/image_inpainting/image_inpainting.png'
input_mask_location = 'https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/image_inpainting/image_inpainting_mask.png'
input = {
        'img':input_location,
        'mask':input_mask_location,
}

inpainting = pipeline(Tasks.image_inpainting, model='damo/cv_fft_inpainting_lama', refine=True)
result = inpainting(input)
vis_img = result[OutputKeys.OUTPUT_IMG]
cv2.imwrite('result.png', vis_img)
```
