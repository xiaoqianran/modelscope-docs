<!-- modelscope-docs: Data Preprocessing | sdk/tutorials/data-preprocessor/data-preprocessor_EN.md -->

# Concept of Data Preprocessing

In deep learning, the input to a model is not the raw information of actual text, images, or audio. Taking NLP as an example, text or words might first be split and encoded into characters, then converted to numeric IDs through a vocabulary dictionary. For instance, "reading" might be converted to "#read" and "#ing", and then transformed into dictionary IDs 1 and 19 (used only as an example; the actual numbers and characters may differ). In computer vision (CV), images might undergo processes such as augmentation, rotation, cropping, and binarization before being fed into the model, resulting in new images of specified size and format. This process is called preprocessing.

# ModelScope Preprocessors

The preprocessing pipeline starts when data is extracted from a dataset and ends when the processed data is fed into the model. Therefore, the preprocessing process takes into account the characteristics of the dataset itself, such as passing the dataset's keys in the constructor to retrieve values from corresponding fields.

Generally, a model's preprocessing is strongly correlated with its domain and codebase origin. For example:

- Models from mmcv typically use the preprocessors provided by that framework, often involving sequential calls to multiple preprocessors within a single task
- Models from transformers typically use the tokenizers provided by that framework, adapted to specific files such as vocab.txt and tokenizer.json
- Models from fairseq typically use lightweight wrapper versions of open-source tokenizers

Although different models within the same modality may use fundamentally similar underlying logic or libraries for preprocessing, the differences in their outer-layer implementations lead to significant variations in preprocessing outputs, model inputs, and associated model files. Therefore, ModelScope does not enforce a unified preprocessing logic for integrated models.

ModelScope preprocessors are automatically used through registration. They are registered using a combination of domain + preprocessor name, which facilitates direct reuse in configuration files without code modifications. For example:

```python
# Register an NLP fill-mask preprocessor
from modelscope.metainfo import Preprocessors
from modelscope.preprocessors.builder import PREPROCESSORS
from modelscope.utils.constant import Fields

@PREPROCESSORS.register_module(Fields.nlp, module_name=Preprocessors.fill_mask)
```

For external preprocessors, registration can also be done through direct function calls:

```python
from modelscope.metainfo import Preprocessors
from modelscope.preprocessors.builder import PREPROCESSORS
from modelscope.utils.constant import Fields

from myrclass import MyPreprocessorCls
PREPROCESSORS.register_module(Fields.nlp, module_name=Preprocessors.fill_mask, module_cls=MyPreprocessorCls)
```

Below is an example of using a preprocessor together with a model:

```python
from modelscope.preprocessors import Preprocessor
from modelscope.models import Model
# Specify the keys for two sentences in the parameters
preprocessor = Preprocessor.from_pretrained('damo/nlp_structbert_sentence-similarity_chinese-base', first_sequence='sent1', second_sequence='sent2')
model = Model.from_pretrained('damo/nlp_structbert_sentence-similarity_chinese-base')
data = preprocessor({'sent1': 'This product is very good', 'sent2': 'This product is excellent'})
print(data)
print(model(**data)) # AttentionTextClassificationModelOutput(logits=tensor([[-1.3232,  1.5160]], grad_fn=<AddmmBackward0>), loss=None, attentions=None, hidden_states=None)
```

Alternatively, you can directly instantiate the preprocessor:

```python
from modelscope.hub.snapshot_download import snapshot_download
from modelscope.preprocessors import TextClassificationTransformersPreprocessor
from modelscope.models.nlp import SbertForSequenceClassification
model_dir = snapshot_download('damo/nlp_structbert_sentence-similarity_chinese-base')
# Direct instantiation, where the registration mechanism doesn't take effect
preprocessor = TextClassificationTransformersPreprocessor(model_dir=model_dir, sequence_length=256)
model = SbertForSequenceClassification.from_pretrained(model_dir)
# Input as a tuple
data = preprocessor(('This product is very good', 'This product is excellent'))
print(data)
print(model(**data)) # AttentionTextClassificationModelOutput(logits=tensor([[-1.3232,  1.5160]], grad_fn=<AddmmBackward0>), loss=None, attentions=None, hidden_states=None)
```

[Note:] Models can be downloaded locally using the `snapshot_download` function, or any local model directory can be used instead of `model_dir`.

In the example above, the `TextClassificationTransformersPreprocessor` performs two main functions:
1. Extracts sentence 1 and sentence 2 from the complete input
2. Passes both sentences to the internal tokenizer and generates the data format suitable for model input

Different models and tasks use different preprocessors. You can choose to explore documentation based on your area of interest:

- For preprocessing used in inference and training across various tasks, refer to [Best Practices for Different Tasks](../best-practices-for-different-tasks/introduction-to-tasks.md)
- For specific usage of individual models, refer to [Model Cards in the Model Library](https://www.modelscope.ai/models)

# Writing a New Preprocessor

ModelScope supports users in writing new preprocessors. Below is the base preprocessor class that enables users to construct preprocessors through class instantiation or the `from_pretrained` method:

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

You can inherit from this class to write your own preprocessor:

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

This is a preprocessor that converts space-separated sentences into the standard format used for word segmentation tasks (a type of sequence labeling task). Users only need to implement their own `__call__` method.

To enable usage with `Preprocessor.from_pretrained`, add the `@PREPROCESSORS.register_module` decorator to the class, or alternatively use a direct registration call:

```python
PREPROCESSORS.register_module(
    'nlp',
    module_name='my-ws-preprocessor', module_cls=WordSegmentationBlankSetToLabelPreprocessor)
```

When using this class, you can call it as follows:

```python
preprocessor = WordSegmentationBlankSetToLabelPreprocessor(first_sequence='sentence', label='label')
print(preprocessor('We like watching movies'))
```