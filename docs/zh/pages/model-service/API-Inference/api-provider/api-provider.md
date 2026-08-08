<!-- modelscope-docs: API-Provider介绍 | model-service/API-Inference/api-provider/api-provider_CN.md -->

# API-Provider介绍

魔搭通过API-Inference，提供免费的API调用服务，免费服务的目的在于为广大开发者提供免费试用和评估的接口。同时为了支持实际中存在大并发以及高SLA的需求，
平台也支持通过同样的兼容接口，实现外部API提供方的引入，以下简称API-Provider调用。
## 使用方式
您可以通过个人中心-[API-Inference提供方设置页](https://modelscope.cn/my/accountsettings/api-providers)进行配置。
<div align=center><img height="500" src="./_resources/api-provider-list.png" /></div>


点击"托管密钥"，即可配置对应提供方的API密钥。具体外部API提供方的试用方式，可参考提供方的文档说明。

<div align=center><img height="300" src="./_resources/api-provider-key.png" /></div>

>[!IMPORTANT]
>为了保障托管API密钥的安全，平台会对API密钥做加密存储。托管密钥在设置后，无法再通过平台进行明文查看。
>如有需要，您可以随时对密钥进行更新和删除。


在配置完相关外部提供方的密钥托管后，您可以在模型详情页的API-Inference板块，选择对应的API提供方，并查看具体API的调用方式
<div align=center><img height="500" src="./_resources/api-provider-example.png" /></div>

>[!IMPORTANT]
> 使用外部API提供方，与使用魔搭平台免费 API-Inference 的调用方式，保持整体一致。具体代码中依然通过魔搭的平台Token
> 来进行鉴权。唯一区别在于您需要在模型ID上，带上外部提供方的名字（如DashScope、DeepSeek等等）。


这里以 [Qwen/Qwen3-1.7B](https://modelscope.cn/models/Qwen/Qwen3-1.7B) 模型为例，提供一个调用代码范例。具体到每个模型，可参考**模型页面右侧的示例详情**。
```python
from openai import OpenAI

client = OpenAI(
    base_url='https://api-inference.modelscope.cn/v1',
    api_key='<your_modelscope_token>', # ModelScope Token
)

response = client.chat.completions.create(
    model='Qwen/Qwen3-1.7B:DashScope', # ModelScope Model-Id + API Provider Name
    messages=[
        {
          'role': 'user',
          'content': '9.9和9.11谁大'
        }
    ],
    stream=True)

done_thinking = False
for chunk in response:
    if chunk.choices:
        thinking_chunk = chunk.choices[0].delta.reasoning_content
        answer_chunk = chunk.choices[0].delta.content
        if thinking_chunk != '':
            print(thinking_chunk, end='', flush=True)
        elif answer_chunk != '':
            if not done_thinking:
                print('\n\n === Final Answer ===\n')
                done_thinking = True
            print(answer_chunk, end='', flush=True)
```

## 使用限制与说明
- 要求您的ModelScope账号必须首先[绑定阿里云账号](../../账号管理与组织/阿里云账号绑定与授权教程.md)。
- 使用外部API提供方（API-Provider）的时候，将不再受到平台对于**免费**API-Inference的[流控限制](API-Inference使用限制.md)。
- 平台对 API-Provider 调用方式，**不进行任何计费**。具体涉及外部提供方的计费标准，请以实际提供方的产品文档为准。

未来，平台会积极推动更多API-Provider接入，敬请期待，✌️。





