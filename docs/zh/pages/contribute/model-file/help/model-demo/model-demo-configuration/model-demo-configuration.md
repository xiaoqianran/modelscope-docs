<!-- modelscope-docs: 模型Demo接入流程 | contribute/model-file/help/model-demo/model-demo-configuration/model-demo-configuration_CN.md -->

# 模型Demo接入流程

## 一 背景

目标：模型接入 ModelScope 魔搭社区后，让社区用户通过浏览器直接零门槛体验模型。<br />社区用户可以在"在线体验"的地方通过以下方式体验 demo。<br />1.选择开发者提供的例子，更换输入的图片或文本等。<br />2.自己上传图片或输入文本，直接调用后端模型。<br />模型体验示例如下：<br />[DCT-Net 人像卡通化](https://modelscope.cn/models/damo/cv_unet_person-image-cartoon_compound-models/summary)<br />[OFA 图像描述-英文-通用领域-large](https://modelscope.cn/models/damo/ofa_image-caption_coco_large_en/summary)<br />[RaNER 命名实体识别-中文-新闻领域-base](https://modelscope.cn/models/damo/nlp_raner_named-entity-recognition_chinese-base-news/summary)<br />[Paraformer 语音识别-中文-通用-16k-离线](https://modelscope.cn/models/damo/speech_paraformer_asr_nat-zh-cn-16k-common-vocab8358-tensorflow1/summary)

## 二 接入方式

首先模型贡献者需要模型已经完成 ModelScope 社区的接入，具体接入方式参考文档：[ModelScope 模型接入](https://modelscope.cn/docs/ModelScope%E6%A8%A1%E5%9E%8B%E6%8E%A5%E5%85%A5%E6%B5%81%E7%A8%8B%E6%A6%82%E8%A7%88)

### 1.确认模型任务类别

当模型贡献者完成模型上传和接入社区后，模型对应的任务类型（如通用图像分割，分词，语音识别，图像描述等）和在线体验展示方式均已经被确认，通常我们根据模型卡片中的 tasks 标签信息，来确认模型的任务类型，目前支持的任务类型可以参考文档：[任务的介绍](https://modelscope.cn/docs/%E4%BB%BB%E5%8A%A1%E7%9A%84%E4%BB%8B%E7%BB%8D)<br />如果没有找到模型的任务类型，请联系[contact@modelscope.cn](contact@modelscope.cn)，提供模型的 readme 和 configuration，确认具体的模型任务类型。

### 2.确认任务类别的输入和输出格式

确认模型的任务类别后，点击此处获取[模型输入](https://github.com/modelscope/modelscope/blob/master/modelscope/pipeline_inputs.py#L46)和[模型输出](https://github.com/modelscope/modelscope/blob/master/modelscope/outputs/outputs.py)定义任务类型的输入与输出格式，并开发。<br />如果没有找到任务类型的输入输出定义，请联系[contact@modelscope.cn](contact@modelscope.cn)<br />以下图片分类为例，输入和输出定义如下：<br />输入：一段文本 + 图片路径<br />输出:

```json
{
  "scores": [0.9, 0.1, 0.05, 0.05],
  "labels": ["dog", "horse", "cow", "cat"]
}
```

### 3.配置模型卡片（README.md 文件）来支持在线体验（重要）

> 您可以在 [Demo 中心](https://modelscope.cn/tools/demo-gallery) 查看目前 ModelScope 所有已支持 Demo 的 task，并使用官方的 [Demo 配置器](https://modelscope.cn/tools/demo-editor) 完成自主配置。

ModelScope 的模型卡片分为 yaml header 和 markdown 主体两部分，具体说明可以参考[模型卡片说明](https://www.modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E5%8D%A1%E7%89%87)。这其中 Yaml heder 包含的是模型的 meta 信息，模型贡献者可以在这里配置 demo widget，从而实现不同模态上不一样的在线体验展示。

**注：** widget 相关配置见 [widget 配置文档](./widget%E9%85%8D%E7%BD%AE%E6%96%87%E6%A1%A3.md)

请注意使用正确的 yaml 格式，可以使用官方的 **Demo 配置器**，或者通过 yaml parser，例如[YAML 在线编辑器](https://www.yamllint.com/)来做整体 yaml header 的格式验证。

以分词为例，示例如下：

```yaml
widgets:
  - version: 1
    task: word-segmentation
    inputs:
      - type: text
        displayType: TextArea
        validator:
          max_words: 128
    output:
      displayType: WordSegmentation
      displayValueMapping: output
    examples:
      - inputs:
          - data: 阿里巴巴集团的使命是让天下没有难做的生意
      - inputs:
          - data: 今天天气不错，适合出去游玩
```

首先，需要在 yaml 数据部分指定任务的类型，然后通过配置输入输出完成 pipeline 值的映射，
最后可以提供多个示例用于默认输入，具体前端体现在点击在线体验的“更换示例”即可更换多个示例。

![image.png](./_resources/1668652672412-5864c221-6e01-4fab-8bfe-f74bed16ff0c.png)

当然，也可以支持非文本的示例输入，如 VQA 任务类型中，支持图片和文本的多种输入模式

```yaml
widgets:
  - version: 1
    task: visual-question-answering
    examples:
      - inputs:
          - data: https://alice-open.oss-cn-zhangjiakou.aliyuncs.com/mPLUG/image_mplug_vqa_5.jpg
          - data: what name is this guy?
    inputs:
      - type: image
        displayType: ImageUploader
        displayProps:
          label:
            label: 图片
            bgColor: rgba(93,191,119,0.8)
        validator:
          max_size: 10M
          max_resolution: 5000*5000
        name: image
      - type: text
        displayType: TextArea
        name: question
        validator:
          max_words: 300
    output:
      displayType: Text
      displayValueMapping: text
```

语音识别的 widget 配置示例：

```yaml
widgets:
  - version: 1
    task: auto-speech-recognition
    examples:
      - inputs:
          - data: https://isv-data.oss-cn-hangzhou.aliyuncs.com/ics/MaaS/ASR/test_audio/asr_example_zh.wav
    inputs:
      - type: audio
        displayType: AudioUploader
        validator:
          max_size: 10M
    output:
      displayType: Text
      displayValueMapping: text
```

## 三 正式上线

通过在 widget 中配置 `enable: true` 即可打开右侧在线体验模块，即：

```yaml
widgets:
  - enable: true # 保存提交后即可生效
    version: 1
    task: word-segmentation
    inputs:
      - type: text
        displayType: TextArea
        validator:
          max_words: 128
    output:
      displayType: WordSegmentation
      displayValueMapping: output
    examples:
      - inputs:
          - data: 阿里巴巴集团的使命是让天下没有难做的生意
      - inputs:
          - data: 今天天气不错，适合出去游玩
```
