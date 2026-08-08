<!-- modelscope-docs: SWIFT Installation | llm-training-and-inference/intro/swift-installation/swift-installation_EN.md -->

# SWIFT Installation

## Wheel Package Installation

You can install using pip:

```shell
# Recommended
pip install 'ms-swift'
# With evaluation support
pip install 'ms-swift[eval]' -U
# Full capabilities
pip install 'ms-swift[all]' -U
```

## Source Code Installation

```shell
# pip install git+https://github.com/modelscope/ms-swift.git

# Full capabilities
# pip install "git+https:// https://github.com/modelscope/ms-swift.git#egg=ms-swift[all]"

git clone https://github.com/modelscope/ms-swift.git
cd ms-swift
pip install -e .

# Full capabilities
# pip install -e '.[all]'
```

## Docker Images

Docker images can be found [here](https://github.com/modelscope/modelscope/blob/build_swift_image/docker/build_image.py#L347).
```
# swift3.11.3
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.9.1-py311-torch2.8.0-vllm0.11.0-modelscope1.32.0-swift3.11.3
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.9.1-py311-torch2.8.0-vllm0.11.0-modelscope1.32.0-swift3.11.3
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.9.1-py311-torch2.8.0-vllm0.11.0-modelscope1.32.0-swift3.11.3

# swift3.10.3
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py311-torch2.8.0-vllm0.11.0-modelscope1.31.0-swift3.10.3
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py311-torch2.8.0-vllm0.11.0-modelscope1.31.0-swift3.10.3
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py311-torch2.8.0-vllm0.11.0-modelscope1.31.0-swift3.10.3

# swift3.9.3
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py311-torch2.8.0-vllm0.11.0-modelscope1.31.0-swift3.9.3
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py311-torch2.8.0-vllm0.11.0-modelscope1.31.0-swift3.9.3
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.8.1-py311-torch2.8.0-vllm0.11.0-modelscope1.31.0-swift3.9.3

# swift3.8.3
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.6.3-py311-torch2.7.1-vllm0.10.1.1-modelscope1.29.2-swift3.8.3
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.6.3-py311-torch2.7.1-vllm0.10.1.1-modelscope1.29.2-swift3.8.3
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.6.3-py311-torch2.7.1-vllm0.10.1.1-modelscope1.29.2-swift3.8.3
```

<details><summary>Historical Images</summary>

```
# swift3.7.2
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.6.3-py311-torch2.7.1-vllm0.10.0-modelscope1.28.2-swift3.7.2
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.6.3-py311-torch2.7.1-vllm0.10.0-modelscope1.28.2-swift3.7.2
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.6.3-py311-torch2.7.1-vllm0.10.0-modelscope1.28.2-swift3.7.2

# swift3.6.4
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.4.0-py310-torch2.6.0-vllm0.8.5.post1-modelscope1.28.1-swift3.6.4
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.4.0-py310-torch2.6.0-vllm0.8.5.post1-modelscope1.28.1-swift3.6.4
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.4.0-py310-torch2.6.0-vllm0.8.5.post1-modelscope1.28.1-swift3.6.4

# swift3.5.3
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.4.0-py310-torch2.6.0-vllm0.8.5.post1-modelscope1.27.1-swift3.5.3
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.4.0-py310-torch2.6.0-vllm0.8.5.post1-modelscope1.27.1-swift3.5.3
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.4.0-py310-torch2.6.0-vllm0.8.5.post1-modelscope1.27.1-swift3.5.3

# swift3.4.1.post1
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.4.0-py311-torch2.6.0-vllm0.8.5.post1-modelscope1.26.0-swift3.4.1.post1
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.4.0-py311-torch2.6.0-vllm0.8.5.post1-modelscope1.26.0-swift3.4.1.post1
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.4.0-py311-torch2.6.0-vllm0.8.5.post1-modelscope1.26.0-swift3.4.1.post1

# swift3.3.0.post1
modelscope-registry.cn-hangzhou.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.4.0-py311-torch2.6.0-vllm0.8.3-modelscope1.25.0-swift3.3.0.post1
modelscope-registry.cn-beijing.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.4.0-py311-torch2.6.0-vllm0.8.3-modelscope1.25.0-swift3.3.0.post1
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.4.0-py311-torch2.6.0-vllm0.8.3-modelscope1.25.0-swift3.3.0.post1

# swift3.2.2
modelscope-registry.us-west-1.cr.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda12.4.0-py311-torch2.5.1-modelscope1.25.0-swift3.2.2
```
</details>

More images can be found [here](https://modelscope.ai/docs/intro/environment-setup#latest-images).

## Supported Hardware

| Hardware Environment | Notes |
| --------------- | --------------------------- |
| A10/A100/H100   |                             |
| RTX20/30/40 Series |                             |
| T4/V100         | NAN may occur with some models |
| Ascend NPU      | NAN or unsupported operators may occur with some models |
| MPS             | Refer to [issue 4572](https://github.com/modelscope/ms-swift/issues/4572) |
| CPU             |                             |


## Runtime Environment

|              | Range           | Recommended         | Notes                 |
|--------------|--------------|---------------------|--------------------|
| python       | >=3.9        | 3.10/3.11           |                    |
| cuda         |              | cuda12              | Not required for cpu, npu, mps |
| torch        | >=2.0        | 2.8.0               |                    |
| transformers | >=4.33       | 4.57.3              |                    |
| modelscope   | >=1.23       |                     |                    |
| peft         | >=0.11,<0.19 |                     |                    |
| flash_attn   |              | 2.8.3/3.0.0b1       |                    |
| trl          | >=0.15,<0.25 | 0.24.0              | RLHF               |
| deepspeed    | >=0.14       | 0.17.6              | Training           |
| vllm         | >=0.5.1      | 0.11.0              | Inference/Deployment |
| sglang       | >=0.4.6      | 0.5.5.post3         | Inference/Deployment |
| lmdeploy     | >=0.5        | 0.10.1              | Inference/Deployment |
| evalscope    | >=1.0        |                     | Evaluation         |
| gradio       |              | 5.32.1              | Web-UI/App         |

More optional dependencies can be found [here](https://github.com/modelscope/ms-swift/blob/main/requirements/install_all.sh).

## Notebook Environment

Most models supported by Swift for training can run on an `A10` GPU. Users can utilize the free GPU resources provided by ModelScope:

1. Go to the [ModelScope](https://www.modelscope.ai) official website and log in.
2. Click on `My Notebook` on the left sidebar and start a free GPU instance.
3. Enjoy using the free A10 GPU resources.