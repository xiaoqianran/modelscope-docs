<!-- modelscope-docs: Library框架机制 | sdk/tutorials/framework-design/framework-design_CN.md -->

# ModelScope机制介绍

本章节介绍ModelScope Library框架的主要机制，用户可以挑选查看。内容包括：

- 组件注册方式
- 组件复用性
- 配置文件思想
- 依赖分离 & Lazy Load支持

## 组件注册方式



![image.png](./_resources/registry.png)

ModelScope的组件都是以Registry机制进行注册并使用的。进入ModelScope的模型、预处理器、pipeline等模块会以分组+名称的方式通过注解进行注册：

```text
# 使用任务+名称注册一个模型
@MODELS.register_module('text-classification', module_name='bert')
class SomeModel:
	...

# 使用领域+名称注册一个预处理器
@PREPROCESSORS.register_module('nlp', module_name='my-preprocessor')
class SomePreprocessor:
	...

# 使用任务+名称注册一个pipeline
@PIPELINES.register_module('text-classification', module_name='text-classification-basic')
class SomePreprocessor:
	...

# 使用名称注册一个trainer
@TRAINERS.register_module(module_name='custom-trainer')
class SomeTrainer:
    ...
```

在某类组件注册后，该组件就可以以泛化方式实例化：

```text
# 构造一个模型
# custom-model-id模型的configuration.json配置中，task='text-classification'，model.type='bert'
model = Model.from_pretrained('custom-model-id')

# 构造一个预处理器
# custom-model-id模型的configuration.json配置中，task的模态为'nlp'，preprocessor.type='my-preprocessor'
preprocessor = Preprocessor.from_pretrained('custom-model-id')

# 构造一个pipeline
# custom-model-id模型的configuration.json配置中，task='text-classification'，model.type='bert'，preprocessor.type='my-preprocessor',pipeline.type='text-classification-basic'
pipeline('text-classification', 'custom-model-id')

# 构造一个Trainer
trainer = build_trainer(name='custom-trainer', ...)
```

## 组件复用性

![image.png](./_resources/task_and_module.png)

ModelScope的组件一般按照任务进行划分，并在任务内遵循统一输入输出格式，以保证对用户的体验一致性。

- 上图中**绿色部分**，如preprocessor、pipeline、metric、model-output在**任务内共用**（有特殊需求可以新建）
- 上图中**蓝色部分**，如模型、Exporter不同任务不同**模型特有**
- Optimizers、trainer、MsDataset模型间复用（有特殊需求可以新建）。

ModelScope的同一任务预处理器构造输入、模型输出、pipeline输出是固定的。而对预处理器输出和模型输入不做要求，以此来降低接入成本。

## 配置文件思想

![image.png](./_resources/configuration.png)

ModelScope对于配置的基本思想是，所有的配置都存储在单一的配置文件（configuration.json）中，以便于使用者得到当前模型的所必须的所有配置信息。因此模型的构建、模型的预处理、模型的推理、模型的训练都会使用这个配置文件来进行。

ModelScope提供了一个关于配置的详细介绍，请参考[Configuration详解](./Configuration详解.md)。

## 依赖分离 & Lazy Load支持

由于modelscope接入全领域的不同模型，不同模型的依赖不一样，所有模型的依赖集合庞大，如果要求用户安装所有依赖再运行代码，体验很差， 因此我们设计了LazyLoad方案来支持各个模型依赖的独立加载

简单来说，我们会把前面提到的组件`'models', 'metrics', 'pipelines', 'preprocessors', 'task_datasets'` 目录下的模块变成LazyImportModule， 这些模块在import时候不会被加载，只有在使用的时候才会被真正import，从而保证不同模块之间的依赖相互独立

一个参考示例 https://github.com/modelscope/modelscope/blob/master/modelscope/pipelines/audio/__init__.py

```py
# Copyright (c) Alibaba, Inc. and its affiliates.
from typing import TYPE_CHECKING

from modelscope.utils.import_utils import LazyImportModule

if TYPE_CHECKING:
    from .ans_pipeline import ANSPipeline
    from .asr_inference_pipeline import AutomaticSpeechRecognitionPipeline
    from .kws_farfield_pipeline import KWSFarfieldPipeline
    from .kws_kwsbp_pipeline import KeyWordSpottingKwsbpPipeline
    from .linear_aec_pipeline import LinearAECPipeline
    from .text_to_speech_pipeline import TextToSpeechSambertHifiganPipeline

else:
    _import_structure = {
        'ans_pipeline': ['ANSPipeline'],
        'asr_inference_pipeline': ['AutomaticSpeechRecognitionPipeline'],
        'kws_farfield_pipeline': ['KWSFarfieldPipeline'],
        'kws_kwsbp_pipeline': ['KeyWordSpottingKwsbpPipeline'],
        'linear_aec_pipeline': ['LinearAECPipeline'],
        'text_to_speech_pipeline': ['TextToSpeechSambertHifiganPipeline'],
    }

    import sys

    sys.modules[__name__] = LazyImportModule(
        __name__,
        globals()['__file__'],
        _import_structure,
        module_spec=__spec__,
        extra_objects={},
    )
```

整体而言一个目录的__init__.py文件遵循如下结构， 其中TYPE_CHECKPING的分支对应原有的import语句，
需要额外新增一个else分支，里面设定_import_structure结构，应以定义lazyImportModule的信息， 其中key代表模块名， value代表对应模块里的可用类、属性、变量

### 创建懒加载具体示例：

```commandline
cv
├── action_recognition
│   ├── __init__.py
│   ├── models.py
│   └── tada_convnext.py
└── animal_recognition
    ├── __init__.py
    ├── resnet.py
    └── splat.py

```

在当前cv模型组建内，新建一个模型`action_recognition`时，需要新增`__init__.py`。 

修改前的文件为：

```py
from modelscope.utils.import_utils import LazyImportModule
from .models import BaseVideoModel
from .tada_convnext import TadaConvNeXt
```

根据懒加载规范修改后为：

```py
from typing import TYPE_CHECKING

from modelscope.utils.import_utils import LazyImportModule

if TYPE_CHECKING:

 from .models import BaseVideoModel
 from .tada_convnext import TadaConvNeXt

else:
 _import_structure = {
 'models': ['BaseVideoModel'],
 'tada_convnext': ['TadaConvNeXt'],
 }

 import sys

 sys.modules[__name__] = LazyImportModule(
 __name__,
 globals()['__file__'],
 _import_structure,
 module_spec=__spec__,
 extra_objects={},
 )
```

### 懒加载模块的调用

同样参考示例： https://github.com/modelscope/modelscope/blob/master/modelscope/pipelines/audio/__init__.py

✅所有audio相关的lazy import的方法均声明在了modelscope/pipelines/audio这个层级目录下的__init__.py中，因此在调用audio pipeline其中某个类的正确写法应该是：

```python
from modelscope.pipelines.audio import ANSPipeline
```

❌避免出现直接从文件调用或者在未申明lazyimport的目录层级进行类的调用，如以下情况:

```python
from modelscope.pipelines import ANSPipeline
```

❌同时，避免直接引用文件的方式， 如:

```py
from modelscope.pipelines.audio import ans_pipeline
pipeline = ans_pipeline.ANSPipeline()
```
