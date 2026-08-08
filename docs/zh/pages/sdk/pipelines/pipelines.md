<!-- modelscope-docs: 模型推理Pipeline | sdk/pipelines/pipelines_CN.md -->

# 模型的推理

推理在深度学习中表示模型的预测过程。ModelScope的推理会使用pipeline来执行所需要的操作。一个完整的pipeline一般包括了数据的前处理、模型的前向推理、数据的后处理三个过程。

# Pipeline介绍

pipeline()方法是ModelScope框架上最基础的用户方法之一，可对多领域的多种模型进行快速推理。通过pipeline()方法，用户可以只需要一行代码即可完成对特定任务的模型推理。

# Pipeline的使用
本文简单介绍如何使用`pipeline`方法加载模型进行推理。`pipeline`方法支持按照任务类型、模型名称从模型仓库拉取模型进行进行推理，包含以下几个方面：

- 环境准备
- 重要参数
- Pipeline基本用法
- 指定预处理、模型进行推理
- 不同场景任务推理pipeline使用示例

## 环境准备
详细步骤可以参考[环境安装指南](../快速入门/环境安装.md)。

## 重要参数

### pipeline构造参数
```
task: 任务名称，必填
model: 模型名称或模型实例，可选。不填时使用该任务默认模型
preprocessor: 预处理器实例，可选。不填时使用模型配置文件中的预处理器
device: 运行设备，可选。值为cpu, cuda, gpu, gpu:X or cuda:X，默认gpu
device_map: 模型参数到运行设备的映射，可选，不可与device同时配置。值为auto, balance, balanced_low_0, sequential或映射dict
```

### pipeline调用时参数
```
batch_size: 批量推理的mini-batch大小，可选。不传时不进行批量推理
```
目前部分任务支持batch_size参数，具体请查看下面的`批量推理`章节。

不指定模型时的默认配置后续可以查看[推理任务的默认配置](./详细教程/Pipeline默认配置.md)。

## Pipeline基本用法
下面以中文分词任务为例，说明pipeline函数的基本用法。

1.  pipeline函数支持指定特定任务名称，加载任务默认模型，创建对应pipeline对象。
执行如下python代码 ：
```python
from modelscope.pipelines import pipeline
word_segmentation = pipeline('word-segmentation')
```

2.  输入文本 
```python
input_str = '今天天气不错，适合出去游玩'
print(word_segmentation(input_str))

# 输出
{'output': '今天 天气 不错 ， 适合 出去 游玩'}
```

3.  输入多条样本 

pipeline对象也支持传入多个样本列表输入，返回对应输出列表，每个元素对应输入样本的返回结果。多条文本的推理方式是输入data在pipeline内部用迭代器单条处理后append到同一个返回List中。

```python
inputs =  ['今天天气不错，适合出去游玩','这本书很好，建议你看看']
print(word_segmentation(inputs))

# 输出
[{'output': ['今天', '天气', '不错', '，', '适合', '出去', '游玩']}, {'output': ['这', '本', '书', '很', '好', '，', '建议', '你', '看看']}]
```

4. 批量推理

pipeline对于批量推理的支持类似于上面的“输入多条文本”，区别在于会在用户指定的batch_size尺度上，在模型forward过程实现批量前向推理。

```python
inputs =  ['今天天气不错，适合出去游玩','这本书很好，建议你看看']
# 指定batch_size参数来支持批量推理
print(word_segmentation(inputs, batch_size=2))

# 输出
[{'output': ['今天', '天气', '不错', '，', '适合', '出去', '游玩']}, {'output': ['这', '本', '书', '很', '好', '，', '建议', '你', '看看']}]
```

ModelScope官方已经支持的批量推理的模型和Pipeline有：

- NLP领域各文本分类任务对应的各模型（包括情感分析、句子相似度、自然语言推理或用户Finetune后的模型）和Pipeline
- NLP领域各序列标注任务对应的各模型（包括中文分词、多语言分词、各NER任务的模型，或用户FInetune后得到的模型）和Pipeline
- NLP领域生成任务对应的各模型（包含Palm、T5等）和Pipeline
- NLP领域翻译任务模型CSANMT

4. 输入一个数据集

