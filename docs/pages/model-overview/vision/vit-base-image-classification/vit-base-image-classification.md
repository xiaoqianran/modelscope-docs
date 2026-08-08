<!-- modelscope-docs: vit_base_image_classification | model-overview/vision/vit-base-image-classification/vit-base-image-classification_EN.md -->

# Model Overview
&emsp;&emsp; Convolutional neural networks have become the dominant design paradigm for image understanding tasks, as demonstrated in image classification. One reason for the success of CNNs is the use of large training datasets, specifically ImageNet. Inspired by the success of attention-based models in natural language processing, researchers have shown increasing interest in architectures that leverage attention mechanisms within convnets, transplanting transformer components into convolutional networks to address vision tasks.

&emsp;&emsp; The Vision Transformer (ViT) introduced by Dosovitskiy et al. directly inherits the structure from natural language processing and applies it to image classification using raw image patches as input. Their paper demonstrated exceptional results with transformers trained on a large private labeled image dataset (JFT-300M, 300 million images). The paper concluded that "transformers trained with insufficient data do not converge well," and that training these models requires substantial computational resources.

&emsp;&emsp; The DeiT model builds upon the classic ViT architecture by incorporating a distillation token for knowledge distillation. Unlike ViT, which requires very large datasets (JFT-300M) and significant computational resources to achieve state-of-the-art (SOTA) performance, DeiT can achieve better performance than ViT with the same parameter count by training only on ImageNet data for 3 days using 8 GPUs, as detailed in the paper "[Training data-efficient image transformers & distillation through attention](https://arxiv.org/abs/2012.12877)."

&emsp;&emsp; The ViT image classification model reproduces DeiT-base, trained on ImageNet data, achieving 0.4% higher Top-1 accuracy than the paper's reported results. It supports ImageNet 1000-class object recognition and can also serve as a pre-trained backbone for downstream tasks.

## Paper Abstract
> &emsp;&emsp; Recently, purely attention-based neural networks have been shown to solve image understanding tasks such as image classification. However, these high-performance vision transformers are pre-trained using hundreds of millions of images with large-scale infrastructure, limiting their accessibility.
> 
> &emsp;&emsp; In this work, we present competitive convolution-free transformers trained exclusively on ImageNet. We can complete training using a single computer in less than 3 days. Our vision transformer (86M parameters) achieves 83.1% top-1 accuracy on ImageNet without external data.
> 
> &emsp;&emsp; More importantly, we propose a teacher-student strategy for transformers based on a distillation token that ensures the student learns from the teacher through attention. We study the characteristics of this token-based distillation, particularly when using convolutional networks as teachers. This approach achieves competitive results against convolutional networks on ImageNet (we achieve 85.2% accuracy) and other tasks.

## Model Advantages

1. Demonstrates that neural networks without any convolutional layers can achieve SOTA results on ImageNet without external data.
2. Proposes a novel distillation process based on a distillation token that functions similarly to the class token but is designed to produce the teacher's estimated labels. These two tokens interact through attention within the transformer. This unique transformer strategy shows significant advantages over traditional distillation.
3. Through the proposed distillation, image transformers learn more information from convolutional networks than from other transformers with comparable performance.
4. Models pre-trained on ImageNet show competitive performance when transferred to different downstream tasks (such as fine-grained classification).

| DeiT-S | #param. | image size | throughput(image/s) | ImNet top-1 |
| --- | --- | --- | --- | --- |
| ViT-B/16 | 86M | 384*384 | 85.9 | 77.9 |
| ViT-L/16 | 307M | 384*384 | 27.3 | 76.5 |
| DeiT-T | 6M | 224*224 | 2529.5 | 74.5 |
| DeiT-S | 22M | 224*224 | 936.2 | 81.2 |
| DeiT-B | 87M | 224*224 | 290.9 | 83.4 |


## Model Parameter Configuration File
The hyperparameter configuration for the DeiT model can be found in the `config.py` file within the downloaded model files. Currently, the model only supports inference and does not support training. The valid parameter format in this file is as follows:

