<!-- modelscope-docs: Callback Mechanism | sdk/tutorials/callbacks/callbacks_EN.md -->

# Callback Mechanism

### ModelScope's Callback Mechanism

Callbacks are a mechanism present in ModelScope's trainer. We have implemented different training strategies in separate callbacks, such as:

1. Model saving during training might be done at uniform intervals or save only the best model
2. Training could be single-GPU, DDP (Distributed Data Parallel), or multi-node/multi-GPU using DeepSpeed
3. Training might use mixed precision or full precision

If all these different strategies were written directly into the trainer code, it would significantly degrade code maintainability and readability. Therefore, we've placed important processes into the callback mechanism to ensure the extensibility of the training process.

During the entire training process, we can use callback functions to define custom operations at different moments. When each specific moment is reached, all callbacks' corresponding functions for that moment will be invoked. The working mechanism can be referenced in the figure below:<br>
![image.png](./_resources/1659498714468-3b672c47-c504-403b-987a-983612a2ca9f.png)

### Supported List

- LrSchedulerHook - Learning rate decay strategy
- PlateauLrSchedulerHook - Learning rate decay strategy
- OptimizerHook - Optimizer strategy
- TorchAMPOptimizerHook - Optimizer strategy
- CheckpointHook - Model saving strategy
- BestCkptSaverHook - Model saving strategy
- EvaluationHook - Validation strategy
- TextLoggerHook - Logging strategy
- IterTimerHook - Training time measurement strategy
- TensorboardHook - TensorBoard experiment logging strategy
- DDPHook - Data parallel strategy
- MegatronHook - Megatron training strategy
- DeepSpeedHook - DeepSpeed training strategy

### Usage Methods

#### LrSchedulerHook
Reference API: `modelscope.trainers.hooks.LrSchedulerHook`.

Used for adjusting learning rate. `LrSchedulerHook` **does not require manual configuration by users** and will be automatically created by the trainer interface. We have registered all lr scheduler interfaces supported by PyTorch into ModelScope. Users only need to configure the lr scheduler type and parameters in the configuration file. Refer to the following configuration (users requiring custom interfaces should refer to custom lr_scheduler_hook):