```python
from modelscope.msdatasets import MsDataset
from modelscope.pipelines import pipeline

inputs = ['今天天气不错，适合出去游玩', '这本书很好，建议你看看']
dataset = MsDataset.load(inputs, target='sentence')
word_segmentation = pipeline('word-segmentation')
outputs = word_segmentation(dataset)
for o in outputs:
    print(o)

# 输出
{'output': ['今天', '天气', '不错', '，', '适合', '出去', '游玩']}
{'output': ['这', '本', '书', '很', '好', '，', '建议', '你', '看看']}
```

## 指定预处理、模型进行推理
pipeline函数支持传入实例化的预处理对象、模型对象，从而支持用户在推理过程中定制化预处理、模型。

1. 创建模型对象进行推理
```python
from modelscope.models import Model
from modelscope.pipelines import pipeline

model = Model.from_pretrained('damo/nlp_structbert_word-segmentation_chinese-base')
word_segmentation = pipeline('word-segmentation', model=model)
input = '今天天气不错，适合出去游玩'
print(word_segmentation(input))
{'output': ['今天', '天气', '不错', '，', '适合', '出去', '游玩']}
```

2. 创建预处理器和模型对象进行推理

```python
from modelscope.models import Model
from modelscope.pipelines import pipeline
from modelscope.preprocessors import Preprocessor, TokenClassificationTransformersPreprocessor

model = Model.from_pretrained('damo/nlp_structbert_word-segmentation_chinese-base')
tokenizer = Preprocessor.from_pretrained(model.model_dir)
# Or call the constructor directly: 
# tokenizer = TokenClassificationTransformersPreprocessor(model.model_dir)
word_segmentation = pipeline('word-segmentation', model=model, preprocessor=tokenizer)
input = '今天天气不错，适合出去游玩'
print(word_segmentation(input))
{'output': ['今天', '天气', '不错', '，', '适合', '出去', '游玩']}
```

不同模型和任务会使用不同的预处理器。您可以根据您感兴趣的方向来选择查看不同的文档：

- 预处理用于各任务推理和训练可以查看[各任务最佳实践](./各任务最佳实践/任务的介绍.md)

## 不同场景任务推理pipeline使用示例

### 图像
以人像抠图（'portrait-matting'）为例
输入图片：

![image_matting.png](./_resources/1656989748829-9ab3aa9b-461d-44f8-98fb-c85bc6f670f9.png)

```python
import cv2
from modelscope.pipelines import pipeline

portrait_matting = pipeline('portrait-matting')
result = portrait_matting('https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/image_matting.png')
cv2.imwrite('result.png', result['output_img'])
```
输出：
![result.png](./_resources/1656989768092-5470f8ac-cda8-4703-ac98-dbb6fd675b34.png)
### 语音
以（'text-to-speech'）为例（注意，当前ModelScope版本tts能力体验依赖python3.7，linux环境，后续会进行扩展）
```python
from scipy.io.wavfile import write
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.outputs import OutputKeys


text = '今天北京天气怎么样？'

sambert_hifigan_tts =pipeline(
    task=Tasks.text_to_speech, model='damo/speech_sambert-hifigan_tts_zhizhe_emo_zh-cn_16k')
output = sambert_hifigan_tts(input=text)
pcm = output[OutputKeys.OUTPUT_PCM]
write('output.wav', 16000, pcm)
```
### 多模态
以多模态表征模型为例：

```python
from modelscope.models import Model
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from PIL import Image
import requests

model = Model.from_pretrained('damo/multi-modal_gemm-vit-large-patch14_generative-multi-modal-embedding')
p = pipeline(task=Tasks.generative_multi_modal_embedding, model=model)

url = 'http://clip-multimodal.oss-cn-beijing.aliyuncs.com/lingchen/demo/dogs.jpg'
image = Image.open(requests.get(url, stream=True).raw)
text = 'dogs playing in the grass'

img_embedding = p.forward({'image': image})['img_embedding']
print('image embedding: {}'.format(img_embedding))

text_embedding = p.forward({'text': text})['text_embedding']
print('text embedding: {}'.format(text_embedding))

image_caption = p.forward({'image': image, 'captioning': True})['caption']
print('image caption: {}'.format(image_caption))
```

