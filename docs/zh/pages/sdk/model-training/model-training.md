<!-- modelscope-docs: 模型的训练 | sdk/model-training/model-training_CN.md -->

# 训练介绍

ModelScope提供了很多模型，这些模型可以直接在推理中使用，也可以根据用户数据集重新生成模型的参数，这个过程叫做训练。特别地，基于预训练backbone进行训练的过程叫做微调（finetune）。

一般来说，一次完整的模型训练包含了训练(train)和评估(evaluate)两个过程。训练过程使用训练数据集，将数据输入模型计算出loss后更新模型参数。评估过程使用评估数据集，将数据输入模型后评估模型效果。

ModelScope提供了完整的训练组件，其中的主要组件被称为trainer（训练器），这些组件可以在`预训练`或`普通训练`场景下使用。

# PyTorch训练流程 

![image.png](./_resources/train.png)

ModelScope的模型训练步骤如下：

1. 使用MsDataset加载数据集
2. 编写cfg_modify_fn方法，按需修改部分参数
3. 构造trainer，开始训练
4. 【训练后步骤】进行模型评估
5. 【训练后步骤】使用训练后的模型进行推理

PyTorch模型的训练使用EpochBasedTrainer（及其子类），该类会根据配置文件实例化模型、预处理器、优化器、指标等模块。因此训练模型的重点在于修改出合理的配置，其中用到的各组件都是ModelScope的标准模块。

## trainer的重要构造参数

```jax
model: 模型id、模型本地路径或模型实例，必填
cfg_file: 额外的配置文件，可选。如果填写，trainer会使用这个配置进行训练
cfg_modify_fn: 读取配置后trainer调用这个回调方法修改配置项，可选。如果不传就使用原始配置
train_dataset: 训练用的数据集，调用训练时必传
eval_dataset: 评估用的数据集，调用评估时必传
optimizers: 自定义的(optimizer、lr_scheduler)，可选，如果传入就不会使用配置文件中的
seed: 随机种子
launcher: 支持使用pytorch/mpi/slurm开启分布式训练
device: 训练用设备。可选，值为cpu, gpu, gpu:0, cuda:0等，默认gpu
```

## 一个简单的例子：文本分类
下面以一个简单的文本分类任务为例，演示如何通过十几行代码，就可以端到端执行一个finetune任务。假设待训练模型为：

```text
# structbert的backbone，该模型没有有效分类器，因此使用前需要finetune（微调）
model_id = 'damo/nlp_structbert_backbone_base_std'
```

### 使用MsDataset加载数据集
`MsDataset`提供了加载数据集的能力，包括用户的数据和ModelScope生态数据集。下面的示例加载了ModelScope提供的afqmc（Ant Financial Question Matching Corpus，双句相似度任务）数据集：

```python
from modelscope.msdatasets import MsDataset
# 载入训练数据，数据格式类似于{'sentence1': 'some content here', 'sentence2': 'other content here', 'label': 0}
train_dataset = MsDataset.load('clue',  subset_name='afqmc', split='train')
# 载入评估数据
eval_dataset = MsDataset.load('clue',  subset_name='afqmc', split='validation')
```

或者，也可以加载用户自己的数据集：

```py
from modelscope.msdatasets import MsDataset
# 载入训练数据
train_dataset = MsDataset.load('/path/to/my_train_file.txt')
# 载入评估数据
eval_dataset = MsDataset.load('/path/to/my_eval_file.txt')
```

具体MsDataset 使用可以参考接口文档： [数据的处理](./数据集使用指南.md)。

### 编写cfg_modify_fn方法，按需修改部分参数

建议首先查看模型的配置文件，并查看需要额外修改的参数：

```python
from modelscope.utils.hub import read_config
# 上面的model_id
config = read_config(model_id)
print(config.pretty_text)
```

有关配置文件的详细解释，后续您可以查看[配置文件详解](./详细教程/Configuration详解.md)。

一般的配置文件中，在训练时需要修改的参数一般分为：

1. 预处理器参数

