<!-- modelscope-docs: 模型接入流程 | contribute/model-integration/model-integration_CN.md -->

# 模型接入流程

## 0. 成为 ModelScope 贡献者

首先，ModelScope 社区非常欢迎所有人参与，社区重视每个人的贡献。欢迎大家贡献模型，数据集，同时也欢迎大家回答问题，改进文档。<br />无论您选择何种方式，都希望您可以注意和尊重我们的[开源行为准则](https://www.modelscope.cn/docs/%E5%BC%80%E6%BA%90%E8%A1%8C%E4%B8%BA%E5%87%86%E5%88%99)。<br />下面是一些贡献模型前的准备工作。<br />第一步，<br />你需要选择作为社区个人贡献者还是组织贡献者，<br />如果您选择作为个人贡献者，在 ModelScope 注册账号后，即可贡献模型。<br />如果您选择作为组织贡献者，那如果您的组织尚未创建，请联系[contact@modelscope.cn](contact@modelscope.cn)，由 ModelScope 社区官方帮您创建组织，并将您的账号加为组织成员。如果您的组织已经创建，建议联系组织管理员将您加为组织成员。<br />第二步，<br />您可以根据您要贡献的模型类别和特点，选择具体模型接入的方式。


## 1. 共享模型文件到 ModelHub

共享模型文件的前提是配套的模型代码在 ModelScope Library 中已存在。包含：

- ModelScope 中已存在的各领域的任务模型代码和 backbone 代码

- 已支持的经典外部模型，如 transformers 库的 GPT-Neo、GPT2、T5、Bloom 等

ModelScope 共享模型文件的基本流程如下：

1. 注册用户、创建模型库并上传文件
2. 模型自动进入预发布状态等待上线
3. [可选] 接入模型在线体验 Demo-service

以上步骤请参考[模型创建以及上传指导](./接入模型文件/模型的创建与文件上传.md)，该文档会一步一步地帮助您进行文件上传和管理工作。

注：对于原本基于第三方包如 transformers 的模型接入的同学，在接入的时候，原本的模型中的文件需要全部加入进来，同时再额外添加 configuration.json 和 README.md 两个文件，如下为 BERT 接入的`configuration.json`示例。

```
{
    "framework": "pytorch",
    "task": "fill-mask",
    "model": {
        "type": "bert",
        "language": "zh"
    },
    "pipeline": {
        "type": "fill-mask"
    },
    "preprocessor": {
        "type": "fill-mask"
    }
}
```

## 2.共享模型代码到 ModelScope

ModelScope 共享模型代码的基本流程如下：

1. 准备好环境并了解 ModelScope 基本机制
2. 拉分支并提交一个 PR(PullRequest)
3. 开发模型、预处理器、Pipeline 组件并调通推理流程
4. 准备本地模型文件
5. 编写测试用例
6. 共享模型文件到 ModelHub，本步骤同本文的[共享模型文件到 ModelHub]
7. [可选] 开发训练流程
8. [可选] 开发导出流程
9. 增加 docstr 并推送 PR

以上步骤请参考[共享模型代码到 ModelScope](贡献模型代码/准备工作.md)文档，该文档会一步一步地帮助您进行代码共享工作。

## 3.外部组件注册到 ModelScope

针对想快速依赖 ModelScope 生态并使用 modelscope sdk 以及 modelhub 的组件的场景，
我们提供了快速接入方案。包含：

- 针对仅有少量组件场景，可通过快速组件封装接口，并通过 modelhub 进行注册管理
- 针对有大量组件的场景，可支持来自于方独立 repo 库，如 pipy 上的项目、github 上维护的独立项目以及本地新开项目

如果您在接入模型时遇到问题，可以通过如下几条路径将问题反馈给我们：

- 通过 github 社区给我们提 issue
- 加入我们的钉钉群，详见：[ModelScope 社区](../ModelScope社区/联系我们.md)
- 通过 PR 给出 comments

## 附录：可供参考的文档

- [如何撰写好用的模型卡片](./接入模型文件/模型接入帮助/撰写完善的模型卡片.md)
- [模型文件的格式](./接入模型文件/模型接入帮助/模型文件格式.md)
- [模型 Demo 接入流程](./接入模型文件/模型接入帮助/接入模型Demo/模型Demo接入流程.md)
