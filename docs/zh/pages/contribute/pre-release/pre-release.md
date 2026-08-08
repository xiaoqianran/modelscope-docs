<!-- modelscope-docs: 预发布及状态申诉 | contribute/pre-release/pre-release_CN.md -->

本篇文章介绍ModelScope发布时的重要字段和它的影响。

# 预发布状态定义

为了保障平台内的模型和数据集质量，我们针对所有贡献者的模型或数据集，引入了文件审核机制。目前该审核机制会校验以下几种情况，如果命中了任意一种，则该模型或数据集被标记为预发布状态：

**模型库**

1. README 不超过200字或者使用了默认README模版。
2. 未上传除 .gitattributes,  README.md, config.json/configuration.json 三个文件以外的其他文件。
3. 英文名**只有"test"**。
4. 中文名**只有"test"**，或**只有"测试"**。

**数据集**
1. 英文名**只有"test"**。
2. 中文名**只有"test"**，或**只有"测试"**。
3. 数据集当中只有以下几种文件
    - README.md
    - dataset_infos.json
    - 数据集同名 json 文件或空的数据集同名 Python 文件，注意：如果 Python 文件不为空，则可以脱离预发布状态

在您已经将文件上传到hub中，且您上传的模型或数据集没有满足以上条件，我们将自动为您的模型或数据集标记为**预发布（preview）状态**，预发布状态下，**该资源不支持列表页展示及搜索**。我们鼓励更多开发者在ModelScope社区内分享模型和数据集，同时也希望能够和开发者一起完善模型和数据集的质量。

# 不影响发布但影响使用的字段

有一些字段填写不正确会对模型数据集的**搜索和信息展示**造成一定影响，但**不会卡预发布**状态：

## yaml文件

### yaml header中的tasks信息

该信息缺失会导致**按任务搜索**查找不到您的资源，为**避免曝光量下降**，请注意正确填写该字段

### yaml header中的license信息：

1. 该信息缺失会导致该资源没有license，**影响使用者对该资源的可用性评价**

```yaml
tasks:
- text-generation
license: Apache License 2.0
```

## configuration.json文件

### configuration.json中的framework字段、pipeline.type字段

如该**模型需要使用ModelScope Library的Pipeline**，需要正确填写该字段

### configuration.json中的task字段、model.type字段

如该**模型不是HuggingFace格式**则需要正确填写该字段，否则模型可能无法拉起

```json
{
  "framework": "pytorch", # pytorch，tensorflow，kaldi等
  "task": "text-generation",
  "model": {
    "type": "bert"
  },
  "pipeline": {
    "type": "my-custom-generation-name"
  }
}
```

# 如何申诉
若您对被标记为预发布状态的模型或数据集产生困扰，您可以邮件联系我们（contact@modelscope.cn），或加入我们的技术交流群（钉钉群群号：44837352），联系我们的官方工作人员。

需要您提供以下信息：

- 模型/数据集名称：提供预发布模型/数据集的中文名或英文名
- 提供者：该模型的创建身份，以个人身份创建则填写用户名，以组织身份创建则填写组织名
- 备注：您可以填写认为预发布状态标记不合理的理由，并提供其他补充信息

