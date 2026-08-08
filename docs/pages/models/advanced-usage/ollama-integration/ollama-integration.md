<!-- modelscope-docs: Loading ModelScope Models with Ollama | models/advanced-usage/ollama-integration/ollama-integration_EN.md -->

# Loading ModelScope Models with Ollama

Ollama is a large language model inference framework built on top of the llama.cpp open-source inference engine. Thanks to the efficient model inference provided by its underlying engine and multi-hardware compatibility, Ollama can run various GGUF-format large models with different precisions across diverse hardware environments, including both CPU and GPU. With just a single command line, you can launch an LLM model service.

The ModelScope community hosts thousands of high-quality GGUF-format large models (including LLMs and vision multimodal models) and supports direct integration between the Ollama framework and the ModelScope platform. Through a simple `ollama run` command, you can **directly load and run GGUF models from the ModelScope model repository**.

## One-click Execution
```shell
ollama run modelscope.ai/Qwen/Qwen2.5-3B-Instruct-GGUF
```
In an environment with Ollama installed (we recommend using version >=0.3.12), you can directly run the Qwen2.5-3B-Instruct-GGUF model locally using the command above.

![ollama-pull.png](./_resources/ollama-pull.png)

The specific command format is:
```shell
ollama run modelscope.ai/{model-id}
```

Where `model-id` follows the format `{username}/{model}`, for example:
```shell
ollama run modelscope.ai/Qwen/Qwen2.5-3B-Instruct-GGUF
ollama run modelscope.ai/second-state/gemma-2-2b-it-GGUF
ollama run modelscope.ai/Shanghai_AI_Laboratory/internlm2_5-7b-chat-gguf
```
For instructions on installing Ollama, please refer to the Ollama [official documentation](https://ollama.com/download) (we recommend using version >=0.3.12). For one-click installation on Linux environments, you can also use the [Linux installation package](https://www.modelscope.ai/models/modelscope/ollama-linux) available on ModelScope.

## Configuration Customization

Ollama supports loading GGUF models with different precisions. Typically, a GGUF model repository contains model files with various precision levels, such as Q3_K_M, Q4_K_M, Q5_K, etc., as shown in the image below:
![gguf-files.png](./_resources/gguf-files.png)

Different GGUF files within a model repository correspond to different quantization precisions and quantization methods. By default, if a Q4_K_M version exists in the model repository, we will automatically pull and use this version, achieving a good balance between inference accuracy, inference speed, and resource consumption. If this version is not available, we will select an appropriate alternative version.

Additionally, you can explicitly configure which version to use. For example:
```shell
ollama run modelscope.ai/Qwen/Qwen2.5-3B-Instruct-GGUF:Q3_K_M
```
The `:Q3_K_M` option at the end of the command specifies using the Q3_K_M precision GGUF model version. This option is case-insensitive, meaning both `:Q3_K_M` and `:q3_k_m` will use the "qwen2.5-3b-instruct-q3_k_m.gguf" model file from the repository. Of course, you can also directly specify the full model filename, which is also supported:
```shell
ollama run modelscope.ai/Qwen/Qwen2.5-3B-Instruct-GGUF:qwen2.5-3b-instruct-q3_k_m.gguf
```

### Using Vision Multimodal Models
Beyond common LLMs, this approach also supports vision multimodal models including Llama3.2-Vision. For these models, ensure you're using Ollama version 0.4.0 or higher.
For example:
```shell
ollama run modelscope.ai/AI-ModelScope/Llama-3.2-11B-Vision-Instruct-GGUF
```
![vision-ollama.png](./_resources/vision-ollama.png)

## Additional Configuration Options
Ollama supports customizing large model inference parameters through Modelfile configuration files. The integration between ModelScope and Ollama will **automatically generate** the required configurations and parameters for each model based on the GGUF model information on the platform, including inference templates and model parameters.

Furthermore, when model contributors configure parameters such as template or params in their model repository, we will prioritize the parameter configurations from the repository. Specifically:

- **Custom chat templates**: You can create a new template file named `template` in your model repository. The template must be in Go template format, for example:
```
{{ if .System }}<|system|>
{{ .System }}<|end|>
{{ end }}{{ if .Prompt }}<|user|>
{{ .Prompt }}<|end|>
{{ end }}<|assistant|>
{{ .Response }}<|end|>
```
For more information about Go template format, please refer to the [Ollama official documentation](https://github.com/ollama/ollama/blob/main/docs/template.md).

- **Custom System Prompt**: You can create a new file named `system` in your model repository to configure the System Prompt.
- **Custom model parameters**: You can create a JSON-formatted file named `params` in your model repository. For details, please refer to the [Ollama official documentation](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#parameter).