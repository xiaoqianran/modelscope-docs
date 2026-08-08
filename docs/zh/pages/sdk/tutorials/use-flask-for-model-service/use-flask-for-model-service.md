<!-- modelscope-docs: 使用Flask搭建模型服务 | sdk/tutorials/use-flask-for-model-service/use-flask-for-model-service_CN.md -->

# 使用Flask搭建简单的模型服务

## Flask介绍

Flask是Python语言下的Http服务框架，您可以使用该框架轻量级地启动一个Http服务。Flask的使用文档可以参考[这里](https://flask.palletsprojects.com/en/2.3.x/quickstart/)。简单来说，启动一个Flask服务只需要三步：

1. 安装Flask：

```shell
pip install Flask
```

2. 新建一个app.py并写入：

```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"
```

3. 运行：

```shell
flask --app app run
```

之后您就可以通过浏览器访问该服务了。

## 将Flask和模型推理结合

使用深度学习模型的推理时，您只需要构造pipeline或模型一次，之后每次推理时使用相同的pipeline即可，不需要每次都构造pipeline。

我们以最简单的分类任务为例，给出一个完整的例子。

运行之前，请先按照[ModelScope的安装教程](../../快速入门/环境安装.md)进行环境安装，或直接使用我们的官方镜像。

1. 编写一个app.py，写入flask的基本代码：

```python
from flask import Flask

app = Flask(__name__)

@app.route("/inference")
def inference():
    return "<p>Hello, World!</p>"
```

2. 引入modelscope的pipeline，并修改inference部分的代码：

```python
from flask import Flask, request
from modelscope import pipeline

app = Flask(__name__)
# 全局构建一个pipeline
pipeline_ins = pipeline('text-classification', 'damo/nlp_structbert_sentence-similarity_chinese-tiny')

@app.route("/inference")
def inference():
    sent1 = request.args.get('sentence1')
    sent2 = request.args.get('sentence2')
    print(f'received sent1:{sent1}, sent2:{sent2}')
    # 每次使用相同的pipeline instance直接调用
    output = pipeline_ins((sent1, sent2))
    return str(output)
```

3. 运行：

```shell
flask --app app run
```

接下来就可以访问测试了：

```text
curl http://localhost:5000/inference\?sentence1="I%20am%20a%20bot"\&sentence2="I%20am%20not%20a%20bot"
```

或者使用python调用：

```python
import requests

url = "http://localhost:5000/inference"
params = {
    "sentence1": "I am a bot",
    "sentence2": "I am not a bot"
}

response = requests.get(url, params=params)

if response.status_code == 200:
    print(response.content.decode('utf-8'))
else:
    print(f"Request failed with status code: {response.status_code}")
```

下面给出一个使用LLaMA2进行服务的可用脚本：

```python
from flask import Flask, request
import torch
from modelscope import snapshot_download, Model
from modelscope.models.nlp.llama2 import Llama2Tokenizer

model_dir = snapshot_download("modelscope/Llama-2-7b-ms", revision='v1.0.1', 
                              ignore_file_pattern = [r'\w+\.safetensors'])
model = Model.from_pretrained(model_dir, device_map='auto', torch_dtype=torch.float16)
tokenizer = Llama2Tokenizer.from_pretrained(model_dir)

app = Flask(__name__)

@app.route("/inference")
def inference():
    prompt = request.args.get('prompt')
    sent2 = request.args.get('sentence2')
    print(f'received prompt:{prompt}')
    inputs = tokenizer(prompt, return_tensors="pt")
    generate_ids = model.generate(inputs.input_ids, max_length=30)
    return str(tokenizer.batch_decode(generate_ids, skip_special_tokens=True, clean_up_tokenization_spaces=False)[0])
```
