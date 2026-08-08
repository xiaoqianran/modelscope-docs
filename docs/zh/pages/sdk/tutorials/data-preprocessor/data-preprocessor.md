<!-- modelscope-docs: 数据的预处理 | sdk/tutorials/data-preprocessor/data-preprocessor_CN.md -->

# 数据预处理的概念

在深度学习中，模型的输入并不是实际的文字、图片或音频的原始信息。以NLP来说，文字或单词可能会先经过拆分编码转换为字元，再经过一个字典（vocab）转换为一个数字编号。举个例子，reading可能会被转换为#read和#ing，而后变为字典编号1和19（仅作为例子，其中的数字和字符可能不准确）。以CV来说，图片在输入模型之前可能会经过增强、旋转、裁剪、二值化等过程，形成指定大小和规则的新图片，这个过程就是预处理。

# ModelScope的预处理器

预处理过程开始于数据从数据集中取出，终止于处理好的数据输入模型。因此预处理过程会关心数据集本身特性，比如会在构造方法中传入数据集的key用来获取对应字段的值。

一般来说，模型的预处理过程和模型的领域、代码来源（codebase）强相关。例如：

- 来自mmcv的模型一般使用该框架提供的preprocessor，并且在一个任务中呈现多个preprocessor顺序式调用
- 来自transformers的模型一般使用该框架提供的tokenizer，并适配于特定的vocab.txt及tokenizer.json等文件
- 来自fairseq的模型一般使用开源tokenizer的浅封装版本

同一模态内部不同模型的预处理虽然使用了基本相同的底层逻辑或底层库，但外层封装的不同导致预处理输出、模型输入、模型配套文件等差异很大，因此ModelScope不强迫接入模型使用统一的预处理逻辑。

ModelScope的预处理器是通过注册被自动使用的，它的注册方式是领域+预处理器名字，这样有利于不改动代码在配置文件中直接复用。例如：
```python
# 注册一个NLP领域的fill-mask预处理器
from modelscope.metainfo import Preprocessors
from modelscope.preprocessors.builder import PREPROCESSORS
from modelscope.utils.constant import Fields

@PREPROCESSORS.register_module(Fields.nlp, module_name=Preprocessors.fill_mask)
```

如果是外部的预处理器，也可以通过直接调用的方法进行注册：
```python
from modelscope.metainfo import Preprocessors
from modelscope.preprocessors.builder import PREPROCESSORS
from modelscope.utils.constant import Fields

from myrclass import MyPreprocessorCls
PREPROCESSORS.register_module(Fields.nlp, module_name=Preprocessors.fill_mask, module_cls=MyPreprocessorCls)
```

下面是一个预处理器加模型一起使用的例子：
```python
from modelscope.preprocessors import Preprocessor
from modelscope.models import Model
# 在参数中指定了双句的两个key
preprocessor = Preprocessor.from_pretrained('damo/nlp_structbert_sentence-similarity_chinese-base', first_sequence='sent1', second_sequence='sent2')
model = Model.from_pretrained('damo/nlp_structbert_sentence-similarity_chinese-base')
data = preprocessor({'sent1': '这件商品很好', 'sent2': '这件商品很优秀'})
print(data)
print(model(**data)) # AttentionTextClassificationModelOutput(logits=tensor([[-1.3232,  1.5160]], grad_fn=<AddmmBackward0>), loss=None, attentions=None, hidden_states=None)
```
或者，也可以直接构造预处理器：

```python
from modelscope.hub.snapshot_download import snapshot_download
from modelscope.preprocessors import TextClassificationTransformersPreprocessor
from modelscope.models.nlp import SbertForSequenceClassification
model_dir = snapshot_download('damo/nlp_structbert_sentence-similarity_chinese-base')
# 直接构造，这时候注册机制不起作用
preprocessor = TextClassificationTransformersPreprocessor(model_dir=model_dir, sequence_length=256)
model = SbertForSequenceClassification.from_pretrained(model_dir)
#输入一个tuple
data = preprocessor(('这件商品很好', '这件商品很优秀'))
print(data)
print(model(**data)) # AttentionTextClassificationModelOutput(logits=tensor([[-1.3232,  1.5160]], grad_fn=<AddmmBackward0>), loss=None, attentions=None, hidden_states=None)
```

