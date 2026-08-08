<!-- modelscope-docs: Code Documentation Standards | contribute/code-based-integration/tutorials/docstr/docstr_EN.md -->

# Code Documentation (docstr) Standards

## Code Documentation Style

ModelScope code documentation uses [Google Style](https://sphinxcontrib-napoleon.readthedocs.io/en/latest/example_google.html).

## Model Documentation

- Model Class: Model introduction, paper URL, preprocessor type, trainer type, parameter list

```text
r"""Bert Model transformer with a text classification/regression head on top
    (a linear layer on top of the pooled output) e.g. for GLUE tasks.

    This model inherits from :class:`~transformers.PreTrainedModel`. Check the superclass documentation for the generic
    methods the library implements for all its model (such as downloading or saving, resizing the input embeddings,
    pruning heads etc.)

    This model is also a PyTorch `torch.nn.Module <https://pytorch.org/docs/stable/nn.html#torch.nn.Module>`__
    subclass. Use it as a regular PyTorch Module and refer to the PyTorch documentation for all matter related to
    general usage and behavior.

    Preprocessor:
        This is the text classification/regression model of Bert, the preprocessor of this model
        is `modelscope.preprocessors.TextClassificationTransformersPreprocessor`.

    Trainer:
        This is a PyTorch model, and can be trained by variable trainers, like EpochBasedTrainer,
        or trainers from other frameworks.
        The preferred trainer in ModelScope is EpochBasedTrainer.

    Parameters:
        config (:class:`~modelscope.models.nlp.bert.SbertConfig`): Model configuration class with
            all the parameters of the model.
            Initializing with a config file does not load the weights associated with the model, only the
            configuration. Check out the :meth:`~transformers.PreTrainedModel.from_pretrained` method to load the model
            weights.
    """
```

- Model Methods: Important externally available model methods (such as forward, postprocess) should provide docstr, including method functionality description, parameter names, return values, and examples

```text
r"""The forward function of the model.

Args:
input_ids (:obj:`torch.LongTensor` of shape :obj:`(batch_size, sequence_length)`):
    Indices of input sequence tokens in the vocabulary.

    Indices can be obtained using :class:`~modelscope.models.nlp.structbert.SbertTokenizer`. See
    :meth:`transformers.PreTrainedTokenizer.encode` and :meth:`transformers.PreTrainedTokenizer.__call__` for
    details.

attention_mask (:obj:`torch.FloatTensor` of shape :obj:`(batch_size, sequence_length)`, `optional`):
    Mask to avoid performing attention on padding token indices. Mask values selected in ``[0, 1]``:

    - 1 for tokens that are **not masked**,
    - 0 for tokens that are **masked**.

token_type_ids (:obj:`torch.LongTensor` of shape :obj:`(batch_size, sequence_length)`, `optional`):
    Segment token indices to indicate first and second portions of the inputs. Indices are selected in ``[0,
    1]``:

    - 0 corresponds to a `sentence A` token,
    - 1 corresponds to a `sentence B` token.

position_ids (:obj:`torch.LongTensor` of shape :obj:`(batch_size, sequence_length)`, `optional`):
    Indices of positions of each input sequence tokens in the position embeddings. Selected in the range ``[0,
    config.max_position_embeddings - 1]``.

head_mask (:obj:`torch.FloatTensor` of shape :obj:`(num_heads,)` or :obj:`(num_layers, num_heads)`, `optional`):
    Mask to nullify selected heads of the self-attention modules. Mask values selected in ``[0, 1]``:

    - 1 indicates the head is **not masked**,
    - 0 indicates the head is **masked**.

inputs_embeds (:obj:`torch.FloatTensor` of shape :obj:`(batch_size, sequence_length, hidden_size)`, `optional`):
    Optionally, instead of passing :obj:`input_ids` you can choose to directly pass an embedded representation.
    This is useful if you want more control over how to convert :obj:`input_ids` indices into associated
    vectors than the model's internal embedding lookup matrix.
output_attentions (:obj:`bool`, `optional`):
    Whether or not to return the attentions tensors of all attention layers. See ``attentions`` under returned
    tensors for more detail.
output_hidden_states (:obj:`bool`, `optional`):
    Whether or not to return the hidden states of all layers. See ``hidden_states`` under returned tensors for
    more detail.
return_dict (:obj:`bool`, `optional`):
    Whether or not to return a :class:`~transformers.ModelOutput` instead of a plain tuple.
labels (:obj:`torch.LongTensor` of shape :obj:`(batch_size,)`, `optional`):
    Labels for computing the sequence classification/regression loss. Indices should be in :obj:`[0, ...,
    config.num_labels - 1]`. If :obj:`config.num_labels == 1` a regression loss is computed (Mean-Square loss),
    If :obj:`config.num_labels > 1` a classification loss is computed (Cross-Entropy).

Returns:
    Returns `modelscope.outputs.AttentionTextClassificationModelOutput`

Examples:
    >>> from modelscope.models import Model
    >>> from modelscope.preprocessors import Preprocessor
    >>> model = Model.from_pretrained('damo/nlp_structbert_sentence-similarity_chinese-base')
    >>> preprocessor = Preprocessor.from_pretrained('damo/nlp_structbert_sentence-similarity_chinese-base')
    >>> print(model(**preprocessor(('This is a test', 'This is also a test'))))
"""
```

## Preprocessor Documentation

- Preprocessor Class: Preprocessor introduction, parameter list

```text
r"""The tokenizer preprocessor used in text classification task for transformers models.

Args:
    use_fast: Whether to use the fast tokenizer or not.
    max_length: The max sequence length which the model supported,
        will be passed into tokenizer as the 'max_length' param.
    **kwargs: Extra args input into the tokenizer's __call__ method.
"""
```

- Preprocessor __call__ Method: Parameter list, return value

```text
r"""Process the raw input data

Args:
    data (Union[str, Tuple, Dict]): The input data
Returns:
    Dict[str, Any]: The preprocessed data
"""
```

## Pipeline Documentation

- Pipeline Class: Task type, applicable model conditions (model output values, etc.), constructor parameters, usage examples

```text
r"""The inference pipeline for all the text classification sub-tasks.

The model should have an output of `TextClassificationModelOutput` or a dict with a `logit` key.

Args:
    model (`str` or `Model` or module instance): A model instance or a model local dir
        or a model id in the model hub.
    preprocessor (`Preprocessor`, `optional`): A Preprocessor instance.
    kwargs (dict, `optional`):
        Extra kwargs passed into the preprocessor's constructor.

Examples:
    >>> from modelscope.pipelines import pipeline
    >>> pipeline_ins = pipeline('text-classification',
        model='damo/nlp_structbert_sentence-similarity_chinese-base')
    >>> input = ('这是个测试', '这也是个测试')
    >>> print(pipeline_ins(input))
"""
```

- Pipeline Methods: Important methods should provide parameter lists, return values, and calling examples

## Other Component Documentation

- Provide parameter lists, return values, and functional descriptions of classes (or methods). Include examples for user-sensitive important components