```python
 data = dict(
    test=dict(
        type='ImageNet', 								# Data type is ImageNet
        pipeline=[
            dict(type='LoadImageFromFile'), 			# Default input image type is image file
            dict(
                type='Resize', 							# Resize operation
                size=(256, -1), 						# First resize the shorter side of the original image to 256
                backend='pillow', 						# Use pillow backend
                interpolation='bicubic'), 				# Interpolation type
            dict(type='CenterCrop', crop_size=224), 	# Center crop to 224x224
            dict(
                type='Normalize',
                mean=[123.675, 116.28, 103.53],
                std=[58.395, 57.12, 57.375],
                to_rgb=True),						  	# Image normalization and conversion to RGB format
            dict(type='ImageToTensor', keys=['img']),	# Key name for returning preprocessed image data
            dict(type='Collect', keys=['img'])
        ])
)

model = dict(
    type='ImageClassifier',
    backbone=dict(
        type='VisionTransformer',
        arch='deit-base',                # Model defined as deit-base
        img_size=224,					 # Input size is 224*224
        patch_size=16,					 # Patch size is 16
        drop_path_rate=0.1),			 # drop_path is 0.1
    neck=None,
    head=dict(
        type='VisionTransformerClsHead', # Define model head
        num_classes=1000,				 # Number of classes
        in_channels=768,				 # Input channels for head
    ),
    init_cfg=[                           # Initialization method for specified layers
        dict(type='TruncNormal', layer='Linear', std=0.02),
        dict(type='Constant', layer='LayerNorm', val=1.0, bias=0.0)
    ],
)
```

Parameter descriptions:
- data - Defines the preprocessing pipeline for model inference. See comments in data.test.pipeline for preprocessing operations.
- model - Defines model parameters. See comments for details.

## Model Configuration File
The complete model parameter configuration can be found in the `configuration.json` file within the downloaded model files. The default configuration of this file is as follows:

```
{
    "framework": "pytorch",
    "task": "image-classification",
    "pipeline": {
        "type": "vit-base_image-classification_ImageNet-labels"
    },
    "model": {
        "type": "ClassificationModel"
    }
}
```

Parameter descriptions:
- framework - Deep learning framework, fixed as "pytorch"
- task - Task type of the algorithm, fixed as "image-classification"
- pipeline - Inference name used by the current model, fixed as "vit-base_image-classification_ImageNet-labels"
- model - Model name, fixed as "ClassificationModel"

When users use the DeiT model for inference, these parameters are generally fixed. You can directly load the model using the Model class:

```python
from modelscope.models import Model
model = Model.from_pretrained('damo/cv_vit-base_image-classification_ImageNet-labels')
```

Model.from_pretrained interface description:

```python
Model.from_pretrained(model_name_or_path,
                        revision,
                        cfg_dict=None,
                        device=None,
                        *model_args,
                        **kwargs)
```

- model_name_or_path (string) - Model ID or local model path.
- revision (string) - Model version corresponding to ModelHub version, defaults to the latest version before the current library release.
- cfg_dict (Config) - If not set, automatically loads the configuration.json file from the model folder.
- device (string) - Load model to CPU or GPU, defaults to GPU. Automatically detects environment and prioritizes GPU usage.

