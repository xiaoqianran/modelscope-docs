<!-- modelscope-docs: BSHM | model-overview/vision/BSHM-human-matting/BSHM/BSHM_CN.md -->

# BSHM

## 模型概览
BSHM是一个全自动、端到端的人像抠图模型。抠图要求对输入图像达到发丝级别的精细分割，对训练数据的要求非常高。不同于其他基于大量精细标注数据训练的方法，本方法提出了利用粗标准数据来提升抠图结果的方法。相关论文也被CVPR 2020接收，详见论文 [Boosting semantic human matting with coarse annotations](https://openaccess.thecvf.com/content_CVPR_2020/papers/Liu_Boosting_Semantic_Human_Matting_With_Coarse_Annotations_CVPR_2020_paper.pdf)。

![概览](./_resources/0.png)

## 技术特点:
抠图（matting）指的是从图片中精确分割出其中的目标区域，通常要求达到发丝级处理精度。人像抠图是抠图中应用较广泛的一个场景。传统的抠图方法有一定的交互成本，需要输入额外的语义信息作约束，通常为trimap（前景、背景和不确定区域）。近期提出的基于深度学习的end-to-end全自动抠图技术，需要标注大量的精细标注数据对网络进行训练。对于抠图场景来说，训练数据精度要求非常高，通常到发丝级别精度（下图（b）），因而不易直接从网上搜集，且标注成本大、效率低。为了降低抠图的数据获得成本，增大数据量，我们提出了一种只需部分精细matting数据结合大量粗标数据（下图（a））即可达到超精细人像分割效果的方案。

![数据](./_resources/1.png)

## 相关论文摘要：
交互式抠图要求输入trimap作为约束，即已包含有较准备的语义信息，如下图（b）所示，所需估计的是trimap中的灰色区域。对于无交互的人像抠图，则是直接从输入图像中不带任何约束地估计正确的语义信息及精准的alpha细节。提升模型效果的一个重大因素即大量精准标注的训练数据，如果训练数据不充分或分布不均，极容易导致估计的语义信息不准从而影响最后抠图结果的精度，如下图（d）所示。据此，我们提出了一种在不降低训练效果前提下最大限度降低数据标注成本的方法，该方法使用了获取成本较低的粗标注数据，以及部分精度较高的标注数据，实验结果表明该模型的可以更好的估计语义信息，同时对发丝细节的处理精度也很好，如下图（e）所示。

![介绍](./_resources/2.png)

## 模型介绍
为了在精确抠图中使用非精确标注的数据，我们提出了如下的网络框架。提出的模型框架分为三部分：粗mask估计网络（MPN）、质量统一化网络（QUN），以及精确alpha matte估计网络（MRN）。该部分的设计理念为：复杂问题拆解，先粗分割（MPN）再精细化分割（MRN）。学术界有大量易获取的粗分割数据，可以利用起来。但在实操过程中发现，粗分割数据和精分割数据不一致导致预期GAP很大，故而又设计了质量统一化网络（QUN）。MPN的用途是估计粗语义信息（粗mask），使用粗标注数据和精标注数据一起训练。QUN是质量统一化网络，用以规范粗mask质量，QUN可以统一MPN输出的粗mask质量。MRN网络输入原图和经过QUN规范化后的粗mask，估计精确的alpha matte，使用精确标注数据训练。

![模型](./_resources/3.png)


## 模型领先性：
我们与几个baseline方法进行了对比，包括传统的matting方法以及最新基于神经网络的方法。训练数据中包括一半精标注数据，一半粗标注数据。对比方法（除deeplab）由于算法限制只能使用精标注数据，因而只使用了精标注数据训练。我们的方法分别用只使用精标注数据以及同时使用精标注数据和粗标注数据进行了实验。如下图4结果表明，我们的方法在使用了粗标注数据之后，对复杂case的语义信息估计的要更准确，同时细节信息也估计的更好。对比其他方法，我们的方法能达到sota结果。

![对比](./_resources/4.png)

## 参数列表
给定输入图像即可。

## 模型使用

本模型基于tensorflow进行训练和推理，在ModelScope框架上，提供输入图片，即可以通过简单的Pipeline调用来使用人像抠图模型。
```python
import cv2
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.outputs import OutputKeys

portrait_matting = pipeline(Tasks.portrait_matting,model='damo/cv_unet_image-matting')
result = portrait_matting('https://modelscope.oss-cn-beijing.aliyuncs.com/demo/image-matting/1.png')
cv2.imwrite('result.png', result[OutputKeys.OUTPUT_IMG])
```




