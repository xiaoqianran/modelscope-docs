<!-- modelscope-docs: Deploy OpenAI-API Compatible Model Service | model-service/deployment/swingdeploy-openai-api-compatible/swingdeploy-openai-api-compatible_EN.md -->

# Overview
SwingDeploy is a one-click model deployment service launched by ModelScope, supporting direct deployment of various models from ModelScope (including speech, video, NLP, and other domains) to user-specified cloud resources, including Function Compute (FC), PAI-EAS (Elastic Algorithm Service), Edge Node Service (ENS), and more.

Given the convenience of OpenAI API interfaces in the LLM domain and the rapid development of efficient inference frameworks for large models (including Ollama+llama.cpp, vLLM, LMDeploy, SGLang, etc.), ModelScope's SwingDeploy service has also integrated a **generalized deployment solution that provides OpenAI API compatibility**.

# Prerequisites: Account Binding and Authorization
Currently, the community provides free trial quotas for OpenAI API compatible deployment solutions, while also supporting users to utilize their own personal cloud resources. Both options require necessary account binding and authorization preparation before model deployment:

**Step 1. Complete Alibaba Cloud Account Binding**

You need to first log in to [ModelScope](https://www.modelscope.ai/) and follow the instructions to complete [Alibaba Cloud account binding](./account-management-and-organization/alibaba-cloud-account-binding-and-authorization-tutorial.md)<br>
<img src="./_resources/account.png" alt="image" width="600"><br>

**Step 2. Activate and Authorize Cloud Services**

If you wish to use your own personal cloud resources, you need to complete the corresponding cloud service authorization:

Go to the [Model Service](https://www.modelscope.ai/my/modelService/deploy?page=1&type=personal-fc) page and follow the instructions to complete full authorization for your personal cloud services. The specific steps and successful authorization results are shown below:<br>
<img src="./_resources/auth.png" alt="image" width="600"><br>

# Model Deployment Process

1. **Model Selection**: On the deployment service page, click "Create New Deployment" and select the model you want to deploy<br>
   <img src="./_resources/model_selection.png" alt="image" width="600"><br>
2. **Framework and Resource Selection**: Choose the appropriate framework and cloud resource type based on your specific business scenario requirements<br>
   <img src="./_resources/resource_selection.png" alt="image" width="600"><br>
3. **One-Click Deployment**: Click "One-Click Deployment" to trigger the automated deployment process and monitor progress and resource status in real-time<br>
   <img src="./_resources/deploy_ing.png" alt="image" width="600"><br>
4. **Service Invocation**: After successful deployment, click "Try Now" to obtain corresponding invocation demo examples<br>
   <img src="./_resources/use_demo.png" alt="image" width="600"><br>

> Note⚠️: If you choose to use your own personal cloud resources, clicking "One-Click Deployment" will redirect you to the corresponding resource management console for deployment parameter adjustments and final confirmation (e.g., adjusting machine type or GPU type). Deployment duration varies slightly depending on model size, so please be patient.

# Successful Service Deployment and Invocation
After deployment completion, you can directly use the OpenAI API to invoke the deployed model. From the "Use Now" entry point, you can obtain example usage code:<br>
<img src="./_resources/openai-deployed.png" alt="image" width="600"><br>
<img src="./_resources/openai-sample.png" alt="image" width="600"><br>

Copy and execute the example code to directly invoke the model service. Here's an example using streaming invocation:

```python
from openai import OpenAI

model_id = 'Qwen/Qwen2-7B-Instruct-GGUF'

client = OpenAI(
    base_url='https://ms-fc-dapp-func-<replace with your id>.cn-hangzhou.fcapp.run/v1',
    api_key='ollama'
)

response=client.chat.completions.create(
    model=model_id,
    messages=[{"role":"user", "content":"Hello! Who are you?"}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content, end='')
```

The above invocation will stream output the following content:

```
Hello! I am Qwen, a large-scale language model developed by Alibaba Cloud. As an AI assistant, my goal is to help users obtain accurate and useful information and solve their problems and confusions. I can answer various questions, provide code implementations, assist with learning, and clarify doubts. Please feel free to ask me questions anytime, and I will do my best to provide the best assistance.
```

Through just a few simple steps, we've successfully deployed an OpenAI-compatible API service for Qwen2-7B. Now, through OpenAI's SDK or API, you can integrate with numerous OpenAI-compatible toolchains or other ecosystem services.

In the deployment process above, we used default configurations throughout. Next, we'll elaborate on the configurable advanced parameters in this pipeline.

# Advanced Deployment Configuration
In addition to default parameters, SwingDeploy also supports developers configuring parameters for the deployed models. We'll elaborate on this further here.

Expand "Advanced Settings" to see available additional options:<br>
<img src="./_resources/advanced-setting.png" alt="image" width="600"><br>

We'll explain each option below:<br>
- **Model Version**: Models on ModelScope can have different versions, which can be selected here (default uses the latest master version).<br>

- **Model File**: The GGUF format greatly simplifies large language model file management, enabling inference through a single model file. Additionally, leveraging llama.cpp's rich quantization capabilities, different GGUF files under the same model repository typically correspond to different quantization precisions and methods. The platform defaults to the Q5_K_M version, which provides a good balance between inference accuracy, speed, and resource consumption. If you have special requirements, you can choose higher precision—such as FP16 version—or more aggressive quantization (smaller model files)—such as Q2_K version.<br>
<img src="./_resources/gguf-selection.png" alt="image" width="600"><br>

- **Modelfile Configuration**: Modelfile is Ollama framework's configuration file for model parameter settings. SwingDeploy provides default usable configurations for all currently supported models, but also allows you to customize configurations. Click "Edit" on the page to make modifications.<br>
<img src="./_resources/modelfile.png" alt="image" width="600"><br>

For example, here we modify the SYSTEM prompt used for model deployment to:
```
You are a lovely cat, you answer each question ending with "meow~"
```
<img src="./_resources/modified-modelfile.png" alt="image" width="600"><br>

Here we selected the Gemma2 model and configured the SYSTEM prompt to make the model act like a kitten, with each response ending with "meow~".

After model deployment, when making calls:

<img src="./_resources/modified-call.png" alt="image" width="600"><br>

As you can see, when using the OpenAI API for invocation, the model indeed exhibits the expected behavior. Of course, some configurations can also be modified during each OpenAI API/SDK interface call (such as temperature, top_p, top_k parameters).

- **Deployment Type**: SwingDeploy x Ollama framework supports deployment on both CPU and GPU, which can be selected as needed. Additionally, on the FC deployment page, you can choose from more different specifications, which we won't elaborate on further here.

<img src="./_resources/resource-type.png" alt="image" width="600"><br>

# Try It Now

Don't just think about it—take action! 👉 [Deploy Your First Model Now](https://www.modelscope.ai/my/modelService/deploy)