# 当前支持的Task列表
以下给出当前支持的 task 类型列表（字符串），以及相应的别名（便于管理）。在ModelScope提供的API中，可直接使用字符串作为task入参，比如
```python
from modelscope.pipelines import pipeline
pipe = pipeline('portrait-matting')
```
也可以使用Tasks.别名，比如
```python
from modelscope.utils.constant import Tasks
pipe = pipeline(Tasks.portrait_matting)
```
更多的任务支持也在**不断扩展**中。大家可以通过ModelScope页面上的任务分类来选择心仪的模型，也可以从具体模型的页面上，来获取每个模型使用时对应的范例代码。
### 视觉
```jsx
    # ocr
    ocr_detection = 'ocr-detection'
    ocr_recognition = 'ocr-recognition'
    table_recognition = 'table-recognition'
    license_plate_detection = 'license-plate-detection'

    # human face body related
    animal_recognition = 'animal-recognition'
    face_detection = 'face-detection'
    face_liveness = 'face-liveness'
    card_detection = 'card-detection'
    face_recognition = 'face-recognition'
    face_recognition_ood = 'face-recognition-ood'
    facial_expression_recognition = 'facial-expression-recognition'
    facial_landmark_confidence = 'facial-landmark-confidence'
    face_processing_base = 'face-processing-base'
    face_attribute_recognition = 'face-attribute-recognition'
    face_2d_keypoints = 'face-2d-keypoints'
    human_detection = 'human-detection'
    human_object_interaction = 'human-object-interaction'
    face_image_generation = 'face-image-generation'
    body_2d_keypoints = 'body-2d-keypoints'
    body_3d_keypoints = 'body-3d-keypoints'
    hand_2d_keypoints = 'hand-2d-keypoints'
    general_recognition = 'general-recognition'
    human_wholebody_keypoint = 'human-wholebody-keypoint'

    image_classification = 'image-classification'
    image_multilabel_classification = 'image-multilabel-classification'
    image_classification_imagenet = 'image-classification-imagenet'
    image_classification_dailylife = 'image-classification-dailylife'

    image_object_detection = 'image-object-detection'
    video_object_detection = 'video-object-detection'
    image_fewshot_detection = 'image-fewshot-detection'

    image_segmentation = 'image-segmentation'
    semantic_segmentation = 'semantic-segmentation'
    image_depth_estimation = 'image-depth-estimation'
    indoor_layout_estimation = 'indoor-layout-estimation'
    video_depth_estimation = 'video-depth-estimation'
    panorama_depth_estimation = 'panorama-depth-estimation'
    portrait_matting = 'portrait-matting'
    text_driven_segmentation = 'text-driven-segmentation'
    shop_segmentation = 'shop-segmentation'
    hand_static = 'hand-static'
    face_human_hand_detection = 'face-human-hand-detection'
    face_emotion = 'face-emotion'
    product_segmentation = 'product-segmentation'
    image_matching = 'image-matching'

    crowd_counting = 'crowd-counting'

    # image editing
    skin_retouching = 'skin-retouching'
    image_super_resolution = 'image-super-resolution'
    image_colorization = 'image-colorization'
    image_color_enhancement = 'image-color-enhancement'
    image_denoising = 'image-denoising'
    image_deblurring = 'image-deblurring'
    image_portrait_enhancement = 'image-portrait-enhancement'
    image_inpainting = 'image-inpainting'
    image_skychange = 'image-skychange'

    # image generation
    image_to_image_translation = 'image-to-image-translation'
    image_to_image_generation = 'image-to-image-generation'
    image_style_transfer = 'image-style-transfer'
    image_portrait_stylization = 'image-portrait-stylization'
    image_body_reshaping = 'image-body-reshaping'
    image_embedding = 'image-embedding'
    image_face_fusion = 'image-face-fusion'
    product_retrieval_embedding = 'product-retrieval-embedding'

    # video recognition
    live_category = 'live-category'
    action_recognition = 'action-recognition'
    action_detection = 'action-detection'
    video_category = 'video-category'
    video_embedding = 'video-embedding'
    virtual_try_on = 'virtual-try-on'
    movie_scene_segmentation = 'movie-scene-segmentation'
    language_guided_video_summarization = 'language-guided-video-summarization'
    vop_retrieval = 'video-text-retrieval'

    # video segmentation
    video_object_segmentation = 'video-object-segmentation'
    referring_video_object_segmentation = 'referring-video-object-segmentation'
    video_human_matting = 'video-human-matting'

    # video editing
    video_inpainting = 'video-inpainting'
    video_frame_interpolation = 'video-frame-interpolation'
    video_stabilization = 'video-stabilization'
    video_super_resolution = 'video-super-resolution'

    # reid and tracking
    video_single_object_tracking = 'video-single-object-tracking'
    video_multi_object_tracking = 'video-multi-object-tracking'
    video_summarization = 'video-summarization'
    image_reid_person = 'image-reid-person'

    # pointcloud task
    pointcloud_sceneflow_estimation = 'pointcloud-sceneflow-estimation'
    # image multi-view depth estimation
    image_multi_view_depth_estimation = 'image-multi-view-depth-estimation'

    # domain specific object detection
    domain_specific_object_detection = 'domain-specific-object-detection'
```
### 自然语言处理
```jsx
    # nlp tasks
    word_segmentation = 'word-segmentation'
    part_of_speech = 'part-of-speech'
    named_entity_recognition = 'named-entity-recognition'
    nli = 'nli'
    sentiment_classification = 'sentiment-classification'
    sentiment_analysis = 'sentiment-analysis'
    sentence_similarity = 'sentence-similarity'
    text_classification = 'text-classification'
    sentence_embedding = 'sentence-embedding'
    text_ranking = 'text-ranking'
    relation_extraction = 'relation-extraction'
    zero_shot = 'zero-shot'
    translation = 'translation'
    token_classification = 'token-classification'
    conversational = 'conversational'
    text_generation = 'text-generation'
    text2text_generation = 'text2text-generation'
    task_oriented_conversation = 'task-oriented-conversation'
    dialog_intent_prediction = 'dialog-intent-prediction'
    dialog_state_tracking = 'dialog-state-tracking'
    table_question_answering = 'table-question-answering'
    fill_mask = 'fill-mask'
    text_summarization = 'text-summarization'
    question_answering = 'question-answering'
    code_translation = 'code-translation'
    code_generation = 'code-generation'
    zero_shot_classification = 'zero-shot-classification'
    backbone = 'backbone'
    text_error_correction = 'text-error-correction'
    faq_question_answering = 'faq-question-answering'
    information_extraction = 'information-extraction'
    document_segmentation = 'document-segmentation'
    extractive_summarization = 'extractive-summarization'
    feature_extraction = 'feature-extraction'
    translation_evaluation = 'translation-evaluation'
    sudoku = 'sudoku'
    text2sql = 'text2sql'
```

