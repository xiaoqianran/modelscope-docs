<!-- modelscope-docs: 回调函数机制 | sdk/tutorials/callbacks/callbacks_CN.md -->

# 回调函数机制

### ModelScope的回调机制

回调是ModelScope的trainer（训练器）中存在的一种机制。我们将不同训练策略下的实现放入了不同的回调中，比如：

1. 训练中存储模型可能按iter均匀存储，也可能存储最佳的
2. 可能是单卡训练，也可能是DDP训练，也可能使用deepspeed进行多机多卡训练
3. 可能使用半精度训练，也可能使用全精度训练

这些不同的策略如果都写到trainer的代码中，会让整个代码维护性可读性变差，因此我们将一些重要的流程放到了回调机制中，保证训练过程的可扩展性。

在整个训练过程中，我们可以利用回调函数在训练的不同时刻定义一些自定义操作：每到达某个时刻，会调用所有回调在该时刻的回调函数，其工作机制可参考下图：<br>
![image.png](./_resources/1659498714468-3b672c47-c504-403b-987a-983612a2ca9f.png)
### 支持列表

- LrSchedulerHook lr衰减策略
- PlateauLrSchedulerHook lr衰减策略
- OptimizerHook 优化器策略
- TorchAMPOptimizerHook 优化器策略
- CheckpointHook 模型存储策略
- BestCkptSaverHook 模型存储策略
- EvaluationHook 校验策略
- TextLoggerHook 日志策略
- IterTimerHook 训练耗时策略
- TensorboardHook  tensorboard实验记录策略
- DDPHook 数据并行策略
- MegatronHook megatron训练策略
- DeepSpeedHook deepspeed训练策略

