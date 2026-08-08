<!-- modelscope-docs: 模型库介绍 | models/intro/intro_CN.md -->

本篇文章介绍ModelScope模型库的产品功能、快速使用指南等。
# 关于ModelScope的模型库
ModelScope的模型库（Model Hub）是共享机器学习模型、demo演示、数据集和数据指标的地方。您可以轻松地创建和管理自己的模型库，利用界面或开发环境来便捷地上传、下载相关模型文件，并从 Model Hub中获取有用的模型和数据集元数据。

## 预备知识

### 名词解释
- **模型**：是指一个具体的模型实例，包括模型网络结构和相应参数。ModelScope平台提供丰富的模型信息供用户体验与使用。

- **模型库**：是指对模型进行存储、版本管理和相关操作的模型服务，用户上传和共享的模型将存储至ModelScope的模型库中，同时用户也可在Model hub中创建属于自己的模型存储库，并沿用平台提供的模型库管理功能进行模型管理。

### 模型公开属性
在 ModelScope 创建模型时，您可以通过“是否公开”属性自主设置模型的公开范围。根据创建者所配置的公开范围，模型可分为三类：
- 公开模型：社区所有人可见、可下载.
- 非公开模型：也称私有模型，仅组织成员或模型所有者可见、可下载.
- 申请制模型：任意用户均可在按照要求发起申请、并经模型所有者审批同意后可见、可下载.

## 从模型库中下载并使用模型
Model Hub 上的模型通过 Git 进行存储和版本管理，用户可以下载单个文件或整个模型的所有相关文件。通过模型 ID，用户可以使用本地SDK从ModelHub下载并加载模型。ModelScope的SDK会自动缓存本地下载的模型文件，以便下次加载相同文件时无需重新下载。

具体下载模型的方式，可以参见[模型的下载](./模型的下载.md)文档。

## 创建自己的模型库
要创建模型，需要拥有ModelScope账号。如果您还没有账号，请注册一个新账号。

您可以使用两种方式创建模型库。

### 1. 使用ModelScope的web页面创建模型库

注册登录后，在头像左侧会出现创建按钮，点击可创建模型或数据集。点击创建模型，进入模型页面填写基础信息实现模型库的创建。

使用此种添加方式，分为两个步骤：

#### 步骤1. 填写基础信息

基础信息包括您的模型英文名称、中文名、所有者、许可证类型、是否公开和模型描述。

- 许可证类型决定您的模型遵循对应的开源协议。
- 是否公开决定您的模型是否能被其他用户检索查看，若设置为非公开模型，则其他用户无法查看，仅您自己查看。您也可以创建后在设置页面进行权限的修改配置。
- 模型描述建议介绍您的模型的特性和应用场景，将展现在模型列表页方便用户搜索查询。

![image.png](./_resources/1659446858368-87839527-4ebd-4062-b2f4-0c4dd835cda6.png)

#### 步骤2. 添加README文档
若您已有README文档，可直接在此处上传。若您没有README文档，系统将为您自动创建一个README文档。

为了让模型介绍更容易被理解和检索，我们推荐您按照模型卡片规范进行书写，具体可查看[如何写好用的模型卡片](../贡献者指南/接入模型文件/模型接入帮助/撰写完善的模型卡片.md)。

![image.png](./_resources/1659447304275-027198bb-ca6e-4b66-8f20-7b0f26aaa4bb.png)

点击创建模型，系统将根据您上传的README.md文件进行解析，并展示在模型介绍页面。

若您没有README文档，可在模型文件中找到README.md并点击编辑进行在线编辑。

![image.png](./_resources/179AB7D9-5EB1-4f46-8F40-95E9BF99DFD8.png)

模型卡片的编辑分为yaml部分和markdown部分，其中系统通过解析yaml文档来解析对应的字段和模型标签。

![image.png](./_resources/1659447515576-7ccbc093-0857-42d7-b0c7-8491845b1a39.png)


完成创建后，平台将为您分配一个存储地址，如下：
![image.png](./_resources/1659447862505-5c704ffa-4a90-469a-aedd-e3c1a8fcb52f.png)
您可通过页面或者git的方式将文件添加至该模型库中，也可通过页面上传相关的模型文件。

