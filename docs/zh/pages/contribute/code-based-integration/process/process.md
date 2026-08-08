<!-- modelscope-docs: 开发模型等组件及推理流程 | contribute/code-based-integration/process/process_CN.md -->

## 开发模型

一般来说，这部分所花费的时间取决于原始代码的不规范程度，如果是实验性代码则花的时间会多一些。请关注以下几点：
- 模型需要继承TorchModel（PyTorch模型）或Model（TF等其他框架）
- 模型的返回值需要符合该**任务**的Output类。
- 模型的名称需要符合接入规范（AwesomeModelForAwesomeTask）
- 如需要静态初始化模型，可以添加_instantiate方法
- **nlp模型目录内部**按任务划分文件，如backbone.py/text_classification.py等，如模型模块性不好，backbone.py可以不存在

### 模型代码

一个最简单的模型例子：

```py
from modelscope.utils.constant import Tasks
from modelscope.metainfo import Models
from modelscope.models.base import TorchModel
from modelscope.models.builder import MODELS


# MODELS.register_module部分是为了将模型注册进Registry中，这样可以在Model.from_pretrained中被使用到。在模型被初始化时，模型的构造方法就会被调用。
@MODELS.register_module(Tasks.awesome_task, module_name=Models.awesome_model)
class MyAwesomeModel(TorchModel):
    
    # model_dir作为第一个参数
    def __init__(self, model_dir, *args, **kwargs):
        super().__init__(model_dir, *args, **kwargs)
        ...

    def forward(self, input_tensor):
        # 假设是fill-mask任务，需要使用对应的标准Output
        return FillMaskModelOutput(
            ...
        )
        
    # 可选：如果forward由于某些原因不便于修改输出格式，或者需要支持某些通用的模型后处理，可以定义postprocess方法，否则移除这个方法
    def postprocess(...):
        return FillMaskModelOutput(
            ...
        )
    
    # 可选：如果需要通过静态方法构造模型，可以编写_instantiate方法，否则移除这个方法
    @classmethod
    def _instantiate(cls, **kwargs):
        model_dir = kwargs.pop('model_dir')
        # 调用初始化函数
        model = cls(**kwargs)
        # 自定义加载权重
        load_checkpoint(model, model_dir)
        # 其他操作
```

下面就可以开始迁移代码了。这里是和您的模型特性密切相关的内容，本文档不赘述。

### 模型返回值

如果代码迁移完成了，请保证该模型的返回值和模型的任务的返回值相同，以适配通用的pipeline。各模态的模型标准输出文件在modelscope/outputs目录中（nlp_output.py、cv_output.py等）。输出类定义的例子如下：

```text
# 例子1：注意力模型的fillmask输出 - 一般模型的fillmask输出 - 模型输出基类，可以直接使用，如果需要一些额外输出，可以在自己的awesome_task.py内部继承它们。
AttentionFillMaskModelOutput - FillMaskModelOutput - ModelOutputBase

# 例子2：定义一个新的模型输出类型
from modelscope.outputs.outputs import ModelOutputBase
@dataclass
class XXXModelOutput(ModelOutputBase):
    output1: Tensor = None
    output2: Tensor = None
```

**注意：**postprocess会在pipeline中后于forward被调用，在训练时只会调用forward，如果训练过程需要依赖此输出格式，请在forward中返回规范格式。

### 模型配置

在configuration.json中的`model`字段中配置模型：

```json
{
  "model": {
    "type": "structbert",
    "hidden_size": 512,
    ...
  }
}
```

也可以使用额外文件，如config.json，但读取逻辑需要用户在\_\_init\_\_或_instantiate中自行处理。

配置好后，就可以加载模型了：

```py
from modelscope.models import Model
model = Model.from_pretrained(local_dir)
```

### 代码中的例子

