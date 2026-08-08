<!-- modelscope-docs: Ollama加载ModelScope模型 | models/advanced-usage/ollama-integration/ollama-integration_CN.md -->

# Ollama加载ModelScope模型

Ollama是建立在llama.cpp开源推理引擎基础上的大模型推理工具框架。得益于底层引擎提供的高效模型推理，以及多硬件适配，Ollama能够在包括CPU、GPU在内的，不同的硬件环境上，运行各种精度的GGUF格式大模型。通过一个命令行就能拉起LLM模型服务。

ModelScope社区上托管了[上万个优质的GGUF格式](https://modelscope.cn/models?libraries=GGUF)的大模型（包括LLM和视觉多模态模型），并支持了Ollama框架和ModelScope平台的链接，通过简单的 `ollama run`命令，就能**直接加载运行ModelScope模型库上的GGUF模型**。

## 一键运行
```shell
ollama run modelscope.cn/Qwen/Qwen2.5-3B-Instruct-GGUF
```
在安装了Ollama的环境(建议使用>=0.3.12版本)上，直接通过上面的命令行，就可以直接在本地运行 Qwen2.5-3B-Instruct-GGUF模型。

![ollama-pull.png](./_resources/ollama-pull.png)  

命令行的具体格式为:
```shell
ollama run modelscope.cn/{model-id}
```

其中`model-id`的具体格式为`{username}/{model}`，例如：
```shell
ollama run modelscope.cn/Qwen/Qwen2.5-3B-Instruct-GGUF
ollama run modelscope.cn/second-state/gemma-2-2b-it-GGUF
ollama run modelscope.cn/Shanghai_AI_Laboratory/internlm2_5-7b-chat-gguf
```
关于如何安装Ollama，可参考Ollama[官方文档](https://ollama.com/download)(建议使用>=0.3.12版本)。Linux环境上的一键安装，也可以使用ModelScope上的[Linux安装包](https://www.modelscope.cn/models/modelscope/ollama-linux)。

## 配置定制

### 多精度的选择
Ollama支持加载不同精度的GGUF模型，同时在一个GGUF模型库中，一般也会有不同精度的模型文件存在，例如Q3_K_M, Q4_K_M, Q5_K等等，入下图所示：
![gguf-files.png](./_resources/gguf-files.png)  

一个模型repo下的不同GGUF文件，对应的是不同量化精度与量化方法。默认情况下，如果模型repo里有Q4_K_M版本的话，我们会自动拉取并使用该版本，在推理精度以及推理速度，资源消耗之间做一个较好的均衡。如果没有该版本，我们会选择合适的其他版本。

此外，您也可以显式配置来指定想要使用的版本。例如
```shell
ollama run modelscope.cn/Qwen/Qwen2.5-3B-Instruct-GGUF:Q3_K_M
```
这里命令行最后的`:Q3_K_M`选项，就指定了使用Q3_K_M精度的GGUF模型版本，这个选项大小写不敏感，也就是说，无论是`:Q3_K_M`，还是`:q3_k_m`，都是使用模型repo里的"qwen2.5-3b-instruct-q3_k_m.gguf" 这个模型文件。当然，您也可以直接指定模型文件的全称，这同样是支持的：
 ```shell
ollama run modelscope.cn/Qwen/Qwen2.5-3B-Instruct-GGUF:qwen2.5-3b-instruct-q3_k_m.gguf
```

### 视觉多模态模型使用
除了常见的LLM以外，这种使用方式也支持了包括Llama3.2-Vision在内的视觉多模态模型。这类模型需要确保使用Ollama 0.4.0以上的版本。
例如：
```shell
ollama run modelscope.cn/AI-ModelScope/Llama-3.2-11B-Vision-Instruct-GGUF
```
![vision-ollama.png](./_resources/vision-ollama.png)

## 更多配置选项
Ollama支持通过Modelfile配置文件，来实现大模型推理的参数自定义。ModelScope与Ollama的对接，会根据平台上GGUF模型的信息，**自动生成**每个模型需要的配置与参数，包括推理模版（Template），模型参数（Parameters）等等。

此外，当模型贡献者在模型repo里，配置了template或params等参数，我们将以repo里的参数配置为准。具体而言：

- 自定义聊天模板（template）。你可以在模型repo中创建一个名为 `template` 的新模版文件。该模版必须是 Go 模版,例如：
```
{{ if .System }}<|system|>
{{ .System }}<|end|>
{{ end }}{{ if .Prompt }}<|user|>
{{ .Prompt }}<|end|>
{{ end }}<|assistant|>
{{ .Response }}<|end|>
```
要了解更多关于 Go 模板格式的信息，可参考[Ollama官方文档](https://github.com/ollama/ollama/blob/main/docs/template.md) 。

- 自定义System Prompt。你可以模型repo中创建一个名为 `system` 的新文件来配置System Prompt。
- 自定义模型参数（Parameters）。你可以模型repo中创建一个名为 `params`  的 JSON 格式文件。具体可参考[Ollama官方文档](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#parameter)。