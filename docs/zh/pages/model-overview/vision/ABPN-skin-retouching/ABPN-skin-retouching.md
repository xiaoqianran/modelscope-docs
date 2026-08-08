<!-- modelscope-docs: ABPN_skin_retouching | model-overview/vision/ABPN-skin-retouching/ABPN-skin-retouching_CN.md -->

# 模型概览
ABPN是一个关注于图像局部修饰任务（如美肤、服饰去皱等）的模型。我们通过引入上下文感知的局部修饰层和自适应混合模块，
将高清图像的局部修饰拆解为低分辨率图像的局部修饰以及其向高分辨率的逐步扩展两个阶段，实现了高清图像的快速、精细化修饰
。相关论文被CVPR 2022接受，
详见论文 [ABPN: Adaptive Blend Pyramid Network for Real-Time Local Retouching of Ultra High-Resolution Photo](https://openaccess.thecvf.com/content/CVPR2022/papers/Lei_ABPN_Adaptive_Blend_Pyramid_Network_for_Real-Time_Local_Retouching_of_CVPR_2022_paper.pdf) 。

## 模型历史：

近年来，大量研究工作被投入于图像到图像的翻译(image-to-image translation)任务，且在风格迁移、
语义图像生成等方面取得了令人瞩目的效果。
这些研究方法（如pix2pixHD）大多采用具有编码-解码范式的深度网络来实现高质量的图像翻译，这带来了较大的计算成本，
从而限制了其在某些高分辨率场景中的应用。对此，一些方法(如LPTN)试图通过将计算成本从高分辨率图转移到低分辨率图来加速模型，
减少计算成本。然而，由于缺乏对局部区域的关注，此类方法也难以适用于一些局部修饰任务（如美肤、服饰去皱等）。
除了全局的图像翻译，也有很多方法关注于图像的局部编辑任务，如图像补全、五官编辑、去阴影等。
这些方法大多数依赖于目标区域的掩码作为输入，而在局部修饰任务中，准确获取目标区域的掩码本身就是一个相当具有挑战性的问题。
尽管一些方法能够在不指定掩码的情况下进行局部编辑，但由于计算量的限制，这些方法大多无法直接处理超高分辨率图像。


## 相关论文摘要：

在本文中，我们提出了一种新颖的自适应混合金字塔网络，旨在实现对超高分辨率照片的快速局部修饰。该网络主要由两部分组成：
上下文感知局部修饰层（LRL）和自适应混合金字塔层（BPL）。 LRL在考虑全局上下文和局部纹理信息的同时对低分辨率图像进行局部修饰，
而后BPL通过自适应混合模块以及微调模块将低分辨率结果逐步扩展到更高的分辨率，同时保留纹理等细节。
我们的方法在两个局部修饰任务中展现了远优于现有方法的效果，并且在运行速度方面表现出卓越的性能。
 

## 模型领先性：

* 提出了一种用于对超高分辨率照片进行局部修饰的新网络框架，展示了卓越的效率性能和优于现有方法的图像修饰效果（如下表展示）。
* 提出了一个局部注意力模块，可以有效的获取、融合全局上下文信息和局部的纹理细节。
* 提出了一个自适应混合模块，给网络提供了强大的拓展能力，使得网络可以实现低分辨率结果到高分辨率的快速、精准拓展。

FFHQR数据集：

| Method | LPIPS | PSNR | SSIM | Inference time(s) |
| ------------ | ------------ | ------------ |  ------------ | ------------ |
| VCNet | 0.039 | 38.36 | 0.973 | 0.197 |
| AutoRetouch | 0.025 | 41.83 | 0.986 | 0.057 |
| pix2pixHD | 0.053 | 31.39 | 0.952 | 0.055 |
| ASAPNet | 0.163 | 26.21 | 0.910 | 0.015 |
| LPTN | 0.069 | 37.42 | 0.949 | 0.035 |
| Ours |  **0.018** | **44.35** | **0.993** | **0.009** |

CRHD-3K数据集：

| Method | LPIPS | PSNR | SSIM |
| ------------ | ------------ | ------------ |  ------------ |
| VCNet | 0.084 | 31.99 | 0.902 |
| AutoRetouch | 0.081 | 32.70 | 0.907 |
| pix2pixHD | 0.101 | 27.23 | 0.892 |
| ASAPNet | 0.101 | 30.31 | 0.887 |
| LPTN | 0.042 | 35.09 | 0.963 |
| Ours |  **0.029** | **37.35** | **0.971** |


## 参数列表
仅需输入包含人脸的图像，人像美肤模型会自动地完成图像中人体皮肤区域的匀肤、去瑕疵、美白等操作，并返回处理好的图像。

* **input** (`string`) – url string of input content image.
     

## 模型前处理
风格迁移模型适用于RGB通道的输入图像，内容图像和风格图像都需要是三通道图像。因此对于单通道的图像，需要进行图像颜色转换，变成RGB三通道的图像。

```python
        def preprocess(input: Input) -> Dict[str, Any]:
            img = LoadImage.convert_to_ndarray(input)
            if len(img.shape) == 2:
                img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
            img = img.astype(np.float)
            result = {'img': img}
            return result
```
 

## 模型forward参数
```python
        pred = self.generator(image)
```
    
* **image** (`torch tensor` of shape `(batch_size, C, H, W)`) – Tensor of input image.

 

## 输出参数列表
模型推理结果为浮点numpy数组，为了将其转换为uint8图像，需要将取值范围约束在0~255之间进行输出。
```python
        output_img = cv2.cvtColor(output_img[0], cv2.COLOR_RGB2BGR)
        output_img = np.clip(output_img, 0, 255).astype(np.uint8)
```
* **output_img** (`np.array` of shape `( H, W, C)`) – image of retouched image.






