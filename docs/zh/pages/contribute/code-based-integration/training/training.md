<!-- modelscope-docs: 开发训练流程 | contribute/code-based-integration/training/training_CN.md -->

# 接入训练

**如果模型不支持训练，本步骤可以跳过。**

通常来说由于实验性代码一般训练过程比较散乱，接入训练过程可能会花费较多时间。

对于PyTorch模型而言，ModelScope提供了功能较为丰满的`EpochBasedTrainer`，一般要求对应模型接入训练时使用这个trainer。

对其他框架模型而言，ModelScope提供了一个具有high level api的`BaseTrainer`，请继承这个trainer接入训练过程。

## PyTorch模型接入训练

### EpochBasedTrainer

EpochBasedTrainer继承于BaseTrainer，并提供了较全面的功能设计。为便于理解，用户可以将它类比为transformers提供的Trainer类，两者的不同之处主要在于：

- transformers需要数据集在trainer外部预处理，而ModelScope一般在trainer内部由preprocessor预处理
- EpochBasedTrainer提供了hooks机制来支持可插拔的训练策略

由于训练过程较为复杂，如果用户对EpochBasedTrainer尚不了解推荐阅读两个文档：

- [模型的训练Train](../../ModelScope%20Library教程/模型的训练.md)
- [Configuration详解](../../ModelScope%20Library教程/详细教程/Configuration详解.md)

接入时需要注意的点：

1. EpochBasedTrainer不会调用model的postprocess方法
2. EpochBasedTrainer默认使用了torch的data_collator，该collator支持的tensor类型为numpy.ndarray
3. 如果需要额外的训练策略请配置Hooks

4. 接入trainer时，需要考察configuration.json是否需要变更，以及哪些配置推荐用户在运行时动态指定。


模型接入训练时需要考虑现有trainer能否直接满足训练条件：

- 如果满足，可以直接编写测试用例，并在用例中定制trainer中的各模块和训练策略
- 如果不满足，可以继承trainer或新增Metric、Optimizer、LrScheduler等，再按上条编写测试用例

#### 可配置传入的features

目前用户经常用到的，EpochBasedTrainer中支持定制的参数有：

- 模型id、路径或模型实例
- 配置文件
- 用来修改配置文件的cfg_modify_fn
- data_collator
- 数据集
- 预处理器
- optimizer、lr_scheduler
- 该任务使用的metrics类
- hooks（包含DDP、DeepSpeed训练，EarlyStop策略、TensorBoard可视化等）
- data_loader的配置
- fp16半精度训练
- 随机种子

以上定制可以在configuration中指定，或在trainer构造中传入参数来完成训练接入。

hooks是ModelScope特有的组件，用于提供可插拔的训练策略支持。当前支持的hooks可以查看[Configuration详解](../../ModelScope%20Library教程/详细教程/Configuration详解.md)中hooks的部分

> 注：hooks不满足需求时请联系ModelScope开发人员定制，不建议自行添加。

#### 添加新的Metrics、Optimizer、LrScheduler

ModelScope的Metric类用于eval过程计算指标。Metric按照**任务类型**提供，如[Metric已有](../../ModelScope%20Library教程/模型的训练.md)请复用。不存在时可以参考[模型的评估](../../ModelScope%20Library教程/详细教程/模型的评估.md)新建。

Optimizer和LrScheduler默认支持范围是当前torch的所有对应native组件，如需额外注册请参考[训练的详细参数](../../ModelScope%20Library教程/详细教程/训练的详细参数.md)。

#### 需要继承EpochBasedTrainer的场景

如上面的配置仍然不能满足需求，可以考虑继承EpochBasedTrainer。一般可供定制的方法有：

- train 训练过程方法
- train_loop 训练loop方法
- train_step 训练forward方法
- evaluate 评估过程方法
- evaluation_loop 评估过程的loop方法
- evaluation_step 评估过程forward方法
- create_optimizer_and_scheduler 创建optimizer和lr_scheduler，包括定制对应的param_groups
- get_train_dataloader/get_eval_dataloader 获取dataloader

建议接入完成后，编写一个完整的测试用例，保证loss可以正常下降。在训练结束后，保证得到的metrics和待接入代码相符合。用例可以写在tests/trainers下面，用例要求和建议可以查看[编写测试用例](./编写测试用例.md)中对于训练的描述。

### 实际的例子

- tests/trainers/test_finetune_sequence_classification.py中test_finetune_afqmc 文本分类任务的基本实现

## 其他框架模型接入训练

非PyTorch模型的训练统一接入BaseTrainer。该trainer提供的high level api有：

- train
- evaluate 

### 实际的例子

- modelscope/trainers/nlp/sequence_classification_trainer.py
