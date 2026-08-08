<!-- modelscope-docs: Qwen3-VL Best Practices | llm-training-and-inference/best-practices/Qwen3-VL-zui-jia-shi-jian/Qwen3-VL-zui-jia-shi-jian_EN.md -->

# Qwen3-VL Best Practices

## Environment Preparation

Before starting inference and training, please ensure your environment is ready.

```shell
pip install "transformers>=4.57" "qwen_vl_utils>=0.0.14"

pip install "ms-swift>=3.9.1"
# pip install "vllm>=0.11.0"  # If using vllm inference backend for inference
```
- Regarding slow training: Using torch2.9 will encounter slow training issues (conv3d operator). Please try using torch2.8, refer to [this issue](https://github.com/pytorch/pytorch/issues/166122). In ms-swift>=3.11.2, you can avoid this problem by setting `SWIFT_PATCH_CONV3D=1`, see [this issue](https://github.com/modelscope/ms-swift/issues/7108) for details.
- Regarding video data training hanging: Using decord backend to read videos may cause hanging issues, refer to [this issue](https://github.com/dmlc/decord/issues/269). You can use torchcodec backend instead, see [qwen_vl_utils](https://github.com/QwenLM/Qwen3-VL/blob/50068df2334f309979ff05d75f1078c8309c63ed/qwen-vl-utils/src/qwen_vl_utils/vision_process.py#L390-L400) library for details.

## Inference

Using transformers for inference:
```python
import os
os.environ['CUDA_VISIBLE_DEVICES'] = '0'
from modelscope import snapshot_download
from qwen_vl_utils import process_vision_info
from transformers import Qwen3VLForConditionalGeneration, AutoProcessor

model_dir = snapshot_download('Qwen/Qwen3-VL-4B-Instruct')

model = Qwen3VLForConditionalGeneration.from_pretrained(
    model_dir, dtype="auto", device_map="auto",
    # attn_implementation='flash_attention_2',
)

processor = AutoProcessor.from_pretrained(model_dir)

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "video",
                "video": "https://modelscope-open.oss-cn-hangzhou.aliyuncs.com/images/baby.mp4",
                "max_pixels": 128*32*32,
                "max_frames": 16,
            },
            {"type": "text", "text": "Describe this video."},
        ],
    }
]

text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
image_inputs, video_inputs, video_kwargs = process_vision_info([messages], return_video_kwargs=True,
                                                                image_patch_size= 16,
                                                                return_video_metadata=True)
if video_inputs is not None:
    video_inputs, video_metadatas = zip(*video_inputs)
    video_inputs, video_metadatas = list(video_inputs), list(video_metadatas)
else:
    video_metadatas = None
inputs = processor(text=[text], images=image_inputs, videos=video_inputs, video_metadata=video_metadatas, **video_kwargs, do_resize=False, return_tensors="pt")
inputs = inputs.to('cuda')

generated_ids = model.generate(**inputs, max_new_tokens=128, do_sample=False)
generated_ids_trimmed = [
    out_ids[len(in_ids) :] for in_ids, out_ids in zip(inputs.input_ids, generated_ids)
]
output_text = processor.batch_decode(
    generated_ids_trimmed, skip_special_tokens=True, clean_up_tokenization_spaces=False
)
print(output_text[0])
# 'A baby wearing glasses sits on a bed, engrossed in reading a book. The baby turns the pages with both hands, occasionally looking up and smiling. The room is cozy, with a crib in the background and clothes scattered around. The baby's focus and curiosity are evident as they explore the book, creating a heartwarming scene of early learning and discovery.'
```

Using ms-swift's `PtEngine` for inference:
```python
import os
# os.environ['SWIFT_DEBUG'] = '1'
os.environ['CUDA_VISIBLE_DEVICES'] = '0'
os.environ['VIDEO_MAX_TOKEN_NUM'] = '128'
os.environ['FPS_MAX_FRAMES'] = '16'


from swift.llm import PtEngine, InferRequest, RequestConfig
engine = PtEngine('Qwen/Qwen3-VL-4B-Instruct', attn_impl='flash_attention_2')
infer_request = InferRequest(messages=[{
    "role": "user",
    "content": '<video>Describe this video.',
}], videos=['https://modelscope-open.oss-cn-hangzhou.aliyuncs.com/images/baby.mp4'])
request_config = RequestConfig(max_tokens=128, temperature=0)
resp_list = engine.infer([infer_request], request_config=request_config)
response = resp_list[0].choices[0].message.content
# 'A baby wearing glasses sits on a bed, engrossed in reading a book. The baby turns the pages with both hands, occasionally looking up and smiling. The room is cozy, with a crib in the background and clothes scattered around. The baby's focus and curiosity are evident as they explore the book, creating a heartwarming scene of early learning and discovery.'

# use stream
request_config = RequestConfig(max_tokens=128, temperature=0, stream=True)
gen_list = engine.infer([infer_request], request_config=request_config)
for chunk in gen_list[0]:
    if chunk is None:
        continue
    print(chunk.choices[0].delta.content, end='', flush=True)
print()
```

Using command-line inference:
```shell
CUDA_VISIBLE_DEVICES=0 \
IMAGE_MAX_TOKEN_NUM=1024 \
VIDEO_MAX_TOKEN_NUM=128 \
FPS_MAX_FRAMES=16 \
swift infer \
    --model Qwen/Qwen3-VL-4B-Instruct \
    --stream true
```

```
<<< who are you?
Hello! I'm Qwen, a large-scale language model independently developed by the Tongyi Lab under Alibaba Group. My main functions include answering questions, creating text such as stories, official documents, emails, scripts, and more, as well as performing logical reasoning, programming, and other tasks. If you have any questions or need assistance, feel free to let me know anytime, and I'll do my best to help!
--------------------------------------------------
<<< <image>describe the image.
Input an image path or URL <<< http://modelscope-open.oss-cn-hangzhou.aliyuncs.com/images/cat.png
This is a beautifully detailed, close-up portrait of an adorable tabby kitten, rendered with a soft, painterly effect that gives it a gentle, dreamy quality.

Here's a breakdown of the image:

- **The Kitten:** The subject is a young, fluffy kitten with a classic tabby pattern. Its fur is a mix of white and soft grayish-brown stripes, with a prominent dark stripe running down the center of its forehead and over its nose. The kitten's face is predominantly white, with delicate markings around its eyes and cheeks.

- **The Eyes:** Its most captivating feature is its large, round, and expressive eyes. They are a striking shade of bright blue-gray, with dark pupils that give it an intense, curious, and slightly innocent gaze. The eyes are wide open, suggesting the kitten is alert and attentive.

- **The Expression:** The kitten's expression is sweet and innocent. Its small pink nose and slightly parted mouth give it a gentle, almost pleading look. Its whiskers are long and white, standing out against its fur.

- **The Style:** The image has a soft-focus, artistic quality, reminiscent of impressionist painting. The edges of the kitten's fur are slightly blurred, creating a halo effect that draws attention to its face. The background is softly blurred with muted tones of green and gray, which helps the kitten stand out as the clear focal point.

- **Overall Impression:** The image evokes feelings of warmth, cuteness, and tenderness. The kitten appears to be looking directly at the viewer, creating a sense of connection and affection.

This is a lovely and charming depiction of a young kitten, capturing its innocence and charm in a visually appealing and emotionally engaging way.
--------------------------------------------------
<<< <video>describe the video.
Input a video path or URL <<< https://modelscope-open.oss-cn-hangzhou.aliyuncs.com/images/baby.mp4
This video captures a charming and adorable moment of a young child, likely a toddler, sitting on a bed and pretending to read a book. The child is wearing glasses, which adds a humorous and endearing touch to the scene — as if they're a little scholar or librarian.

Here's a breakdown of what unfolds:

- The child is seated cross-legged on a bed with a patterned quilt. Behind them, a crib and some household items are visible, suggesting a cozy bedroom setting.

- The child holds an open book and appears to be turning the pages with focused attention, mimicking the behavior of a real reader.

- At one point, the child looks up, smiles, or seems to react with delight — perhaps amused by something in the book or just enjoying the activity.

- The child's movements are gentle and deliberate, showing a sense of concentration and curiosity. They turn pages, sometimes with one hand, and occasionally lift the book slightly as if to examine it more closely.

- The video has a warm, candid feel — it's not staged, and the child's natural behavior makes it feel authentic and heartwarming.

Overall, this is a sweet, lighthearted video that showcases the innocence and imagination of early childhood. The child's engagement with the book, combined with their glasses and playful demeanor, creates a delightful and memorable scene.
```

- For the meaning of specific model parameters, such as environment variables like `VIDEO_MAX_TOKEN_NUM`, please refer to the [Command Line Parameters Documentation](../功能指引/命令行参数.md#qwen3_vl).

## Training

This document introduces how to train Qwen3-VL using ms-swift and Megatron-SWIFT. We recommend using ms-swift (transformers backend, more convenient and simpler) for Dense models, while using Megatron-SWIFT (megatron backend, faster training speed; benchmark can be found [here](../功能指引/Megatron-SWIFT训练.md#benchmark)) for Moe models.

If you need to fine-tune the model with custom datasets, you can prepare your data in the following format and set `--dataset train.jsonl --val_dataset val.jsonl` in the command line, where the validation set is optional. For more information, please refer to the [Multimodal Dataset Documentation](../定制化/自定义数据集.md#多模态).

```jsonl
{"messages": [{"role": "user", "content": "What is the capital of Zhejiang province?"}, {"role": "assistant", "content": "The capital of Zhejiang province is Hangzhou."}]}
{"messages": [{"role": "user", "content": "<image><image>What are the differences between these two images?"}, {"role": "assistant", "content": "The first image shows a cat, and the second shows a dog"}], "images": ["/xxx/x.jpg", "/xxx/x.png"]}
{"messages": [{"role": "system", "content": "You are a helpful and harmless assistant"}, {"role": "user", "content": "<image>What is in the image, <video>What is in the video?"}, {"role": "assistant", "content": "The image shows an elephant, and the video shows a dog running on grass"}], "images": ["/xxx/x.jpg"], "videos": ["/xxx/x.mp4"]}
```

Qwen3-VL's bbox output uses normalized 1000 relative coordinates. You can use the grounding dataset format provided by ms-swift, where coordinates in "bbox" are absolute coordinates, and ms-swift will automatically convert absolute coordinates to normalized 1000 relative coordinates. For more information, please refer to the [grounding dataset format documentation](../定制化/自定义数据集.md#grounding).

```jsonl
{"messages": [{"role": "user", "content": "<image>Find the <ref-object> in the image"}, {"role": "assistant", "content": "[\n\t{\"bbox_2d\": <bbox>, \"label\": \"<ref-object>\"},\n\t{\"bbox_2d\": <bbox>, \"label\": \"<ref-object>\"}\n]"}], "images": ["cat.png"], "objects": {"ref": ["sheep", "sheep", "sheep"], "bbox": [[90.9, 160.8, 135, 212.8], [360.9, 480.8, 495, 532.8]]}}
```

### Dense Models

The following provides a fine-tuning script for the `Qwen3-VL-4B-Instruct` model. We use mixed modality data as the demo dataset. This example script is for demonstration purposes only. Training VRAM requirement is 2 * 21GiB, and training time is 12 minutes.
- If preprocessing takes too long, you can remove `--packing` or use [cached dataset](https://github.com/modelscope/ms-swift/tree/main/examples/train/cached_dataset).

```shell
# 2 * 21GiB
PYTORCH_CUDA_ALLOC_CONF='expandable_segments:True' \
IMAGE_MAX_TOKEN_NUM=1024 \
VIDEO_MAX_TOKEN_NUM=128 \
FPS_MAX_FRAMES=16 \
NPROC_PER_NODE=2 \
CUDA_VISIBLE_DEVICES=0,1 \
swift sft \
    --model Qwen/Qwen3-VL-4B-Instruct \
    --dataset 'AI-ModelScope/alpaca-gpt4-data-zh#10000' \
              'AI-ModelScope/LaTeX_OCR:human_handwrite#5000' \
              'swift/VideoChatGPT:Generic#2000' \
    --load_from_cache_file true \
    --split_dataset_ratio 0.01 \
    --train_type lora \
    --torch_dtype bfloat16 \
    --num_train_epochs 1 \
    --per_device_train_batch_size 1 \
    --per_device_eval_batch_size 1 \
    --attn_impl flash_attn \
    --padding_free true \
    --learning_rate 1e-4 \
    --lora_rank 8 \
    --lora_alpha 32 \
    --target_modules all-linear \
    --freeze_vit true \
    --freeze_aligner true \
    --packing true \
    --gradient_checkpointing true \
    --vit_gradient_checkpointing false \
    --gradient_accumulation_steps 2 \
    --eval_steps 100 \
    --save_steps 100 \
    --save_total_limit 2 \
    --logging_steps 5 \
    --max_length 4096 \
    --output_dir output \
    --warmup_ratio 0.05 \
    --deepspeed zero2 \
    --dataset_num_proc 4 \
    --dataloader_num_workers 4
```

After training is complete, we use the following script for inference on the validation set:
```shell
PYTORCH_CUDA_ALLOC_CONF='expandable_segments:True' \
CUDA_VISIBLE_DEVICES=0 \
IMAGE_MAX_TOKEN_NUM=1024 \
VIDEO_MAX_TOKEN_NUM=128 \
FPS_MAX_FRAMES=16 \
swift infer \
    --adapters output/vx-xxx/checkpoint-xxx \
    --stream true \
    --max_new_tokens 2048 \
    --load_data_args true
```

```
--------------------------------------------------
[QUERY] Using LaTeX to perform OCR on the image.
[LABELS] 1 + \frac { 1 } { 1 ! } + \frac { 1 } { 2 ! } + \frac { 1 } { 3 ! } + \frac { 1 } { 4 ! }
[RESPONSE] 1 + \frac { 1 } { 1 ! } + \frac { 1 } { 2 ! } + \frac { 1 } { 3 ! } + \frac { 1 } { 4 ! }
--------------------------------------------------
[QUERY] What color suit is the man wearing while playing the saxophone on stage?
[LABELS] The man is wearing a black suit and white shirt while playing the saxophone on the red-floored stage.
[RESPONSE] The man is wearing a black suit while playing the saxophone on stage.
--------------------------------------------------
...
```

### Moe Models

The following provides a fine-tuning script for the `Qwen3-VL-30B-A3B-Instruct` model. We use Megatron-SWIFT for single-machine full-parameter training. We also use mixed data for training, and this example script is for demonstration purposes only. The training requires 8 * 80GiB VRAM resources and takes 20 minutes.

For Megatron-SWIFT environment installation, please refer to the [Megatron-SWIFT Documentation](../功能指引/Megatron-SWIFT训练.md). Megatron-SWIFT shares template and dataset modules with ms-swift, so the custom dataset format and model-specific environment variables introduced earlier remain valid.

The fine-tuning script is as follows. For training techniques and parallel technology adjustments, please refer to the [Megatron-SWIFT Documentation](../功能指引/Megatron-SWIFT训练.md#训练技巧).

```shell
# 8 * 80GiB
PYTORCH_CUDA_ALLOC_CONF='expandable_segments:True' \
OMP_NUM_THREADS=14 \
NPROC_PER_NODE=8 \
CUDA_VISIBLE_DEVICES=0,1,2,3,4,5,6,7 \
IMAGE_MAX_TOKEN_NUM=1024 \
VIDEO_MAX_TOKEN_NUM=128 \
FPS_MAX_FRAMES=16 \
megatron sft \
    --model Qwen/Qwen3-VL-30B-A3B-Instruct \
    --load_safetensors true \
    --save_safetensors true \
    --dataset 'AI-ModelScope/alpaca-gpt4-data-zh#10000' \
              'AI-ModelScope/LaTeX_OCR:human_handwrite#5000' \
              'swift/VideoChatGPT:Generic#2000' \
    --load_from_cache_file true \
    --split_dataset_ratio 0.01 \
    --moe_permute_fusion true \
    --tensor_model_parallel_size 4 \
    --expert_model_parallel_size 8 \
    --moe_grouped_gemm true \
    --moe_shared_expert_overlap true \
    --moe_aux_loss_coeff 1e-6 \
    --micro_batch_size 1 \
    --global_batch_size 4 \
    --recompute_granularity full \
    --recompute_method uniform \
    --recompute_num_layers 1 \
    --max_epochs 1 \
    --finetune true \
    --cross_entropy_loss_fusion true \
    --lr 1e-5 \
    --lr_warmup_fraction 0.05 \
    --min_lr 1e-6 \
    --save megatron_output/Qwen3-VL-30B-A3B-Instruct \
    --eval_interval 500 \
    --save_interval 500 \
    --max_length 4096 \
    --packing true \
    --num_workers 8 \
    --dataset_num_proc 8 \
    --no_save_optim true \
    --no_save_rng true \
    --sequence_parallel true \
    --moe_expert_capacity_factor 2 \
    --attention_backend flash
```

After training is complete, we use the following script for inference on the validation set:
```shell
PYTORCH_CUDA_ALLOC_CONF='expandable_segments:True' \
CUDA_VISIBLE_DEVICES=0 \
IMAGE_MAX_TOKEN_NUM=1024 \
VIDEO_MAX_TOKEN_NUM=128 \
FPS_MAX_FRAMES=16 \
swift infer \
    --model megatron_output/Qwen3-VL-30B-A3B-Instruct/vx-xxx/checkpoint-xxx \
    --stream true \
    --max_new_tokens 2048 \
    --load_data_args true
```


Use the following command to push trained weights to Modelscope:
```shell
swift export \
    --model output/vx-xxx/checkpoint-xxx \
    --push_to_hub true \
    --hub_model_id '<your-model-id>' \
    --hub_token '<your-sdk-token>'
```