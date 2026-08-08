<!-- modelscope-docs: 模型的版本 | models/version/version_CN.md -->

本篇文章介绍如何ModelScope模型的版本管理。

# 使用Library下载模型
为了确保ModelScope Library和模型版本兼容性，模型必须提供版本(git tag)。
## 设置模型版本
模型必须有版本才能使用，我们通过git tag来作为模型的版本，您需要为模型打tag
### 通过页面设置模型版本
您可以通过www.modelscope.cn模型管理页面设置版本。  
![截图](./_resources/model_version.png)

### 通过git设置模型版本
```shell
git tag v1.0.0 -m "version comments"
git push origin v1.0.0
# v1.0.0您可以自行定义
```

### 使用Python SDK定义模型版本
```python
from modelscope.hub.api import HubApi
from modelscope.hub.repository import Repository

YOUR_ACCESS_TOKEN = '请从 ModelScope个人中心->访问令牌 页面获取SDK访问令牌'
# 请注意ModelScope平台针对SDK访问和git访问两种模式，提供两种不同的访问令牌(token)。此处请使用SDK访问令牌。
api = HubApi()
api.login(YOUR_ACCESS_TOKEN)
model_dir='YOUR_MODEL_PATH'
repo = Repository(model_dir, clone_from=model_id)
repo.tag_and_push('v1.0.0', 'Test revision')
```

## 默认版本
 对于pipeline等接口未指定版本，会取当前使用的ModelScope Library的发布日期前最新的模型版本。

## 版本升级
   ModelScope Library发布日期前最新版本经过测试，后续模型版本可以通过版本号指定，您需要确保library和模型版本匹配，您的服务功能正常。
### 如何获取发布时间
```
import modelscope
print(modelscope.version.__release_datetime__)
```
### pipeline使用
```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

ner_pipeline = pipeline(Tasks.named_entity_recognition, 'damo/nlp_xlmr_named-entity-recognition_viet-ecommerce-title', model_revision='v1.0.1') # 通过model_revision指定版本
result = ner_pipeline('Nón vành dễ thương cho bé gái')

print(result)
```
### pretrained model
```python
from modelscope.models import Model

model = Model.from_pretrained('damo/nlp_xlmr_named-entity-recognition_viet-ecommerce-title', revision='v1.0.1') # 通过revision指定版本
```