### 使用方法
#### LrSchedulerHook
参考API：`modelscope.trainers.hooks.LrSchedulerHook`。
用于调节learning rate，`LrSchedulerHook`**不需要用户手动配置**，会在trainer接口中自动为用户创建，我们已将torch支持的所有lr scheduler接口注册到ModelScope中，用户只需要在配置文件中配置lr scheduler的类型和参数即可。参考如下配置（需要自定义接口的用户请参考自定义lr_scheduler_hook。）：
`StepLR`对应 [torch.optim.lr_scheduler.StepLR](https://pytorch.org/docs/stable/generated/torch.optim.lr_scheduler.StepLR.html) 接口，step_size是`torch.optim.lr_scheduler.StepLR`的参数。
```json
"train": {
        "lr_scheduler": {
            "type": "StepLR",
            "step_size": 2,
        }
}
```
另外，我们还支持了warmup等附加功能，配置在options参数中，参考如下配置：
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

**注意**：ModelScope的某些configuration中可能使用了过高版本的lr_scheduler，如果您在本地无法使用，请尝试更换lr_scheduler的类型。

-  warmup
目前我们支持的warmup接口有： 
   -  `LinearWarmup`
      参数如下： 
      - `warmup_iters`: warmup的迭代数。
      - `warmup_ratio`：warmup的初始值比例， initial warmup lr=warmup_ratio * initial lr
   -  `ConstantWarmup`
参数同`LinearWarmup`。 
   -  `ExponentialWarmup`
参数同`LinearWarmup`。 
#### PlateauLrSchedulerHook
**注意：** `ReduceLROnPlateau` 与其他 lr scheduler稍有不同，请参考[**ReduceLROnPlateau**](https://pytorch.org/docs/stable/generated/torch.optim.lr_scheduler.ReduceLROnPlateau.html)，`ReduceLROnPlateau.step`更新时需要用户传入`metrics`，所以使用时必须增加`lr_scheduler_hook`字段，指定`PlateauLrSchedulerHook`。
**关于**`lr_scheduler_hook`字段请参考自定义lr_scheduler_hook。
参考API：`modelscope.trainers.hooks.PlateauLrSchedulerHook`。
仅用于`ReduceLROnPlateau` ，**需要用户手动添加到配置文件中**。`ReduceLROnPlateau.step`需要用户传入`metrics`，必须配合EvaluationHook一起使用，根据验证的返回指标判断learning rate是否需要更新， `ReduceLROnPlateau`的更新频率默认和`EvaluationHook`一致，建议`EvaluationHook`的intervel设置成1。配置参考如下：
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

- metric_key：metric可能返回多个指标，指定某一个key用于监控趋势，判断是否更新learning rate。
#### OptimizerHook
参考API：`modelscope.trainers.hooks.OptimizerHook`。
用于optimizer更新，`OptimizerHook`**不需要用户手动配置**，会在trainer接口中自动为用户创建，我们已将torch支持的所有optimizer接口注册到ModelScope中，用户只需要在配置文件中配置optimizer的类型和参数即可。参考如下配置（需要自定义接口的用户请参考自定义optimizer_hook。）：
```json
"train": {
        "optimizer": {
            "type": "SGD",
            "lr": 0.01
        }
}
```
另外，我们还支持了梯度裁剪，梯度累积等操作，附加功能配置在options参数中，参考如下配置：
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

**注意**：ModelScope的某些configuration中可能使用了过高版本的optimizer，如果您在本地无法使用，请尝试更换optimizer的类型。

-  grad_clip：梯度裁剪配置 
-  cumulative_iters：梯度累积步数 
#### TorchAMPOptimizerHook
参考API：`modelscope.trainers.hooks.TorchAMPOptimizerHook`。
混合精度训练，**不需要用户手动配置**，创建trainer时传入`use_fp16`参数即可。
#### CheckpointHook
参考API：`modelscope.trainers.hooks.CheckpointHook`。
用于保存模型，需要用户手动添加到配置文件中。参考如下配置：
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

- interval：保存模型的频率，默认1个epoch保存一次。
- by_epoch: 是否按epoch保存，False为按iter周期保存
- checkpoint_file: 训练开始时读取的已保存的训练文件，在trainer.train('some-ckpt.pth')中传入也可以
- load_all_state: bool类型，如果为True，则会加载optimizer、epoch等参数，继续上一次的断点训练，如果为False，则只会加载模型的ckpt，从epoch=0重新训练
- max_checkpoint_num：int类型，表示磁盘存储的最大训练文件数量（注意：最大训练文件指可用于继续训练的文件数量，用于推理的output文件夹只有一个），默认为None，表示不设限。如达到最大数量，会按顺序删除较早存储的文件

#### BestCkptSaverHook
参考API：`modelscope.trainers.hooks.BestCkptSaverHook`。
用于保存指标最优的模型，需要用户手动添加到配置文件中。需配合EvaluationHook使用，根据验证的返回指标判断当前指标是否最优，参考如下配置：
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

BestCkptSaverHook是CheckpointHook的子类，除支持CheckpointHook的参数外，还支持：
- metric_key：metric可能返回多个指标，指定某一个key用于监控是否是最优模型。
- rule：判断规则，"max"表示当前"metric_key"最大时是最优模型，"min"表示当前"metric_key"最小时是最优模型。
- restore_best: bool类型，是否在训练结束后加载最佳模型
- save_file_name: str类型，指定后存储的训练文件不会再按照epoch+metric自动生成，而是稳定存储进一个{work_dir}/{save_file_name}.pth文件中。
- max_checkpoint_num：同CheckpointHook的参数含义，默认值为1。文件保留方式为metric最好的max_checkpoint_num个。


#### EvaluationHook
参考API：`modelscope.trainers.hooks.EvaluationHook`。
用于边训练边验证，需要用户手动添加到配置文件中。参考如下配置：
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

- interval：验证的频率，默认1个epoch验证一次。

#### TextLoggerHook

参考API：`modelscope.trainers.hooks.TextLoggerHook`。
用于打印日志，需要用户手动添加到配置文件中。参考如下配置：

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

- interval：打印日志的频率，默认10步打印一次。
#### IterTimerHook
参考API：`modelscope.trainers.hooks.IterTimerHook`。
用于输出每一步的运行时间以及数据加载时间，需要用户手动添加到配置文件中。参考如下配置：
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
参考API：`modelscope.trainers.hooks.TensorboardHook`。
用于把训练时的学习率、loss、评估结果写入文件，可以使用tensorboard进行可视化。

参考如下配置：
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

- out_dir：可选参数， 不填默认存储到 ${work_dir}/tensorboard_output目录下。
- interval：日志写入到tensorboard的频率，默认10步打印一次。

训练过程中，可以使用如下命令打开tensorboard进行实验过程指标查看。
```shell
tensorboard --logdir  path/to/save  --port 8080
```

#### DDPHook
参考API：`modelscope.trainers.hooks.distributed.DDPHook`。
用于支持训练阶段的数据并行，通过并发的数据并行训练提高训练效率。

参考如下配置：
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

- launcher：str类型，数据并行的启动方式，可选项包括："pytorch", "mpi", "slurm"。

训练过程中，可以使用如下命令打开tensorboard进行实验过程指标查看。
```shell
tensorboard --logdir  path/to/save  --port 8080
```

#### MegatronHook
参考API：`modelscope.trainers.hooks.distributed.MegatronHook`。
用于支持包含Megatron组件的模型的训练过程：
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

该hook会向trainer写入自身的parallel groups，并重写存储读取checkpoint的过程使其适配Megatron的分片机制。使用Megatron的模型需要在配置文件中指定这个hook。


#### DeepspeedHook
参考API：`modelscope.trainers.hooks.distributed.DeepspeedHook`。
用于输出每一步的运行时间以及数据加载时间，需要用户手动添加到配置文件中。参考如下配置：
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

- config：deepspeed初始化时使用的配置文件路径。
- deepspeed_activation_checkpointing：bool类型，可选参数，默认为True。是否开启重算中间变量功能，此功能以增加少量计算量为代价减少中间变量的显存占用。
- save_zero_checkpoint：bool类型，可选参数，默认为False。是否保存zero参数的checkpoint。
- with_mpu：bool类型，可选参数，默认为True。是否初始化mpu并输入到deepspeed中，为True时由mpu管理模型并行策略。
- zero_stage: 可选参数，如输入必须为0，1，2或3，指定zero等级，越大越激进地节省显存。

### Trainer默认Hook配置
需要手动配置的常用Hook，我们已经添加到默认配置中，不需要用户再配置，可参考：`modelscope.trainers.default_config.DEFAULT_CONFIG`。
如果用户需要修改默认配置，直接在自己的配置文件中重新添加即可，默认配置会被替换。
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
### 自定义Hook
#### 自定义通用hook
自定义Hook需继承基类`modelscope.trainers.hooks.Hook`，同时将接口注册到`HOOKS`模块中。请参考如下代码：
```python
from modelscope.trainers.hooks import Hook
from modelscope.trainers.hooks import HOOKS


@HOOKS.register_module()
class CustomHook(Hook):
    pass
```
自定义后的接口可以在配置文件中直接使用。例如：
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
#### 自定义optimizer_hook
**注意：目前我们将**`optimizer_hook`**与其他Hook区分开来，自定义的optimizer hook必须使用**`optimizer_hook`**字段指定。**
默认optimizer_hook请参考OptimizerHook。
自定义Hook需继承基类`modelscope.trainers.hooks.Hook`，同时将接口注册到`HOOKS`模块中。请参考如下代码：
```python
from modelscope.trainers.hooks import Hook
from modelscope.trainers.hooks import HOOKS


@HOOKS.register_module()
class CustomOptimizerHook(Hook):
    pass
```
自定义optimizer_hook的使用方式如下：
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
#### 自定义lr_scheduler_hook
注意：目前我们将`lr_scheduler_hook`与其他Hook区分开来，自定义的lr scheduler hook必须使用`lr_scheduler_hook`字段指定。
默认lr_scheduler_hook请参考LrSchedulerHook。
自定义Hook需继承基类`modelscope.trainers.hooks.Hook`，同时将接口注册到`HOOKS`模块中。请参考如下代码：
```python
from modelscope.trainers.hooks import Hook
from modelscope.trainers.hooks import HOOKS


@HOOKS.register_module()
class CustomLrSchedulerHook(Hook):
    pass
```
自定义lr_scheduler_hook的使用方式如下：
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
### 配置参考
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
