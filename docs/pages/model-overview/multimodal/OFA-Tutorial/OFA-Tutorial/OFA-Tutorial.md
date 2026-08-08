<!-- modelscope-docs: OFA Tutorial | model-overview/multimodal/OFA-Tutorial/OFA-Tutorial/OFA-Tutorial_EN.md -->

# 0. What is OFA?
OFA (One-For-All) is a general-purpose multimodal pre-trained model developed by the M6 team at Tongyi Lab. It unifies modalities (cross-modal, vision, language, etc.) and tasks (such as image generation, visual grounding, image captioning, image classification, text generation, etc.) using a simple sequence-to-sequence learning framework. This work has been published at ICML 2022 (see [OFA](https://arxiv.org/abs/2202.03052)) and has received citations and attention from leading multimodal large model players such as Google Brain, DeepMind, and Microsoft. Within approximately six months of publication, OFA has already been cited by **over 60 academic papers** (some interesting applications will be introduced and explained in Section 4: What are people doing with OFA?).

OFA embodies the "One For All" philosophy and achieves excellent results on both multimodal and unimodal tasks, such as Image Captioning (CIDEr 154.9), VQA (acc 82.0), ImageNet-1k (top-1 acc 85.6), Gigaword (Rouge-1 39.81), and more.

The above briefly explains OFA's philosophy and effectiveness. We believe some readers would like to understand some of the concepts mentioned in the introduction, while others are eager to learn how to use OFA on ModelScope (hereafter abbreviated as MS). The following document will first explain from a hands-on perspective, followed by a brief introduction to OFA's philosophy and concepts. The overall structure is as follows:

- Section 1 helps readers get hands-on experience with OFA;
- Section 2 introduces practical examples of interesting applications using OFA;
- Section 3 introduces what the academic community both domestically and internationally is doing with OFA.
- Section 4 introduces OFA's core philosophy and concepts;

Readers interested in specific areas can directly browse the relevant sections.

<br>

# 1. Hands-on Experience with OFA
For a machine learning model, we generally need to understand the following information: how to set up the environment, how to perform inference, how to evaluate, how to train, what configuration options are available, and where the core code is located and how to understand it. Mastering this information gives us a fundamental understanding of the model and provides the preliminary conditions for secondary development. The remaining details can be found in the specific code—readers should open their IDEs and leverage their powerful capabilities to study the specific implementations. The following subsections will primarily introduce these core contents, and all example code can be used directly in MS notebooks.

Note: For MS-related introductions, please refer to [here](https://www.modelscope.cn/docs). The following subsections will only introduce the relevant parts.

## 1.1 Environment Setup
### 1.1.1 Using MS Notebook
Open any model card, such as [ofa caption](https://www.modelscope.cn/models/damo/ofa_image-caption_coco_large_en/summary), and follow these two steps:

step 1:

<p align="center">
    <img src="./_resources/notebook.png" width="400" />
</p>

step 2:

<p align="center">
    <img src="./_resources/notebook_update.png" width="400" />
</p>

MS notebook (similar to Python notebook) comes pre-installed with the relevant environment, so it can be used directly after startup. The red box in step 2 shows the environment information: `ubuntu20.04-py37-torch1.11.0-tf1.15.5-1.6.0`, which represents the operating system, CUDA version (GPU environment), Python version, PyTorch version, TensorFlow version, and ModelScope version respectively.

### 1.1.2 Manual Configuration
Using MS for inference and development requires setting up the MS runtime environment. MS environment management primarily depends on fundamental deep learning frameworks: PyTorch and TensorFlow. Additionally, since MS integrates models across various modalities, dependencies are relatively complex, so it's recommended to use Conda for environment management and create a new Python environment. Detailed documentation can be found [here](https://www.modelscope.cn/docs/%E7%8E%AF%E5%A2%83%E5%AE%89%E8%A3%85).

After setting up the environment and installing the basic deep learning environment, install multimodal-related dependency libraries and fairseq as shown below:

```shell
pip install "modelscope[multi-modal]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
# MS upgrade command
# pip install --upgrade "modelscope[multi-modal]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html

pip install fairseq # OFA depends on fairseq
```

Installation verification (will download the model and show a progress bar; default download path is ~/.cache/modelscope/hub):

```shell
python -c "from modelscope.pipelines import pipeline;print(pipeline('image-captioning')('https://shuangqing-public.oss-cn-zhangjiakou.aliyuncs.com/donuts.jpg'))"
```

## 1.2 How to Perform Inference
OFA is a Transformer-based encoder-decoder model. Currently, the most popular codebase in both academia and industry is HuggingFace's (hereafter abbreviated as HF) transformers. Our implementation on MS is based on transformers, and we hope this implementation approach helps readers quickly understand OFA. Inference with OFA in MS is primarily done through Pipeline, allowing simple invocation of OFA's inference capabilities.

OFA is a pre-training framework. For specific inference, we'll use the [Image Captioning](https://www.modelscope.cn/models/damo/ofa_image-caption_coco_large_en/summary) task based on OFA as an example.

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.outputs import OutputKeys

img_captioning = pipeline(Tasks.image_captioning, model='damo/ofa_image-caption_coco_large_en')
result = img_captioning({'image': 'https://shuangqing-public.oss-cn-zhangjiakou.aliyuncs.com/donuts.jpg'})
print(result[OutputKeys.CAPTION]) # 'a bunch of donuts on a wooden board with popsicle sticks'
# Currently caption supports batch inference, which is very simple as shown below:
result = img_captioning([{'image': 'https://shuangqing-public.oss-cn-zhangjiakou.aliyuncs.com/donuts.jpg'} for _ in range(3)], batch_size=2)
for r in result:
    print(r[OutputKeys.CAPTION]) # 'a bunch of donuts on a wooden board with popsicle sticks'
```

## 1.3 How to Read Data in Batches & Evaluate
Inference is a forward computation process performed on a small number of samples, helping us quickly perceive the model's input and output and preliminarily judge the model's performance. However, accurate evaluation of machine learning model performance generally requires scoring tests on an authoritative dataset.

Next, I'll use the image captioning task as an example to demonstrate the general process for evaluating OFA. First, go to the ModelCard page for OFA series models ([Image Captioning](https://modelscope.cn/models/damo/ofa_image-caption_coco_large_en/summary)), where you can see associated datasets displayed on the right side of the page as shown below (model pages with associated datasets also display corresponding evaluation/training code):

<p align="center">
    <img src="./_resources/dataset.png" width="400" />
</p>

Note: There's a difference between inference on single samples and inference on datasets—we need to pay attention to IO handling for datasets. You can directly click to enter the dataset page to view the dataset's usage method, with code as follows:

```python
from modelscope.msdatasets import MsDataset
from modelscope.utils.constant import DownloadMode
ms_ds_train = MsDataset.load("coco_2014_caption", namespace="modelscope", split="validation")
print(next(iter(ms_ds_train)))
```

Currently, pipeline doesn't support batch input and still requires single-sample inference execution. We will upgrade to support pipeline batch processing capabilities in the future.

Storing inference results and ground truth results completes the evaluation work.

## 1.4 How to Train
Generally speaking, finetuning is performed based on a pre-trained model. OFA currently has 7 pre-trained checkpoints, which can be found in the model navigation links in the appendix of this page. Currently, OFA downstream tasks are gradually supporting finetuning—mnli, caption, and ocr already support training, while other tasks are being supported incrementally. The overall finetuning approach for OFA is similar, with main variations being task-specific preprocessing and metrics handling for different tasks.

Below is a specific example of finetuning OCR. A complete configuration script can be downloaded by clicking [here](http://xingchen-data.oss-cn-zhangjiakou.aliyuncs.com/maas/scripts/finetune_ocr.py), and started with `python finetune_ocr.py`.

### 1.4.1 Key Configuration Items
Starting a downstream task finetuning process requires first defining the configuration. Below is a detailed introduction to a configuration item:

```python
finetune_cfg = {
    'framework': 'pytorch',  # Running framework
    'task': 'ocr-recognition',  # Running task
    'model': {'type': 'ofa',  # Model type (usually the model backbone/skeleton); this key mainly contains how to build the OFA inference task
              'language': 'zh',  # Input/output language
              },
    'pipeline': {'type': 'ofa-ocr-recognition'},  # Pipeline type
    'dataset': {'column_map': {'text': 'label', 'image': 'image'}}, # Different fields between dataset and model preprocessing; here we map: key is dataset field name, value is preprocessing field name
    'train': {  # Finetune related configuration
        'max_epochs': 1,  # Training epochs
        'dataloader': {'batch_size_per_gpu': 4, 'workers_per_gpu': 0},  # Data loader configuration
        'lr_scheduler': {'name': 'polynomial_decay',  # Learning rate configuration; different schedulers have different parameters
                         'warmup_proportion': 0.01,
                         'lr_end': 1e-07},
        'lr_scheduler_hook': {'type': 'LrSchedulerHook', 'by_epoch': False}, # MS uses hooks for various behaviors during finetuning; specifically, hooks call corresponding behaviors based on whether they're step-based or epoch-based and specific step counts
        'optimizer': {'type': 'AdamW', 'lr': 5e-05, 'weight_decay': 0.01},  # Optimizer configuration
        'criterion': {'name': 'AdjustLabelSmoothedCrossEntropyCriterion'}},  # Here criterion represents the complete logic for calculating loss, following fairseq's implementation style
    'evaluation': { 'dataloader': {'batch_size_per_gpu': 4, 'workers_per_gpu': 0}, # Eval data loader parameters
        'metrics': [{'type': 'accuracy'}]},  # Evaluation method used during evaluation; here it's accuracy
    'preprocessor': []}  # Preprocessor configuration; empty here (OFA has a unified preprocessing approach)
```

### 1.4.2 Starting Training
With basic configuration complete, we can proceed with finetuning. Below is the code for starting finetuning:

```python
import os
import json
import shutil
from modelscope.utils.constant import Tasks
from modelscope.pipelines import pipeline
from modelscope.metainfo import Metrics, Trainers
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.utils.constant import ModelFile
from modelscope.outputs import OutputKeys
from modelscope.hub.snapshot_download import snapshot_download

WORKSPACE = "./workspace"
ocr_model = 'damo/ofa_ocr-recognition_scene_base_zh'
ocr_path = snapshot_download(ocr_model) # Download model to cache directory and return directory
# OFA general pretrained model, not optimized for OCR scenarios
pretrained_model = 'damo/ofa_pretrain_base_zh' # Pretrained model ID
pretrained_path = snapshot_download(pretrained_model, revision='v1.0.0') # Pretrained model tag time is earlier than modelscope v1.0.2 release date, so when using ms 1.0.2 version, specific tag version needs to be added
shutil.copy(os.path.join(ocr_path, ModelFile.CONFIGURATION), # Override pretrained model configuration with task configuration
            os.path.join(pretrained_path, ModelFile.CONFIGURATION))
os.makedirs(WORKSPACE, exist_ok=True)
config_file = os.path.join(WORKSPACE, ModelFile.CONFIGURATION) # Write configuration file
with open(config_file, 'w') as writer:
    json.dump(finetune_cfg, writer, indent="\t")
# Other trainer configuration items
args = dict(
    model=pretrained_path, # Model to continue finetuning
    work_dir=WORKSPACE,
    train_dataset=MsDataset.load( # Dataset; here msdataset is compatible with huggingface dataset
        'ocr_fudanvi_zh', # msdataset ID
        namespace='modelscope',
        split='train'),
    eval_dataset=MsDataset.load('ocr_fudanvi_zh', namespace='modelscope', split='validation'),
    cfg_file=config_file) # Configuration file path
trainer = build_trainer(name=Trainers.ofa, default_args=args) # Build trainer
trainer.train()
```

## 1.5 Introduction to Key Model Configurations
OFA's model configuration is very similar to most Transformer-based enc-dec configurations. Additionally, since it's fully compatible with HF, our configuration class inherits from HF transformers' PretrainedConfig, with the filename being **config.json**.

The model configuration file is [here](https://modelscope.cn/models/damo/ofa_image-caption_coco_large_en/file/view/master/config.json). Below is a JSON file showing core configuration items with comments (not valid JSON format).

```json
{
  ...
  "attention_dropout": 0.0,  # Dropout probability for attention values
  "d_model": 1024, # Output dimension of model layers, also the dimension of each token in the vocabulary
  "decoder_attention_heads": 16, # Number of decoder attention heads
  "decoder_drop_path_rate": 0.0, # Decoder droppath probability
  "decoder_ffn_dim": 4096, # Decoder fully connected layer dimension
  "decoder_layers": 12, # Number of decoder layers
  "dropout": 0.1, # Dropout probability for fully connected layers
  ... : # Encoder configuration items are similar
  "normformer": true, # Whether to use normformer
  "resnet_type": "resnet152",  # Image-side encoding network structure; currently supports ['resnet18', 'resnet34', 'resnet50', 'resnet101', 'resnet152']
  "vocab_size": 59457, # Vocabulary size; here it's the text-side vocabulary (English uses BPE, Chinese uses bert-base-chinese vocabulary)
  ...
}
```

## 1.6 Introduction to Core Code
For OFA, the core code involves how to build the tokenizer and model; for MS, it's about how Pipeline is constructed, how to train, and how to evaluate. Next, we'll focus on introducing OFA-related core code and briefly introduce MS-related core code, as the latter can be primarily referenced from MS's own [Documentation Center](https://modelscope.cn/docs).

### 1.6.1 OFA Tokenizer
OFA was initially an academic work where the language component primarily used English data, and the tokenizer applied was equivalent to GPT2's BPE tokenizer. Later, to support Chinese, we re-used bert-base-chinese's tokenizer and made simple modifications to the vocabulary. Therefore, OFA has two different tokenizers for Chinese and English. The basic construction logic of both tokenizers is the same, but there's a significant difference in vocabulary size. To maintain compatibility with English tokenizer (BPE-based) usage patterns, the Chinese version includes some simple adaptations. Note that since OFA supports multimodal input, the tokenizer additionally includes discrete image codes and discretized position bins beyond the original text support.

Specific code can be found at: modelscope/models/multi_model/ofa/tokenization_ofa.py

Both OFATokenizer and OFATokenizerZH can be conveniently constructed in a way compatible with HF transformers. After obtaining the model files, as shown below:

```python
from modelscope.models.multi_modal.ofa import OFATokenizer, OFATokenizerZH
from modelscope.hub.snapshot_download import snapshot_download
model_en_path = snapshot_download('damo/ofa_image-caption_coco_large_en')
model_zh_path = snapshot_download('damo/ofa_image-caption_muge_base_zh')
tokenizer_en = OFATokenizer.from_pretrained(model_en_path)
tokenizer_zh = OFATokenizerZH.from_pretrained(model_zh_path)

# Add code id and bin id
tokenizer_en.add_tokens(['<code_{}>'.format(i) for i in range(8192)])
tokenizer_en.add_tokens(['<bin_{}>'.format(i) for i in range(1000)])
tokenizer_zh.add_tokens(['<code_{}>'.format(i) for i in range(8192)])
tokenizer_zh.add_tokens(['<bin_{}>'.format(i) for i in range(1000)])
# English tokenizer
result_en = tokenizer_en(" what does the image describe?")['input_ids']
print(result_en) # [0, 99, 473, 5, 2274, 6190, 116, 2]
# Note BPE tokenizer is sensitive to spaces before text
# tokenizer_en("what does the image describe?")['input_ids'] result is
# [0, 12196, 473, 5, 2274, 6190, 116, 2]

# Chinese tokenizer
result_zh = tokenizer_zh(" 图片描述了什么内容?")['input_ids']
print(result_zh) # [0, 1749, 4279, 2993, 6839, 753, 788, 724, 1083, 2163, 140, 2]
# Chinese tokenizer is based on WordPiece and is not sensitive to spaces
# tokenizer_zh("图片描述了什么内容?")['input_ids']
# [0, 1749, 4279, 2993, 6839, 753, 788, 724, 1083, 2163, 140, 2]
```

Commonly used OFATokenizer parameters include:

- **text**: Input text string
- **max_length**: Maximum length for truncation; in OFA, padding is done in collate (modelscope/preporcessors/ofa/utils/collate.py)
- **add_special_tokens**: Whether to add special tokens (usually bos and eos)
- **truncation**: Whether to truncate
- **return_tensors**: Return data type

Other parameters can be referenced from transformers/tokenization_utils_base.py

### 1.6.2 OFA Preprocessor

Readers interested in model development will quickly notice the data processing环节. Given different tasks, data processing methods vary significantly. In MS, OFA models perform data preprocessing in the preprocessor, so when developing new tasks, modifications can be made following this approach. Below, we'll use the image caption task as an example to illustrate how to use OFA preprocessing.

```python
from modelscope.metainfo import Preprocessors
from modelscope.utils.constant import Fields
from modelscope.preprocessors.multi_modal import OfaPreprocessor
from modelscope.hub.snapshot_download import snapshot_download
model_dir = snapshot_download('damo/ofa_image-caption_coco_large_en')
preprocessor = OfaPreprocessor.from_pretrained(model_dir, type=Preprocessors.ofa_tasks_preprocessor,
                    field=Fields.multi_modal)
data = {'image': 'https://shuangqing-public.oss-cn-zhangjiakou.aliyuncs.com/donuts.jpg'}
ret = preprocessor(data)
print(ret)
# {'source': tensor([   0,   99,  473,    5, 2274, 6190,  116,    2]), 'patch_image': tensor([[[0.8431, 0.8
# 039, 0.8039,  ..., 0.8118, 0.8196, 0.8431],
#          [0.8431, 0.8196, 0.8353,  ..., 0.8431, 0.8431, 0.8510],
# ....,
# [0.8275, 0.8667, 0.8745,  ..., 0.7176, 0.7098, 0.7020]]]), 'patch_mask': tensor([True])}
```

After OFA preprocessor, data goes through the collate function (modelscope/preprocessor/ofa/utils/collate.py), which reorganizes the data and performs padding, making final preparations for subsequent model processing.

### 1.6.3 OFA Model - Transformer Related

OFA model implementation is fully compatible with HF. However, since we unify architecture and tasks, we omit the pre-trained model head (details can be seen in Chapter 1). The core only contains the OFA backbone class itself (code in modelscope/models/mutli_model/ofa/modeling_ofa.py).

- OFAAttention: Multi-head attention mechanism implementation class
- OFADecoder: OFA decoder
- OFADecoderLayer: Implementation of each OFA decoder layer
- OFAEncoder: OFA encoder
- OFAEncoderLayer: Implementation of each OFA encoder layer
- OFAEncoderOutput: OFA encoder output information, structured into a class
- OFAModel: **Overall OFA model implementation, containing OFA encoder and decoder; the model's forward process is in this class's forward function.**
- OFAPreTrainedModel: Base class for OFA model.

### 1.6.4 OFA Model - Image Modality Processing

OFA processes raw images into tensors through an image processing model. Currently, the selected model is ResNet, implemented in a standard way (modelscope/models/multi_model/ofa/resnet.py). The 6B-scale model uses ViT architecture on the image side; see (modelscope/models/multi_model/ofa/vit.py) for details.

### 1.6.5 Inference Decoding Strategy

OFA's inference decoding strategy primarily uses BeamSearch, which can employ HF's built-in BeamSearch or OFA's current SequenceGenerator implementation in MS based on fairseq (modelscope/models/multi_model/ofa/generate/sequence_generator.py).

Currently, using MS's internal generator yields slightly better results. Main parameters of SequenceGenerator include:

- tokenizer: Tokenizer
- beam_size: Beam search width
- max_len_a/b: Decoding length set as max ax + b
- len/unk_penalty: Length/unknown word multiplication coefficient
- constraint_trie/range: Some tasks require specific constraints during inference, such as classification tasks needing prefix tree constraints to ensure generated candidates are within a closed set; visual grounding tasks constraining generated token_id to bucket ids, etc.
- lm_weight: Can combine a language model during generation; this parameter is the language model's weight.

### 1.6.6 Inference Strategies for Different Tasks

With the above explanations, the code logic for specific tasks becomes clearer. Currently, the inference process for most tasks is in modelscope/models/multi_model/ofa_for_all_tasks.py.

Here's a brief introduction to distinctive and noteworthy aspects:

- OFA's text-to-image generation task involves a two-stage decoding strategy (first decode discrete codes, then use GAN model to decode codes into images), so it remains an independent class: OfaForTextToImageSynthesis
- For outputs with tokens in a closed set, the code defaults to using the label set configured in configuration to build a prefix tree and uses this prefix tree during decoding, allowing users to seamlessly obtain closed-set solutions. This has two benefits: 1) unified interface reduces special handling for classification tasks; 2) for tasks with many labels like imagenet1k with 1000 categories, this approach reduces inference computation (no need to traverse all candidates). However, there's also a drawback: for tasks with fewer classifications, since autoregressive approach is used, computational efficiency is actually lower.

Below is an example using the image caption task to illustrate inference strategy code logic:

```python
gen_outputs = self.generator.generate([self.model],
                                      input, prefix_tokens=input.get('prefix_tokens', None))
gen_l = list()
for idx, gen_out in enumerate(gen_outputs):
    if len(gen_out) > 0:
        decode_tokens = gen_out[0]['tokens']
        if 'prefix_tokens' in input:
            prefix_len = input['prefix_tokens'][idx].ne(
                self.pad_item.to(self.model.device)).sum()
            decode_tokens = decode_tokens[prefix_len:]
        gen_l.append(decode_tokens)
    else:
        gen_l.append('')
result = self.tokenizer.batch_decode(gen_l, skip_special_tokens=True)
```

- For tasks where output tokens are in specific regions of the original vocabulary, such as visual grounding tasks, constraint_range needs to be passed, along with some transformations for this special task.

<br>

# 2. Interesting Practical Applications
From the above introduction, we can see that through a relatively simple process, we fine-tuned an OFA model with OCR capabilities. However, readers with deep learning research experience or careful observation will quickly realize that this OCR is just a demo with significantly limited application scenarios. This is because our training set mostly contains single-line text, but real-world scenarios often involve multi-line text. Although we could solve this by manually cropping images, in the AI era, we prefer to avoid manual intervention when possible. Text position detection capability is actually one of AI's many capabilities, and we can combine text detection and text recognition capabilities to create a more practical OCR system. Let's start the specific work!

First, we select a text detection AI tool. There are many such tools available on the market, such as easyocr, and models already listed on ModelScope: Text Detection Line Detection Model - Chinese/English - General Domain Model.

With the detection model ready, we can proceed with OCR detection. Our goal is to recognize the content of the essay in the image below. Without further ado, here's the code directly (note that the text recognition model is for natural scenes, so handwritten text performance will be slightly worse; we'll soon release related model cards, and interested readers can also collect their own datasets for finetuning):

<p align="center">
    <img src="./_resources/ocr_essay.jpg" width="400" />
</p>

```python
# Basic environment setup
# Detection model is CV model, so need to install CV environment and TensorFlow
# pip install "modelscope[cv]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
# pip install --upgrade tensorflow
from PIL import Image
import cv2
import numpy as np
import urllib
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.outputs import OutputKeys
from modelscope.preprocessors.image import load_image

# Detection model preparation
ocr_url = 'http://xingchen-data.oss-cn-zhangjiakou.aliyuncs.com/maas/ocr/ocr_essay.jpg'
ocr_detection = pipeline(Tasks.ocr_detection, model='damo/cv_resnet18_ocr-detection-line-level_damo')
# Get detection results
result = ocr_detection(ocr_url)[OutputKeys.POLYGONS]

# OFA text recognition model preparation
ocr_recognize = pipeline(Tasks.ocr_recognition, model='damo/ofa_ocr-recognition_scene_base_zh')

# OCR text recognition process
def ocr_pip(image_in, boxes):
    boxes = np.asarray(sorted(boxes.tolist(), key=lambda x: x[1]))
    req = urllib.request.urlopen(image_in) # Read image
    arr = np.asarray(bytearray(req.read()), dtype=np.uint8)
    img = cv2.imdecode(arr, -1) # 'Load it as it is'
    ret_l = list()
    for box in boxes: # Since detection results are quadrilaterals, use perspective transformation to convert to rectangles
        post1 = box.reshape((4, 2)).astype(np.float32)
        width = box[4] - box[0]
        height = box[5] - box[1]
        post2 = np.float32([[0, 0], [width, 0], [width, height], [0, height]])
        M = cv2.getPerspectiveTransform(post1, post2)
        new_img = cv2.warpPerspective(img, M, (width, height))
        new_img_pil = Image.fromarray(cv2.cvtColor(new_img, cv2.COLOR_BGR2RGB))
        # Start text recognition
        ocr = ocr_recognize(new_img_pil)[OutputKeys.TEXT][0].replace(" ", "")
        ret_l.append(ocr)
    return ret_l

print(ocr_pip(ocr_url, result))
"""
['She curled up in a corner, using her breath to warm',
 'her small hands. At that time, I really wanted to travel back there',
 'to bring the little girl a coat so she wouldn't suffer',
 'The little girl used her small hands to light a match,',
 'What a bright flame! The little girl saw a big stove, she',
 'was so thirsty for warmth. The second time the little girl saw a roasted goose,',
 'she was so hungry. I really wanted to fly there to buy the little girl',
 'a full meal. How pitiful she was! Until the fourth time,',
 ', the little girl saw the person she wanted to be closest to in her life [UNK] grandmother,',
 'They held hands and flew together into the sky. Rain soaked my',
 'clothes, but I was glad the little girl finally no longer suffered. My',
 'worried heart finally settled.',
 'I couldn't help thinking about myself. We live in a comfortable',
 'environment, no longer busy with economic concerns, don't need to earn money',
 'to support the family,专心只读圣贤书 every day, living a life where clothes come when伸手',
 'But what about the little girl? She lived in',
 'a good life where food comes when opening mouth.',
 'What about the little girl in Sha County society? Every day she couldn't sell matches, beaten by dad,',
 'scolded by mom',
 'Therefore, from now on we should do what we can',
 'for our parents and be懂事、伞巧 children.']
"""
```

<br>

# 3. What Are People Doing with OFA?

The authors of the following works have used OFA and mentioned or cited OFA. Some of these works are quite interesting and have practical value, while others represent academic exploration and thinking. We also hope everyone can use OFA as a baseline and surpass it (which is exactly what many well-known works have done with OFA).

## 3.1 OFA as a Bridge for Modality Conversion

### Idea 1: Using OFA's image-to-text capability to enable pure text models to process images

In the paper [Binding Language Models in Symbolic Languages](https://www.semanticscholar.org/paper/Binding-Language-Models-in-Symbolic-Languages-Cheng-Xie/c140fe515de2f20d0c85c813c7b3ec1defc41f9d), the authors' model could only process text modality, but they used OFA's caption capability to process images into text, thereby gaining the ability to handle images.

<p align="center">
    <img src="./_resources/binding.png" width="400" />
</p>

### Idea 2: Using OFA's image-to-text capability to improve robot control

In the paper [DALL-E-Bot: Introducing Web-Scale Diffusion Models to Robotics](https://arxiv.org/pdf/2210.02438.pdf), for cluttered objects on a desktop, the authors first used OFA's caption capability to extract the names of all objects on the desktop, then used DALLE-2 to generate an image of neatly arranged objects, and the robot arranged the cluttered objects according to the generated image.

<p align="center">
    <img src="./_resources/de_robot.png" width="400" />
</p>

### Idea 3: Using OFA's text-to-image capability to make text continuation more natural

In the paper [Visualize Before You Write: Imagination-Guided Open-Ended Text Generation](https://www.semanticscholar.org/paper/Visualize-Before-You-Write%3A-Imagination-Guided-Text-Zhu-Yan/0c40146f8ce162c52de4eae6fc4eb3d3302d7835), the authors believe that when people tell stories, they have mental images, so they used OFA's text-to-image capability to generate images from text, then used this visual information combined with language models to achieve better text generation.

<p align="center">
    <img src="./_resources/vb.png" width="400" />
</p>

## 3.2 Combining OFA's Multimodal Capabilities with AI Image Generation Technology

### Idea 1: Completing "Photoshop" work just by "talking"

Twitter influencer Yuvi used OFA's powerful Visual Grounding capability (selecting relevant objects through description) combined with stable diffusion models to complete Photoshop work just by "talking" (this work has been included in the author's VF tutorial).

<p align="center">
    <img src="./_resources/twitter.png" width="400" />
</p>

### Idea 2: Using OFA's cross-modal capabilities to study DALLE-2 generated images

In the work [How good are deep models in understanding the generated images?](https://arxiv.org/abs/2208.10760), the authors used OFA to study how current models understand generated images and quantitatively evaluate these generative models.

The authors' process was as follows:

<p align="center">
    <img src="./_resources/how_well_ofa.png" width="400" />
</p>

## 3.3 Using OFA's SOTA Capabilities for Data Augmentation

In the work [CLIP-ViP: Adapting Pre-trained Image-Text Model to Video-Language Representation Alignment](https://arxiv.org/abs/2209.06430), the authors' video pre-training model used OFA Caption capabilities to create additional data.

<p align="center">
    <img src="./_resources/clip-vit.png" width="400" />
</p>

# 4. OFA Core Philosophy & Concepts

This section provides a high-level overview of OFA-related philosophy, concepts, and models. For detailed information, please refer to our paper: [OFA: Unifying Architectures, Tasks, and Modalities Through a Simple Sequence-to-Sequence Learning Framework](https://arxiv.org/abs/2202.03052).

## 4.1 Benefits of Generality and Unification

This section introduces why OFA exists for readers unfamiliar with OFA's philosophy and what problems we're addressing. This section contains relatively few technical details but represents one of the driving forces behind our work.

### 4.1.1 General Intelligence Agent

I remember my teacher saying in school: "The more solutions a problem has, the more it indicates the problem hasn't been solved." This is also evident in AI research. Sixty or seventy years ago, our predecessors confidently aimed to achieve Artificial General Intelligence (AGI), hoping to perfectly solve intelligence problems immediately. However, as both researchers and the general public know, AGI remains distant (no one can see machines as intelligent as humans).

The general public may not understand the specific research process, but researchers clearly understand that overly difficult problems have been increasingly divided using "divide and conquer" approaches. In many small domains, researchers have achieved performance comparable to or even surpassing humans, such as AlphaGo's performance in Go (there are many similar examples, though this one may be the most famous).

However, along with achievements, the thousands of different solutions across specialized domains have multiplied. We (many researchers as well) cannot forget our original vision—OFA is a step on our path of "staying true to our original aspiration."

### 4.1.2 More Than Just a Vision

Unified solutions aren't just researchers' aesthetic pursuits without practical value—they have concrete practical significance. The first pre-trained model we became familiar with was probably the famous BERT. BERT,凭借Transformer的优异架构和精心选择的预训练任务，得到了一个预-trained model that dominated various NLP tasks. This can be considered as a unified backbone achieving transfer and adaptation across different tasks. However, readers familiar with BERT or who have used its code know that BERT's pre-training tasks don't match actual tasks in data and form. As a result, many tasks require additional headers for adaptation, and these headers contain parameters. This leads to:

- **Randomly initialized parameters require relatively more data for finetuning, and more data training brings higher human and machine resource consumption;**
- **Limited model expression forms can only utilize a few pre-training tasks, limiting pre-trained model capabilities and similarly requiring more samples for transfer learning.**

Therefore, a single model supporting more different inputs (different modalities) and more tasks possesses greater practical value, and **few-shot/zero-shot capabilities significantly reduce the cost of combining complex tasks with model capabilities, greatly unleashing imagination to create greater value.** Analogy: A "person" who needs a long time to "find examples and get familiar" with any task cannot be productive; models with better generality have the potential to explosively increase productivity.

## 4.2 OFA Architecture

### 4.2.1 OFA Base Architecture

We believe many tasks can be expressed through seq2seq approaches, and among current seq2seq methods, Transformer-based architectures perform excellently, making them our base architecture.

OFA's overall design is shown in the figure below:

<p align="center">
    <img src="./_resources/ofa_frame.png" width="600" />
</p>

We can see that OFA has 8 pre-training tasks, including both unimodal and multimodal tasks, understanding tasks and generation tasks. More modalities and tasks are key paths toward general unification.

### 4.2.2 OFA Pre-training Tasks

OFA currently has 8 pre-training tasks, all using the same core architecture: Transformer-based seq2seq architecture, with the image side using ResNet (which can be replaced with other models) to produce vector representations. Since all tasks share the same architecture, we designed different instructions to distinguish between different tasks. Here's a brief introduction to some task design philosophies.

- **V**isual **G**rounding
   - Instruction: Which region does the text "Man in white shirt" describe？
   - Design philosophy: This task detects objects described by given text in images, with results being Bounding Boxes (formatted as 4 values: top-left x/y coordinates and bottom-right x/y coordinates). The main challenge is handling Bounding Box coordinates and irregular image dimensions. OFA's solution is to resize images to predefined dimensions, then divide 1000 buckets along x/y axes, converting pixel positions to bucket IDs, with output results being bucket ID sequences.
- Image Infilling
   - Insturction: What is the image in the middle part?
   - Design philosophy: Image encoding can be implemented using ResNet-like approaches, but image generation requires additional techniques to discretize images at the output end. Methods like VQVAE and VQGAN discretize images into codes. Here, our pre-training task is missing image filling, with Ground Truth being codes obtained through VQGAN discretization.
- Text Infilling:
   - Instruction: what is the complete text of "A <mask> woman"?
   - Design philosophy: Similar to Bart, and not particularly different from other tasks like VQA and Image Captioning.
<br>

# Appendix
## Model Scale Introduction
Currently, OFA model scales are as follows (Chinese and English scale differences are due to different vocabulary sizes):

<div style='display: flex;justify-content: center;'>

| **Model** | **Params-en** | **Params-zh** | **Backbone** | **Hidden size** | **Intermediate size** | **Num. of heads** | **Enc layers** | **Dec layers** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFA<sub>Tiny</sub> | 33M | - | ResNet50 | 256 | 1024 | 4 | 4 | 4 |
| OFA<sub>Medium</sub> | 93M | - | ResNet101 | 512 | 2048 | 8 | 4 | 4 |
| OFA<sub>Base</sub> | 180M | 160M | ResNet101 | 768 | 3072 | 12 | 6 | 6 |
| OFA<sub>Large</sub> | 470M | 443M | ResNet152 | 1024 | 4096 | 16 | 12 | 12 |
| OFA<sub>Huge</sub> | 930M | - | ResNet152 | 1280 | 5120 | 16 | 24 | 12 |
| OFA<sub>6B</sub> | 6B | - | vit_huge | 2560 | 10240 | 32 | 36 | 24 |

</div>

## OFA Model Task Matrix
All models and tasks currently uploaded to ModelScope can be seen in the navigation table below. Click links to navigate to corresponding model cards.

<div style='display: flex;justify-content: center;'>

| Model Scale | Pre-training | Image Captioning | Visual QA | Visual Grounding | Visual Entailment | Text-to-Image | Image Classification | OCR | Text Summarization | Text Classification | Speech Recognition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OFA<sub>Tiny</sub> | [English](https://modelscope.cn/models/damo/ofa_pretrain_tiny_en/summary) | [English](https://modelscope.cn/models/damo/ofa_image-caption_coco_distilled_en/summary) | - | [English](https://modelscope.cn/models/damo/ofa_visual-grounding_refcoco_distilled_en) | [English](https://modelscope.cn/models/damo/ofa_visual-entailment_snli-ve_distilled_v2_en/summary) | - | - | - | - | - | - |
| OFA<sub>Medium</sub> | [English](https://modelscope.cn/models/damo/ofa_pretrain_medium_en/summary)  | - | - | - | - | - | - | - | - | - | - |
| OFA<sub>Base</sub> | [Chinese](https://modelscope.cn/models/damo/ofa_pretrain_base_zh/summary )/[Chinese Speech](https://modelscope.cn/models/damo/ofa_mmspeech_pretrain_base_zh/summary )/[English](https://modelscope.cn/models/damo/ofa_pretrain_base_en/summary) | [Chinese E-commerce](https://modelscope.cn/models/damo/ofa_image-caption_muge_base_zh/summary) | - | - | - | - | - | [General Chinese](https://modelscope.cn/models/damo/ofa_ocr-recognition_general_base_zh/summary )/[Scene Chinese](https://modelscope.cn/models/damo/ofa_ocr-recognition_scene_base_zh/summary )/[Web Chinese](https://modelscope.cn/models/damo/ofa_ocr-recognition_web_base_zh/summary )/[Document Chinese](https://modelscope.cn/models/damo/ofa_ocr-recognition_document_base_zh/summary )/[Handwritten Chinese](https://modelscope.cn/models/damo/ofa_ocr-recognition_handwriting_base_zh/summary ) | - | - | [Chinese AIShell1](https://modelscope.cn/models/damo/ofa_mmspeech_asr_aishell1_base_zh/summary) |
| OFA<sub>Large</sub> | [Chinese](https://modelscope.cn/models/damo/ofa_pretrain_large_zh/summary )/[Chinese Speech](https://modelscope.cn/models/damo/ofa_mmspeech_pretrain_large_zh/summary )/[English](https://modelscope.cn/models/damo/ofa_pretrain_large_en/summary) | [English](https://modelscope.cn/models/damo/ofa_image-caption_coco_large_en/summary) | [English](https://modelscope.cn/models/damo/ofa_visual-question-answering_pretrain_large_en/summary) | [Chinese](https://modelscope.cn/models/damo/ofa_visual-grounding_refcoco_large_zh/summary )/[English](https://modelscope.cn/models/damo/ofa_visual-grounding_refcoco_large_en/summary ) | [English](https://modelscope.cn/models/damo/ofa_visual-entailment_snli-ve_large_en/summary) | [English](https://modelscope.cn/models/damo/ofa_text-to-image-synthesis_coco_large_en/summary) | [English](https://modelscope.cn/models/damo/ofa_image-classification_imagenet_large_en/summary) | - | [English](https://modelscope.cn/models/damo/ofa_summarization_gigaword_large_en/summary) | [English](https://modelscope.cn/models/damo/ofa_text-classification_mnli_large_en/summary) | [Chinese AIShell1](https://modelscope.cn/models/damo/ofa_mmspeech_asr_aishell1_large_zh/summary) |
| OFA<sub>Huge</sub> | [English](https://modelscope.cn/models/damo/ofa_pretrain_huge_en/summary) | - | - | - | - | - | - | - | - | - | - |
| OFA<sub>6B</sub> | [English](https://modelscope.cn/models/damo/ofa_pretrain_6b_en/summary) | [English](https://modelscope.cn/models/damo/ofa_image-caption_coco_6b_en/summary) | - | - | - | - | - | - | - | - | - |

</div>