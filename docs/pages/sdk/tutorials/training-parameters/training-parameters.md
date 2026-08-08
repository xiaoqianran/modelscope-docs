<!-- modelscope-docs: Detailed Training Parameters | sdk/tutorials/training-parameters/training-parameters_EN.md -->

# Detailed Training Parameters

## Updating Configuration Parameters

Often, the parameters in the `configuration.json` file cannot meet your requirements, or certain configuration parameters must be provided at runtime, such as dataset information, keys for datasets passed to preprocessors, lambda methods for optimizers, iteration counts for lr_schedulers, etc. In such cases, you need to dynamically adjust parameters at runtime.

- You can update parameters by dumping a new file:

```python
import os
from modelscope.utils.hub import read_config
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
train_dataset = MsDataset.load('clue',  subset_name='afqmc', split='train')
eval_dataset = MsDataset.load('clue',  subset_name='afqmc', split='validation')
model_id = 'damo/nlp_structbert_sentence-similarity_chinese-base'
# Read the cfg file from the model
cfg = read_config(model_id)
# Directly update parameters
cfg.train.max_epochs = 5
cfg.preprocessor.train['label2id'] = {'0': 0, '1': 1}
cfg.preprocessor.val['label2id'] = {'0': 0, '1': 1}
cfg.train.work_dir = '/tmp'
cfg_file = os.path.join('/tmp', 'config.json')
# Write parameters to a new configuration file and pass it to the trainer
cfg.dump(cfg_file)
kwargs = dict(
    model=model_id,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    cfg_file=cfg_file)
trainer = build_trainer(default_args=kwargs)
trainer.train()
```

- You can also dynamically modify parameters through `cfg_modify_fn`:

```python
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer


def cfg_modify_fn(cfg):
    cfg.train.max_epochs = 5
    cfg.preprocessor.train['label2id'] = {'0': 0, '1': 1}
    cfg.preprocessor.val['label2id'] = {'0': 0, '1': 1}
    cfg.train.work_dir = '/tmp'
    # Finally return the updated cfg
    return cfg


train_dataset = MsDataset.load('clue',  subset_name='afqmc', split='train')
eval_dataset = MsDataset.load('clue',  subset_name='afqmc', split='validation')

kwargs = dict(
    model='damo/nlp_structbert_sentence-similarity_chinese-base',
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    # Directly modify cfg content through cfg_modify_fn, and the modified cfg will be saved directly to configuration.json after training
    cfg_modify_fn=cfg_modify_fn)

trainer = build_trainer(name='trainer', default_args=kwargs)
trainer.train()
```

## <div id='load_dataset'>Loading Datasets</div>

ModelScope generally recommends building datasets externally and passing them to the trainer:

```jax
from modelscope.msdatasets import MsDataset
train_dataset = MsDataset.load('clue',  subset_name='afqmc', split='train')
eval_dataset = MsDataset.load('clue',  subset_name='afqmc', split='validation')
```

Optionally, if you want to configure dataset information in the configuration file, here's a basic approach:

```py
import os
from modelscope.utils.hub import read_config
from modelscope.trainers import build_trainer

model_id = 'damo/nlp_structbert_sentence-similarity_chinese-base'


def cfg_modify_fn(cfg):
    cfg.train.max_epochs = 5
    cfg.train.work_dir = '/tmp'
    cfg.preprocessor.train['label2id'] = {'0': 0, '1': 1}
    cfg.preprocessor.val['label2id'] = {'0': 0, '1': 1}
    cfg.preprocessor.label = 'label'
    # Set training and validation datasets
    cfg.dataset = {
        'train': {
            'name': 'clue',
            'subset_name': 'afqmc',
            'split': 'train',
        },
        'val': {
            'name': 'clue',
            'subset_name': 'afqmc',
            'split': 'validation',
        },
    }
    return cfg


kwargs = dict(
    model=model_id,
    cfg_modify_fn=cfg_modify_fn)
trainer = build_trainer(default_args=kwargs)
trainer.train()
```

