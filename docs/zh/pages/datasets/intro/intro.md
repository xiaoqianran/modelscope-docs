<!-- modelscope-docs: 数据集介绍 | datasets/intro/intro_CN.md -->

本篇文章向您整体介绍数据集（Dataset）以及数据集仓库（DatasetHub）相关概念及使用。

# 什么是数据集与数据集仓库？

- **数据集（Dataset）**：一个易于共享与访问的数据集合，可用于模型的训练、测试和验证。数据集通常以表格形式呈现，可以是文本、图像、音频、视频或多模态等多种类型。

- **数据集仓库（DatasetHub）**：集中管理数据集的仓库，支持模型进行训练和预测。提供数据的易访问性、管理与共享。


# 创建数据集

## 前提条件
您需要拥有一个ModelScope账号。

## 创建步骤
请参考[数据集的创建指南](./数据集的创建.md)以获得详细步骤。


# 使用数据集

DatasetHub上的数据存储在公开地址或ModelScope的数据仓库中。数据集使用git进行版本管理，您可以下载单个文件或整个数据集。通过一个namespace和数据集名称，即可通过SDK从DatasetHub下载数据，以及加载使用。下次您需要相同文件时，它将从您的缓存中加载，无需重新下载。

只需知道以下信息，即可通过代码轻松获取数据集：
- **`dataset_name`**  数据集名称 
- **`namespace`** 命名空间 (默认为 `modelscope`)
- **`subset_name`** 子数据集名称（默认为 `default`）
- **`version`** 数据集版本（默认为 `master`）
- **`split`** 数据集的划分（默认为 `None`）

以下是一行代码完成下载和加载的示例，除了数据集名称，其他参数可以不填使用默认值：

```python
from modelscope import MsDataset
ds_dict = MsDataset.load('squad')
print(ds_dict['train'][0])

>>> {'id': '5733be284776f41900661182', 'title': 'University_of_Notre_Dame', 'context': 'Architecturally, the school has a Catholic character. Atop the Main Building\'s gold dome is a golden statue of the Virgin Mary. Immediately in front of the Main Building and facing it, is a copper statue of Christ with arms upraised with the legend "Venite Ad Me Omnes". Next to the Main Building is the Basilica of the Sacred Heart. Immediately behind the basilica is the Grotto, a Marian place of prayer and reflection. It is a replica of the grotto at Lourdes, France where the Virgin Mary reputedly appeared to Saint Bernadette Soubirous in 1858. At the end of the main drive (and in a direct line that connects through 3 statues and the Gold Dome), is a simple, modern stone statue of Mary.', 'question': 'To whom did the Virgin Mary allegedly appear in 1858 in Lourdes France?', 'answers': {'text': ['Saint Bernadette Soubirous'], 'answer_start': [515]}}
```

如果希望指定其他子数据集，则可以指定`subset_name`：
```python
from modelscope import MsDataset
ds_dict = MsDataset.load('ceval-exam', subset_name='operating_system')
print(ds_dict['test'][0])

>>> {'id': 0, 'question': '用于确定字符串模式的一个规则集称为____。', 'A': '字符串匹配', 'B': '正则表达式', 'C': '文件名匹配', 'D': '过滤器', 'answer': '', 'explanation': ''}
```

如果希望指定其他组织加载数据集，则可以指定`namespace`：
```python
from modelscope import MsDataset
ds_dict = MsDataset.load('ceval-exam', namespace='opencompass', subset_name='computer_network')
print(ds_dict['test'][0])

>>> {'id': 0, 'question': '计算机网络的资源主要是指____。', 'A': '服务器、路由器、通信线路与用户计算机', 'B': '计算机操作系统、数据库与应用软件', 'C': '计算机硬件、软件与数据', 'D': 'Web服务器、数据库服务器与文件服务器', 'answer': '', 'explanation': ''}
```


如果希望指定非默认版本，则可以指定`version`：
```python
from modelscope import MsDataset
ds_dict = MsDataset.load('ceval-exam', subset_name='computer_network', version='v1')
print(ds_dict['test'][0])

>>> {'id': 0, 'question': '计算机网络的资源主要是指____。', 'A': '服务器、路由器、通信线路与用户计算机', 'B': '计算机操作系统、数据库与应用软件', 'C': '计算机硬件、软件与数据', 'D': 'Web服务器、数据库服务器与文件服务器', 'answer': '', 'explanation': ''}
```


如果只想加载指定划分也可以指定`split`：
```python
from modelscope import MsDataset
ds = MsDataset.load('ceval-exam', subset_name='computer_network', split='dev')
print(ds[0])

>>> {'id': 0, 'question': '下列设备属于资源子网的是____。', 'A': '计算机软件', 'B': '网桥', 'C': '交换机', 'D': '路由器', 'answer': 'A', 'explanation': '1. 首先，资源子网是指提供共享资源的网络，如打印机、文件服务器等。\r\n2. 其次，我们需要了解选项中设备的功能。网桥、交换机和路由器的主要功能是实现不同网络之间的通信和数据传输，是通信子网设备。而计算机软件可以提供共享资源的功能。'}
```
# 贡献者如何配置申请制数据集

## 默认情况
当数据集被设置为申请制数据集时，**默认情况下，查看该数据集的用户将被要求接受申请数据集下载协议，并通过单击“申请下载**”按钮来分享他们的联系信息（电子邮件和用户名）。您可以在数据集设置页查看申请信息，并操作同意或拒绝申请。

## 自动通过审核
您也可以打开“自动通过审核”开关，申请用户在点击申请下载按钮后立即获得数据集下载权限，无需等待所有者确认通过申请。

## 定制收集申请用户信息
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

![image.png](./_resources/restricted_dataset.png)

# 注意事项

- 数据集英文名称，同一组织账号下唯一；
- 是否公开，用于设置数据集访问权限：
   - 当选择公开数据集时，对所有用户均可见；
   - 当选择非公开数据集时，仅对当前组织账号下可见；
- 数据集描述
  - 数据集描述是数据集的重要组成部分，是数据集的重要信息之一，内容包括数据集的来源、数据集的用途、数据集的格式等；

您可通过页面或者git命令的方式继续维护数据集，详见[数据集的下载](./数据集的下载.md)。
