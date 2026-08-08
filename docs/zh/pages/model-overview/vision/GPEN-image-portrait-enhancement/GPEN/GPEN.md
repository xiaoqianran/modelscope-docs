<!-- modelscope-docs: GPEN | model-overview/vision/GPEN-image-portrait-enhancement/GPEN/GPEN_CN.md -->

# 模型概览

GPEN是一种盲人像修复的模型，在真实降质人像中有较为优秀的表现。模型主要通过将预训练的StyleGAN2网络作为decoder部分嵌入到完整修复网络中实现的，充分利用了GAN网络的人脸先验。相关论文被CVPR 2021接受。
相见论文 [GAN Prior Embedded Network for Blind Face Restoration in the Wild](https://arxiv.org/abs/2105.06070)。

## 模型历史

人像图片在生活中非常常见，但是多数人像图片会受到包括模糊、噪声、压缩等多种降质的影响导致质量不高。如何修复真实场景中的降质人像图片一直是研究的热点和重点。传统的人像修复算法把这个问题当做一个逆问题来求解，但是需要假设已知图片的降质类型和参数，而真实的降质人像图片往往存在着复杂而未知的降质。深度学习时代的到来吸引了很多研究者使用网络来解决这一病态问题。比如有人尝试用spatial transformer network，有些人尝试使用高清参考图的方式来修复人像图片，还有些人去建立一个人脸组件的词典等等，虽然提出了非常多的方案，也取得了不错的进展，但是处理真实降质人像时的效果依然远远不能满足要求，这主要是由于人像修复任务的高度病态性以及真实降质的复杂性导致的。

## 技术特点

StyleGAN2是目前最为优秀的生成对抗网络框架，它能生成出高清并且逼真的人像图片，达到人眼难以分辨真假的地步。与之前的人像修复算法不同，GPEN主要通过充分利用StyleGAN2的人脸先验来修复人像。算法将预训练好的StyleGAN2模型作为decoder部分嵌入到完整的网络框架中，然后使用合成的数据对进行微调训练，最终得到完整的修复模型。

## 相关论文摘要

修复真实世界中降质的人像图片是一个非常有挑战性的工作。由于这个问题的高度病态性以及真实降质的复杂未知性，如果直接采用end2end的方式训练一个深度网络往往不能得到满意的结果。当前基于GAN的网络可以得到更佳的结果，但是生成的效果过于平滑。在本文中，我们提出了一个全新的模型GPEN，它首先预训练一个能生成高清晰人像图片的GAN，然后将这个GAN作为decoder嵌入到一个U-net结构中作为人像生成先验，最后使用合成的数据对微调得到最终的模型。在模型结构设计上，用GAN网络中latent code和noise input分别控制人像的整体结构以及底层的人像细节。这个新提出的GPEN非常容易实现，并且能生成出视觉上逼真的效果。我们的实验也验证了GPEN在多个任务上有这个SOTA的表现。
 

## 模型领先性

* 将预训练的GAN网络作为decoder部分嵌入到完整网络中，以此来获取人像生成的先验。
* 对网络结构进行了充分的设计，保证GAN网络能完美的嵌入，通过控制GAN中的latent code和noise input来分别恢复人像的整体结构和底层细节。
* 通过广泛的实验对比，我们的算法均有最佳的数据表现，用户实验也证实了这一点。

|  Method   |   FID  | LPIPS |  PSNR |
|:---------:|:------:|:-----:|:-----:|
|  GFRNet   | 134.92 | 0.597 | 21.70 |
|  GWAInet  | 135.84 | 0.569 | 19.84 |
| HiFaceGAN |  56.67 | 0.392 | 21.33 |
|    GPEN   |  31.72 | 0.346 | 20.80 |

## 输入参数列表

* **input** (`pytorch tensor` of shape `(batch_size, H, W, C)`) – url string of input image. 

## 输出参数列表

* **output_img** (`np.array` of shape `(H, W, C)`) - output image

## 模型推理

```python
import cv2
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.outputs import OutputKeys

portrait_enhancement = pipeline(Tasks.image_portrait_enhancement, model='damo/cv_gpen_image-portrait-enhancement')
result = portrait_enhancement('https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/marilyn_monroe_4.jpg')
cv2.imwrite('result.png', result[OutputKeys.OUTPUT_IMG])
```

# 模型主页

GPEN模型的github主页和更多补充材料可见[这里](https://github.com/yangxy/GPEN)。





