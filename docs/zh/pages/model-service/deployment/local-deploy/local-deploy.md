<!-- modelscope-docs: 本地部署 | model-service/deployment/local-deploy/local-deploy_CN.md -->

# ModelScope server使用
## 1. 通用服务
ModelScope库基于fastapi开发一个简单模型服务，可以通过一条命令拉起绝大多数模型
使用方法：

```bash
modelscope server --model_id=Qwen/Qwen-7B-Chat --revision=v1.0.5
```
我们提供的官方镜像中也可以一个命令启动，推荐通过镜像直接使用。  

!!! warn 注意   
下面的命令，需要您确保有gpu，根据您的需要修改选择哪个gpu --gpu='"device=0"', 并且替换/host_path_to_modelscope_cache到您自己的目录，无论CPU镜像还是GPU镜像，目前都是X64架构的，如果在ARM上使用可能会有问题，详细docker使用方法，请参考docker文档。

```bash
docker run --rm --name server --shm-size=50gb --gpus='"device=0"' -e MODELSCOPE_CACHE=/modelscope_cache -v /host_path_to_modelscope_cache:/modelscope_cache -p 8000:8000 registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda11.8.0-py310-torch2.1.0-tf2.14.0-1.10.0 modelscope server --model_id=Qwen/Qwen-7B-Chat --revision=v1.0.5
```

服务默认监听8000端口，您也可以通过--port改变端口，默认服务提供两个接口，接口文档您可以通过
http://ip:port/docs查看
通过describe接口，可以获取服务输入输出信息以及输入sample数据，如下图：
![describe](https://modelscope.oss-cn-beijing.aliyuncs.com/resource/describe.jpg)
服务调用接口，可以直接拷贝describe接口example示例数据，如下图：
![call](https://modelscope.oss-cn-beijing.aliyuncs.com/resource/call.jpg)

## 2. vllm大模型推理
对于LLM我们提供了vllm推理支持，目前只有部分模型支持vllm。

### 2.1 vllm直接支持ModelScope模型
可以通过设置环境变量使得vllm从www.modelscope.cn下载模型。

启动普通server
```bash
VLLM_USE_MODELSCOPE=True python -m vllm.entrypoints.api_server  --model="Qwen/Qwen-7B-Chat" --revision="v1.1.8" --trust-remote-code
```
启动openai兼容接口
```bash
VLLM_USE_MODELSCOPE=True python -m vllm.entrypoints.openai.api_server  --model="Qwen/Qwen-7B-Chat" --revision="v1.1.8" --trust-remote-code
```

如果模型在ModelScope cache目录已经存在，则会直接使用cache中的模型，否则会从www.modelscope.cn下载模型。

通过ModelScope官方镜像启动vllm，指定端口为9090

```bash
docker run --rm --name server --shm-size=50gb --gpus='"device=0"' -e MODELSCOPE_CACHE=/modelscope_cache -v /host_path_to_modelscope_cache:/modelscope_cache -p 9090:9090 registry.cn-beijing.aliyuncs.com/modelscope-repo/modelscope:ubuntu22.04-cuda11.8.0-py310-torch2.1.0-tf2.14.0-1.10.0 python -m vllm.entrypoints.api_server --model "Qwen/Qwen-7B-Chat" --revision "v1.0.5" --port 9090 --trust-remote-code
```
