<!-- modelscope-docs: 模型加载和预处理 | sdk/model-load-and-preprocess/model-load-and-preprocess_CN.md -->

# 加载模型

ModelScope模型的推荐加载方式是：

```py
from modelscope.models import Model
# 传入模型id或模型目录
model = Model.from_pretrained('some model')
```

该方法可以加载ModelScope支持的任意框架（PyTorch、TensorFlow等）任意任务（如图像分类、序列标注或者backbone）的模型。

该方法的重要参数有：

```text
model_name_or_path: 字符串类型，本地模型路径或ModelHub的模型id
task: 额外的task参数，可选，指定后不会使用默认的task，比如模型configuration.json中指定了task='backbone'，在此指定task='text-classification'，则会尝试使用text-classification模型加载checkpoint
kwargs: 可以传入模型构造的任意参数，这些参数都会覆盖配置文件中的默认参数，如Model.from_pretrained('some model', num_labels=2)
```

## 使用backbone

用户可以只使用backbone来自创建一个新模型或编写一些实验代码：

```py
class MyModel(torch.nn.Module):
  
  def __init__(...):
    # 仅使用backbone
    self.encoder = Model.from_pretrained('some-modelscope-backbone')
    self.head = SomeHead()
   
  def forward(...):
    ...
```

# 加载预处理器

ModelScope预处理器的推荐加载方式是：

```py
from modelscope.preprocessors import Preprocessor
# 传入模型id或模型目录
preprocessor = Preprocessor.from_pretrained('some model')
```

该方法的重要参数有：

```text
model_name_or_path: 字符串类型，本地模型路径或ModelHub的模型id
kwargs: 可以传入预处理器构造的任意参数，这些参数都会覆盖配置文件中的默认参数，如Preprocessor.from_pretrained('some model', max_length=128)
```

