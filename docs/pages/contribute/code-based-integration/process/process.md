<!-- modelscope-docs: Developing Model Components and Inference Pipeline | contribute/code-based-integration/process/process_EN.md -->

## Model Development

Generally, the time spent on this part depends on how unstructured the original code is. Experimental code will take more time. Please pay attention to the following points:
- Models need to inherit from TorchModel (for PyTorch models) or Model (for TF and other frameworks)
- Model return values need to conform to the Output class for that **task**
- Model names need to follow integration conventions (AwesomeModelForAwesomeTask)
- If static model initialization is needed, you can add an `_instantiate` method
- **Within NLP model directories**, files are organized by task, such as backbone.py/text_classification.py, etc. If the model modularity is poor, backbone.py may not exist

### Model Code

A simplest model example:

```py
from modelscope.utils.constant import Tasks
from modelscope.metainfo import Models
from modelscope.models.base import TorchModel
from modelscope.models.builder import MODELS


# The MODELS.register_module part registers the model into the Registry, making it usable in Model.from_pretrained. When the model is initialized, its constructor will be called.
@MODELS.register_module(Tasks.awesome_task, module_name=Models.awesome_model)
class MyAwesomeModel(TorchModel):

    # model_dir as the first parameter
    def __init__(self, model_dir, *args, **kwargs):
        super().__init__(model_dir, *args, **kwargs)
        ...

    def forward(self, input_tensor):
        # Assuming it's a fill-mask task, use the corresponding standard Output
        return FillMaskModelOutput(
            ...
        )

    # Optional: If forward cannot be easily modified to output format due to certain reasons, or if common model post-processing is needed, define a postprocess method; otherwise, remove this method
    def postprocess(...):
        return FillMaskModelOutput(
            ...
        )

    # Optional: If static method construction is needed, implement the _instantiate method; otherwise, remove this method
    @classmethod
    def _instantiate(cls, **kwargs):
        model_dir = kwargs.pop('model_dir')
        # Call initialization function
        model = cls(**kwargs)
        # Custom weight loading
        load_checkpoint(model, model_dir)
        # Other operations
```

Now you can start migrating your code. This content is closely related to your model's characteristics and won't be elaborated further in this document.

### Model Return Values

After code migration is complete, ensure that the model's return values match those of the model's task to adapt to the generic pipeline. Standard output files for models of different modalities are located in the modelscope/outputs directory (nlp_output.py, cv_output.py, etc.). Examples of output class definitions are as follows:

```text
# Example 1: Attention model's fillmask output - general model's fillmask output - base model output class, can be used directly. If additional outputs are needed, inherit from them in your own awesome_task.py.
AttentionFillMaskModelOutput - FillMaskModelOutput - ModelOutputBase

# Example 2: Define a new model output type
from modelscope.outputs.outputs import ModelOutputBase
@dataclass
class XXXModelOutput(ModelOutputBase):
    output1: Tensor = None
    output2: Tensor = None
```

**Note:** postprocess is called after forward in the pipeline, but only forward is called during training. If the training process depends on this output format, please return the standard format in forward.

### Model Configuration

Configure the model in the `model` field of configuration.json:

```json
{
  "model": {
    "type": "structbert",
    "hidden_size": 512,
    ...
  }
}
```

You can also use additional files like config.json, but the reading logic needs to be handled by the user in `__init__` or `_instantiate`.

After configuration, you can load the model:

```py
from modelscope.models import Model
model = Model.from_pretrained(local_dir)
```

### Code Examples

- modelscope/models/nlp/bart/text_error_correction.py - actual example of a fairseq model
- BertModel in modelscope/models/nlp/bert/backbone.py - actual example of integrating transformers backbone. Note that its `_instantiate` is written in BertPreTrainedModel for reusability; users can make choices based on actual situations
- modelscope/models/cv/tinynas_detection/tinynas_damoyolo.py - actual example of integrating a CV model. This model is relatively complex and can be flexibly referenced

### Common Issues

1. How are parameters passed into the constructor?

