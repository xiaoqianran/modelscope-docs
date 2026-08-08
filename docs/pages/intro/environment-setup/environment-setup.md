<!-- modelscope-docs: Environment Setup | intro/environment-setup/environment-setup_EN.md -->

This article introduces the environment configuration guide required for using ModelScope.

ModelScope Library currently supports model and dataset acquisition and management, as well as model training and inference based on learning frameworks such as PyTorch and TensorFlow. It has been tested to run on Python 3.8+, PyTorch 1.11+, and TensorFlow.

**Note: Most speech models currently require a Linux environment, and we recommend using the combination of python3.8 + tensorflow 2.13.0 + torch 2.0.1. Some multimodal models can be installed and used on macOS and Windows environments, while a few models require tensorflow1.15.0.**

## Using ModelScope Official Docker Images Directly

To enable users to use models on the ModelScope platform without configuring the environment, ModelScope provides official Docker images in addition to the integrated Notebook online programming environment on the website, making it convenient for developers who need them. Based on the official images, you can skip all environment installation and configuration steps and use ModelScope directly. The latest CPU and GPU images can be obtained from the following addresses:

### Latest Images

CPU Environment Images(python3.12):
```
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py312-torch2.10.0-1.39.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py312-torch2.10.0-1.39.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py312-torch2.10.0-1.39.0
```

GPU Environment Images(python3.12):
``` 
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py312-torch2.10.0-1.39.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py312-torch2.10.0-1.39.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py312-torch2.10.0-1.39.0
```

These images can be used to run large language models, diffusion models, Megatron models, funasr pipelines. 
If you need to use small models like BERT/YOLO, ModelScope also offers some compatible images:

CPU Images(python3.12)：
```
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py312-torch2.3.1-1.39.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py312-torch2.3.1-1.39.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py312-torch2.3.1-1.39.0
```
GPU Images(python3.12)：
``` 
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py312-torch2.3.1-tf2.16.1-1.39.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py312-torch2.3.1-tf2.16.1-1.39.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py312-torch2.3.1-tf2.16.1-1.39.0
```

If you are running on AMD GPU machines, you can use the following images:
```
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-rocm7.2.3-py312-torch2.11.0-1.39.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-rocm7.2.3-py312-torch2.11.0-1.39.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-rocm7.2.3-py312-torch2.11.0-1.39.0
```

