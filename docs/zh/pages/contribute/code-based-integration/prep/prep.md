<!-- modelscope-docs: 准备工作 | contribute/code-based-integration/prep/prep_CN.md -->

# 安装环境并熟悉已有模型

- 请按照[环境安装文档](../../快速入门/环境安装.md)准备好开发测试环境。
- 如果ModelScope中存在相似（如模型结构、训练方式、任务类型）模型，建议阅读该模型的源代码，主要关注模型的注册方式、预处理器的实现、pipeline实现以及训练过程。
- 进入[ModelScope官方网站](www.modelscope.cn)找到对应的模型，使用ModelCard的sample code运行一次，并打开configuration.json简单了解下其中的配置。

开发者也可以参考ModelScope github上的checkin历史，寻找不同模型接入的修改方式，例如一个已有模型接入的[commit例子](https://github.com/modelscope/modelscope/commit/5343c899fbaac1f33bdb208c8e99944af962ca7a)。当然开发者可以从github的commit history，自由选择各自对应领域模型接入的commit sample做参考。


## 通过源码来安装ModelScope
您可通过从[GitHub](https://github.com/modelscope/modelscope)上下载ModelScope源码进行安装。

ModelScope的源码可以直接clone到本地：

```shell
git clone git@github.com:modelscope/modelscope.git
cd modelscope
git fetch origin master
git checkout master

```
### 通过源码来安装领域模型依赖

如仅需体验`多模态`领域模型，可执行如下命令安装依赖：
```shell
pip install ".[multi-modal]"
```

如仅需体验`NLP`领域模型，可执行如下命令安装依赖：
```shell
pip install ".[nlp]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

如果使用miniconda环境，需要提前安装setuptools_scm。

如仅需体验`CV`领域模型，可执行如下命令安装依赖：
```shell
pip install ".[cv]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

部分cv模型目前使用mmcv1.7.0，可以通过如下方式安装：
```shell
# 目前只支持python3.10 torch支持2.1.0和2.1.1，cuda支持11.8.0，12.1.0
# 对应版本1.7.0+torch2.1.1cu121 1.7.0+torch2.1.0cu121 1.7.0+torch2.1.1cu118 1.7.0+torch2.1.0cu118
pip install mmcv_full=='1.7.0+torch2.1.1cu121' -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

如仅需体验`语音`领域模型，请执行如下命令：
```shell
pip install ".[audio]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

如仅需体验`科学计算`领域模型，请执行如下命令：
```shell
pip install ".[science]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

如果您所有领域的模型功能都想体验，可执行如下命令
```shell
pip install "modelscope[audio,cv,nlp,multi-modal,science]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

** 注意：极少数模型仅支持tensorflow1.15.5的Linux环境**

## 要关注的一些问题

1. 了解ModelScope Library的**运行机制**，可以参考[ModelScope机制简要介绍](../../ModelScope%20Library教程/详细教程/Library框架机制.md)，对ModelScope配置文件格式不了解的用户可以查看[Configuration详解](../../ModelScope%20Library教程/详细教程/Configuration详解.md)。
2. 了解待接入模型的**计算框架**（PyTorch、TensorFlow等），以及该模型在ModelScope中能否找到可复用的Pipeline和Preprocessor
3. 了解待接入模型的**复杂程度**。如果任务比较基础（比如文本分类、图像目标检测）、模型相对标准可以用已有的类似代码拷贝粘贴，否则可以联系ModelScope开发人员对焦基本方案防止走弯路
4. 了解待接入模型的**模块性**。如果模块性较好，建议复用已有backbone或将新的backbone注册到backbone registry中（head部分可选接入head registry中），如果模块性较差，且模块化比较困难，可以整体模型直接接入
5. 了解待接入模型的**领域**，ModelScope的模型分为语音、视频及图像、多模态、自然语言、科学五个领域。每个领域的模型接入方式在整体要求的基础上略有不同，在后面的步骤中我们会分别介绍
