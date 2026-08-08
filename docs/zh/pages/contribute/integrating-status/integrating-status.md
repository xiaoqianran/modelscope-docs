<!-- modelscope-docs: 集成中及状态申诉 | contribute/integrating-status/integrating-status_CN.md -->

本篇文章介绍ModelScope模型集成中状态、如何去除集成中状态标签，以及如何申诉。
# 什么是集成中状态
暂未通过魔搭平台自动化集成测试的模型，开发者无法通过ModelScope Library正常使用该模型，需请模型贡献者尽快完成模型的集成开发
- ![image.png](./_resources/1679390981564-0d4b454e-33e0-4f26-8f76-71c744ed444c.png)

# 如何去除集成中状态标签
魔搭ModelScope Library最新版本SDK集成测试通过后，实时自动去掉集成中标签，无回滚机制。自动化的集成测试每隔一小时自动启动运行，**主要验证模型README.md中Python示例代码是否可正常运行（示例代码中必须包含pipeline推理代码）**
- README.md中Python示例代码举例：
  - 示例模型README文件：https://modelscope.cn/models/damo/nlp_structbert_word-segmentation_chinese-base/file/view/master/README.md
```python
#### 代码范例
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
print (result)
# {'output': '今天 天气 不错 ， 适合 出去 游玩'}
```

> **特别说明**：如果是NLP领域的一些标准backbone模型接入，例如bert、t5等（[完整支持的backbone列表](https://www.modelscope.cn/docs/%E5%BC%80%E5%8F%91%E6%A8%A1%E5%9E%8B%E7%AD%89%E7%BB%84%E4%BB%B6%E5%8F%8A%E6%8E%A8%E7%90%86%E6%B5%81%E7%A8%8B#%E6%94%AF%E6%8C%81%E7%9A%84backbone%EF%BC%88%E6%A8%A1%E5%9E%8B%EF%BC%89%20%E4%BB%A5%E5%8F%8A%20head%EF%BC%88%E4%BB%BB%E5%8A%A1%EF%BC%89))
，不需要依赖魔搭SDK的版本发布，自动化集成测试通过后即可自动去除集成中标签

# 如何申诉
若您对被标记为集成中状态的模型产生困扰，您可以邮件联系我们（contact@modelscope.cn），或加入我们的技术交流群（钉钉群群号：44837352），联系我们的官方工作人员。 

需要您提供以下信息：
-  模型名称：提供集成中模型的中文名或英文名
-  提供者：该模型的创建身份，以个人身份创建则填写用户名，以组织身份创建则填写组织名
-  备注：您可以填写认为集成中状态标记不合理的理由，并提供其他补充信息

