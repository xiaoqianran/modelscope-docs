<!-- modelscope-docs: Large Model Development | contribute/code-based-integration/tutorials/large-model-development/large-model-development_EN.md -->

This document is intended for large models using **Megatron** for distributed training to be integrated into ModelScope.

For large models that cannot be loaded into a single GPU's memory, tensor parallelism is more memory-efficient than pipeline parallelism in a single-machine multi-GPU environment. Models trained with Megatron framework code can be conveniently integrated into ModelScope with minimal modifications, leveraging the capabilities provided by megatron_util. The following sections will introduce the distributed inference and training capabilities provided by megatron_util from two scenarios—large model inference and training—across various model execution environments including single-machine single-GPU, single-machine multi-GPU, and multi-machine multi-GPU setups.

Due to operator replacements and code updates during Megatron's evolution, there are compatibility issues between versions V1 and V3 regarding certain operators or underlying implementations. To maintain compatibility with large models trained using different versions of mpu, we have packaged some Megatron and mpu-related calls from V1 and V3 into **megatron-util** for use in ModelScope. You can install it using the following command:

```shell
pip install "modelscope[nlp]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

<a name="f7a7b418"></a>
### Pipeline Integration

When integrating large model inference, the preprocessor and postprocessor components in the pipeline are no different from those used for small-to-medium models without Megatron—they depend solely on the model's logic. Please refer to the [Standard Module Code Development Integration Process](standard-module-code-development-integration-process.md).<br />To integrate a model into ModelScope, you need to provide a pipeline-based calling method. To maintain consistency with ModelScope's pipeline invocation, large models should not use common multi-process calling methods such as **torchrun** or **python -m torch.distributed.launch**. Instead, multi-process scheduling will be encapsulated by DistributedPipeline.

<a name="c5e1637e"></a>
#### Introduction to DistributedPipeline

When integrating large models into a pipeline, you can inherit this class to implement your own Pipeline class. This document provides a brief introduction to its usage during integration. Below is the main code structure of DistributedPipeline:

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

The initialization process of DistributedPipeline includes necessary configurations for rank, process pool, and IP/port for synchronized communication, and calls the `_instantiate_one` method in each subprocess.<br />When inheriting and implementing a pipeline, **note that `_instantiate_one` must remain a class method**. This ensures that each subprocess in the process pool initializes the corresponding rank model, obtaining `cls.model`, with each model slice having the same lifecycle as its current process. The `_instantiate_one` function has no return value; after calling it, `cls.model` is initialized in this process and can be correspondingly called in `_forward_one`.<br />Calling `forward` in the main process means calling `_forward_one` of subprocesses separately in the process pool.<br />Similarly, **`_forward_one` must remain a class method**, typically corresponding to the `forward` method of `cls.model` in each process, which developers define and implement according to the specific task of the pipeline.

<a name="2cdc6b8b"></a>
#### Initialization and Invocation of Single Model Slices

This section uses the GPT3 large model as an example to briefly introduce model initialization and invocation methods:

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

Without considering the encapsulation of DistributedGPT3, `_instantiate_one` actually calls `initialize_distributed` and `set_random_seed_mpu`, constructs `GPT3Model`, attaches necessary model parallelism information, moves it to the corresponding GPU, and loads model parameters.<br />The `init_megatron_util` function requires `megatron_cfg`, `model_dir`, and `rank` as parameters, and internally calls Megatron initialization methods to initialize each subprocess. You can refer to existing code for implementation.

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

In comparison, `_forward_one` is much simpler. Since model partitioning and communication are entirely managed by Megatron, `_forward_one` can be implemented the same way as single-GPU invocation.

<a name="24534bbf"></a>
#### Using megatron_util

Typically, for large models developed and trained based on Megatron, you only need to specify the Megatron version corresponding to the model codebase. Currently supported versions include v1, v3, and moe. Different versions may support different parallelization strategies and underlying operators, with v3 being the default if not specified.

After specifying the version, most interfaces such as `get_data_parallel_rank` are universal and can be directly imported and used.

```py
# An example
from megatron.model import (AttnMaskType, LayerNorm,
                            bias_gelu_impl)
from megatron.model.fused_softmax import FusedScaleMaskSoftmax
```

During the first run, the corresponding cpp or cu code for these operators will be automatically compiled and saved as so files. If already compiled, this step will be skipped and normal invocation will proceed.<br />If the integrated large model needs to use fp16 or bf16, you can wrap it using Float16Module:

```py
from megatron.model import Float16Module

assert not (args.fp16 and args.bf16) and (args.fp16 or args.bf16)
model = Float16Module(model, args)
```

Afterward, in most cases, you can treat it as using the model itself directly. If you need to call other methods of the model, you can do so through `model.module`.<br />The actual invocation method is the same as other pipelines—simply pass in the task `Tasks` and `model_id`.