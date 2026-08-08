<!-- modelscope-docs: CLIP_CN_Tutorial | model-overview/multimodal/clip-tutorial/CLIP-CN-Tutorial/CLIP-CN-Tutorial_EN.md -->

This article provides a comprehensive introduction to Chinese CLIP and its usage on ModelScope, including CLIP overview, why Chinese CLIP was developed, how to use CLIP on ModelScope, and CLIP's performance across various tasks.

# 0. What is the CLIP model? What can it do?

CLIP [1], short for Contrastive Language-Image Pretraining, was proposed by OpenAI in 2021. Its core concept is contrastive language-image pretraining. Unlike traditional vision models, CLIP's pretraining data doesn't consist of labeled images, but rather weakly supervised image-text pairs collected from the web—commonly known as images and their captions. CLIP gathered 400 million image-text pairs, aiming to model the relationship between images and text through pretraining. Compared to traditional complex interactive multimodal pretraining approaches, CLIP's architecture is extremely simple—it uses the well-known dual-tower model structure, consisting of an image tower and a text tower. The image tower extracts image representations, typically using Vision Transformer (ViT), while the text tower extracts text features using the classic Transformer architecture. After both towers extract their respective representations, they compute inner products between all image-text representation pairs within each batch, as shown below:

<p align="center">
    <img src="./_resources/clip_frame.png" width="500" />
</p>

The original CLIP model was trained on English image-text corpora and cannot be used for Chinese image-text representation extraction scenarios. This project uses English CLIP visual parameters and Chinese Roberta parameters as model initialization values. Based on large-scale native Chinese image-text data and the two-stage pretraining strategy shown below (first stage trains only the text side, second stage trains both sides simultaneously), we implemented a Chinese version of the CLIP model.

<p align="center">
    <img src="./_resources/chinese_clip_pretrain.png" alt="Chinese CLIP Pretraining Mechanism"  width="500" />
<br><br>

The model is trained using the commonly used InfoNCE loss from contrastive learning, which essentially pulls positive examples closer together and pushes negative examples further apart, establishing connections between images and natural language in the vector space. Through this training, CLIP acquires multimodal understanding capabilities. Its image-text association ability can be applied to cross-modal retrieval tasks and open-domain zero-shot image classification. Additionally, CLIP's image tower possesses strong image representation capabilities that can be widely applied to downstream tasks in image generation, object detection, segmentation, and even video domains.

# 1. Why develop Chinese CLIP?

The reason for developing Chinese CLIP lies in the fact that the CLIP paradigm has demonstrated that large-scale weakly supervised image-text data combined with large models can build powerful multimodal foundation models and vision foundation models. However, CLIP trained on English data is insufficient for cross-lingual complex scenarios, especially when dealing with the rich and profound Chinese language. Today, when discussing CLIP, we often focus on its visual representation capabilities while overlooking the role of its text tower. However, it's worth noting that image data associated with different languages varies significantly—not just in the language itself, but more importantly in how the information contained in data from different languages reflects objective reality and subjective thoughts. Although there are multilingual CLIP models like mCLIP [2] available on the market, they are still insufficient for understanding Chinese, and even inadequate for understanding Chinese-world images. Examples include (you can click the links to view specific images):