## Quick Usage Example
You can use the [modelscope-library](https://www.modelscope.ai/#/docs/ModelScope%20Library%E6%A6%82%E8%A7%88%E4%BB%8B%E7%BB%8D) to load the model. After installing modelscope-library, you can use the model with a simple Pipeline call by providing an input image:

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

img_path = 'https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/bird.JPEG'
image_classification = pipeline(Tasks.image_classification,
                                model='damo/cv_vit-base_image-classification_ImageNet-labels')
result = image_classification(img_path)
print(result)
```

Output result:

```python
{'scores': [0.84903693, 0.022471337, 0.009794094, 0.0018390082, 0.0012547993], 'labels': ['house finch, linnet, Carpodacus mexicanus', 'indigo bunting, indigo finch, indigo bird, Passerina cyanea', 'brambling, Fringilla montifringilla', 'goldfinch, Carduelis carduelis', 'junco, snowbird']}
```

'scores': Prediction scores for top5 categories, 'labels': Prediction labels corresponding to top5 categories.

Pipeline interface description:

```
pipeline(task=None,
         model=None,
         preprocessor=None,
         config_file=None,
         pipeline_name=None,
         framework=None,
         device='gpu',
         model_revision)
```

- task(string) - Task type of the algorithm. For this model, it's Tasks.image_classification, i.e., classification task.
- model(string, List[string], Model, List[Model]) - Model ID, i.e., the model path on ModelHub. For this model, it's 'damo/cv_vit-base_image-classification_ImageNet-labels'.
- preprocessor - Preprocessor. No need to set for this model.
- config_file(string) - If not set, automatically loads the configuration.json file based on the model ID.
- pipeline_name(string) - If not set, automatically loads the "pipeline" field from configuration.json based on the model ID.
- framework(string) - If not set, automatically loads the "framework" field from configuration.json based on the model ID.
- device(string) - Use CPU or GPU for inference, defaults to GPU. Pipeline automatically detects the environment and prioritizes GPU inference.
- model_revision(string) - Model version corresponding to ModelHub branch name, defaults to master.

Pipeline supports input image types: URL, local image path. Supported data formats: PIL.Image.Image, numpy.ndarray.

For more usage instructions, please refer to the [ModelScope Documentation Center](https://www.modelscope.ai/#/docs)

## Model Inference with Specified Preprocessing and Postprocessing
If you want to perform model inference using three separate steps (preprocessing, forward inference, postprocessing) or customize preprocessing and postprocessing operations, you can use the following example code:

```
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

model_id = 'damo/cv_vit-base_image-classification_ImageNet-labels'
img_path = 'https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/bird.JPEG'
image_classification_pipeline = pipeline(Tasks.image_classification,
																				 model=model_id)

input_data = image_classification_pipeline.preprocess(img_path)
forward_result = image_classification_pipeline.forward(input_data)
result = image_classification_pipeline.postprocess(forward_result)

print(result)
```

Output result:

```python
{'scores': [0.84903693, 0.022471337, 0.009794094, 0.0018390082, 0.0012547993], 'labels': ['house finch, linnet, Carpodacus mexicanus', 'indigo bunting, indigo finch, indigo bird, Passerina cyanea', 'brambling, Fringilla montifringilla', 'goldfinch, Carduelis carduelis', 'junco, snowbird']}
```

'scores': Prediction scores for top5 categories, 'labels': Prediction labels corresponding to top5 categories.

### Model Preprocessing
```
pipeline.preprocess(input)
```
Input: Supported image types include URL and local image path. Supported data formats: PIL.Image.Image, numpy.ndarray.
Output: Dictionary type:
```python
{'img_metas': DataContainer_data,
 'img': tensor_data
}
```
'img_metas': mmcv DataContainer type containing preprocessed image information such as 'img_shape' (image dimensions) and 'img_norm_cfg' (image 'mean' and 'std' values).
'img': Image data in PyTorch tensor format.

The preprocessing pipeline is configured by the data.test.pipeline field in the model parameter configuration file config.py. The preprocessing process is as follows:

```python
from mmcls.datasets.pipelines import Compose
from mmcv.parallel import collate, scatter
if isinstance(input, str):
    img = np.array(load_image(input))
elif isinstance(input, PIL.Image.Image):
    img = np.array(input.convert('RGB'))
elif isinstance(input, np.ndarray):
    if len(input.shape) == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    img = input[:, :, ::-1]  # in rgb order
else:
    raise TypeError(f'input should be either str, PIL.Image,'
                    f' np.array, but got {type(input)}')

mmcls_cfg = self.model.cfg
# build the data pipeline
if mmcls_cfg.data.test.pipeline[0]['type'] == 'LoadImageFromFile':
    mmcls_cfg.data.test.pipeline.pop(0)
data = dict(img=img)
test_pipeline = Compose(mmcls_cfg.data.test.pipeline)
data = test_pipeline(data)
data = collate([data], samples_per_gpu=1)
if next(self.model.parameters()).is_cuda:
    # scatter to specified GPU
    data = scatter(data, [next(self.model.parameters()).device])[0]
```

The main preprocessing steps for this model during testing are:

- Resize: First resize the shorter side of the original image to 256
- Normalize: Image normalization by subtracting mean and dividing by standard deviation
- CenterCrop: Crop to 224x224

### Model Forward
Perform model inference with DeiT model.
```python
pipeline.forward(input)
```
Input: Dictionary type returned by preprocess.
Output: Dictionary type containing category score values from model inference.
```python
{'scores': array}
```
'scores': Score values for each category after model inference.

### Model Postprocessing
Postprocess the model output to generate classification results.
```python
pipeline.postprocess(inputs)
```
Input: Dictionary type returned by forward.
Output: Dictionary type containing scores and corresponding labels for top5 categories.
```python
{'scores': [],  'labels': []}
```
'scores': Prediction scores for top5 categories.
'labels': Prediction labels corresponding to top5 categories.

Default postprocessing operations are as follows:

```python
scores = inputs['scores']

pred_scores = np.sort(scores, axis=1)[0][::-1][:5]
pred_labels = np.argsort(scores, axis=1)[0][::-1][:5]

result = {'pred_score': [score for score in pred_scores]}
result['pred_class'] = [
    self.model.CLASSES[lable] for lable in pred_labels
]

outputs = {
    'scores': result['pred_score'],
    'labels': result['pred_class']
}
```

## Model Output
Output dictionary type containing scores and corresponding labels for top5 categories.
```python
{'scores': [],  'labels': []}
```
Example:
```python
{'scores': [0.8401925, 0.030805457, 0.008376475, 0.0021617431, 0.0016513821], 'labels': ['house finch, linnet, Carpodacus mexicanus', 'indigo bunting, indigo finch, indigo bird, Passerina cyanea', 'brambling, Fringilla montifringilla', 'goldfinch, Carduelis carduelis', 'junco, snowbird']}
```
'scores': Prediction scores for top5 categories.
'labels': Prediction labels corresponding to top5 categories.

## Model Training
Main training parameters follow the settings in the [DeiT paper](https://arxiv.org/abs/2012.12877):

```python
Epochs: 300
Batch size: 1024
Optimizer: AdamW
learning rate: 0:0005*(batchsize/512)
Learning rate decay: cosine
Weight decay: 0.05
Warmup epochs: 5
Label smoothing: 0.1
Stoch. Depth: 0.1
Repeated Aug: True
Rand Augment: 9/0.5
Mixup prob: 0.8
Cutmix prob: 1.0
Erasing prob: 0.25
```

Except for weight decay, which was set to 0.1 during reproduction, all other parameters remain unchanged. The Top-1 accuracy is 0.4% higher than the paper's reported results.

## Training Data
[ImageNet-1k](https://ieeexplore.ieee.org/document/5206848): The ImageNet dataset contains 14,197,122 annotated images. Since 2010, this dataset has served as the benchmark for image classification and has been used in the ImageNet Large Scale Visual Recognition Challenge (ILSVRC).

## Model Limitations and Potential Biases

- Only supports object recognition covered by ImageNet-1K labels
- Currently does not support fine-tuning

## Data Evaluation and Results
The model was tested on ImageNet-1k validation set with the following results:

| **Model** | **top-1 acc** | **top-5 acc** | **#params** | **Remark** |
| --- | --- | --- | --- | --- |
| DeiT-base | 81.8 | 95.6 | 86M | [official](https://github.com/facebookresearch/deit/blob/main/README_deit.md) |
| DeiT-base | 82.2 | 95.9 | 86M | modelscope |

## Other Documentation
For other usage examples, please refer to the [ModelScope Documentation Center](https://www.modelscope.ai/#/docs)

## Paper Citation
```latex
@InProceedings{pmlr-v139-touvron21a,
  title =     {Training data-efficient image transformers \& distillation through attention},
  author =    {Touvron, Hugo and Cord, Matthieu and Douze, Matthijs and Massa, Francisco and Sablayrolles, Alexandre and Jegou, Herve},
  booktitle = {International Conference on Machine Learning},
  pages =     {10347--10357},
  year =      {2021},
  volume =    {139},
  month =     {July}
}
```