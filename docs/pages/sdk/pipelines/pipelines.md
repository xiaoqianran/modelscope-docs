<!-- modelscope-docs: Model Inference Pipeline | sdk/pipelines/pipelines_EN.md -->

# Model Inference

In deep learning, inference refers to the model's prediction process. ModelScope performs inference using pipelines to execute the required operations. A complete pipeline typically includes three processes: data preprocessing, model forward inference, and data post-processing.

# Pipeline Introduction

The `pipeline()` method is one of the most fundamental user methods in the ModelScope framework, enabling rapid inference across multiple domains and various models. With the `pipeline()` method, users can complete model inference for specific tasks with just a single line of code.

# Using Pipelines

This article provides a brief introduction on how to use the `pipeline` method to load models for inference. The `pipeline` method supports pulling models from the model repository based on task type and model name for inference, covering the following aspects:

- Environment setup
- Important parameters
- Basic pipeline usage
- Specifying preprocessing and models for inference
- Pipeline usage examples for different scenario tasks

## Environment Setup

For detailed steps, please refer to the [Environment Installation Guide](../quick-start/environment-installation.md).

## Important Parameters

### Pipeline Constructor Parameters
```
task: Task name (required)
model: Model name or model instance (optional). Uses the default model for the task if not specified
preprocessor: Preprocessor instance (optional). Uses the preprocessor from the model configuration file if not specified
device: Execution device (optional). Values: cpu, cuda, gpu, gpu:X or cuda:X (default: gpu)
device_map: Mapping of model parameters to execution devices (optional). Cannot be configured simultaneously with device. Values: auto, balance, balanced_low_0, sequential, or mapping dict
```

### Pipeline Call Parameters
```
batch_size: Mini-batch size for batch inference (optional). Batch inference is not performed if not specified
```

Currently, some tasks support the `batch_size` parameter. Please refer to the `Batch Inference` section below for details.

For default configurations when no model is specified, please see [Default Configurations for Inference Tasks](./detailed-tutorials/pipeline-default-configurations.md).

## Basic Pipeline Usage

Taking Chinese word segmentation as an example, here's the basic usage of the pipeline function.

1. The pipeline function supports specifying a particular task name, loading the default model for that task, and creating the corresponding pipeline object.

Execute the following Python code:
```python
from modelscope.pipelines import pipeline
word_segmentation = pipeline('word-segmentation')
```

2. Input text
```python
input_str = '今天天气不错，适合出去游玩'
print(word_segmentation(input_str))

# Output
{'output': '今天 天气 不错 ， 适合 出去 游玩'}
```

3. Input multiple samples

Pipeline objects also support passing a list of multiple samples as input, returning a corresponding output list where each element corresponds to the result of the input sample. The inference method for multiple texts involves processing each input data item individually through an iterator within the pipeline and appending the results to the same return list.

```python
inputs =  ['今天天气不错，适合出去游玩','这本书很好，建议你看看']
print(word_segmentation(inputs))

# Output
[{'output': ['今天', '天气', '不错', '，', '适合', '出去', '游玩']}, {'output': ['这', '本', '书', '很', '好', '，', '建议', '你', '看看']}]
```

4. Batch inference

Pipeline's support for batch inference is similar to "inputting multiple texts" above, with the difference being that it implements batch forward inference during the model's forward process at the user-specified `batch_size` scale.

```python
inputs =  ['今天天气不错，适合出去游玩','这本书很好，建议你看看']
# Specify batch_size parameter to enable batch inference
print(word_segmentation(inputs, batch_size=2))

# Output
[{'output': ['今天', '天气', '不错', '，', '适合', '出去', '游玩']}, {'output': ['这', '本', '书', '很', '好', '，', '建议', '你', '看看']}]
```

Officially supported models and pipelines for batch inference in ModelScope include:

- Various models for text classification tasks in NLP (including sentiment analysis, sentence similarity, natural language inference, or user-finetuned models) and their pipelines
- Various models for sequence labeling tasks in NLP (including Chinese word segmentation, multilingual word segmentation, various NER task models, or user-finetuned models) and their pipelines
- Various models for generation tasks in NLP (including Palm, T5, etc.) and their pipelines
- CSANMT translation task model

4. Input a dataset

```python
from modelscope.msdatasets import MsDataset
from modelscope.pipelines import pipeline

inputs = ['今天天气不错，适合出去游玩', '这本书很好，建议你看看']
dataset = MsDataset.load(inputs, target='sentence')
word_segmentation = pipeline('word-segmentation')
outputs = word_segmentation(dataset)
for o in outputs:
    print(o)

# Output
{'output': ['今天', '天气', '不错', '，', '适合', '出去', '游玩']}
{'output': ['这', '本', '书', '很', '好', '，', '建议', '你', '看看']}
```

## Specifying Preprocessing and Models for Inference

The pipeline function supports passing instantiated preprocessor and model objects, allowing users to customize preprocessing and models during inference.

1. Create a model object for inference
```python
from modelscope.models import Model
from modelscope.pipelines import pipeline

model = Model.from_pretrained('damo/nlp_structbert_word-segmentation_chinese-base')
word_segmentation = pipeline('word-segmentation', model=model)
input = '今天天气不错，适合出去游玩'
print(word_segmentation(input))
{'output': ['今天', '天气', '不错', '，', '适合', '出去', '游玩']}
```

2. Create preprocessor and model objects for inference

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

Different models and tasks use different preprocessors. You can choose to view different documentation based on your area of interest:

- For preprocessing used in inference and training of various tasks, please refer to [Best Practices for Various Tasks](./best-practices-for-various-tasks/task-introduction.md)

## Pipeline Usage Examples for Different Scenario Tasks

### Image
Taking portrait matting ('portrait-matting') as an example:

Input image:

![image_matting.png](./_resources/1656989748829-9ab3aa9b-461d-44f8-98fb-c85bc6f670f9.png)

```python
import cv2
from modelscope.pipelines import pipeline

portrait_matting = pipeline('portrait-matting')
result = portrait_matting('https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/image_matting.png')
cv2.imwrite('result.png', result['output_img'])
```
Output:
![result.png](./_resources/1656989768092-5470f8ac-cda8-4703-ac98-dbb6fd675b34.png)

### Audio
Taking text-to-speech ('text-to-speech') as an example (note: current ModelScope TTS capability requires Python 3.7 and Linux environment; support will be expanded in the future)
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

### Multimodal
Taking multimodal representation model as an example:

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

# Currently Supported Task List

Below is the current list of supported task types (strings) along with their corresponding aliases (for easier management). In ModelScope's provided APIs, you can directly use strings as task parameters, for example:
```python
from modelscope.pipelines import pipeline
pipe = pipeline('portrait-matting')
```
You can also use `Tasks.alias`, for example:
```python
from modelscope.utils.constant import Tasks
pipe = pipeline(Tasks.portrait_matting)
```
Support for more tasks is **continuously expanding**. You can select your preferred models through the task categories on the ModelScope page, or obtain example code for each model from the specific model's page.

### Vision
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

### Natural Language Processing
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

### Audio
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

### Multimodal
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

### Science

```jax
 # Protein
 protein_structure = 'protein-structure'
```