Furthermore, for large model training scenarios, we provide [ms-swift](https://github.com/modelscope/ms-swift) images with additional dependencies for [Megatron-SWIFT](https://swift.readthedocs.io/zh-cn/latest/Megatron-SWIFT/%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B.html):
```
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.9.1-py312-torch2.10.0-vllm0.19.1-modelscope1.35.4-swift4.1.3
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.9.1-py312-torch2.10.0-vllm0.19.1-modelscope1.35.4-swift4.1.3
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.9.1-py312-torch2.10.0-vllm0.19.1-modelscope1.35.4-swift4.1.3
```

Under normal circumstances, we **recommend using the latest version images**. For the rare cases where models are incompatible with the latest images, please refer to the model cards and use the <a href="#historical-images">historical images</a> provided below.

## Python Environment Installation and Configuration

First, install and configure the Anaconda environment by referring to the [documentation](https://docs.anaconda.com/anaconda/install/).
After installation, execute the following commands to create a corresponding Python environment for ModelScope library.

```shell
conda create -n modelscope python=3.12
conda activate modelscope
```

## ModelScope Library Installation

### pip Installation

ModelScope Library consists of core hub support, frameworks, and integration components for models across different domains. Depending on your actual usage scenario, you can choose different installation options.

If you only need to [download models](../models/model-download.md) using the ModelScope SDK or ModelScope command-line tools, you can install only the minimal core hub support of ModelScope:

```shell
pip install modelscope
```

If you need more comprehensive capabilities of the ModelScope platform, including **dataset loading** and using external models, we recommend using the "framework" installation option:

```shell
pip install modelscope[framework]
```

Neither of the above methods involves integration with native models on ModelScope. To use ModelScope for various domain models—including NLP, CV, audio, multimodal, and other domains—for model inference, training, fine-tuning, etc., you need to install additional dependencies based on the specific domain through installation options. This also involves installing corresponding machine learning frameworks such as PyTorch and TensorFlow.

### Deep Learning Framework Dependency Installation

Note: Machine learning framework packages are typically large, and when using pip to install them in China with the default overseas PyPI source, the download speed can be slow. In such cases, you can consider using pip's "-i" command-line option to manually configure the repository source. For example, "-i https://pypi.tuna.tsinghua.edu.cn/simple" configures the repository source to use "Tsinghua Source". For example:

```shell
pip3 install torch -i https://pypi.tuna.tsinghua.edu.cn/simple
```

Other commonly available sources include "-i https://mirrors.bfsu.edu.cn/pypi/web/simple", "-i https://mirrors.ustc.edu.cn/pypi/web/simple", etc. You can choose based on your network conditions.

Additionally, if you are using Alibaba Cloud environments (such as ECS, DSW, etc.), configuring the following pip source can speed up installation:
```shell
pip config set global.index-url https://mirrors.cloud.aliyuncs.com/pypi/simple
pip config set install.trusted-host mirrors.cloud.aliyuncs.com
```

Note: If you encounter errors during installation, you can find solutions in the [FAQ](https://modelscope.cn/docs/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98).

- Install PyTorch [reference link](https://pytorch.org/get-started/locally/).

```shell
pip3 install torch torchvision torchaudio
```

- Install TensorFlow [reference link](https://www.tensorflow.org/install/pip).

```shell
pip install --upgrade tensorflow==2.13.0 # CPU-only version
```
::modelscope-table{type=env}

### Domain-specific ModelScope Model Dependency Installation

Based on the ModelScope core framework and machine learning frameworks like PyTorch and TensorFlow, ModelScope integrates various models across different domains, providing developers with a relatively unified interface to call models from different domains. Since different domain models typically require different dependencies, **ModelScope provides different installation options for models in different domains**. This allows developers to selectively install dependencies for the specific domain of models they are interested in. Specifically:

- To experience only `NLP` domain models, execute the following command to install domain dependencies (since some dependencies are independently hosted by ModelScope, the "-f" parameter is required):
```shell
pip install "modelscope[nlp]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

If using a miniconda environment, you need to install setuptools_scm in advance.

- To experience only `CV` domain models, execute the following command to install domain dependencies (since some dependencies are independently hosted by ModelScope, the "-f" parameter is required):
```shell
pip install "modelscope[cv]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

- To experience only `audio` domain models, execute the following command to install domain dependencies (since some dependencies are independently hosted by ModelScope, the "-f" parameter is required):
```shell
pip install "modelscope[audio]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

**Note: Currently, most audio models require a Linux environment, and we recommend using python3.8.**

- To experience only `multimodal` domain models, execute the following command to install domain dependencies:
```shell
pip install "modelscope[multi-modal]"
```

- To experience only `science` domain models, execute the following command:
```shell
pip install "modelscope[science]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

**Notes**:

1. If you have already installed ModelScope but need to upgrade to use the newly released Library version, you can use
```shell
pip install modelscope --upgrade
```
to upgrade to the latest version. You can also specify a particular version number to select a specific version.
2. **Currently, a very small number of models only support TensorFlow 1.15.5 on Linux environments. Most other models can be installed and used on Windows and macOS (x86).**

3. Some models in the audio domain use the third-party library SoundFile for WAV file processing. **On Linux systems, users need to manually install libsndfile, the underlying dependency library of SoundFile. On Windows and macOS, it is automatically installed without user intervention.** For detailed information, please refer to the [SoundFile official website](https://github.com/bastibe/python-soundfile#installation). Taking Ubuntu as an example, users need to execute the following commands:

```shell
sudo apt-get update
sudo apt-get install libsndfile1
```

4. **A few models in the CV domain require installing mmcv-full. If you encounter missing mmcv during runtime, please refer to the mmcv [installation manual](https://github.com/open-mmlab/mmcv#installation) for installation.** Note that you need to install mmcv 1.x version (mmcv-full), not mmcv 2.0 or higher versions.
Here is a minimal mmcv-full installation procedure, but for optimal mmcv-full installation results (including CUDA version compatibility), please follow the official mmcv installation manual according to your actual machine environment.

```shell
pip uninstall mmcv && pip uninstall mmcv-full # If you have already installed the lightweight version of mmcv, please uninstall it first
pip install -U openmim
mim install mmcv-full
# If you are using python3.10, torch 2.1.0 and 2.1.1, cuda 11.8.0, 12.1.0, you can install as follows
# Versions: 1.7.0+torch2.1.1cu121 1.7.0+torch2.1.0cu121 1.7.0+torch2.1.1cu118 1.7.0+torch2.1.0cu118
pip install mmcv_full=='1.7.0+torch2.1.1cu121' -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

### Installation Verification

After successful installation, you can use models from the corresponding domain for inference, training, and other operations. Taking the NLP domain as an example, after running "pip install modelscope[nlp]", you can execute the following command to run a Chinese word segmentation task to verify the installation:

```shell
python -c "from modelscope.pipelines import pipeline;print(pipeline('word-segmentation')('The weather is nice today, perfect for going out.'))"
```

## Historical Images

### Image Version Naming Rules

- CPU:
`OS[version]-py[version]-torch[version]-tf[version]-[modelscope_version]`,
For example:
ubuntu22.04-py310-torch2.1.2-tf2.14.0-1.13.1 indicates an image built on ubuntu22.04, python3.10, torch2.1.0, tensorflow 2.14.0, modelscope 1.13.1.
- GPU:
`OS[version]-cuda[version]-py[version]-torch[version]-tf[version]-[modelscope_version]`, for example:
ubuntu22.04-cuda12.1.0-py310-torch2.1.2-tf2.14.0-1.13.1 indicates an image built on ubuntu22.04, cuda12.1.0, python3.10, torch2.1.0, tensorflow 2.14.0, modelscope 1.13.1.

### Historical Versions

CPU Environment Images(python3.11):
```
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py311-torch2.9.1-1.35.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py311-torch2.9.1-1.35.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py311-torch2.9.1-1.35.0
```

GPU Environment Images(python3.11):
``` 
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py311-torch2.9.1-1.35.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py311-torch2.9.1-1.35.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py311-torch2.9.1-1.35.0
```

CPU Environment Images(python3.11):
```
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py311-torch2.3.1-1.35.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py311-torch2.3.1-1.35.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py311-torch2.3.1-1.35.0
```

GPU Environment Images(python3.11):
``` 
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py311-torch2.3.1-tf2.16.1-1.35.0
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py311-torch2.3.1-tf2.16.1-1.35.0
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py311-torch2.3.1-tf2.16.1-1.35.0
```

CPU environment images (python3.10):

```
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py310-torch2.1.2-tf2.14.0-1.12.0
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py310-torch2.1.2-tf2.14.0-1.12.0
registry.us-west-1.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-py310-torch2.1.2-tf2.14.0-1.12.0
```

GPU environment images (python3.10):

```
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py310-torch2.1.2-tf2.14.0-1.12.0
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py310-torch2.1.2-tf2.14.0-1.12.0
registry.us-west-1.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.1.0-py310-torch2.1.2-tf2.14.0-1.12.0
```

CPU environment images (python3.7):
```
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py37-torch1.11.0-tf1.15.5-1.6.1
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py37-torch1.11.0-tf1.15.5-1.6.1
```
CPU environment images (python3.8):
```
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py38-torch1.11.0-tf1.15.5-1.8.1
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py38-torch1.11.0-tf1.15.5-1.8.1
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py38-torch2.0.1-tf1.15.5-1.8.1
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py38-torch2.0.1-tf1.15.5-1.8.1
```
GPU environment images (python3.7):
```
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.3.0-py37-torch1.11.0-tf1.15.5-1.6.1
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.3.0-py37-torch1.11.0-tf1.15.5-1.6.1
```
GPU environment images (python3.8):
```
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.3.0-py38-torch1.11.0-tf1.15.5-1.8.1
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.3.0-py38-torch1.11.0-tf1.15.5-1.8.1
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.7.1-py38-torch2.0.1-tf1.15.5-1.8.1
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.7.1-py38-torch2.0.1-tf1.15.5-1.8.1
```

CPU environment images (python3.8):
```
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py38-torch2.0.1-tf2.13.0-1.9.5
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py38-torch2.0.1-tf2.13.0-1.9.5
registry.us-west-1.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-py38-torch2.0.1-tf2.13.0-1.9.5
```
GPU environment images (python3.8):
```
registry.cn-hangzhou.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.8.0-py38-torch2.0.1-tf2.13.0-1.9.5
registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.8.0-py38-torch2.0.1-tf2.13.0-1.9.5
registry.us-west-1.aliyuncs.com/modelscope-repo/modelscope:ubuntu20.04-cuda11.8.0-py38-torch2.0.1-tf2.13.0-1.9.5
```

## SWIFT Installation

[SWIFT](https://github.com/modelscope/swift) is the official large model (LLM & SD model) training and inference framework provided by ModelScope. If you have requirements for training these types of models, we recommend using SWIFT.

#### Wheel Package Installation

You can install using pip:

```shell
pip install ms-swift -U
```

#### Source Code Installation

```shell
git clone https://github.com/modelscope/swift.git
cd swift
pip install -e .
```

For how to use SWIFT, please refer to the [Swift User Guide](../llm-training-and-inference/getting-started/swift-installation.md).

For how to train and infer large models, please refer to [Large Model Training and Inference](../llm-training-and-inference/feature-guide/pretraining-and-fine-tuning.md).

## Notebook Environment

Users can use the free GPU resources provided by ModelScope:

1. Visit the [ModelScope](https://www.modelscope.cn) official website and log in
2. Click on `My Notebook` on the left and start a free GPU instance
3. Enjoy using the free A10 GPU resources