<!-- modelscope-docs: llamacpp加载ModelScope模型 | models/advanced-usage/llama-cpp-integration/llama-cpp-integration_CN.md -->

# 🦙 llama.cpp 简介

**llama.cpp** 是一个通过 **C/C++** 实现的推理引擎，它的核心目标是：**以极低的资源消耗，在各种硬件（尤其是消费级 CPU）上实现大语言模型的高效推理。**

**llama.cpp** 提供了原生的 **GGUF** 格式，可以将模型压缩至 8-bit、4-bit、2-bit 甚至更低的精度，使得在低配置电脑上运行大模型成为可能。
同时，llama.cpp也提供了面向LLM，多模态模型的多样化支持， 并能通过内置轻量级服务器提供 Web 服务，支持类似 OpenAI 的 API 接口及简易的 Web 聊天界面。

ModelScope社区上托管了[上万个优质的GGUF格式](https://modelscope.cn/models?libraries=GGUF)的大模型（包括LLM和视觉多模态模型），并支持了llama-cpp引擎和ModelScope平台的链接，
通过配置一个环境变量，就能以简单的 `llama-cli`，`llama-server`等命令，**直接加载并运行ModelScope模型库上的GGUF模型**。

# ModelScope 模型生态与llama.cpp的联动
## 一键运行
例如对于 [ggml-org/gemma-3-1b-it-GGUF](https://modelscope.cn/models/ggml-org/gemma-3-1b-it-GGUF) 这个模型，我们可以通过如下的
命令实现GGUF模型的加载运行：

```shell
MODEL_ENDPOINT=https://www.modelscope.cn/ ./llama-cli -hf ggml-org/gemma-3-1b-it-GGUF
```
<div align=center><img height="500" src="./_resources/llama-cpp-llm.png" /></div>

如上命令行的具体格式为:
```shell
MODEL_ENDPOINT=https://www.modelscope.cn/ ./llama-cli -hf {modelscope-model-id}
```

其中`model-id`的具体格式为`{username}/{model}`。

上面的这些命令里，通过配置环境变量`MODEL_ENDPOINT`，指定了从ModelScope下载模型，当然你也可以用独立的一条命令来配置环境变量：
```shell
export MODEL_ENDPOINT="https://www.modelscope.cn/"
```

关于如何安装llama.cpp，可参考其[官方GitHub说明](https://github.com/ggml-org/llama.cpp/blob/master/docs/install.md)。Linux环境上的一键安装，也可以使用ModelScope上的[Linux安装包](https://modelscope.cn/models/modelscope/llamacpp-linux)。

## 配置定制

### 多精度的选择
llama.cpp支持加载不同精度的GGUF模型，同时在一个GGUF模型库中，一般也会有不同精度的模型文件存在，例如Q8_0， Q4_K_M, Q3_K_M,等等，如下图所示：
<div align=center><img height="400" src="./_resources/llama-cpp-ggufs.png" /></div>

一个模型repo下的不同GGUF文件，对应的是不同量化精度与量化方法。默认情况下，如果模型repo里有**Q4_K_M版本**的话，llama.cpp会**自动拉取并使用该版本**，
在推理精度以及推理速度，资源消耗之间做一个较好的均衡。 此外，您也可以显式配置来指定想要使用的版本。例如
```shell
MODEL_ENDPOINT=https://www.modelscope.cn/ ./llama-cli -hf ggml-org/gemma-3-1b-it-GGU:Q8_0
```
这里命令行最后的`:Q8_0`选项，就指定了使用Q8_0精度的GGUF模型版本。

### 视觉多模态模型使用
除了大语言模型（LLM）以外，llama.cpp也支持视觉多模态模型的推理。对于多模态模型，推理一般需要两个GGUF文件，除了主体大模型外，还需要一个mmproj，负责
视觉编码。所以多模态理解（VL）模型的GGUF版本，模型仓库里一般都会有一个mmproj GGUF文件，这个文件需要独立下载后，在拉起llama.cpp时单独指定。这里
我们以 [ggml-org/gemma-3-4b-it-GGUF](https://modelscope.cn/models/ggml-org/gemma-3-4b-it-GGUF) 模型为例，其仓库中包含如下GGUF文件：
<div align=center><img height="300" src="./_resources/llama-cpp-vl-ggufs.png" /></div>

为了拉起这个模型，我们需要先手动下载mmproj文件到本地，这里推荐使用[ModelScope命令行](../模型的下载.md)：
```shell
modelscope download --model ggml-org/gemma-3-4b-it-GGUF mmproj-model-f16.gguf --local_dir /mnt/worksapce/
```
然后就可以使用`llama-cli`命令行工具拉起：
```shell
MODEL_ENDPOINT=https://www.modelscope.cn/  ./llama-cli -hf ggml-org/gemma-3-4b-it-GGUF \
            --mmproj /mnt/workspace/mmproj-model-f16.gguf \
            --image /path/to/your_image.png \
            -p "Describe this image."
```
<div align=center><img height="500" src="./_resources/llama-cpp-vl.png" /></div>

## 更多llama.cpp的使用
除了使用`llama-cli`命令行来使用ModelScope上丰富的GGUF模型以外，llama.cpp提供了多样化的使用方式，例如你可以通过
`llama-server`来启动llamacpp服务器。这个本地的服务不仅提供 API 接口（OpenAI API兼容），还会自动托管一个功能齐全的网页界面。
类似于`llama-cli`命令行，`llama-server`要与ModelScope模型生态联动，也只是需要配置`MODEL_ENDPOINT=https://www.modelscope.cn/`
这个环境变量。

对于包括`llama-server`在内的其他llama.cpp工具的使用，可以参考llama.cpp的[官方文档](https://github.com/ggml-org/llama.cpp)。