The trainer supports input datasets as a list. In this case, the trainer internally uses [TaskDataset](#TaskDataset) to shuffle the datasets for training.

## Preprocessing Process

- If a preprocessor field exists in the configuration, the trainer will automatically call the preprocessing process internally during training, similar to the following pseudocode:

```py
for i, mini_batch in enumerate(data_loader):
    mini_batch = preprocesser(mini_batch)
    loss = model.forward(mini_batch)
    ...
```

Certain modalities (such as NLP) require updating specific parameters in the preprocessing configuration:
```py
# Configure key for sentence 1
cfg.preprocessor.first_sequence='sentence1'
# Configure key for sentence 2
cfg.preprocessor.second_sequence='sentence2'
# Configure key for label field
cfg.preprocessor.label='label'
# Configure label id mapping
cfg.preprocessor.label2id={'0':0, '1':1}
```

Parameters that need to be configured for preprocessing during training can be found in [Best Practices for Each Task](../best-practices-for-each-task/introduction-to-tasks.md).

- The data preprocessing process can also be handled before training, suitable for the following scenarios:

  - Large data volume or complex data processing significantly impacts runtime when preprocessing during training

  - Temporary results of data preprocessing need to be cached for future use

  - Preprocessor doesn't exist or is difficult to configure

The following code demonstrates an example of preprocessing before training:

```python
import os
from modelscope.utils.hub import read_config, snapshot_download
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.preprocessors import Preprocessor
from transformers import default_data_collator
train_dataset = MsDataset.load('clue', subset_name='afqmc', split='train').to_hf_dataset()
eval_dataset = MsDataset.load('clue', subset_name='afqmc', split='validation').to_hf_dataset()
model_id = 'damo/nlp_structbert_sentence-similarity_chinese-base'
model_dir = snapshot_download(model_id)
# Read the cfg file from the model
cfg = read_config(model_dir)
cfg.train.work_dir = '/tmp'
# Set the preprocessor field in config to None to prevent automatic preprocessing by trainer
cfg.preprocessor = None
cfg_file = os.path.join('/tmp', 'config.json')
cfg.dump(cfg_file)

train_preprocessor = Preprocessor.from_pretrained(model_dir,
                                                  preprocessor_mode='train',
                                                  first_sequence='sentence1',
                                                  second_sequence='sentence2',
                                                  label='label',
                                                  label2id={'0':0, '1':1},
                                                  sequence_length=256)
eval_preprocessor = Preprocessor.from_pretrained(model_dir,
                                                 preprocessor_mode='eval',
                                                 first_sequence='sentence1',
                                                 second_sequence='sentence2',
                                                 label='label',
                                                 label2id={'0':0, '1':1},
                                                 sequence_length=256)
train_dataset = train_dataset.map(train_preprocessor)
eval_dataset = eval_dataset.map(eval_preprocessor)
# Pass cfg_file, which will replace the cfg_file in model_dir
kwargs = dict(
    model=model_id,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    # The trainer internally uses torch.utils.data.dataloader.default_collate, which is incompatible with HF's list return format, so HF's own data_collator needs to be used
    data_collator=default_data_collator,
    cfg_file=cfg_file)
trainer = build_trainer(default_args=kwargs)
trainer.train()
```

In summary, when defining preprocessing before training, pay attention to several points:

1. If using MsDataset for map processing, you need to call `to_hf_dataset`
2. The `preprocessor` in cfg needs to be set to null
3. `data_collator` may need adjustment

### How to Implement a Preprocessor

If you need to implement your own preprocessor for training or inference, please refer to [here](./data-preprocessing.md).

## Registering New Optimizer/LrScheduler

Trainer's Optimizers come from PyTorch native optimizers registered at runtime. Therefore, you can use any optimizer supported by your current torch version:
```json
{
    "train": {
        "optimizer": {
            "type": "AdamW",
            "lr": 1e-5
        }
    }
}
```

Fill in the `type` field with the class name of the optimizer in torch (case-sensitive), and fill in other parameters with the constructor parameters of that optimizer.

Similarly, lr_scheduler comes from PyTorch native LrSchedulers, and you can use lr_scheduler supported by your current torch version:
```json
{
    "train": {
        "lr_scheduler": {
            "type": "StepLR"
        }
    }
}
```

### Passing During Construction

The Trainer constructor supports passing the `optimizers` parameter, which can accept a Tuple of optimizer and lr_scheduler:
```python
import os
from torch.optim import AdamW
from modelscope.hub.snapshot_download import snapshot_download
from torch.optim.lr_scheduler import StepLR
from modelscope.models import Model
from modelscope.trainers import build_trainer
from modelscope.msdatasets import MsDataset
model_dir = snapshot_download('damo/nlp_structbert_sentiment-classification_chinese-base')
model = Model.from_pretrained(model_dir)
optimizer = AdamW(model.parameters(), lr=1e-5)
lr_scheduler = StepLR(optimizer, step_size=2)
dataset = MsDataset.load(
    'clue', subset_name='afqmc',
    split='train').to_hf_dataset().select(range(2))
kwargs = dict(
    model=model,
    cfg_file=os.path.join(model_dir, 'configuration.json'),
    train_dataset=dataset,
    eval_dataset=dataset,
    optimizers=(optimizer, lr_scheduler),
    work_dir='/tmp')
trainer = build_trainer(default_args=kwargs)
```

### Registering and Referencing in Config

#### Register optimizer and use in config

You can register optimizers through `register_module`:
```py
from transformers import AdamW
from modelscope.trainers.optimizer import OPTIMIZERS
# Register the class
OPTIMIZERS.register_module(module_name='TransformerAdamW', module_cls=AdamW)
```

#### Register LrScheduler and use in config

You can register lr_scheduler through `register_module`:
```py
from transformers import get_linear_schedule_with_warmup
from modelscope.trainers.lrscheduler import LR_SCHEDULER
# Register the method
LR_SCHEDULER.register_module(module_name='TransformerLinear', module_cls=get_linear_schedule_with_warmup)
```


Afterwards, you can use `TransformerAdamW` or `TransformerLinear` by customizing the cfg:

```python
import os
from modelscope.utils.hub import read_config
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
train_dataset = MsDataset.load('clue',  subset_name='afqmc', split='train')
eval_dataset = MsDataset.load('clue',  subset_name='afqmc', split='validation')
model_id = 'damo/nlp_structbert_sentence-similarity_chinese-base'
# Read the cfg file from the model
cfg = read_config(model_id)
# Directly update parameters
cfg.train.max_epochs = 5
cfg.train.dataloader.workers_per_gpu=0
cfg.evaluation.dataloader.workers_per_gpu=0
cfg.preprocessor.train['label2id'] = {'0': 0, '1': 1}
cfg.preprocessor.val['label2id'] = {'0': 0, '1': 1}
cfg.train.work_dir = '/tmp'
cfg.train.optimizer = {
    'type': 'TransformerAdamW'
}
cfg.train.lr_scheduler = {
    'type': 'TransformerLinear',
    'num_warmup_steps': 10,
    'num_training_steps': 200,
}
cfg_file = os.path.join('/tmp', 'config.json')
cfg.dump(cfg_file)
kwargs = dict(
    model=model_id,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    cfg_file=cfg_file)
trainer = build_trainer(default_args=kwargs)
trainer.train()
```

## TaskDataset

TaskDataset is a ModelScope-specific design. Like models and preprocessors, this component is also automatically invoked through registration. Generally, the model training process consists of three parts: loading datasets, preprocessing, and training evaluation. However, in some special cases, datasets need special handling under specific tasks or models. For example:

1. A model needs to load multiple training datasets simultaneously during training and shuffle them in a certain way before feeding them to the dataloader
2. A task needs to load one positive example and several negative examples, and input both positive and negative examples into a batch

TaskDataset is designed for such scenarios, meaning it handles situations where specific tasks and models require processing from an overall perspective of (multiple) datasets.

The base class of TaskDataset is as follows:

```py
class TaskDataset(ABC):
    """The task dataset base class for all the task specific dataset processors.
    """

    def __init__(self,
                 datasets: Union[Any, List[Any]],
                 mode,
                 preprocessor=None,
                 **kwargs):
        super().__init__()
        self.mode = mode
        self.preprocessor = preprocessor
        self._inner_dataset = self.prepare_dataset(datasets)

    @abstractmethod
    def prepare_dataset(self, datasets: Union[Any, List[Any]]) -> Any:
        """Prepare a dataset.

        User can process the input datasets in a whole dataset perspective.
        This method also helps to merge several datasets to one.

        Args:
            datasets: The original dataset(s)

        Returns: A single dataset, which may be created after merging.

        """
        pass

    @abstractmethod
    def prepare_sample(self, data):
        """Preprocess the data fetched from the inner_dataset.

        If the preprocessor is None, the original data will be returned, else the preprocessor will be called.
        User can override this method to implement custom logics.

        Args:
            data: The data fetched from the dataset.

        Returns: The processed data.

        """
        pass
```

As you can see, TaskDataset focuses on the mode (training or evaluation), whether there's a preprocessing process, and the actual datasets to operate on.

The trainer can accept a TaskDataset-type input (replacing the original dataset input), but we generally recommend that the trainer automatically invoke TaskDataset internally, and users only need to pass their own dataset objects.

In this case, mode and preprocessor (if present in the trainer) will be automatically passed by the trainer, and `_inner_dataset` (your training/evaluation datasets defined in construction or configuration) will also be passed to init by the trainer.

TaskDataset registration is task+model-based, meaning that as long as the model name and task model are specified in the model file, the corresponding TaskDataset will be used during training.

### Writing a New TaskDataset

If you're using PyTorch, you can directly inherit from TorchTaskDataset, which inherits from PyTorch's Dataset:
```py
from modelscope.msdatasets.task_datasets import TorchTaskDataset
from typing import Any, List, Union
class CustomDataset(TorchTaskDataset):

    def __init__(self,
                 datasets: Union[Any, List[Any]],
                 mode,
                 preprocessor=None,
                 **kwargs):
        super().__init__(datasets, mode, preprocessor, **kwargs)

    def __getitem__(self, item):
        # TODO Write how to fetch an data item here
        pass

    def prepare_dataset(self, datasets: Union[Any, List[Any]]) -> Any:
        # TODO This will be called when the trainer is initing, so you can
        # write how to mix or prepare the input datasets.
        pass
    def prepare_sample(self, data):
        # how to prepare the sample, by default it will call the preprocessor(if exists in trainer) to do this.
        pass
```

Call the following in your main method or other executable locations:
```py
from modelscope.msdatasets.task_datasets import TASK_DATASETS
TASK_DATASETS.register_module(module_name='my-custom-model', group_key='my-custom-task', module_cls=CustomDataset)
```

This way, when the trainer uses your model for training, this TaskDataset will be automatically loaded. It's worth noting that after TaskDataset init completes, it will be passed the trainer object, which you can use within your TaskDataset, for example, to obtain configuration:
```py
print(self.trainer.cfg)
```

## Model Validation

Many model configurations don't include cross-validation in the training process. If you want to perform cross-validation synchronously during training, you can add an EvaluationHook in `configuration.json`. The specific configuration is as follows:
```json
{
   ...
  "train": {
     ...
      "hooks": [
          ...
        {
          "type": "EvaluationHook",
          # Whether to validate once per epoch, false means validation by iteration
          "by_epoch": false,
          # How many epochs/iterations between validations
          "interval": 100
      }]
  },

}
```

Users can adjust the configuration file according to their actual situation, or register their own corresponding hook and invoke it in the configuration file through the type field.

For detailed explanation of hooks, please refer to the documentation: [Callback Mechanism Detailed Explanation](./callback-mechanism.md)


## Model Saving and Subsequent Usage

### Model Saving Configuration

ModelScope supports two types of model saving Hooks: CheckpointHook and BestCkptSaverHook.

Both storage strategies save two types of files:

- `*.pth` files stored in the work_dir, used for resuming training, containing the model's state_dict, optimizer/lr_scheduler's state_dict, trainer's random_state, epoch_num, iter_num, etc.
  - pth files are generally used in the checkpoint_path parameter of trainer.train/evaluate/predict methods
  - pth files are divided into model files (epoch\_*.pth) and trainer files (epoch\_\*\_trainer_state.pth)
- Files stored in the {work_dir}/output/output_best directories, used for inference during training, containing the model's bin files and various configurations saved by save_pretrained methods. The bin files are hard links from pth files, and these two directories are prepared at the start of training.
  - CheckpointHook **periodically stores pth files** and hard links the model state_dict files to the output directory
  - BestCkptSaverHook **stores pth files whenever a better metric is achieved** and hard links the model state_dict files to the output_best directory

#### CheckpointHook

This is the storage model hook **used by default** in ModelScope. If you don't configure it in the configuration file, it will be added to hooks by default. Its function is to store the model once per epoch by default. If you want to override this behavior, you can configure it as follows:
```json
{
   ...
  "train": {
     ...
      "hooks": [
          ...
        {
            # Save every 100 iterations (not epochs)
            "type": "CheckpointHook",
            "by_epoch": false,
            "interval": 100
        }]
  },

}
```

#### BestCkptSaverHook

Generally, users may want to store only the best model files. ModelScope also provides a corresponding mechanism to achieve this purpose.
- First, ensure that eval_dataset is passed to the trainer (or through configuration file)
- Add or change to BestCkptSaverHook in the configuration file

```json
{
   ...
  "train": {
     ...
      "hooks": [
          ...
        {
            "type": "BestCkptSaverHook",
            "metric_key": "accuracy",
            "by_epoch": false,
            "rule": "max",
            "interval": 100
        }]
  }
}
```

"metric_key" indicates the key in the Metric return value used for actual comparison, and models are stored based on comparison using the "rule" method. For specific usage of Metric, please refer to [here](./model-evaluation.md).

For specific parameters of these two file-saving Hooks, please refer to [Callback Parameter Mechanism Detailed Explanation](./callback-mechanism.md).

#### Using Files for Training or Inference

Either of the above CkptHooks will store two types of files.

- Files for resuming training
After loading the above pth files, you can continue training or validation:
```text
import os
trainer.train(os.path.join(trainer.work_dir, 'a-pth-file.pth'))
# trainer.evaluate(os.path.join(trainer.work_dir, 'a-pth-file.pth'))
# trainer.predict(predict_datasets=some_dataset, saving_fn=some_callback, checkpoint_path=os.path.join(trainer.work_dir, 'a-pth-file.pth'))
```

- Files for inference
Load the above output/output_best folders using pipeline for inference. For pipeline usage, please refer to [here](../model-inference-pipeline.md).

#### Using Datasets from Other Frameworks for Training

ModelScope supports using PyTorch framework's Dataset or other custom Datasets for training, as long as the Dataset has a `__getitem__` method (or supports being passed to torch's DataLoader).

