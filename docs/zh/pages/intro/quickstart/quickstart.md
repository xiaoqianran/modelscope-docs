<!-- modelscope-docs: 快速开始 | intro/quickstart/quickstart_CN.md -->

# 快速开始

本文适用于刚刚接触魔搭ModelScope社区的用户，目标是5分钟内熟悉魔搭社区的模型下载和模型推理。希望帮助您设置开发环境，并顺利从魔搭社区开始模型学习，使用和开发。

# 环境安装

您可以使用魔搭社区已经预安装好的 [Notebook环境](https://modelscope.cn/my/mynotebook/preset) 来使用魔搭社区模型。魔搭社区Notebook为新用户提供了一定额度的免费GPU算力（参见[文档](../../notebook/intro/intro_CN.md)）和不限时长的免费CPU算力，并预安装了大部分模型可运行的环境依赖。

如果您希望在本地开发环境使用魔搭社区的模型， 我们推荐使用ModelScope SDK下载模型。您可以使用如下命令安装ModelScope SDK：

```shell
pip install modelscope
```

同时我们推荐您安装 [Git](https://git-scm.com/downloads)  和 [Git LFS](https://git-lfs.com/) ，这是模型管理包括上传所必须的工具。

# 模型下载

如果您在高带宽的机器上运行，推荐使用ModelScope命令行工具下载模型。该方法支持断点续传和模型高速下载，例如可以通过如下命令，将Qwen2.5-0.5B-Instruct模型，下载到当前路径下的"model-dir"目录。

```
modelscope download --model="Qwen/Qwen2.5-0.5B-Instruct" --local_dir ./model-dir
```

您也可以使用ModelScope Python SDK下载模型，该方法支持断点续传和模型高速下载：

```python
from modelscope import snapshot_download
model_dir = snapshot_download("Qwen/Qwen2.5-0.5B-Instruct")
```

由于模型都是通过Git存储，所以也可以在安装Git LFS后，通过git clone的方式在本地下载模型，例如：

```
git lfs install
git clone https://www.modelscope.cn/Qwen/Qwen2.5-0.5B-Instruct.git
```
关于模型下载的详细说明，可参考[模型下载文档](../模型库/模型的下载.md)。

同时，如果模型和ModelScope SDK绑定，则只需要几行代码即可加载模型，同时ModelScope还支持通过AutoModel等接口来加载模型。如下是使用AutoModel和pipeline方式加载模型的示例：

### 使用AutoModel加载模型：
ModelScope支持原生的pipeline推理，同时也兼容了由Transformers，Diffusers等提供的AutoModel和Pipeline的加载。

例如在安装 modelscope 和 transformers 之后，就可以通过如下代码进行LLM的推理。
```shell
pip install transformers
```
```python
from modelscope import AutoModelForCausalLM, AutoTokenizer

model_name = "Qwen/Qwen2.5-0.5B-Instruct"

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained(model_name)
```

### 使用ModelScope pipeline加载模型：

```python
from modelscope.pipelines import pipeline
word_segmentation = pipeline('word-segmentation',model='damo/nlp_structbert_word-segmentation_chinese-base')
```

# 模型推理

推理不同模态多种任务，pipeline是最简单、最快捷的方法。您可以使用开箱即用的pipeline执行跨不同模式的多种任务，下面是一个pipeline完整的运行示例：

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

inference_pipeline = pipeline(
    task=Tasks.auto_speech_recognition,
    model='iic/speech_paraformer-large-vad-punc_asr_nat-zh-cn-16k-common-vocab8404-pytorch',
    model_revision="v2.0.4")

rec_result = inference_pipeline('https://isv-data.oss-cn-hangzhou.aliyuncs.com/ics/MaaS/ASR/test_audio/asr_vad_punc_example.wav')
print(rec_result)
```

ModelScope兼容了Transformers提供的简单而统一的方法来加载预训练实例和tokenizer。这意味着您可以使用ModelScope加载AutoModel和AutoTokenizer等类。下面是一个大语言模型的完整的运行示例：

```python
from modelscope import AutoModelForCausalLM, AutoTokenizer

model_name = "Qwen/Qwen2.5-0.5B-Instruct"

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

prompt = "Give me a short introduction to large language model."
messages = [
    {"role": "system", "content": "You are Qwen, created by Alibaba Cloud. You are a helpful assistant."},
    {"role": "user", "content": prompt}
]
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True
)
model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

generated_ids = model.generate(
    **model_inputs,
    max_new_tokens=512
)
generated_ids = [
    output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
]

response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
```

对于暂时未与ModelScope SDK做原生集成的模型，可以先从ModelScope上下载模型，然后通过其他的主流库实现模型推理，以SDXL-Turbo模型为例，完整的模型推理运行示例如下：

```python
from diffusers import AutoPipelineForText2Image
import torch
from modelscope import snapshot_download

model_dir = snapshot_download("AI-ModelScope/sdxl-turbo")

pipe = AutoPipelineForText2Image.from_pretrained(model_dir, torch_dtype=torch.float16, variant="fp16")
pipe.to("cuda")

prompt = "A cinematic shot of a baby racoon wearing an intricate italian priest robe."

image = pipe(prompt=prompt, num_inference_steps=1, guidance_scale=0.0).images[0]
image.save("image.png")
```

# 模型微调

ms-swift是魔搭社区提供的大模型与多模态大模型微调部署框架，现已支持500+大模型与200+多模态大模型的训练（预训练、微调、人类对齐）、推理、评测、量化与部署。其中大模型包括：Qwen3、Qwen3-MoE、Qwen2.5、InternLM3、GLM4、Mistral、DeepSeek-R1、Yi1.5、TeleChat2、Baichuan2、Gemma2等模型，多模态大模型包括：Qwen2.5-VL、Qwen2-Audio、Llama4、Llava、InternVL3、MiniCPM-V-2.6、GLM4v、Xcomposer2.5、Yi-VL、DeepSeek-VL2、Phi3.5-Vision、GOT-OCR2等模型。

除此之外，ms-swift汇集了最新的训练技术，包括LoRA、QLoRA、Llama-Pro、LongLoRA、GaLore、Q-GaLore、LoRA+、LISA、DoRA、FourierFt、ReFT、UnSloth、和Liger等轻量化训练技术，以及DPO、GRPO、RM、PPO、KTO、CPO、SimPO、ORPO等人类对齐训练方法。ms-swift支持使用vLLM和LMDeploy对推理、评测和部署模块进行加速，并支持使用GPTQ、AWQ、BNB等技术对大模型进行量化。ms-swift还提供了基于Gradio的Web-UI界面及丰富的最佳实践。

安装依赖

```python
pip install ms-swift -U
```

微调脚本

```python
# 22GB
CUDA_VISIBLE_DEVICES=0 \
swift sft \
    --model Qwen/Qwen2.5-7B-Instruct \
    --train_type lora \
    --dataset 'AI-ModelScope/alpaca-gpt4-data-zh#500' \
              'AI-ModelScope/alpaca-gpt4-data-en#500' \
              'swift/self-cognition#500' \
    --torch_dtype bfloat16 \
    --num_train_epochs 1 \
    --per_device_train_batch_size 1 \
    --per_device_eval_batch_size 1 \
    --learning_rate 1e-4 \
    --lora_rank 8 \
    --lora_alpha 32 \
    --target_modules all-linear \
    --gradient_accumulation_steps 16 \
    --eval_steps 50 \
    --save_steps 50 \
    --save_total_limit 2 \
    --logging_steps 5 \
    --max_length 2048 \
    --output_dir output \
    --system 'You are a helpful assistant.' \
    --warmup_ratio 0.05 \
    --dataloader_num_workers 4 \
    --model_author swift \
    --model_name swift-robot
```

训练完成后，使用以下命令对训练后的权重进行推理。这里的`--adapters`需要替换成训练生成的last checkpoint文件夹。

```python
CUDA_VISIBLE_DEVICES=0 \
swift infer \
    --adapters output/vx-xxx/checkpoint-xxx \
    --stream true \
    --temperature 0 \
    --max_new_tokens 2048
```

更多基于ms-swift进行大模型和多模态模型训练与推理的文档，可以参见文档中心的[大模型训练与推理](../大模型训练与推理/入门介绍/快速开始.md)部分。

# 模型部署

您可以使用魔搭社区 [SwingDeploy](https://modelscope.cn/my/modelService/deploy) 来一键部署指定的模型到云资源上。SwingDeploy除了支持各种任务小模型的部署外，对于部分大语言模型，SwingDeploy支持部署后直接提供OpenAI API兼容的调用接口。

如果您希望在自有的GPU环境进行模型部署，我们推荐使用vLLM部署大语言模型，首先您需要设置环境变量来指定使用ModelScope上的模型：

```python
export VLLM_USE_MODELSCOPE=True
```

`vllm>=0.6`支持 vLLM 内置的工具调用功能，部署命令：

```bash
vllm serve Qwen/Qwen2.5-7B-Instruct --enable-auto-tool-choice --tool-call-parser hermes
```

之后你可以像使用[GPT’s tool calling](https://cookbook.openai.com/examples/how_to_call_functions_with_chat_models)那样来使用它。

魔搭ModelScope也将支持更多模型的部署，敬请期待。


# 使用教程
恭喜你！至此你已经成功学习完一个模型的完整使用。若你对平台功能想要更多地了解可具体参考对应的功能模块，同时平台提供了相应的教程来帮助您更好地理解模型的应用！我们也欢迎你加入到我们的社区贡献你的模型与想法，共同构建绿色开源社区！
详细教程请参阅：（更多丰富教程与课程内容开发中，敬请期待！）

- [模型的推理](../ModelScope%20Library教程/模型推理Pipeline.md)
- [数据的预处理](../ModelScope%20Library教程/详细教程/数据的预处理.md)
- [模型的训练](../ModelScope%20Library教程/模型的训练.md)
- [模型的评估](../ModelScope%20Library教程/详细教程/模型的评估.md)
