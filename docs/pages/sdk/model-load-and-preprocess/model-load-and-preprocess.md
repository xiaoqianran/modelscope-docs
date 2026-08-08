<!-- modelscope-docs: Model Loading and Preprocessing | sdk/model-load-and-preprocess/model-load-and-preprocess_EN.md -->

# Loading Models

The recommended way to load ModelScope models is:

```py
from modelscope.models import Model
# Pass in the model ID or model directory
model = Model.from_pretrained('some model')
```

This method can load models for any framework supported by ModelScope (PyTorch, TensorFlow, etc.) and any task (such as image classification, sequence labeling, or backbone).

Important parameters for this method include:

```text
model_name_or_path: String type, local model path or ModelHub model ID
task: Additional task parameter, optional. When specified, it will not use the default task. For example, if the model's configuration.json specifies task='backbone', but you specify task='text-classification' here, it will attempt to load the checkpoint using the text-classification model.
kwargs: Any parameters for model construction can be passed in. These parameters will override the default parameters in the configuration file, e.g., Model.from_pretrained('some model', num_labels=2)
```

## Using Backbone

Users can use only the backbone to create a new model or write some experimental code:

```py
class MyModel(torch.nn.Module):

  def __init__(...):
    # Use only the backbone
    self.encoder = Model.from_pretrained('some-modelscope-backbone')
    self.head = SomeHead()

  def forward(...):
    ...
```

# Loading Preprocessors

The recommended way to load ModelScope preprocessors is:

```py
from modelscope.preprocessors import Preprocessor
# Pass in the model ID or model directory
preprocessor = Preprocessor.from_pretrained('some model')
```

Important parameters for this method include:

```text
model_name_or_path: String type, local model path or ModelHub model ID
kwargs: Any parameters for preprocessor construction can be passed in. These parameters will override the default parameters in the configuration file, e.g., Preprocessor.from_pretrained('some model', max_length=128)
```