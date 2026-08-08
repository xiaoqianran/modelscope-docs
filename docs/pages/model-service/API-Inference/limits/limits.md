<!-- modelscope-docs: API Inference Usage Limits | model-service/API-Inference/limits/limits_EN.md -->

ModelScope provides open-source models as a service through API Inference, standardizing them via API interfaces and offering them **free of charge** for developers to experience. For specific usage instructions, please refer to the [documentation](./API-Inference-Introduction.md). API Inference itself is a *non-commercial, non-profit* product. To maximize service coverage for developers under limited platform resources while ensuring fair usage, API Inference implements certain limits on usage quotas and concurrency, with real-time dynamic adjustments based on actual resource utilization. Details are as follows:

# API Inference Usage Limits
- ModelScope's inference API Inference aims to provide developers with a free and convenient way to call models. **Please do not use it for online tasks requiring high concurrency or SLA guarantees**. If you have commercial usage requirements, we recommend using APIs from commercial platforms.
- The free inference API is powered by Alibaba Cloud computing resources. **Your ModelScope account must first be [linked to an Alibaba Cloud account](../../account-management-and-organization/Alibaba-Cloud-Account-Binding-and-Authorization-Tutorial.md)**. Additionally, to prevent abuse, the corresponding cloud account must have completed [**real-name verification**](https://help.aliyun.com/zh/account/real-name-authentication) before you can use API Inference normally.
- The allowed concurrency for different models will be dynamically rate-limited according to platform load, with the principle of **ensuring normal single-concurrency usage for developers**.
- API Inference calls can be redeemed by magicubes. The costs are grouped into three tiers based on model size and compute requirements:
   *   **Lightweight models**: ~0.5 Magicubes per call
   *   **Standard models**: ~1 Magicube per call  
   *   **Flagship models**: ~2 Magicubes per call

Please refer to [Magicube Rewards Program](../../Magicube/Magicube Rewards Program.md) for further details.

# View API Inference Magicuble Cost
In the top-right corner of the code example, when "ModelScope Community" is selected as the API provider, the "Estimated Magicuble Cost" is displayed to the left of the provider name.
![img.png](./_resources/api_inference_magicube.png)


>[!IMPORTANT]
> - As new models are released, older models may gradually be removed from API Inference. 


# Models Supported by API Inference
Currently, API Inference provides ready-to-use APIs for selected open-source **large language models (LLM)**, **multimodal models (MLLM)**, and **[AIGC text-to-image models](https://www.modelscope.ai/aigc/models)** on the ModelScope platform.

The range of models covered by API Inference is primarily determined by the model's popularity in the ModelScope community (based on metrics such as likes and downloads). Therefore, as more capable and popular next-generation open-source models are released, the supported model list will continue to evolve. Developers can directly filter models on the model page and identify API Inference support by looking for the "blue-green lightning" API Inference logo.
![img.png](./_resources/api-inference-logo.png)

Additionally, on the right side of the model detail page, models that support API Inference will display usage entry points and corresponding code examples.
![img.png](./_resources/api-inference-sample-code.png)

We will actively expand the coverage of models supported by API Inference in the future. ✌️ Stay tuned!