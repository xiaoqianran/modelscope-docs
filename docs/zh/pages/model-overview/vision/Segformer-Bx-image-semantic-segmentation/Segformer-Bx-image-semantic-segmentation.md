<!-- modelscope-docs: Segformer-Bx_image_semantic_segmentation | model-overview/vision/Segformer-Bx-image-semantic-segmentation/Segformer-Bx-image-semantic-segmentation_CN.md -->

# 模型概览

Segformer 是使用了COCO_Stuff164数据训练的语义分割模型。模型中通过使用了Hierarchical Transformer Encoder, Overlapped Patch Merging 和 Lightweight All-MAP Decoder使得进度和速度得到很好的平衡。
整个体系一共有B0到B5共6个版本来平衡进度和速度。原论文为[SegFormer: Simple and Efficient Design for Semantic Segmentation with Transformers在COCO_Stuff164K](https://arxiv.org/pdf/2105.15203.pdf)

论文的摘要信息如下：

```text
我们提出的SegFormer是一种简单、高效而高性能的语义分割模型。他由：
1）一种创新transformer encoder来组成。这个transformer的encoder可以输出多层特征，也不要需要进行positional encoding，从而解决了多分辨率输出的问题。
2） 避免使用了复杂的decoder，而是使用一种简单MLP decoder来融合不同层输出的特征。
我们通过不同计算量的配置（SegFormer-B0到SegFormer-B5）的实验，证明他比过去的方法更好。
```

模型领先性：

	1.精度和速度更好的平衡
	2.相同精度更高速度，相同速度更高精度。

# 模型配置项

模型的超参数控制可以在下载下来的模型文件中找到configuration.json文件，由于文件格式较长，不全部列举出来。下面仅仅展示"model"部分。若希望知道其他细节，请阅读该全量文件：

```text
 "model": {
        "type": "Segformer",
        "pretrained": "https://download.openmmlab.com/mmsegmentation/v0.5/pretrain/segformer/mit_b0_20220624-7e0fe6dd.pth",
        "backbone": {
            "type": "MixVisionTransformer", #文章propose的transformer结构
            "in_channels": 3,
            "embed_dims": 32,
            "num_stages": 4,
            "num_layers": [
                2,
                2,
                2,
                2
            ],
            "num_heads": [
                1,
                2,
                5,
                8
            ],
            "patch_sizes": [
                7,
                3,
                3,
                3
            ],
            "sr_ratios": [
                8,
                4,
                2,
                1
            ],
            "out_indices": {
                "__class__": "tuple",
                "__value__": [
                    0,
                    1,
                    2,
                    3
                ]
            },
            "mlp_ratio": 4,
            "qkv_bias": true,
            "drop_rate": 0.0,
            "attn_drop_rate": 0.0,
            "drop_path_rate": 0.1
        },
        "decode_head": {
            "type": "SegformerHead", #文章propose的decode结构
            "in_channels": [
                32,
                64,
                160,
                256
            ],
            "in_index": [
                0,
                1,
                2,
                3
            ],
            "channels": 256,
            "dropout_ratio": 0.1,
            "num_classes": 172,
            "norm_cfg": {
                "type": "BN",
                "requires_grad": true
            },
            "align_corners": false,
            "loss_decode": {
                "type": "CrossEntropyLoss",
                "use_sigmoid": false,
                "loss_weight": 1.0
            }
        },
        "train_cfg": {},
        "test_cfg": {
            "mode": "whole"
        },
        "__easycv_arch__": {
            "type": "EncoderDecoder"
        }
    },
```

# 模型主体

## 模型类

Segformer模型继承EasyCVBaseModel和EncoderDecoder基类

```py
@MODELS.register_module(
    group_key=Tasks.image_segmentation, module_name=Models.segformer)
class Segformer(EasyCVBaseModel, EncoderDecoder):
      """initialize the model from the `model_dir` path.

        Args:
            model_dir (str): the model path.
        """
    def __init__(self, model_dir=None, *args, **kwargs):
        EasyCVBaseModel.__init__(self, model_dir, args, kwargs)
        EncoderDecoder.__init__(self, *args, **kwargs)
```

### 参数列表   

* **model_dir** (str) – The model_dir to load the pretrained model from. Note that this model_dir must exist in the local file system.

* **kwargs** (`dict`, optional) 

## 模型Forward函数

```py
    def forward(self, img, mode='train', **kwargs):
```
### 参数列表 
* **img** (dict) – 输入数据.
* **mode** (str) – 模型是否为训练状态.

## 模型输出
```py
outputs ={
    "masks":[ 
        第一个目标类别分割图(numpy.ndarray)，第二个目标类别分割图(numpy.ndarray)，...
    ]
    "labels":[
        第一个目标类别名称(str)，第二个目标类别名称(str)...
    ]
    "scores":[
        第一个目标类别分割分数(float)，第二个目标类别分割分数(float)，...
    ]
      
}
```

# Pipeline使用示例

仅以Segformer-B0为例。其他配置依次修改即可
```
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

img = 'https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/image_semantic_segmentation.jpg'
segmentation_pipeline = pipeline(Tasks.image_segmentation, 'damo/cv_segformer-b0_image_semantic-segmentation_coco-stuff164k')
result = segmentation_pipeline(img)

print(f'segmentation output: {result}.')
```

# 模型微调

## 修改参数配置

用户可根据实际情况对参数进行调整，如：1）希望复现结果，可以保持默认参数使用8卡机器进行训练。2）希望简单跑通验证流程，请参考下面的示例代码调整部分参数

## 模型微调示例

注意：本代码和配置仅仅作为示例使用，如果需要复现结果，请结合模型文件中的配置文件，使用8卡并行方式复现

```
import tempfile
import os

from modelscope.metainfo import Trainers
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.pipelines.builder import normalize_model_input

def _train():

    tmp_dir = tempfile.TemporaryDirectory().name
    if not os.path.exists(tmp_dir):
        os.makedirs(tmp_dir)
   
    model = 'damo/cv_segformer-b0_image_semantic-segmentation_coco-stuff164k'
    checkpoint_path = os.path.join(normalize_model_input(model,'master'), 'pytorch_model.pt')
    print(checkpoint_path)
    #注意：本代码和配置仅仅作为示例使用，如果需要复现结果，请结合模型文件中的配置文件，使用8卡并行方式复现

    cfg_options = {
        'train.max_epochs': 31,
        'model.decode_head.norm_cfg.type': 'BN',
        'train.optimizer.lr' : 0,
        'train.lr_scheduler.warmup_ratio':1e-60,
    }

    trainer_name = Trainers.easycv
    train_dataset = MsDataset.load(
        dataset_name='coco_stuff164k',
        namespace='damo',
        split='train')
    eval_dataset = MsDataset.load(
        dataset_name='coco_stuff164k',
        namespace='damo',
        split='validation')
    kwargs = dict(
        model=model,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        work_dir=tmp_dir,
        cfg_options=cfg_options)

    trainer = build_trainer(trainer_name, kwargs)
    trainer.train(checkpoint_path=checkpoint_path)

if __name__ == '__main__':
    _train()
```

## 数据评估及结果


评估指标：mIoU

Semantic segmentation models trained on **CoCo_stuff164k** val集合上的性能如下.

| Algorithm  |  Params<br/>(backbone/total)                            | inference time(V100)<br/>(ms/img)                    |mIoU |
| ---------- |  ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| SegFormer_B0 | 3.3M/3.8M | 47.2ms |  35.91               |
| SegFormer_B1 | 13.2M/13.7M | 46.6ms |  40.53               |
| SegFormer_B2 | 24.2M/27.5M | 49.1ms |  44.53               |
| SegFormer_B3 | 44.1M/47.4M | 52.3ms |  45.49               |
| SegFormer_B4 | 60.8M/64.1M | 58.5ms |  46.27               |
| SegFormer_B5 | 81M/85M | 99.2ms |  46.75               |


# 论文引用
如果你觉得这个该模型对有所帮助，请考虑引用下面的相关的论文：
``` bibtex
@article{xie2021segformer,
  title={SegFormer: Simple and efficient design for semantic segmentation with transformers},
  author={Xie, Enze and Wang, Wenhai and Yu, Zhiding and Anandkumar, Anima and Alvarez, Jose M and Luo, Ping},
  journal={Advances in Neural Information Processing Systems},
  volume={34},
  pages={12077--12090},
  year={2021}
}
```

