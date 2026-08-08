<!-- modelscope-docs: DCTNet_cartoon | model-overview/vision/DCTNet-cartoon/DCTNet-cartoon_CN.md -->

# 模型概览
DCT-Net(Domain-Calibrated Translation Networks) 是一种用于人像风格特效生成的域校准图像转换模型，模型利用百张小样本风格数据，即可训练得到轻量稳定的风格转换器，实现高保真、强鲁棒、易拓展的高质量人像风格转换效果。相关论文收录于SIGGRAPH 2022会议和TOG期刊。
详见论文 [DCT-Net: Domain-Calibrated Translation for Portrait Stylization](https://arxiv.org/abs/2207.02426)。

## 模型历史：
人像风格化任务旨在通过对指定的人像照片进行夸张的艺术风格转换，得到人物的二次元卡通形象、手绘风格、虚拟3D形象等结果，从而实现具有视觉冲击力的人物美化效果，该项技术被广泛应用于图像内容创作、社交娱乐等场景。
现实生活中，人像虚拟风格创作多由设计师手动利用专业的图像编辑软件制作，存在着制作门槛高、效率低下且成本高昂的问题；对于用户而言，单张画像的购入价格在上百元不等，价格高且用时长。深度学习技术的日益发展给自动化地生成人像漫画带来可能，
也使得该项技术受到学术界和业界的广泛关注。最初的人像卡通化算法CartoonGAN由Chen等人提出，基于循环对抗生成网络CycleGAN学习真实照片域到卡通风格域的转换关系，后AnimeGAN、UGATIT等工作通过提出适配的损失设计、新的注意力机制模块，以实现卡通场景生成和夸张的卡通头像合成，但该类模型但依赖于大规模训练数据，需要大量风格样本才能生成稳定效果，数据采集成本极高，且需要针对人像和场景分别模型训练，缺少通用性；后期随着StyleGAN强大图像生成模型的提出，一系列基于预训练StyleGAN2和反向编码的人像卡通化方法（Toonify、AgileGAN、DualStyleGAN等）被提出，通过风格域泛化实现小样本下的人像风格化效果，但该类方案由于引入人脸逆向编码和小样本迁移学习下的过拟合问题，虽然能产生高质量的风格转换结果，但对原始人脸的内容保留能力极差，脸结构信息大量丢失（发型、配饰、背景等），使得结果美而不像，且只能处理头部区域，无法实现全图变换。而DCT-Net的提出基于“先全局特征校准，再局部纹理转换”的思想，结合了前后期两类方案的优点，能够利用小样本即实现高保真、稳定自然的效果，且能够进行全图风格转换。


## 技术特点:
DCT-Net针对图像翻译过程中小样本导致的目标域数据偏置问题，采用了“先校准后翻译”的策略，先利用特征适配方法对目标域进行内容表征层面的校准、及几何特征空间的拓展，再针对校准后源域和目标域，利用局部纹理转换网络学习其相对对称的全局域特征，且后者采用了局部匹配特性较强的网络结构，使得域对称特性由全局域特征层面转换至局部像素/图像块层面，从而实现了小样本下精细化的图像翻译过程。

## 相关论文摘要：
DCT-Net（Domain-Calibrated Translation）是一种面向小样本人像风格化的全新图像翻译模型，给定百张小样本风格数据，该模型即可生成高保真、强鲁棒、易拓展的人像风格转换效果，同时该模型仅依据局部头部观测即可完成全图的精细化转换。
小样本人像风格转换是一个极具挑战性的问题，由于目标域仅包含少量数据，在源域到目标域的转换过程中极易出现数据偏置导致的过拟合现象。针对该问题，我们提出了“先全局特征校准，再局部纹理转换”的核心思想，并利用局部网络学习全局增强特征。DCT-Net由三个模块构成：全局内容校准网络CCN、几何拓展模块GEM和局部纹理转换网络TTN，CCN基于迁移学习对目标分布进行内容特征校准，为目标域引入大量原本不存在的内容特征，极大增加其内容多样性；GEM通过对特征进一步几何增强，使网络获得相应的几何不变性，减少模型推理时由于人脸对齐误差引入的干扰以及使网络具备全图转换中自由角度人脸处理能力；TTN以无监督的方式学习域空间高度对称的全局特征，以局部特征保留能力极强的U-Net结构作为纹理转换网络，实现全局对称到局部对称的细粒度转换，从而使得高保真、自然稳定的转换结果。实验结果表明该方法在人脸风格化上显著优于现有方法，并能同时适用于产生自适应形变的全图风格转换任务。



## 模型领先性：

	1.	DCT-Net具备内容匹配的高保真能力，能有效保留原图内容中的人物ID、配饰、身体部件、背景等细节特征；
	2.	DCT-Net具备面向复杂场景的强鲁棒能力，能轻松处理面部遮挡、稀有姿态等；
	3.	DCT-Net在处理维度上和风格适配度上具有易拓展性，利用头部数据即可拓展至全身像/全图的精细化风格转换，同时模型适配于日漫风、3D、手绘等多种风格效果，具有通用普适性。

使用CelebA公开人脸数据集进行评测，在FID/ID/用户偏好等指标上均达SOTA结果：

| Method | FID | ID | Pref.A | Pref.B | 
| ------------ | ------------ | ------------ | ------------ | ------------ |
| CycleGAN | 57.08 | 0.55 | 7.1 | 1.4 | 
| U-GAT-IT | 68.40 | 0.58 | 5.0 | 1.5 | 
| Toonify | 55.27 | 0.62 | 3.7 | 4.2 | 
| pSp | 69.38 | 0.60 | 1.6 | 2.5 |
| Ours | **35.92** | **0.71** | **82.6** | **90.5** |



# 参数列表
给定人物图像作为源输入，卡通化模型会自动地将原图转换为具备相应风格特效的结果。

* **source** (`tf tensor` of shape `(batch_size, H, W, C)`) – url string of input source image.
     

# 模型推理

本模型基于tensorflow进行训练和推理，在ModelScope框架上，提供输入图片，即可以通过简单的Pipeline调用来使用人像风格化模型。


```python

import cv2
from modelscope.outputs import OutputKeys
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

img_cartoon = pipeline(Tasks.image_portrait_stylization, 
                       model='damo/cv_unet_person-image-cartoon_compound-models')
img_path = 'https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/image_cartoon.png'
result = img_cartoon(img_path)
cv2.imwrite('result.png', result[OutputKeys.OUTPUT_IMG])
print('finished!')

```

ModelScope上同时提供了多种风格的卡通化模型，可以通过初始化pipeline时指定model id快速切换对应风格的模型。

日漫风格：
```python
img_cartoon = pipeline(Tasks.image_portrait_stylization, 
                       model='damo/cv_unet_person-image-cartoon_compound-models')

```
3D风格：
```python
img_cartoon = pipeline(Tasks.image_portrait_stylization, 
                       model='damo/cv_unet_person-image-cartoon-3d_compound-models')

```
手绘风格：
```python
img_cartoon = pipeline(Tasks.image_portrait_stylization, 
                       model='damo/cv_unet_person-image-cartoon-handdrawn_compound-models')

```
素描风格：
```python
img_cartoon = pipeline(Tasks.image_portrait_stylization, 
                       model='damo/cv_unet_person-image-cartoon-sketch_compound-models')

```
艺术风格：
```python
img_cartoon = pipeline(Tasks.image_portrait_stylization, 
                       model='damo/cv_unet_person-image-cartoon-artstyle_compound-models')

```



# 模型主页

DCT-Net人像卡通化模型的主页和更多补充材料可见[这里](https://menyifang.github.io/projects/DCTNet/DCTNet.html)。