模型创建以后，即可以上传您的模型，具体可参见[模型的上传](./模型的上传.md)文档。

### 2. 使用 SDK 创建模型库

假设您的账户名是`user`，期望的模型英文名称为`my-test-model`

> 访问的SDK令牌（SDK_TOKEN）可前往[【账号设置】->【访问令牌】](https://modelscope.cn/my/myaccesstoken)获取。

```python
from modelscope.hub.constants import Licenses, ModelVisibility
from modelscope.hub.api import HubApi

api = HubApi()
api.login(access_token="YOUR_MODELSCOPE_SDK_TOKEN")

username = 'user'
model_name = 'my-test-model'
model_id = f"{username}/{model_name}"

api.create_model(
    model_id,
    visibility=ModelVisibility.PUBLIC,
    license=Licenses.APACHE_V2,
    chinese_name="我的测试模型"
)
```

**参数说明**

|  **字段名**          |  **必填**  |  **类型**   | **描述**                 |
| ------------------- |  :---------: | :----------: |------------------------|
|  model_id           |  是        |  str       | 模型ID                   |
|  visibility         |  否        |  int       | 模型的可见性,1-私有，5-公开，不填默认5 |
|  license            |  否        |  str       | 模型的许可证，不填默认为Apache-2.0 |
|  chinese_name       |  否        |  str       | 模型的中文名称，默认None               |

更多的参数可以参见开源代码的接口文档。

## 贡献者如何配置申请制模型

### 默认情况
当模型被设置为申请制模型时，**默认情况下，查看该模型的用户将被要求接受申请模型下载协议，并通过单击“申请下载**”按钮来分享他们的联系信息（电子邮件和用户名）。您可以在模型设置页查看申请信息，并操作同意或拒绝申请。

### 自动通过审核
您也可以打开“自动通过审核”开关，申请用户在点击申请下载按钮后立即获得模型下载权限，无需等待模型所有者确认通过申请。

### 定制收集申请用户信息
如果您想收集更多的用户信息，您可以通过`README.md`配置表单：
- `extra_gate_fields`：通过新增键值对来增加填写项目，其中字段名为“填写项”标题，字段值可选`text`（文本框）或`checkbox`（单选框），用于声明表单填写项形式。
- `extra_gated_prompt`：表单填写补充信息。您可以在此配置供用户跳转查看的链接，通过`description`字段指定链接显示文案，通过`link`字段指定跳转链接地址。
- `extra_gated_licence`：用于配置自定义申请下载协议的勾选同意组件。您可以在此配置供用户跳转查看的协议链接，通过`description`字段指定协议文本标题，通过`link`字段指定跳转链接地址。

以下是自定义申请表单的示例，其中“电话”、“邮箱”为必填项，额外期望收集信息的填写项可自行扩展。

  ```
  extra-gated:
    extra_gated_fields:
      电话: text
      邮箱: text
      是否同意: checkbox
    extra_gated_prompt:
      description: 额外补充信息
      link: www.modelscope.cn
    extra_gated_licence: 
      name: 接受协议内容
      link: www.modelscope.cn
  ```

  注：电话、邮箱作为固定字段，请勿修改。

  配置好后，申请用户视角效果如下图所示：

  ![image](https://img.alicdn.com/imgextra/i3/O1CN01hexl9m1qwzQnUdsXR_!!6000000005561-0-tps-2088-758.jpg)

# ModelScope社区的模型
ModelScope是一个开源开放的AI社区平台，我们支持和鼓励更多优质的模型加入到ModelScope社区。作为ModelScope社区的发起方和贡献者之一，通义实验室率先贡献了众多高质量的SOTA模型，同时我们也陆续有更多的合作伙伴加入其中，社区部分模型持续更新中。若您有模型想要分享交流，也欢迎使用社区进行模型发布，若有更进一步的合作意向，欢迎[联系我们](../联系我们/联系我们.md)！

- [模型的下载](./模型的下载.md)
- [模型的上传](./模型的上传.md)
- [模型的推理](../Library教程/模型推理Pipeline.md)
