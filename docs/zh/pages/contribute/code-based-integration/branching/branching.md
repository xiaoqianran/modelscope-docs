<!-- modelscope-docs: 拉分支并提交PR | contribute/code-based-integration/branching/branching_CN.md -->

# 拉起分支

- 如果在github上进行模型接入，请在github上Folk [ModelScope Library](https://github.com/modelscope/modelscope)，之后拉起一个新的分支。
- 如果在aone上进行模型接入，请直接拉起新的分支。

```shell
# 假设代码已经被clone到本地，且当前目录位于其中
git checkout master
git pull
# feat/my-awesome-model-branch为临时名字，请在实际操作中替换
git branch feat/my-awesome-model-branch
git checkout feat/my-awesome-model-branch
```

# 创建空的模型文件

**ModelScope的模型在modelscope/models目录内**，内部按领域划分，如cv,nlp,audio,multi_modal,science，分别代表了ModelScope支持的五种模态，用户需要选择一个来放置自己的模型。

如果待接入模型的目录不存在，请在对应模态的目录内创建一个。

> 自然语言处理、多模态、语音、科学四个模态是按照模型名称创建目录，而视频图像模态是按照模型名+任务名的方式创建目录。 

目录创建完成后，就可以创建具体的模型代码文件了

# 创建任务Code和模型Code
如果任务类型和模型类型在ModelScope中不存在，那么需要把这两个名称枚举类中以备后续使用。在modelscope/utils/constant.py中，分别存在各领域的Task枚举：NLPTasks/CVTasks/AudioTasks/MultiModalTasks，根据自己的领域在某个类中写入：

```text
awesome_task = 'awesome-task'
```

在modelscope/metainfo.py中，存在模型名称的枚举Models,在其中写入：
```text
awesome_model = 'awesome-model'
```

请注意，右侧的字符串需要用中折线而不是下划线，在configuration.json等配置中指定的也是右侧的内容，而非左侧。

大功告成，下面可以提交PR了。

## 提交PullRequest

**对于用户而言，这步是可选的**。但我们建议存在以下情况的用户在这步提交PR：

- 模型较为复杂，接入推理或训练有难度
- 无法复用训练、推理、预处理的组件，或对已有组件使用方式不理解
- 模型的任务类型是新的
- 对ModelScope的机制或接入方法比较迷惑

提交好PR后，可以通过添加comments的方式来提问，开发人员会帮忙答疑并防止接入时走弯路。