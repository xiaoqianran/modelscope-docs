<!-- modelscope-docs: Model Training | sdk/model-training/model-training_EN.md -->

# Training Introduction

ModelScope provides numerous models that can be directly used for inference or have their parameters regenerated based on user datasets—a process called training. Specifically, training based on a pre-trained backbone is called fine-tuning.

Generally, a complete model training process includes two phases: training and evaluation. The training phase uses a training dataset, feeds data into the model to calculate loss, and updates model parameters accordingly. The evaluation phase uses an evaluation dataset to assess model performance after feeding data through the model.

ModelScope provides comprehensive training components, with the primary component being the trainer. These components can be used in both pre-training and standard training scenarios.

# PyTorch Training Workflow

![image.png](./_resources/train.png)

ModelScope's model training steps are as follows:

1. Load dataset using MsDataset
2. Write a cfg_modify_fn method to modify parameters as needed
3. Construct a trainer and start training
4. [Post-training step] Evaluate the model
5. [Post-training step] Perform inference using the trained model

PyTorch model training uses EpochBasedTrainer (and its subclasses), which instantiates model, preprocessor, optimizer, metrics, and other modules based on configuration files. Therefore, the key to training models lies in creating reasonable configurations, where all components used are standard ModelScope modules.

## Important Constructor Parameters for Trainer

```jax
model: Model ID, local model path, or model instance (required)
cfg_file: Additional configuration file (optional). If provided, the trainer will use this configuration for training
cfg_modify_fn: Callback method called by the trainer after reading the configuration to modify configuration items (optional). If not provided, the original configuration will be used
train_dataset: Training dataset (required when calling training)
eval_dataset: Evaluation dataset (required when calling evaluation)
optimizers: Custom (optimizer, lr_scheduler) pair (optional). If provided, the configuration file settings will be ignored
seed: Random seed
launcher: Supports distributed training using pytorch/mpi/slurm
device: Training device. Optional values include cpu, gpu, gpu:0, cuda:0, etc. Default is gpu
```

## A Simple Example: Text Classification
Below is a simple text classification task demonstrating how to execute an end-to-end fine-tuning task with just a dozen lines of code. Assume the model to be trained is:

```text
# structbert backbone; this model doesn't have a valid classifier, so fine-tuning is required before use
model_id = 'damo/nlp_structbert_backbone_base_std'
```

### Loading Dataset with MsDataset
`MsDataset` provides the capability to load datasets, including user data and ModelScope ecosystem datasets. The following example loads the AFQMC (Ant Financial Question Matching Corpus, sentence pair similarity task) dataset provided by ModelScope:

```python
from modelscope.msdatasets import MsDataset
# Load training data; data format is similar to {'sentence1': 'some content here', 'sentence2': 'other content here', 'label': 0}
train_dataset = MsDataset.load('clue',  subset_name='afqmc', split='train')
# Load evaluation data
eval_dataset = MsDataset.load('clue',  subset_name='afqmc', split='validation')
```

Alternatively, you can load your own dataset:

```py
from modelscope.msdatasets import MsDataset
# Load training data
train_dataset = MsDataset.load('/path/to/my_train_file.txt')
# Load evaluation data
eval_dataset = MsDataset.load('/path/to/my_eval_file.txt')
```

For detailed MsDataset usage, please refer to the API documentation: [Data Processing](./dataset-usage-guide.md).

### Writing cfg_modify_fn Method to Modify Parameters as Needed

It's recommended to first examine the model's configuration file and identify parameters that need modification:

```python
from modelscope.utils.hub import read_config
# The model_id from above
config = read_config(model_id)
print(config.pretty_text)
```

For detailed explanation of configuration files, please refer to [Configuration Details](./detailed-tutorials/configuration-details.md).

Generally, parameters that need modification during training in configuration files fall into these categories:

1. Preprocessor Parameters

```python
# Use the preprocessor sen-sim-tokenizer adapted for this model
cfg.preprocessor.type='sen-sim-tokenizer'
# Key for sentence1 in the preprocessor input dict; refer to the afqmc format loaded above
cfg.preprocessor.first_sequence = 'sentence1'
# Key for sentence2 in the preprocessor input dict
cfg.preprocessor.second_sequence = 'sentence2'
# Key for label in the preprocessor input dict
cfg.preprocessor.label = 'label'
# Mapping between labels and IDs required by the preprocessor
cfg.preprocessor.label2id = {'0': 0, '1': 1}
```