- Constructor parameters have two sources: one is key-value pairs from the `model` field in configuration.json, and the other is kwargs from runtime from_pretrained. The latter has higher priority and will override the former.

2. Do I need to use ModelScope-provided model components (such as backbone or head)?

- This depends on requirements. If the model structure is well-modularized and ModelScope already provides most of the structures, it's recommended to abstract the remaining structures and effectively utilize existing components like backbone to complete model integration.

3. What is static model initialization? What is `_instantiate` used for?

- For example, generally transformers models are initialized as follows:

```text
BertModelForSequenceClassification.from_pretrained('some dir')
```

The above BertModelForSequenceClassification.from_pretrained is a static call that includes both calling the constructor and loading checkpoint. When `MyAwesomeModel` has already been called by Model.from_pretrained (note it's ModelScope's Model class) in the constructor, you cannot instantiate `MyAwesomeModel` this way again. Typical scenarios for this situation include:

- The integrated MyAwesomeModel inherits from other framework base classes (such as transformers' PreTrainedModel) as well as ModelScope's Model class, and needs to be constructed entirely through other framework's static methods (such as PreTrainedModel.from_pretrained)

In this case, you can use the `_instantiate` method. When declared in the model, Model.from_pretrained will call `_instantiate` instead of the model's constructor.

```text
import torch.nn
from modelscope.models.base import TorchModel
from modelscope.models.builder import MODELS
from modelscope.utils.constant import Tasks
from modelscope.metainfo import Models


@MODELS.register_module(Tasks.awesome_task, module_name=Models.awesome_model)
# PreTrainedModel inheritance comes after TorchModel; same applies to other frameworks
class MyAwesomeModel(TorchModel, PreTrainedModel):

    def __init__(self, model_dir, *args, **kwargs):
        super().__init__(model_dir, *args, **kwargs)
        ...

    def forward(self, input_tensor):
        ...

    @classmethod
    def _instantiate(cls, **kwargs):
        model_dir = kwargs.pop('model_dir')
        # Since transformers' from_pretrained and ModelScope's from_pretrained have overlapping names,
        # using super(Model, cls) will call PreTrainedModel.from_pretrained, allowing MyAwesomeModel to be initialized from the static method
        return super(Model, cls).from_pretrained(pretrained_model_name_or_path=model_dir, **kwargs)
```
### Zero-Code Model Integration

In actual model integration processes, not every model needs to be redeveloped for integration. Common models in NLP domains like BERT, T5, XML-RoBERTa, etc., are heavily used by algorithm engineers and don't need to be reintegrated each time.
For these frequently referenced models, we've added standard backbone code so algorithm engineers can simply complete configuration.json configuration to add models.

Currently, zero-code integration support is mainly concentrated in NLP. Additionally, since there's already a mature HuggingFace transformers model component library in NLP,
many algorithm engineers want to quickly migrate their existing HuggingFace models to ModelScope, so ModelScope also supports HuggingFace model quick zero-code integration.

Below we'll introduce various model integration methods and characteristics, and finally list supported models.

#### Task Model Introduction

Before starting the introduction, let's explain the concept of task models.

The newly registered model introduced under [Model Code](#模型代码), `@MODELS.register_module(Tasks.awesome_task, module_name=Models.awesome_model)`,
adds a new model `Models.awesome_model` for the `Tasks.awesome_task` task. This can then be found through the following configuration:
```json
{
  "task": "awesome-task",
  "model": {
    "type": "awesome-model",
    ...
  }
}
```
If this `Models.awesome_model` needs to support other tasks, we would need to rewrite some code parts, copy-paste, and create a new model with a new component registration.
`@MODELS.register_module(Tasks.awesome_task1, module_name=Models.awesome_model)`.

To avoid repetitive development, we abstract models into `backbone-head` form. The `backbone` corresponds to the model part independent of tasks and can be applied to multiple tasks,
while parts that need adjustment for different tasks are placed in pre-built `head` components that users can directly use without modification.
Different types of task models correspond to different `backbone-head` combination forms, such as: encoder only, decoder only, single stage model, and two stage models.
With this form, users only need to register or select different `backbone`s and use a pre-built task model to complete task model registration.
This task model will automatically assemble the `backbone` and corresponding `head` to form a complete task model.

Below is an example of an encoder model-based task model:
In the file `modelscope/models/nlp/task_models/fill_mask.py`, we defined the `fill mask` task model.
The main functions are similar to ordinary model integration, except that during registration we registered this model to the following component.

```python
from modelscope.utils.constant import Tasks
from modelscope.metainfo import TaskModels, Heads
from modelscope.models.builder import MODELS
from modelscope.utils.config import ConfigDict


@MODELS.register_module(Tasks.fill_mask, module_name=TaskModels.fill_mask)
class ModelForFillMask(EncoderModel):
    task = Tasks.fill_mask

    # The default base head type is fill-mask for this head
    head_type = Heads.fill_mask

    def __init__(self, model_dir: str, *args, **kwargs):
        super().__init__(model_dir, *args, **kwargs)
        self.config = ConfigDict(kwargs)
        backbone_cfg = self.parse_encoder_cfg()
        head_cfg = self.parse_head_cfg()
        self.build_encoder(backbone_cfg)
        if head_cfg.type is not None:
            self.build_head(head_cfg)

    ...

```

Meanwhile, in configuration.json, you can specify the above pre-built task model through the following configuration.
And the task model will parse the config content to build the `backbone` and `head` sub-model parts.

```json
{
  "task": "fill-mask",
  "model": {
    "type": "fill-mask",
    "backbone": {
      "type": "bert",
      "prefix": "encoder",
      "attention_probs_dropout_prob": 0.1,
      "position_embedding_type": "absolute",
      "transformers_version": "4.6.0.dev0",
      "type_vocab_size": 2,
      "use_cache": true,
      "vocab_size": 21128
    },
    "head": {
      "type": "fill-mask",
      "hidden_dropout_prob": 0.1,
      "hidden_size": 768
    }
  }
}
```

With the above configuration, you can quickly add a `fill mask` task based on the `bert` model to modelhub with zero code. Similarly, users can change backbone and head to specify different tasks.
For related backbone and head registration implementations,
refer to [backbone](https://github.com/modelscope/modelscope/blob/master/modelscope/models/nlp/bert/backbone.py)
and [head](https://github.com/modelscope/modelscope/blob/master/modelscope/models/nlp/heads/fill_mask_head.py) components.

#### HuggingFace Compatibility

To support more models with zero-code integration to ModelScope, we've made compatible the backbone models from HuggingFace's transformer model library.
Users can directly place transformer model configurations under the model configuration section.

For example, in transformer's `xlm-roberta-large` model configuration file `config.json`:
```json
{
  "architectures": [
    "XLMRobertaForMaskedLM"
  ],
  "attention_probs_dropout_prob": 0.1,
  "bos_token_id": 0,
  "eos_token_id": 2,
  "hidden_act": "gelu",
  "hidden_dropout_prob": 0.1,
  "hidden_size": 1024,
  "initializer_range": 0.02,
  "intermediate_size": 4096,
  "layer_norm_eps": 1e-05,
  "max_position_embeddings": 514,
  "model_type": "xlm-roberta",
  "num_attention_heads": 16,
  "num_hidden_layers": 24,
  "output_past": true,
  "pad_token_id": 1,
  "position_embedding_type": "absolute",
  "transformers_version": "4.17.0.dev0",
  "type_vocab_size": 1,
  "use_cache": true,
  "vocab_size": 250002
}
```
We can directly add this model configuration to our previously mentioned task model configuration as follows:

```json
{
  "task": "fill-mask",
  "model": {
    "type": "fill-mask",
      "architectures": [
        "XLMRobertaForMaskedLM"
      ],
      "attention_probs_dropout_prob": 0.1,
      "bos_token_id": 0,
      "eos_token_id": 2,
      "hidden_act": "gelu",
      "hidden_dropout_prob": 0.1,
      "hidden_size": 1024,
      "initializer_range": 0.02,
      "intermediate_size": 4096,
      "layer_norm_eps": 1e-05,
      "max_position_embeddings": 514,
      "model_type": "xlm-roberta",
      "num_attention_heads": 16,
      "num_hidden_layers": 24,
      "output_past": true,
      "pad_token_id": 1,
      "position_embedding_type": "absolute",
      "transformers_version": "4.17.0.dev0",
      "type_vocab_size": 1,
      "use_cache": true,
      "vocab_size": 250002
  }
}
```
ModelScope will determine which task model to use based on `model.type` being `fill-mask`, and parse the information in the `model.model_type` field to find the corresponding transformer model `xlm-roberta` as the backbone for subsequent inference or training use.
Currently, this integration method only supports NLP domain encoder-only model structures, with more to be extended later.


#### Supported Backbones (Models) and Heads (Tasks)

| backbone                 | domain | modelscope version |
|--------------------------|--------|--------------------|
| bert                     | nlp    | 1.2.0              |
| deberta_v2               | nlp    | 1.2.0              |
| gpt2                     | nlp    | 1.2.0              |
| gpt_neo                  | nlp    | 1.2.0              |
| megatron_bert            | nlp    | 1.2.0              |
| structbert               | nlp    | 1.2.0              |
| t5                       | nlp    | 1.2.0              |
| veco                     | nlp    | 1.2.0              |
| lstm                     | nlp    | 1.3.0              |
| xml_roberta              | nlp    | 1.3.0              |
| Other Transformers Model | nlp    | 1.3.0              |

---

| Task / head              | domain | modelscope version |
|--------------------------|--------|--------------------|
| fill_mask                | nlp    | 1.2.0              |
| information_extraction   | nlp    | 1.2.0              |
| text_classification      | nlp    | 1.2.0              |
| text_generation          | nlp    | 1.2.0              |
| token_classification     | nlp    | 1.2.0              |
| crf_token_classification | nlp    | 1.3.0              |
| text_ranking             | nlp    | 1.3.0              |


#### Complete Zero-Code Integration Example
Note: Currently, only NLP domain PyTorch models support zero-code integration

The following example adds a HuggingFace BERT text-classification task model to modelhub:
* step 1: Download and prepare the original model's ckpt files `pytorch_model.bin`, `config.json`, and `tokenzier.json`, etc.
* step 2: Create and add information to configuration.json

    ```shell
    touch configuration.json
    echo '{
         "framework": "pytorch",
         "task": "text-classification",
         "model": {
            "type": "text-classification",
         }
         "pipeline": {
             "type": "text-classification"
         }
     }' > configuration.json
    ```
* step 3: On the ModelScope website, go to your personal homepage, click "Create Model," enter the model English name (here we use bert-text-cls as an example), create the model,
  and upload the models from steps 1 and 2 to modelhub. Note that when submitting the model, you need to tag a version number for version management.
    ```shell
    #
    git tag -a v1.0  # choose a version number
    git push origin v1.0
    ```
* step 4: Use ModelScope for inference
    ```python
    from modelscope.utils.constant import Tasks
    from modelscope.pipelines import pipeline

    pipe = pipeline(task=Tasks.text_classification,
                    model='bert-text-cls',  # Replace with your own model name
                    model_revision='v1.0')  # Use the version number you specified

    text = '今天天气比较不错'
    output = pipe(input=text)
    print(output)
    ```


## Preprocessor Development

ModelScope's preprocessing process is responsible for reading or parsing data from lists/strings/dicts/files and converting it to model input.

**ModelScope preprocessors are located under modelscope/preprocessor path**, organized by modality. When integrating preprocessing, note several points:

- Preprocessors are **not model-granular** and should be reused as much as possible when reusable
- If training pipeline integration is needed, ModelScope's trainer currently **does not support parameterized preprocessing**. Please place parameters that need to be passed in the `__init__` method and save them in self for use in `__call__`

Basic preprocessor information can be found in the documentation: [Data Preprocessing](../../ModelScope%20Library教程/详细教程/数据的预处理.md).

### Preprocessor Code

The following code should be considered when existing ModelScope preprocessors don't meet requirements.

First, add a new preprocessor name in the Preprocessors class in modelscope/metainfo.py:

```text
awesome_task_preprocessor = 'awesome-task-preprocessor'
```

Create a new awesome_task.py in the corresponding modality directory and write a new preprocessor:
```text
from modelscope.preprocessors import Preprocessor
from modelscope.preprocessors import PREPROCESSORS
from modelscope.metainfo import Preprocessors
# Since preprocessors may be reused across different models, preprocessor registration uses domain code + preprocessor name, so no additional annotations are needed on the preprocessor when using it; only the name needs to be configured in configuration.
@PREPROCESSORS.register_module('nlp', module_name=Preprocessors.awesome_task_preprocessor)
# Assuming the source code comes from transformers, add Transformers to the class name to indicate the adapted task and codebase
# Can inherit from Preprocessor; if there's a preprocessing base class for the corresponding task, need to inherit that base class
class AwesomeTaskTransformersPreprocessor(Preprocessor):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def __call__(self, data: str):
        ...

    # Optional, override if preprocessor storage is needed during training
    def save_pretrained(self, ...):
        ...
```

### Preprocessor Configuration

```json
{
  ...
  "preprocessor": {
    "type": "awesome-task-preprocessor",
    # Other constructor parameters go here
    ...
  },
  ...
}
```

Preprocessor configuration in configuration.json supports two formats:

1. The preprocessor field directly contains a type field and other fields needed for construction. In this case, the same configuration is used for processing train_dataset and eval_dataset during training, and for processing inputs during inference. To distinguish, preprocessors support a `mode` field that can be used to differentiate the current usage scenario.
2. The preprocessor field contains train and val fields, each containing the preprocessor's type field and other fields needed for construction. In this case, train configuration is used for processing train_dataset during training, and val configuration is used for processing eval_dataset and during inference. Again, the `mode` field can be used to distinguish usage scenarios.

Like models, preprocessors also support the `_instantiate` method and can be freely used.

It's recommended to ensure preprocessors and models can work together without Pipeline:
```text
preprocessor = Preprocessor.from_pretrained('some model', mode='inference')
model = Model.from_pretrained('some model')
# For preprocessor return values, pay attention to tensor type, padding, and collate method
print(model(preprocessor(inputs)))
```

### Preprocessing Details for Different Modalities

#### CV Preprocessors

- Existing ModelScope preprocessors

Generally located in modelscope/preprocessors/image.py file. If they meet requirements, they can be used directly.

- Preprocessors to be developed

For example, when using mmcv preprocessing workflow, specify the needed preprocessor list in the `preprocessor` field of configuration.json and reference the mmcv library in code.

#### NLP Preprocessors

NLP preprocessors generally revolve around tokenizers. NLP tokenizers are relatively countable, but usage differs across frameworks and model file formats also differ. NLP preprocessors are generally built around task base classes that specify generic constructor parameters, `__call__` method inputs, and some basic helper code. Subclasses implement their own characteristics based on specific needs. Taking classification tasks as an example:

```text
TextClassificationPreprocessorBase
    |__ TextClassificationTransformersPreprocessor # for transformers models
    |__ TextClassificationFairseqPreprocessor # for fairseq models
    |__ TextClassificationForMyOwnModelPreprocessor # for special models
```

As shown above, subclasses are implemented separately for models from transformers, fairseq, and models with special requirements. The base class ensures consistent experience.

NLP preprocessors are placed in modelscope/preprocessors/nlp directory, organized by task.

Since inference data is input line by line and batched to the model, NLP preprocessors should return an additional batch dimension, and tensor types should be acceptable to the model. During training, the trainer's data_collator combines batches and returns tensor types needed by the model, so preprocessors don't need to return batch dimensions and should set tensor types to np.array (because the trainer defaults to using torch's data_collator, which converts np.array to torch.tensor).

### Code Examples

- modelscope/preprocessors/nlp/text_generation_preprocessor.py - inheritance relationship for generation tasks in NLP standards
- modelscope/preprocessors/image.py - some usage examples of CV preprocessors

## Inference Pipeline Development

ModelScope's inference uses the Pipeline module. There's a `Pipeline` base class to inherit from, and a `pipeline` method for convenient inference construction:
```text
from modelscope.pipelines import pipeline
# The pipeline method is a generalized wrapper similar to models' and preprocessors' `from_pretrained`
pipeline('some-task', 'some-model')
```
Pipelines are also reusable across different models for the same task. That is, if AwesomeTaskPipeline already exists, we recommend continuing to use it. Basic pipeline introduction can be found in [Model Inference Pipeline](../../ModelScope%20Library教程/模型推理Pipeline.md).

When writing a new Pipeline, understand the following key points:

- Pipeline class naming convention is统一为TaskPipeline. For example, if the task for text classification is TextClassification, the corresponding Pipeline class name should be TextClassificationPipeline

- The Pipeline base class will default to calling Model and Preprocessor's from_pretrained methods. If no Preprocessor is available, you can write your own Pipeline.preprocess method for preprocessing
- If a new pipeline is added, its standard output needs to be defined in modelscope/outputs/outputs.py file (considering usability), and standard pipeline inputs need to be declared in pipeline_inputs.py file

### Inference Code

The following code should be considered when existing ModelScope Pipelines don't meet requirements.

First, add a new pipeline name in the Pipelines class in modelscope/metainfo.py:
```text
awesome_task_pipeline = 'awesome-task-pipeline'
```

Create a new awesome_task_pipeline.py and start writing:

```py
from typing import Any, Dict, Union

from modelscope.metainfo import Pipelines, Preprocessors
from modelscope.models.base import Model
from modelscope.outputs import OutputKeys, AwesomeTaskOutput
from modelscope.pipelines.base import Pipeline
from modelscope.pipelines.builder import PIPELINES
from modelscope.preprocessors import Preprocessor
from modelscope.utils.constant import Fields, Tasks


# Pipeline is registered by task name + pipeline name. Just add pipeline.type field in configuration.json to use it without code changes
@PIPELINES.register_module(
    Tasks.awesome_task, module_name=Pipelines.awesome_task_pipeline)
class AwesomeTaskPipeline(Pipeline):

    def __init__(self,
                 model: Union[Model, str],
                 preprocessor: Preprocessor = None,
                 config_file: str = None,
                 device: str = 'gpu',
                 auto_collate=True,
                 **kwargs):
        super().__init__(
            model=model,
            preprocessor=preprocessor,
            config_file=config_file,
            device=device,
            auto_collate=auto_collate)

        ...

    def preprocess(self, inputs: Dict[str, Any]):
        # Implement preprocessing; if preprocessor is provided, this method doesn't need to be written
        pass

    def forward(self, inputs: Dict[str, Any],
                **forward_params) -> Union[Dict[str, Any], AwesomeTaskOutput]:
        return self.model(**inputs, **forward_params)

    def postprocess(self,
                    inputs: Union[Dict[str, Any],
                                  AwesomeTaskOutput]) -> Dict[str, Any]:
        # do some post-processes
        return

```

Commonly overridable methods in the Pipeline base class include:

- _sanitize_parameters - extra parameters for `__call__` method are split here into preprocessing, inference, and post-processing parameters
- _collate_fn - customize collate for inputs
- _preprocess - preprocessing process
- forward - forward inference process
- postprocess - post-processing process

For large models requiring single-machine multi-GPU inference, ModelScope provides the DistributedPipeline class. Integration methods can be referenced in [Large Model Development](./接入帮助/大模型开发.md).

After code writing is complete, you can add some unittests to ensure correctness.

```text
pipeline_instance = pipeline(Tasks.awesome_task, model='some model')
pipeline_instance(...)
self.assertTrue(...)
...
```

### Code Examples

- modelscope/pipelines/nlp/fill_mask_pipeline.py - MLM task pipeline using standard methods and return values of preprocessor and model
- modelscope/pipelines/cv/tinynas_detection_pipeline.py - object detection task pipeline