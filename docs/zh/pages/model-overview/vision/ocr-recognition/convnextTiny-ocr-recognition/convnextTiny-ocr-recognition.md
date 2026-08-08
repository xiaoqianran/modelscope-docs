<!-- modelscope-docs: convnextTiny_ocr-recognition | model-overview/vision/ocr-recognition/convnextTiny-ocr-recognition/convnextTiny-ocr-recognition_CN.md -->

## 模型概览
文本行识别是光学字符识别（OCR）技术的一个重要部分，有着众多的应用场景，丰富了人们的日常生活。读光文本行识别模型主要包括三个主要部分，Convolutional Backbone提取图像视觉特征，ConvTransformer Blocks用于对视觉特征进行上下文建模，最后连接CTC loss进行识别解码以及网络梯度优化。

### 模型链接
#### 读光识别模型
- [通用场景](https://www.modelscope.cn/models/damo/cv_convnextTiny_ocr-recognition-general_damo/summary)
- [手写场景](https://www.modelscope.cn/models/damo/cv_convnextTiny_ocr-recognition-handwritten_damo/summary)
- [文档印刷场景](https://www.modelscope.cn/models/damo/cv_convnextTiny_ocr-recognition-document_damo/summary)
- [自然场景](https://www.modelscope.cn/models/damo/cv_convnextTiny_ocr-recognition-scene_damo/summary)
- [车牌场景](https://www.modelscope.cn/models/damo/cv_convnextTiny_ocr-recognition-licenseplate_damo/summary)

#### CRNN开源模型
- [通用场景](https://www.modelscope.cn/models/damo/cv_crnn_ocr-recognition-general_damo/summary)

### 模型领先性
1. 采用前沿的ConvNext提取视觉特征与ViT建模上下文。
2. 在OCR领域的各个实际业务场景中，达到精度和速度更好的平衡。

### 模型配置项
读光文本行识别模型的超参数控制可以在下载下来的模型文件中找到configuration.json文件，配置参数格式如下:
```json
{
  "framework": "pytorch",
  "task": "ocr-recognition",
  "pipeline": {
      "type": "convnextTiny-ocr-recognition"
  },
  "model": {
      "type": "OCRRecognition",
      "recognizer": "ConvNextViT",
      "inference_kwargs": {
          "img_height": 32,
          "img_width": 300,
          "do_chunking": true
      }        
  },
  "preprocessor": {
      "type": "ocr-recognition"        
  }   
}

```

## 模型推理
### 模型输入
模型输入可为文本行图像的url地址、PIL.Image格式或np.ndarray格式。
注意：输入图片应为包含文字的单行文本图片。其它如多行文本图片、非文本图片等可能没有返回结果，此时表示模型的识别结果也可能为空。

### 模型输出
模型输出为文本行图像的内容，为字符串形式。

### 快速使用示例
在安装完成ModelScope之后即可使用ocr-recognition的能力。(在notebook的CPU环境或GPU环境均可使用)
输入下列代码。
```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
import cv2
ocr_recognition = pipeline(Tasks.ocr_recognition, model='damo/cv_convnextTiny_ocr-recognition-general_damo')
### 使用url
img_url = 'http://duguang-labelling.oss-cn-shanghai.aliyuncs.com/mass_img_tmp_20220922/ocr_recognition.jpg'
result = ocr_recognition(img_url)
print(result)
### 使用图像文件，请准备好名为'ocr_recognition.jpg'的图像文件
# img_path = 'ocr_recognition.jpg'
# img = cv2.imread(img_path)
# result = ocr_recognition(img)
# print(result)
```

### 选择定制化的场景进行文字识别
上面展示的是[通用场景](https://www.modelscope.cn/models/damo/cv_convnextTiny_ocr-recognition-general_damo/summary)的文本行识别过程。
此外，我们还有[手写场景](https://www.modelscope.cn/models/damo/cv_convnextTiny_ocr-recognition-handwritten_damo/summary)、[文档印刷场景](https://www.modelscope.cn/models/damo/cv_convnextTiny_ocr-recognition-document_damo/summary)、[自然场景](https://www.modelscope.cn/models/damo/cv_convnextTiny_ocr-recognition-scene_damo/summary)和[车牌场景](https://www.modelscope.cn/models/damo/cv_convnextTiny_ocr-recognition-licenseplate_damo/summary)的定制化文本行识别场景，以及[通用场景行检测](https://modelscope.cn/models/damo/cv_resnet18_ocr-detection-line-level_damo/summary)和[通用场景单词检测](https://modelscope.cn/models/damo/cv_resnet18_ocr-detection-word-level_damo/summary)的文本检测场景，欢迎使用！
如需体验**_完整OCR能力_**，请参考[通用场景整图检测识别](https://modelscope.cn/studios/damo/cv_ocr-text-spotting/summary)。

## 模型训练与微调
即将上线，敬请期待！
