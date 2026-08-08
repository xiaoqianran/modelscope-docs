<!-- modelscope-docs: 创空间卡片 | studios/studio-card/studio-card_CN.md -->

本篇文章介绍ModelScope创空间卡片的定义、编辑规范、使用方式和管理说明。

>  **特别说明：** 您可以自由创建多个创空间并分享给您的朋友，但考虑到首页的空间展示质量，您所创建的空间并不会自动进入创空间首页精选列表，如您有意愿申请进入首页列表，非常欢迎与我们取得联系（钉钉群：8010015744，邮箱：contact@modelscope.cn）

# 什么是创空间卡片
创空间卡片是ModelScope社区用户获取创空间信息的关键来源，是创空间附带的文件，主要通过解析创空间文件中的README.md文件获取。创空间卡片是由YAML元数据，提供了方便的信息。因此我们强烈推荐平台用户根据规范撰写属于您的创空间卡片，以便让社区用户更好地了解和发现您的创空间！
# 创空间卡片提供哪些信息
我们推荐创空间卡片提供如下内容描述，包括但不限于： 

- **创空间名称与描述**。介绍该创空间的基础信息、创空间的领域、标签等，便于搜索
- **创空间关联模型**。介绍该创空间关联的模型列表
- **创空间关联数据集**。介绍该创空间关联的数据集列表
- **创空间部署规格**。介绍该创空间部署的资源规格

# 创空间卡片的元数据
一个有效的创空间卡片需要包含YAML头部信息,头部的YAML信息使用---分组进行区隔。一份完整的YAML部分的内容参考如下：

```yaml
---
domain: #领域：cv/nlp/audio/multi-modal/AutoML
- cv
tags: #自定义标签
- 
datasets: #关联数据集
  evaluation: 
  - damotest/beans
  test:
  - damotest/squad
  train:
  - modelscope/coco_2014_caption
models: #关联模型
- damo/speech_charctc_kws_phone-xiaoyunxiaoyun
# # 部署启动文件(若SDK为Gradio/Streamlit，默认为app.py, 若为Static HTML, 默认为index.html)
# deployspec: 
#   entry_file: app.py
license: Apache License 2.0
---
```

## 字段说明
```yaml
domain: 创空间所属领域。包括"cv"\"nlp"\"audio"\"multi-modal"\"AutoML"等，分别表示计算机视觉(cv)、自然语言处理(nlp)、语音交互(audio)、多模态(multi-modal)、AutoML(AutoML)等，您也可自定义。
license: 该创空间遵循怎样的开源许可证。如Apache License 2.0、GPL-2.0、GPL-3.0、MIT等。
language: 在特定领域（比如语音，文本等），创空间所支持的语言类型。
tags: 用户可自定义标签，用于创空间检索过滤。
datasets: 该创空间所关联的数据集，包括训练集、验证集等。添加数据集，可支持用户点击跳转链接跳转至对应的数据集详情页。
models: 该创空间关联的模型。添加模型，可支持用户点击跳转链接跳转至对应的模型详情页。
deployspec: 
- entry_file: 空间部署启动文件（若SDK为Gradio/Streamlit，默认为app.py, 若为Static HTML, 默认为index.html）
```
