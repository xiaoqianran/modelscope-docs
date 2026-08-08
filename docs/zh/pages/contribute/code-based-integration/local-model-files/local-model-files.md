<!-- modelscope-docs: 准备本地模型文件 | contribute/code-based-integration/local-model-files/local-model-files_CN.md -->

## 准备本地模型文件

首先，需要准备好一个文件夹用来存储model文件。一般来说接入ModelScope的模型不需要改变其原始的checkpoint。因此在最简单的情况下，用户仅需要将bin文件拷贝到该文件夹中：

```shell
cp pytorch_model.bin some-folder-to-keep-model/
```

>  在特殊情况下，用户需要进行一次模型param mapping的转换，以保证模型文件和模型代码的匹配。

模型文件的最小组成结构是一个bin文件来初始化模型，一个configuration.json来引导运行参数。ModelScope的configuration.json的参数较多，建议分不同场景来拷贝粘贴一个配置文件：
- 如果新添加的模型和已有模型比较相似：可以拷贝该模型某个checkpoint的configuration.json
- 如果新添加的模型比较特殊，或拷贝其他模型的配置存在一定风险，可以拷贝如下基本模板：

  ```json
  {
      "framework": "pytorch",
      "task": "sentence-similarity",
      "pipeline": {
          "type": "sentence-similarity"
      },
      "preprocessor": {
          "type": "sen-cls-tokenizer",
          "first_sequence": "sentence1",
          "second_sequence": "sentence2"
      },
      "model": {
          "type": "structbert"
      },
      "train": {
          "work_dir": "/tmp",
          "max_epochs": 10,
          "dataloader": {
              "batch_size_per_gpu": 2,
              "workers_per_gpu": 1
          },
          "optimizer": {
              "type": "SGD",
              "lr": 0.01
          },
          "lr_scheduler": {
              "type": "StepLR",
              "step_size": 2
          },
          "hooks": [{
              "type": "CheckpointHook",
              "interval": 1
          }]
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

拷贝完成后，一般来说需要改动的地方有：
- task字段，替换成实际的任务code
- preprocessor字段，替换为实际的预处理器参数
- model字段，替换为模型参数
- pipeline字段，替换为pipelinecode（及其他初始化参数）
- 训练的一些超参数配置，如train字段中的optimizer、lr_scheduler、max_epoch等，根据模型要求配置

在本步骤中我们仅关心model字段，因此请将model字段需要（也就是传入**模型构造**中，或者**_instantiate**方法中）的值填充正确。如果该值在其他的文件中（例如transformers的config,json），可以一同拷贝进some-folder-to-keep-model目录中。configuration.json中model字段的keyvalue会由`Model.from_pretrained`方法自动读取并传给模型，其他文件的值需要用户自行处理。

>  注意：
>
> 1. 请避免模型需要的值中，configuration.json的model部分和其他文件读取的部分存在重叠或冲突。
> 2. 可以在configuration.json增加一些新的字段或结构，甚至废弃现有字段来支持模型接入（尤其是非PyTorch场景），但这种情况下使用者理解成本较高因此不推荐使用，请谨慎使用并考虑在ModelCard中予以特殊说明。

准备好checkpoint后可以测试一下：
```text
model = Model.from_pretrained('some-folder-to-keep-model')
# Extra code the check the model
self.assertTrue(...)
...
```
其他字段我们在下面的步骤中分别填充。