<!-- modelscope-docs: Model Deployment Introduction | model-service/deployment/intro/intro_EN.md -->

# Overview
SwingDeploy [Deployment Service](https://www.modelscope.ai/my/modelService/deploy) is ModelScope's **one-stop model deployment solution**, designed to provide developers with end-to-end services from model selection to cloud deployment. Through standardized deployment processes and cloud resource adaptation capabilities, users can quickly deploy ModelScope's extensive model library (covering multiple domains including speech, video, NLP, etc.) to target cloud environments, enabling efficient implementation of model inference services.

# Core Advantages

1. **Extensive Model Coverage**
- **Multi-domain coverage**: SwingDeploy currently supports ModelScope's vast model library, covering mainstream AI domains such as image recognition, speech recognition, and natural language processing.
- **Low-code deployment**: A unified visual deployment interface eliminates framework compatibility differences, allowing developers to deploy without worrying about underlying model implementation details.

2. **Flexible Inference Framework Support**
- **Multi-framework compatibility**: SwingDeploy not only provides ModelScope's native inference framework (ModelScope Pipeline) but also integrates industry-leading large model inference frameworks such as Ollama, vLLM, and LMDeploy.
- **Standardized output**: Automatically generates standardized API interfaces after deployment, supporting multiple calling protocols including HTTP/RESTful, seamlessly integrating with downstream business systems.

3. **Free Trial Quota**
- To enhance user experience, ModelScope offers a free trial program: after completing [Alibaba Cloud account binding](./account-management-and-organization/alibaba-cloud-account-binding-and-authorization-tutorial.md), users automatically receive **free CPU/GPU computing resource deployment quotas**.
- **Usage restrictions**: Users are personally responsible for resources used in SwingDeploy deployments. Please do not perform any illegal operations.

4. **Powerful Cloud Resource Adaptation**
Supports mainstream Alibaba Cloud infrastructure, including:
- **Function Compute** [(FC)](https://www.aliyun.com/product/fc): Based on serverless computing architecture, providing on-demand elastic scaling for inference services.
- **PAI-EAS** [(PAI-EAS)](https://www.aliyun.com/product/bigdata/learn/eas): High-performance inference service with millisecond-level response times, suitable for various AI inference scenarios including real-time inference and near-real-time asynchronous inference.
- **Edge Node Service** [(ENS)](https://www.aliyun.com/product/network/ens): Built on carrier edge nodes and networks, providing low-latency edge deployment to meet IoT scenario requirements.

ModelScope also integrates a visual deployment task management interface for multi-party resources and supports users with additional resource requirements to configure deployments using their personal cloud resources.

# Applicable Scenarios
- Low-cost model testing for developers
- Cloud validation of research project results
- Rapid enterprise AI service deployment
- Edge device intelligent deployment

# Usage Workflow
1. **Model Selection**: Choose the model you want to deploy from ModelScope's model library <br>
    <img src="resources/model_selection.png" alt="image" width="600"><br>
2. **Framework and Resource Selection**: Select the appropriate framework and cloud resource type based on specific business requirements <br>
    <img src="resources/resource_selection.png" alt="image" width="600"><br>
3. **One-click Deployment**: Click "Deploy Now" to trigger the automated deployment process and monitor progress and resource status in real-time<br>
    <img src="resources/deploy_ing.png" alt="image" width="600"><br>
4. **Service Invocation**: After successful deployment, click "Try Now" to get corresponding invocation demo examples<br>
    <img src="resources/use_demo.png" alt="image" width="600"><br>

# Diverse Deployment Solutions
From a technical perspective, ModelScope's deployment solutions can be categorized as follows:
- [Deploy open-source models as OpenAI API-compatible services](./deploy-openai-api-compatible-model-services.md)
- [Cloud deployment based on ModelScope native Pipeline](./one-click-deployment-based-on-native-pipeline.md)
- [Local deployment](./local-deployment.md)

# Get Started Now

What are you waiting for? Visit ModelScope's model deployment service now and start your cloud model deployment journey!

👉 [Deploy Your First Model Now](https://www.modelscope.ai/my/modelService/deploy)