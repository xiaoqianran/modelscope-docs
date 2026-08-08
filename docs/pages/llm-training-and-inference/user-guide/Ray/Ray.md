<!-- modelscope-docs: Ray | llm-training-and-inference/user-guide/Ray/Ray_EN.md -->

# Ray Support

SWIFT already supports using Ray for multi-GPU or multi-node training. The current support status for Ray across different features is as follows:

| Feature    | Ray Support | Example                                                                          | Assignable Roles        |
|------------|-------------|----------------------------------------------------------------------------------|-------------------------|
| pt/sft     | ✅          | https://github.com/modelscope/ms-swift/tree/main/examples/train/multi-node/ray   | default                 |
| dpo        | ❎          |                                                                                  |                         |
| grpo       | ❎          |                                                                                  |                         |
| ppo        | ❎          |                                                                                  |                         |
| megatron   | ❎          |                                                                                  |                         |
| sampling   | ✅          | https://github.com/modelscope/ms-swift/tree/main/examples/sampler/distill        | sampler/prm/orm         |
| distill    | ✅          | https://github.com/modelscope/ms-swift/tree/main/examples/sampler/sample         | sampler/prm/orm         |

## Technical Details

Before discussing parameter configuration, it's necessary to explain the technical details first. Since SWIFT currently uses many existing implementations from transformers and trl internally, it's not feasible to decompose the system into different Ray roles like veRL or ROLL. Additionally, such decomposition would center around Ray, leading to poor support for non-Ray scenarios.

Therefore, SWIFT adopts a decorator-based technical approach, defining different roles at the function level. These roles can be configured in parameters to specify how they should be used. See the following example:

```python
from swift.ray import RayHelper

@RayHelper.worker(group=['model1', 'model2'])
class MyTrainer:

    def __init__(self, args):
        self._prepare_model1()
        self._prepare_model2()
        self._prepare_datasets()

    @RayHelper.function(group='model1')
    def _prepare_model1(self):
        ...

    @RayHelper.function(group='model2')
    def _prepare_model2(self):
        ...

    @RayHelper.function(group='model1')
    def rollout(self, inputs):
        return self.model1.generate(inputs)

    @RayHelper.function(group='model2')
    def forward_model2(self, inputs):
        loss = self.model2.forward(inputs)
        loss.backward()

    def _prepare_datasets(self):
        self.dataset = ...

    def train(self):
        for batch in DataLoader(self.dataset):
            generated = self.rollout(batch)
            self.forward_model2(generated)
            ...


if __name__ == '__main__':
    ...
    MyTrainer(args).train()
```

RayHelper will assign decorated methods to different hardware clusters, smoothly converting local calls to remote calls within the Ray cluster. It's also possible to organize by class:

```python

@RayHelper.worker(group=['model1'])
class Model1:
    ...

    @RayHelper.function(group='model1')
    def rollout(self):
        ...

@RayHelper.worker(group=['model2'])
class Model2:
    ...

    @RayHelper.function(group='model2')
    def forward_and_optimize(self):
        ...


class Trainer:
    ...
```

SWIFT's Ray support essentially uses a combination of `@worker` and `@function` annotations, where `worker` specifies the Ray cluster role and `function` specifies how data should be distributed.

The `function` annotation has several additional parameters:
```python
    @staticmethod
    def function(group: str,
                 dispatch: Union[Literal['slice', 'all'], Callable] = 'all',
                 execute: Literal['first', 'all'] = 'all',
                 collect: Union[Literal['none', 'flatten'], Callable] = 'none'):
```

- dispatch: How to distribute input arguments
  - slice: Split input arguments for load-balanced execution across workers
  - all: All workers receive identical input arguments
  - Custom splitting method with format:
    ```python
        def my_custom_slice(n, i, data):
            # n is the number of workers, i is the current worker index, data is the original input
            # Return the input for the i-th worker
    ```
- execute: How to execute
  - first: Only rank0 executes (slice and Callable splitting methods are invalid in this case)
  - all: Execute on all workers

- collect: How to collect return data
  - none: Return as-is, formatted as a list of return values from each worker
  - flatten: Flatten the results returned by workers, supporting tuple flattening
  - Callable: Custom collect method with format:
    ```python
        def my_custom_collect(result):
            # result is a list of returns from each worker
            # Return your desired format
    ```

## Parameter Configuration

After understanding the technical details, we can configure the parameters. Developers can set different hardware configurations based on the role lists in different processes. For example, in the sampling feature, there are three roles: sampler, prm, and orm. The configuration would look like this:

```yaml
device_groups:
  nproc_per_node: 4
  sample_group:
    device: GPU
    ranks: list(range(0, 2))
    workers:
      - sampler
  rm_group:
    device: GPU
    ranks: list(range(2, 4))
    workers:
      - prm
      - orm
```

- nproc_per_node: Minimum number of GPUs required per node in the Ray cluster.
xxx_group: Name of each Ray group, which can be specified arbitrarily
  - device: Device type, currently supports GPU/CPU, etc.
  - ranks: Which ranks are assigned to the current group. For CPU, ranks can only be integers representing the total number of processes needed. For GPU, it can be formats like `[0,1,2,3]`, `4`, `list(range(0, 4))`, etc.
  - workers: Which roles are assigned to the current group.

All available roles can be found in the table at the beginning of this document.

When using command line, `device_groups` can also be passed as `--device_groups xxx`, where xxx is a JSON string. For configuration simplicity, we strongly recommend using YAML format when working with Ray.