In certain modalities, preprocessor parameters need to be modified according to the dataset (e.g., NLP typically requires modification, while CV usually doesn't). Please refer to [ModelCard](https://www.modelscope.ai/models) or [Best Practices for Each Task](./best-practices-for-each-task/task-introduction.md) for detailed descriptions of training for each task.

2. Model Parameters

```python
# num_labels represents the number of classification categories for this model
cfg.model.num_labels = 2
```

3. Task Parameters

```python
# Modify task type to 'text-classification'
cfg.task = 'text-classification'
# Modify pipeline name for subsequent inference
cfg.pipeline = {'type': 'text-classification'}
```

4. Training Parameters

Training hyperparameter adjustments are generally made here:

```python
# Set training epochs
cfg.train.max_epochs = 5
# Working directory
cfg.train.work_dir = '/tmp'
# Set batch_size
cfg.train.dataloader.batch_size_per_gpu = 32
cfg.evaluation.dataloader.batch_size_per_gpu = 32
# Set learning rate
cfg.train.optimizer.lr = 2e-5
# Set total_iters for LinearLR; this is related to dataset size
cfg.train.lr_scheduler.total_iters = int(len(train_dataset) / cfg.train.dataloader.batch_size_per_gpu) * cfg.train.max_epochs
# Set evaluation metric class
cfg.evaluation.metrics = 'seq-cls-metric'
```

Apply the above configuration modifications using cfg_modify_fn:

```python
# This method is executed immediately after the trainer reads configuration.json, before constructing model, preprocessor, and other components
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
  # Note: the modified cfg must be returned
  return cfg
```

### Construct Trainer and Start Training
First, configure the required training parameters:
```python
from modelscope.trainers import build_trainer

# Configuration parameters
kwargs = dict(
        model=model_id,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        cfg_modify_fn=cfg_modify_fn)
trainer = build_trainer(default_args=kwargs)
trainer.train()
```

**Note: Data is processed by the preprocessor when the trainer retrieves data from the dataloader.**

Congratulations! You've completed a model training session 😀.

### Model Evaluation

Optionally, you can perform **evaluation on additional datasets** after training. Users can separately call the evaluate method to evaluate the model:

```python
from modelscope.msdatasets import MsDataset
# Load evaluation data
eval_dataset = MsDataset.load('clue',  subset_name='afqmc', split='validation')

from modelscope.trainers import build_trainer

# Configuration parameters
kwargs = dict(
        # Since using the trained model directory, cfg_modify_fn is not needed
        model='/tmp/output',
        eval_dataset=eval_dataset)
trainer = build_trainer(default_args=kwargs)
trainer.evaluate()
```

Alternatively, you can call the predict method to **save prediction results** for subsequent submissions:

```python
from modelscope.msdatasets import MsDataset
import numpy as np

# Load evaluation data
eval_dataset = MsDataset.load('clue', subset_name='afqmc', split='test').to_hf_dataset()

from modelscope.trainers import build_trainer


def cfg_modify_fn(cfg):
    # Preprocessor retains redundant fields in mini-batch
    cfg.preprocessor.val.keep_original_columns = ['sentence1', 'sentence2']
    # Prediction dataset has no label; set corresponding key to None
    cfg.preprocessor.val.label = None
    return cfg


kwargs = dict(
    model='damo/nlp_structbert_sentence-similarity_chinese-tiny',
    work_dir='/tmp',
    cfg_modify_fn=cfg_modify_fn,
    # remove_unused_data converts columns specified in keep_original_columns to attributes
    remove_unused_data=True)

trainer = build_trainer(default_args=kwargs)


def saving_fn(inputs, outputs):
    with open(f'/tmp/predicts.txt', 'a') as f:
        # Retrieve redundant values through attributes
        sentence1 = inputs.sentence1
        sentence2 = inputs.sentence2
        predictions = np.argmax(outputs['logits'].cpu().numpy(), axis=1)
        for sent1, sent2, pred in zip(sentence1, sentence2, predictions):
            f.writelines(f'{sent1}, {sent2}, {pred}\n')


trainer.predict(predict_datasets=eval_dataset,
                saving_fn=saving_fn)

```

### Inference with Trained Model

After training completion, the folder will contain model configurations ready for inference, which can be directly used with pipelines:

- {work_dir}/output: **After training completion**, stores model configuration files and model parameters from the last epoch/iteration (requires CheckpointHook in configuration)
- {work_dir}/output_best: **When best model parameters are achieved**, stores model configuration files and the best model parameters (requires BestCkptSaverHook in configuration)

```python
from modelscope.pipelines import pipeline
pipeline_ins = pipeline('text-classification', model='/tmp/output')
pipeline_ins(('Is this feature available?', 'Is this feature available now?'))
```

Additionally, ModelScope stores *.pth files for subsequent continued training, post-training validation, and post-training inference. Generally, two pth files are stored per save:

- epoch_*.pth stores the model's state_dict; **the bin files in output/output_best are hard links to this file**
- epoch\_*\_trainer_state.pth stores the trainer's state_dict

> In continued training scenarios, only the model's pth file needs to be loaded; the trainer's pth file will be read simultaneously.
>
> Users can also manually link any pth file to output/output_best to enable inference from any saved checkpoint.

The pth filename format is as follows:

- epoch\_{n}/iter\_{n}.pth (e.g., epoch_3.pth): **Saved every interval epochs/iterations** (requires CheckpointHook in configuration)
- best_epoch{n}_{metricname}{m}.pth (e.g., best_iter13_accuracy22.pth): **Saved when best model parameters are achieved** (requires BestCkptSaverHook in configuration)

```py
# For continued training
trainer.train(checkpoint_path=os.path.join(self.tmp_dir, 'iter_3.pth'))
# For post-training evaluation
trainer.evaluate(checkpoint_path=os.path.join(self.tmp_dir, 'iter_3.pth'))
# For post-training inference and saving predicted labels to file via saving_fn
trainer.predict(checkpoint_path=os.path.join(self.tmp_dir, 'iter_3.pth'),
                predict_datasets=some_dataset,
                saving_fn=some-saving-fn)
```



## Configuring Launch Scripts in Shell

Using EpochBasedTrainer in shell requires TrainingArgs:

```py
from modelscope.trainers.training_args import TrainingArgs


# TrainingArgs supports passing common parameters from configuration.json; calling from_cli parses CLI parameters
args = TrainingArgs.from_cli(
    task='text-classification', eval_metrics='seq-cls-metric')

print(args)

kwargs = dict(
    model=args.model,
    seed=args.seed,
    # TrainingArgs supports call method; CLI parameters passed to cfg_modify_fn directly affect the configuration
    cfg_modify_fn=args,
    ...)

# Other code is the same as standard training
```

> 1. TrainingArgs supports -h to print all supported parameters; you can also use: -h --model model-id-or-dir, which prints parameters already existing in the model-id-or-dir configuration
> 2. To add new parameters, inherit from TrainingArgs and set the dataclass field's default to None

For complete TrainingArgs usage examples, please refer to examples/pytorch content. For detailed EpochBasedTrainer usage, please refer to the documentation [Detailed Training Parameters](./detailed-tutorials/detailed-training-parameters.md).

# Training for Non-PyTorch Models

Training for non-PyTorch models is generally implemented with specific training logic by the models themselves. Please refer to the appendix of this document for training these models. Subsequently, please refer to the corresponding ModelCard.

# Pushing Models to ModelHub

ModelScope supports the `push_to_hub` method to manually push a model to ModelHub:

```py
from modelscope.hub.push_to_hub import push_to_hub, push_to_hub_async
# Push to hub
push_to_hub(
    # Required: The model ID in ModelHub
    repo_name='some-group/some-model-id',
    # Required: The training output directory to be uploaded
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
    # Required: The model ID in ModelHub
    repo_name='some-group/some-model-id',
    # Required: The training output directory to be uploaded
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

Notes:

1. If repo_name (model-id) doesn't exist, push_to_hub will create one using the user token
2. When async_upload=True, only one submission can run simultaneously; if a previous submission is still uploading, subsequent attempts will print an exception and return

EpochBasedTrainer's CheckpointHook currently integrates push capability; please refer to [Configuration Details](./detailed-tutorials/configuration-details.md). The push_to_hub in trainer is asynchronous; please do not use this feature in [`ProcessPoolExecutor`](https://docs.python.org/3/library/concurrent.futures.html#concurrent.futures.ProcessPoolExecutor) as it will cause deadlocks.

# Appendix: ModelScope Supported Trainable Tasks, Models, and Components

For detailed model invocation information, please refer to the platform website [https://www.modelscope.ai/](https://www.modelscope.ai/#/models) and the corresponding ModelCard for each model. Models that support fine-tuning and training will be marked with "**Training Supported**" on their model introduction page.

Below is a partial list of models that support training and their corresponding downstream tasks.

| Domain | Task | Metric | Model | Trainer |
|----------|----------------------|------------------|:---------------:|--------------------------|
| NLP | text-classification | seq-cls-metric | BERT/StructBERT | EpochBasedTrainer |
| NLP | text-classification | seq-cls-metric | VECO (Multilingual) | VecoTrainer |
| NLP | token-classification | token-cls-metric | BERT/StructBERT | EpochBasedTrainer |
| NLP | text-generation | text-gen-metric | PALM_v2 | TextGenerationTrainer |
| NLP | text-generation | text-gen-metric | PLUG | PlugTrainer |
| NLP | text-generation | text-gen-metric | GPT3 | GPT3Trainer |
| NLP | text-ranking | seq-cls-metric | BERT | TextRankingTrainer |
| NLP | Translation | | CSANMT | CsanmtTranslationTrainer |
| NLP | text-generation | text-gen-metric | gpt-moe | GPTMoETrainer |
| CV | Image Instance Segmentation | | swin-b | |
| CV | Image Denoising | | nafnet | |
| CV | Image Color Enhancement | | csrnet | |
| CV | Portrait Enhancement | | gpen | |