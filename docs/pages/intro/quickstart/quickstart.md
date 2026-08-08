<!-- modelscope-docs: Quick Start | intro/quickstart/quickstart_EN.md -->

# Quick Start

This document is intended for users who are new to the ModelScope community. The goal is to familiarize yourself with model downloading and inference on the ModelScope community within 5 minutes. It aims to help you set up your development environment and smoothly start learning, using, and developing models from the ModelScope community.

# Environment Installation

You can use the pre-installed [Notebook environment](https://modelscope.cn/my/mynotebook/preset) provided by the ModelScope community to use its models. The ModelScope community Notebook provides new users with 100 hours of free GPU computing power and unlimited free CPU computing power, with most model runtime dependencies pre-installed.

If you wish to use ModelScope community models in your local development environment, we recommend using the ModelScope SDK to download models. You can install the ModelScope SDK using the following command:

```shell
pip install modelscope
```

We also recommend installing [Git](https://git-scm.com/downloads) and [Git LFS](https://git-lfs.com/), which are essential tools for model management including uploading.

# Model Download

If you are running on a high-bandwidth machine, it is recommended to use the ModelScope command-line tool to download models. This method supports resumable downloads and high-speed model downloads. For example, you can download the Qwen2.5-0.5B-Instruct model to the "model-dir" directory under the current path using the following command:

```
modelscope download --model="Qwen/Qwen2.5-0.5B-Instruct" --local_dir ./model-dir
```

You can also use the ModelScope Python SDK to download models, which supports resumable downloads and high-speed model downloads:

```python
from modelscope import snapshot_download
model_dir = snapshot_download("Qwen/Qwen2.5-0.5B-Instruct")
```

Since models are stored via Git, you can also download models locally using git clone after installing Git LFS, for example:

```
git lfs install
git clone https://www.modelscope.cn/Qwen/Qwen2.5-0.5B-Instruct.git
```
For detailed instructions on model downloading, please refer to the [Model Download Documentation](../模型库/模型的下载.md).

Additionally, if a model is bound with the ModelScope SDK, you only need a few lines of code to load the model. ModelScope also supports loading models through interfaces such as AutoModel. Below are examples of loading models using AutoModel and pipeline methods:

### Loading Models with AutoModel:
ModelScope supports native pipeline inference and is compatible with AutoModel and Pipeline loading provided by Transformers, Diffusers, etc.

For example, after installing modelscope and transformers, you can perform LLM inference with the following code.
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

### Loading Models with ModelScope pipeline:

```python
from modelscope.pipelines import pipeline
word_segmentation = pipeline('word-segmentation',model='damo/nlp_structbert_word-segmentation_chinese-base')
```

# Model Inference

For inferring various tasks across different modalities, pipeline is the simplest and fastest method. You can use out-of-the-box pipelines to execute multiple tasks across different modalities. Below is a complete running example of a pipeline:

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

ModelScope is compatible with the simple and unified method provided by Transformers for loading pre-trained instances and tokenizers. This means you can use ModelScope to load classes such as AutoModel and AutoTokenizer. Below is a complete running example of a large language model:

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

For models that are temporarily not natively integrated with the ModelScope SDK, you can first download the model from ModelScope, then implement model inference through other mainstream libraries. Taking the SDXL-Turbo model as an example, the complete model inference running example is as follows:

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

# Model Fine-tuning

ms-swift is a fine-tuning and deployment framework for large models and multimodal large models provided by the ModelScope community. It now supports training (pre-training, fine-tuning, human alignment), inference, evaluation, quantization, and deployment for over 500 large models and over 200 multimodal large models. Large models include: Qwen3, Qwen3-MoE, Qwen2.5, InternLM3, GLM4, Mistral, DeepSeek-R1, Yi1.5, TeleChat2, Baichuan2, Gemma2, etc. Multimodal large models include: Qwen2.5-VL, Qwen2-Audio, Llama4, Llava, InternVL3, MiniCPM-V-2.6, GLM4v, Xcomposer2.5, Yi-VL, DeepSeek-VL2, Phi3.5-Vision, GOT-OCR2, etc.

In addition, ms-swift brings together the latest training technologies, including lightweight training techniques such as LoRA, QLoRA, Llama-Pro, LongLoRA, GaLore, Q-GaLore, LoRA+, LISA, DoRA, FourierFt, ReFT, UnSloth, and Liger, as well as human alignment training methods such as DPO, GRPO, RM, PPO, KTO, CPO, SimPO, ORPO. ms-swift supports acceleration of inference, evaluation, and deployment modules using vLLM and LMDeploy, and supports quantization of large models using technologies such as GPTQ, AWQ, BNB. ms-swift also provides a Web-UI interface based on Gradio and rich best practices.

Install dependencies

```python
pip install ms-swift -U
```

Fine-tuning script

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

After training is completed, use the following command to perform inference with the trained weights. Here, `--adapters` needs to be replaced with the last checkpoint folder generated by training.

```python
CUDA_VISIBLE_DEVICES=0 \
swift infer \
    --adapters output/vx-xxx/checkpoint-xxx \
    --stream true \
    --temperature 0 \
    --max_new_tokens 2048
```

For more documentation on training and inference of large models and multimodal models based on ms-swift, please see the [Large Model Training and Inference](../大模型训练与推理/入门介绍/快速开始.md) section in the documentation center.

# Model Deployment

You can use the ModelScope community [SwingDeploy](https://modelscope.cn/my/modelService/deploy) to deploy a specified model to cloud resources with one click. In addition to supporting deployment of various task-specific small models, SwingDeploy supports providing OpenAI API-compatible invocation interfaces directly after deployment for some large language models.

If you wish to deploy models in your own GPU environment, we recommend using vLLM to deploy large language models. First, you need to set environment variables to specify using models from ModelScope:

```python
export VLLM_USE_MODELSCOPE=True
```

`vllm>=0.6` supports vLLM's built-in tool calling functionality, deployment command:

```bash
vllm serve Qwen/Qwen2.5-7B-Instruct --enable-auto-tool-choice --tool-call-parser hermes
```

Afterwards you can use it like [GPT's tool calling](https://cookbook.openai.com/examples/how_to_call_functions_with_chat_models).

ModelScope will also support deployment of more models, so stay tuned.


# Tutorials
Congratulations! By now you have successfully learned the complete usage of a model. If you want to learn more about platform features, you can refer to the corresponding functional modules. Meanwhile, the platform provides corresponding tutorials to help you better understand the application of models! We also welcome you to join our community and contribute your models and ideas to jointly build a green open-source community!
For detailed tutorials, please see: (More rich tutorials and course content are under development, so stay tuned!)

- [Model Inference](../ModelScope%20Library教程/模型推理Pipeline.md)
- [Data Preprocessing](../ModelScope%20Library教程/详细教程/数据的预处理.md)
- [Model Training](../ModelScope%20Library教程/模型的训练.md)
- [Model Evaluation](../ModelScope%20Library教程/详细教程/模型的评估.md)