- modelscope/models/nlp/bart/text_error_correction.py fairseq模型的实际例子
- modelscope/models/nlp/bert/backbone.py中的BertModel 接入transformers backbone的实际例子，注意它的_instantiate为了复用性写在了BertPreTrainedModel中，用户可以根据实际情况有所取舍
- modelscope/models/cv/tinynas_detection/tinynas_damoyolo.py 接入cv模型的实际例子，该模型比较复杂，可灵活参考

### 常见问题

1. 构造中的参数怎么传进来？

- 构造时的参数有两个来源：其一是configuration.json中`model`字段的key-value值，其二是运行时from_pretrained的kwargs，其中kwargs的优先级较高，会覆盖前者。

2. 是否需要使用ModelScope提供的模型组件（如backbone或head）？

- 这一点根据需求指定。如果模型结构模块化比较好，且ModelScope已经提供了其中大多数的结构，那么推荐将剩余结构抽象出来，并有效利用现有的组件，如backbone来完成模型接入。

3. 什么是静态初始化模型？_instantiate有什么用？

- 举个例子，一般来说transformers的模型通过以下方法初始化：

```text
BertModelForSequenceClassification.from_pretrained('some dir')
```

上面的BertModelForSequenceClassification.from_pretrained是静态调用，其中包含了调用构造方法+加载checkpoint两部分，那么当`MyAwesomeModel`已经被Model.from_pretrained(注意是ModelScope的Model类)调用到构造中时，就不能再对`MyAwesomeModel`进行这种实例化了。这种情况的典型场景如下：

- 接入的MyAwesomeModel继承了其他框架的基类，如transformers的PreTrainedModel，同时也继承了ModelScope的Model类，且需要通过其他框架的静态方法（如PreTrainedModel.from_pretrained）方式整体构造起来

这样就可以使用`_instantiate`方法，该方法在模型中声明时，Model.from_pretrained会调用`_instantiate`，而不会调用模型的构造方法。

```text
import torch.nn
from modelscope.models.base import TorchModel
from modelscope.models.builder import MODELS
from modelscope.utils.constant import Tasks
from modelscope.metainfo import Models


@MODELS.register_module(Tasks.awesome_task, module_name=Models.awesome_model)
# PreTrainedModel的继承放在TorchModel后面，对其他框架同理
class MyAwesomeModel(TorchModel, PreTrainedModel):

    def __init__(self, model_dir, *args, **kwargs):
        super().__init__(model_dir, *args, **kwargs)
        ...

    def forward(self, input_tensor):
        ...

    @classmethod
    def _instantiate(cls, **kwargs):
        model_dir = kwargs.pop('model_dir')
        # 由于transformers的from_pretrained和ModelScope的from_pretrained名称重叠，
        # 使用super(Model, cls)会调用到PreTrainedModel.from_pretrained，使MyAwesomeModel从静态方法初始化
        return super(Model, cls).from_pretrained(pretrained_model_name_or_path=model_dir, **kwargs)
```
### 零代码接入模型

在实际接入模型过程中，并非每一个模型都要重新开发接入，如nlp领域中的bert、t5、xml-roberta等常用模型，会被算法同学大量使用，不需要每次都重新接入。
针对这一类经常被引用的模型，我们添加了标准的backbone代码，以便算法同学只需要简单的完成configuration.json配置即可完成模型的添加。

目前支持这类零代码接入的模型主要集中在nlp中。同时由于在nlp中已经有较为成熟的huggingface的transformers模型组件库，
很多算法希望将原有在huggingface上的模型快速迁移过来到modelscope，因此modelscope也支持了huggingface模型快速零代码接入的方案。

下面将具体介绍各类模型接入的方式及特点，并最后列出已支持的模型。

#### 任务模型介绍

在开始介绍前要介绍一下任务模型的概念。

