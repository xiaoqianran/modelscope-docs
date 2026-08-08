<!-- modelscope-docs: Model Versions | models/version/version_EN.md -->

This article introduces how to manage ModelScope model versions.

# Download Models Using the Library
To ensure compatibility between the ModelScope Library and model versions, models must provide a version (git tag).

## Setting Model Versions
Models must have a version to be usable. We use git tags as model versions, and you need to tag your models.

### Setting Model Versions via Web Interface
You can set versions through the modelscope.ai model management page.
![Screenshot](./_resources/model_version.png)

### Setting Model Versions via Git
```shell
git tag v1.0.0 -m "version comments"
git push origin v1.0.0
# You can define v1.0.0 as needed
```

### Defining Model Versions Using Python SDK
```python
from modelscope.hub.api import HubApi
from modelscope.hub.repository import Repository

YOUR_ACCESS_TOKEN = 'Please obtain the SDK access token from ModelScope Personal Center -> Access Tokens page'
# Note: ModelScope platform provides two different access tokens for SDK access and git access modes. Please use the SDK access token here.
api = HubApi()
api.login(YOUR_ACCESS_TOKEN)
model_dir='YOUR_MODEL_PATH'
repo = Repository(model_dir, clone_from=model_id)
repo.tag_and_push('v1.0.0', 'Test revision')
```

## Default Version
For interfaces like pipeline that don't specify a version, the latest model version released before the current ModelScope Library's release date will be used.

## Version Upgrades
The latest model version released before the ModelScope Library's release date has been tested. Subsequent model versions can be specified by version number. You need to ensure compatibility between the library and model versions for your service functionality to work properly.

### How to Get Release Date
```
import modelscope
print(modelscope.version.__release_datetime__)
```

### Pipeline Usage
```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

ner_pipeline = pipeline(Tasks.named_entity_recognition, 'damo/nlp_xlmr_named-entity-recognition_viet-ecommerce-title', model_revision='v1.0.1') # Specify version via model_revision
result = ner_pipeline('Nón vành dễ thương cho bé gái')

print(result)
```

### Pretrained Model
```python
from modelscope.models import Model

model = Model.from_pretrained('damo/nlp_xlmr_named-entity-recognition_viet-ecommerce-title', revision='v1.0.1') # Specify version via revision
```