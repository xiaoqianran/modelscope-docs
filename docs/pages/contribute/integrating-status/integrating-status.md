<!-- modelscope-docs: Integration in Progress and Status Appeals | contribute/integrating-status/integrating-status_EN.md -->

This article introduces the "Integration in Progress" status on ModelScope, how to remove the "Integration in Progress" status label, and how to appeal.

# What is Integration in Progress Status
Models that have not yet passed ModelScope platform's automated integration tests cannot be used normally by developers through the ModelScope Library. Model contributors are requested to complete model integration development as soon as possible.
- ![image.png](./_resources/1679390981564-0d4b454e-33e0-4f26-8f76-71c744ed444c.png)

# How to Remove Integration in Progress Status Label
After passing the automated integration test with the latest version of ModelScope Library SDK, the "Integration in Progress" label is automatically removed in real-time, with no rollback mechanism. The automated integration test runs automatically every hour, **primarily verifying whether the Python example code in the model's README.md can run normally (the example code must include pipeline inference code)**.

- Python example code in README.md:
  - Example model README file: https://modelscope.cn/models/damo/nlp_structbert_word-segmentation_chinese-base/file/view/master/README.md

```python
from modelscope.models import Model
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.preprocessors import TokenClassificationTransformersPreprocessor

model_id = 'damo/nlp_structbert_word-segmentation_chinese-base'
model = Model.from_pretrained(model_id)
tokenizer = TokenClassificationTransformersPreprocessor(model.model_dir)
pipeline_ins = pipeline(task=Tasks.word_segmentation, model=model, preprocessor=tokenizer)
result = pipeline_ins(input="今天天气不错，适合出去游玩")
print(result)
# {'output': '今天 天气 不错 ， 适合 出去 游玩'}
```

> **Special Note**: For standard NLP backbone models such as BERT, T5, etc. ([complete list of supported backbones](https://www.modelscope.cn/docs/%E5%BC%80%E5%8F%91%E6%A8%A1%E5%9E%8B%E7%AD%89%E7%BB%84%E4%BB%B6%E5%8F%8A%E6%8E%A8%E7%90%86%E6%B5%81%E7%A8%8B#%E6%94%AF%E6%8C%81%E7%9A%84backbone%EF%BC%88%E6%A8%A1%E5%9E%8B%EF%BC%89%20%E4%BB%A5%E5%8F%8A%20head%EF%BC%88%E4%BB%BB%E5%8A%A1%EF%BC%89)), there is no dependency on ModelScope SDK version releases. Once the automated integration test passes, the "Integration in Progress" label will be automatically removed.

# How to Appeal
If you are concerned about your model being marked with "Integration in Progress" status, you can email us (contact@modelscope.cn) or join our technical discussion group (DingTalk group number: 44837352) to contact our official staff.

You need to provide the following information:
- Model Name: Provide the Chinese or English name of the model with "Integration in Progress" status
- Provider: The identity that created the model - if created as an individual, provide the username; if created as an organization, provide the organization name
- Remarks: You can explain why you believe the "Integration in Progress" status marking is unreasonable and provide any additional supplementary information