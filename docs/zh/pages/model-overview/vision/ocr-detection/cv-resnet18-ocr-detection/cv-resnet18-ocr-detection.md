<!-- modelscope-docs: cv_resnet18_ocr-detection | model-overview/vision/ocr-detection/cv-resnet18-ocr-detection/cv-resnet18-ocr-detection_CN.md -->

# cv_resnet18_ocr-detection

## 模型概览
文字检测是光学字符识别（OCR）技术的一个重要部分，有着众多的应用场景，丰富了人们的日常生活。读光文字检测模型是以自底向上的方式，先检测文本块和文字行之间的吸引排斥关系，然后对文本块聚类成行，最终输出文字行的外接框的坐标值。

### 模型链接
- [通用中英场景文行检测](https://www.modelscope.cn/models/damo/cv_resnet18_ocr-detection-line-level_damo/summary)
- [通用英文场景单词检测](https://www.modelscope.cn/models/damo/cv_resnet18_ocr-detection-word-level_damo/summary)


### 模型领先性
1. 采用自底向上的文字检测方法，能够适应不同长度和形状的文字检测。
2. 在OCR领域的各个实际业务场景中，达到精度和速度更好的平衡。

### 模型配置项
读光文本检测模型的超参数控制可以在下载下来的模型文件中找到configuration.json文件，配置参数格式如下:
```json
{
  "task": "ocr-detection",
  "framework": "tensorflow",
  "pipeline": {
    "type": "resnet18-ocr-detection"
  }
}
```

## 模型推理
### 模型输入
模型输入可为图像的url地址、PIL.Image格式或np.ndarray格式。
注意：输入图片应为包含文字的图片。其它如非文本图片等可能没有返回结果，此时表示模型的文字检测结果也可能为空。

### 模型输出
模型输出为文字区域的外接框坐标，一般用四边形的四个点表示。
```
    {
       "polygons": [
           [x1, y1, x2, y2, x3, y3, x4, y4],
           ……
       ],
   }
```

### 快速使用示例
在安装完成ModelScope之后即可使用ocr-detection的能力。(在notebook的CPU环境或GPU环境均可使用)
输入下列代码。
```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
ocr_detection = pipeline(Tasks.ocr_detection, model='damo/cv_resnet18_ocr-detection-line-level_damo')
result = ocr_detection('https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/ocr_detection.jpg')
print(result)
```

### 选择定制化的场景进行文字检测
上面展示的是[通用中英文场景行检测](https://modelscope.cn/models/damo/cv_resnet18_ocr-detection-line-level_damo/summary)的文字检测过程。
此外，我们还有[通用英文场景单词检测](https://modelscope.cn/models/damo/cv_resnet18_ocr-detection-word-level_damo/summary)的单词检测场景模型。
另外，也欢迎使用配套的文字行识别模型，如[通用场景](https://www.modelscope.cn/models/damo/cv_convnextTiny_ocr-recognition-general_damo/summary)、[手写场景](https://www.modelscope.cn/models/damo/cv_convnextTiny_ocr-recognition-handwritten_damo/summary)、[文档印刷场景](https://www.modelscope.cn/models/damo/cv_convnextTiny_ocr-recognition-document_damo/summary)、[自然场景](https://www.modelscope.cn/models/damo/cv_convnextTiny_ocr-recognition-scene_damo/summary)和[车牌场景](https://www.modelscope.cn/models/damo/cv_convnextTiny_ocr-recognition-licenseplate_damo/summary)，欢迎使用！
如需体验**_完整OCR能力_**，请参考[通用场景整图检测识别](https://modelscope.cn/studios/damo/cv_ocr-text-spotting/summary)。

## 模型训练与微调
即将上线，敬请期待！