`StepLR` corresponds to the [torch.optim.lr_scheduler.StepLR](https://pytorch.org/docs/stable/generated/torch.optim.lr_scheduler.StepLR.html) interface, where step_size is a parameter of `torch.optim.lr_scheduler.StepLR`.

```json
"train": {
        "lr_scheduler": {
            "type": "StepLR",
            "step_size": 2,
        }
}
```

Additionally, we also support additional features like warmup, which are configured in the options parameter. Refer to the following configuration:

```json
"train": {
        "lr_scheduler": {
            "type": "StepLR",
            "step_size": 2,
            "options": {
                "warmup": {
                    "type": "LinearWarmup",
                    "warmup_iters": 2

                }
            }
        }
}
```

**Note**: Some configurations in ModelScope might use lr_scheduler versions that are too new. If you cannot use them locally, please try changing the lr_scheduler type.

- **warmup**

Currently supported warmup interfaces include:
   - `LinearWarmup`
     Parameters:
     - `warmup_iters`: Number of warmup iterations.
     - `warmup_ratio`: Initial value ratio for warmup, initial warmup lr = warmup_ratio * initial lr
   - `ConstantWarmup`
     Same parameters as `LinearWarmup`.
   - `ExponentialWarmup`
     Same parameters as `LinearWarmup`.

#### PlateauLrSchedulerHook
**Note:** `ReduceLROnPlateau` differs slightly from other lr schedulers. Please refer to [**ReduceLROnPlateau**](https://pytorch.org/docs/stable/generated/torch.optim.lr_scheduler.ReduceLROnPlateau.html). `ReduceLROnPlateau.step` requires users to pass in `metrics` during updates, so you must add the `lr_scheduler_hook` field when using it and specify `PlateauLrSchedulerHook`.

For the `lr_scheduler_hook` field, please refer to custom lr_scheduler_hook.

Reference API: `modelscope.trainers.hooks.PlateauLrSchedulerHook`.

Only used for `ReduceLROnPlateau`, **requires manual addition to the configuration file by users**. `ReduceLROnPlateau.step` requires users to pass in `metrics` and must be used together with EvaluationHook to determine whether the learning rate needs updating based on validation return metrics. The update frequency of `ReduceLROnPlateau` defaults to being consistent with `EvaluationHook`. It's recommended to set the interval of `EvaluationHook` to 1. Reference configuration:

```json
"train": {
        "lr_scheduler": {
            "type": "ReduceLROnPlateau",
            "mode": "max",
            "factor": 0.1,
            "patience": 10,
         },
        "lr_scheduler_hook": {
            "type": "PlateauLrSchedulerHook",
            "metric_key": "accuracy"
        }
}
```

- metric_key: Metrics may return multiple indicators; specify a particular key to monitor trends and determine whether to update the learning rate.

#### OptimizerHook
Reference API: `modelscope.trainers.hooks.OptimizerHook`.

Used for optimizer updates. `OptimizerHook` **does not require manual configuration by users** and will be automatically created by the trainer interface. We have registered all optimizer interfaces supported by PyTorch into ModelScope. Users only need to configure the optimizer type and parameters in the configuration file. Reference configuration (users requiring custom interfaces should refer to custom optimizer_hook):

```json
"train": {
        "optimizer": {
            "type": "SGD",
            "lr": 0.01
        }
}
```

Additionally, we also support operations like gradient clipping and gradient accumulation, with additional features configured in the options parameter. Reference configuration:

```json
"train": {
        "optimizer": {
            "type": "SGD",
            "lr": 0.01,
            "options": {
                "grad_clip": {
                    "max_norm": 2.0
                },
              	"cumulative_iters": 2
            }
        }
}
```

**Note**: Some configurations in ModelScope might use optimizer versions that are too new. If you cannot use them locally, please try changing the optimizer type.

- grad_clip: Gradient clipping configuration
- cumulative_iters: Number of gradient accumulation steps

#### TorchAMPOptimizerHook
Reference API: `modelscope.trainers.hooks.TorchAMPOptimizerHook`.

Mixed precision training, **does not require manual configuration by users**. Simply pass the `use_fp16` parameter when creating the trainer.

#### CheckpointHook
Reference API: `modelscope.trainers.hooks.CheckpointHook`.

Used for saving models, requires manual addition to the configuration file by users. Reference configuration:

```json
"train": {
        "hooks":
          [
            {
              "type": "CheckpointHook",
              "interval": 1
            }
          ]
}
```

- interval: Model saving frequency, defaults to saving once per epoch.
- by_epoch: Whether to save by epoch; False means saving by iteration period
- checkpoint_file: Saved training file to load at the start of training; can also be passed in via trainer.train('some-ckpt.pth')
- load_all_state: Boolean type; if True, will load optimizer, epoch, and other parameters to continue training from the last checkpoint; if False, will only load the model checkpoint and retrain from epoch=0
- max_checkpoint_num: Integer type, representing the maximum number of training files stored on disk (note: maximum training files refer to the number of files available for continuing training; there is only one output folder for inference). Defaults to None, meaning no limit. When the maximum is reached, earlier stored files will be deleted sequentially.

#### BestCkptSaverHook
Reference API: `modelscope.trainers.hooks.BestCkptSaverHook`.

Used for saving the model with the best metrics, requires manual addition to the configuration file by users. Must be used together with EvaluationHook to determine if current metrics are optimal based on validation return metrics. Reference configuration:

```json
"train": {
        "hooks":
            [
              {
                "type": "BestCkptSaverHook",
                "metric_key": "accuracy",
                "rule": "max"
              }
            ]
}
```

BestCkptSaverHook is a subclass of CheckpointHook and supports all CheckpointHook parameters plus:

- metric_key: Metrics may return multiple indicators; specify a particular key to monitor for determining the best model.
- rule: Judgment rule; "max" means the current "metric_key" is optimal when maximized, "min" means the current "metric_key" is optimal when minimized.
- restore_best: Boolean type, whether to load the best model after training ends
- save_file_name: String type; when specified, saved training files will no longer be automatically generated with epoch+metric naming, but will be stably stored in a {work_dir}/{save_file_name}.pth file.
- max_checkpoint_num: Same meaning as CheckpointHook parameter, default value is 1. File retention method keeps the best max_checkpoint_num files by metric.

#### EvaluationHook
Reference API: `modelscope.trainers.hooks.EvaluationHook`.

Used for validation during training, requires manual addition to the configuration file by users. Reference configuration:

```json
"train": {
        "hooks":
            [
              {
                "type": "EvaluationHook",
                "interval": 1
              }
            ]
}
```

- interval: Validation frequency, defaults to validating once per epoch.

#### TextLoggerHook

Reference API: `modelscope.trainers.hooks.TextLoggerHook`.

Used for printing logs, requires manual addition to the configuration file by users. Reference configuration:

```json
"train": {
        "hooks":
            [
              {
                "type": "TextLoggerHook",
                "interval": 10
              }
            ]
}
```

- interval: Log printing frequency, defaults to printing every 10 steps.

#### IterTimerHook
Reference API: `modelscope.trainers.hooks.IterTimerHook`.

Used for outputting runtime and data loading time for each step, requires manual addition to the configuration file by users. Reference configuration:

```json
"train": {
        "hooks":
            [
              {
                "type": "IterTimerHook",
              }
            ]
}
```

#### TensorboardHook
Reference API: `modelscope.trainers.hooks.TensorboardHook`.

Used for writing learning rate, loss, and evaluation results during training to files, which can be visualized using TensorBoard.

Reference configuration:

```json
"train": {
        "hooks":
            [
              {
                "out_dir": "path/to/save",
                "type": "TensorboardHook",
                "interval": 10
              }
            ]
}
```

- out_dir: Optional parameter; if not filled, defaults to storing in ${work_dir}/tensorboard_output directory.
- interval: Frequency of writing logs to TensorBoard, defaults to writing every 10 steps.

During training, you can use the following command to open TensorBoard for viewing experiment metrics:

```shell
tensorboard --logdir  path/to/save  --port 8080
```

#### DDPHook
Reference API: `modelscope.trainers.hooks.distributed.DDPHook`.

Used to support data parallelism during training, improving training efficiency through concurrent data parallel training.

Reference configuration:

```json
"train": {
        "hooks":
            [
              {
                "type": "DDPHook",
                "launcher": "pytorch"
              }
            ]
}
```

- launcher: String type, data parallel launch method; options include: "pytorch", "mpi", "slurm".

During training, you can use the following command to open TensorBoard for viewing experiment metrics:

```shell
tensorboard --logdir  path/to/save  --port 8080
```

#### MegatronHook
Reference API: `modelscope.trainers.hooks.distributed.MegatronHook`.

Used to support training processes for models containing Megatron components:

```json
"train": {
        "hooks":
            [
              {
                "type": "MegatronHook"
              }
            ]
}
```

This hook writes its own parallel groups to the trainer and rewrites the checkpoint saving/loading process to adapt to Megatron's sharding mechanism. Models using Megatron need to specify this hook in the configuration file.

#### DeepspeedHook
Reference API: `modelscope.trainers.hooks.distributed.DeepspeedHook`.

Used for outputting runtime and data loading time for each step, requires manual addition to the configuration file by users. Reference configuration:

```json
"train": {
        "hooks":
            [
              {
                "type": "DeepspeedHook",
                "config": "/mnt/workspace/deepspeed_config.json",
                "deepspeed_activation_checkpointing": true,
                "save_zero_checkpoint": false,
                "with_mpu": true,
                "zero_stage": 2
              }
            ]
}
```

- config: Path to the configuration file used during DeepSpeed initialization.
- deepspeed_activation_checkpointing: Boolean type, optional parameter, defaults to True. Whether to enable recomputation of intermediate variables, which reduces GPU memory usage of intermediate variables at the cost of slightly increased computation.
- save_zero_checkpoint: Boolean type, optional parameter, defaults to False. Whether to save zero-parameter checkpoints.
- with_mpu: Boolean type, optional parameter, defaults to True. Whether to initialize mpu and input it to DeepSpeed; when True, mpu manages model parallel strategies.
- zero_stage: Optional parameter; if provided, must be 0, 1, 2, or 3, specifying the zero stage. Higher values more aggressively save GPU memory.

### Trainer Default Hook Configuration

Commonly used hooks that require manual configuration have already been added to the default configuration and don't need to be configured by users. Please refer to: `modelscope.trainers.default_config.DEFAULT_CONFIG`.

If users need to modify the default configuration, they can simply re-add it in their own configuration file, and the default configuration will be replaced.

```json
{
    "train": {
        "hooks": [
            {
                "type": "CheckpointHook",
                "interval": 1
            },
            {
                "type": "TextLoggerHook",
                "interval": 10
            },
            {
                "type": "IterTimerHook"
            },
            {
                "type": "TensorboardHook",
                "interval": 10
            }
        ]
    }
}
```

### Custom Hooks

#### Custom General Hook
Custom hooks must inherit from the base class `modelscope.trainers.hooks.Hook` and register the interface to the `HOOKS` module. Please refer to the following code:

```python
from modelscope.trainers.hooks import Hook
from modelscope.trainers.hooks import HOOKS


@HOOKS.register_module()
class CustomHook(Hook):
    pass
```

After customization, the interface can be used directly in the configuration file. For example:

```json
"train": {
        "hooks":
            [
              {
                "type": "CustomHook",
              }
            ]
}
```

#### Custom optimizer_hook
**Note: Currently, we distinguish `optimizer_hook` from other hooks, and custom optimizer hooks must be specified using the `optimizer_hook` field.**

For default optimizer_hook, please refer to OptimizerHook.

Custom hooks must inherit from the base class `modelscope.trainers.hooks.Hook` and register the interface to the `HOOKS` module. Please refer to the following code:

```python
from modelscope.trainers.hooks import Hook
from modelscope.trainers.hooks import HOOKS


@HOOKS.register_module()
class CustomOptimizerHook(Hook):
    pass
```

Usage of custom optimizer_hook:

```json
"train": {
    "optimizer": {
        "type": "SGD",
        "lr": 0.01
    },
    "optimizer_hook": {
        "type": "CustomOptimizerHook",
    }
}
```

#### Custom lr_scheduler_hook
Note: Currently, we distinguish `lr_scheduler_hook` from other hooks, and custom lr scheduler hooks must be specified using the `lr_scheduler_hook` field.

For default lr_scheduler_hook, please refer to LrSchedulerHook.

Custom hooks must inherit from the base class `modelscope.trainers.hooks.Hook` and register the interface to the `HOOKS` module. Please refer to the following code:

```python
from modelscope.trainers.hooks import Hook
from modelscope.trainers.hooks import HOOKS


@HOOKS.register_module()
class CustomLrSchedulerHook(Hook):
    pass
```

Usage of custom lr_scheduler_hook:

```json
"train": {
    "lr_scheduler": {
        "type": "StepLR",
        "step_size": 2,
    },
    "lr_scheduler_hook": {
        "type": "CustomLrSchedulerHook",
    },
}
```

### Configuration Reference

```json
{
    "framework": "pytorch",
    "task": "image_classification",
    "work_dir": "./work_dir",
    "model": {},
    "dataset": {},
    "preprocessor":{},
    "train": {
        "dataloader": {
            "batch_size_per_gpu": 2,
            "workers_per_gpu": 1
        },
        "optimizer": {
            "type": "SGD",
            "lr": 0.01,
            "options": {
                "grad_clip": {
                    "max_norm": 2.0
                }
            }
        },
        "lr_scheduler": {
            "type": "StepLR",
            "step_size": 2,
            "options": {
                "warmup": {
                    "type": "LinearWarmup",
                    "warmup_iters": 2

                }
            }
        },
        "hooks":
            [
                {
                    "type": "CheckpointHook",
                    "interval": 2
                },
                {
                    "type": "TextLoggerHook",
                    "interval": 20
                },
                {
                    "type": "EvaluationHook",
                    "interval": 2
                }
            ]
    },

    "evaluation": {
    		"dataloader": {
                "batch_size_per_gpu": 2,
                "workers_per_gpu": 1,
                "shuffle": false
        },
        "metrics": ["seq-cls-metric"]
    }
}
```