[注：] 模型可以通过snapshot_download函数下载到本地，也可以是任何一个本地模型目录（代替model_dir即可）。

在上面的例子中，TextClassificationTransformersPreprocessor这个预处理器做了两件事情：
1. 从一个完整的输入中分离出句子1和句子2
2. 将句子1和句子2传入内部的tokenizer，并生成可以输入模型的数据格式

不同模型和任务会使用不同的预处理器，您可以根据您感兴趣的方向来选择查看不同的文档：

- 预处理用于各任务推理和训练可以查看[各任务最佳实践](../各任务最佳实践/任务的介绍.md)
- 各模型的具体用法可以查看[模型库中的模型卡片](https://www.modelscope.cn/models)

# 编写一个新的预处理器

ModelScope支持用户编写一个新的预处理器，以下是预处理器的基类，可以支持用户从类的构造以及`from_pretrained`的方法进行前处理器的构建


```python
class Preprocessor(ABC):

    def __init__(self, mode=ModeKeys.INFERENCE, *args, **kwargs):
        self._mode = mode
        assert self._mode in (ModeKeys.INFERENCE, ModeKeys.TRAIN,
                              ModeKeys.EVAL)
        self.device = int(
            os.environ['LOCAL_RANK']) if 'LOCAL_RANK' in os.environ else None
        pass

    @abstractmethod
    def __call__(self, data: Dict[str, Any]) -> Dict[str, Any]:
        # The preprocessor entry.
        pass

    @property
    def mode(self):
        return self._mode

    @mode.setter
    def mode(self, value):
        self._mode = value
    
    def save_pretrained(self,
                        target_folder: Union[str, os.PathLike],
                        config: Optional[dict] = None,
                        save_config_function: Callable = save_configuration):
      # Override this method if you have some files to save after training.
      pass
```

您可以继承该类编写一个预处理器：


```python
from modelscope.preprocessors import Preprocessor
from modelscope.preprocessors import PREPROCESSORS
@PREPROCESSORS.register_module(
    'nlp',
    module_name='my-ws-preprocessor')
class WordSegmentationBlankSetToLabelPreprocessor(Preprocessor):
    """The preprocessor used to turn a single sentence to a labeled token-classification dict.
    """

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.first_sequence: str = kwargs.pop('first_sequence',
                                              'first_sequence')
        self.label = kwargs.pop('label', 'labels')

    def __call__(self, data: str):
        data = data.split(' ')
        data = list(filter(lambda x: len(x) > 0, data))

        def produce_train_sample(words):
            chars = []
            labels = []
            for word in words:
                chars.extend(list(word))
                if len(word) == 1:
                    labels.append('S-CWS')
                else:
                    labels.extend(['B-CWS'] + ['I-CWS'] * (len(word) - 2)
                                  + ['E-CWS'])
            assert len(chars) == len(labels)
            return chars, labels

        chars, labels = produce_train_sample(data)
        return {
            self.first_sequence: chars,
            self.label: labels,
        }
```

这是一个将空格分隔的句子转换为标准的分词任务（序列标注任务的一种）使用的数据集的预处理器。用户只需要实现自己的`__call__`方法。
如果需要使用`Preprocessor.from_pretrained`调用，请在类上增加`@PREPROCESSORS.register_module`的注解，或者将注解变成调用：
```python
PREPROCESSORS.register_module(
    'nlp',
    module_name='my-ws-preprocessor', module_cls=WordSegmentationBlankSetToLabelPreprocessor)
```

使用这个类时，可以这样调用：
```python
preprocessor = WordSegmentationBlankSetToLabelPreprocessor(first_sequence='sentence', label='label')
print(preprocessor('我们 喜欢 看 电影'))
```