前述 [模型代码](#模型代码) 下介绍的新注册模型，`@MODELS.register_module(Tasks.awesome_task, module_name=Models.awesome_model)`，
针对 `Tasks.awesome_task` 任务新增了一个模型`Models.awesome_model`, 这样子则可通过下述配置查找到本次新增的模型：
```json
{
  "task": "awesome-task",
  "model": {
    "type": "awesome-model",
    ...
  }
}
```
那么如果这个`Models.awesome_model` 需要支持其他任务的话，我们还需要改写少量部分代码，并且复制粘贴并新建一个模型，并注册新组件。
`@MODELS.register_module(Tasks.awesome_task1, module_name=Models.awesome_model)`。

为了避免用户重复开发，我们把模型抽象成`backbone-head`形式，`backbone`对应的模型部分独立于任务，可应用于多种任务中，
而针对不同任务需要调整的部分，我们放在了预制好的`head`组件中，用户直接使用即可，不用改动。 
不同类型的任务模型对应不同的`backbone-head`组合形式， 如：encoder only，decoder only，single stage model和two stage models等。
通过这种形式，用户只需要注册或者选择不同的`backbone`，并通过一个预制的任务模型，完成任务模型的注册。
这个任务模型会自动组装，`backbone`以及对应的`head`， 形成一个完整的任务模型。

下面是一个基于encoder model结构的任务模型示例：
在`modelscope/models/nlp/task_models/fill_mask.py`这个文件中，我们定义了`fill mask`这个任务模型，
主要的function与普通的模型接入相差不多，不同的是在注册的时候我们将这个模型注册到了如下的组件中。

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

同时，在configuration.json中可以通过如下配置，指定到上述预制好的任务模型中。
并且，任务模型会通过解析config内容去构建`backbone`和`head`两个子模型部分。

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

通过上述的配置，即可快速零代码添加一个基于`bert`模型的`fill mask`任务到modelhub中，同理用户可以更换backbone和head去指定完成不同任务。
相关backbone和head的注册实现，
可以参考[backbone](https://github.com/modelscope/modelscope/blob/master/modelscope/models/nlp/bert/backbone.py)
和[head](https://github.com/modelscope/modelscope/blob/master/modelscope/models/nlp/heads/fill_mask_head.py)的组件。

#### 兼容huggingface

为了支持更多的模型零代码接入modelscope，我们兼容了huggingface的transformer模型库中的backbone模型。
用户可以直接将transformer的模型配置放到model的配置下方即可。

如,在transformer的`xlm-roberta-large`模型配置文件 `config.json`有
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
我们直接把这部分模型配置加入到我们前述的任务模型配置中即可，如下：

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
modelscope会通过`model.type`为`fill-mask`确定使用什么样的任务模型，并通过字段`model.model_type` 中的信息去解析找到对应的transformers
中的模型`xlm-roberta`作为backbone，以便后续进行推理或者训练使用。
目前这类方法的接入仅支持 nlp 领域的 encoder only模型结构，后续会扩展更多。


#### 支持的backbone（模型） 以及 head（任务）

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


#### 完整零代码接入示例
注意：目前支持零代码接入的仅有nlp领域的pytorch模型

下面示例添加一个 huggingface中 bert的的text-classification任务模型到modelhub
* step 1: 下载准备好原有模型的ckpt文件 `pytorch_model.bin`， `config.json`, 以及`tokenzier.json`等
* step 2：创建并添加信息到 configuration.json

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
* step 3: 在modelscope官网点开 个人主页，点击创建模型, 填入模型英文名称（这里以bert-text-cls为例），创建模型,
  并上传step1、2中模型到modelhub。 注意提交模型要打版本号，通过版本号进行管理。
    ```shell
    # 
    git tag -a v1.0  # choose a version number
    git push origin v1.0
    ```
* step 4: 使用modelscope进行推理
    ```python
    from modelscope.utils.constant import Tasks
    from modelscope.pipelines import pipeline
    
    pipe = pipeline(task=Tasks.text_classification, 
                    model='bert-text-cls',  # Repalce with your own model name
                    model_revision='v1.0')  # Use the version number you specified
    
    text = '今天天气比较不错'
    output = pipe(input=text)
    print(output)
    ```


## 开发预处理器

ModelScope的预处理过程负责从list/str/dict/文件中读取或解析数据，并转为模型输入。

**ModelScope的预处理器在modelscope/preprocessor路径下**，按模态划分。接入预处理时，需要注意几个点：

- 预处理器**不是以模型为粒度**的，在可以复用的情况下应尽量复用
- 如果需要接入训练流程，ModelScope的trainer当前**不支持带参预处理**，请将需要传递的参数放在__init__方法上，并在self中保存，在\_\_call\_\_中使用

预处理器的基本信息可以参考文档：[数据的预处理](../../ModelScope%20Library教程/详细教程/数据的预处理.md)。

### 预处理器代码

以下代码在ModelScope现有预处理器不满足需求时关注。

首先在modelscope/metainfo.py的Preprocessors类中增加一个新的预处理器名称：

```text
awesome_task_preprocessor = 'awesome-task-preprocessor'
```

在对应模态目录中新建awesome_task.py，编写一个新的预处理器：
```text
from modelscope.preprocessors import Preprocessor
from modelscope.preprocessors import PREPROCESSORS
from modelscope.metainfo import Preprocessors
# 由于预处理器可能在不同模型间复用，因此预处理器的注册使用领域code+预处理器名称完成，这样在使用它时无需在预处理器上增加额外注解，仅需要在configuration中配置名称即可。
@PREPROCESSORS.register_module('nlp', module_name=Preprocessors.awesome_task_preprocessor)
# 假设源代码来自于transformers，在类名加上Transformers提示使用者适配的任务和codebase
# 可以继承于Preprocessor，如果对应任务存在预处理基类，需要继承该基类
class AwesomeTaskTransformersPreprocessor(Preprocessor):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def __call__(self, data: str):
        ...
    
    # 可选，如果在训练时需要对预处理器进行存储时覆盖
    def save_pretrained(self, ...):
        ...
```

### 预处理器配置

```json
{
  ...
  "preprocessor": {
    "type": "awesome-task-preprocessor",
    # 其他构造参数写在这里
    ...
  },
  ...
}
```

configuration.json中的预处理器配置支持两种格式：

1. preprocessor字段下直接包含type字段和其他构造需要的字段。这种情况下，训练时处理train_dataset、eval_dataset，推理时处理输入的都是这一套配置。为了区分，预处理器都支持`mode`字段，可以通过该字段区分当前的使用场景。
2. preprocessor字段下包含了train字段和val字段，两个字段下分别存在预处理器的type字段和其他构造需要的字段。这种情况下，训练时处理train_dataset会使用train下的配置，处理eval_dataset及推理时会使用val下的配置，同样，可以通过`mode`字段区分使用场景。

同模型一样，预处理器也支持_instantiate方法，可自由使用。

建议保证预处理器和模型可以在没有Pipeline的情况下联立使用：
```text
preprocessor = Preprocessor.from_pretrained('some model', mode='inference')
model = Model.from_pretrained('some model')
# 在预处理器的返回值方面，应注意返回的tensor类型、padding与否和collate方式
print(model(preprocessor(inputs)))
```

### 不同模态的预处理细节

#### cv的预处理器

- ModelScope已有的预处理器

一般在modelscope/preprocessors/image.py文件中，如果符合需求可以直接使用它们。

- 待开发的预处理器

例如使用mmcv的预处理流程，可以在configuration.json中的`preprocessor`字段中指定好需要使用的preprocessor list，在代码中引用mmcv库进行使用。

#### nlp的预处理器

nlp的预处理器一般围绕tokenizer展开。nlp的tokenizer相对可数，但不同框架的用法不同，模型文件的格式也不同。nlp的预处理器一般按任务构建基类，该基类指定了通用构造参数，\_\_call\_\_方法入参，以及一些基本的辅助代码。子类根据特定的需求实现自己的特性，以分类任务为例：

```text
TextClassificationPreprocessorBase
    |__ TextClassificationTransformersPreprocessor # transformers模型使用
    |__ TextClassificationFairseqPreprocessor # fairseq模型使用
    |__ TextClassificationForMyOwnModelPreprocessor # 某个特殊模型使用
```

如上，该任务为来自transformers、fairseq和一个有特殊需求的模型分别实现了子类。并用基类来保证体验一致性。

nlp预处理器放在modelscope/preprocessors/nlp目录中，按任务划分文件。

由于推理时数据按条输入按batch给模型，因此nlp预处理器应多返回一个batch维，tensor类型应该是模型可接受的类型；训练时trainer的data_collator会组合batch并返回模型需要的tensor类型，因此预处理器不需要返回batch维，并将tensor的类型设置为np.array（原因是trainer默认使用了torch的data_collator，此模块会将np.array转为torch.tensor）。

### 代码中的例子

- modelscope/preprocessors/nlp/text_generation_preprocessor.py nlp规范中，生成任务的继承关系
- modelscope/preprocessors/image.py cv预处理器的一些用法

## 开发推理过程

ModelScope的推理使用Pipeline模块完成。接入时有一个`Pipeline`基类可以继承，调用时有一个`pipeline`方法用来方便地构建推理：
```text
from modelscope.pipelines import pipeline
# pipeline方法是类似于模型和预处理器的`from_pretrained`的泛化封装
pipeline('some-task', 'some-model')
```
Pipeline也是在相同任务的不同模型之间复用的。也就是说，假如AwesomeTaskPipeline已经存在，我们推荐继续使用它。有关pipeline的基本介绍可以参考[模型的推理pipeline](../../ModelScope%20Library教程/模型推理Pipeline.md)。

在编写一个新的Pipeline时，需要了解以下重点事项：

- Pipeline类的命名规则统一为TaskPipeline，比如文本分类的Task是TextClassification，则对应的Pipeline类名应取为TextClassificationPipeline

- Pipeline基类会默认调用Model和Preprocessor的from_pretrained方法，如果没有Preprocessor可以自行编写Pipeline.preprocess方法进行预处理
- 如果新增了一个pipeline，该pipeline的标准输出需要在modelscope/outputs/outputs.py文件中定义说明(并考虑其易用性)， pipeline的标准输入需要在pipeline\_inputs.py文件中声明

### 推理代码

以下代码在ModelScope现有Pipeline不满足需求时关注。

首先在modelscope/metainfo.py中的Pipelines类中新增一个pipeline名字：
```text
awesome_task_pipeline = 'awesome-task-pipeline'
```

新建一个awesome_task_pipeline.py并开始编写：

```py
from typing import Any, Dict, Union

from modelscope.metainfo import Pipelines, Preprocessors
from modelscope.models.base import Model
from modelscope.outputs import OutputKeys, AwesomeTaskOutput
from modelscope.pipelines.base import Pipeline
from modelscope.pipelines.builder import PIPELINES
from modelscope.preprocessors import Preprocessor
from modelscope.utils.constant import Fields, Tasks


# Pipeline按照任务名称+pipeline名字进行注册。configuration.json中只要添加pipeline.type字段即可使用，不需要改动代码
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
        # 实现预处理，如传入了preprocessor可以不编写这个方法
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

Pipeline基类的常用方法中可被覆盖的有：

- _sanitize_parameters \_\_call\_\_方法的额外参数在这里分成预处理、推理、后处理的参数
- _collate_fn 对输入定制collate
- _preprocess 预处理过程
- forward 前向推理过程
- postprocess 后处理过程

对需要单机多卡推理的大模型，ModelScope提供了DistributedPipeline类，接入方法可以参考[大模型开发](./接入帮助/大模型开发.md)。

当代码编写完成后，可以添加一些unittest来保证其正确性。

```text
pipeline_instance = pipeline(Tasks.awesome_task, model='some model')
pipeline_instance(...)
self.assertTrue(...)
...
```

### 代码中的例子

- modelscope/pipelines/nlp/fill_mask_pipeline.py MLM任务的pipeline，用到了预处理器和模型的标准方法和返回值
- modelscope/pipelines/cv/tinynas_detection_pipeline.py 目标检测任务的pipeline
