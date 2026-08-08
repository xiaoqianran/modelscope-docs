<!-- modelscope-docs: cv_resnet18_human-detection | model-overview/vision/human-detection/cv-resnet18-human-detection/cv-resnet18-human-detection_CN.md -->

# 模型概览
人体检测模型作为一个基础模型，广泛应用于视觉业务领域，是人体属性、行为分析、肢体关键点等任务的前序基本模型。
模型选取经典FasterRCNN-Pipline，以resnet18为特征提取backbone，neck特征层加入DyHead模块以提升特征尺度、空间位置、检测多任务头层面注意力，提升检测指标。相关参考论文地址:

[Faster R-CNN: Towards Real-Time Object Detection with Region Proposal Networks](https://arxiv.org/abs/1506.01497)

[Dynamic Head: Unifying Object Detection Heads with Attentions](https://arxiv.org/abs/2106.08322)

模型领先性

* 经典检测算法与dyHead即插即用模块结合，提升目标检测头表达能力。
* 业务场景覆盖度高，覆盖室内外、监控、单人多人等大部分场景。


## 输入输出
给定一张待检测图像，输出图像中对应人体坐标位置。

* **input** (`string`) – url string of input image.
* **output** (`dict`) – contain bboxes,labels and scores.

## 模型输入前处理
人体检测模型前处理包含三个部分，分辨率归一化、颜色值归一化、分辨率pad至32的倍数处理，所有前处理操作均通过配置文件流式管理。

```text
   分辨率归一化：首先按照短边800等比缩放，若长边大于1333，则按照长边1333缩放；
   颜色值归一化：减均值除方差归一化
   pad32处理：分辨率pad至32的倍数
```

## 模型使用
本模型基于pytorch与mmdet、mmcv库进行训练和推理，在ModelScope框架上，提供输入图片，即可通过简单的Pipeline调用使用人体检测模型，如若图像中没有人体对象则返回为空。

```python

from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
object_detect = pipeline(Tasks.human_detection,model='damo/cv_resnet18_human-detection')
img_path = 'https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/image_detection.jpg'
result = object_detect(img_path)
print(result)

```

## 论文使用

```BibTeX
@InProceedings{Dai_2021_CVPR,
    author    = {Dai, Xiyang and Chen, Yinpeng and Xiao, Bin and Chen, Dongdong and Liu, Mengchen and Yuan, Lu and Zhang, Lei},
    title     = {Dynamic Head: Unifying Object Detection Heads With Attentions},
    booktitle = {Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)},
    month     = {June},
    year      = {2021},
    pages     = {7373-7382}
}
@inproceedings{renNIPS15fasterrcnn,
    Author = {Shaoqing Ren and Kaiming He and Ross Girshick and Jian Sun},
    Title = {Faster {R-CNN}: Towards Real-Time Object Detection
             with Region Proposal Networks},
    Booktitle = {Advances in Neural Information Processing Systems ({NIPS})},
    Year = {2015}
}
```






