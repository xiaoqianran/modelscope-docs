<!-- modelscope-docs: pgl_video_summatization | model-overview/vision/video-summarization/pgl-video-summatization/pgl-video-summatization_CN.md -->

# 模型概览

PGL Video Summarization是使用TVSum数据集训练的视频摘要模型。在模型中使用了全局和局部的attention机制来更好的建模视频的时序信息。
论文见[Combining Global and Local Attention with Positional Encoding for Video Summarization](https://www.iti.gr/~bmezaris/publications/ism2021a_preprint.pdf)

论文的摘要信息如下：

```text
本文提出了一种新的有监督的视频摘要方法。为了克服现有基于RNN的摘要架构的弊端（对长序列的依赖）和为了使训练过程并行化，我们所开发的模型依赖于使用自我注意机制来估计视频帧的重要性。
与以前通过观察整个帧序列来建模帧依赖关系的基于注意力的摘要方法相反，我们的方法结合全局和局部多头注意力机制发现视频帧依赖的不同模型不同级别的粒度。
此外，对注意力机制的使用集成了一个对视频帧的时间位置进行编码的组件-这在制作视频摘要的时候是非常重要的。
在两个数据集上进行的实验（SumMe 和 TVSum）证明了与现有的基于注意力的方法相比，本文提出的模型有较高的先进性。
消融实验使用全局和局部多头注意力机制与绝对位置编码组件显示了它们对整体摘要性能的贡献。
```

模型领先性：

	1.PGL Video Summarization通过全局和局部的多头注意力机制对视频的时序信息建模，来融合不同粒度的模型信息。
	2.在两个数据集上进行的实验（SumMe 和 TVSum）证明了与现有的基于注意力的方法相比，本文提出的模型有较高的先进性。

# 模型配置项

PGL Video Summarization模型的超参数控制可以在下载下来的模型文件中找到config.json文件，该文件一般格式如下：

```text
{
    "framework": "pytorch",
    "task": "video-summarization",
    "pipeline": {
        "type": "googlenet_pgl_video_summarization"
    },
    "base_model": {
        "type": "bvlc_googlenet"                                        #使用googlenet提取视频帧的特征
    },
    "model": {
        "type": "pgl-video-summarization"                               #模型主体
    },
    "dataset": {
        "name": "tvsum",                                                #tvsum数据集
        "type": "VideoSummarizationDataset",
        "dataset_file": "data/eccv16_dataset_tvsum_google_pool5.h5",    #googlenet提取到的特征
        "split_file": "data/tvsum_splits.json",                         #训练集和测试集定义
        "split_index": 0                                                #第0个训练集和测试集
    },
    "preprocessor": {
        "type": "video-summarization-preprocessor"
    },
    "train": {
        "dataloader": {
            "batch_size_per_gpu": 1,                                    #每个batch的大小
            "workers_per_gpu": 1                                        #每个gpu处理数据的线程数
        },
        "optimizer": {
            "type": "SGD",
            "lr": 5e-5,                                                 #学习率
            "options": {
                "grad_clip": {
                    "max_norm": 32.0                                    #梯度裁剪
                }
            }
        },
        "lr_scheduler": {
            "type": "StepLR",
            "step_size": 2,                                             #学习率的调整方式
            "options": {
                "warmup": {
                    "type": "LinearWarmup",
                    "warmup_iters": 2                                   #预热的轮数

                }
            }
        },
        "max_epochs": 3,                                                #总的训练轮数
        "hooks":
            [
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
    "evaluation": {                                                 #训练过程中的测试
        "dataloader": {
            "batch_size_per_gpu": 1,
            "workers_per_gpu": 1,
            "shuffle": false
        },
        "metrics": ["video-summarization-metric"]                   #测试指标 F1-Score
    }
}
```

# 模型主体

## 模型类

PGLVideoSummarization模型继承TorchModel基类

```py
@MODELS.register_module(
    Tasks.video_summarization, module_name=Models.video_summarization)
class modelscope.models.cv.PGLVideoSummarization(TorchModel):

    def __init__(self, model_dir: str, *args, **kwargs):
        """initialize the video summarization model from the `model_dir` path.

        Args:
            model_dir (str): the model path.
        """
        super().__init__(model_dir, *args, **kwargs)

        model_path = os.path.join(model_dir, ModelFile.TORCH_MODEL_FILE)

        self.loss = nn.MSELoss()
        self.model = PGL_SUM(
            input_size=1024,
            output_size=1024,
            num_segments=4,
            heads=8,
            fusion='add',
            pos_enc='absolute')
```

### 参数列表   

* **model_dir** (str) – The model_dir to load the pretrained model from. Note that this model_dir must exist in the local file system.

* **kwargs** (`dict`, optional) 

PGL_SUM定义了基本模型
```py
class PGL_SUM(nn.Module):

    def __init__(self,
                 input_size=1024,
                 output_size=1024,
                 freq=10000,
                 pos_enc=None,
                 num_segments=None,
                 heads=1,
                 fusion=None):
        """ Class wrapping the PGL-SUM model; its key modules and parameters.

        :param int input_size: The expected input feature size.
        :param int output_size: The hidden feature size of the attention mechanisms.
        :param int freq: The frequency of the sinusoidal positional encoding.
        :param None | str pos_enc: The selected positional encoding [absolute, relative].
        :param None | int num_segments: The selected number of segments to split the videos.
        :param int heads: The selected number of global heads.
        :param None | str fusion: The selected type of feature fusion.
        """
```
### 参数列表   

* **input_size** (int) – The expected input feature size.
* **output_size** (int) – The hidden feature size of the attention mechanisms.
* **freq** (int) – The frequency of the sinusoidal positional encoding.
* **pos_enc** (str) – The selected positional encoding [absolute, relative].
* **num_segments** (int) – The selected number of segments to split the videos.
* **heads** (int) – The selected number of global heads.
* **fusion** (str) – The selected type of feature fusion.

## 模型Forward函数

```py
    def forward(self, input: Dict[str, Tensor]) -> Dict[str, Union[list, Tensor]]:
```
### 参数列表 
* **input** (dict) – input data.
```py
    frame_features = input['frame_features']
    gtscore = input['gtscore']
```

## 模型输出
```py
outputs ={
    "output":[
        {#摘要的第0个片段
            "frame":[0,14], #起止帧号
            "timestamps":["00:00:00.000", "00:00:00.252"], #起止时间
        },
        {#摘要的第1个片段
            "frame":[105, 134], #起止帧号
            "timestamps":["00:00:01.891", "00:00:02.413"], #起止时间
        },
    ]
}
```

# Pipeline使用示例

```
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

video_path = 'https://modelscope.oss-cn-beijing.aliyuncs.com/test/videos/video_category_test_video.mp4'
summarization_pipeline = pipeline(Tasks.video_summarization, model='damo/cv_googlenet_pgl-video-summarization')
result = summarization_pipeline(video_path)
print(f'video summarization output: {result}.')
```

# 模型微调

## 修改参数配置

用户可根据实际情况对如下参数进行调整，其他参数可保持默认值
```
{
   "train": {
        "dataloader": {
            "batch_size_per_gpu": 1,                                    #每个batch的大小
            "workers_per_gpu": 1                                        #每个gpu处理数据的线程数
        },
        "optimizer": {
            "type": "SGD",
            "lr": 5e-5,                                                 #学习率
            "options": {
                "grad_clip": {
                    "max_norm": 32.0                                    #梯度裁剪
                }
            }
        },
        "lr_scheduler": {
            "type": "StepLR",
            "step_size": 2,                                             #学习率的调整方式
            "options": {
                "warmup": {
                    "type": "LinearWarmup",
                    "warmup_iters": 2                                   #预热的轮数

                }
            }
        },
        "max_epochs": 3,                                                #总的训练轮数
}
```
## 模型微调示例

```
import os
import shutil
import tempfile
import unittest

from modelscope.hub.snapshot_download import snapshot_download
from modelscope.models.cv.video_summarization import PGLVideoSummarization
from modelscope.msdatasets.task_datasets import VideoSummarizationDataset
from modelscope.trainers import build_trainer
from modelscope.utils.config import Config
from modelscope.utils.constant import ModelFile
from modelscope.utils.logger import get_logger
from modelscope.utils.test_utils import test_level

tmp_dir = tempfile.TemporaryDirectory().name
if not os.path.exists(tmp_dir):
    os.makedirs(tmp_dir)

model_id = 'damo/cv_googlenet_pgl-video-summarization'
cache_path = snapshot_download(model_id)
config = Config.from_file(os.path.join(cache_path, ModelFile.CONFIGURATION))
dataset_train = VideoSummarizationDataset('train', config.dataset, cache_path)
dataset_val = VideoSummarizationDataset('test', config.dataset, cache_path)

kwargs = dict(
    model=model_id,
    train_dataset=dataset_train,
    eval_dataset=dataset_val,
    work_dir=tmp_dir)
trainer = build_trainer(default_args=kwargs)
trainer.train()
results_files = os.listdir(tmp_dir)
```

## 数据评估及结果

以上模型训练流程中已包含了测试集的评估，训练过程中能够直接看到测试集的评估指标

评估指标：F-Score

|   数据集   | TVSum |
|:-------:| :----: |
| PGL-SUM | 61.0 |

# 论文引用
如果你觉得这个该模型对有所帮助，请考虑引用下面的相关的论文：
``` bibtex
@INPROCEEDINGS{9666088,
    author    = {Apostolidis, Evlampios and Balaouras, Georgios and Mezaris, Vasileios and Patras, Ioannis},
    title     = {Combining Global and Local Attention with Positional Encoding for Video Summarization},
    booktitle = {2021 IEEE International Symposium on Multimedia (ISM)},
    month     = {December},
    year      = {2021},
    pages     = {226-234}
}
```

