<!-- modelscope-docs: Library Framework Mechanism | sdk/tutorials/framework-design/framework-design_EN.md -->

# ModelScope Framework Introduction

This chapter introduces the main mechanisms of the ModelScope Library framework. Users can selectively review the following content:

- Component Registration Method
- Component Reusability
- Configuration File Philosophy
- Dependency Separation & Lazy Load Support

## Component Registration Method

![image.png](./_resources/registry.png)

All ModelScope components are registered and used through a Registry mechanism. Models, preprocessors, pipelines, and other modules in ModelScope are registered using annotations with a group + name approach:

```text
# Register a model using task + name
@MODELS.register_module('text-classification', module_name='bert')
class SomeModel:
	...

# Register a preprocessor using domain + name
@PREPROCESSORS.register_module('nlp', module_name='my-preprocessor')
class SomePreprocessor:
	...

# Register a pipeline using task + name
@PIPELINES.register_module('text-classification', module_name='text-classification-basic')
class SomePreprocessor:
	...

# Register a trainer using name
@TRAINERS.register_module(module_name='custom-trainer')
class SomeTrainer:
    ...
```

After a component is registered, it can be instantiated in a generalized way:

```text
# Construct a model
# In the configuration.json of custom-model-id, task='text-classification', model.type='bert'
model = Model.from_pretrained('custom-model-id')

# Construct a preprocessor
# In the configuration.json of custom-model-id, task modality is 'nlp', preprocessor.type='my-preprocessor'
preprocessor = Preprocessor.from_pretrained('custom-model-id')

# Construct a pipeline
# In the configuration.json of custom-model-id, task='text-classification', model.type='bert', preprocessor.type='my-preprocessor', pipeline.type='text-classification-basic'
pipeline('text-classification', 'custom-model-id')

# Construct a Trainer
trainer = build_trainer(name='custom-trainer', ...)
```

## Component Reusability

![image.png](./_resources/task_and_module.png)

ModelScope components are generally divided by task, and within each task, they follow unified input/output formats to ensure consistent user experience.

- The **green parts** in the figure above, such as preprocessor, pipeline, metric, and model-output, are **shared within the same task** (new ones can be created for special requirements)
- The **blue parts** in the figure above, such as models and exporters, are **model-specific** and differ across tasks
- Optimizers, trainers, and MsDataset are reusable across models (new ones can be created for special requirements).

For the same task in ModelScope, the preprocessor input construction, model output, and pipeline output are fixed. However, there are no requirements for preprocessor output and model input, which helps reduce integration costs.

## Configuration File Philosophy

![image.png](./_resources/configuration.png)

ModelScope's fundamental philosophy regarding configuration is that all configurations are stored in a single configuration file (configuration.json), allowing users to obtain all necessary configuration information for the current model. Therefore, model construction, preprocessing, inference, and training all use this configuration file.

ModelScope provides a detailed introduction to configuration. Please refer to [Configuration Details](./Configuration详解.md).

## Dependency Separation & Lazy Load Support

Since ModelScope integrates models from various domains, different models have different dependencies, resulting in a large collective dependency set. Requiring users to install all dependencies before running code would create a poor experience. Therefore, we designed a LazyLoad solution to support independent loading of dependencies for each model.

In simple terms, we convert the modules under the previously mentioned component directories `'models', 'metrics', 'pipelines', 'preprocessors', 'task_datasets'` into LazyImportModule. These modules won't be loaded during import but will only be truly imported when used, ensuring dependency independence between different modules.

A reference example: https://github.com/modelscope/modelscope/blob/master/modelscope/pipelines/audio/__init__.py

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

Generally, an `__init__.py` file in a directory follows the structure below, where the TYPE_CHECKING branch corresponds to the original import statements. An additional else branch needs to be added, containing the `_import_structure` definition that specifies the lazyImportModule information, where keys represent module names and values represent available classes, attributes, and variables in the corresponding modules.

### Creating Lazy Loading - Specific Example:

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

When creating a new model `action_recognition` within the current cv model component, you need to add a new `__init__.py`.

The file before modification was:

```py
from modelscope.utils.import_utils import LazyImportModule
from .models import BaseVideoModel
from .tada_convnext import TadaConvNeXt
```

After modification according to lazy loading specifications:

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

### Calling Lazy Loading Modules

Again, refer to the example: https://github.com/modelscope/modelscope/blob/master/modelscope/pipelines/audio/__init__.py

✅ All audio-related lazy import methods are declared in the `__init__.py` file at the `modelscope/pipelines/audio` directory level. Therefore, the correct way to call a specific class from audio pipeline is:

```python
from modelscope.pipelines.audio import ANSPipeline
```

❌ Avoid directly calling from files or calling classes from directory levels where lazyimport is not declared, such as:

```python
from modelscope.pipelines import ANSPipeline
```

❌ Also, avoid direct file references, such as:

```py
from modelscope.pipelines.audio import ans_pipeline
pipeline = ans_pipeline.ANSPipeline()
```