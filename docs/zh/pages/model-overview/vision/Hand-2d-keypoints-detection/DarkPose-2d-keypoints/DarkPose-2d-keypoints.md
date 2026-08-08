<!-- modelscope-docs: DarkPose_2d_keypoints | model-overview/vision/Hand-2d-keypoints-detection/DarkPose-2d-keypoints/DarkPose-2d-keypoints_CN.md -->

# 模型概览

基于heatmap的关键点检测方法一般存在一个分辨率变化的编码-解码过程，即原始图片分辨率较大，需要先缩小后才能输入模型进行预测，得到预测结果后再还原到输入图片的原始分辨率，再得到预测坐标。这个过程可能会引入一些误差：

- 编码过程：下采样后，渲染得到的高斯热图可能存在误差；
- 解码过程：预测的heatmap在还原到原始分辨率后，得到的坐标也可能存在量化误差；

本文假设预测的heatmap是满足二维高斯分布的，因此基于heatmap的一阶导数和二阶导数来计算偏移方向。但在实验中发现，预测的heatmap并不严格遵守高斯分布，可能会出现多峰的情况，因此增加了一个步骤，对预测的heatmap进行平滑处理，使结果符合假设，从而保证解码效果的准确性。相关论文也被 CVPR 2020接受，
详见论文 [Distribution-aware coordinate representation for human pose estimation](https://arxiv.org/abs/1910.06278)。

# 论文的摘要信息

```text
虽然热图（heatmap）是人体姿势估计的实际标准坐标表示，但尚未深入研究。这项工作填补了这个空白。
本文发现将预测的热图解码为原始图像空间中的最终关节坐标的过程对于性能的重要性出人意料。本文进一步探讨了标准坐标解码方法的设计局限性，提出了一种更具原则性的分布感知解码方法
此外，通过生成无偏/精确的热图来改进标准坐标编码过程（即将GT坐标转换为热图）将两者结合起来，提出了一种新的分布感知的关键点坐标表示Distribution-Aware coordinate Representation of Keypoints (DARK) 方法。
作为一个与模型无关的插件，DARK为现有的人体姿势估计模型带来了显著的性能提升。
此外，DARK在2019年ICCV COCO关键点挑战赛中获得第二名。
```

# 模型领先性

	1.发现坐标表示在人体姿态估计中的重要性，并提出了一种新的分布感知的关键点坐标表示 DARK；
	2.DARK 的解码方式可以在不需要重新训练的情况下，提高现有方法的推理准确率;
    3.在2019年ICCV COCO关键点挑战赛中获得第二名。


# 模型配置项

`DARK` 模型的超参数控制可以在下载下来的模型文件中找到configuration.json文件，该文件一般格式如下：

```json
{
    "task": "hand-2d-keypoints",
    "framework": "pytorch",
    "preprocessor": {},
    "model": {
        "type": "HRNet-Hand2D-Keypoints",
        "pretrained": false,
        "backbone": {
            "type": "HRNet",                    // backbone 采用HRNet结构
            ...
        },
        "keypoint_head": {
            "type": "TopdownHeatmapSimpleHead", // head 即DarkPose的实现
            "in_channels": [18, 36, 72, 144],
            ...
        },
        "__easycv_arch__": {
            "type": "TopDown"                       // 模型架构名称
        }
    },
    "dataset": {
        "train": {                                  // 训练集
            "type": "HandCocoWholeBodyDataset",
            "data_source": {
                "ann_file": "data/coco/annotations/coco_wholebody_train_v1.0.json",
                "img_prefix": "data/coco/train2017/",
                "type": "HandCocoPoseTopDownSource",
                "data_cfg": {
                    "image_size": [                 // 输入图片归一化大小
                        256,
                        256
                    ],
                    "heatmap_size": [
                        64,
                        64
                    ],                    
                }
            },
            "pipeline": [{                          // 训练集的数据处理流程
                    "type": "TopDownRandomFlip",             // 随机翻转
                },
                {
                    "type": "TopDownGetRandomScaleRotation", // 随机旋转和缩放。
                },
                {
                    "type": "TopDownAffine"                 // 进行仿射变换
                },
                {
                    "type": "MMToTensor"
                },
                {
                    "type": "NormalizeTensor",              // 归一化
                },
                {
                    "type": "TopDownGenerateTarget",        // 根据标签，生成 GT 热度图
                    "sigma": 3
                },
                {
                    "type": "PoseCollect",                  // 输出处理后的数据
                }
            ]
        },
        "val": {                                            // 验证集，操作过程和训练集类似
            ...
        }
    },
    "train": {                                              // 训练策略
        "work_dir": null,
        "max_epochs": 210,                                  // 最大迭代轮次
        "dataloader": {
            "batch_size_per_gpu": 32,                       // batch size
            "workers_per_gpu": 2                            // 加载数据集的线程数量
        },
        "optimizer": {
            "type": "Adam",                                 // 优化器类型
            "lr": 0.0005,                                   // 初始学习率
            "options": {
                "grad_clip": null
            }
        },
        "lr_scheduler": {                                   // 学习率变化策略和 warmup 参数
            "policy": "step",
            "warmup": "linear",
            "warmup_iters": 500,
            "warmup_ratio": 0.001,
            "step": [
                170,
                200
            ]
        }
    },
    "evaluation": {
        "metrics": {
            "type": "EasyCVMetric",                     // 验证集评估方法和评测指标
            "evaluators": [{
                "type": "KeyPointEvaluator",
                "metric_names": [
                    "PCK",
                    "AUC",
                    "EPE",
                    "NME"
                ],
                "pck_thr": 0.2,                         // PCK 指标的阈值
                "auc_nor": 30
            }]
        }
    },
    "pipeline": {
        "type": "hrnetv2w18_hand-2d-keypoints_image",   // maaslib 模型推理pipeline名称
        "predictor_config": {
            "type": "HandKeypointsPredictor"
        }
    },
    "DETECTION": {
        "type": "DetectionPredictor",                   // 手部检测器（手部关键点检测一般包括手部检测和关键点检测两个步骤）
        "model_path": "detection/detection_model.pth",
        "config_file": "detection/config.py",
        "score_threshold": 0.5
    }
}
```
在预训练模型中，这些配置只是模型全部配置中的一部分。

# 模型主体
## 模型类
`TopDown` 模型在EasyCV中基于`BaseModel`基类。

```python
class TopDown(BaseModel):
    """Top-down pose detectors.

    Args:
        backbone (dict): Backbone modules to extract feature.
        keypoint_head (dict): Keypoint head to process feature.
        train_cfg (dict): Config for training. Default: None.
        test_cfg (dict): Config for testing. Default: None.
        pretrained (str): Path to the pretrained models.
        loss_pose (None): Deprecated arguments. Please use
            `loss_keypoint` for heads instead.
    """

    def __init__(self,
                 backbone,
                 neck=None,
                 keypoint_head=None,
                 train_cfg=None,
                 test_cfg=None,
                 pretrained=None,
                 loss_pose=None):
        super().__init__()
```
参数列表"
- backbone: 模型骨架
- keypoint_head: 模型的head类型，就是配置文件中的 `TopdownHeatmapSimpleHead`
- train_cfg: 训练参数
- test_cfg: 评测参数
- pretrained: 预训练模型路径

## 模型pipeline推理
基于配置文件中的`HandKeypointsPredictor`实现，该predictor是在EasyCV中的定义的。MaaSLib的pipeline会调用EasyCV的pipeline，也就是在easyCV的pipeline内部调用`HandKeypointsPredictor`实现前向推理。

### HandKeypointsPredictor 实现

手部2D关键点的推理包含两部分

- 手部检测
- 手部关键点

所以Predictor同样需要两个模型进行串联。实现了通用的目标检测预测器`DetectionPredictor`，与手部关键点预测器`HandKeypointsPredictor`。

因需要先检测手部，所以`HandKeypointsPredictor`多一个参数`detection_predictor_config`即`DetectionPredictor`的配置参数。
之后重写 `HandKeypointsPredictor` 的`_load_input()`函数，输入是手部检测器D`etectionPredictor`的输出

```json
{
    "inputs": image path,
    "results": {
        "detection_boxes": B*ndarray(N*4),		# B是batch大小，N是此图预测多少个手
        "detection_scores": B*ndarray(N,),
        "detection_classes": B*ndarray(N,)
    }
}
```

`_load_input()`将手部检测结果转化为手部关键点需要的输入形式：

```json
{
    "image_file":image_path,
    "img": img,
    "image_id": batch_index,
    "center": center,
    "scale": scale,
    "bbox_score": score,
    "bbox_id": box_id,  // need to be assigned if batch_size > 1
    "dataset": "coco_wholebody_hand",
    "joints_3d": np.zeros((self.cfg.data_cfg.num_joints, 3), dtype=np.float32),
    "joints_3d_visible": np.zeros((self.cfg.data_cfg.num_joints, 3), dtype=np.float32),
    "rotation": 0,
    "flip_pairs": self.dataset_info.flip_pairs,
    "ann_info": {
        "image_size": np.array(self.cfg.data_cfg["image_size"]),
        "num_joints": self.cfg.data_cfg["num_joints"]
    }
}
```

重写`preprocess_single()/preprocess()/__call__()`，主要就是转化Batch和添加`DetectionPredictor`的运行。


### Maas-lib config 中手部检测器的设置

接入MaaSLib主要是将`configuration.json`的内容作为Predictor的初始化解析内容。为了解析`detection_predictor_config`，在`configuration.json`中新增了DETECTION的key。
```json
"DETECTION": {
    "type": "DetectionPredictor",
    "model_path": "detection/detection_model.pth",
    "config_file": "detection/config.py",
    "score_threshold": 0.5
}
```
在MaaSLib中重写`_build_predict_op()`，此步的目的就是解析`configuration.json`的手部检测器DETECTION，将参数增加根目标路径(model_dir) 前缀并合并到cfg.pipeline.predictor_config里面。

## 模型输出
```json
{
    "keypoints": [               // 2D手部关键点坐标，一个有21个关键点
                    [[x, y, score] * 21],
                    [[x, y, score] * 21],
                    [[x, y, score] * 21],
                    ],
    "boxes": [                   // 每个手的检测框坐标
                [x1, y1, x2, y2],
                [x1, y1, x2, y2],
                [x1, y1, x2, y2],
            ]
}

```

# Pipeline使用示例

```python
import cv2
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.outputs import OutputKeys

model_id = 'damo/cv_hrnetw18_hand-pose-keypoints_coco-wholebody'
hand_2d_keypoints = pipeline(Tasks.hand_2d_keypoints, model=model_id)
result = hand_2d_keypoints('https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/hand_keypoints.jpg')
print(result)
```

# 模型微调
## 修改参数配置
用户可根据实际情况对`configuration.json`的如下参数进行调整，其他参数可保持默认值：
```json
{
    "dataset": {
            "train": {
                "type": "HandCocoWholeBodyDataset",
                "data_source": {
                    "ann_file": "data/coco/annotations/coco_wholebody_train_v1.0.json",  // 标注文件路径
                    "img_prefix": "data/coco/train2017/",                                // 图片路径前缀
                }
            }
    }
}

```


## 模型微调示例
```python
from modelscope.metainfo import Trainers
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.utils.constant import DownloadMode

model_id = 'damo/cv_hrnetw18_hand-pose-keypoints_coco-wholebody'
cfg_options = {'train.max_epochs': 210}
work_dir = "./output"
trainer_name = Trainers.easycv

train_dataset = MsDataset.load(
    dataset_name='cv_hand_2d_keypoints_coco_wholebody',
    namespace='chenhyer',
    split='subtrain',
    download_mode=DownloadMode.REUSE_DATASET_IF_EXISTS)
eval_dataset = MsDataset.load(
    dataset_name='cv_hand_2d_keypoints_coco_wholebody',
    namespace='chenhyer',
    split='subtrain',
    download_mode=DownloadMode.REUSE_DATASET_IF_EXISTS)

kwargs = dict(
    model=model_id,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    work_dir=work_dir,
    cfg_options=cfg_options)

print("build trainer.")
trainer = build_trainer(trainer_name, kwargs)

print("start training.")
trainer.train()
```

# 数据评估及结果
以上模型训练流程中已包含了验证集的评估，训练过程中能够直接看到验证集的评估指标
COCO-Wholebody数据集上模型指标：
| Method | 输入大小 | PCK | AUC | NME | 
| ------------ | ------------ | ------------ | ------------ | ------------ |
| litehrnet_w18 | 256x256 | 0.8161 | 0.8393 | 4.3899 |

# 论文引用
如果你觉得这个该模型对有所帮助，请考虑引用下面的相关的论文：
``` bibtex
@article{WangSCJDZLMTWLX19,
  title={Deep High-Resolution Representation Learning for Visual Recognition},
  author={Jingdong Wang and Ke Sun and Tianheng Cheng and
          Borui Jiang and Chaorui Deng and Yang Zhao and Dong Liu and Yadong Mu and
          Mingkui Tan and Xinggang Wang and Wenyu Liu and Bin Xiao},
  journal={TPAMI},
  year={2019}
}
```

```bibtex
@inproceedings{zhang2020distribution,
  title={Distribution-aware coordinate representation for human pose estimation},
  author={Zhang, Feng and Zhu, Xiatian and Dai, Hanbin and Ye, Mao and Zhu, Ce},
  booktitle={Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition},
  pages={7093--7102},
  year={2020}
}
```