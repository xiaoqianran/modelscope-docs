<!-- modelscope-docs: AAMS | model-overview/vision/AAMS-style-transfer/AAMS/AAMS_CN.md -->

# 模型概览
AAMS是一种用于任意风格图像风格转移的注意力感知多笔触模型。该模型鼓励内容图像和风格化图像之间的对应区域的注意力一致性（视觉注意力分布的空间一致性），
并且实现多尺度多中心融合控制和自动笔画大小控制。相关论文也被CVPR 2019接受，
详见论文 [Attention-aware Multi-stroke Style Transfer](https://arxiv.org/abs/1901.05127)。

## 模型历史：
风格迁移是用于艺术创作和图像编辑的强大技术，可以通过其他图像的风格重新编辑当前图像。受到卷积神经网络（CNN）在视觉感知任务中的强大启发，Gatys等人开辟了一个名为“神经风格转移”的新领域，
它首先引入神经表征来分离和重新组合任意图像的内容和风格。他们建议沿预训练网络分类器的处理层次提取内容特征和风格相关性（Gram矩阵）。
基于这项工作，业界已经提出了几种算法，通过基于优化的方法和前馈网络，并在泛化和效率问题方面加速开发。
风格迁移的成功使得用户可以从他们用手机拍摄的图片中创建艺术品。
尽管该领域已经取得了显着进展，但这些方法受到模型和特定风格之间的有限约束的影响。任意风格的PerModel快速风格转换方法（ASPM）被提出来克服这种困境。
一种可能的解决方案是协调内容特征和风格特征之间的高层次统计分布。虽然视觉质量和效率可以大大提高，但是由于以不加选择的方式处理不同的图像区域，例如AdaIN 和WCT，它们意外地为结果引入了扭曲畸变。
另一种解决方案是将内容特征补丁与训练的自动编码器的中间层上最相近的风格特征补丁交换。但是，当内容和风格图像之间存在巨大差异时，此方法可能会生成不充分的风格化结果。与StyleSwap相比，Avatar-Net进一步消除了内容和风格特征之间的领域差距，
导致更好的风格化结果，但它仍然无法保持视觉注意力与内容图像的空间分布，因此在语义方面造成了失真。 


## 技术特点:
AAMS是一种用于任意风格转移的注意力感知多笔触模型。AAMS模型鼓励内容图像和风格化图像之间的对应区域的注意力一致性（
指视觉注意力分布的空间一致性），并且实现多尺度多中心融合控制和自动笔画大小控制。具体而言，AAMS引入自注意力机制作为自
动编码器框架的补充。自注意力模块将位置处的响应计算为所有位置处的特征的加权和，这有助于捕获跨图像区域的长程依赖性。通过对自注意力组装的
自动编码器执行重建训练过程，注意力图可以掌握任何内容图像内的显著特征，同时使远程特征的
注意度一致。基于感受野和笔划大小之间的相关性，AAMS提出了一种多尺度风格交换模块，通过将内容特征与高级表示中的多尺度风格特征交换来混合不
同的笔划图案。我们将注意力图注入多尺度融合模块，以便和谐地合成不同的笔画模式，从而实现自动笔画大小控制。 

## 相关论文摘要：

神经风格转移引起了学术界和工业界的广泛关注。尽管视觉效果和效率已经显着提高，但是现有方法不能在内容图像和风格化图像之间协调视觉注意
的空间分布，或者通过不同的笔刷笔画呈现不同的细节水平。在本文中，我们通过开发注意感知的多笔划风格转移模型来解决这些局限性。我们首先
提出将自注意力机制组装成与风格无关的重构自动编码器框架，从该框架可以导出内容图像的注意力图。通过对内容特征和风格特征执行多尺度风格交
换，我们生成了多个反映不同笔触的特征图。本文进一步提出了一种灵活的融合策略，以结合来自注意力图的显着特征，其允许和谐地将多个笔划图
案集成到输出图像的不同空间区域中。丰富的实验展示了我们的方法的有效性，可以生成具有多种笔划模式的风格化图像，超越了SOTA方法。
 

## 模型领先性：

* 向自动编码器网络引入自注意力机制，允许捕获输入图像的关键特征和远程区域关系。
* 提出了多尺度风格交换，以打破高级特征空间中固定感受野的限制，并生成反映不同笔画模式的多个特征图。
* 通过结合注意力图，我们提出了一个应答融合策略将多个笔画图案和谐地融入输出图像的不同空间区域，使内容图像与风格化图像之间的注意力一致。
* 模型在自建风格迁移测试数据集上（150张图）测试并进行用户调研，与AdaIN，WCT，Avatar-Net算法相比，本算法在风格化效果和内容保真度两个维度上均第一。

| Method | Stylization Effects | Faithful to Content | 
| ------------ | ------------ | ------------ |  
| AdaIN | 0.17 | 0.29 | 
| WCT | 0.29  |  0.2|
| Avatar-Net | 0.2 | 0.08 | 
| Ours | **0.36** | **0.42** |


## 参数列表
给定内容图像和风格图像作为输入，风格迁移模型会自动地将内容图像的风格、纹理特征变换为风格图像的类型，同时保证图像的内容特征不变

* **content** (`string`) – url string of input content image.
* **style** (`string`) –  url string of input style image.
     

## 模型前处理
风格迁移模型适用于RGB通道的输入图像，内容图像和风格图像都需要是三通道图像。因此对于单通道的图像，需要进行图像颜色转换，变成RGB三通道的图像。

```python
        content = LoadImage.convert_to_ndarray(content)
        if len(content.shape) == 2:
            content = cv2.cvtColor(content, cv2.COLOR_GRAY2BGR)
        content_img = content.astype(np.float)

        style_img = LoadImage.convert_to_ndarray(style)
        if len(style_img.shape) == 2:
            style_img = cv2.cvtColor(style_img, cv2.COLOR_GRAY2BGR)
        style_img = style_img.astype(np.float)

        result = {'content': content_img, 'style': style_img}
```
 

## 模型forward参数
```python
        self.content = tf.get_default_graph().get_tensor_by_name('content:0')
        self.style = tf.get_default_graph().get_tensor_by_name('style:0')
        self.output = tf.get_default_graph().get_tensor_by_name('stylized_output:0')
        self.attention = tf.get_default_graph().get_tensor_by_name('attention_map:0')
        self.inter_weight = tf.get_default_graph().get_tensor_by_name('inter_weight:0')
        self.centroids = tf.get_default_graph().get_tensor_by_name('centroids:0')
```
    
* **content** (`tf tensor` of shape `(batch_size, H, W, C)`) – Tensor of input content image.
* **style** (`tf tensor` of shape `(batch_size, H, W, C)`) –  Tensor of input style image.
* **output** (`tf tensor` of shape `(batch_size, H, W, C)`) –  Tensor of stylized image.
* **attention** (`tf tensor` of shape `(batch_size, H, W, C)`) – Tensor of attention map .
* **inter_weight** (`tf tensor` of shape `(batch_size, H, W, C)`) –  Tensor of stylization weight, default is 1.0 .
* **centroids** (`tf tensor` of shape `(batch_size, H, W, C)`) – Tensor of centroids for attention areas clusters.
 

## 输出参数列表
模型推理结果为浮点numpy数组，为了将其转换为uint8图像，需要将取值范围约束在0~255之间，并缩放至原图大小进行输出。
```python
        output_img = cv2.cvtColor(output_img[0], cv2.COLOR_RGB2BGR)
        output_img = np.clip(output_img, 0, 255).astype(np.uint8)
        output_img = cv2.resize(output_img, (w, h))
```
* **output_img** (`np.array` of shape `( H, W, C)`) – image of stylized image.
