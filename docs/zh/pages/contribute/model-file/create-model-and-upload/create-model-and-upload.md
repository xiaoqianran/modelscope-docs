<!-- modelscope-docs: 模型的创建与文件上传 | contribute/model-file/create-model-and-upload/create-model-and-upload_CN.md -->

本篇文章介绍如何在ModelScope社区创建模型和具体操作方式。

# 模型库创建

参考：[模型库创建](../../模型库/模型库介绍.md#创建自己的模型库)

# 模型文件上传

参考：[模型文件的上传](../../模型库/模型的上传.md)

<!-- 若您需要在ModelScope平台上创建模型库并上传模型内容，则您需要先创建一个账户，登录后可创建模型库。ModelScope的模型库是基于Git的模型存储库，可为您提供版本控制、分支管理、与ModelScope library便捷的集成和共享发现功能。您可以选择上传的模型内容，包括模型文件、配置文件、检查点等文件内容。
# 账号注册与登录
要创建文件并共享至ModelScope社区，您需要拥有ModelScope账号。如果您还没有账号，请注册一个新账号以用于向Model hub验证您的身份。<br>
![image.png](./_resources/1661239584277-3c7a1202-db29-4d7a-a65f-f4d7fc41c757.png)
<br>
![image.png](./_resources/1661239559714-de6924e3-f436-4b06-bfec-2c2c0292dadb.png)
<br>

# 创建模型库
注册登录后，在头像左侧会出现创建按钮，点击可创建模型或数据集。点击创建模型，进入模型页面填写基础信息实现模型库的创建。<br>

![image.png](./_resources/v1.5p1.png)<br>

创建模型分为两个步骤：

**1）填写基础信息。**
您需要填写如下信息：

- 模型英文名称：是该模型的唯一标识，相同模型库下英文名称不可重名。
- 模型中文名称：模型对应的中文名称，可在设置中修改。建议名称直观清晰地描述模型实现的任务。
- 所有者：默认是创建者自己或自己所在的组织。
- License: 模型开源协议。选择适合自己的模型开源许可证。若此次没有您所需的开源协议，可发送邮件至 contact@modelscope.cn 联系我们添加。
- Task 类型：是指您所创建的模型属于怎样的任务，该任务类型对应了模型的输入输出，与模型的 pipeline 和相关配置文件相关。针对平台已注册的任务类型，魔搭社区已经封装了对应的代码方便相同类型任务的模型接入。您可查看[任务的介绍](./各任务最佳实践/任务的介绍.md)。若您的任务类型不在魔搭社区所提供的已有的类型中，可发送邮件至 contact@modelscope.cn 联系我们添加注册。
- AI 框架：同理，当前魔搭平台支持主流的Pytorch、Tensorflow、Kaldi等AI框架，若您的模型所依赖的AI框架不在选项中，可邮件联系我们添加。
- 是否公开：若您希望您的模型更更多的人看见，请选择设置为公开模型。若您设置为非公开模型，则仅您自己可见。您也可以在设置中修改模型的开放权限。
- 模型描述：模型描述将展示在模型列表页面上，便于用户快速地了解您的模型。建议描述模型特征、优势和应用场景等。

![image.png](./_resources/v1.5p2.png)

**2）上传README文档。**
若您已有README文档，可直接在此处上传。若您没有README文档，系统将为您自动创建一个README文档。
为了让模型介绍更容易被理解和检索，我们推荐您按照模型卡片规范进行书写，具体可查看[如何撰写好用的模型卡片](模型接入帮助/撰写完善的模型卡片.md)和[快速使用页编辑指南](模型接入帮助/快速使用页编辑指南.md)。
<br>
![image.png](./_resources/1659447304275-027198bb-ca6e-4b66-8f20-7b0f26aaa4bb.png)
<br>
点击创建模型，系统将根据您上传的README.md文件进行解析，并展示在模型介绍页面。
<br>
![image.png](./_resources/1659697492848-1411018e-d46c-44bc-aab0-8f959b6b3833.png)
<br>
若您没有README文档，可在模型文件中找到README.md并点击编辑进行在线编辑。
<br>
![image.png](./_resources/1659447412471-cd1049c7-c796-4cfc-ad83-0e392d9cc153.png)
<br>
模型卡片的编辑分为yaml部分和markdown部分，其中系统通过解析yaml文档来解析对应的字段和模型标签。
<br>
![image.png](./_resources/1659447515576-7ccbc093-0857-42d7-b0c7-8491845b1a39.png)
<br>
markdown部分，我们推荐按照如下模板来写，将有利于您的模型可读性，便于用户的理解。
<br>
![image.png](./_resources/1659447804241-77b79331-2fae-4388-a34c-22da880215f5.png)
<br>

另外，也可以通过API创建模型库:

```py
from modelscope.hub.constants import Licenses, ModelVisibility
api.create_model(
    model_id="damo/cv_unet_image-matting_damo",
    visibility=ModelVisibility.PUBLIC,
    license=Licenses.APACHE_V2,
    chinese_name="这是我的第一个模型",
)
```

# 添加模型文件并设置模型版本

完成创建后，平台将为您分配一个存储地址，格式为https://www.modelscope.cn/namesapce/model-name.git , 例如：

    git clone https://www.modelscope.cn/damo/ofa_image-caption_coco_large_en.git

您可任选**页面**、**git**或**Python SDK**中的任意一种方式将文件添加至该模型库中并设置模型版本。

>  如果模型文件体积较小的话（比如小于100M），通过页面上传相关模型文件较为方便。

***为什么要设置模型版本***

ModelScope平台上的模型有版本标识才能使用。对于模型开发者来说，模型在接入和更新过程中，都需要有意识的进行版本的标注。如果不做此操作，则pull request中触发的测试还会使用之前的模型版本，在git repo里做的模型变动，**不会生效**。当然，如果模型文件的改动对于模型在sdk里的使用不产生影响（比如只是更新了readme，或者添加了一个modelcard依赖的图片），可以跳过此操作。

- 在本地library的master分支上开发时，模型在ModelHub上上传/更新的所有模型文件，都是立刻可见，可用的。
- 模型代码通过ModelScope Library接入调试后，merge到GitHub之前，如果依赖于模型文件的改变，比如模型checkpoint更新，或者configuration文件更新，那需要通过页面、git命令或SDK对当前模型repo打一个新的tag，此tag将作为模型版本管理的依据

- 所有发布分支的SDK，会默认使用**SDK发布时间前的最新模型版本**，而不再使用最新model repo上的最新模型文件。

***SDK或git方式需要使用token***

如果需要**使用git或SDK的方式上传文件或打版本，用户需要在页面上获得一个token**。方法如下：

- 用您的账号登录https://www.modelscope.cn ，点击 访问令牌，拷贝git token.<br>
  请注意ModelScope平台针对SDK访问和git访问两种模式，提供两种不同的访问令牌(token)。
  - **访问令牌**用于**SDK访问**如果您的页面上没有sdk token，可以新建一个。
  - **git token**用于**git命令访问**，

![image.png](./_resources/get_token.png)
<br>



## 通过页面上传并设置版本

在模型卡片页面的“模型文件”中点击“添加文件”进行页面添加。您可以选择上传的目录地址，并将文件拖转或点击上传，并提交重要的文件更新内容。

![image.png](./_resources/1659697567576-fd6d2742-3e47-4898-be4f-760abe275d95.png)
<br>
![image.png](./_resources/1655891466820-1773f597-76f7-42aa-998a-5709a739e232.png)

平台支持对如下文档类型进行在线预览查看：
.md、.txt、.json、.py、.yaml、.yml、.gitattributes、.gitignore、.html、.bmp、.jpg、.jpeg、.png、Dockerfile、.sh，若文件内容超过1M,系统将不再支持预览，但可支持用户下载该文件进行查看。

点击上传文件按钮后，即可在页面看见新文件并预览文件内容。此时进入模型文件标签页，右侧会出现`添加版本`按钮：

![image.png](./_resources/model_version_page.jpg)

点击进入后，按需设置版本号、分支信息、描述即可正确设置版本。


## 使用git上传并设置版本
> 注意：需确保**git-lfs >=2.5.0 , git >= 2.3.0**，且配置了**git访问令牌**。

您可以在ModelScope社区创建模型，然后根据页面信息通过git命令将模型仓库同步到本地，然后将自己想上传的模型文件拷贝到对应仓库中，通过git命令完成模型上传操作。
```shell
# 模型下载，假设您的账户名是user，您通过页面创建的模型名称为my_test_model
git lfs install
git clone https://www.modelscope.cn/user/my_test_model.git

# 私有模型下载，前提是您有响应模型权限 方法1
git lfs install
git clone http://oauth2:your_git_token@www.modelscope.cn/user/my_test_model.git
# 方法2
git clone http://user@www.modelscope.cn/user/my_test_model.git
# Password for 'http://user@modelscope.cn':
# input git token

# 假设您的模型文件位于/work/my_model_dir目录下
cd my_test_model
cp -rf /work/my_model_dir/* .
git add -A .
git commit -m "commit message"
git push
```
> 需要注意的是，目前平台对于以下后缀的文件会自动利用lfs来进行上传：
> *.7z、*.arrow、*.bin、*.bin.*、*.bz2、*.ftz、*.gz、*.h5、*.joblib、*.lfs.*、*.model、*.msgpack、*.onnx、*.ot、*.parquet、*.pb、*.pt、*.pth、*.rar、saved_model/\*\*/*、*.tar.*、*.tflite、*.tgz、*.xz、*.zip、*.zstandard、*.tfevents*、*.db*、*.ark*、\*\*/*ckpt*data*、\**/*ckpt*.meta、\*\*/*ckpt*.index
> 
> 如果在您的模型文件中有其他类型的大文件（大于100MB），请在git add之前执行命令使其按照lfs的方式进行上传：
> **git lfs track <your_file_name>**

接下来使用git设置模型版本：

```shell
git tag 'v0.1' -m 'validate on imagenet test set, accuracy 98.9%'  # create tag
git push origin v0.1  # push tag to remote for version control
# v0.1您可以自行定义
```

这其中v0.1为tag名字，也会作为新的版本名字，-m 后面的内容作为模型版本的描述。<br />

## 使用Python SDK上传模型并设置版本
您可以使用modelscope modelhub来将已经训练好的模型上传到ModelScope平台。您可以提前在ModelScope社区网页创建对应模型，然后将本地模型目录通过push_model接口进行上传，也可以直接通过push_model自动完成模型创建和上传
```py
from modelscope.hub.api import HubApi

YOUR_ACCESS_TOKEN = '请从 ModelScope个人中心->访问令牌 页面获取SDK访问令牌'
# 请注意ModelScope平台针对SDK访问和git访问两种模式，提供两种不同的访问令牌(token)。此处请使用SDK访问令牌。


api = HubApi()
api.login(YOUR_ACCESS_TOKEN)
api.push_model(
    model_id="yourname/your_model_id", 
    model_dir="my_model_dir" # 本地模型目录，要求目录中必须包含configuration.json
)
```
下面可以设置模型版本：

```py
from modelscope.hub.api import HubApi
from modelscope.hub.repository import Repository

YOUR_ACCESS_TOKEN = '请从 ModelScope个人中心->访问令牌 页面获取SDK访问令牌'
# 请注意ModelScope平台针对SDK访问和git访问两种模式，提供两种不同的访问令牌(token)。此处请使用SDK访问令牌。
api = HubApi()
api.login(YOUR_ACCESS_TOKEN)
repo = Repository(model_dir, clone_from=model_id)
repo.tag_and_push('v1.0.0', 'Test revision')
```

## 大文件上传被服务端拒绝解决方法

对于超过100MB的文件，平台使用git-lfs进行管理。
如果你在推送过程遇到如下图所示的报错，那么表示您此次提交的commit中存在大于100MB的文件未标记为LFS文件，服务端拒绝了这类推送。

![image.png](./_resources/large-file-upload.png)

其中d084b5a表示包含大于100MB文件的分支，test为文件名。遇到上述报错时，您可参考以下解决方案：
```
# 初始化lfs
git lfs install
# 回退至d084b5a的上一个d084b5a
git reset d084b5a~1
# 将超过100MB的文件使用lfs进行追踪
git lfs track test
# 重新提交
git add .
git commit -m "your commit"
# 将分支推送至远端
git push
# 重新创建tag并推送至远端，如果是branch可跳过此步骤
git tag -d v1.0.0
git tag v1.0.0 tmp1
git push origin v1.0.0
``` -->

# 模型管理维护
模型上传后，您可以后续更新模型文件或进行模型库基本信息的管理维护及删除，具体请查看[模型的管理设置](模型接入帮助/模型管理设置.md)。
