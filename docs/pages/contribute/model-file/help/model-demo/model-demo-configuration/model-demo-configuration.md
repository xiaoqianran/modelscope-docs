<!-- modelscope-docs: Model Demo Integration Process | contribute/model-file/help/model-demo/model-demo-configuration/model-demo-configuration_EN.md -->

# Model Demo Integration Process

## 1 Background

Objective: After a model is integrated into the ModelScope community, enable community users to experience the model directly through their browser with zero barriers.<br />Community users can experience the demo in the "Online Demo" section through the following methods:<br />1. Select examples provided by developers and replace input images or text, etc.<br />2. Upload their own images or input text to directly call the backend model.<br />Model demo examples are as follows:<br />[DCT-Net Portrait Cartoonization](https://modelscope.ai/models/damo/cv_unet_person-image-cartoon_compound-models/summary)<br />[OFA Image Captioning - English - General Domain - Large](https://modelscope.ai/models/damo/ofa_image-caption_coco_large_en/summary)<br />[RaNER Named Entity Recognition - Chinese - News Domain - Base](https://modelscope.ai/models/damo/nlp_raner_named-entity-recognition_chinese-base-news/summary)<br />[Paraformer Speech Recognition - Chinese - General - 16k - Offline](https://modelscope.ai/models/damo/speech_paraformer_asr_nat-zh-cn-16k-common-vocab8358-tensorflow1/summary)

## 2 Integration Method

First, model contributors need to have already completed ModelScope community integration. For specific integration methods, please refer to the documentation: [ModelScope Model Integration](https://modelscope.ai/docs/ModelScope%20Model%20Integration%20Process%20Overview)

### 1. Confirm Model Task Category

After model contributors complete model upload and community integration, the model's corresponding task type (such as general image segmentation, word segmentation, speech recognition, image captioning, etc.) and online demo display method have already been confirmed. Typically, we confirm the model's task type based on the tasks tag information in the model card. Currently supported task types can be referenced in the documentation: [Task Introduction](https://modelscope.ai/docs/Task%20Introduction)<br />If you cannot find your model's task type, please contact [contact@modelscope.ai](contact@modelscope.ai) and provide the model's readme and configuration to confirm the specific model task type.

### 2. Confirm Input and Output Formats for Task Category

After confirming the model's task category, click here to obtain the [model input](https://github.com/modelscope/modelscope/blob/master/modelscope/pipeline_inputs.py#L46) and [model output](https://github.com/modelscope/modelscope/blob/master/modelscope/outputs/outputs.py) definitions for the task type's input and output formats, and proceed with development.<br />If you cannot find the input/output definition for your task type, please contact [contact@modelscope.ai](contact@modelscope.ai)<br />Taking image classification as an example, the input and output definitions are as follows:<br />Input: A piece of text + image path<br />Output:

```json
{
  "scores": [0.9, 0.1, 0.05, 0.05],
  "labels": ["dog", "horse", "cow", "cat"]
}
```

### 3. Configure Model Card (README.md file) to Support Online Demo (Important)

> You can view all currently supported ModelScope demo tasks in the [Demo Gallery](https://modelscope.ai/tools/demo-gallery) and use the official [Demo Configurator](https://modelscope.ai/tools/demo-editor) to complete self-service configuration.

ModelScope model cards consist of two parts: yaml header and markdown body. For detailed explanations, please refer to [Model Card Documentation](https://www.modelscope.ai/docs/Model%20Cards). The Yaml header contains model meta information, where model contributors can configure demo widgets to achieve different online demo displays across various modalities.

**Note:** For widget-related configuration, see [widget configuration documentation](./widget%E9%85%8D%E7%BD%AE%E6%96%87%E6%A1%A3.md)

Please pay attention to using correct yaml format. You can use the official **Demo Configurator**, or validate the overall yaml header format through yaml parsers such as [YAML Online Editor](https://www.yamllint.com/).

Taking word segmentation as an example:

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
          - data: Alibaba Group's mission is to make it easy to do business anywhere
      - inputs:
          - data: The weather is nice today, perfect for going out
```

First, you need to specify the task type in the yaml data section, then complete the pipeline value mapping through input/output configuration, and finally provide multiple examples for default input. Specifically, on the frontend, clicking "Change Example" in the online demo will allow switching between multiple examples.

![image.png](./_resources/1668652672412-5864c221-6e01-4fab-8bfe-f74bed16ff0c.png)

Of course, non-text example inputs are also supported. For instance, in VQA task types, multiple input modes supporting both images and text are available:

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
            label: Image
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

Widget configuration example for speech recognition:

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

## 3 Official Launch

By configuring `enable: true` in the widget, you can activate the right-side online demo module, as shown below:

```yaml
widgets:
  - enable: true # Takes effect after saving and submitting
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
          - data: Alibaba Group's mission is to make it easy to do business anywhere
      - inputs:
          - data: The weather is nice today, perfect for going out
```