<!-- modelscope-docs: Introduction to NLG Large Models | sdk/tasks/nlg-models/nlg-models_EN.md -->

# Introduction to NLG Large Models
NLG large models refer to text generation models with extremely large parameter counts, such as the GPT-3 series and PLUG (27 billion parameters).

For detailed documentation on text generation tasks, please refer to [Text Generation Task](text-generation-task.md). Text generation is the process of converting input text into tensors, feeding them into the model, and generating readable textual output.

NLG large models can solve various specific generation problems such as text continuation, article summarization, writing, question answering, dialogue, etc. The following lists NLG large models available in ModelHub:

- [Multi-task Text Generation](https://modelsscope.ai/models/damo/nlp_gpt3_text-generation_13B/summary): Generates subsequent content based on provided text prompts, supporting multiple tasks including code generation, SQL statement generation, question answering, writing, and text continuation.
- [Text Continuation](https://modelsscope.ai/models/damo/nlp_plug_text-generation_27B/summary): Can be directly used for text generation or fine-tuned for various text understanding tasks.

- Other tasks: With further fine-tuning, the model can generate user-desired content based on user input text.

## Large Model Inference

The inference capability of the ModelScope framework is implemented through the pipeline module. For basic usage methods of inference, please refer to [Model Inference](model-inference-pipeline.md).

Large models use a special DistributedPipeline for large models. Usage is identical to standard pipelines, but the integration differs. For details on integration, please refer to the "DistributedPipeline Introduction" section in [ModelScope Model Integration](../../contributor-guide/modelscope-model-integration.md).

1. Currently, GPT-3 models with 2.7B parameters or smaller support direct download and usage. Taking the [GPT-3 1.3B model](https://modelsscope.ai/models/damo/nlp_gpt3_text-generation_1.3B/summary) as an example, you can use the GPT-3 1.3B model as follows:

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

if __name__ == '__main__':
    input = 'What shampoo should programmers with hair loss use?'
    model_id = 'damo/nlp_gpt3_text-generation_1.3B'
    pipe = pipeline(Tasks.text_generation, model=model_id)

    # You can pass generation parameters such as max_length, top_k, top_p, temperature in pipe
    print(pipe(input, max_length=512))
```

2. The [PLUG (27 billion parameters) large model](https://modelsscope.ai/models/damo/nlp_plug_text-generation_27B/summary) is available through application-based download. Running requires 8 GPUs on your machine, with each GPU having more than 12GB of memory. Currently, PLUG model applications are approved only for individual academic and research purposes, with distribution and commercial use prohibited. Before running the PLUG model, you need to install deepspeed: `pip install deepspeed==0.7.2`

1. Obtain the default model_dir using model_id
```
from modelscope.hub.snapshot_download import snapshot_download
model_id = 'damo/nlp_plug_text-generation_27B'
model_dir = snapshot_download(model_id)
print(model_dir)
```

2. Download the model binary files to model_dir/model. The application download address is [here](https://github.com/alibaba/AliceMind/tree/main/PLUG#pre-trained-model-download). The properly arranged model directory structure should be:
```shell
nlp_plug_text-generation_27B
    |_ config.json
    |_ configuration.json
    |_ ds_zero-offload_10B_config.json
    |_ vocab.txt
    |_ model
        |_ mp_rank_00_model_states.pt
        |_ mp_rank_01_model_states.pt
        |_ mp_rank_02_model_states.pt
        |_ mp_rank_03_model_states.pt
        |_ mp_rank_04_model_states.pt
        |_ mp_rank_05_model_states.pt
        |_ mp_rank_06_model_states.pt
        |_ mp_rank_07_model_states.pt
```

Model invocation:

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

if __name__ == '__main__':
    input = 'Duan Yu waved his fan gently, shook his head, and said, "Your master is your master, but your master is not my master."'
    model_id = 'damo/nlp_plug_text-generation_27B'
    pipe = pipeline(Tasks.text_generation, model=model_id)
    pipe.models = []

    # out_length is the desired generation length, maximum is 512
    result = pipe(input, out_length=256)
    print(result)
```

### Large Model Pipeline

Since the model needs to be loaded across multiple GPUs and perform inference multiple times, there are certain differences compared to single-GPU models. We provide DistributedPipeline for large model inference. DistributedPipeline initializes the parallel environment, starts multiple subprocesses, with each subprocess handling part of the model tasks on one GPU. When integrating large models into pipelines, you can inherit this class to implement your own Pipeline class.

The initialization process of DistributedPipeline includes necessary configurations for rank, process pool, and IP/port for synchronization communication. It also calls the `_instantiate_one` method in each subprocess, which is implemented in subclasses and primarily initializes the partial model on the corresponding GPU.

As a text generation task model, NLG large models perform multiple forward inferences during a single pipeline generation to produce output sequences composed of tokens, which are then converted to readable text content in the pipeline's post-processing.

#### Constructor Parameters

```text
model: Model ID or local model path. It should be specifically noted that since there isn't a one-to-one correspondence between large model pipelines and model instances, large model pipelines do not support passing model instances for initialization.
preprocessor: The preprocessor corresponding to the model. If not provided, the pipeline will automatically construct it using the configuration file from the downloaded model's local path.
kwargs: You can pass any parameters needed for the preprocessor constructor here, as well as configuration parameters for IP and port used in synchronization communication. If not provided, default values will be used, such as `master_ip` defaulting to `127.0.0.1` and `master_port` defaulting to `29500`. These two parameters will be used for distributed initialization.
Other parameters: Any parameters from the Pipeline base class are supported.
```

#### Input Format

```text
str: A single sentence.
```

#### Output Format

```text
Output is a dict with the following key:
text: The text content generated by the model
```

#### Model Adaptation Requirements

##### Preprocessor Requirements
```text
For NLG tasks, any subclass or Duck Type class that conforms to the TextGenerationPreprocessorBase constructor and method requirements for text generation preprocessors.
```

## Preprocessor

NLG large models are text generation task models. For preprocessors, please refer to the "Text Generation Task Preprocessor" section in [Text Generation Task](text-generation-task.md).

## Model List for the Task

[GPT-3 Text Generation (GPT3ForTextGeneration)](../../model-overview/natural-language-processing-models/gpt3/gpt3.md)

[PLUG Text Generation](../../model-overview/natural-language-processing-models/plug/plug.md)

You can search for specific models through [ModelHub](https://modelsscope.ai/models).

## Dataset List for the Task

The following lists commonly used datasets for fine-tuning:

[Product Description Generation](https://modelsscope.ai/datasets/lcl193798/product_description_generation/summary)

[DuReader Question Generation](https://modelsscope.ai/datasets/modelscope/DuReader_robust-QG/summary)

[Chinese Poetry Dataset](https://modelsscope.ai/datasets/modelscope/chinese-poetry-collection/summary)

[Couplet Generation](https://modelsscope.ai/datasets/lcl193798/couplet_generation/summary)

You can search for all datasets supporting this task through [DataHub](https://modelsscope.ai/datasets).

## Best Practices for Large Model Fine-tuning
This section introduces how to fine-tune the pre-trained generation model PLUG on the dureader-robust dataset and achieve good evaluation results on the question generation task.

Since the PLUG model has 27 billion parameters, this example requires a single machine with 8x 32GB V100 GPUs and runs with `deepspeed==0.7.2`. The code below cannot be run directly in a notebook. It needs to be written as a Python file (e.g., `finetune_plug.py`) and executed using the deepspeed command: `deepspeed --num_gpus=8 --num_nodes=1 finetune_plug.py`.

### Data Loading
ModelScope provides a standard `MsDataset` interface for users to load data sources based on the ModelScope ecosystem. It also supports loading custom datasets from third-party libraries, such as the `datasets` library in the NLP field.

The specific example below loads the dureader-robust dataset from the third-party `datasets` library in the NLP field:

```python
    # Option 1: Use native MsDataset stored on ModelScope dataset-hub
    from datasets import load_dataset
    dataset_dict = load_dataset('luozhouyang/dureader', 'robust')

    # Option 2: For question generation task, tgt_txt is the target question to be generated,
    # concatenate src_txt into the format "answer + [SEP] + original text"
    def concat_answer_context(dataset):
        dataset['src_txt'] = dataset['answers']['text'][0] + '[SEP]' + dataset[
            'context']
        return dataset

    train_dataset = dataset_dict['train'].map(concat_answer_context)
    eval_dataset = dataset_dict['validation'].map(concat_answer_context)

    # Option 3: Rename the target question key to tgt_txt and remove other information
    train_dataset = train_dataset \
        .rename_columns({'question': 'tgt_txt'}).remove_columns('context') \
        .remove_columns('id').remove_columns('answers')
    eval_dataset = eval_dataset \
        .rename_columns({'question': 'tgt_txt'}).remove_columns('context') \
        .remove_columns('id').remove_columns('answers')

    # For usage of third-party datasets library, refer to huggingface/Datasets documentation: https://huggingface.co/docs/datasets/index
```

If you use datasets from MsDataset, please refer to the dataset documentation for specific usage: [Data Processing](../../datasets/dataset-introduction.md)

### Data Preprocessing
For the same task, training and inference can use the same Preprocessor. Users only need to pass the registered preprocessor name in the configuration file. The trainer will automatically load the corresponding preprocessor during the build phase and set it to `train` or `eval` mode based on the current mode.

As shown in the example code below, for fine-tuning the NLP text generation downstream task `text-generation`, the preprocessor configuration in configuration.json is the same as during inference and will construct the corresponding preprocessing module through type='text-gen-tokenizer'.

For introduction to NLP preprocessing input parameters, please refer to [Preprocessing Module Introduction](../detailed-tutorials/data-preprocessing.md).

NLP preprocessing modules can accept several additional parameters for dataset-related fields: `first_sequence` (key for sentence 1), `second_sequence` (key for sentence 2), `label` (key for labels), and `label2id` (mapping from label to id). You can directly configure these parameters in the `preprocessor` field.

In this example, `src_txt` is the default `first_sequence` (key for sentence 1) for the `text-generation` task, and `tgt_txt` is the default `second_sequence` (key for sentence 2) for the `text-generation` task. You can also specify keys through parameters to read from the dataset. In this example, `sequence_length` is the maximum length of input text, and `target_max_length` is the maximum length of output text. Since the downstream task demonstrated here is question generation with relatively short questions, `target_max_length` is set to only `30`, which is sufficient.

```json
{
    "framework": "pytorch",
    "task": "text-generation",
    "preprocessor": {
        "type": "text-gen-tokenizer",
        "sequence_length": 384,
        "target_max_length": 30
    },
    "model": {
        "type": "plug",
        "world_size": 8,
        "model_parallel_size": 8,
        "pre_load": true,
        "distributed_backend": "nccl",
        "checkpoint_activations": true,
        "top_k": 20,
        "top_p": 0.0,
        "temperature": 0.9,
        "seed": 1234
    },
    "pipeline": {
        "type": "plug-generation"
    },
    "train": {
        ...
    }
}
```

### Training
From the trainer-related API documentation, we understand that the core training process consists of components such as dataset, dataloader, optimizer, lr_scheduler, and hooks. These are specifically registered into the trainer workflow by declaration in the configuration.json file. For details, please refer to: [Configuration Details](../detailed-tutorials/configuration-details.md)

#### Basic Configuration
Before starting training, you need to properly configure the trainer configuration file. Below is a complete configuration for fine-tuning PLUG on downstream tasks.

In actual usage, if the example doesn't provide sufficient help, users can customize registration for optimizer/lr_scheduler/hooks according to their actual training requirements and declare the corresponding custom methods through the type field in the configuration file.

```json
{
    "framework": "pytorch",
    "task": "text-generation",
    "preprocessor": {
        "type": "text-gen-tokenizer",
        "sequence_length": 384,
        "target_max_length": 30
    },
    "model": {
        "type": "plug",
        "world_size": 8,
        "model_parallel_size": 8,
        "pre_load": true,
        "distributed_backend": "nccl",
        "checkpoint_activations": true,
        "top_k": 20,
        "top_p": 0.0,
        "temperature": 0.9,
        "seed": 1234
    },
    "pipeline": {
        "type": "plug-generation"
    },
    "train": {
        "work_dir": "/tmp",
        "max_epochs": 5,
        "deepspeed": true,
        "deepspeed_config": "ds_zero-offload_10B_config.json",
        "fp16": true,
        "dataloader": {
            "batch_size_per_gpu": 32,
            "workers_per_gpu": 0
        },
        "optimizer": {
            "type": "DeepSpeedCPUAdam",
            "lr": 1e-5,
            "weight_decay": 1e-2
        },
        "lr_scheduler": {
            "decay_style": "linear",
            "warmup": 0.01,
            "type": "LinearLR",
            "options": {
                "warmup": {
                    "type": "LinearWarmup",
                    "warmup_iters": 74,
                    "warmup_ratio": 0.0
                }
            }
        },
        "hooks": [{
            "type": "DeepspeedHook"
        }, {
            "type": "CheckpointHook",
            "by_epoch": true,
            "interval": 1
        }, {
            "type": "TextLoggerHook",
            "interval": 5
        }, {
            "type": "IterTimerHook"
        }, {
            "type": "EvaluationHook",
            "interval": 1,
            "by_epoch": true
        }]
    },
    "evaluation": {
        "dataloader": {
            "batch_size_per_gpu": 1,
            "workers_per_gpu": 0,
            "shuffle": false
        }
    }
}
```

Combining the above content, model fine-tuning training can be performed through the following code.

Before running, please ensure:
1. Machine environment has at least 8x 32GB V100 GPUs on a single machine.
2. Install the appropriate version of deepspeed: `pip3 install deepspeed==0.7.2`
3. Apply for and download PLUG binary model files to model_dir. model_dir is typically `~/.cache/modelscope/hub/damo/nlp_plug_text-generation_27B`, or you can obtain it via:

```python
from modelscope.hub.snapshot_download import snapshot_download
model_id = 'damo/nlp_plug_text-generation_27B'
model_dir = snapshot_download(model_id)
print(model_dir)
```

To run the fine-tuning code: write it as a Python file (e.g., `finetune_plug.py`) and execute using the deepspeed command: `deepspeed --num_gpus=8 --num_nodes=1 finetune_plug.py`.

```python
import os
import tempfile

from modelscope.metainfo import Trainers
from modelscope.trainers import build_trainer

def main():

    # Prepare dataset
    from datasets import load_dataset
    dataset_dict = load_dataset('luozhouyang/dureader', 'robust')

    def concat_answer_context(dataset):
        dataset['src_txt'] = dataset['answers']['text'][0] + '[SEP]' + dataset[
            'context']
        return dataset

    train_dataset = dataset_dict['train'].map(concat_answer_context)
    eval_dataset = dataset_dict['validation'].map(concat_answer_context)

    train_dataset = train_dataset \
        .rename_columns({'question': 'tgt_txt'}).remove_columns('context') \
        .remove_columns('id').remove_columns('answers')
    eval_dataset = eval_dataset \
        .rename_columns({'question': 'tgt_txt'}).remove_columns('context') \
        .remove_columns('id').remove_columns('answers')

    # Prepare work directory to store logs and fine-tuned checkpoint files
    tmp_dir = "plug_work_dir/rank" + os.environ['RANK']
    if not os.path.exists(tmp_dir):
        os.makedirs(tmp_dir)
    model_id = 'damo/nlp_plug_text-generation_27B'

    # Use plug_trainer for training
    kwargs = dict(
        model=model_id,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        work_dir=tmp_dir)

    trainer = build_trainer(
        name=Trainers.nlp_plug_trainer, default_args=kwargs)
    trainer.train()

if __name__ == '__main__':
    main()
```