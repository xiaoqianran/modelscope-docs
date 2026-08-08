<!-- modelscope-docs: 基于原生Pipeline一键部署 | model-service/deployment/swingdeploy-pipeline/swingdeploy-pipeline_CN.md -->

# 概要
  SwingDeploy是魔搭社区推出的模型一键部署服务，支持将魔搭上的各种（包括语音，视频，NLP等不同领域）模型直接部署到用户指定的云资源上，包括函数计算（FC）、模型在线服务（PAI-EAS）、边缘节点服务（ENS）等。 其中基于ModelScope Pipeline的原生部署是SwingDeploy服务的核心能力之一，是专为魔搭社区模型设计的**深度集成部署方案**。

# 前提条件：账号绑定与授权
目前原生部署依赖个人云资源，因此您需要先完成阿里云账号的绑定与授权。

 **步骤1. 完成阿里云账号绑定**

 您需要先登录[魔搭社区](https://www.modelscope.cn/)，并按指引完成[阿里云账号绑定](./账号管理与组织/阿里云账号绑定与授权教程.md)<br>
    <img src="./_resources/account.png" alt="image" width="600"><br>


**步骤2. 开通并授权云服务**
 
进入[模型服务](https://www.modelscope.cn/my/modelService/deploy?page=1&type=personal-fc)页面，按指引完成对应个人云服务的完整授权，具体步骤和成功授权结果如下所示：<br>
  <img src="./_resources/auth.png" alt="image" width="600"><br>

如您是阿里云的新用户, 在开通时推荐领取阿里云的官方[免费试用额度](https://free.aliyun.com/?product=9555928,9657388) 

# 模型部署流程

 1. 进入部署服务(SwingDeploy)页面 -> 选择新建部署 -> 选择您想要部署的模型（如chatglm3-6b）-> 选择ModelScope Pipeline原生推理框架 -> 选择部署所需的个人云资源 <br> 
    <img src="./_resources/ModelScope_pipeline_model_selection.png" alt="image" width="600"><br>
 2. 选定模型和版本后，平台会自动配置相关部署信息，点击 **"一键部署"** 即可进入对应云资源管控台(FC或PAI-EAS)做最后确认。
 3. 如需要，在云管控台进行部署参数调整（例如调整机器类型或GPU类型）后，即可进行最后的服务部署。
 4. 部署时长根据模型大小略有不同，请耐心等待。

# 服务部署成功

部署成功后，可以通过操作列表详细查看模型部署成功的具体配置信息，通过“查看日志”跳转阿里云控制台查看FC或PAI-EAS部署日志以及详情。

了解更多信息通过操作列表的 **"立即使用"** 来获取对应的模型调用Demo示例<br>
    <img src="./_resources/quickstart.png" alt="image" width="600"><br>

# 服务部署失败

执行模型部署流程中的操作后，若存在阿里云账号额度不足、内存或显存配置不满足模型运行最小配置等情况可能导致部署失<br>
    <img src="./_resources/failed.png" alt="image" width="600"><br>
    
如果碰到服务部署失败的情况，可点击 **"查看失败原因"**，在FC控制台查看部署的具体失败原因<br>
    (注：跳转的控制台为当前阿里云账户登录对应的控制台)<br>
    <img src="./_resources/fcpiepline.png" alt="image" width="600"><br>

# 服务调用

服务部署后，可以获得服务的调用url地址，按照不同模型的输入输出类型，进行对应的调用，例如：
参考代码（Python）：
```python
import requests
API_URL = 'https://ms-fc-aapp-func-<service-name>.cn-hangzhou.fcapp.run/invoke'
def post_request(url, json):
	with requests.Session() as session:
		response = session.post(url,json=json,)
		return response
payload = {"input":{"text":"蒙古国的首都是乌兰巴托（Ulaanbaatar）\n冰岛的首都是雷克雅未克（Reykjavik）\n埃塞俄比亚的首都是"},"parameters":{}}
response = post_request(API_URL, json=payload)
print("response:", response.json())
```

除文本外，语音、图像等数据，使用该方式部署也可顺利使用，可以根据实际情况使用。

# 立即体验

心动不如行动！ 👉 [立即部署您的第一个模型](https://www.modelscope.cn/my/modelService/deploy)
