<!-- modelscope-docs: BaSSL_movie_scene_segmentation | model-overview/vision/BaSSL-movie-scene-segmentation/BaSSL-movie-scene-segmentation_CN.md -->

# 模型概览
BaSSL由shot特征提取器（shot encoder）和上下文关系网络（contextual relation network-CRN）组成。其中shot encoder基于ResNet-50结构，CRN基于bert结构。
BaSSL使用自监督学习（self-supervised learning）的训练方式，整个训练流程分为两个阶段。在预训练阶段中，整个模型在四个上游任务上进行联合训练，通过这四个任务的联合训练，模型可以在不需要任何人工标注的标签的情况下得到较好的shot encoder。 在微调阶段中，冻结shot encoder的参数，并且利用视频场景分割的数据和标签训练CRN，最终模型可以在MovieNet视频场景分割数据集上达到SOTA性能。
详见论文[《Boundary-aware Self-supervised Learning for Video Scene Segmentation》](https://arxiv.org/abs/2201.05277)

论文的摘要信息如下：
```text
自监督学习因其在没有真实标注数据的情况下学习特征表示的有效性而引起了人们的关注；具体来说，正确设计的上游任务（例如，对比预测任务）可以为下游任务（例如分类任务）带来显著的性能提升。由此，作者使用自监督学习方式解决了视频场景分割问题，这是一个在时序上定位视频场景边界的任务。作者主要专注于设计有效的上游任务。在论文提出的框架中，作者通过将一系列镜头分成两个连续的、不重叠的子串来构造一个伪边界，并利用此伪边界来进行预训练。基于此，作者引入了三种新颖的边界感知上游任务：1）镜头场景匹配（SSM），2）上下文组匹配（CGM） 和 3） 伪边界预测（PP）。其中，SSM和CGM指导模型最大化场景内相似性和场景间区分度，而PP鼓励模型识别场景过渡的时刻。通过综合分析，作者认为预训练和上下文表示的迁移都是提高视频场景分割性能的关键点。最后，作者在MovieNet-SSeg基准数据集上达到了新的最高精度。
```

模型领先性：

1. 模型引入了一种新颖的边界感知预训练框架，该框架采用动态时间规整（DTW）算法来识别伪边界并将其用作自监督学习的标签来进行预训练，另外，模型提出了三个边界感知任务，这些任务经过精心设计，可以学习视频场景分割任务所需的基本能力；
2. BaSSL在MovieNet-SSeg基准数据集上达到了最优性能，同时大大优于现有的基于自监督学习的方法。

# 模型训练配置项

BaSSL模型的训练超参数控制可以在下载下来的模型文件中找到`config.json`文件，该文件中可配置的参数的一般格式如下：

```text
{
    "input_dim": 2048,
    "is_decoder": false,
    "add_cross_attention": false,
    "chunk_size_feed_forward": 0,
    "attention_probs_dropout_prob": 0.1,
    "hidden_act": "gelu",
    "hidden_dropout_prob": 0.1,
    "hidden_size": 768,
    "intermediate_size": 3072,
    "layer_norm_eps": 1e-12,
    "num_attention_heads": 8,
    "num_hidden_layers": 2,
    "pooling_method": "center",
    "neighbor_size": 16
}
```
这些配置只是模型全部配置中的一部分，下面列举常用的配置项：

## 参数列表
* **input_dim** (`int`) -  模型输入的特征维度。
* **is_decoder** (`bool`) -  是否使用模型的decoder功能。
* **add_cross_attention** (`bool`) -  是否加入cross_attention。
* **chunk_size_feed_forward** (`int`) -  bert模型中对注意力头分块的个数。
* **attention_probs_dropout_prob** (`float`) -  bert模型中注意力层使用的dropout概率。
* **hidden_act** (`str`) -  隐藏层使用的激活函数名称。
* **hidden_dropout_prob** (`float`) -  隐藏层使用的dropout概率。
* **hidden_size** (`int`) -  bert模型中隐藏层生成的特征维度。
* **intermediate_size** (`int`) -  bert模型中中间层的输出维度,
* **layer_norm_eps** (`float`) -  bert模型中层归一化使用的eps数值,
* **num_attention_heads** (`int`) -  注意力头的个数。
* **num_hidden_layers** (`int`) -  隐藏层的个数。
* **pooling_method** (`str`) -  使用的池化方法。
* **neighbor_size** (`int`) -  特征聚合时候使用的相邻特征个数。

当用户在推理中使用BaSSL的模型时，这些参数一般都是固定的。您可以使用Model类直接拉起模型：
```python
from modelscope.models.cv.movie_scene_segmentation import MovieSceneSegmentationModel
model = MovieSceneSegmentationModel('damo/cv_resnet50-bert_video-scene-segmentation_movienet')
```
也可以自定义修改config后再拉起

## 训练方式

### 源码安装的modelscope
```python
python -m unittest tests/trainers/test_movie_scene_segmentation_trainer.py -- level 1
```
可以参考示例代码 `test_movie_scene_segmentation_trainer.py` 进行自定义修改。

# 模型推理

## 模型前处理
在推理的时候，BaSSL接受完整的视频文件为输入，需要在前处理步骤中采用shot分割算法将输入视频分割为若干个shot。此步骤已整合到模型的前处理代码中，具体见`modelscope/models/cv/movie_scene_segmentation/model.py`文件。

模型的前处理参数如下：
```text
 "shot_detect": {
    "avg_sample": false,
    "begin_time": 0.0,
    "end_time": 120.0,
    "begin_frame": 0,
    "end_frame": 1000,
    "keep_resolution": false,
    "print_result": false,
    "split_video": false,
    "save_keyf": false
}
```
* **avg_sample** (`bool`) - 是否在提取shot关键帧的时候使用平均采样。
* **begin_time** (`float`) -  进行shot分割的起始时间，设置为0的时候表示不对时间进行自定义，默认使用完整的视频。
* **end_time** (`float`) -  进行shot分割的结束时间。
* **begin_frame** (`int`) -  进行shot分割的起始帧号，设置为0的时候表示不对帧号进行自定义，默认使用完整的视频
* **end_frame** (`int`) -  进行shot分割的结束帧号。
* **keep_resolution** (`bool`) -  在进行分割算法的时候是否保证分辨率。
* **print_result** (`bool`) -  是否在终端打印分割的结果。
* **split_video** (`bool`) -  是否按照分割好的结果保存每个shot的视频。
* **save_keyf** (`bool`) -  是否保存每个shot中对应的关键帧。

## 普通推理
模型forward中可配置的参数如下：
```text
{
    "batch_size_per_gpu": 32,
    "save_threshold": 0.8,
    "save_split_scene": false
}
```
* **batch_size_per_gpu** (`int`) -  推理时候使用的batch_size大小。
* **save_threshold** (`float`) -  预测结果时候使用的threshold。
* **save_split_scene** (`bool`) -  是否保存每个scene对应的视频。

您可以直接利用ModelScope中的pipeline类直接进行推理：
```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.outputs import OutputKeys

video_scene_seg = pipeline(Tasks.movie_scene_segmentation, model='damo/cv_resnet50-bert_video-scene-segmentation_movienet')
result = video_scene_seg('https://modelscope.oss-cn-beijing.aliyuncs.com/test/videos/movie_scene_segmentation_test_video.mp4')
if result:
    print(result)
```
模型的输出格式如下：
```text
{
        "shot_num":15,      # 分割得到的shot个数
        "shot_meta_list":   # 分割得到的每个shot的信息
        [
           {
               "frame": [start_frame, end_frame],       # 此shot的开始和结束帧
               "timestamps": [start_timestamp, end_timestamp]       # ['00:00:01.133', '00:00:02.245'], 此shot的开始和结束时间戳

           }
         ]
        "scene_num":3,      # 分割得到的场景个数
        "scene_meta_list":      # 分割得到的每个场景的信息
        [
           {
               "shot": [0,1,2],     # 此场景中包含的shot序号
               "frame": [start_frame, end_frame],       # 此场景的开始和结束帧
               "timestamps": [start_timestamp, end_timestamp] # ['00:00:01.133', '00:00:02.245'], 此场景的开始和结束时间戳
           }
        ]

}


```
