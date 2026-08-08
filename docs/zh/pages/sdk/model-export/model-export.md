<!-- modelscope-docs: 模型的导出 | sdk/model-export/model-export_CN.md -->

# 什么是模型导出

当我们使用深度学习模型进行实际生产过程中的服务时，很多时候不会直接使用原始的模型文件（比如，PyTorch的pytorch_model.bin等需要通过load_state_dict加载的二进制文件），这是因为这些模型文件只能在python环境中运行，而且无法进行"优化"。举个例子，假如某个环境是嵌入式设备的单片机，那么在它的上面安装python环境是非常费力的；另外如果模型比较大，想要达到比较高的QPS，模型需要摆脱python环境而使用更快的C++库，或进行一些硬件相关的优化，或进行一些算子的融合。

在这种情况下，使用原始的代码和二进制文件运行就比较得不偿失，因此各类算法库都提供了对应的"导出格式"，比如PyTorch的TorchScript，TensorFlow的GraphDef，或者跨框架格式ONNX。这些格式不仅包含了模型的各类参数，也包含了模型动态图本身，因此可以脱离python环境独立运行并可以获得一定的运行加速，不少算子库也支持以这些格式为起点进行后续优化。ModelScope提供了其内模型的导出方法，用户可以自由选用。

# 导出为ONNX格式