You just need to pass this dataset to the train_dataset and eval_dataset parameters of the trainer constructor.

#### Using torch Module for Training

ModelScope's trainer supports training torch.nn.Module, provided that you must pass the corresponding configuration.json.

## Distributed Training

### Data Parallelism

First, prepare the training script and save the following code to a script like `./train.py`:

```python
import os
from modelscope.trainers import build_trainer

# Specify working directory
tmp_dir = "./tmp"

# Configuration parameters
kwargs = dict(
    model=model_id,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    work_dir=tmp_dir,
    launcher='pytorch'  # Distributed launch method
)

# Instantiate trainer object
trainer = build_trainer(default_args=kwargs)

# Call train interface for training
trainer.train()
```

Then start distributed training:

**PyTorch:**

**Single-node multi-GPU:**

```shell
python -m torch.distributed.launch --use_env --nproc_per_node=${NUMBER_GPUS} --master_port=${MASTER_PORT} ./train.py
```

- nproc_per_node: Number of processes created on the current host (number of GPUs used), e.g., `--nproc_per_node=8`.
- master_port: Port number of the master node, e.g., `--master_port=29527`.

**Multi-node multi-GPU:**

Taking two nodes as an example.

Node 1:

```shell
python -m torch.distributed.launch  --use_env --nproc_per_node=${NUMBER_GPUS} --nnodes=2 --node_rank=0 --master_addr=${YOUR_MASTER_IP_ADDRESS} --master_port=${MASTER_PORT} ./train.py
```

