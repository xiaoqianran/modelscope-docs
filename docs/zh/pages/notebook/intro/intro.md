<!-- modelscope-docs: Notebook介绍 | notebook/intro/intro_CN.md -->

本文介绍ModelScope Notebook的产品基础概述，帮助你快速了解该功能。

ModelScope Notebook是一款云端机器学习开发IDE工具，为您提供交互式编程环境，适用于不同水平的AI开发者。 通过与阿里云[PAI-DSW](https://www.aliyun.com/activity/bigdata/pai/dsw)合作，Notebook为用户提供了开箱可用的限时免费算力额度，实现ModelScope模型开发环境与CPU/GPU等多样化计算资源的无缝连接。
![image.png](./_resources/notebook.png)


## 特性
ModelScope Notebook是基于Jupyter Notebook，通过结合云上CPU/GPU计算实例来提供开箱即用的模型开发体验。同时Notebook也配置了[Web-IDE的入口](./通过Web-IDE使用VS-Code.md)，方便开发者使用VS-Code IDE进行在线开发。关于原生Jupyter Notebook的官方功能介绍，请参考 [官方文档](https://jupyter-notebook.readthedocs.io/en/stable/notebook.html)。在这个基础上，ModelScope的Notebook预置了魔搭模型开发包及算法库，且支持自定义安装第三方库。同时基于不同云算力的Notebook，也有一些不同的产品特性：

| **功能**   | **后端：PAI-DSW Notebook** | 
|----------|------------------------|
| 支持GPU    | 是                      | 
| CPU核数及内存 | 8核32G                  | 
| 网络访问     | 外网访问受限，包括huggingface等  | 
| Root权限   | 默认root账号               | 
| 持久化存储    | **/mnt/workspace/ 目录** | 

### 存储说明
- 免费Notebook环境均提供一定存储空间。当前基于PAI-DSW实例的Notebook，平台提供免费**100G**的持久化存储，并挂载在默认的 **/mnt/workspace** 目录下。对于需要持久化保存的数据，请在实例关闭前，确保其保存在/mnt/workspace/下，**放置于其他路径下的数据，在实例关闭后会自动清除**。
- 您可以通过`du -sh /mnt/workspace`命令来查看当前免费持久化存储的使用额度，请及时清理不必要文件。
- 平台提供的免费存储，是为了方便开发者的使用，**不提供SLA保障**。请**勿用于存储任何敏感隐私数据，也勿用于存储重要数据**，所有数据务必自行备份避免丢失。同时如果账号如果**长时间（365天以上）无活动，平台可能清除对应账号的持久存储数据**。

## 在Notebook运行模型推理，评估等范例 
通过ModelScope Notebook使用ModelScope上的模型时，所有的依赖环境都已经预先安装好，**可直接使用**。

### 运行推理pipeline
下面以中文分词任务为例，说明pipeline函数的基本用法。

1.  pipeline函数支持指定特定任务名称，加载任务默认模型，创建对应pipeline对象。
执行如下python代码 ：
```python
from modelscope.pipelines import pipeline
word_segmentation = pipeline('word-segmentation')
```
 

2.  输入文本 
```python
input_str = '今天天气不错，适合出去游玩'
print(word_segmentation(input_str))
{'output': '今天 天气 不错 ， 适合 出去 游玩'}
```
 

3.  输入多条样本 

pipeline对象也支持传入多个样本列表输入，返回对应输出列表，每个元素对应输入样本的返回结果。

```python
inputs =  ['今天天气不错，适合出去游玩','这本书很好，建议你看看']
print(word_segmentation(inputs))
[{'output': '今天 天气 不错 ， 适合 出去 游玩'}, {'output': '这 本 书 很 好 ， 建议 你 看看'}]
```

### 加载数据集
ModelScope可以提供了标准的`MsDataset`接口供用户进行基于ModelScope生态的数据源加载。下面以加载NLP领域的afqmc（Ant Financial Question Matching Corpus）数据集为例进行演示
```python
from modelscope.msdatasets import MsDataset
# 载入训练数据
train_dataset = MsDataset.load('afqmc_small', split='train')
# 载入评估数据
eval_dataset = MsDataset.load('afqmc_small', split='validation')

```
### 数据预处理
在ModelScope中，数据预处理与模型强相关，因此，在指定模型以后，ModelScope框架会自动从对应的modelcard中读取配置文件中的preprocessor关键字，自动完成预处理的实例化。
```python
# 指定文本分类模型
model_id = 'damo/nlp_structbert_sentence-similarity_chinese-tiny'
```
### 训练
首先，配置训练所需参数：
```python
from modelscope.trainers import build_trainer

# 指定工作目录
tmp_dir = "/tmp"

# 配置参数
kwargs = dict(
        model=model_id,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        work_dir=tmp_dir)
```

其次，根据参数实例化trainer对象
```python
trainer = build_trainer(default_args=kwargs)
```

最后，调用train接口进行训练
```python
trainer.train()
```

恭喜，你完成了一次模型训练😀

### 评估
训练完成以后，配置评估数据集，直接调用trainer对象的evaluate函数，即可完成模型的评估，
```python
# 直接调用trainer.evaluate，可以传入train阶段生成的ckpt
# 也可以不传入参数，直接验证model
metrics = trainer.evaluate(checkpoint_path=None)
print(metrics)
```

## 免费Notebook使用

ModelScope 平台将为每位用户提供一定的免费初始算力支持，供用户在Notebook内体验模型训练、推理、评估等全流程。
### 资源规格
针对每位新用户，Notebook的产品合作方将提供以下免费初始算力资源：

| **合作云产品** | **PAI-DSW**                         | 
|-----------|-------------------------------------|
| CPU环境     | 8核32G，长期使用                          | 
| GPU环境     | 8核 32GB 显存24G，<br /> 免费限额36小时       | 
| 存储空间      | 参见上方存储说明 | 
| 持久化存储    | **/mnt/workspace/ 目录** | 

### 免费Notebook资源获取
ModelScope与阿里云产品合作，为用户提供免费Notebook CPU/GPU开发环境。使用Notebook需要授权绑定阿里云账号，来获得免费初始额度。按照如下步骤进行资源获取。<br />1、使用Notebook前，先登录ModelScope账号（没有账号需要先注册ModelScope账号）<br />![image.png](./_resources/image7.png)

2、根据提示绑定阿里云账号获得免费初始资源<br />![image.png](./_resources/image1.png)<br />![image.png](./_resources/image2.png)

3、登录阿里云账号（若无阿里云账号请提前注册）<br />![image.png](./_resources/image3.png)

4、登录后授权绑定，需要勾选**全部选项**，否则会授权失败哦<br />![image.png](./_resources/image4.png)

5、绑定成功，即可获得免费初始额度<br />![image.png](./_resources/image6.png)

6、在绑定阿里云账号后，再次使用Notebook无需重复绑定。只需确保使用Notebook时，绑定的相关阿里云账号处于登录态即可。
### 使用限制

- 以上免费算力资源**使用权归属于用户**，用户对算力使用的合法合规性负责，**请勿使用算力资源进行违法操作**。
- 以上免费算力资源，仅支持在ModelScope Notebook内使用，实例单次运行最大时长不超过10小时。
- ModelScope Notebook 优先处理交互式计算。如果您的Notebook处于空闲状态超过**1个小时** 无活动，Notebook将超时自动关闭。 若实例不运转，建议手动关闭实例，避免免费额度的消耗。
- 若免费额度已用尽，或存在定制化资源需求，请前往相应的阿里云产品控制台购买Notebook商业版服务。
- 后续ModelScope社区将推出更多活动，可免费获取GPU算力资源，敬请期待。

## 免费资源额度用尽的处理

免费GPU资源额度用完后，您可以继续在CPU Notebook环境开发、本地开发或在Notebook商业版内付费开发使用。本文将介绍免费资源额度用尽后应当如何操作。
### 如何知道资源已用尽
您可以在**个人控制台 > 我的Notebook**内右上方资源倒计时区域，查看剩余的免费资源额度。图中剩余额度为16小时。<br />![image.png](./_resources/image1.png)<br />

若免费资源额度已用尽，您可以在**个人控制台 > 我的Notebook**右上方获取提示，此时您将无法继续选择在GPU环境内继续开发。若您正在Notebook内进行文件编辑，资源用尽后将不支持任何代码执行操作，已编辑的文件需及时保存。<br />![image.png](./_resources/image2.png)
### 免费资源用尽后的操作

#### 路径一：切换至CPU环境继续开发
您需要返回**个人控制台 > 我的Notebook**，启动**CPU环境实例**。在CPU环境中，您先前在GPU实例下创建的pynb文件，以及按照上方存储说明做持久化存储的数据，您可以在CPU环境下继续访问并使用。
#### 路径二：导出文件后在本地开发
您可以参考文档 “读写数据与文件传输” 导出代码、数据集和模型文件，在本地IDE内继续开发，如Jupyter Notebook、PyCharm、VSCode等。
#### 路径三：前往Notebook商业版付费使用
在正式使用Notebook商业版进行开发前，您可以先打开ModelScope Notebook创建CPU环境实例，导出已保存的代码、数据集和模型文件。<br />您可以在**个人控制台 > 我的Notebook**内找到Notebook商业化版本入口。点击跳转阿里云控制台登录，根据指引完成商业版本的实例购买。<br />![image.png](./_resources/image3.png)

### PAI-DSW付费实例创建
如下介绍PAI-DSW的资源用尽如何进行资源购买。<br />从**个人控制台 > 我的Notebook> PAI-DSW Notebook商业化版本**点击链接，或点击如下[链接]([https://pai.console.aliyun.com/?regionId=cn-hangzhou#/notebook-buy/buy?imgid=image-qg4mas1gt2rxi9gwma&from=outer)访问。

若您已经开通过机器学习PAI的相关产品，则登录后可直接跳转订单购买页购买。 若您还未开通服务，则根据PAI服务页面引导完成付费资源的开通和购买。 通过PAI的云产品服务页面，您可以开通PAI的产品并创建工作空间，创建不同地域下不同规格的付费实例，绑定包括NAS在内的不同云存储等操作。同时您的付费DSW实例，也可选择不同的预置ModelScope官方镜像，正常进行模型开发工作。

