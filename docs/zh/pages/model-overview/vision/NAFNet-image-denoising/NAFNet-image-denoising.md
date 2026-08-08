<!-- modelscope-docs: NAFNet-image-denoising | model-overview/vision/NAFNet-image-denoising/NAFNet-image-denoising_CN.md -->

# 模型概览
NAFNet是用于图像恢复的无激活函数的网络。详见论文[Simple Baselines for Image Restoration](https://www.ecva.net/papers/eccv_2022/papers_ECCV/papers/136670017.pdf) 。

论文的摘要信息如下：
```text
尽管近年来图像恢复领域取得了重大进展，但最先进方法的系统复杂性也在增加，这可能会阻碍方法的方便分析和比较。
在本文中，我们提出了一个简单的基线，它超越了最先进方法，并且计算效率高。为了进一步简化基线，我们发现非线
性激活函数（例如Sigmoid、ReLU、GELU、Softmax等）不是必要的：它们可以用乘法代替或直接删除。因此，我们
从基线推导出一个非线性无激活网络，即NAFNet。在各种具有挑战性的基准上实现了SOTA，例如GoPro数据集上的
PSNR为33.69 dB（用于图像图模糊），超出之前SOTA 0.38 dB，且计算成本仅为其的8.4%；SIDD数据集上的PSNR
为40.30dB（用于图像去噪），超出之前SOTA 0.28 dB，计算成本不到其的一半。 
```

模型领先性：
```text
1. 以更低的计算代价达到超越之前SOTA方法的性能
2. 不需要激活函数，简化了网络但性能依然可以匹敌或者超越基线
```

# 模型配置项
NAFNet的模型超参数可以在下载下来的模型文件中找到configuration.json文件，该文件一般格式如下：
```text
{
    "type": "nafnet",
    "network_g": {
        "img_channel": 3,
        "width": 32,
        "middle_blk_num": 12,
        "enc_blk_nums": [2, 2, 4, 8],
        "dec_blk_nums": [2, 2, 2, 2]
    }
}
```
## 参数列表
* **img_channel** (`int`, optional, defaults to `3`) – 图像的通道数，一般为RGB三通道图像。
* **width** (`int`, optional, defaults to `32`) – 初始提取到的特征维度。
* **middle_blk_num** (`int`, optional, defaults to `12`) – 中间阶段的NAFBlock数量。
* **enc_blk_nums** (`List[int]`, optional, defaults to `[2, 2, 4, 8]`) – 编码阶段的NAFBlock数量。
* **dec_blk_nums** (`List[int]`, optional, defaults to `[2, 2, 2, 2]`) – 解码阶段的NAFBlock数量。

当用户在推理中使用NAFNet时，这些参数一般都是固定的。您可以使用Model类直接调用模型：
```python
from modelscope.models import Model
model = Model.from_pretrained('damo/cv_nafnet_image-denoise_sidd')
```

也可以使用pipeline完成一次推理，来查看模型效果。
```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.outputs import OutputKeys
import cv2

img = 'https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/noisy-demo-0.png'
image_denoise_pipeline = pipeline(Tasks.image_denoising, 'damo/cv_nafnet_image-denoise_sidd')
result = image_denoise_pipeline(img)[OutputKeys.OUTPUT_IMG]
cv2.imwrite('result.png', result)
```


# 训练配置项
NAFNet的训练超参数可以在下载下来的模型文件中找到configuration.json文件，该文件一般格式如下：
```text
{
    "dataloader": {
        "batch_size_per_gpu": 4,
        "workers_per_gpu": 4,
        "shuffle": true
    },
    "optimizer": {
        "type": "AdamW",
        "lr": 1e-3,
        "weight_decay": 0,
        "betas": [0.9, 0.9]
    },
    "lr_scheduler": {
        "type": "CosineAnnealingLR",
        "T_max": 956,
        "eta_min": 1e-7
    },
    "max_epochs": 956,
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
}
```
## 参数列表
dataloader
* **batch_size_per_gpu** (`int`, optional, defaults to `4`) – 每个GPU上的批次大小
* **workers_per_gpu** (`int`, optional, defaults to `4`) – 每个GPU加载数据的进程数
* **shuffle** (`bool`, optional, defaults to `true`) – 打乱数据

optimizer
* **type** (`str`, optional, defaults to `Adam`) – 优化器类型
* **lr** (`float`, optional, defaults to `1e-3`) – 初始学习率
* **weight_decay** (`float`, optional, defaults to `0`) – 网络权重衰减
* **betas** (`List[float]`, optional, defaults to `[0.9, 0.9]`) – 优化器的超参数

lr_scheduler
* **type** (`str`, optional, defaults to `CosineAnnealingLR`) – 学习率策略
* **T_max** (`int`, optional, defaults to `956`) – 最大迭代次数
* **eta_min** (`float`, optional, defaults to `1e-7`) – 最小学习率

## 模型训练
NAFNet的训练可以使用ModelScope提供的trainer来进行。下面的代码展示了一个完整的模型训练过程：
```python
import os
import tempfile

from modelscope.hub.snapshot_download import snapshot_download
from modelscope.msdatasets import MsDataset
from modelscope.msdatasets.task_datasets.sidd_image_denoising import \
    SiddImageDenoisingDataset
from modelscope.trainers import build_trainer
from modelscope.utils.config import Config
from modelscope.utils.constant import DownloadMode, ModelFile

tmp_dir = tempfile.TemporaryDirectory().name
if not os.path.exists(tmp_dir):
    os.makedirs(tmp_dir)
model_id = 'damo/cv_nafnet_image-denoise_sidd'
cache_path = snapshot_download(model_id)
config = Config.from_file(
    os.path.join(cache_path, ModelFile.CONFIGURATION))

dataset_train = MsDataset.load(
    'SIDD',
    namespace='huizheng',
    subset_name='crops',
    split='train',
    download_mode=DownloadMode.REUSE_DATASET_IF_EXISTS)._hf_ds
dataset_val = MsDataset.load(
    'SIDD',
    namespace='huizheng',
    subset_name='default',
    split='validation',
    download_mode=DownloadMode.REUSE_DATASET_IF_EXISTS)._hf_ds

dataset_train = SiddImageDenoisingDataset(
            dataset_train, config.dataset, is_train=True)
dataset_val = SiddImageDenoisingDataset(
    dataset_val, config.dataset, is_train=False)

kwargs = dict(
    model=model_id,
    train_dataset=dataset_train,
    eval_dataset=dataset_val,
    work_dir=tmp_dir)
trainer = build_trainer(default_args=kwargs)
trainer.train()
```
数据加载采用的是modelscope托管的SIDD数据集，可在 https://modelscope.cn/datasets/huizheng/SIDD/dataPeview 预览数据。

| 子数据集    |        train |       validation |            test |
|---------|-------------:|-----------------:|----------------:|
| default |   原始SIDD训练数据 | SIDD+ validation | SIDD validation |
| crops   | 裁剪后的SIDD训练数据 |                / |               / |

## 模型验证
NAFNet的验证可以使用ModelScope提供的trainer来进行。下面的代码展示了一个完整的模型验证过程：


| name | Dataset | PSNR | SSIM |
|:---- |:----    |:---- |:----|
|NAFNet-SIDD-width32|SIDD_val|39.9672|0.9599|
|NAFNet-SIDD-width32|SIDD+_val|36.0885|0.9078|



```python
import os
import tempfile

from modelscope.hub.snapshot_download import snapshot_download
from modelscope.utils.config import Config
from modelscope.utils.constant import DownloadMode, ModelFile
from modelscope.trainers import build_trainer
from modelscope.msdatasets import MsDataset
from modelscope.msdatasets.task_datasets.sidd_image_denoising import \
    SiddImageDenoisingDataset

tmp_dir = tempfile.TemporaryDirectory().name
if not os.path.exists(tmp_dir):
    os.makedirs(tmp_dir)
model_id = 'damo/cv_nafnet_image-denoise_sidd'
cache_path = snapshot_download(model_id)
config = Config.from_file(
    os.path.join(cache_path, ModelFile.CONFIGURATION))
dataset_val = MsDataset.load(
    'SIDD',
    namespace='huizheng',
    subset_name='default',
    split='test',
    download_mode=DownloadMode.REUSE_DATASET_IF_EXISTS)._hf_ds
eval_dataset = SiddImageDenoisingDataset(
            dataset_val, config.dataset, is_train=False)
kwargs = dict(
    model=model_id,
    train_dataset=None,
    eval_dataset=eval_dataset,
    work_dir=tmp_dir)
trainer = build_trainer(default_args=kwargs)
metric_values = trainer.evaluate()
print(metric_values)

```