Node 2:

```shell
python -m torch.distributed.launch  --use_env --nproc_per_node=${NUMBER_GPUS} --nnodes=2 --node_rank=1 --master_addr=${YOUR_MASTER_IP_ADDRESS} --master_port=${MASTER_PORT} ./train.py
```

- nproc_per_node: Number of processes created on the current host (number of GPUs used), e.g., `--nproc_per_node=8`.
- nnodes: Number of nodes.
- node_rank: Index value of the current node.
- master_addr: IP address of the master node, e.g., `--master_addr=104.171.200.62`.
- master_port: Port number of the master node, e.g., `--master_port=29527`.

Congratulations, you've completed a distributed model training using data parallelism! 😀

### Model Parallelism

Currently, models like GPT-3, PLUG, and GPT-MOE in ModelScope support model parallel training. Below is an example of model parallelism using the GPT-3 large model.

Same as data parallelism, first prepare the training script and save the following code to a script like `./train.py`:

```python
from torch.utils.tensorboard import SummaryWriter
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.metainfo import Trainers

# Use poetry generation dataset for training, users can also use their own datasets
dataset_dict = MsDataset.load('chinese-poetry-collection')
train_dataset = dataset_dict['train'].remap_columns(
    {'text1': 'src_txt'})
eval_dataset = dataset_dict['test'].remap_columns({'text1': 'src_txt'})
max_epochs = 10

# Specify working directory
tmp_dir = './gpt3_poetry'

num_warmup_steps = 100

def noam_lambda(current_step: int):
    current_step += 1
    return min(current_step**(-0.5),
               current_step * num_warmup_steps**(-1.5))

# Modify training configuration
def cfg_modify_fn(cfg):
    cfg.train.lr_scheduler = {
        'type': 'LambdaLR',
        'lr_lambda': noam_lambda,
        'options': {
            'by_epoch': False
        }
    }
    cfg.train.optimizer = {'type': 'AdamW', 'lr': 3e-4}
    cfg.train.dataloader = {
        'batch_size_per_gpu': 8,
        'workers_per_gpu': 1
    }
    cfg.train.hooks.append({
        'type': 'EvaluationHook',
        'by_epoch': True,
        'interval': 1
    })
    cfg.evaluation.dataloader = {
        'batch_size_per_gpu': 8,
        'workers_per_gpu': 1
    }
    cfg.evaluation.metrics = 'ppl'
    cfg.model.checkpoint_model_parallel_size = 1
    return cfg

kwargs = dict(
    model='damo/nlp_gpt3_text-generation_1.3B',
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    max_epochs=max_epochs,
    work_dir=tmp_dir,
    cfg_modify_fn=cfg_modify_fn)

# Construct trainer and use it for training
trainer = build_trainer(
    name=Trainers.gpt3_trainer, default_args=kwargs)
trainer.train()
```

For GPT3 1.3B/2.7B models, we support runtime automatic model splitting during training. Simply set the number of parallel processes to automatically run training with the corresponding model parallelism degree:

**PyTorch:**

**Single-node multi-GPU:**

```shell
python -m torch.distributed.launch --use_env --nproc_per_node=${NUMBER_GPUS} ./train.py
```

- nproc_per_node: Number of processes created on the current host (number of GPUs used), which is also the model parallelism degree, e.g., `--nproc_per_node=8`.

Congratulations, you've completed a distributed model training using model parallelism! 😀