<!-- modelscope-docs: 基于modelhub注册自定义组件 | contribute/external-component/register-custom-component-with-modelhub/register-custom-component-with-modelhub_CN.md -->

# 基于modelhub注册自定义组件

本篇面向的对象为，希望能够快速利用modelscope的组件能力接入新的自定义模型或者组件到modelhub生态，并使用起来如pipeline，trainer的能力。

之前的章节介绍的共享模型代码到modelscope主库的方式，已经介绍了如何进行组件的注册，包括最核心的model，preprocess，pipeline以及trainer
等组件的配置以及注册方式。

值得注意的是，对于新组件贡献模型到主库有下述问题需要解决：
1. 对于新增自定义组件代码的规范性要求较高
2. 对于新增自定义组件的依赖与主库依赖存在冲突较难合并入主库的场景需要改动很多
3. 希望快速完成组件注册并在modelhub进行分享与主库发布时间较慢之间的冲突

针对上述场景我们提供了基于modelhub repo的快速注册自定义组件机制，用户可以通过模版命令快速生成用于pipeline推理，或者用于train训练的组件封装结构。
仅需要根据前述文档完成适配开发代码，以及相应配置，并上传到modelhub repo中，
即可开始使用模型。

### 使用步骤

针对模型贡献者来讲，具体步骤如下：
1. 开发者根据[开发流程](../贡献模型代码/开发模型等组件及推理流程.md)完成代码以及配置文件的准备；
2. 在配置文件`configuration.json`中 添加 `allow_remote: true`字段， 如：
    ```json
    {
      "task": "awesome-task",
      "model": {
        "type": "awesome-model",
        ...
      },
      "allow_remote": true
    }
    ```
3. 添加依赖文件 `requirements.txt`, 相关组件依赖的三方库需要再次添加，以便加载的时候依赖安装正确。 
4. 按照步骤[上传模型](../接入模型文件/模型的创建与文件上传.md)到modelhub中
5. 根据自己上传的内容，按照标准pipeline或者train流程进行model使用。

针对模型使用来讲，使用方式与其他模型使用方式无异。

### 注意
值得注意的是 ，本章节的方式放松了对于依赖库的管理。 终端用户在使用这些模型的时候会潜在的出现依赖安装问题。

因此，需要在相关的模型的README中，引导用户在使用模型的时候开启新环境进行使用。