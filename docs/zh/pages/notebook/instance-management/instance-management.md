<!-- modelscope-docs: Notebook实例创建与管理 | notebook/instance-management/instance-management_CN.md -->

使用Notebook前，您需要建立Notebook实例。本文将介绍如何创建、打开Notebook实例和管理实例。
# 前提条件
您在创建Notebok实例前，需要先登录**ModelScope账号**。若您没有ModelScope账号需要先注册。
# 创建实例

- 您可以在**个人中心 > 我的Notebook**内创建新实例，并根据需求选择创建CPU实例或GPU实例。界面内将通过倒计时展示资源剩余额度（平台赠送的免费额度详见[Notebook介绍](./Notebook介绍.md)中**免费Notebook使用**部分的文档说明）。

![image.png](./_resources/image8.png)

- **ModelScope模型详情页**内同样支持创建新实例。

![image.png](./_resources/image9.png)<br>
若您还未绑定过阿里云账号，则无法获得免费实例资源。可根据绑定提示先完成绑定后再创建实例。<br />
![image.png](./_resources/image10.png)<br>
若您已经完成过绑定，则再次通过模型详情页打开Notebook时，将展示平台合作的Notebook产品及其相关环境。选择您所需要的产品和环境，点击“启动”按钮，即可创建对应的实例。<br>
![image.png](./_resources/image11.png)<br>
实例的启动时间预计在2分钟以内，请耐心等待。 当实例启动完成后，点击“查看Notebook”，则将跳转对应的Notebook产品页面，此时该环境已经内置ModelScope官方镜像，您无需重新安装环境依赖，即可使用。

# 实例状态管理

- 运行中的实例，支持重新打开Notebook界面和关闭实例。
   - 点击**查看Notebook**，您可以在新标签页内打开运行中的Notebook实例。
   - 点击**关闭实例**后，您在Notebook内的代码运行进程终止。平台对于特定的实例下的指定目录内的数据会做持久化保存，请参见[Notebook介绍](Notebook介绍.md)内的详细说明。未遵循说明存储的数据，**将在关闭实例被自动清除**。
# 实例界面介绍
## 界面构成
从**模型详情页**或**个人中心**启动实例环境后，进入Notebook实例界面。Notebook实例界面主要包括以下部分：

![image.png](./_resources/image12.png)

| **功能区编号** | **描述** |
| --- | --- |
| ① | 顶部菜单栏。 |
| ② | 左侧工具栏。 |
| ③ | 工具内容。 |
| ④ | 主工作区。 |

## 创建Notebook新文件
在Launcher页，点击**主工作区**内不同文件选项，创建新文件

- 若您希望通过Python 3语言在IDE内进行代码开发，可点击下方红框按钮，创建新ipynb文件

![image.png](./_resources/image13.png)

- 若您希望通过CLI提交训练任务或执行依赖包管理等操作，可点击下方红框按钮，打开Terminal页面

![image.png](./_resources/image14.png)
## Notebook内开发
若您选择创建新ipynb文件，可在主工作区内使用Python 3语言进行代码开发。您可直接复制**模型详情页**内**快速使用**代码，在主工作区内执行模型推理、训练、评估等任务操作。

![image.png](./_resources/image15.png)
## Terminal内开发
若您选择打开Terminal，可在工作区内使用CLI命令执行任务，包括(但不限于)：

- 代码发布
- 依赖包管理
- 文件管理
- 提交训练/推理/评估任务

![image.png](./_resources/image16.png)<br /> 
