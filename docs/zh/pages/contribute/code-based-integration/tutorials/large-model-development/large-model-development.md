<!-- modelscope-docs: 大模型开发 | contribute/code-based-integration/tutorials/large-model-development/large-model-development_CN.md -->

本文档适用于使用**Megatron**进行分布式训练的大模型接入ModelScope

对于单GPU显存无法加载的大模型，在单机多卡环境下tensor并行相比于pipeline并行显存效率要更高，模型本身使用megatron框架训练的代码，依靠megatron_util提供的能力，基本不需改动即可便利地接入到ModelScope中。以下将从大模型的推理，训练两种场景，结合单机单卡，单机多卡，多机多卡多种不同的模型运行环境介绍meagtron_util提供的分布式推理训练能力。

由于Megatron更新过程中对算子的替换和代码的更新，从V1到V3版本存在部分算子替换或底层实现不兼容的问题。为了兼容使用不同版本 mpu 训练的大模型，我们将 V1 与 V3 中一部分 Megatron 与 mpu 相关的调用打包到** megatron-util **在 ModelScope 中使用，可以通过以下命令安装。

```shell
pip install "modelscope[nlp]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

<a name="f7a7b418"></a>
### pipeline接入

接入大模型推理时，pipeline中的preprocessor与postprocessor部分与不使用megatron的中小模型接入没有区别，只跟模型本身逻辑相关，请参考[标准模块代码开发接入流程](%E6%A0%87%E5%87%86%E6%A8%A1%E5%9D%97%E4%BB%A3%E7%A0%81%E5%BC%80%E5%8F%91%E6%8E%A5%E5%85%A5%E6%B5%81%E7%A8%8B.md)。<br />模型接入modelscope需要提供使用pipeline的调用方式，为保持modelscope pipeline调用的一致性，大模型不需使用** torchrun / python -m torch.distributed.launch **等常用多进程调用方式，对于多进程的调度将由DistributedPipeline进行封装。

<a name="c5e1637e"></a>
#### DistributedPipeline介绍

大模型接入pipeline时可继承此类实现自己的Pipeline类。此文档对于接入时的使用方法进行简单的介绍，以下为DistributedPipeline的主要代码结构：

```py
class DistributedPipeline(Pipeline):
    def __init__(self,
                 model: str = None,
                 preprocessor: Union[Preprocessor, List[Preprocessor]] = None,
                 auto_collate=True,
                 **kwargs):
        # ...
        self.preprocessor = preprocessor
        self._model_prepare = False
        self._model_prepare_lock = Lock()

        self.cfg = read_config(self.model_dir)
        self.device = create_device(self.device_name)
        self.has_multiple_models = False
        self.framework = self.cfg.framework
        torch.multiprocessing.set_start_method('spawn', force=True)

        ranks = list(range(self.world_size))
        self.model_pool = Pool(self.world_size)

        if 'master_ip' not in kwargs:
            kwargs['master_ip'] = '127.0.0.1'
        master_port = int(kwargs['master_port'])

        self.model_pool.map(
            partial(
                self.__class__._instantiate_one,
                model_dir=self.model_dir,
                **self.cfg.model,
                **kwargs), ranks)

    @classmethod
    def _instantiate_one(cls, rank, model_dir, **kwargs):
        """Instantiate one model piece.

        @param rank: The model rank.
        @param model_dir: The model_dir in the node.
        @param kwargs: Any extra args.
        @return: None. The model handler should be kept in the class field.
        """
        pass

    def forward(self, inputs: Dict[str, Any],
                **forward_params) -> Dict[str, Any]:
        inputs = {
            'inputs': inputs,
            'forward_params': forward_params,
        }
        res = self.model_pool.map(self.__class__._forward_one,
                                  [inputs] * self.world_size)
        return res[0]

    @classmethod
    def _forward_one(cls, inputs):
        """Forward the inputs to one model piece.

        Use the model handler kept in the class field to forward.

        @param inputs: The inputs after the preprocessing.
        @return: The forward results.
        """
        pass
