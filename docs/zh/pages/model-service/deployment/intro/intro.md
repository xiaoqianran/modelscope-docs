<!-- modelscope-docs: 模型部署简介 | model-service/deployment/intro/intro_CN.md -->

# 概要
SwingDeploy [部署服务](https://www.modelscope.cn/my/modelService/deploy) 是魔搭社区推出的**一站式模型部署解决方案**，旨在为开发者提供从模型选型到云端部署的端到端服务。 通过标准化部署流程和云资源适配能力，用户可快速将魔搭社区丰富的模型（语音、视频、NLP等多领域）部署至目标云环境，实现模型推理服务的高效落地。
  

# 核心优势

1. **海量模型覆盖**
- **多领域覆盖**：当前SwingDeploy部署服务已兼容魔搭社区海量模型库，覆盖图像识别、语音识别、自然语言处理等主流AI领域。
- **低代码部署**：统一可视化部署入口消除框架适配差异，开发者无需关心模型底层实现细节。

2. **灵活推理框架支持**
- **多框架适配**：不但提供魔搭社区原生推理框架（ModelScope Pipeline），也集成了如Ollama，vLLM，LMDeploy等业界大模型领域主流推理框架。
- **标准化输出**：部署后自动生成标准化API接口，支持HTTP/RESTful等多种调用协议，无缝对接下游业务系统。


3. **免费试用额度**

- 为了更好的用户体验，魔搭社区提供了免费试用方案：用户在完成[阿里云账号绑定](./账号管理与组织/阿里云账号绑定与授权教程.md)后，即可自动获得**CPU/GPU计算资源免费部署配额**。
- **使用限制**：SwingDeploy部署所用资源的使用责任归属用户个人，请勿进行违法操作。

4. **强大云资源适配**  
支持主流阿里云基础设施，如：
- **函数计算** [(FC)](https://www.aliyun.com/product/fc)： 基于Serverless计算架构，提供按需弹性扩缩容的推理服务。
- **模型在线服务** [(PAI-EAS)](https://www.aliyun.com/product/bigdata/learn/eas)：高性能推理服务，毫秒级响应，适用于实时推理、近实时异步推理等多种AI推理场景。
- **边缘节点服务** [(ENS)](https://www.aliyun.com/product/network/ens)：基于运营商边缘节点和网络构建，提供低延迟边缘部署，满足IoT场景需求

且魔搭社区也集成了多方资源的可视化部署任务管理界面，且支持有进一步资源需求的用户使用个人云资源进行部署配置。


# 适用场景
- 开发者低成本模型测试
- 科研项目成果云端验证
- 企业级AI服务快速上线
- 边缘端智能设备部署

# 使用流程
1. **模型选择**：在魔搭社区模型库中选择想要部署的模型 <br>
    <img src="./_resources/model_selection.png" alt="image" width="600"><br>
2. **框架与资源选择**：根据具体业务场景需求，选择合适的框架与云资源类型 <br>
    <img src="./_resources/resource_selection.png" alt="image" width="600"><br>
3. **一键部署**：点击"一键部署"触发自动化部署流程，实时查看进度与资源状态<br>
    <img src="./_resources/deploy_ing.png" alt="image" width="600"><br>
4. **服务调用**：部署成功后，点击"立即试用"获得对应的调用Demo示例<br>
    <img src="./_resources/use_demo.png" alt="image" width="600"><br>


# 多样化部署方案
从技术方案下钻，魔搭提供的部署方案可以分为以下几个分类：
- [部署开源模型为OpenAI API兼容服务](./部署OpenAI-API兼容模型服务.md)
- [基于魔搭原生Pipeline进行云上部署](./基于原生Pipeline一键部署.md)
- [本地部署](./本地部署.md)

# 立即体验

还等什么，马上访问魔搭社区模型部署服务，开启您的模型云端部署之旅吧！

👉 [立即部署您的第一个模型](https://www.modelscope.cn/my/modelService/deploy)
