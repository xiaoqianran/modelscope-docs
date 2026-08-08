<!-- modelscope-docs: Local Deployment | model-service/deployment/local-deploy/local-deploy_EN.md -->

# ModelScope Server Usage

## 1. General Service

ModelScope library provides a simple model service based on FastAPI, which can launch most models with a single command.

Usage:

```bash
modelscope server --model_id=Qwen/Qwen-7B-Chat --revision=v1.0.5
```

You can also start it with a single command using our official Docker image, which is recommended for direct usage.

!!! warn Note
The following command requires you to ensure you have a GPU available. Modify the GPU selection according to your needs with `--gpu='"device=0"'`, and replace `/host_path_to_modelscope_cache` with your own directory path. Both CPU and GPU images are currently built for X64 architecture, so there might be issues when running on ARM systems. For detailed Docker usage instructions, please refer to the Docker documentation.

```bash
docker run --rm --name server --shm-size=50gb --gpus='"device=0"' -e MODELSCOPE_CACHE=/modelscope_cache -v /host_path_to_modelscope_cache:/modelscope_cache -p 8000:8000 registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda11.8.0-py310-torch2.1.0-tf2.14.0-1.10.0 modelscope server --model_id=Qwen/Qwen-7B-Chat --revision=v1.0.5
```

The service listens on port 8000 by default, but you can change the port using the `--port` option. By default, the service provides two endpoints. You can view the API documentation at:
http://ip:port/docs

Through the describe endpoint, you can obtain service input/output information along with sample input data, as shown in the figure below:
![describe](https://modelscope.oss-cn-beijing.aliyuncs.com/resource/describe.jpg)

For the service invocation endpoint, you can directly copy the example data from the describe endpoint, as shown in the figure below:
![call](https://modelscope.oss-cn-beijing.aliyuncs.com/resource/call.jpg)

## 2. vLLM Large Model Inference

For LLMs, we provide vLLM inference support. Currently, only certain models support vLLM.

### 2.1 vLLM Direct Support for ModelScope Models

You can set environment variables to enable vLLM to download models from modelscope.ai.

Start a standard server:
```bash
VLLM_USE_MODELSCOPE=True python -m vllm.entrypoints.api_server  --model="Qwen/Qwen-7B-Chat" --revision="v1.1.8" --trust-remote-code
```

Start an OpenAI-compatible API server:
```bash
VLLM_USE_MODELSCOPE=True python -m vllm.entrypoints.openai.api_server  --model="Qwen/Qwen-7B-Chat" --revision="v1.1.8" --trust-remote-code
```

If the model already exists in the ModelScope cache directory, it will directly use the cached model; otherwise, it will download the model from modelscope.ai.

Launch vLLM using the official ModelScope Docker image, specifying port 9090:

```bash
docker run --rm --name server --shm-size=50gb --gpus='"device=0"' -e MODELSCOPE_CACHE=/modelscope_cache -v /host_path_to_modelscope_cache:/modelscope_cache -p 9090:9090 registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda11.8.0-py310-torch2.1.0-tf2.14.0-1.10.0 python -m vllm.entrypoints.api_server --model "Qwen/Qwen-7B-Chat" --revision "v1.0.5" --port 9090 --trust-remote-code
```