```

DistributedPipeline的初始化过程包含了必要的rank，进程池，同步通讯使用的ip及端口的配置，并在各个子进程中进行了_instantiate_one方法的调用。<br />在继承后实现pipeline时，**需要注意保持_instantiate_one为类方法**，目的是使进程池中的每个子进程均初始化完成对应rank的模型，得到cls.model，每片模型的生命周期均与当前进程相同。_instantiate_one函数无返回值，调用后此进程的cls.model初始化完成，可以在_forward_one中对应地调用。<br />主进程中调用forward即为在进程池中分别调用子进程的 _forward_one。<br />同理**需要保持_forward_one为类方法**，通常对应各进程中模型cls.model的forward方法，根据pipeline对应的task不同，由开发者自行定义和实现。

<a name="2cdc6b8b"></a>
#### 单片模型的初始化与调用

此部分以 GPT3 大模型为例简单介绍模型的初始化与调用方法：

```py
from modelscope.utils.nlp.distributed import initialize_distributed
from modelscope.utils.nlp.load_checkpoint import pre_load
from modelscope.utils.torch_utils import set_random_seed_mpu

@PIPELINES.register_module(
    Tasks.text_generation, module_name=Pipelines.gpt3_generation)
class DistributedGPT3Pipeline(DistributedPipeline):
    @classmethod
    def _instantiate_one(cls, rank, model_dir, **kwargs):
        cls.model = DistributedGPT3(model_dir, rank, **kwargs)
        cls.model.eval()

class DistributedGPT3(TorchModel):
    def __init__(self,
                 model_dir,
                 rank,
                 path_load_tag='model',
                 *args,
                 **kwargs):
        super().__init__(model_dir, *args, **kwargs)
        init_megatron_util(megatron_cfg, model_dir, rank=rank)

        self.config = GPT3Config.from_pretrained(model_dir)
        # Build model.
        model = GPT3Model(self.config)

        for param in model.parameters():
            mpu.set_defaults_if_not_set_tensor_model_parallel_attributes(param)

        # GPU allocation.
        model.cuda(torch.cuda.current_device())

        # Fp16 conversion.
        if self.config.fp16 or self.config.bf16:
            model = Float16Module(model, self.config)

        self.dist_model = model
        self.dist_model.load_state_dict(
            load_model, strict=kwargs.get('strict', True))
        self.inference_params = None
```

如不考虑DistributedGPT3的封装， _instantiate_one实际上调用了initialize_distributed与set_random_seed_mpu，构造了GPT3Model，挂载了模型并行的必要信息并将移动到对应的GPU上，且加载了模型参数。<br />init_megatron_util函数需传入megatron_cfg, model_dir, rank作为参数，内部调用megatron初始化方法对各个子进程进行了初始化，参考已有代码即可。

```py
@PIPELINES.register_module(
    Tasks.text_generation, module_name=Pipelines.gpt3_generation)
class DistributedGPT3Pipeline(DistributedPipeline):

    @classmethod
    def _forward_one(cls, inputs: Dict[str, Any]) -> Dict[str, Any]:
        tokens = inputs['inputs']['input_ids'].cuda(
            torch.cuda.current_device())
        return cls.model.generate(tokens, **inputs['forward_params'])
```

相比之下_forward_one要更为简单，由于模型的拆分与通讯全部使用megatron管理，_forward_one与单卡调用相同即可。

<a name="24534bbf"></a>
#### megatron_util的使用

通常对于基于megatron开发和训练的大模型，只需要提供模型code base对应的megatron版本即可，目前版本支持 v1, v3, moe，不同版本之间支持的并行策略与底层算子可能有所不同，如不输入默认为 v3 版本。

指定版本后，如get_data_parallel_rank等多数接口是通用的，均可直接import并使用。

```py
# 一个例子
from megatron.model import (AttnMaskType, LayerNorm,
                            bias_gelu_impl)
from megatron.model.fused_softmax import FusedScaleMaskSoftmax
```

第一次运行时会自动为这些算子编译对应的cpp或cu代码并保存为so文件，若已编译过会跳过并正常调用。<br />如果接入的大模型需要使用fp16或bf16，可以使用Float16Module进行包装：

```py
from megatron.model import Float16Module

assert not (args.fp16 and args.bf16) and (args.fp16 or args.bf16)
model = Float16Module(model, args)
```

此后大多数情况下可以当作直接使用model本身即可，如需调用model的其他方法，可以通过model.module进行调用。<br />实际调用的时候参考方式同其他pipeline一样，传入任务Tasks，和model_id即可。

<a name="847ec762"></a>