[ONNX](https://onnx.ai/) 全称为开放神经网络交换格式（Open Neural Network Exchange），是微软和Facebook（Meta）联合提出用于表示深度学习模型的文件格式。
其特点为标准的文件格式，且具备平台无关性。也就是说，用户在任意框架（TensorFlow/PyTorch/JAX等）中训练得到的原始模型都可以转换为这种格式进行存储和优化，或转换为其他框架专用的模型文件。ONNX文件和其他输出格式一样，不仅存储了模型权重，也存储了模型DAG图以及一些有用的辅助信息。

如果您的生产环境使用ONNX，或需要ONNX格式进行后续优化，您可以使用ModelScope提供的ONNX转换工具进行模型导出。

## 导出方法

```py
from modelscope.models import Model
from modelscope.exporters import Exporter
model_id = 'damo/nlp_structbert_sentence-similarity_chinese-base'
model = Model.from_pretrained(model_id)
output_files = Exporter.from_model(model).export_onnx(opset=13, output_dir='/tmp', ...)
print(output_files)
```
opset是onnx算子版本，具体可以参考[这里](https://onnxruntime.ai/docs/reference/compatibility.html)。

在导出完成后，ModelScope会使用dummy_inputs验证onnx文件的正确性，因此如果导出过程不报错就证明导出过程已经成功了。

需要注意的是，验证过程需要onnx包和onnxruntime包，如果您的环境中没有安装，会看到如下报错：
```python
"modelscope - WARNING - Cannot validate the exported onnx file, because the installation of onnx or onnxruntime cannot be found"
```
如果需要验证过程可以安装这两个包：
```shell
pip install onnx
pip install onnxruntime
```
或使用conda命令安装：
```shell
conda install -c conda-forge onnx
conda install -c conda-forge onnxruntime
```

如果需要在GPU环境下进行验证过程，可以改为使用下面的命令：
```shell
pip install onnx
pip install onnxruntime-gpu
```
onnxruntime-gpu和CUDA版本和cuDNN版本强相关，安装时请注意版本对应。具体可以参考[这里](https://onnxruntime.ai/docs/execution-providers/CUDA-ExecutionProvider.html)。

## 如何在外部模型上使用导出功能

如果目前支持导出的模型中没有您需要的模型，或该模型是一个torch.nn.Module，可以手动传入dummy_inputs，inputs和outputs来实现。

如下展示了导出transformers库模型的示例。首先把模型和tokenizer初始化出来：
```python
from transformers import BertForSequenceClassification, BertTokenizerFast
model = BertForSequenceClassification.from_pretrained('bert-base-uncased')
tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')
```
之后我们使用tokenizer来生成dummy_inputs并调用导出工具：
```python
from modelscope.exporters import TorchModelExporter
from collections import OrderedDict
# 假设最大支持256长度的句子
dummy_inputs = tokenizer(tokenizer.unk_token, padding='max_length', max_length=256, return_tensors='pt')
dynamic_axis = {0: 'batch', 1: 'sequence'}
inputs = OrderedDict([
    ('input_ids', dynamic_axis),
    ('attention_mask', dynamic_axis),
    ('token_type_ids', dynamic_axis),
])
outputs = OrderedDict({'logits': {0: 'batch'}})
output_files = TorchModelExporter().export_onnx(model=model, dummy_inputs=dummy_inputs, inputs=inputs, 
                                                outputs=outputs, output_dir='/tmp')
print(output_files) # {'model': '/tmp/model.onnx'}
```
inputs和outputs参数用来指示动态dimension，其格式为OrderedDict，key为输入/输出参数名，value为格式如{0: 'batch', 1: 'sequence'}的动态dimension序号和名称。例子中的0代表tensor第一个维度，1代表tensor第二个维度，batch/sequence为自定义的维度名称。

在实现上，ModelScope调用了torch.onnx.export方法用以导出onnx，这个方法的输入实际上需要一个ScriptModule，但是也兼容torch.nn.Module。如果传入模型不是ScriptModule，export方法内部会使用trace方式将模型转为ScriptModule。由于模型结构的复杂性，大部分ModelScope模型尚不支持script方式进行模型导出，这一部分我们仍在探索中。
有关trace和script方式的使用可以参考[官方文档](https://pytorch.org/docs/stable/onnx.html#tracing-vs-scripting)。


## 支持导出ONNX的ModelScope模型


| 模型             |                                                                                                     任务 |
| ---------------- |-------------------------------------------------------------------------------------------------------:|
| BERT/StructBERT  |                                                                                    text-classification |
| StructBERT       |                                                                               zero-shot-classification |
| SCRFD            |                                                                                         face-detection |
| Tinynas-DAMOYOLO |                                                                                 image-object-detection |
| Transformer-CRF  | token-classification </br> - word-segmentation </br> - part-of-speech </br> - named-entity-recognition |
| OCR_Detect_DBNet |                                                                                          ocr-detection |
| OCRRecognition | ocr-recognition |

注意：这里指的支持导出是Exporter中存在对应某一模型的具体实现，用户仍然可以使用上述的外部模型导出手动定制自己的导出过程。


## 如何使用ONNX模型

首先需要安装onnxruntime运行时环境，onnxruntime支持多种语言多个平台，具体可以参考[这里](https://onnxruntime.ai/)。

为简便演示，我们在这里展示了python环境中onnxruntime的使用方法，模型为上面外部模型导出的onnx文件，onnxruntime安装过程可以参考上面的文档。

首先构造inputs：
```python
from transformers import BertTokenizerFast
tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')
dummy_inputs = tokenizer('这是一个测试的例子', padding='max_length', max_length=256, return_tensors='np')
```
调用onnxruntime来运行模型：
```python
import onnxruntime as ort
ort_session = ort.InferenceSession('/tmp/model.onnx')
outputs = ort_session.run(['logits'], dict(dummy_inputs))
print(outputs)
```

## 具体模型的导出

### BERT/StructBERT的text-classification模型

```python
# 导出模型
from modelscope.models import Model
from modelscope.exporters import Exporter
model_id = 'damo/nlp_structbert_sentence-similarity_chinese-base'
model = Model.from_pretrained(model_id)
output_files = Exporter.from_model(model).export_onnx(opset=13, output_dir='/tmp', shape=(2, 256))
print(output_files)

# 使用模型
from modelscope.preprocessors import Preprocessor
preprocessor = Preprocessor.from_pretrained(
    'damo/nlp_structbert_sentence-similarity_chinese-base')
import onnxruntime as ort
ort_session = ort.InferenceSession('/tmp/model.onnx')
outputs = ort_session.run(['logits'], preprocessor(('text1', 'text2'), return_tensors='np'))
print(outputs)
```

### StructBERT的zero-shot-classification模型

```python
# 导出模型
from modelscope.models import Model
from modelscope.exporters import Exporter
model_id = 'damo/nlp_structbert_zero-shot-classification_chinese-base'
model = Model.from_pretrained(model_id)
output_files = Exporter.from_model(model).export_onnx(
    candidate_labels=[
        '文化', '体育', '娱乐', '财经', '家居', '汽车', '教育', '科技', '军事'
    ],
    hypothesis_template='这篇文章的标题是{}',
    output_dir='/tmp')
print(output_files)

# 使用模型
from modelscope.preprocessors import Preprocessor
preprocessor = Preprocessor.from_pretrained(
    'damo/nlp_structbert_zero-shot-classification_chinese-base')
import onnxruntime as ort
ort_session = ort.InferenceSession('/tmp/model.onnx')
outputs = ort_session.run(['logits'], dict(preprocessor('text1',
                                           candidate_labels=['文化', '体育', '娱乐', '财经', '家居', '汽车', '教育', '科技', '军事'],
                                           hypothesis_template='这篇文章的标题是{}', return_tensors='np')))
print(outputs)
```

### SCRFD的face-detection任务

```python
# 导出模型
import os
import shutil
import tempfile
from modelscope.models import Model
from modelscope.exporters import Exporter

model_id = 'damo/cv_resnet_facedetection_scrfd10gkps'
model = Model.from_pretrained(model_id)
tmp_dir = tempfile.TemporaryDirectory().name
if not os.path.exists(tmp_dir):
    os.makedirs(tmp_dir)
Exporter.from_model(model).export_onnx(output_dir=tmp_dir)
# 使用模型
# the exported onnx model is compatible with SCRFD official inference code, 
# just change line 310 and 312 to specify model and image path here:
# https://github.com/deepinsight/insightface/blob/master/detection/scrfd/tools/scrfd.py 
```

### Stable-Diffusion的text-to-image-synthesis任务
```py
# 导出模型
from modelscope.models import Model
from modelscope.exporters import Exporter

model_id = 'AI-ModelScope/stable-diffusion-v1-5'
model = Model.from_pretrained(model_id)
Exporter.from_model(model).export_onnx(output_path='./tmp/onnx_output', opset=14)

# 使用模型
from optimum.onnxruntime import ORTStableDiffusionPipeline

model_id = "./tmp/onnx_output"
pipe = ORTStableDiffusionPipeline.from_pretrained(model_id)
prompt = "a dog."
image = pipe(prompt).images[0]
image.save("./dog.png")
```

### Tinynas-DAMOYOLO的image-object-detection任务
```py
# 导出模型
import os
import shutil
import tempfile

from modelscope.models import Model
from modelscope.utils.constant import Tasks
from modelscope.exporters import Exporter

tmp_dir = tempfile.TemporaryDirectory().name
os.makedirs(tmp_dir, exist_ok=True)

model_id = 'damo/cv_tinynas_object-detection_damoyolo'
model = Model.from_pretrained(model_id)
Exporter.from_model(model).export_onnx(
    input_shape=(1,3,640,640), output_dir=tmp_dir)


# 使用模型
# the exported onnx model is compatible with DAMO-YOLO official inference code, 
# a simple command could be find at the demo section of 
# https://github.com/tinyvision/DAMO-YOLO/blob/master/README.md,
# more details please refer to 
# https://github.com/tinyvision/DAMO-YOLO/blob/master/tools/demo.py 

```

### Transformer-CRF的word-segmentation/part-of-speech/named-entity-recognition任务
```py
# 导出模型
import os
import shutil
import tempfile

from modelscope.models import Model
from modelscope.utils.constant import Tasks
from modelscope.exporters import Exporter

tmp_dir = tempfile.TemporaryDirectory().name
os.makedirs(tmp_dir, exist_ok=True)

model_id = 'damo/nlp_raner_named-entity-recognition_chinese-base-news'
model = Model.from_pretrained(model_id)
Exporter.from_model(model).export_onnx(output_dir=tmp_dir)


# 使用模型
from modelscope.preprocessors import Preprocessor
preprocessor = Preprocessor.from_pretrained(
    'damo/nlp_raner_named-entity-recognition_chinese-base-news')
import onnxruntime as ort
from collections import OrderedDict
ort_session = ort.InferenceSession('/tmp/model.onnx')
inputs = preprocessor('text1', return_tensors='np')
reformatted_inputs = OrderedDict({
    'input_ids': inputs['input_ids'].numpy(),
    'attention_mask': inputs['attention_mask'].numpy(),
    'label_mask': inputs['label_mask'].numpy(),
    'offset_mapping': inputs['offset_mapping'].numpy(),
})
outputs = ort_session.run(['predictions'], reformatted_inputs)
```

### OCR-Detect-DB的ocr-detection任务
```py
# 导出模型
import os
import shutil
import tempfile
from modelscope.models import Model
from modelscope.utils.constant import Tasks
from modelscope.exporters import Exporter
tmp_dir = tempfile.TemporaryDirectory().name
os.makedirs(tmp_dir, exist_ok=True)
model_id = 'damo/cv_resnet18_ocr-detection-db-line-level_damo'
model = Model.from_pretrained(model_id)
Exporter.from_model(model).export_onnx(
    input_shape=(1,3,800,800), output_dir=tmp_dir)
# 使用模型
import cv2
import numpy as np
import onnxruntime as ort
from modelscope.models.cv.ocr_detection.utils import boxes_from_bitmap
# 预处理
image = cv2.imread(image_path)
height, width, _ = image.shape
image_resize = cv2.resize(image, (800,800))        
image_resize = image_resize - np.array([123.68, 116.78, 103.94], dtype=np.float32)
image_resize /= 255.
image_resize = np.expand_dims(image_resize.transpose(2, 0, 1), axis=0)
ort_session = ort.InferenceSession(self.tmp_dir+'/model.onnx')
outputs = ort_session.run(['pred'], {'images': image_resize})
# 后处理
thresh = 0.2
pred = outputs[0]
segmentation = pred > thresh
boxes, scores = boxes_from_bitmap(pred, segmentation, width,
                                      height, is_numpy=True) 
```

### OCRRecognition的ocr-recognition任务
```py
# 导出模型
import os
import shutil
import tempfile
import torch
import numpy as np
import torch.nn.functional as F
import onnxruntime as rt
import cv2
from modelscope.models import Model
from modelscope.utils.constant import Tasks
from modelscope.exporters import Exporter
tmp_dir = tempfile.TemporaryDirectory().name
os.makedirs(tmp_dir, exist_ok=True)
# CRNN模型导出
model_id = 'damo/cv_crnn_ocr-recognition-general_damo'
model = Model.from_pretrained(model_id)
Exporter.from_model(model).export_onnx(
    input_shape=(1, 3, 32, 640), output_dir=tmp_dir)
# CViT模型导出
# model_id = 'damo/cv_convnextTiny_ocr-recognition-general_damo'
# model = Model.from_pretrained(model_id)
# Exporter.from_model(model).export_onnx(
#     input_shape=(3, 3, 32, 640), output_dir=tmp_dir)
# Light模型导出
# model_id = 'damo/cv_LightweightEdge_ocr-recognitoin-general_damo'
# model = Model.from_pretrained(model_id, model_revision='v2.4.1')
# Exporter.from_model(model).export_onnx(
#     input_shape=(1, 3, 32, 640), output_dir=tmp_dir)
# test with onnx model
# preprocessing
def keepratio_resize(img):
    cur_ratio = img.shape[1] / float(img.shape[0])
    mask_height = 32
    mask_width = 640
    if cur_ratio > float(mask_width) / mask_height:
        cur_target_height = mask_height
        cur_target_width = mask_width
    else:
        cur_target_height = mask_height
        cur_target_width = int(mask_height * cur_ratio)
    img = cv2.resize(img, (cur_target_width, cur_target_height))
    mask = np.zeros([mask_height, mask_width, 3]).astype(np.uint8)
    mask[:img.shape[0], :img.shape[1], :] = img
    img = mask
    return img
img = cv2.imread('ocr_recognition.jpg') # 请在替换本地测试图片路径
img = keepratio_resize(img)
img = torch.FloatTensor(img)
data = img.view(1, 32, 640, 3) / 255.
data = data.permute(0, 3, 1, 2).cuda()
input_data = data.cpu().numpy()
# inference
sess = rt.InferenceSession(tmp_dir + '/model.onnx')
input_name = sess.get_inputs()[0].name
output_name= sess.get_outputs()[0].name
res = sess.run([output_name], {input_name: input_data})
outprobs = F.softmax(torch.tensor(res[0]), dim=-1)
preds = torch.argmax(outprobs, -1)
# load dict and CTC decode
# vocab.txt可从模型主页下载
# https://www.modelscope.cn/models/damo/cv_crnn_ocr-recognition-general_damo/files
labelMapping = dict()
with open('vocab.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    cnt = 1
    for line in lines:
        line = line.strip('\n')
        labelMapping[cnt] = line
        cnt += 1
batchSize, length = preds.shape
final_str_list = []
for i in range(batchSize):
    pred_idx = preds[i].cpu().data.tolist()
    last_p = 0
    str_pred = []
    for p in pred_idx:
        if p != last_p and p != 0:
            str_pred.append(labelMapping[p])
        last_p = p
    final_str = ''.join(str_pred)
    final_str_list.append(final_str)
print(final_str_list)
```


# 导出为TorchScript格式

同ONNX类似，[TorchScript](https://pytorch.org/docs/master/jit.html)也是深度学习模型的中间表示格式，不同的是它是基于PyTorch框架的。
Torch模型通过导出变为TorchScript格式后，就可以脱离python环境运行或进行后续的推理加速。

ModelScope也提供了模型转为TorchScript的能力。

## 导出方法

```py
from modelscope.models import Model
model_id = 'damo/nlp_structbert_sentence-similarity_chinese-base'
model = Model.from_pretrained(model_id)
from modelscope.exporters import Exporter
output_files = Exporter.from_model(model).export_torch_script(output_dir='/tmp', ...)
print(output_files)
```
模型转换TorchScript有两种方式，Script和Trace。Script方式对以加载完毕的模型代码进行静态分析，并生成TorchScript文件。
而Trace方式仍然需要一个dummy input用来追溯模型的动态图，用来后续分析生成。

Script方式的优点是，可以将源代码的特性包含进去，比如if分支条件等。但由于使用了AST方式进行代码分析，其对模型的要求也较高，比如
需要模型在输入参数上有类型标注，方法中没有无法追溯的动态类型等。Trace方式要求较低，只需要一个构造好的dummy input既可根据动态图
生成静态图。但trace方式要求输入全部为tensor，且模型逻辑中不包含tensor无参与的if分支条件，也给导出带来了一定限制。

ModelScope模型大部分都支持trace方式，因此我们把trace方式选择为默认的导出方式。

同样地，在导出完成后，ModelScope会使用dummy_inputs验证ts文件的正确性，因此如果导出过程不报错就证明导出过程已经成功了。

注意：Trace方式生成的文件不支持动态尺寸输入，也就是说，用于以后生产环境中的输入tensor尺寸必须和dummy inputs相同。如果实际输入尺寸小于dummy input尺寸，请注意在数据预处理过程中添加padding。


## 如何在外部模型上使用导出功能

如果目前支持导出的模型中没有您需要的模型，或该模型是一个torch.nn.Module，可以手动传入dummy_inputs来实现。

如下展示了导出transformers库模型的示例。首先把模型和tokenizer初始化出来：
```python
from transformers import BertForSequenceClassification, BertTokenizerFast
model = BertForSequenceClassification.from_pretrained('bert-base-uncased')
tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')
```
之后我们使用tokenizer来生成dummy_inputs并调用导出工具：
```python
from modelscope.exporters import TorchModelExporter
from collections import OrderedDict
# 假设最大支持256长度的句子
dummy_inputs = tokenizer(tokenizer.unk_token, padding='max_length', max_length=256, return_tensors='pt')
output_files = TorchModelExporter().export_torch_script(model=model, dummy_inputs=dummy_inputs, output_dir='/tmp', strict=False)
print(output_files) # {'model': '/tmp/model.ts'}
```


## 支持导出TorchScript的modelscope模型


| 模型            |                     任务 |
| --------------- | -----------------------: |
| BERT/StructBERT |      text-classification |
| StructBERT      | zero-shot-classification |

注意，这里指的支持导出是Exporter中存在对应某一模型的具体实现，用户仍然可以使用上述的外部模型导出手动定制自己的导出过程。


## 如何使用TorchScript模型

TorchScript模型支持多种语言环境，有关使用可以参考[这里](https://pytorch.org/tutorials/advanced/cpp_export.html#step-3-loading-your-script-module-in-c)。

为简便演示，我们在这里展示了python环境中TorchScript的使用方法，模型为上面外部模型导出的ts文件。

首先构造inputs：
```python
from transformers import BertTokenizerFast
tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')
dummy_inputs = tokenizer('这是一个测试的例子', padding='max_length', max_length=256, return_tensors='pt')
```
调用torch来运行模型：
```python
import torch
ts_model = torch.jit.load('/tmp/model.ts')
ts_model.eval()
with torch.no_grad():
    outputs = ts_model.forward(**dummy_inputs)
print(outputs)
```

## 具体模型参数

### BERT/StructBERT的text-classification模型

```python
# 导出模型
from modelscope.models import Model
from modelscope.exporters import Exporter
model_id = 'damo/nlp_structbert_sentence-similarity_chinese-base'
model = Model.from_pretrained(model_id)
output_files = Exporter.from_model(model).export_torch_script(output_dir='/tmp', shape=(2, 256))
print(output_files)

# 使用模型
from modelscope.preprocessors import Preprocessor
preprocessor = Preprocessor.from_pretrained(
    'damo/nlp_structbert_sentence-similarity_chinese-base')
import torch
ts_model = torch.jit.load('/tmp/model.ts')
ts_model.eval()
inputs = preprocessor(('这是个句子', '这是另一个句子'))
with torch.no_grad():
    outputs = ts_model.forward(inputs['input_ids'],
                               inputs['attention_mask'],
                               inputs['token_type_ids'])
print(outputs)
```

### StructBERT的zero-shot-classification模型

```python
# 导出模型
from modelscope.models import Model
from modelscope.exporters import Exporter

model_id = 'damo/nlp_structbert_zero-shot-classification_chinese-base'
model = Model.from_pretrained(model_id)
output_files = Exporter.from_model(model).export_torch_script(
    candidate_labels=[
        '文化', '体育', '娱乐', '财经', '家居', '汽车', '教育', '科技', '军事'
    ],
    hypothesis_template='这篇文章的标题是{}',
    output_dir='/tmp')
print(output_files)

# 使用模型
from modelscope.preprocessors import Preprocessor

preprocessor = Preprocessor.from_pretrained(
    'damo/nlp_structbert_zero-shot-classification_chinese-base')
import torch

ts_model = torch.jit.load('/tmp/model.ts')
ts_model.eval()
inputs = preprocessor('text1',
                      candidate_labels=['文化', '体育', '娱乐', '财经', '家居', '汽车', '教育', '科技', '军事'],
                      hypothesis_template='这篇文章的标题是{}', )
with torch.no_grad():
    outputs = ts_model.forward(inputs['input_ids'],
                               inputs['attention_mask'],
                               inputs['token_type_ids'])
print(outputs)
```

# 导出为SavedModel格式

[SavedModel](https://www.tensorflow.org/guide/saved_model?hl=zh-cn)是TensorFlow常用的推理用格式。加载SavedModel模型不需要使用模型源代码，只需要使用TensorFlow通用的加载方法即可用于线上环境推理。如果您需要使用此格式用于推理，可以使用ModelScope提供的通用导出方案。

## 导出方法

首先我们需要初始化一个已支持Exporter模块的模型：

```python
from modelscope.models import Model
model_id = 'damo/nlp_csanmt_translation_en2zh_base'
model = Model.from_pretrained(model_id)
```

下面我们就可以将其导出为对应格式：

```python
from modelscope.exporters import TfModelExporter
output_files = TfModelExporter.from_model(model).export_saved_model(output_dir='/tmp')
print(output_files) # {'model': '/tmp'}
```

## 如何使用SavedModel格式

SavedModel进行forward推理可以参考如下代码：

```py
with tf.Session(graph=tf.Graph()) as sess:
    # output_dir is the folder contains the SavedModel files
    MetaGraphDef = tf.saved_model.loader.load(sess, ['serve'], output_dir)

    # SignatureDef protobuf
    SignatureDef_map = MetaGraphDef.signature_def
    # Signature def key
    SignatureDef = SignatureDef_map['some-signature']
    # Input and output tensor info
    X_TensorInfo = SignatureDef.inputs['some-input-key']
    y_TensorInfo = SignatureDef.outputs['some-output-key']
    X = tf.saved_model.utils.get_tensor_from_tensor_info(
        X_TensorInfo, sess.graph)
    y = tf.saved_model.utils.get_tensor_from_tensor_info(
        y_TensorInfo, sess.graph)
    # dummy_inputs may be a numpy tensor
    outputs = sess.run(y, feed_dict={X: dummy_inputs})
```

使用时注意将代码中的样例值替换成实际值。

## 支持导出SavedModel的ModelScope模型


| 模型     |          任务 |
|--------|------------:|
| csanmt | translation |

## 具体模型的导出

### CSANMT翻译模型

```python
from modelscope.models import Model
model_id = 'damo/nlp_csanmt_translation_en2zh_base'
model = Model.from_pretrained(model_id)
from modelscope.exporters import TfModelExporter
output_files = TfModelExporter.from_model(model).export_saved_model(output_dir='/tmp/test2')
print(output_files) # {'model': '/tmp'}

import tensorflow as tf

if tf.__version__ >= '2.0':
    tf = tf.compat.v1
    tf.disable_eager_execution()


import numpy as np
dummy_inputs = np.array([[9036,  942,   25, 2502,    9,    6,  725,    1,  188,   37,  120,  827,  297]])
with tf.Session(graph=tf.Graph()) as sess:
    # Restore model from the saved_modle file, that is exported by TensorFlow estimator.
    MetaGraphDef = tf.saved_model.loader.load(sess, ['serve'], '/tmp/test2')

    # SignatureDef protobuf
    SignatureDef_map = MetaGraphDef.signature_def
    SignatureDef = SignatureDef_map['translation_signature']
    # TensorInfo protobuf
    X_TensorInfo = SignatureDef.inputs['input_wids']
    y_TensorInfo = SignatureDef.outputs['output_seqs']
    X = tf.saved_model.utils.get_tensor_from_tensor_info(
        X_TensorInfo, sess.graph)
    y = tf.saved_model.utils.get_tensor_from_tensor_info(
        y_TensorInfo, sess.graph)
    outputs = sess.run(y, feed_dict={X: dummy_inputs})
    print(outputs)
```

# 导出为Frozen Graphdef格式

Frozen graphdef是TensorFlow常用的推理用格式。加载Frozen graphdef模型同样不需要使用模型源代码，只需要使用TensorFlow通用的加载方法即可用于线上环境推理。如果您需要使用此格式用于推理，可以使用ModelScope提供的通用导出方案。

## 如何使用Frozen Graphdef格式

使用Frozen Graphdef进行推理可以参考如下代码：

```py
# frozen_graph_path is the path of the the frozen graphdef file
with tf.gfile.GFile(frozen_graph_path, 'rb') as f:
    graph_def = tf.GraphDef()
    graph_def.ParseFromString(f.read())

tf.import_graph_def(graph_def, name='')

with tf.Session() as sess:
    # dummy_inputs is the model inputs
    outputs = sess.run(
        'some-output-node-name',
        feed_dict={'some-input-node-name': dummy_inputs})
    # do other things
```

## 支持导出Frozen Graphdef的ModelScope模型


| 模型    |                       任务 |
| ------- | -------------------------: |
| Cartoon | image-portrait-stylization |

## 具体模型的导出

### DCT-Net人像卡通化模型

```python
import os
import cv2
import tensorflow as tf
from modelscope.models.cv.cartoon import CartoonModel
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.outputs import OutputKeys

model_dir = '/mnt/workspace/.cache/modelscope/damo/cv_unet_person-image-cartoon_compound-models'

## 导出模型
ckpt_path = os.path.join(model_dir, 'tf_ckpts', 'model-' + str(16999))
frozen_graph_path = os.path.join(model_dir, 'cartoon_h.pb')

input = tf.placeholder(tf.float32, [None, None, 3], name='input_image')
input = input[:, :, :][tf.newaxis]
input = input / 127.5 - 1.0

model = CartoonModel(model_dir='')
output = model(input)
final_out = output['output_cartoon'][0]
final_out = tf.clip_by_value(final_out, -0.999999, 0.999999)
final_out = (final_out + 1.0) * 127.5
final_out = tf.cast(final_out, tf.uint8, name='output_image')

all_vars = tf.trainable_variables()
gene_vars = [var for var in all_vars if 'generator' in var.name]
saver = tf.train.Saver(var_list=gene_vars)
init = tf.global_variables_initializer()
config = tf.ConfigProto(allow_soft_placement=True)
config.gpu_options.allow_growth = True

with tf.Session(config=config) as sess:
    sess.run(init)
    saver.restore(sess, ckpt_path)
    frozen_graph_def = tf.graph_util.convert_variables_to_constants(
                sess, sess.graph_def, output_node_names=['output_image'])
    with open(frozen_graph_path, 'wb') as f:
        f.write(frozen_graph_def.SerializeToString())
    print('freeze model done')

## 使用模型
pipeline_cartoon = pipeline(task=Tasks.image_portrait_stylization, model=model_dir)
result = pipeline_cartoon(input='https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/image_cartoon.png')
if result is not None:
    cv2.imwrite('result.png', result[OutputKeys.OUTPUT_IMG])
    print(f'Output image written to {os.path.abspath("result.png")}')
```

# ModelScope语音模型的导出

ModelScope语音领域提供了单独的周边生态来支持导出，具体方式您可以参考[funasr的模型导出](https://github.com/alibaba-damo-academy/FunASR/tree/main/funasr/export)。简单来说，只需要一行命令即可：

```shell
# 安装funasr and torchaudio，并在命令行中执行如下命令：
funasr-export ++model="iic/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch" ++quantize=false
```



