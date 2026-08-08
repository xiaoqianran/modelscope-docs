<!-- modelscope-docs: API Inference Introduction | model-service/API-Inference/intro/intro_EN.md -->

# API Inference Introduction

## Overview
ModelScope provides API-Inference to serve open-source models through standardized API interfaces, enabling developers to experience open-source models in a lightweight and efficient manner and integrate them into various AI applications for creative experimentation, including combining with tools to build diverse AI application prototypes.

> [!NOTE]
> For specific usage quotas, please refer to the [**Usage Limits**](../../../model-service/API-Inference/limits/limits_EN.md) documentation. If you require high concurrency and large quotas, consider using the [API-Provider](./API-Provider-introduction) capability to bind external API providers. We welcome feedback from developers [here](../../contact-us/contact-us.md).

## Prerequisites: Create an Account and Obtain Token
API-Inference is provided free of charge to registered ModelScope users. Please log in to obtain your dedicated access token. For details, refer to the documentation on [account registration and login](../../account-management-and-organizations/account-registration-and-login.md) and [token management](../../account-management-and-organizations/access-tokens.md).
![img.png](./_resources/token.png)
Note: After account registration, you must [bind your Alibaba Cloud account](../../account-management-and-organizations/alibaba-cloud-account-binding-and-authorization-tutorial.md) and complete [**real-name verification**](https://help.aliyun.com/zh/account/real-name-authentication) before using API-Inference.

## Usage Methods

### Large Language Models (LLM)
ModelScope's API-Inference currently provides OpenAI API-compatible interfaces for large language models. Before using LLM model APIs, please install the OpenAI SDK first:
```commandline
pip install openai
```
> [!NOTE]
> Support for other popular interfaces is being added gradually, such as the [Anthropic API](https://docs.anthropic.com/en/api). See the "Large Language Models LLM (Anthropic API Compatible Interface)" section below.

After installation, you can use standard OpenAI calling methods. Specific calling methods are provided in the API-Inference examples on the right side of each model page. **Please refer to the API-Inference sample code on the model page as the authoritative source**, especially for reasoning models, as their calling methods may have subtle differences from standard LLMs. The following example is for reference only.
> [!NOTE]
> Please note that model names in this documentation are for demonstration purposes only. Over time, as new models are launched, older models may be deprecated and no longer supported. To ensure your API calls work properly, please configure a currently supported model ID.

```python
from openai import OpenAI

client = OpenAI(
    api_key="MODELSCOPE_ACCESS_TOKEN", # Please replace with your ModelScope Access Token
    base_url="https://api-inference.modelscope.cn/v1/"
)


response = client.chat.completions.create(
    model="Qwen/Qwen3.5-35B-A3B", # ModelScope Model-Id
    messages=[
        {
            'role': 'system',
            'content': 'You are a helpful assistant.'
        },
        {
            'role': 'user',
            'content': 'Write quicksort in Python'
        }
    ],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content, end='', flush=True)
```

In this example, when using ModelScope's API-Inference, there are several adaptations needed:
- base url: Points to ModelScope API-Inference service `https://api-inference.modelscope.cn/v1/`.
- api_key: Uses ModelScope's access token, which can be obtained from your ModelScope account: https://modelscope.cn/my/myaccesstoken.
- model name (model): Uses the Model ID of open-source models on ModelScope, such as `Qwen/Qwen2.5-Coder-32B-Instruct`.

### Large Language Models LLM (Anthropic API Compatible Interface)
For LLM models, API-Inference also supports Anthropic API-compatible calling methods. To use Anthropic mode, please install the Anthropic SDK before use:
```commandline
pip install anthropic
```
> [!IMPORTANT]
> The Anthropic API-compatible calling method is currently in beta testing. If you encounter any issues during use, please contact us [here](../../contact-us/contact-us.md).

After installing the Anthropic SDK, you can make calls as shown in the following examples.

#### Streaming Call
```python
import anthropic

client = anthropic.Anthropic(
    api_key="MODELSCOPE_ACCESS_TOKEN", # Please replace with your ModelScope Access Token
    base_url="https://api-inference.modelscope.cn")

with client.messages.stream(
    model="Qwen/Qwen3.5-35B-A3B", # ModelScope Model-Id
    messages=[
        {"role": "user", "content": "write a python quicksort"}
    ],
    max_tokens = 1024
) as stream:
  for text in stream.text_stream:
      print(text, end="", flush=True)
```
#### Non-streaming Call
```python
import anthropic

client = anthropic.Anthropic(
    api_key="MODELSCOPE_ACCESS_TOKEN", # Please replace with your ModelScope Access Token
    base_url="https://api-inference.modelscope.cn")

message = client.messages.create(
    model="Qwen/Qwen3.5-35B-A3B", # ModelScope Model-Id
    messages=[
        {"role": "user", "content": "write a python quicksort"}
    ],
    max_tokens = 1024
)
print(message.content[0].text)
```

In this example, when using ModelScope's API-Inference, there are several adaptations needed:
- base url: Points to ModelScope API-Inference service `https://api-inference.modelscope.cn`.
- api_key: Uses ModelScope's access token, which can be obtained from your ModelScope account: https://modelscope.cn/my/myaccesstoken.
- model name (model): Uses the Model ID of open-source models on ModelScope, such as `Qwen/Qwen2.5-Coder-32B-Instruct`.

For more information about Anthropic API interface usage and parameters, please refer to the [Anthropic API official documentation](https://docs.anthropic.com/en/api).

### Base64 Local Image Encoding Utility Function

For models with visual understanding capabilities (such as Qwen2.5-VL and other specialized VL models, as well as integrated models like Qwen3.5 that support vision) and image editing models, if you need to use local images instead of online URLs, you can use the following utility function to convert local images to Base64 encoding:

```python
import os
import mimetypes
import base64

def image_to_data_url(image_path):
    if not os.path.isfile(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")

    with open(image_path, "rb") as f:
        image_data = f.read()

    mime_type, _ = mimetypes.guess_type(image_path)

    if mime_type is None or not mime_type.startswith('image/'):
        mime_type = 'image/png'

    base64_encoded = base64.b64encode(image_data).decode('utf-8')
    return f"data:{mime_type};base64,{base64_encoded}"
```

This function will be used in both the **Vision Models** and **AIGC Models** sections below.

### Vision Models
For visual understanding scenarios, you can also make calls through the OpenAI API, for example:

```python
from openai import OpenAI

client = OpenAI(
    base_url='https://api-inference.modelscope.cn/v1',
    api_key='MODELSCOPE_ACCESS_TOKEN', # Please replace with your ModelScope Access Token
)

response = client.chat.completions.create(
    model='Qwen/Qwen3.5-35B-A3B', # ModelScope Model-Id, required
    messages=[{
        'role':
            'user',
        'content': [{
            'type': 'text',
            'text': 'Describe this image',
        }, {
            'type': 'image_url',
            'image_url': {
                'url':
                    'https://modelscope.oss-cn-beijing.aliyuncs.com/demo/images/audrey_hepburn.jpg',
            },
        }],
    }],
    stream=True
)

for chunk in response:
    if chunk.choices:
        print(chunk.choices[0].delta.content, end='', flush=True)
```

Models with visual understanding capabilities (such as Qwen2.5-VL and other specialized VL models, as well as integrated models like Qwen3.5 that support vision) all support passing local images via Base64 encoding. Simply use the [`image_to_data_url`](#base64-local-image-encoding-utility-function) function above and replace the URL in `image_url` with the return value of this function:

```python
        'content': [{
            'type': 'text',
            'text': 'Describe this image',
        }, {
            'type': 'image_url',
            'image_url': {
                'url': image_to_data_url('path/to/local/image.jpg'),
            },
        }],
```
### AIGC Models
The list of models supporting API calls can be searched on the [AIGC Models](https://www.modelscope.cn/aigc/models) page.
An example API call is as follows:
```python
import requests
import time
import json
from PIL import Image
from io import BytesIO

base_url = 'https://api-inference.modelscope.cn/'
api_key = "<MODELSCOPE_SDK_TOKEN>"

common_headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
}

response = requests.post(
    f"{base_url}v1/images/generations",
    headers={**common_headers, "X-ModelScope-Async-Mode": "true"},
    data=json.dumps({
        "model": "Qwen/Qwen-Image",
        # "loras": "<lora-repo-id>", # optional lora(s)
        """
        LoRA(s) Configuration:
        - for Single LoRA:
        "loras": "<lora-repo-id>"
        - for Multiple LoRAs:
        "loras": {"<lora-repo-id1>": 0.6, "<lora-repo-id2>": 0.4}
        - Upto 6 LoRAs, all weight-coeffients must sum to 1.0
        """
        "prompt": "A golden cat"
    }, ensure_ascii=False).encode('utf-8')
)


response.raise_for_status()
task_id = response.json()["task_id"]

while True:
    result = requests.get(
        f"{base_url}v1/tasks/{task_id}",
        headers={**common_headers, "X-ModelScope-Task-Type": "image_generation"},
    )
    result.raise_for_status()
    data = result.json()

    if data["task_status"] == "SUCCEED":
        image = Image.open(BytesIO(requests.get(data["output_images"][0]).content))
        image.save("result_image.jpg")
        break
    elif data["task_status"] == "FAILED":
        print("Image Generation Failed.")
        break

    time.sleep(5)
```
#### Base64 Image Input Support

For image editing models, it's recommended to use online hosted image URLs for input. If you need to use local files, you can use the [`image_to_data_url`](#base64-local-image-encoding-utility-function) function above to Base64 encode local images and pass the encoded data as `image_url` to the model. A typical calling method is:
```python
        # input as base64
        "image_url": [
           image_to_data_url("path/to/local/image.jpg")
        ]
```
Additional Parameter Descriptions
<table>
<tr>
<td>Parameter Name</td>
<td style="min-width: 100px;">Parameter Description</td>
<td style="min-width: 100px;">Required</td>
<td>Parameter Type</td>
<td>Example</td>
<td>Value Range</td>
</tr>
<tr>
<td>model</td>
<td>Model ID</td>
<td>Yes</td>
<td>string</td>
<td>MAILAND/majicflus_v1</td>
<td>AIGC Model ID on ModelScope</td>
</tr>
<tr>
<td>prompt</td>
<td>Positive prompt. Most models work better with English prompts.</td>
<td>Yes</td>
<td>string</td>
<td>A mysterious girl walking down the corridor.</td>
<td>Length less than 2000</td>
</tr>
<tr>
<td>negative_prompt</td>
<td>Negative prompt</td>
<td>No</td>
<td>string</td>
<td>lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry</td>
<td>Length less than 2000</td>
</tr>
<tr>
<td>size</td>
<td>Generated image resolution</td>
<td>No</td>
<td>string</td>
<td>1024x1024</td>
<td>Resolution range:<br>SD series: [64x64,2048x2048], FLUX: [64x64,1024x1024], Qwen-Image: [64x64,1664x1664], Z-Image-Turbo: [512x512, 2048x2048]</td>
</tr>
<tr>
<td>seed</td>
<td>Random seed</td>
<td>No</td>
<td>int</td>
<td>12345</td>
<td>[0,2^31-1]</td>
</tr>
<tr>
<td>steps</td>
<td>Sampling steps</td>
<td>No</td>
<td>int</td>
<td>30</td>
<td>[1,100]</td>
</tr>
<tr>
<td>guidance</td>
<td>Prompt guidance coefficient</td>
<td>No</td>
<td>float</td>
<td>3.5</td>
<td>[1.5,20]</td>
</tr>
<tr>
<td>image_url</td>
<td>URL address of the image to be edited (or Base64 encoded data). This parameter only applies to models that support image editing.</td>
<td>No</td>
<td>string</td>
<td>https://resources.modelscope.cn/aigc/image_edit.png</td>
<td>Ensure publicly accessible (or Base64 encoded data)</td>
</tr>
<tr>
<td>loras</td>
<td>LoRA models for style transfer or detail enhancement. Please search for LoRA models compatible with the base model in ModelScope's <a href="https://modelscope.cn/aigc/models" target="_blank">AIGC Zone Model Library</a></td>
<td>No</td>
<td>string | dict</td>
<td>
Single LoRA: "&lt;lora-repo-id&gt;"<br>
Multiple LoRAs: {"&lt;lora-repo-id1&gt;": 0.6, "&lt;lora-repo-id2&gt;": 0.4}
</td>
<td>Total weight of multiple LoRAs must sum to 1.0, up to 6 LoRAs</td>
</tr>
</table>