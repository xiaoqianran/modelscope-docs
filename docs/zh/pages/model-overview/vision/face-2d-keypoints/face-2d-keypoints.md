<!-- modelscope-docs: face_2d_keypoints | model-overview/vision/face-2d-keypoints/face-2d-keypoints_CN.md -->

# 模型概览

face_2d_keypoints模型主要用于人脸关键点检测任务，从人脸图片中检测人脸框位置、人脸关键点坐标和人脸姿态角度，模型使用卷积直接回归出关键点的坐标值，相比于基于heatmap的方法，此方法计算量更小更省时。本模型主要借鉴MobileNetV1和MobileNetV2的思路，MobileNetV1速度快，放在浅层用于提取特征图，MobileNetV2速度相对慢但是信息保存好，用于提取深层语义信息，模型参数量少速度快，能良好应用在移动端实时人脸关键点检测场景。

详见论文 [MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications](https://arxiv.org/abs/1704.04861)，
[MobileNetV2: Inverted Residuals and Linear Bottlenecks](https://arxiv.org/abs/1801.04381)。

## 模型历史

深度学习在图像分类，目标检测和图像分割等任务表现出了巨大的优越性。但是伴随着模型精度的提升是计算量，存储空间以及能耗方面的巨大开销，对于移动或车载应用都是难以接受的。
MobileNet网络是由google团队在2017年提出的，专注于移动端或者嵌入式设备中的轻量级CNN网络，亮点是Depth Wise卷积。相比传统卷积神经网络，在准确率小幅降低的前提下大大减少模型参数量与运算量。
MobileNet v2网络是由google团队在2018年提出的，相比MobileNet V1网络，准确率更高，模型更小，亮点就是Inverted residual block（倒残差结构）。在ResNet残差结构中是1x1卷积降维->3x3卷积->1x1卷积升维，在MobileNet v2倒残差结构中正好相反，是1x1卷积升维->3x3DW卷积->1x1卷积降维。这样做的好处是高维信息通过ReLU激活函数后丢失的信息更少。

## 相关论文摘要：

### MobileNet V1
```text
我们提出一个名为MobileNets的高效模型用在移动端和嵌入式设备上。它使用深度可分离卷积（depthwise separable convolutions，即Xception变体结构）来构建轻量级深度神经网络。我们介绍两个简单的全局超参数（宽度乘系数和分辨率因子），可有效的在延迟和准确率之间做平衡(trade off)，这两个参数允许我们依据约束条件选择合适大小的模型。论文在多个参数量下做了广泛的实验，并在ImageNet分类任务上与其他先进模型做了对比，显示了强大的性能。论文验证了模型在其他计算机视觉领域（对象检测，人脸识别，大规模地理定位等）使用的有效性。
```

### MobileNet V2
```text
在本论文中，我们描述了一种新的网络架构MobileNetV2，该网络在多个视觉基础任务上相比于第一代MobileNets都取得了更好的效果。我们同时还针对目标检测任务，基于我们的MobileNetV2，改进出了一套新的架构，名为SSDLite。同时，对于实例分割任务，我们也在DeepLabv3的基础上进行了改进，提出了Mobile DeepLabv3。整套MobileNetV2网络架构是基于翻转残差结构（inverted residual structure），其中依然采用了轻型的深度卷积（depthwise convolutions）来实现滤波操作，同时我们将那些非线性的激活函数给移除了。这一操作带来了不少效果的提升，后文我们也会进行一定的阐述。我们的架构能很容易的被迁移应用于其他应用研究。当然，我们也在ImageNet分类，COCO目标检测，VOC图像分割上进行了实验，与其他模型也会进行仔细对比，包括时效性，参数量，准确性等。
```

# 模型领先性：

* 使用卷积直接回归出关键点坐标值，降低复杂度和计算量。
* 采用了depthwise separable convolution来提高网络的计算速度，depthwise separate convolution包含了depthwise convolution和pointwise convolution。
* 采用了Inverted residual block结构保留更多高维信息。

## 数据评估及结果

### 测评指标
自研数据集上模型指标

| 输入大小 | POINTS-ION-NME | POSE-NME | MFLOPS |  PARAMS |
| ------------ | ------------ | ------------ | ------------ | ------------ | 
| 96x96 | **0.0981** | **10.5242** | **7.456383** | **0.266427 M** |


# 模型训练配置项

face_2d_keypoints模型的训练超参数控制可以在下载下来的模型文件中找到configuration.json文件，该文件种可配置的参数的一般格式如下（此处仅截取一部分配置参数作为示例参考）：

```text
"dataset": {
    "train": {
        "type": "FaceKeypointDataset",
        "data_source": {
            "type": "FaceKeypintSource",
            "train": true,
            "data_range": [0,100],
            "data_cfg": {
                "data_root": "path/to/face_landmark_data/",
                "input_size": 96
            }
        },
        "pipeline": [
            {
                "type": "FaceKeypointRandomAugmentation",
                "input_size": 96
            },
            {
                "type": "FaceKeypointNorm",
                "input_size": 96
            },
            {
                "type": "MMToTensor"
            },
            {
                "type": "NormalizeTensor",
                "mean": [0.4076,0.458,0.485],
                "std": [1.0,1.0,1.0]
            },
            {
                "type": "Collect",
                "keys": [
                    "img",
                    "target_point",
                    "target_point_mask",
                    "target_pose",
                    "target_pose_mask"
                ]
            }
        ]
    }
}
```

在预训练模型中，这些配置只是模型全部配置中的一部分。下面是API文档中列举的常用的配置项：

## 参数列表

* **data_range** (`int`, optional, defaults to [0,100]) – 训练数据集中实际使用的数据索引范围。

* **data_root** (`str`, optional, defaults to None) – 指向训练和测试数据集的根目录，数据集的目录结构如下所示
```text
└── face_landmark_data
    ├── test
    │   ├── 080964.png
    │   ├── 080967.png
    │   ├── 080970.png
    │   └── list.txt
    └── train
        ├── images
        │   ├── merge
        │   │   ├── 080888.png
        │   │   ├── 081520.png
        │   │   ├── 081543.png
        │   └── overlay
        │       ├── 0000.png
        │       ├── 00007.png
        │       ├── 0001.png
        ├── infos
        │   └── merge
        │       ├── 080888.json
        │       ├── 081520.json
        │       ├── 081543.json
        └── real_face_list.txt
```

* **input_size** (`int`, optional, defaults to 96) – 模型输入图像尺寸。

* **mean** (`int`, optional, defaults to 60) – 图像归一化均值，通道为[b, g r]。

* **std** (`int`, optional, defaults to 20) – 图像归一化方差，通道为[b, g, r].

## 模型forward参数列表

* **source** (`torch tensor` of shape `(batch_size, C, H, W)`) – input source image.

## 模型forward输出

* **keypoints** (`torch tensor` of shape `(1, N)`) – output keypoints with size[1, 2*N], N means number of keypoints.

* **pose** (`torch tensor` of shape `(1, 3)`) – output face pose with size[1, 3], pose mean pitch, yaw, roll.

## 训练方式

### 源码安装的modelscope：

当用户希望重新训练face_2d_keypoints模型时，当使用自有数据集时需要手动修改数据目录data_root，或者使用modelscope开源演示数据集face_2d_keypoints_dataset(https://www.modelscope.cn/datasets/modelscope/face_2d_keypoints_dataset/summary)直接运行：

```python
python -m unittest tests/trainers/test_easycv_trainer_face_2d_keypoints.py
```
可以参考示例代码 test_easycv_trainer_face_2d_keypoints.py 进行自定义修改


# 模型推理

## 推理流程
输入一张包含人脸的图像，实现端到端的人脸关键点检测，输出图像中人脸框位置、106点关键点坐标和人头姿态角度。
modelscope开源测试数据集face_2d_keypoints_dataset(https://www.modelscope.cn/datasets/modelscope/face_2d_keypoints_dataset/summary)，其中test目录下存放的是经过crop并转正处理后的人像图片，可直接用于推理测试，也可使用自有任意人脸数据进行推理测试，模型支持多人和360度人脸朝向的人脸及其关键点检测。

## pipeline输入
* **source** (`torch tensor` of shape `(batch_size, H, W, C)`) – url string of input source image.

## pipeline输出
```python
{
    "keypoints": [
        [x1, y1]*106
    ],
    "poses": [pitch, roll, yaw]
}
```

## 代码范例
```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

model_id = 'damo/cv_mobilenet_face-2d-keypoints_alignment'
face_2d_keypoints = pipeline(Tasks.face_2d_keypoints, model=model_id)
output = face_2d_keypoints('https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/keypoints_detect/test_img_face_2d_keypoints.png')

# the output contains box，point and pose
boxes = output[OutputKeys.BOXES]
keypoints = output[OutputKeys.KEYPOINTS]
poses = output[OutputKeys.POSES]

print(f'output boxes: {boxes}')
print(f'output keypoints: {keypoints}')
print(f'output poses: {poses}')
```