### 语音
```jsx
    # audio tasks
    auto_speech_recognition = 'auto-speech-recognition'
    text_to_speech = 'text-to-speech'
    speech_signal_process = 'speech-signal-process'
    speech_separation = 'speech-separation'
    acoustic_echo_cancellation = 'acoustic-echo-cancellation'
    acoustic_noise_suppression = 'acoustic-noise-suppression'
    keyword_spotting = 'keyword-spotting'
    inverse_text_processing = 'inverse-text-processing'
    punctuation = 'punctuation'
    speaker_verification = 'speaker-verification'
```
### 多模态
```jsx
    # multi-modal tasks
    image_captioning = 'image-captioning'
    visual_grounding = 'visual-grounding'
    text_to_image_synthesis = 'text-to-image-synthesis'
    multi_modal_embedding = 'multi-modal-embedding'
    generative_multi_modal_embedding = 'generative-multi-modal-embedding'
    multi_modal_similarity = 'multi-modal-similarity'
    visual_question_answering = 'visual-question-answering'
    visual_entailment = 'visual-entailment'
    video_multi_modal_embedding = 'video-multi-modal-embedding'
    image_text_retrieval = 'image-text-retrieval'
    document_vl_embedding = 'document-vl-embedding'
    video_captioning = 'video-captioning'
    video_question_answering = 'video-question-answering'
```

### 科学

```jax
 # 蛋白质
 protein_structure = 'protein-structure'
```

