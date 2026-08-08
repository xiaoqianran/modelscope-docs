<!-- modelscope-docs: vit_base_image_classification | model-overview/vision/vit-base-image-classification/vit-base-image-classification_CN.md -->

# 模型概述
&emsp;&emsp; 卷积神经网络已经成为图像理解任务的主要设计范式，在图像分类任务上证明了这一点。卷积神经网络成功的一个原因是使用了大型训练集，即ImageNet。受基于注意力模型在自然语言处理中成功应用的启发，研究人员对利用convnets中注意机制的架构越来越感兴趣，并将transformer成分移植到卷积网络中，以解决视觉任务。  
&emsp;&emsp; Dosovitskiy等人引入的视觉transformer (vision transformer, [ViT](https://arxiv.org/abs/2010.11929))直接继承了自然语言处理的结构，应用于以原始图像块为输入的图像分类。他们的论文用大型私有标记图像数据集(JFT-300M，3亿张图像)训练的transformer展示出了非常出色的结果。论文的结论是，“在数据量不足的情况下训练transformer不能很好地收敛”，并且这些模型的训练需要大量的计算资源。  
&emsp;&emsp; DeiT模型在Transformer经典[ViT](https://github.com/google-research/vision_transformer)结构的基础上，加入了一个蒸馏token进行知识蒸馏。与ViT需要用非常大的数据集（JFT-300M）来训练并消耗大量的计算资源才能取得SOTA性能不同， DeiT只需要ImageNet数据用8GPU训练3天，相同参数量下性能就能超过ViT，详见论文[Training data-efficient image transformers & distillation through attention](https://arxiv.org/abs/2012.12877)。  
&emsp;&emsp; ViT图像分类模型复现了DeiT-base， 使用ImageNet数据进行训练，Top-1精度比论文结果提升0.4，支持ImageNet 1000类物体识别，也可作为下游任务的预训练backbone。

## 论文的摘要信息
> &emsp;&emsp; 最近，单纯基于注意力的神经网络被证明可以解决图像理解任务，如图像分类。但这些高性能的视觉transformer是使用大型基础设施用数亿图像进行预训练的，从而限制了它们的应用。  
> &emsp;&emsp; 本工作中，我们只在ImageNet上进行训练，提出了具有竞争力的无卷积结构的transformers。我们使用一台电脑且不到3天的时间就能训练完成。我们的视觉transformer (86M参数量)在没有外部数据的情况下，在ImageNet上实现了83.1%的top-1精度。  
> &emsp;&emsp; 更重要的是，提出了一种运用教师-学生策略的transformers。它基于一个蒸馏token，以确保学生模型通过注意力从老师模型那里学习。本文研究了这种基于token蒸馏的特点，尤其是在使用卷积网络作为教师时。这个成果在ImageNet(我们获得了85.2%的准确率)和其他任务上都比卷积网络更具有竞争性。

## 模型的领先性

1. 证明不包含任何卷积层的神经网络可以在没有外部数据的情况下，在ImageNet上取得SOTA的结果。
2. 提出一种新的基于蒸馏token的蒸馏过程，它与class token的作用相同，只是它的目的是产生教师的估计标签。这两个token通过注意力在transformer中相互作用。这种特有的transformer策略比蒸馏有显著的优势。
3. 通过提出的蒸馏，图像transformers从卷积网络中学习到比其它性能相当的transformer更多的信息。
4. 在ImageNet上预训练的模型在转移到不同的下游任务(如细粒度分类)时更具有竞争力。

| DeiT-S | #param. | image size | throughput(image/s) | ImNet top-1 |
| --- | --- | --- | --- | --- |
| ViT-B/16 | 86M | 384*384 | 85.9 | 77.9 |
| ViT-L/16 | 307M | 384*384 | 27.3 | 76.5 |
| DeiT-T | 6M | 224*224 | 2529.5 | 74.5 |
| DeiT-S | 22M | 224*224 | 936.2 | 81.2 |
| DeiT-B | 87M | 224*224 | 290.9 | 83.4 |


## 模型参数配置文件
DeiT模型的超参数控制可以在下载下来的模型文件中找到config.py文件，当前的模型只支持推理，暂未支持训练。该文件有效的参数格式如下：
```python
 data = dict(
    test=dict(
        type='ImageNet', 								# 数据类型为ImageNet数据类型
        pipeline=[
            dict(type='LoadImageFromFile'), 			# 默认输入图像类型为输入图像文件
            dict(
                type='Resize', 							# 缩放操作
                size=(256, -1), 						# 先将原始图片的短边缩放至256
                backend='pillow', 						# 使用pillow后端
                interpolation='bicubic'), 				# 插值类型
            dict(type='CenterCrop', crop_size=224), 	# 中心裁切为224x224
            dict(
                type='Normalize',
                mean=[123.675, 116.28, 103.53],
                std=[58.395, 57.12, 57.375],
                to_rgb=True),						  	# 图像归一化，并转为RGB格式
            dict(type='ImageToTensor', keys=['img']),	# 返回预处理后的图像数据的键名
            dict(type='Collect', keys=['img'])
        ])
)

model = dict(
    type='ImageClassifier',
    backbone=dict(
        type='VisionTransformer',
        arch='deit-base',                # 模型定义为deit-base
        img_size=224,					 # 输入大小为224*224
        patch_size=16,					 # patch大小为16
        drop_path_rate=0.1),			 # drop_path为0.1
    neck=None,
    head=dict(
        type='VisionTransformerClsHead', # 定义模型的head
        num_classes=1000,				 # 类别数
        in_channels=768,				 # head的输入通道数
    ),
    init_cfg=[                           # 指定层的初始化方式
        dict(type='TruncNormal', layer='Linear', std=0.02),
        dict(type='Constant', layer='LayerNorm', val=1.0, bias=0.0)
    ],
)
```

参数说明：
- data - 定义模型推理中的预处理过程pipeline，预处理操作见data.test.pipeline中的注释。
- model - 定义模型的参数，详见注释。

## 模型配置文件
整个模型参数配置可以在下载下来的模型文件中找到configuration.json文件，该文件的默认配置如下：
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

参数说明：
- framework -  深度学习框架，这里固定为"pytorch"
- task -  算法所属的任务类型，这里固定为"image-classification"
- pipeline - 当前模型使用推理名称，这里固定为"vit-base_image-classification_ImageNet-labels"
- model - 模型的名称，这里固定为"ClassificationModel"

当用户在推理中使用Deit的模型时，这些参数一般都是固定的。您可以使用Model类直接拉起模型：
```python
from modelscope.models import Model
model = Model.from_pretrained('damo/cv_vit-base_image-classification_ImageNet-labels')
```

Model.from_pretrained接口说明：
```python
Model.from_pretrained(model_name_or_path,
                        revision,
                        cfg_dict=None,
                        device=None,
                        *model_args,
                        **kwargs)
```

- model_name_or_path (string) -  模型id或本地模型的路径。
- revision (string) -  模型的版本号，对应ModelHub的版本，默认取离当前Library发布之前的最新版本。
- cfg_dict (Config)   - 如不设置，则根据模型文件夹自动加载configuration.json配置文件。
- device (string)  -  模型加载到cpu或gpu，默认使用gpu。自动检测环境，优先使用gpu。

## 快速使用示例
可以使用[modelscope-library](https://www.modelscope.cn/#/docs/ModelScope%20Library%E6%A6%82%E8%A7%88%E4%BB%8B%E7%BB%8D)加载模型，需先安装modelscope-library，提供输入图片，即可通过简单的Pipeline调用来使用。
```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

img_path = 'https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/bird.JPEG'
image_classification = pipeline(Tasks.image_classification,
                                model='damo/cv_vit-base_image-classification_ImageNet-labels')
result = image_classification(img_path)
print(result)
```
输出结果：
```python
{'scores': [0.84903693, 0.022471337, 0.009794094, 0.0018390082, 0.0012547993], 'labels': ['house finch, linnet, Carpodacus mexicanus', 'indigo bunting, indigo finch, indigo bird, Passerina cyanea', 'brambling, Fringilla montifringilla', 'goldfinch, Carduelis carduelis', 'junco, snowbird']}
```
'scores' ： top5类别的预测分数，'labels'： top5类别对应的预测标签。

pipeline接口说明：
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

- task(string) -  算法所属的任务类型，本模型为Tasks.image_classification，即分类任务。
- model(string, List[string], Model, List[Model])   - 模型id，即ModelHub上模型的路径，本模型为'damo/cv_vit-base_image-classification_ImageNet-labels'。
- preprocessor -  预处理器，本模型无需设置。
- config_file(string)  -  如不设置，则根据模型id自动加载configuration.json配置文件。
- pipeline_name(string)  -  如不设置，则根据模型id自动加载configuration.json中的"pipeline"。
- framework(string)  -  如不设置，则根据模型id自动加载configuration.json中的"framework"。
- device(string)  -  使用cpu或gpu进行推理，默认使用gpu，pipeline自动检测环境，优先使用gpu进行推理。
- model_revision(string)  - 模型的版本号，对应ModelHub的分支名，默认为master。

pipeline支持输入的图像类型：url，本地图片路径。支持的数据格式：PIL.Image.Image，numpy.ndarray。

更多使用说明请参阅[ModelScope文档中心](https://www.modelscope.cn/#/docs)

## 指定预处理、后处理进行模型推理
如果分别使用预处理、前向推理、后处理3个步骤进行模型推理，或自定义预处理和后处理操作，可以采用如下示例代码：
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
输出结果：
```python
{'scores': [0.84903693, 0.022471337, 0.009794094, 0.0018390082, 0.0012547993], 'labels': ['house finch, linnet, Carpodacus mexicanus', 'indigo bunting, indigo finch, indigo bird, Passerina cyanea', 'brambling, Fringilla montifringilla', 'goldfinch, Carduelis carduelis', 'junco, snowbird']}
```
'scores' ： top5类别的预测分数，'labels'： top5类别对应的预测标签。

### 模型预处理
```
pipeline.preprocess(input)
```
输入：支持输入的图像类型：url，本地图片路径。支持的数据格式：PIL.Image.Image，numpy.ndarray。
输出： 字典类型:
```python
{'img_metas': DataContainer_data, 
 'img': tensor_data
}
```
'img_metas' ：mmcv的DataContainer类型，包含预处理后的图像信息，如'img_shape'(图像尺寸)，'img_norm_cfg'(图像'mean'和'std'值)。
'img'：pytorch tensor格式的图像数据。
预处理的流程由模型参数配置文件config.py中的data.test.pipeline进行配置。预处理的过程如下：
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
本模型测试时主要的预处理如下：

- Resize：先将原始图片的短边缩放至256
- Normalize：图像归一化，减均值除以标准差
- CenterCrop：裁切为224x224

### 模型的forward
模型Deit进行模型推理。
```python
pipeline.forward(input)
```
输入：preprocess返回的字典类型。
输出：字典类型，模型推理输出的类别分数值。
```python
{'scores': array}
```
'scores' ： 各个类别模型推理后的分数值。

### 模型后处理
对模型输出进行后处理，输出分类结果。
```python
pipeline.postprocess(inputs)
```
输入：forward返回的字典类型。
输出：字典类型，包含top5类别的分数和对应的标签。
```python
{'scores': [],  'labels': []}
```
'scores' ： top5的预测分数。
'labels'： top5对应的预测标签。
默认进行后处理的操作如下：
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

## 模型的输出
输出字典类型，包含top5类别的分数和对应的标签.
```python
{'scores': [],  'labels': []}
```
示例：
```python
{'scores': [0.8401925, 0.030805457, 0.008376475, 0.0021617431, 0.0016513821], 'labels': ['house finch, linnet, Carpodacus mexicanus', 'indigo bunting, indigo finch, indigo bird, Passerina cyanea', 'brambling, Fringilla montifringilla', 'goldfinch, Carduelis carduelis', 'junco, snowbird']}
```
'scores' ： top5的预测分数。
'labels'： top5对应的预测标签。

## 模型的训练
主要训练参数遵循[DeiT论文](https://arxiv.org/abs/2012.12877)的设置:
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
除了weight decay在复现时设置为0.1，其它不变。Top-1精度比论文结果提升0.4。

## 训练数据
[ImageNet-1k](https://ieeexplore.ieee.org/document/5206848)：ImageNet数据集包含14,197,122个带注释的图像。自2010年以来，作为图像分类的基准数据集，该数据集被用于ImageNet大规模视觉识别挑战(ILSVRC)。

## 模型局限性以及可能的偏差

- 只支持ImageNet-1K标签覆盖到的物体识别
- 当前未支持finetune

## 数据评估及结果
模型在ImageNet-1k val上进行测试，结果如下:

| **Model** | **top-1 acc** | **top-5 acc** | **#params** | **Remark** |
| --- | --- | --- | --- | --- |
| DeiT-base | 81.8 | 95.6 | 86M | [official](https://github.com/facebookresearch/deit/blob/main/README_deit.md) |
| DeiT-base | 82.2 | 95.9 | 86M | modelscope |

## 其它文档
其它使用示例等参考[ModelScope文档中心](https://www.modelscope.cn/#/docs)

## 论文引用
```latex
@InProceedings{pmlr-v139-touvron21a,
  title =     {Training data-efficient image transformers &amp; distillation through attention},
  author =    {Touvron, Hugo and Cord, Matthieu and Douze, Matthijs and Massa, Francisco and Sablayrolles, Alexandre and Jegou, Herve},
  booktitle = {International Conference on Machine Learning},
  pages =     {10347--10357},
  year =      {2021},
  volume =    {139},
  month =     {July}
}
```

