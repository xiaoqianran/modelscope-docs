<!-- modelscope-docs: Model Export | sdk/model-export/model-export_EN.md -->

# What is Model Export

When using deep learning models for actual production services, we often don't directly use the original model files (for example, PyTorch's pytorch_model.bin binary files that need to be loaded via load_state_dict). This is because these model files can only run in Python environments and cannot be "optimized." For instance, if the target environment is a microcontroller on an embedded device, installing a Python environment would be very challenging. Additionally, if the model is large and high QPS is required, the model needs to摆脱 Python environment and use faster C++ libraries, perform hardware-related optimizations, or fuse operators.

In such cases, running with the original code and binary files becomes inefficient. Therefore, various algorithm libraries provide corresponding "export formats," such as PyTorch's TorchScript, TensorFlow's GraphDef, or cross-framework formats like ONNX. These formats not only contain the model parameters but also include the model's computational graph, allowing them to run independently of the Python environment and achieve certain performance acceleration. Many operator libraries also support using these formats as starting points for further optimization. ModelScope provides export methods for its internal models, which users can freely choose.

# Export to ONNX Format

[ONNX](https://onnx.ai/) stands for Open Neural Network Exchange, a file format for representing deep learning models jointly proposed by Microsoft and Facebook (Meta). Its key characteristics are standardized file format and platform independence. This means that original models trained in any framework (TensorFlow/PyTorch/JAX, etc.) can be converted to this format for storage and optimization, or converted to other framework-specific model files. Like other output formats, ONNX files store not only model weights but also the model DAG graph and some useful auxiliary information.

If your production environment uses ONNX or requires ONNX format for subsequent optimization, you can use ModelScope's provided ONNX conversion tools to export models.

## Export Method

```py
from modelscope.models import Model
from modelscope.exporters import Exporter
model_id = 'damo/nlp_structbert_sentence-similarity_chinese-base'
model = Model.from_pretrained(model_id)
output_files = Exporter.from_model(model).export_onnx(opset=13, output_dir='/tmp', ...)
print(output_files)
```
opset refers to the ONNX operator version. For details, please refer to [here](https://onnxruntime.ai/docs/reference/compatibility.html).

After export completion, ModelScope will validate the ONNX file using dummy_inputs. Therefore, if the export process doesn't report errors, it indicates successful export.

Note that the validation process requires the onnx and onnxruntime packages. If these are not installed in your environment, you'll see the following error:
```python
"modelscope - WARNING - Cannot validate the exported onnx file, because the installation of onnx or onnxruntime cannot be found"
```
To enable validation, install these packages:
```shell
pip install onnx
pip install onnxruntime
```
Or use conda commands:
```shell
conda install -c conda-forge onnx
conda install -c conda-forge onnxruntime
```

If you need to perform validation in a GPU environment, use the following commands instead:
```shell
pip install onnx
pip install onnxruntime-gpu
```
onnxruntime-gpu has strong dependencies on CUDA and cuDNN versions, so please pay attention to version compatibility during installation. For details, refer to [here](https://onnxruntime.ai/docs/execution-providers/CUDA-ExecutionProvider.html).

## How to Use Export Functionality on External Models

If the currently supported exportable models don't include your required model, or if the model is a torch.nn.Module, you can manually pass dummy_inputs, inputs, and outputs to achieve export.

The following demonstrates exporting a transformers library model. First, initialize the model and tokenizer:
```python
from transformers import BertForSequenceClassification, BertTokenizerFast
model = BertForSequenceClassification.from_pretrained('bert-base-uncased')
tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')
```
Then use the tokenizer to generate dummy_inputs and call the export tool:
```python
from modelscope.exporters import TorchModelExporter
from collections import OrderedDict
# Assuming maximum support for 256-length sentences
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
The inputs and outputs parameters indicate dynamic dimensions, formatted as OrderedDict where keys are input/output parameter names and values are dynamic dimension indices and names in the format {0: 'batch', 1: 'sequence'}. In the example, 0 represents the first tensor dimension, 1 represents the second tensor dimension, and batch/sequence are custom dimension names.

Internally, ModelScope calls torch.onnx.export to export ONNX. This method actually requires a ScriptModule but is also compatible with torch.nn.Module. If the input model is not a ScriptModule, the export method internally uses tracing to convert the model to ScriptModule. Due to model complexity, most ModelScope models don't yet support script-based model export, which we are still exploring.
For more information about tracing vs scripting, refer to the [official documentation](https://pytorch.org/docs/stable/onnx.html#tracing-vs-scripting).


## ModelScope Models Supporting ONNX Export


| Model            |                                                                                                     Task |
| ---------------- |-------------------------------------------------------------------------------------------------------:|
| BERT/StructBERT  |                                                                                    text-classification |
| StructBERT       |                                                                               zero-shot-classification |
| SCRFD            |                                                                                         face-detection |
| Tinynas-DAMOYOLO |                                                                                 image-object-detection |
| Transformer-CRF  | token-classification </br> - word-segmentation </br> - part-of-speech </br> - named-entity-recognition |
| OCR_Detect_DBNet |                                                                                          ocr-detection |
| OCRRecognition | ocr-recognition |

Note: The support mentioned here means there are specific implementations for certain models in the Exporter. Users can still manually customize their export process using the external model export method described above.


## How to Use ONNX Models

First, install the onnxruntime runtime environment. onnxruntime supports multiple languages and platforms. For details, refer to [here](https://onnxruntime.ai/).

For simplicity, we demonstrate the usage of onnxruntime in a Python environment using the ONNX file exported from the external model above. The onnxruntime installation process can be referenced from the documentation above.

First, construct inputs:
```python
from transformers import BertTokenizerFast
tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')
dummy_inputs = tokenizer('This is a test example', padding='max_length', max_length=256, return_tensors='np')
```
Call onnxruntime to run the model:
```python
import onnxruntime as ort
ort_session = ort.InferenceSession('/tmp/model.onnx')
outputs = ort_session.run(['logits'], dict(dummy_inputs))
print(outputs)
```

## Specific Model Export Examples

### BERT/StructBERT text-classification Models

```python
# Export model
from modelscope.models import Model
from modelscope.exporters import Exporter
model_id = 'damo/nlp_structbert_sentence-similarity_chinese-base'
model = Model.from_pretrained(model_id)
output_files = Exporter.from_model(model).export_onnx(opset=13, output_dir='/tmp', shape=(2, 256))
print(output_files)

# Use model
from modelscope.preprocessors import Preprocessor
preprocessor = Preprocessor.from_pretrained(
    'damo/nlp_structbert_sentence-similarity_chinese-base')
import onnxruntime as ort
ort_session = ort.InferenceSession('/tmp/model.onnx')
outputs = ort_session.run(['logits'], preprocessor(('text1', 'text2'), return_tensors='np'))
print(outputs)
```

### StructBERT zero-shot-classification Models

```python
# Export model
from modelscope.models import Model
from modelscope.exporters import Exporter
model_id = 'damo/nlp_structbert_zero-shot-classification_chinese-base'
model = Model.from_pretrained(model_id)
output_files = Exporter.from_model(model).export_onnx(
    candidate_labels=[
        'culture', 'sports', 'entertainment', 'finance', 'home', 'automotive', 'education', 'technology', 'military'
    ],
    hypothesis_template='The title of this article is {}',
    output_dir='/tmp')
print(output_files)

# Use model
from modelscope.preprocessors import Preprocessor
preprocessor = Preprocessor.from_pretrained(
    'damo/nlp_structbert_zero-shot-classification_chinese-base')
import onnxruntime as ort
ort_session = ort.InferenceSession('/tmp/model.onnx')
outputs = ort_session.run(['logits'], dict(preprocessor('text1',
                                           candidate_labels=['culture', 'sports', 'entertainment', 'finance', 'home', 'automotive', 'education', 'technology', 'military'],
                                           hypothesis_template='The title of this article is {}', return_tensors='np')))
print(outputs)
```

### SCRFD face-detection Task

```python
# Export model
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
# Use model
# the exported onnx model is compatible with SCRFD official inference code,
# just change line 310 and 312 to specify model and image path here:
# https://github.com/deepinsight/insightface/blob/master/detection/scrfd/tools/scrfd.py
```

### Stable-Diffusion text-to-image-synthesis Task
```py
# Export model
from modelscope.models import Model
from modelscope.exporters import Exporter

model_id = 'AI-ModelScope/stable-diffusion-v1-5'
model = Model.from_pretrained(model_id)
Exporter.from_model(model).export_onnx(output_path='./tmp/onnx_output', opset=14)

# Use model
from optimum.onnxruntime import ORTStableDiffusionPipeline

model_id = "./tmp/onnx_output"
pipe = ORTStableDiffusionPipeline.from_pretrained(model_id)
prompt = "a dog."
image = pipe(prompt).images[0]
image.save("./dog.png")
```

### Tinynas-DAMOYOLO image-object-detection Task
```py
# Export model
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


# Use model
# the exported onnx model is compatible with DAMO-YOLO official inference code,
# a simple command could be find at the demo section of
# https://github.com/tinyvision/DAMO-YOLO/blob/master/README.md,
# more details please refer to
# https://github.com/tinyvision/DAMO-YOLO/blob/master/tools/demo.py

```

### Transformer-CRF word-segmentation/part-of-speech/named-entity-recognition Tasks
```py
# Export model
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


# Use model
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

### OCR-Detect-DB ocr-detection Task
```py
# Export model
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
# Use model
import cv2
import numpy as np
import onnxruntime as ort
from modelscope.models.cv.ocr_detection.utils import boxes_from_bitmap
# Preprocessing
image = cv2.imread(image_path)
height, width, _ = image.shape
image_resize = cv2.resize(image, (800,800))
image_resize = image_resize - np.array([123.68, 116.78, 103.94], dtype=np.float32)
image_resize /= 255.
image_resize = np.expand_dims(image_resize.transpose(2, 0, 1), axis=0)
ort_session = ort.InferenceSession(self.tmp_dir+'/model.onnx')
outputs = ort_session.run(['pred'], {'images': image_resize})
# Post-processing
thresh = 0.2
pred = outputs[0]
segmentation = pred > thresh
boxes, scores = boxes_from_bitmap(pred, segmentation, width,
                                      height, is_numpy=True)
```

### OCRRecognition ocr-recognition Task
```py
# Export model
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
# CRNN model export
model_id = 'damo/cv_crnn_ocr-recognition-general_damo'
model = Model.from_pretrained(model_id)
Exporter.from_model(model).export_onnx(
    input_shape=(1, 3, 32, 640), output_dir=tmp_dir)
# CViT model export
# model_id = 'damo/cv_convnextTiny_ocr-recognition-general_damo'
# model = Model.from_pretrained(model_id)
# Exporter.from_model(model).export_onnx(
#     input_shape=(3, 3, 32, 640), output_dir=tmp_dir)
# Light model export
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
img = cv2.imread('ocr_recognition.jpg') # Please replace with your local test image path
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
# vocab.txt can be downloaded from the model homepage
# https://www.modelscope.ai/models/damo/cv_crnn_ocr-recognition-general_damo/files
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


# Export to TorchScript Format

Similar to ONNX, [TorchScript](https://pytorch.org/docs/master/jit.html) is also an intermediate representation format for deep learning models, but it's based on the PyTorch framework. After converting Torch models to TorchScript format, they can run independently of the Python environment or undergo further inference acceleration.

ModelScope also provides the capability to convert models to TorchScript.

## Export Method

```py
from modelscope.models import Model
model_id = 'damo/nlp_structbert_sentence-similarity_chinese-base'
model = Model.from_pretrained(model_id)
from modelscope.exporters import Exporter
output_files = Exporter.from_model(model).export_torch_script(output_dir='/tmp', ...)
print(output_files)
```
There are two ways to convert models to TorchScript: Script and Trace. The Script method performs static analysis on the loaded model code and generates a TorchScript file. The Trace method still requires a dummy input to trace the model's computational graph for subsequent analysis and generation.

The advantage of the Script method is that it can include source code characteristics, such as if-branch conditions. However, due to its use of AST for code analysis, it has higher requirements for models, such as requiring type annotations on input parameters and no untraceable dynamic types in methods. The Trace method has lower requirements—only a well-constructed dummy input is needed to generate a static graph from the dynamic graph. However, the trace method requires all inputs to be tensors and doesn't support if-branch conditions without tensor participation in the model logic, which imposes certain limitations on export.

Most ModelScope models support the trace method, so we've chosen trace as the default export method.

Similarly, after export completion, ModelScope will validate the ts file using dummy_inputs. Therefore, if the export process doesn't report errors, it indicates successful export.

Note: Files generated by the Trace method don't support dynamic input sizes. This means that input tensor sizes in future production environments must match the dummy inputs exactly. If actual input sizes are smaller than dummy input sizes, please add padding during data preprocessing.


## How to Use Export Functionality on External Models

If the currently supported exportable models don't include your required model, or if the model is a torch.nn.Module, you can manually pass dummy_inputs to achieve export.

The following demonstrates exporting a transformers library model. First, initialize the model and tokenizer:
```python
from transformers import BertForSequenceClassification, BertTokenizerFast
model = BertForSequenceClassification.from_pretrained('bert-base-uncased')
tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')
```
Then use the tokenizer to generate dummy_inputs and call the export tool:
```python
from modelscope.exporters import TorchModelExporter
from collections import OrderedDict
# Assuming maximum support for 256-length sentences
dummy_inputs = tokenizer(tokenizer.unk_token, padding='max_length', max_length=256, return_tensors='pt')
output_files = TorchModelExporter().export_torch_script(model=model, dummy_inputs=dummy_inputs, output_dir='/tmp', strict=False)
print(output_files) # {'model': '/tmp/model.ts'}
```


## ModelScope Models Supporting TorchScript Export


| Model           |                     Task |
| --------------- | -----------------------: |
| BERT/StructBERT |      text-classification |
| StructBERT      | zero-shot-classification |

Note that the support mentioned here means there are specific implementations for certain models in the Exporter. Users can still manually customize their export process using the external model export method described above.


## How to Use TorchScript Models

TorchScript models support multiple language environments. For usage details, refer to [here](https://pytorch.org/tutorials/advanced/cpp_export.html#step-3-loading-your-script-module-in-c).

For simplicity, we demonstrate the usage of TorchScript in a Python environment using the ts file exported from the external model above.

First, construct inputs:
```python
from transformers import BertTokenizerFast
tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')
dummy_inputs = tokenizer('This is a test example', padding='max_length', max_length=256, return_tensors='pt')
```
Call torch to run the model:
```python
import torch
ts_model = torch.jit.load('/tmp/model.ts')
ts_model.eval()
with torch.no_grad():
    outputs = ts_model.forward(**dummy_inputs)
print(outputs)
```

## Specific Model Parameters

### BERT/StructBERT text-classification Models

```python
# Export model
from modelscope.models import Model
from modelscope.exporters import Exporter
model_id = 'damo/nlp_structbert_sentence-similarity_chinese-base'
model = Model.from_pretrained(model_id)
output_files = Exporter.from_model(model).export_torch_script(output_dir='/tmp', shape=(2, 256))
print(output_files)

# Use model
from modelscope.preprocessors import Preprocessor
preprocessor = Preprocessor.from_pretrained(
    'damo/nlp_structbert_sentence-similarity_chinese-base')
import torch
ts_model = torch.jit.load('/tmp/model.ts')
ts_model.eval()
inputs = preprocessor(('This is a sentence', 'This is another sentence'))
with torch.no_grad():
    outputs = ts_model.forward(inputs['input_ids'],
                               inputs['attention_mask'],
                               inputs['token_type_ids'])
print(outputs)
```

### StructBERT zero-shot-classification Models

```python
# Export model
from modelscope.models import Model
from modelscope.exporters import Exporter

model_id = 'damo/nlp_structbert_zero-shot-classification_chinese-base'
model = Model.from_pretrained(model_id)
output_files = Exporter.from_model(model).export_torch_script(
    candidate_labels=[
        'culture', 'sports', 'entertainment', 'finance', 'home', 'automotive', 'education', 'technology', 'military'
    ],
    hypothesis_template='The title of this article is {}',
    output_dir='/tmp')
print(output_files)

# Use model
from modelscope.preprocessors import Preprocessor

preprocessor = Preprocessor.from_pretrained(
    'damo/nlp_structbert_zero-shot-classification_chinese-base')
import torch

ts_model = torch.jit.load('/tmp/model.ts')
ts_model.eval()
inputs = preprocessor('text1',
                      candidate_labels=['culture', 'sports', 'entertainment', 'finance', 'home', 'automotive', 'education', 'technology', 'military'],
                      hypothesis_template='The title of this article is {}', )
with torch.no_grad():
    outputs = ts_model.forward(inputs['input_ids'],
                               inputs['attention_mask'],
                               inputs['token_type_ids'])
print(outputs)
```

# Export to SavedModel Format

[SavedModel](https://www.tensorflow.org/guide/saved_model?hl=en) is TensorFlow's commonly used inference format. Loading SavedModel doesn't require the original model source code—only TensorFlow's general loading method is needed for online inference. If you need to use this format for inference, you can use ModelScope's provided general export solution.

## Export Method

First, we need to initialize a model that supports the Exporter module:

```python
from modelscope.models import Model
model_id = 'damo/nlp_csanmt_translation_en2zh_base'
model = Model.from_pretrained(model_id)
```

Then we can export it to the corresponding format:

```python
from modelscope.exporters import TfModelExporter
output_files = TfModelExporter.from_model(model).export_saved_model(output_dir='/tmp')
print(output_files) # {'model': '/tmp'}
```

## How to Use SavedModel Format

SavedModel forward inference can be referenced in the following code:

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

Remember to replace the example values in the code with actual values when using.

## ModelScope Models Supporting SavedModel Export


| Model   |          Task |
|--------|------------:|
| csanmt | translation |

## Specific Model Export

### CSANMT Translation Model

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

# Export to Frozen Graphdef Format

Frozen graphdef is TensorFlow's commonly used inference format. Loading Frozen graphdef models also doesn't require the original model source code—only TensorFlow's general loading method is needed for online inference. If you need to use this format for inference, you can use ModelScope's provided general export solution.

## How to Use Frozen Graphdef Format

Using Frozen Graphdef for inference can be referenced in the following code:

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

## ModelScope Models Supporting Frozen Graphdef Export


| Model   |                       Task |
| ------- | -------------------------: |
| Cartoon | image-portrait-stylization |

## Specific Model Export

### DCT-Net Portrait Cartoonization Model

```python
import os
import cv2
import tensorflow as tf
from modelscope.models.cv.cartoon import CartoonModel
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.outputs import OutputKeys

model_dir = '/mnt/workspace/.cache/modelscope/damo/cv_unet_person-image-cartoon_compound-models'

## Export model
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

## Use model
pipeline_cartoon = pipeline(task=Tasks.image_portrait_stylization, model=model_dir)
result = pipeline_cartoon(input='https://modelscope.oss-cn-beijing.aliyuncs.com/test/images/image_cartoon.png')
if result is not None:
    cv2.imwrite('result.png', result[OutputKeys.OUTPUT_IMG])
    print(f'Output image written to {os.path.abspath("result.png")}')
```

# ModelScope Speech Model Export

ModelScope's speech domain provides a separate ecosystem to support export. For specific methods, please refer to [funasr model export](https://github.com/alibaba-damo-academy/FunASR/tree/main/funasr/export). Simply put, you only need one command:

```shell
# Install funasr and torchaudio, then execute the following command in terminal:
funasr-export ++model="iic/speech_paraformer-large_asr_nat-zh-cn-1...
```