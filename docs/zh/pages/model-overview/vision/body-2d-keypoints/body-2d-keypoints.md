<!-- modelscope-docs: body_2d_keypoints | model-overview/vision/body-2d-keypoints/body-2d-keypoints_CN.md -->

# 模型概览

body_2d_keypoints模型采用自顶向下的人体关键点检测框架，通过端对端的快速推理可以得到图像中的人体关键点。其中人体关键点对齐模型基于HigherHRNet的backbone，充分利用多分辨率的特征融合，良好支持日常人体姿态，尤其是在瑜伽、健身等场景下多遮挡、非常见、多卧姿姿态上具有SOTA的检测精度。
backbone详见论文[HigherHRNet: Scale-Aware Representation Learning for Bottom-Up Human Pose Estimation](https://arxiv.org/abs/1908.10357)。

## 模型历史
2D人体姿态估计是计算机视觉领域的基本研究方向之一，多人2D姿态估计（Multi-Person Pose Estimation）是该方向上的一个经典难题。自下而上的框架在速度上有优势，但是由于卷积神经网络对于尺度不敏感，而图片中人的多尺度的难题导致目前的结果和自上而下框架还有一定差距。为此，我们在CVPR 2019 和TPAMI上发表的HRNet（https://github.com/HRNet）工作的基础上，提出了HigherHRNet来解决自下而上方法中的多尺度难题。

## 相关论文摘要：

```text
自下而上的人体姿态估计方法由于尺度变化的挑战而难以为小人体预测正确的姿态。在本文中，作者提出了一种新的自下而上的人体姿势估计方法HigherHRNet，使用高分辨率特征金字塔学习多尺度上的特征。由于模型在训练时使用了多分辨率监督且推理时使用了多分辨率聚合技术，该方法能够更好地解决自下而上多人姿势估计中的尺度变化任务，并能更精确地定位关键点，尤其是对于面积占比较小的人物。HigherHRNet中的特征金字塔包括HRNet的特征图输出和通过转置卷积进行上采样的高分辨率输出。在COCO test-dev中，HigherHRNet的中等人体的AP性能比以前最佳的自下而上方法高2.5％，显示了其在处理尺度变化方面的有效性。此外，HigherHRNet在COCO test-dev（AP: 70.5％）上获得了最新的结果，而无需使用优化或其他后处理技术，从而超越了所有现有的自下而上的方法。HigherHRNet甚至在CrowdPose测试（AP：67.6％）上超过了所有自上而下的方法，表明它在拥挤场景中的稳健性。
```

# 模型领先性：

* 尝试解决尺度变化的挑战。
* 它可以在训练阶段生成具有多分辨率监督的高分辨率特征金字塔，并在推理阶段生成多分辨率热图聚合，以预测有利于小型人体的尺度感知的高分辨率热图。
* 模型优于其他所有自下而上的方法。尤其是中型人体的识别。

## 数据评估及结果
### 测评指标
COCO数据集上模型指标：
| Method | 输入大小 | AP | AP50 | AP75 | AR | AR50 |
| ------------ | ------------ | ------------ | ------------ | ------------ |------------ |------------ |
| SimpleBaseline2D | 256x192 | 0.717 | 0.898 | 0.793 | 0.772|0.936|
| HRNet | 256x192 | 0.746 | 0.904 | 0.819 | 0.799 |0.942|
| HRformer | 256x192 | 0.738 | 0.904 | 0.811 | 0.792 |0.941|
| **Ours** | 256x192 | **0.770** | 0.838 | 0.741 |  0.797 |**0.943**|

自研数据集上模型指标

| 输入大小 | PCK | 
| ------------ | ------------ | 
| 128x128 | **0.3387** |

| Head | Shoulder | Elbow | Wrist | Hip | Knee |Ankle|
| ------------ | ------------ | ------------ | ------------ |------------ |------------ |------------ |
| 0.288 | 0.275 | 0.330 | 0.400 | 0.355 | 0.350 | 0.388 |


| mAP@0.5 | mAP@0.6 | mAP@0.7 | mAP@0.8 | mAP@0.9 | mAP@0.95 |
| ------------ | ------------ | ------------ | ------------ | ------------ |------------ |
| 84.781 | 79.093 | 68.739 | 50.955 | 22.579 | 11.956 |

# 模型配置项

body_2d_keypoints模型的超参数控制可以在下载下来的模型文件中找到configuration.json文件，该文件一般格式如下（此处仅截取一部分配置参数作为示例参考）：

```text
'MODEL': {
        'NUM_JOINTS': 15,
        'IMAGE_SIZE': [128, 128],
        'HEATMAP_SIZE': [32, 32],
    }
```
在预训练模型中，这些配置只是模型全部配置中的一部分。下面是API文档中列举的常用的配置项：

## 参数列表

    
* **NUM_JOINTS** (`int`, optional, defaults to 15) – number of keypoints

* **IMAGE_SIZE** (`int`, optional, defaults to 128) – input image size

* **HEATMAP_SIZE** (`int`, optional, defaults to 32) – output heatmap size


# 模型forward参数列表

* **source** (`torch tensor` of shape `(batch_size, C, H, W)`) – input source image.

# 模型forward输出
* **heatmap** (`torch tensor` of shape `(N, H, W)`) – output heatmap with size[N,H,W], N means number of keypoints.

# 模型推理

## 推理流程
 输入一张人物图像，实现端到端的人体关键点检测，输出图像中所有人体的15点人体关键点坐标、点位置信度和人体检测框。
 modelscope开源测试数据集body_2d_keypoints_test_dataset（https://www.modelscope.cn/datasets/modelscope/body_2d_keypoints_test_dataset/summary）

## pipeline输入
* **source** (`torch tensor` of shape `(batch_size, H, W, C)`) – url string of input source image.

## pipeline输出
```python
{
  "keypoints": [
              [[x, y]*15],
              [[x, y]*15],
              [[x, y]*15]
            ]
  "scores": [
              [[score]*15],
              [[score]*15],
              [[score]*15]
             ]
  "boxes": [
              [x1, y1, x2, y2],
              [x1, y1, x2, y2],
              [x1, y1, x2, y2],
            ]
}
```

## 代码范例
```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

model_id = 'damo/cv_hrnetv2w32_body-2d-keypoints_image'
body_2d_keypoints = pipeline(Tasks.body_2d_keypoints, model=model_id)
output = body_2d_keypoints('https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/keypoints_detect/000000438862.jpg')

# the output contains poses, scores and boxes
keypoints = output[OutputKeys.KEYPOINTS]
scores = output[OutputKeys.SCORES]
boxes = output[OutputKeys.BOXES]
print(f'output keypoints: {keypoints}')
print(f'output scores: {scores}')
print(f'output boxes: {boxes}')
```