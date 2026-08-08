<!-- modelscope-docs: Introduction to xGPU Studios | studios/xGPU/xGPU_EN.md -->

# Introduction to xGPU Studios

ModelScope now supports xGPU deployment for Studios!
xGPU deployment provides Studio developers with free access to various types of GPU resources, empowering a richer AI application ecosystem on ModelScope.

## Advantages of xGPU

### 1. Efficient Scheduling Strategy
Based on diverse GPU resources in the cloud, xGPU provides real-time GPU resource scheduling capabilities according to user requests.

Each user request will be dynamically scheduled to available GPU hardware and the GPU resources will be quickly released after necessary computations are completed, making them available for other service requests.
![image.png](./_resources/xgpu_intro.png)

### 2. Excellent Compatibility
xGPU is compatible with various common inference engines, Python versions, and image versions (currently supports Gradio and Streamlit SDK integration). **Users don't need to modify any Studio code** to deploy their Studios using xGPU. For the best experience, we recommend using the latest image version and our latest Gradio SDK version.

## Quick Start

### Prerequisites
During the Beta testing period, if you want to experience xGPU resources, please apply to join the [「xGPU Playground」](https://www.modelscope.cn/organization/xGPU-Explorers) organization. We will contact you as soon as possible regarding your application results, so please check your inbox or email regularly.

### Usage Method
After joining the 「xGPU Playground」 organization, you can configure xGPU resources by selecting "Space Cloud Resources" when creating a new Studio or editing an existing Studio's information page. Restart after saving the configuration to use xGPU.
![image.png](./_resources/xgpu_config.png)

### Usage Limits
During the Beta testing period, experiencing xGPU Studio deployment is free! However, to avoid unnecessary resource waste, we have set corresponding usage limits:
- Each developer has a **maximum number limit for Studios that can be created based on xGPU**. Additionally, the free usage duration for higher-end GPUs may be shorter than that for relatively lower-end GPUs. We recommend selecting the xGPU GPU type based on the **"sufficient for needs" principle** while meeting your code running requirements.
- You can also improve the success rate of request scheduling by reducing the time consumption per request.
- To ensure fair usage and allow more users to experience Studio applications, each user has a maximum duration limit for xGPU experience.
- Studios will be automatically suspended during low-traffic periods or when there are fewer user visits.