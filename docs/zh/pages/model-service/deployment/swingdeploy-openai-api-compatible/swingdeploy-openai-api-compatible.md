<!-- modelscope-docs: 部署OpenAI-API兼容模型服务 | model-service/deployment/swingdeploy-openai-api-compatible/swingdeploy-openai-api-compatible_CN.md -->

# 概要
SwingDeploy是魔搭社区推出的模型一键部署服务，支持将魔搭上的各种（包括语音，视频，NLP等不同领域）模型直接部署到用户指定的云资源上，包括函数计算（FC）、模型在线服务（PAI-EAS）、边缘节点服务（ENS）等。

鉴于在LLM领域，OpenAI API接口的便利性，以及大模型领域高效推理框架（包括Ollama+llama.cpp，vLLM，LMDeploy, SGLang等）的迅速发展，魔搭的SwingDeploy服务也集成了能够**提供OpenAI API兼容的的通用化部署方案**。

# 前提条件：账号绑定与授权
目前社区为OpenAI API兼容部署方案提供了免费试用额度，同时也支持用户使用自己的个人云资源，这两者在进行模型部署之前，需要进行必要的账号绑定和授权准备工作：

 **步骤1. 完成阿里云账号绑定**

 您需要先登录[魔搭社区](https://www.modelscope.cn/)，并按指引完成[阿里云账号绑定](./账号管理与组织/阿里云账号绑定与授权教程.md)<br>
    <img src="./_resources/account.png" alt="image" width="600"><br>


**步骤2. 开通并授权云服务**

如您需要使用自己的个人云资源，需要完成对应的云服务授权：

进入[模型服务](https://www.modelscope.cn/my/modelService/deploy?page=1&type=personal-fc)页面，按指引完成对应个人云服务的完整授权，具体步骤和成功授权结果如下所示：<br>
  <img src="./_resources/auth.png" alt="image" width="600"><br>



# 模型部署流程

1. **模型选择**：在部署服务页面点击新建部署，选择您想要部署的模型 <br>
    <img src="./_resources/model_selection.png" alt="image" width="600"><br>
2. **框架与资源选择**：根据具体业务场景需求，选择合适的框架与云资源类型 <br>
    <img src="./_resources/resource_selection.png" alt="image" width="600"><br>
3. **一键部署**：点击"一键部署"触发自动化部署流程，实时查看进度与资源状态<br>
    <img src="./_resources/deploy_ing.png" alt="image" width="600"><br>
4. **服务调用**：部署成功后，点击"立即试用"获得对应的调用Demo示例<br>
    <img src="./_resources/use_demo.png" alt="image" width="600"><br>

> 注意⚠️：如您选择使用自己的个人云资源，在点击“一键部署”会进入对应的资源管控台进行部署参数调整与最后确认（例如调整机器类型或GPU类型），
部署任务时长根据模型大小略有不同，请耐心等待。

# 服务部署成功与调用
部署完成后，就可以直接使用OpenAI API来调用所部署的模型了。从“立即使用”入口，就可以获取使用的范例代码：<br>
 <img src="./_resources/openai-deployed.png" alt="image" width="600"><br>
 <img src="./_resources/openai-sample.png" alt="image" width="600"><br>
把范例代码拷贝并执行，就可以直接调用模型服务，这里给了一个用流式调用的例子：
```python
from openai import OpenAI

model_id = 'Qwen/Qwen2-7B-Instruct-GGUF'

client = OpenAI(
    base_url='https://ms-fc-dapp-func-<replace with your  id>.cn-hangzhou.fcapp.run/v1',
    api_key='ollama'
)

response=client.chat.completions.create(
    model=model_id,
    messages=[{"role":"user", "content":"Hello! 你是谁？"}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content, end='')
```
上述调用将流式输出如下内容：

```
你好！我是阿里云开发的一款超大规模语言模型，我叫通义千问。作为一个AI助手，我的目标是帮助用户获得准确、有用的信息，解决他们的问题和困惑。我可以回答各种问题、提供代码实现、辅助学习、解答疑惑等。请随时向我提问，我会尽力提供最好的帮助。
```

通过几个简单的步骤，我们就完成了一个Qwen2-7B的OpenAI接口兼容API服务的部署。现在通过OpenAI的SDK或者API，就能够接入到众多与OpenAI兼容的工具链或其他生态服务中了。

在上面部署的流程中，我们全程使用了默认配置。接下来我们再展开介绍一下这个链路上的可配置的高级参数。

# 部署高级配置
除了默认的参数以外，SwingDeploy同时支持开发者对于部署模型所使用的参数进行配置。我们这里进一步展开一下做介绍。

展开“高级配置”，就可以看到可用的额外选项：<br>
 <img src="./_resources/advanced-setting.png" alt="image" width="600"><br>

这里我们逐一说明一下：<br>
- **模型版本号**：ModelScope上的模型可以有不同的版本，这里可做选择（默认使用最新的master版本）。<br>

- **模型文件**：GGUF格式极大简化了大语言模型文件的管理，可通过单模型文件完成推理。而且借助llama.cpp提供的丰富量化能力，一个模型repo下的不同GGUF文件，通常对应的是不同量化精度与量化方法。平台默认选用的是Q5_K_M版本，在推理精度以及推理速度，资源消耗之间做一个较好的均衡。如果有特殊的需求，也可以选择更高的精度--例如FP16版本，或者更激进的量化（更小的模型文件）-- 例如Q2_K版本。<br>
 <img src="./_resources/gguf-selection.png" alt="image" width="600"><br>

- **Modelfile配置**：Modelfile是Ollama框架进行模型参数设定的配置文件，SwingDeploy为当前支持的模型都提供了默认可用的配置，但是也允许您自定义配置，点击页面上的“编辑”即可进行修改。<br>
<img src="./_resources/modelfile.png" alt="image" width="600"><br>

比如这里我们把模型部署使用的SYSTEM prompt修改为
```
You are a lovely cat, you answer each question ending with "meow~"（喵～）
```
<img src="./_resources/modified-modelfile.png" alt="image" width="600"><br>

这里我们选用了Gemma2模型，并通过SYSTEM prompt的配置让模型扮演一只小猫，每个回答都要以“meow~”（喵～）来做结尾。

模型部署后，再进行调用：

<img src="./_resources/modified-call.png" alt="image" width="600"><br>

可以看到，这时候同样使用OpenAI API调用，模型确实展现出了符合预期的行为。当然，部分配置也可以在每次通过OpenAI的API/SDK接口调用的时候修改（例如temperature，top_p， top_k等参数）。

- **部署类型**：SwingDeploy x Ollama框架，支持在CPU或GPU上的部署，在这里可以按需进行选择。同时在FC的部署页面上，也可以选择更多的不同规格，这里不再赘述。

<img src="./_resources/resource-type.png" alt="image" width="600"><br>


# 立即体验

心动不如行动！ 👉 [立即部署您的第一个模型](https://www.modelscope.cn/my/modelService/deploy)
