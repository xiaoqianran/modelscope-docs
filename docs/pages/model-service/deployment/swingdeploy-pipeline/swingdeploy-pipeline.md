<!-- modelscope-docs: One-Click Deployment Based on Native Pipeline | model-service/deployment/swingdeploy-pipeline/swingdeploy-pipeline_EN.md -->

# Overview
SwingDeploy is a one-click model deployment service launched by ModelScope, supporting direct deployment of various models from ModelScope (including speech, video, NLP, and other domains) to user-specified cloud resources, such as Function Compute (FC), PAI-EAS (Model Online Service), and Edge Node Service (ENS). Among these capabilities, native deployment based on ModelScope Pipeline is one of SwingDeploy's core features and represents a **deeply integrated deployment solution** specifically designed for ModelScope models.

# Prerequisites: Account Binding and Authorization
Currently, native deployment relies on personal cloud resources, so you need to complete Alibaba Cloud account binding and authorization first.

**Step 1. Complete Alibaba Cloud Account Binding**

You need to log in to [ModelScope](https://www.modelscope.ai/) and follow the instructions to complete [Alibaba Cloud account binding](./account-management-and-organization/alibaba-cloud-account-binding-and-authorization-tutorial.md)<br>
<img src="resources/account.png" alt="image" width="600"><br>

**Step 2. Activate and Authorize Cloud Services**

Go to the [Model Service](https://www.modelscope.ai/my/modelService/deploy?page=1&type=personal-fc) page and follow the instructions to complete full authorization for your personal cloud services. The specific steps and successful authorization results are shown below:<br>
<img src="resources/auth.png" alt="image" width="600"><br>

If you are a new Alibaba Cloud user, we recommend claiming Alibaba Cloud's official [free trial credits](https://free.aliyun.com/?product=9555928,9657388) when activating services.

# Model Deployment Process

1. Go to the SwingDeploy service page → Select "Create New Deployment" → Choose the model you want to deploy (e.g., chatglm3-6b) → Select the ModelScope Pipeline native inference framework → Choose the required personal cloud resources<br>
<img src="resources/ModelScope_pipeline_model_selection.png" alt="image" width="600"><br>
2. After selecting the model and version, the platform will automatically configure the relevant deployment information. Click **"One-Click Deployment"** to proceed to the corresponding cloud resource console (FC or PAI-EAS) for final confirmation.
3. If needed, adjust deployment parameters in the cloud console (e.g., modify instance type or GPU type), then proceed with the final service deployment.
4. Deployment duration varies slightly depending on model size, so please be patient.

# Successful Service Deployment

After successful deployment, you can view detailed configuration information of the successfully deployed model through the operation list. Use "View Logs" to navigate to the Alibaba Cloud console to check FC or PAI-EAS deployment logs and details.

Access more information through the **"Get Started"** option in the operation list to obtain corresponding model invocation demo examples<br>
<img src="resources/quickstart.png" alt="image" width="600"><br>

# Service Deployment Failure

After performing operations in the model deployment process, deployment may fail due to insufficient Alibaba Cloud account credits, memory, or GPU memory configurations that don't meet the minimum requirements for model operation.<br>
<img src="resources/failed.png" alt="image" width="600"><br>

If you encounter service deployment failure, click **"View Failure Reason"** to check the specific failure cause in the FC console<br>
(Note: The console you're redirected to corresponds to your current Alibaba Cloud account)<br>
<img src="resources/fcpiepline.png" alt="image" width="600"><br>

# Service Invocation

After service deployment, you'll receive a service invocation URL. Make calls according to the input/output types of different models. For example:
Reference code (Python):
```python
import requests
API_URL = 'https://ms-fc-aapp-func-<service-name>.cn-hangzhou.fcapp.run/invoke'
def post_request(url, json):
	with requests.Session() as session:
		response = session.post(url,json=json,)
		return response
payload = {"input":{"text":"The capital of Mongolia is Ulaanbaatar\nThe capital of Iceland is Reykjavik\nThe capital of Ethiopia is"},"parameters":{}}
response = post_request(API_URL, json=payload)
print("response:", response.json())
```

In addition to text, audio, images, and other data types can also be successfully used with this deployment method, depending on your actual use case.

# Try It Now

Don't just think about it—take action! 👉 [Deploy Your First Model Now](https://www.modelscope.ai/my/modelService/deploy)