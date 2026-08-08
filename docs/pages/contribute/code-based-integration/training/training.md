<!-- modelscope-docs: Develop Training Pipeline | contribute/code-based-integration/training/training_EN.md -->

# Training Integration

**If the model does not support training, this step can be skipped.**

Generally speaking, since experimental code usually has scattered training processes, integrating the training process may take considerable time.

For PyTorch models, ModelScope provides a feature-rich `EpochBasedTrainer`, which generally requires corresponding models to use this trainer when integrating training.

For models of other frameworks, ModelScope provides a `BaseTrainer` with high-level APIs. Please inherit from this trainer to integrate the training process.

## PyTorch Model Training Integration

### EpochBasedTrainer

EpochBasedTrainer inherits from BaseTrainer and provides comprehensive functionality. For better understanding, users can compare it to the Trainer class provided by transformers, with the main differences being:

- Transformers requires datasets to be preprocessed outside the trainer, while ModelScope generally preprocesses data internally within the trainer using a preprocessor
- EpochBasedTrainer provides a hooks mechanism to support pluggable training strategies

Since the training process is quite complex, if users are not yet familiar with EpochBasedTrainer, we recommend reading two documents:

- [Model Training](../../ModelScope%20Library教程/模型的训练.md)
- [Configuration Details](../../ModelScope%20Library教程/详细教程/Configuration详解.md)

Points to note during integration:

1. EpochBasedTrainer will not call the model's postprocess method
2. EpochBasedTrainer defaults to using torch's data_collator, which supports numpy.ndarray as tensor type
3. If additional training strategies are needed, please configure Hooks

4. When integrating the trainer, consider whether configuration.json needs to be modified and which configurations are recommended for users to specify dynamically at runtime.

When integrating model training, consider whether the existing trainer can directly meet training requirements:

- If yes, you can directly write test cases and customize various modules and training strategies within the trainer in the test cases
- If not, you can inherit from the trainer or add new Metric, Optimizer, LrScheduler, etc., then write test cases as per the above

#### Configurable Features

Currently commonly used customizable parameters supported by EpochBasedTrainer include:

- Model ID, path, or model instance
- Configuration file
- cfg_modify_fn for modifying configuration files
- data_collator
- Dataset
- Preprocessor
- Optimizer, lr_scheduler
- Metrics class used for this task
- Hooks (including DDP, DeepSpeed training, EarlyStop strategy, TensorBoard visualization, etc.)
- Data loader configuration
- FP16 mixed-precision training
- Random seed

The above customizations can be specified in configuration or passed as parameters during trainer construction to complete training integration.

Hooks are ModelScope-specific components used to provide pluggable training strategy support. Currently supported hooks can be found in the hooks section of [Configuration Details](../../ModelScope%20Library教程/详细教程/Configuration详解.md).

> Note: If hooks don't meet your requirements, please contact ModelScope developers for customization. Self-addition is not recommended.

#### Adding New Metrics, Optimizer, LrScheduler

ModelScope's Metric class is used for calculating metrics during evaluation. Metrics are provided by **task type**. If [existing metrics](../../ModelScope%20Library教程/模型的训练.md) are available, please reuse them. If not, you can create new ones by referencing [Model Evaluation](../../ModelScope%20Library教程/详细教程/模型的评估.md).

Optimizer and LrScheduler default support includes all corresponding native components in current torch. For additional registration, please refer to [Training Detailed Parameters](../../ModelScope%20Library教程/详细教程/训练的详细参数.md).

#### Scenarios Requiring EpochBasedTrainer Inheritance

If the above configurations still cannot meet requirements, consider inheriting from EpochBasedTrainer. Generally customizable methods include:

- train - training process method
- train_loop - training loop method
- train_step - training forward method
- evaluate - evaluation process method
- evaluation_loop - evaluation process loop method
- evaluation_step - evaluation process forward method
- create_optimizer_and_scheduler - creates optimizer and lr_scheduler, including customizing corresponding param_groups
- get_train_dataloader/get_eval_dataloader - gets dataloader

It's recommended to write a complete test case after integration to ensure loss decreases normally. After training completion, ensure the obtained metrics match the target integrated code. Test cases can be written under tests/trainers, and requirements/suggestions can be found in the training description section of [Writing Test Cases](./编写测试用例.md).

### Practical Examples

- tests/trainers/test_finetune_sequence_classification.py - test_finetune_afqmc basic implementation for text classification tasks

## Training Integration for Other Framework Models

Non-PyTorch model training is uniformly integrated into BaseTrainer. The high-level APIs provided by this trainer include:

- train
- evaluate

### Practical Examples

- modelscope/trainers/nlp/sequence_classification_trainer.py