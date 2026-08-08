<!-- modelscope-docs: Using Flask to Build Model Services | sdk/tutorials/use-flask-for-model-service/use-flask-for-model-service_EN.md -->

# Using Flask to Build Simple Model Services

## Flask Introduction

Flask is an HTTP service framework for Python that allows you to lightweightly start an HTTP service. You can refer to Flask's documentation [here](https://flask.palletsprojects.com/en/2.3.x/quickstart/). In simple terms, starting a Flask service only requires three steps:

1. Install Flask:

```shell
pip install Flask
```

2. Create a new app.py file and add:

```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"
```

3. Run:

```shell
flask --app app run
```

After this, you can access the service through your browser.

## Combining Flask with Model Inference

When using deep learning model inference, you only need to construct the pipeline or model once, and then use the same pipeline for each subsequent inference without reconstructing it every time.

We'll use the simplest classification task as an example and provide a complete example.

Before running, please follow the [ModelScope installation guide](../../getting-started/environment-installation.md) to set up your environment, or directly use our official Docker image.

1. Write an app.py file with basic Flask code:

```python
from flask import Flask

app = Flask(__name__)

@app.route("/inference")
def inference():
    return "<p>Hello, World!</p>"
```

2. Import ModelScope's pipeline and modify the inference section:

```python
from flask import Flask, request
from modelscope import pipeline

app = Flask(__name__)
# Globally construct a pipeline
pipeline_ins = pipeline('text-classification', 'damo/nlp_structbert_sentence-similarity_chinese-tiny')

@app.route("/inference")
def inference():
    sent1 = request.args.get('sentence1')
    sent2 = request.args.get('sentence2')
    print(f'received sent1:{sent1}, sent2:{sent2}')
    # Use the same pipeline instance directly for each call
    output = pipeline_ins((sent1, sent2))
    return str(output)
```

3. Run:

```shell
flask --app app run
```

Now you can test the service:

```text
curl http://localhost:5000/inference\?sentence1="I%20am%20a%20bot"\&sentence2="I%20am%20not%20a%20bot"
```

Or call it using Python:

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

Below is a working script for serving LLaMA2:

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