```python
# 使用该模型适配的预处理器sen-sim-tokenizer
cfg.preprocessor.type='sen-sim-tokenizer'
# 预处理器输入的dict中，句子1的key，参考上文加载数据集中的afqmc的格式
cfg.preprocessor.first_sequence = 'sentence1'
# 预处理器输入的dict中，句子2的key
cfg.preprocessor.second_sequence = 'sentence2'
# 预处理器输入的dict中，label的key
cfg.preprocessor.label = 'label'
# 预处理器需要的label和id的mapping
cfg.preprocessor.label2id = {'0': 0, '1': 1}
```

某些模态中，预处理的参数需要根据数据集修改（比如NLP一般需要修改，而CV一般不需要修改），后续可以查看[ModelCard](https://www.modelscope.cn/models)或[各任务最佳实践](./各任务最佳实践/任务的介绍.md)中各任务训练的详细描述。

2. 模型参数

```python
# num_labels是该模型分类数
cfg.model.num_labels = 2
```

3. 任务参数

```python 
# 修改task类型为'text-classification'
cfg.task = 'text-classification'
# 修改pipeline名称，用于后续推理
cfg.pipeline = {'type': 'text-classification'}
```

4. 训练参数

一般训练超参数的调节都在这里进行：

```python 
# 设置训练epoch
cfg.train.max_epochs = 5
# 工作目录
cfg.train.work_dir = '/tmp'
# 设置batch_size
cfg.train.dataloader.batch_size_per_gpu = 32
cfg.evaluation.dataloader.batch_size_per_gpu = 32
# 设置learning rate
cfg.train.optimizer.lr = 2e-5
# 设置LinearLR的total_iters，这项和数据集大小相关
cfg.train.lr_scheduler.total_iters = int(len(train_dataset) / cfg.train.dataloader.batch_size_per_gpu) * cfg.train.max_epochs
# 设置评估metric类
cfg.evaluation.metrics = 'seq-cls-metric'
```

使用cfg_modify_fn将上述配置修改应用起来：

```python
# 这个方法在trainer读取configuration.json后立即执行，先于构造模型、预处理器等组件
def cfg_modify_fn(cfg):
  cfg.preprocessor.type='sen-sim-tokenizer'
  cfg.preprocessor.first_sequence = 'sentence1'
  cfg.preprocessor.second_sequence = 'sentence2'
  cfg.preprocessor.label = 'label'
  cfg.preprocessor.label2id = {'0': 0, '1': 1}
  cfg.model.num_labels = 2
  cfg.task = 'text-classification'
  cfg.pipeline = {'type': 'text-classification'}
  cfg.train.max_epochs = 5
  cfg.train.work_dir = '/tmp'
  cfg.train.dataloader.batch_size_per_gpu = 32
  cfg.evaluation.dataloader.batch_size_per_gpu = 32
  cfg.train.dataloader.workers_per_gpu = 0
  cfg.evaluation.dataloader.workers_per_gpu = 0
  cfg.train.optimizer.lr = 2e-5
  cfg.train.lr_scheduler.total_iters = int(len(train_dataset) / cfg.train.dataloader.batch_size_per_gpu) * cfg.train.max_epochs
  cfg.evaluation.metrics = 'seq-cls-metric'
  # 注意这里需要返回修改后的cfg
  return cfg
```

### 构造trainer，开始训练
首先，配置训练所需参数：
```python
from modelscope.trainers import build_trainer

# 配置参数
kwargs = dict(
        model=model_id,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        cfg_modify_fn=cfg_modify_fn)
trainer = build_trainer(default_args=kwargs)
trainer.train()
```

**需要注意，数据由trainer从dataloader取数据的时候调用预处理器进行处理。**

恭喜，你完成了一次模型训练😀。

### 进行模型评估

可选地，在训练后可以进行**额外数据集的评估**。用户可以单独调用evaluate方法对模型进行评估：

```python
from modelscope.msdatasets import MsDataset
# 载入评估数据
eval_dataset = MsDataset.load('clue',  subset_name='afqmc', split='validation')

from modelscope.trainers import build_trainer

# 配置参数
kwargs = dict(
        # 由于使用的模型训练后的目录，因此不需要传入cfg_modify_fn
        model='/tmp/output',
        eval_dataset=eval_dataset)
trainer = build_trainer(default_args=kwargs)
trainer.evaluate()
```

或者，也可以调用predict方法将**预测结果保存**下来，以供后续打榜：

```python
from modelscope.msdatasets import MsDataset
import numpy as np

# 载入评估数据
eval_dataset = MsDataset.load('clue', subset_name='afqmc', split='test').to_hf_dataset()

from modelscope.trainers import build_trainer


def cfg_modify_fn(cfg):
    # 预处理器在mini-batch中留存冗余字段
    cfg.preprocessor.val.keep_original_columns = ['sentence1', 'sentence2']
    # 预测数据集没有label，将对应key置空
    cfg.preprocessor.val.label = None
    return cfg


kwargs = dict(
    model='damo/nlp_structbert_sentence-similarity_chinese-tiny',
    work_dir='/tmp',
    cfg_modify_fn=cfg_modify_fn,
    # remove_unused_data会将上述keep_original_columns的列转为attributes
    remove_unused_data=True)

trainer = build_trainer(default_args=kwargs)


def saving_fn(inputs, outputs):
    with open(f'/tmp/predicts.txt', 'a') as f:
        # 通过attribute取冗余值
        sentence1 = inputs.sentence1
        sentence2 = inputs.sentence2
        predictions = np.argmax(outputs['logits'].cpu().numpy(), axis=1)
        for sent1, sent2, pred in zip(sentence1, sentence2, predictions):
            f.writelines(f'{sent1}, {sent2}, {pred}\n')


trainer.predict(predict_datasets=eval_dataset,
                saving_fn=saving_fn)

```

### 使用训练后的模型进行推理

训练完成以后，文件夹中会生成推理用的模型配置，可以直接用于pipeline：

- {work_dir}/output：**训练完成后**，存储模型配置文件，及最后一个epoch/iter的模型参数（配置中需要指定CheckpointHook）
- {work_dir}/output_best：**最佳模型参数时**，存储模型配置文件，及最佳的模型参数（配置中需要指定BestCkptSaverHook）

```python
from modelscope.pipelines import pipeline
pipeline_ins = pipeline('text-classification', model='/tmp/output')
pipeline_ins(('这个功能可用吗', '这个功能现在可用吗'))
```

此外，ModelScope也会存储*.pth文件，用于后续继续训练、训练后验证、训练后推理。一般一次存储会存储两个pth文件：

- epoch_*.pth 存储模型的state_dict，**output/output_best的bin文件是此文件的硬链接**
- epoch\_*\_trainer_state.pth，存储trainer的state_dict

> 在继续训练场景时，只需要加载模型的pth文件，trainer的pth文件会被同时读取。
>
> 用户也可以手动link某个pth文件到output/output_best，实现使用任意一个存储节点的推理

pth的文件名格式如下：

- epoch\_{n}/iter\_{n}.pth（如epoch_3.pth）: **每interval个epoch/iter周期存储**（配置中需要指定CheckpointHook）
- best_epoch{n}_{metricname}{m}.pth(如best_iter13_accuracy22.pth)：**取得最佳模型参数时存储**（配置中需要指定BestCkptSaverHook）

```py
# 用于继续训练
trainer.train(checkpoint_path=os.path.join(self.tmp_dir, 'iter_3.pth'))
# 用于训练后评估
trainer.evaluate(checkpoint_path=os.path.join(self.tmp_dir, 'iter_3.pth'))
# 用于训练后推理并通过saving_fn存储预测的label为文件
trainer.predict(checkpoint_path=os.path.join(self.tmp_dir, 'iter_3.pth'), 
                predict_datasets=some_dataset,
                saving_fn=some-saving-fn)
```



## 在shell中配置启动脚本

在shell中使用EpochBasedTrainer需要使用TrainingArgs：

```py
from modelscope.trainers.training_args import TrainingArgs


# TrainingArgs支持传入configuration.json中的各常用参数，调用from_cli会解析CLI中传入的参数
args = TrainingArgs.from_cli(
    task='text-classification', eval_metrics='seq-cls-metric')

print(args)

kwargs = dict(
    model=args.model,
    seed=args.seed,
    # TrainingArgs支持call方法，CLI中的参数传入cfg_modify_fn会直接作用到configuration上
    cfg_modify_fn=args,
    ...)

# 其他代码与普通训练相同
```

> 1. TrainingArgs支持-h来打印所有支持的参数，也可以使用：-h --model model-id-or-dir, 此时打印出来的参数是model-id-or-dir中配置的已有参数
> 2. 如果需要新添加参数，请继承TrainingArgs，并将dataclass的field的default置为None

TrainingArgs的完整使用体验请查看examples/pytorch中的内容。EpochBasedTrainer的详细使用可以参考文档[训练的详细参数](./详细教程/训练的详细参数.md)。

# 非PyTorch模型的训练

非PyTorch模型的训练一般由模型本身实现特定的训练逻辑。有关这些模型的训练请参考本文附录。后续可以参考对应模型的ModelCard。

# 模型推送ModelHub

ModelScope支持`push_to_hub`方法来手动推送一个模型进入modelhub：

```py
from modelscope.hub.push_to_hub import push_to_hub, push_to_hub_async
# Push to hub
push_to_hub(
    # Required: The model id in the modelhub
    repo_name='some-group/some-model-id',
    # Required: The training output dir which will be uploaded
    output_dir='the-training-output-dir',
    # Required: user token
    token='user-token',
    # Optional: Is a private hub or a public hub, default private
  	private=True,
    # Optional: The commit message, default ''
    commit_message='some message',
    # Optional: Tag the commit
    tag='v1.0',
    # Optional: The model which this model comes from
  	source_repo='some model which this model is trained from',
    # Which branch to commit to
    revision='master',
    # Optional: Retry times if the uploading fails
    retry=3)

# Push to hub async 
handler = push_to_hub_async(
    # Required: The model id in the modelhub
    repo_name='some-group/some-model-id',
    # Required: The training output dir which will be uploaded
    output_dir='the-training-output-dir',
    # Required: user token
    token='user-token',
    # Optional: Is a private hub or a public hub, default private
  	private=True,
    # Optional: The commit message, default ''
    commit_message='some message',
    # Optional: Tag the commit
    tag='v1.0',
    # Optional: The model which this model comes from
  	source_repo='some model which this model is trained from',
    # Which branch to commit to
    revision='master')

print(handler.done())
```

需要注意：

1. 如果repo_name(model-id)不存在，push_to_hub会使用用户token创建一个
2. async_upload=True时，仅支持同时运行一次提交，如果前一次提交还在上传，后一次会打印异常并返回

EpochBasedTrainer的CheckpointHook目前集成了推送能力，可以参考[配置详解](./详细教程/Configuration详解.md)。trainer中的push_to_hub是异步的，请不要在[`ProcessPoolExecutor`](https://docs.python.org/3/library/concurrent.futures.html#concurrent.futures.ProcessPoolExecutor) 中使用该功能，会导致死锁。

# 附录：ModelScope支持训练的任务模型、任务和配套组件

以下模型详细调用信息请参考平台官网[https://www.modelscope.cn/](https://www.modelscope.cn/#/models)，对应模型的模型卡片（ModelCard）。支持finetune和训练的模型，在其模型简介页会有“**支持训练**”的标注。

以下列举了其中一部分支持训练的模型及对应的下游任务。

| Domain领域 | Task任务               | Metric指标         |     Model模型     | Trainer                  |
|----------|----------------------|------------------|:---------------:|--------------------------|
| NLP      | text-classification  | seq-cls-metric   | BERT/StructBERT | EpochBasedTrainer        |
| NLP      | text-classification  | seq-cls-metric   |    VECO(多语言)    | VecoTrainer              |
| NLP      | token-classification | token-cls-metric | BERT/StructBERT | EpochBasedTrainer        |
| NLP      | text-generation      | text-gen-metric  |     PALM_v2     | TextGenerationTrainer    |
| NLP      | text-generation      | text-gen-metric  |      PLUG       | PlugTrainer              |
| NLP      | text-generation      | text-gen-metric  |      GPT3       | GPT3Trainer              |
| NLP      | text-ranking         | seq-cls-metric   |      BERT       | TextRankingTrainer       |
| NLP      | Translation          |                  |     CSANMT      | CsanmtTranslationTrainer |
| NLP      | text-generation      | text-gen-metric  |     gpt-moe     | GPTMoETrainer            |
| CV       | 图像实例分割               |                  |     swin-b      |                          |
| CV       | 图像去噪声                |                  |     nafnet      |                          |
| CV       | 图像颜色增强               |                  |     csrnet      |                          |
| CV       | 人像增强                 |                  |      gpen       |                          |