For the search query ["Chinese New Year festive couplets"](https://rom1504.github.io/clip-retrieval/?back=https%3A%2F%2Fknn5.laion.ai&index=laion5B&useMclip=true&query=%E8%BF%87%E5%B9%B4%E5%96%9C%E5%BA%86%E5%AF%B9%E8%81%94), mCLIP returns Christmas-related items.

Similarly, for ["Jay Chou playing basketball"](https://rom1504.github.io/clip-retrieval/?back=https%3A%2F%2Fknn5.laion.ai&index=laion5B&useMclip=true&query=%E5%91%A8%E6%9D%B0%E4%BC%A6%E6%89%93%E7%AF%AE%E7%90%83), the returned results are also incorrect.

It must be acknowledged that Chinese natural language processing is extremely challenging, and Chinese visual understanding is equally difficult! We need a Chinese CLIP to serve as a multimodal and vision foundation model in the Chinese domain, empowering Chinese-domain multimodal and vision-related applications.

# 2. How was Chinese CLIP implemented?

In 2022, Tongyi Lab released Chinese CLIP, maintaining consistency with the official CLIP methodology to ensure ease of use while enabling learning from large-scale Chinese-domain image-text data. Specifically, we first collected large-scale Chinese image-text pair data, mostly from public datasets including LAION-5B [3], Wukong [4], and translated versions of classic English public datasets such as Visual Genome [5] and Microsoft COCO [6], with translations provided by Alibaba NLP. This approach ensures excellent performance while maintaining high reproducibility, facilitating subsequent researchers in reproducing our experimental results.

Regarding pretraining methodology, compared to classic contrastive learning pretraining, we adopted a two-stage contrastive learning pretraining approach, as illustrated below:

<p align="center">
    <img src="./_resources/constrastive.png" width="400" />
</p>

First, we initialize both the image tower and text tower using existing pretrained models, which significantly reduces pretraining costs, accelerates convergence, and achieves better results. The image tower uses ResNet50 or ViTs of different scales, initialized with corresponding CLIP model weights. In the first stage, as shown in the left figure, we freeze the image tower parameters and use contrastive learning pretraining to make the text tower representations approach those of the already trained CLIP image tower in the vector space. This method has been effectively validated in Google's LiT [7] and Huawei's Wukong works. In the second stage, we unfreeze all parameters and train them jointly, aiming to enable the CLIP model to learn Chinese-domain image and text data and acquire knowledge about Chinese-domain images and natural language. Our ablation experiments also demonstrate the effectiveness of the two-stage training approach compared to single-stage training, and we discuss the impact of model initialization on model performance.

Currently, Chinese CLIP has been released on Tongyi Lab's ModelScope platform. The following sections will introduce how to use this model on ModelScope to implement various applications.

# 3. How to get started?

Our Chinese CLIP model provides a very simple and easy-to-use interface. After setting up the environment, you can complete basic image-text feature extraction and similarity computation with just a few lines of code. Below we provide detailed instructions:

## 3.1 Environment Setup

### 3.1.1 Using ModelScope Notebook

Click "Open in Notebook" in the top-right corner of our model page and select either CPU or GPU instances based on your current quota, as shown below:

**Step 1:** Click to open Notebook
<p align="center">
    <img src="./_resources/notebook.png" width="400" />
</p>

**Step 2:** Select instance type
<p align="center">
    <img src="./_resources/start.png" width="400" />
</p>

ModelScope's notebook (similar to Python notebook) comes pre-installed with the necessary environment, so you can use it directly after startup. The red box in Step 2 shows environment information: `ubuntu20.04-py37-torch1.11.0-tf1.15.5-1.6.0`, representing the operating system, CUDA version (GPU environment), Python version, PyTorch version, TensorFlow version, and ModelScope version respectively. **Please note that CLIP requires ModelScope environment version higher than 0.3.7**. If you find the ModelScope version displayed in the red box is lower than this version, you'll see an "Update Image and Start" button next to the "Start" button—please click it, as shown below:

<p align="center">
    <img src="./_resources/update.png" width="400" />
</p>

### 3.1.2 Manual Environment Setup

To use ModelScope for inference and development, you need to configure the ModelScope runtime environment properly. ModelScope's environment management primarily depends on fundamental deep learning frameworks: PyTorch and TensorFlow/PyTorch. Since ModelScope integrates models across various modalities, dependencies are relatively complex, so we recommend using Conda for environment management and creating a new Python environment. Detailed documentation can be found [here](https://www.modelscope.cn/docs/%E7%8E%AF%E5%A2%83%E5%AE%89%E8%A3%85).

After setting up the environment and installing the basic deep learning environment, install multimodal-related dependency libraries in the shell terminal as follows:

```bash
pip install "modelscope[multi-modal]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
# ModelScope upgrade command
# pip install --upgrade "modelscope[multi-modal]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

Perform a simple installation verification in the shell terminal (this will download the model and show a progress bar; default download path is ~/.cache/modelscope/):

```bash
python -c "from modelscope.pipelines import pipeline;from modelscope.utils.constant import Tasks;from modelscope.preprocessors.image import load_image;print(pipeline(task=Tasks.multi_modal_embedding).forward({'img': load_image('https://yangan2.oss-cn-beijing.aliyuncs.com/pokemon.jpeg'), 'text': 'Pikachu'}))"
```

If you see vector output, the installation is successful.

## 3.2 Predict Image-Text Representations & Compute Similarity

As mentioned above, the CLIP model uses a dual-tower architecture to compute feature vectors for images and text. The resulting image-text feature vectors can calculate image-text similarity through simple vector inner product operations. In ModelScope, CLIP model inference is primarily conducted through Pipeline, requiring only a few lines of code to easily invoke CLIP's inference capabilities. Below we provide code examples for extracting image-text representations and implementing text query matching with multiple images, as well as single image matching with multiple candidate texts.

In the Python environment, first perform the necessary import operations:

```python
import torch
from modelscope.utils.constant import Tasks
from modelscope.pipelines import pipeline
from modelscope.preprocessors.image import load_image
```

Next, build the ModelScope pipeline for multimodal representation and load Chinese CLIP model parameters (using base scale as an example):

```python
pipeline = pipeline(task=Tasks.multi_modal_embedding,
    model='damo/multi-modal_clip-vit-base-patch16_zh') # Load base-scale CLIP model
```

Currently, we have released 4 scales of Chinese CLIP models on ModelScope: [base scale](https://modelscope.cn/models/damo/multi-modal_clip-vit-base-patch16_zh) (ViT-B-16), [large scale](https://modelscope.cn/models/damo/multi-modal_clip-vit-large-patch14_zh) (ViT-L-14), [large scale-336 resolution](https://www.modelscope.cn/models/damo/multi-modal_clip-vit-large-patch14_336_zh) (ViT-L-14@336px), and [huge scale](https://modelscope.cn/models/damo/multi-modal_clip-vit-huge-patch14_zh) (ViT-H-14). Users can load the desired scale by specifying the `model` parameter in the code above, corresponding to:

+ Base scale: `damo/multi-modal_clip-vit-base-patch16_zh`
+ Large scale: `damo/multi-modal_clip-vit-large-patch14_zh`
+ Large scale-336 resolution: `damo/multi-modal_clip-vit-large-patch14_336_zh`
+ Huge scale: `damo/multi-modal_clip-vit-huge-patch14_zh`

For more detailed information about these 4 model scales, please refer to the appendix.

For text query matching with multiple images, we use the query "Chinese New Year festive couplets" and the following four candidate images (we won't use the image filenames). Only the Chinese New Year couplets image is truly relevant to the query; the other three are mismatched images, with "Chinese New Year celebration" and "couplets" serving as challenging negative examples to test the model's effectiveness.

<table><tr>
<td><figure>
  <img src="./_resources/year.jpeg" alt="Chinese New Year couplets.jpeg"/>
  <figcaption><center>Chinese New Year couplets.jpeg</center></figcaption>
</figure></td>
<td><figure>
  <img src="./_resources/chris.png" alt="Christmas decoration.png"/>
  <figcaption><center>Christmas decoration.png</center></figcaption>
</figure></td>
<td><figure>
  <img src="./_resources/happy.jpeg" alt="Chinese New Year celebration.jpeg"/>
  <figcaption><center>Chinese New Year celebration.jpeg</center></figcaption>
</figure></td>
<td><figure>
  <img src="./_resources/duilian2.jpeg" alt="Couplets.jpeg"/>
  <figcaption><center>Couplets.jpeg</center></figcaption>
</figure></td>
</tr></table>

```python
# Prepare text query and multiple candidate images
input_text = "Chinese New Year festive couplets"
input_imgs = [
    load_image('https://yangan2.oss-cn-beijing.aliyuncs.com/过年对联.jpeg'), # Supports example image URL/local image path, returns PIL.Image
    load_image('https://yangan2.oss-cn-beijing.aliyuncs.com/圣诞装饰.png'),
    load_image('https://yangan2.oss-cn-beijing.aliyuncs.com/过年喜庆.jpeg'),
    load_image('https://yangan2.oss-cn-beijing.aliyuncs.com/对联.jpeg')
]

# Extract image features, supports single image (PIL.Image) or multiple images (List[PIL.Image]) input, outputs normalized feature vectors
img_embedding = pipeline.forward({'img': input_imgs})['img_embedding'] # 2D Tensor, [number of images, feature dimension]

# Extract text features, supports single text (str) or multiple texts (List[str]) input, outputs normalized feature vectors
text_embedding = pipeline.forward({'text': input_text})['text_embedding'] # 2D Tensor, [number of texts, feature dimension]

# Calculate image-text similarity
with torch.no_grad():
    # Calculate logits via inner product, considering model temperature (0.01)
    logits_per_text = (text_embedding / pipeline.model.temperature) @ img_embedding.t()
    # Calculate probability distribution based on logits
    probs = logits_per_text.softmax(dim=-1).cpu().numpy()

# Print results
print("Image-text similarity probability distribution:", probs.tolist())
# Image-text similarity probability distribution: [[0.71826171875, 5.364418029785156e-07, 0.28125, 0.0006151199340820312]]
```

As we can see, the model assigns significantly higher similarity probability to the Chinese New Year couplets image most relevant to the text compared to the other three images. The two challenging negative examples did not mislead the model, completing our text query image matching process. In the code execution above, after calling the `pipeline.forward()` method, we also obtained normalized feature vectors for both images and text (`img_embedding` and `text_embedding` in the code), which can be further used for other downstream tasks.

We also provide an example of single image matching with multiple candidate texts, using the example image below with four candidate texts: "Squirtle", "Bulbasaur", "Charmander", and "Pikachu".

<p align="center">
    <img src="./_resources/pokemon.jpeg" width="200" />
</p>

```python
input_img = load_image('https://yangan2.oss-cn-beijing.aliyuncs.com/pokemon.jpeg') # Supports Pikachu example image path/local image, returns PIL.Image
input_texts = ["Squirtle", "Bulbasaur", "Charmander", "Pikachu"]

img_embedding = pipeline.forward({'img': input_img})['img_embedding'] # 2D Tensor, [number of images, feature dimension]
text_embedding = pipeline.forward({'text': input_texts})['text_embedding'] # 2D Tensor, [number of texts, feature dimension]

# Calculate image-text similarity
with torch.no_grad():
    logits_per_image = (img_embedding / pipeline.model.temperature) @ text_embedding.t()
    probs = logits_per_image.softmax(dim=-1).cpu().numpy()

print("Image-text similarity probability distribution:", probs)
# Image-text similarity probability distribution: [[1.182e-03 5.023e-02 5.760e-04 9.482e-01]]
```

The model again provides correct predictions, with "Pikachu" receiving the highest image-text similarity score.

## 3.3 Model Finetuning

Currently, ModelScope supports not only Chinese CLIP inference but also single-GPU/multi-GPU finetuning of CLIP parameters using downstream image-text pair datasets. Here we use the [MUGE image-text retrieval dataset](https://tianchi.aliyun.com/muge) already integrated into ModelScope as an example to demonstrate how to prepare a training script for Chinese CLIP finetuning.

### 3.3.1 Create Script & Necessary Imports

For example, we create a training script `clip_train_entry.py` and first complete the necessary import operations:

```python
# -*- coding: utf-8 -*-
import os

import json
import shutil

from modelscope.metainfo import Metrics, Trainers
# Python classes for metrics and trainers
from modelscope.msdatasets import MsDataset
# Python class for ModelScope integrated datasets
from modelscope.trainers import build_trainer
# Method to build trainer
from modelscope.utils.constant import ModelFile
```

### 3.3.1 Prepare Training Hyperparameters

In the training script `clip_train_entry.py`, we add the following code to define a Python dict specifying hyperparameters for finetuning, including model scale, learning rate, number of training epochs, etc. The specific format and meaning of hyperparameters are as follows:

```python
finetune_cfg = \
    {
        # Specify training framework as pytorch, no modification needed
        'framework': 'pytorch',
        # Train multimodal representation task (supported by Chinese CLIP), no modification needed
        'task': 'multi-modal-embedding',
        # Pipeline for multimodal representation, no modification needed
        'pipeline': {'type': 'multi-modal-embedding'},
        # Model scale used (using base as example), refer to section 3.2 and appendix
        'pretrained_model': {'model_name': \
            'damo/multi-modal_clip-vit-base-patch16_zh'},
        # Field names for images and text in dataset, using MUGE as example
        'dataset': {'column_map': {'img': 'image', 'text': 'query'}},
        # Model and training log storage directory, final checkpoint will be stored in $work_dir/output/
        'train': {'work_dir': './workspace/ckpts/clip',
                # For multi-GPU training, uncomment the line below; keep commented for single GPU
                # 'launcher': 'pytorch',
                # Number of training epochs
                'max_epochs': 1,
                # Use mixed precision training, no modification needed
                'use_fp16': True,
                # Training batch size per GPU, determine based on actual GPU memory
                'dataloader': {'batch_size_per_gpu': 180,
                                # Number of workers per GPU for training DataLoader, 0 means main process reads data directly
                                'workers_per_gpu': 16,
                                # Whether to shuffle, no modification needed
                                'shuffle': True,
                                # Drop last incomplete batch at end of each epoch, no modification needed
                                'drop_last': True},
                # Specify proportion of total steps for learning rate warmup
                'lr_scheduler': {'warmup_proportion': 0.1},
                # Use learning rate scheduler (cosine scheduler), no modification needed
                'lr_scheduler_hook': {'type': 'LrSchedulerHook', 'by_epoch': False},
                # Optimizer type
                'optimizer': {'type': 'AdamW'},
                # Specify peak learning rate (warms up to peak then decays to 0)
                'optimizer_hparams': {'lr': 2.5e-05,
                                        # Specify weight_decay, no modification needed
                                        'weight_decay': 0.001,
                                        # Adam hyperparameters, generally no modification needed
                                        'beta1': 0.9,
                                        'beta2': 0.999,
                                        'eps': 1e-08},
                # Mixed precision training hyperparameters, generally no modification needed
                'optimizer_hook': {'type': 'TorchAMPOptimizerHook',
                                    'cumulative_iters': 1,
                                    'loss_keys': 'loss'},
                # For multi-GPU training, whether to compute contrastive learning loss on global batch via GPU communication; no effect for single GPU
                'loss_cfg': {'aggregate': True},
                # Save best validation metric parameters every specified number of steps
                'hooks': [{'type': 'BestCkptSaverHook',
                            # Chinese CLIP finetuning uses in-batch text-to-image retrieval Recall@1
                            # (note: different from global text-to-image retrieval Recall@1, calculated only within batch)
                            'metric_key': 'inbatch_t2i_recall_at_1',
                            'by_epoch': False,
                            'interval': 200},
                            {'type': 'TextLoggerHook', 'interval': 1},
                            {'type': 'IterTimerHook'},
                            # Evaluation interval, can be specified by steps or epochs
                            {'type': 'EvaluationHook', 'by_epoch': False, 'interval': 200},
                            {'type': 'EvaluationHook', 'by_epoch': True, 'interval': 1},
                            {'type': 'ClipClampLogitScaleHook'}]},
        # Batch size for calculating in-batch text-to-image retrieval Recall@1 during evaluation
        'evaluation': {'dataloader': {'batch_size_per_gpu': 128,
                                    # Number of workers per GPU for validation DataLoader, 0 means main process reads data directly
                                    'workers_per_gpu': 16,
                                    'shuffle': False,
                                    'drop_last': True},
                    # Chinese CLIP finetuning uses in-batch text-to-image retrieval Recall@1, no modification needed
                    'metrics': [{'type': 'inbatch_recall'}]},
        'preprocessor': []}
```

### 3.3.2 Execute Training Task

In the training script `clip_train_entry.py`, we finally add the following code to initialize the output directory, obtain the integrated MUGE dataset, and build the trainer:

```python

if __name__ == "__main__":
    # Initialize output directory, please use same path as above dict
    WORKSPACE = './workspace/ckpts/clip'
    os.makedirs(WORKSPACE, exist_ok=True)
    config_file = os.path.join(WORKSPACE, ModelFile.CONFIGURATION)
    with open(config_file, 'w') as writer:
        json.dump(finetune_cfg, writer) # Save training hyperparameters

    # Specify CLIP scale for pretraining, please keep consistent with 'pretrained_model' in above dict
    pretrained_model = 'damo/multi-modal_clip-vit-base-patch16_zh'
    args = dict(
        model=pretrained_model,
        work_dir=WORKSPACE,
        # Get integrated MUGE dataset, automatically downloaded on first script execution
        train_dataset=MsDataset.load(
            'muge', namespace='modelscope', split='train'),
        eval_dataset=MsDataset.load(
            'muge', namespace='modelscope', split='validation'),
        # Metrics used for CLIP validation, no modification needed
        metrics=[Metrics.inbatch_recall],
        # Pass dict defined in section 3.3.1
        cfg_file=config_file)
    # Build trainer
    trainer = build_trainer(
        name=Trainers.clip_multi_modal_embedding, default_args=args)
    # Start training
    trainer.train()

```

After preparing the training script `clip_train_entry.py`, start training with the following commands:

Single-GPU training:
```bash
export CUDA_VISIBLE_DEVICES=0;python3 clip_train_entry.py
```

Multi-GPU training (please uncomment `launcher` in section 3.3.1):
```bash
# CUDA_VISIBLE_DEVICES and WORLD_SIZE depend on actual situation
export CUDA_VISIBLE_DEVICES=0,1,2,3,4,5,6,7;
export WORLD_SIZE=8;
# Replace with different ports when running multiple groups on same machine
export port=9932;
python -m torch.distributed.launch --nproc_per_node=$WORLD_SIZE --nnodes=1 --node_rank=0 --master_port=9932 --use_env clip_train_entry.py
```

During training, logs like the following will be printed, showing learning rate, training loss, GPU memory usage, estimated completion time, and other monitoring information:

```
INFO:modelscope:epoch [1][2/1390]       lr: 1.799e-07, eta: 2:35:20, iter_time: 0.499, data_load_time: 0.047, memory: 29279, loss: 1.1768, logit_scale: 4.6052, global_batch_size: 180.0000
```

### 3.3.3 Training Metrics & Obtaining Finetuned Checkpoint

During training, evaluation will be performed on the validation set at preset intervals (steps/epochs), providing validation metrics. For Chinese CLIP finetuning, in-batch text-to-image retrieval Recall@1 on the validation set is used as the evaluation metric.

```
2022-10-31 12:36:06,344 - modelscope - INFO - epoch(eval) [1][238]      memory: 30721, inbatch_t2i_recall_at_1: 0.8284, loss: 1.0088, logit_scale: 4.6046, global_batch_size: 180.0000
```

Note that this metric differs from the global text-to-image retrieval Recall@1 metric listed in the Chinese CLIP model card—it only performs recall and calculates Recall within a single batch, making it incomparable to the global metric. To calculate the global text-to-image retrieval Recall@1 metric, you need to compute and retrieve the most relevant image for each text query from the entire validation set of images.

After training completes, you'll find an output folder in the pre-specified output path, containing the `pytorch_model.bin` file which is the finetuned checkpoint.

## 3.4 Key Configuration Introduction

### 3.4.1 Model Construction Related Configuration

Currently, each scale of our CLIP model has corresponding configuration JSON files. Since CLIP consists of dual towers, there are separate JSON configuration files for the vision and text sides, named `vision_model_config.json` and `text_model_config.json` respectively. These files are downloaded along with model parameters when executing model loading code (refer to section 3.2 "Build pipeline & load model"). These JSON configuration files specify basic structural hyperparameters such as model resolution, number of layers, hidden dimensions, etc. Below we use the base-scale CLIP model as an example to introduce specific hyperparameter configuration items in the JSON configuration. For details about existing CLIP model scales, please refer to the appendix.

Model structure configuration files are typically located in `~/.cache/modelscope/hub/damo/multi-modal_clip-vit-base-patch16_zh/` folder. If this directory doesn't exist, execute the following Python command to get the actual model download folder:

```python
from modelscope.hub.snapshot_download import snapshot_download
print(snapshot_download('damo/multi-modal_clip-vit-base-patch16_zh')) # Will print actual model download folder
```

For the vision side, the configuration file is `vision_model_config.json` in that folder, with the following JSON format:

```json
{
    "embed_dim": 512, # Output vector feature dimension
    "image_resolution": 224, # Compatible image resolution, original input images will be automatically scaled to this resolution by ModelScope
    "vision_layers": 12, # Number of vision Transformer model layers
    "vision_width": 768, # Vision Transformer hidden dimension
    "vision_patch_size": 16 # Vision Transformer patch size for image splitting
}
```

For the text side, open the `text_model_config.json` file in that folder, with the following JSON format:

```json
{
    "vocab_size": 21128, # Vocabulary size
    "text_attention_probs_dropout_prob": 0.1, # Attention neuron dropout probability, inherited from BERT, only used for finetuning
    "text_hidden_act": "gelu", # Activation function type
    "text_hidden_dropout_prob": 0.1, # Neuron dropout probability, inherited from BERT, only used for finetuning
    "text_hidden_size": 768, # Text side hidden dimension
    "text_initializer_range": 0.02, # Text side initialization distribution range, inherited from BERT
    "text_intermediate_size": 3072, # Text side fully connected layer intermediate dimension
    "text_max_position_embeddings": 512, # Text side position encoding maximum length
    "text_num_attention_heads": 12, # Text side attention head count
    "text_num_hidden_layers": 12, # Text side model layer count
    "text_type_vocab_size": 2  # Text side type encoding type count, inherited from BERT
}
```

## 3.5 Core Code Introduction

For Chinese CLIP models, the core code involves model construction. We reuse Chinese BERT tokenizer code for the text side. ModelScope encapsulates Chinese CLIP model code to complete Pipeline construction and support finetuning and inference. Next, we'll focus on introducing core code related to CLIP model implementation (located in ModelScope codebase under `modelscope/models/multi_modal/clip/` path). For ModelScope framework-side code, please refer to ModelScope's own [Documentation Center](https://modelscope.cn/docs).

### 3.5.1 Text Tokenizer

As mentioned above, we directly reuse Chinese BERT tokenizer code. The vocabulary file `vocab.txt` is downloaded along with model parameters during model construction (see section 3.2). Tokenizer implementation code can be found in `modelscope/models/multi_modal/clip/bert_tokenizer.py`. Below is the basic tokenization process. **This process is already integrated into ModelScope's internal pipeline—users don't need to execute this code when extracting text features; simply input raw text as shown in section 3.2. This is only to demonstrate internal working principles**:

```python
from modelscope.models.multi_modal.clip.bert_tokenizer import FullTokenizer
from modelscope.hub.snapshot_download import snapshot_download
# Build tokenizer
model_dir = snapshot_download('damo/multi-modal_clip-vit-base-patch16_zh')
vocab_file = f'{model_dir}/vocab.txt'
tokenizer = FullTokenizer(vocab_file=vocab_file)
# Perform tokenization
text = "Chinese New Year festive couplets"
context_length = 52 # Maximum text sequence length, set to 52, meaning maximum 50 characters excluding CLS and SEP
tokens = tokenizer.convert_tokens_to_ids(
            	tokenizer.tokenize(text)
            )[:context_length - 2]
tokens = [tokenizer.vocab['[CLS]']] + tokens + [tokenizer.vocab['[SEP]']]
print(tokens) # Character-level tokenization with CLS and SEP symbols added, [101, 6814, 2399, 1599, 2412, 2190, 5468, 102]
```

### 3.5.2 Image Side Preprocessing

The following code (refer to `modelscope/preprocessors/multi_modal.py`) preprocesses input PIL.Image type images into torch Tensor. Our approach is consistent with standard English CLIP practices. **This process is already integrated into ModelScope's internal pipeline—users don't need to execute this code when extracting text features; simply input raw images using image file paths or URLs as shown in section 3.2. This is only to demonstrate internal working principles**:

```python
from PIL import Image
from torchvision.transforms import Compose, Normalize, Resize, ToTensor
from modelscope.preprocessors.image import load_image

# Convert image to RGB
def _convert_to_rgb(image):
    return image.convert('RGB')

# Preprocessing operator construction function
def image_transform(image_size=224):
    transform = Compose([
        _convert_to_rgb,
        Resize((image_size, image_size)),
        ToTensor(),
        Normalize((0.48145466, 0.4578275, 0.40821073),
                  (0.26862954, 0.26130258, 0.27577711)),
    ])
    return transform

image_input = load_image('https://yangan2.oss-cn-beijing.aliyuncs.com/pokemon.jpeg')
image_resolution = 224 # Resolution, actually received from vision side configuration mentioned in section 3.4.1
img_preprocess = image_transform(image_resolution) # Input resolution, returns preprocessing operator
image_tensor = img_preprocess(image_input) # torch Tensor
```

### 3.5.3 CLIP Model Implementation Code

Main implementation code can be found in `modelscope/models/multi_modal/clip/model.py`. On the CLIP model vision side, we use the classic [Vision Transformer model](https://arxiv.org/abs/2010.11929) structure, containing the following class-defined structural modules from top to bottom:

- VisualTransformer: Top-level module of Vision Transformer model, receiving various structural configurations for the vision side mentioned in section 3.4.1, completing embedding encoding before multi-layer Transformer, multi-layer Transformer computation, and final projection transformation
- Transformer: Simple Transformer implementation module, responsible for executing main multi-layer Transformer computation in VisualTransformer
- ResidualAttentionBlock: Module implementing single-layer Transformer operation, with multiple ResidualAttentionBlocks stacked together in Transformer
- QuickGELU: Activation function used in Vision Transformer

On the CLIP text side, we directly reuse classic BERT code, defining BERT structural modules:

- BertConfig (configuration_bert.py): BERT-related configuration items, receiving various structural configurations for the text side mentioned in section 3.4.1
- BertModel (modeling_bert.py): Classic BERT model implementation code

Based on vision and text side model definitions, the CLIP class in `model.py` encapsulates the dual-tower model implementation as the model definition module for Chinese CLIP. Above the CLIP class definition, operations such as loading pretrained parameters, normalizing output vectors, and sending results to ModelScope pipeline are further encapsulated, resulting in CLIPForMultiModalEmbedding—the top-level class for ModelScope to call CLIP models. During actual finetuning and inference, user-input images and text first pass through CLIPPreprocessor defined in `modelscope/preprocessors/multi_modal.py`, completing operations described in sections 3.5.1 and 3.5.2 to obtain Tensor-format image-text input data, which is finally processed by CLIPForMultiModalEmbedding for feature computation and result return.

# 4. Performance Demonstration

Chinese CLIP was experimentally validated on a series of multimodal and vision downstream tasks to verify its effectiveness, including the MUGE dataset for e-commerce image retrieval ([https://tianchi.aliyun.com/muge](https://tianchi.aliyun.com/muge)), general-domain cross-modal retrieval datasets Flickr30K-CN [8] and COCO-CN [9], and zero-shot image classification on 20 vision datasets ([https://computer-vision-in-the-wild.github.io/eccv-2022/](https://computer-vision-in-the-wild.github.io/eccv-2022/)).

For retrieval tasks, Chinese CLIP achieved significantly better results than previous SOTA models in both zero-shot and finetuned scenarios across all 3 datasets, as shown in the tables below:

<figure>
  <img src="./_resources/muge.png" alt="MUGE E-commerce Image Retrieval"/>
  <figcaption><center>MUGE E-commerce Image Retrieval</center></figcaption>
</figure>
<figure>
  <img src="./_resources/flickr.png" alt="Flickr30K-CN General Domain Cross-modal Retrieval"/>
  <figcaption><center>Flickr30K-CN General Domain Cross-modal Retrieval</center></figcaption>
</figure>
<figure>
  <img src="./_resources/coco.png" alt="COCO-CN General Domain Cross-modal Retrieval"/>
  <figcaption><center>COCO-CN General Domain Cross-modal Retrieval</center></figcaption>
</figure>

Experiments primarily used Recall@K as the evaluation metric, specifically including R@1, R@5, R@10, and Mean Recall. The results above demonstrate that the simple CN-CLIP method, after sufficient training, can outperform SOTA models of equivalent scale, and model performance can be further improved with increased scale and higher image resolution.

Additionally, we tested Chinese CLIP's zero-shot image classification capabilities. Due to the lack of authoritative image classification datasets in the Chinese domain, we selected the image classification series from Microsoft's recent Computer Vision in the Wild, which includes 20 classification datasets—mostly classic English image classification datasets including Caltech-101, CIFAR-10, CIFAR-100, Country211, DTD, EuroSAT, Food-101, FGVC-Aircraft, GTSRB, Hateful-Memes, Kitti-Distance, Oxford-Flowers-102, Oxford-Pets, Patch-Camelyon, RESISC-45, Stanford-Cars, and VOC-2007. We participated with Chinese CLIP in the ECCV 2022 workshop: Workshop on Computer Vision in the Wild centered around this competition—see [link](https://computer-vision-in-the-wild.github.io/eccv-2022/). We manually translated labels and prompts for zero-shot classification for all 20 datasets into Chinese, then used Chinese CLIP for classification.

![image.png](./_resources/big_table.png)

As Chinese CLIP scales up, it surpasses the officially provided baseline model in average scores and outperforms the Large-scale baseline on multiple datasets. Since many datasets are unrelated to Chinese data—such as car category classification, English text classification, aircraft brand and model classification, food classification, etc.—Chinese CLIP doesn't have advantages on many datasets. However, it shows clear advantages on general object classification tasks like CIFAR-10, CIFAR-100, and VOC-2007. RN50 scale will be released soon.

# 5. Summary

This article introduced Chinese CLIP recently proposed by Tongyi Lab, including its implementation methodology and experimental results, with a focus on Chinese CLIP usage methods on ModelScope. Multiple versions are now open-sourced. Users can implement Chinese CLIP-based image-text feature extraction on the ModelScope platform for applications such as cross-modal retrieval and zero-shot classification.

# Appendix: Chinese CLIP Model Scale Structure Information

<figure align="center">
  <img src="./_resources/scale.png" alt="Chinese CLIP Model Scale"/>
  <figcaption><center>Chinese CLIP Model Scale</center></figcaption>
</figure>

# Related Papers and Citation Information

We have published a related paper on Chinese CLIP with more details available for reference. If helpful to your work, please cite:

```
@article{chinese-clip,
  title={Chinese CLIP: Contrastive Vision-Language Pretraining in Chinese},
  author={Yang, An and Pan, Junshu and Lin, Junyang and Men, Rui and Zhang, Yichang and Zhou, Jingren and Zhou, Chang},
  journal={arXiv preprint arXiv:2211.01335},
  year={2022}
}
```

# References

[1]. Radford, A., Kim, J. W., Hallacy, C., Ramesh, A., Goh, G., Agarwal, S., ... & Sutskever, I. (2021, July). Learning transferable visual models from natural language supervision. In _International Conference on Machine Learning_ (pp. 8748-8763). PMLR.

[2]. Carlsson, F., Eisen, P., Rekathati, F., & Sahlgren, M. (2022, June). Cross-lingual and Multilingual CLIP. In _Proceedings of the Thirteenth Language Resources and Evaluation Conference_ (pp. 6848-6854).

[3]. Schuhmann, C., Vencu, R., Beaumont, R., Kaczmarczyk, R., Mullis, C., Katta, A., ... & Komatsuzaki, A. (2021). Laion-400m: Open dataset of clip-filtered 400 million image-text pairs. _arXiv preprint arXiv:2111.02114_.

[4]. Gu, J., Meng, X., Lu, G., Hou, L., Niu, M., Xu, H., ... & Xu, C. (2022). Wukong: 100 Million Large-scale Chinese Cross-modal Pre-training Dataset and A Foundation Framework. _arXiv preprint arXiv:2202.06767_.

[5]. Krishna, R., Zhu, Y., Groth, O., Johnson, J., Hata, K., Kravitz, J., ... & Fei-Fei, L. (2017). Visual genome: Connecting language and vision using crowdsourced dense image annotations. _International journal of computer vision_, _123_(1), 32-73.

[6]. Chen, X., Fang, H., Lin, T. Y., Vedantam, R., Gupta, S., Dollár, P., & Zitnick, C. L. (2015). Microsoft coco captions: Data collection and evaluation server. _arXiv preprint arXiv:1504.00325_.

[7]. Zhai, X., Wang, X., Mustafa, B., Steiner, A., Keysers, D., Kolesnikov, A., & Beyer, L. (2022). Lit: Zero-shot transfer with locked-image text tuning. In _Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition_ (pp. 18123-18133).

[8]. Li, X., Xu, C., Wang, X., Lan, W., Jia, Z., Yang, G., & Xu, J. (2019). COCO-CN for cross-lingual image tagging, captioning, and retrieval. _IEEE Transactions on Multimedia_, _21_(9), 2347-2360.