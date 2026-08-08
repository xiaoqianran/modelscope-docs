<!-- modelscope-docs: 环境安装 | intro/environment-setup/environment-setup_CN.md -->

本篇文章介绍ModelScope使用所需的环境配置指南。

ModelScope Library目前支持模型和数据集的获取和管理，以及基于PyTorch、Tensorflow等学习框架基础上进行模型训练、推理， 在Python 3.8+, Pytorch 1.11+, Tensorflow上测试可运行。

**注： 大部分语音模型当前需要在Linux环境上使用，并且推荐使用python3.8 + tensorflow 2.13.0 + torch 2.0.1 的组合。部分模态模型可以在mac，windows等环境上安装使用，少部分模型需要tensorflow1.15.0。**

## 基于ModelScope官方镜像直接使用

为了让大家能无需配置环境直接用上ModelScope平台上的模型，ModelScope除了在网站上集成了Notebook在线编程环境以外，同时也提供了官方镜像，方便有需要的开发者获取。基于官方镜像，可以跳过所有的环境安装和配置，直接使用，当前我们提供的最新版本的CPU镜像和GPU镜像可从如下地址获取：

### 最新镜像

CPU环境镜像(python3.12)：
```
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py312-torch2.10.0-1.39.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py312-torch2.10.0-1.39.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py312-torch2.10.0-1.39.0
```
GPU环境镜像(python3.12)：
``` 
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py312-torch2.10.0-1.39.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py312-torch2.10.0-1.39.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py312-torch2.10.0-1.39.0
```

最新的镜像可以运行大模型、Diffusers扩散模型、Megatron模型、funasr的语音模型。 如果你需要运行BERT、YOLO等小模型，上面的GPU镜像无法兼容，请使用低版本镜像：

CPU环境镜像(python3.12)：
```
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py312-torch2.3.1-1.39.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py312-torch2.3.1-1.39.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py312-torch2.3.1-1.39.0
```
GPU环境镜像(python3.12)：
``` 
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py312-torch2.3.1-tf2.16.1-1.39.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py312-torch2.3.1-tf2.16.1-1.39.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py312-torch2.3.1-tf2.16.1-1.39.0
```

如果你运行在AMD gpu机器，可以使用以下镜像：
```
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-rocm7.2.3-py312-torch2.11.0-1.39.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-rocm7.2.3-py312-torch2.11.0-1.39.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-rocm7.2.3-py312-torch2.11.0-1.39.0
```

