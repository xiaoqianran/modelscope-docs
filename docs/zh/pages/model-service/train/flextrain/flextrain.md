<!-- modelscope-docs: FlexTrain使用指南 | model-service/train/flextrain/flextrain_CN.md -->

# FlexTrain简介
ModelScope FlexTrain是一款云端无代码训练工具，只需在界面做简单的配置，就可以实现在云端训练新的模型，训练好的新模型会自动推送到ModelScope的用户私有仓库，方便后续使用。
# 产品特色
在当前版本中，ModelScope与阿里云PAI-DLC合作，为用户带来丰富的限时免费初始资源额度，同时ModelScope和PAI-DLC之间通过专有网络链接，相比于用户本地网络或者常规的ECS主机，模型上传下载速度都有极大的提升。
# 使用前提
登录ModelScope，进入FlexTrain([https://www.modelscope.cn/my/modelService/train](https://www.modelscope.cn/my/modelService/train))，按提示完成云账号绑定流程
![image.png](./_resources/1.png)
继续完成DLC服务授权流程，领取DLC优惠券，由于DLC是按可用区开通的，领取优惠券后有一定概率需要再次开通杭州Region的DLC服务，授权完成后界面如下
![image.png](./_resources/2.png)
# 创建训练任务
1. 点击新建训练，页面右侧会弹出新建项目界面，依次选取基础模型，任务类型（单任务模型不需要选择），填写项目名称，点击“创建训练项目”
![image.png](./_resources/3.png)
2. 添加数据集，界面会有示例数据集，可以参考字段对应关系来选择modelscope数据集或上传本地数据集。
![image.png](./_resources/4-1.png)
3. 如果选择modelscope数据集，点击“从数据集选择”，只需要选取合适的数据集后，配置对应的数据子集和用途，再选择数据集用途即可，此处选择的是自动拆分，数据集会按比例拆分成训练集和测试集，也可以单独选择数据集用于训练或评估。
![image.png](./_resources/4.png)
![image.png](./_resources/5.png)
4. 如果选择上传本地文件，点击“上传本地文件”，用户文件上传成功后，系统会自动帮用户创建一个私有数据集，待自动审核状态从“审核中”变为“上传成功”后，就可以进入后续流程。
![image.png](./_resources/6.png)
![image.png](./_resources/7.png)
5. 配置训练参数，系统会自动帮用户选取合适的训练机型，配置默认超参数，用户一般只需要填写最长运行时间及输出repo名称，最长运行时间主要防止训练时间过长造成费用过高，输出repo名称不能和已有repo名称重复。填写好对应参数后，就可以点击“开始训练”提交训练任务了。
![image.png](./_resources/8.png)
6. 训练状态需要耐心等待训练完成，控制台可以随时查询训练状态及对应日志，训练时间一般较长，日志显示任务正常开始后可以暂时去做其他工作，不需要一直查看进度。
![image.png](./_resources/9.png)
1. 训练完成后，可以在训练界面查看评估结果，训练时长，模型ID等信息。
![image.png](./_resources/10.png)
1. 若训练失败，可以在训练界面查询日志及任务状态，获取失败原因，然后返回数据集合或配置参数页面修改配置后重新提交。
![image.png](./_resources/11.png)
# 查看模型结果
1. 评估结果页面点击“查看模型详情”后跳转到对应的模型详情页，模型详情页包含了模型的训练任务信息及评估结果。
![image.png](./_resources/12.png)
1. 点击“快速使用”，可以参考系统生成的pipeline代码使用训练好的新模型了，注意pipeline初始化一定要带上model_revision参数。
![image.png](./_resources/13.png)