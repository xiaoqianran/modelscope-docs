<!-- modelscope-docs: 基于github等场景注册独立repo | contribute/external-component/register-standalone-repo-with-github/register-standalone-repo-with-github_CN.md -->

# 基于github等场景注册独立repo

本篇面向的对象为，希望能够通过独立github repo的项目来维护组件库，并使用modelhub上的各种model的场景

之前的章节介绍的基于modelhub注册定义组件的方式，面向的是针对组件较少，主要是为了支持个别model的pipeline推理以及trainer训练的场景。
而当面对大量模型组件或者其他类型的组件时候，可以考虑通过独立的组件库方式进行维护。

采用这种方式的好处是：
1. 解决新增大量自定义组件的依赖与主库依赖存在冲突，并较难合并入主库的场景，开发者仅维护好自己组件库与modelscope的组件依赖问题即可，不用考虑主库。
2. 使用相关组件的模型，仅需要在配置中简单加入一条配置即可。
3. 维护独立的组件库，可以更好地维护独立成体系的组件，可降低与modelscope主库之间的设计耦合

### 使用步骤
下面将针对贡献者来讲，具体步骤如下：
1. 开发者根据[开发流程](../贡献模型代码/开发模型等组件及推理流程.md)完成相关组件开发代码,并形成独立的github repo；
2. 开发者在新项目中，应当正确管理`requirements.txt`,其中**需要**包含对应版本的`modelscope`的package
3. 为了便于用户使用模型，开发者**需要**添加 `setup.py`的信息，并将开发完成后的组件库上传至,如`pipy`的package管理中心。
4. 在需要使用该独立repo的模型中配置文件`configuration.json`中 添加 `plugins: []`字段， 并将自己package名字加入，例如当前需要引用第三方插件`adaseq`,可采用如下示例：
   注意，可添加多个plugins，每个plugin均需要按照上述步骤进行完成
   ```json
   {
     "task": "awesome-task",
     "model": {
       "type": "awesome-model",
       ...
     },
     "plugins": ['adaseq']
   }
   ```
5. 当配置中包含了package信息后，在后续使用模型的场景中，modelscope主库就会自动调用 `pip`命令安装该插件
6. 按照步骤[上传模型](../接入模型文件/模型的创建与文件上传.md)到modelhub中 

针对模型使用来讲，使用方式与其他模型使用方式无异。


### 注意
值得注意的是 ，包括前面章节基于modelhub注册定义组件的方式以及本章节的方式，都放松了对于依赖库的管理。
终端用户在使用这些模型的时候会潜在的出现依赖安装问题。

因此，需要在相关的模型的README中，引导用户在使用模型的时候开启新环境进行使用。