此外，我们针对大模型训练场景，提供了[ms-swift](https://github.com/modelscope/ms-swift)镜像，额外增加了[Megatron-SWIFT](https://swift.readthedocs.io/zh-cn/latest/Instruction/Megatron-SWIFT%E8%AE%AD%E7%BB%83.html)的依赖：
```
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.9.1-py312-torch2.10.0-vllm0.19.1-modelscope1.35.4-swift4.1.3
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.9.1-py312-torch2.10.0-vllm0.19.1-modelscope1.35.4-swift4.1.3
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.9.1-py312-torch2.10.0-vllm0.19.1-modelscope1.35.4-swift4.1.3
```

正常情况下，我们均**推荐您使用最新版本镜像**。 极少部分模型存在和最新镜像不兼容情况，可以参考模型卡片，使用下文提供的<a href="#历史镜像">历史镜像</a>。

## Python环境安装配置

首先，参考[文档](https://docs.anaconda.com/anaconda/install/) 安装配置Anaconda环境。
安装完成后，执行如下命令为ModelScope library创建对应的Python环境。

```shell
conda create -n modelscope python=3.12
conda activate modelscope
```

## ModelScope Library 安装

### pip安装

ModelScope Library由核心hub支持，框架，以及不同领域模型的对接组件组成。根据您实际使用的场景，可以选择不同的安装选项。

如果只需要通过ModelScope SDK，或者ModelScope命令行工具来[下载模型](../模型库/模型的下载.md)，可以只最轻量化的安装ModelScope的核心hub支持：

```shell
pip install modelscope
```

如果需要更完整的使用ModelScope平台上的一系列框架能力，包括**数据集的加载**，外部模型的使用等，则推荐使用"framework"的安装选项，也就是：
```shell
pip install modelscope[framework]
```

以上两种方法，都不涉及ModelScope上原生模型的集成。要使用ModelScope来实现各种领域模型的使用，包括基于NLP、CV、语音、多模态，等不同领域的模型，来进行模型推理以及模型训练、微调等能力，则需要根据具体领域，通过安装选项，来安装额外的依赖。同时也涉及对应的PyTorch,Tensorflow等机器学习框架的安装。


### 深度学习框架依赖的安装
注： 机器学习框架本身包通常较大，客观上在国内使用pip安装的时候，如果默认是用海外的pypi源的话，下载速度较慢。这种情况下，可以考虑通过pip的"-i"命令行选项，来手工配置仓库来源，例如"-i https://pypi.tuna.tsinghua.edu.cn/simple " 可以将配置仓库来源使用"清华源"。例如：

```shell
pip3 install torch -i https://pypi.tuna.tsinghua.edu.cn/simple
```

常见的可用源还包括 "-i https://mirrors.bfsu.edu.cn/pypi/web/simple", "-i https://mirrors.ustc.edu.cn/pypi/web/simple "等等，可以根据自己的网络条件自行选择。

此外，如果您在使用阿里云上环境（例如ECS，DSW等)，通过配置如下pip源，可以加快安装速度  
```shell
pip config set global.index-url https://mirrors.cloud.aliyuncs.com/pypi/simple 
pip config set install.trusted-host mirrors.cloud.aliyuncs.com
```

注： 如果在安装过程中遇到错误，可以前往[常见问题](https://modelscope.cn/docs/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)查找解决方案。

- 安装PyTorch[参考链接](https://pytorch.org/get-started/locally/)。

```shell
pip3 install torch torchvision torchaudio
```

- 安装Tensorflow[参考链接](https://www.tensorflow.org/install/pip)。

```shell
pip install --upgrade tensorflow==2.13.0 # 仅支持 CPU 的版本
```
::modelscope-table{type=env} 

### 分领域ModelScope模型依赖的安装
在ModelScope基础框架以及PyTorch,Tensorflow等机器学习框架基础之上，ModelScope对于不同领域的各种模型的集成，为开发者提供了通过相对统一的接口，来调用不同领域的模型。通常不同领域的模型所需要的依赖，也会有所不同，所以**ModelScope提供了针对不同领域模型的，不同的安装选项**。方便开发者针对自己所感兴趣的模型所处领域，实现领域模型有选择性的依赖安装。 具体而言，

- 如仅需体验`NLP`领域模型，可执行如下命令安装领域依赖（因部分依赖由ModelScope独立host，所以需要使用"-f"参数）：
```shell
pip install "modelscope[nlp]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

如果使用miniconda环境，需要提前安装setuptools_scm。

- 如仅需体验`CV`领域模型，可执行如下命令安装领域依赖（因部分依赖由ModelScope独立host，所以需要使用"-f"参数）：
```shell
pip install "modelscope[cv]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

- 如仅需体验`语音`领域模型，可执行如下命令安装领域依赖（因部分依赖由ModelScope独立host，所以需要使用"-f"参数）：
```shell
pip install "modelscope[audio]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

**注意：当前大部分语音模型需要在Linux环境上使用，并且推荐使用python3.8。**

- 如仅需体验`多模态`领域的模型，可执行如下命令安装领域依赖：
```shell
pip install "modelscope[multi-modal]" 
```

- 如仅需体验`科学计算`领域模型，请执行如下命令：
```shell
pip install "modelscope[science]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

**注**：

1. 如果您已经安装过ModelScope，但是需要升级使用新版发布的Library，可以使用
```shell
pip install modelscope --upgrade
```
来升级到最新版本。也可以通过指定特定版本号来选择选择某一版本。
2. **目前极少部分部分模型仅支持tensorflow1.15.5的Linux环境使用。  其他大部分模型可以在windows、mac（x86）上安装使用。**

3. 语音领域中一部分模型使用了三方库SoundFile进行wav文件处理，**在Linux系统上用户需要手动安装SoundFile的底层依赖库libsndfile**，在Windows和MacOS上会自动安装不需要用户操作。详细信息可参考[SoundFile官网](https://github.com/bastibe/python-soundfile#installation)。以Ubuntu系统为例，用户需要执行如下命令:

```shell
sudo apt-get update
sudo apt-get install libsndfile1
```

4. **CV领域的少数模型，需要安装mmcv-full， 如果运行过程中提示缺少mmcv，请参考mmcv**[**安装手册**](https://github.com/open-mmlab/mmcv#installation)**进行安装。** 注意这里需要安装的是mmcv 1.x版本(mmcv-full)，请不要安装mmcv 2.0及以上版本。
这里提供一个最简版的mmcv-full安装步骤，但是要达到最优的mmcv-full的安装效果（包括对于cuda版本的兼容），请根据自己的实际机器环境，以mmcv官方安装手册为准。

```shell
pip uninstall mmcv && pip uninstall mmcv-full # 如果已经安装过简装版本的mmcv，请先卸载
pip install -U openmim 
mim install mmcv-full
# 如果您使用python3.10，torch 2.1.0和2.1.1，cuda 11.8.0，12.1.0，可以按照如下方式安装 
# 版本1.7.0+torch2.1.1cu121 1.7.0+torch2.1.0cu121 1.7.0+torch2.1.1cu118 1.7.0+torch2.1.0cu118
pip install mmcv_full=='1.7.0+torch2.1.1cu121' -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

### 安装验证

安装成功后，即可使用对应领域模型进行推理，训练等操作。这里我们以NLP领域为例，在"pip install modelscope[nlp]"后，可执行如下命令，运行中文分词任务，来验证安装是否正确：

```shell
python -c "from modelscope.pipelines import pipeline;print(pipeline('word-segmentation')('今天天气不错，适合 出去游玩'))"
```

## 历史镜像
### 镜像版本命名规则
- CPU:  
`OS[version]-py[version]-torch[version]-tf[version]-[modelscope_version]`,
例如：  
ubuntu22.04-py310-torch2.1.2-tf2.14.0-1.13.1，表示镜像基于ubuntu22.04，python3.10,torch2.1.0,tensorflow 2.14.0, modelscope 1.13.1构建。  
- GPU:  
`OS[version]-cuda[version]-py[version]-torch[version]-tf[version]-[modelscope_version]`，例如：  
ubuntu22.04-cuda12.1.0-py310-torch2.1.2-tf2.14.0-1.13.1，表示镜像基于ubuntu22.04，cuda12.1.0,python3.10,torch2.1.0,tensorflow 2.14.0, modelscope 1.13.1构建。  

### 历史版本  

CPU环境镜像(python3.11)：
```
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py311-torch2.9.1-1.35.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py311-torch2.9.1-1.35.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py311-torch2.9.1-1.35.0
```
GPU环境镜像(python3.11)：
``` 
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py311-torch2.9.1-1.35.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py311-torch2.9.1-1.35.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py311-torch2.9.1-1.35.0
```

CPU环境镜像(python3.11)：
```
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py311-torch2.3.1-1.35.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py311-torch2.3.1-1.35.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py311-torch2.3.1-1.35.0
```

GPU环境镜像(python3.11)：
``` 
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py311-torch2.3.1-tf2.16.1-1.35.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py311-torch2.3.1-tf2.16.1-1.35.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py311-torch2.3.1-tf2.16.1-1.35.0
```

CPU环境镜像(python3.10)：

```
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py310-torch2.1.2-tf2.14.0-1.12.0
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py310-torch2.1.2-tf2.14.0-1.12.0
registry.us-west-1.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py310-torch2.1.2-tf2.14.0-1.12.0
```

GPU环境镜像(python3.10)：

```
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py310-torch2.1.2-tf2.14.0-1.12.0
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py310-torch2.1.2-tf2.14.0-1.12.0
registry.us-west-1.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py310-torch2.1.2-tf2.14.0-1.12.0
```

CPU环境镜像(python3.7)：
```
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py37-torch1.11.0-tf1.15.5-1.6.1
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py37-torch1.11.0-tf1.15.5-1.6.1
```
CPU环境镜像(python3.8)：
```
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py38-torch1.11.0-tf1.15.5-1.8.1
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py38-torch1.11.0-tf1.15.5-1.8.1
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py38-torch2.0.1-tf1.15.5-1.8.1
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py38-torch2.0.1-tf1.15.5-1.8.1
```
GPU环境镜像(python3.7)：
``` 
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.3.0-py37-torch1.11.0-tf1.15.5-1.6.1
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.3.0-py37-torch1.11.0-tf1.15.5-1.6.1
```
GPU环境镜像(python3.8)：
``` 
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.3.0-py38-torch1.11.0-tf1.15.5-1.8.1
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.3.0-py38-torch1.11.0-tf1.15.5-1.8.1
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.7.1-py38-torch2.0.1-tf1.15.5-1.8.1
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.7.1-py38-torch2.0.1-tf1.15.5-1.8.1
```

CPU环境镜像(python3.8)：
```
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py38-torch2.0.1-tf2.13.0-1.9.5
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py38-torch2.0.1-tf2.13.0-1.9.5
registry.us-west-1.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py38-torch2.0.1-tf2.13.0-1.9.5
```
GPU环境镜像(python3.8)：
``` 
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.8.0-py38-torch2.0.1-tf2.13.0-1.9.5
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.8.0-py38-torch2.0.1-tf2.13.0-1.9.5
registry.us-west-1.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.8.0-py38-torch2.0.1-tf2.13.0-1.9.5
```

## SWIFT安装

[SWIFT](https://github.com/modelscope/swift)是ModelScope官方提供的大模型（LLM&SD模型）训练推理框架。如果你对这类模型的训练过程有需求，推荐使用SWIFT。

#### Wheel包安装

可以使用pip进行安装：

```shell
pip install ms-swift -U
```

#### 源代码安装

```shell
git clone https://github.com/modelscope/swift.git
cd swift
pip install -e .
```

有关如何使用SWIFT，可以参考[Swift使用指南](../大模型训练与推理/入门介绍/SWIFT安装.md)。

有关如何使用大模型进行训练和推理, 可以参考[大模型训练与推理](../大模型训练与推理/功能指引/预训练及微调.md)。

## Notebook环境

用户可以使用ModelScope官方提供的免费显卡资源：

1. 进入[ModelScope](https://www.modelscope.cn)官方网站并登录
2. 点击左侧的`我的Notebook`并开启一个免费GPU实例
3. 愉快地薅A10显卡羊毛
