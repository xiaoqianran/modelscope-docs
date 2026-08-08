<!-- modelscope-docs: 基于modelhub注册独立repo示例 | contribute/external-component/register-standalone-repo-with-modelhub/register-standalone-repo-with-modelhub_CN.md -->

# 为什么有独立repo

ModelScope是国内提供AI模型开源和服务的社区，其SDK实现了方便的推理能力。很多模型的贡献者希望用户能够方便在ModelScopeSDK上能够调用自己的模型，从而能够为广大用户提供展示demo及快速进行体验的能力，但是因为或者很多模型合并到ModelScope SDK比较耗费精力，或者自身的模型还在快速迭代不方便反复合并到ModelScope。

# 什么是独立repo

独立repo就是为了满足这样的需求。它相当于是对完全的代码托管平台进行升级优化，提供了统一的调用接口和demo展示能力，ModelScope推出独立repo的功能，可以将代码托管在SDK外部并且SDK可以使用外部模型的能力。

# 基于modelhub注册接入OFASys示例
下面是模型贡献者将自己模型以独立repo形式接入ModelScope需要的工作：
## 1. 准备工作
请按照[环境安装文档](./tutorial/快速入门/环境安装.md)准备好开发测试环境，可仅安装ModelScope核心框架:
```shell script
pip install modelscope
```
安装成功后，即可使用modelscope命令来进行常用操作的执行，比如模型上传、下载及模板文件创建等，使用如下命令可查看是否正确：
```shell script
modelscope --help
```

## 2. 独立Repo代码位置确定
当用户自己的模型项目开发完毕后，一般使用github来进行托管维护，这里以[OFASys](https://github.com/OFA-Sys/OFASys)项目为例，展示如何使用modelscope快速将项目接入ModelScope平台中

请将项目clone本地开发环境中(modelscope已正确安装），并使用项目自带的setup.py或requirements.txt初始化项目运行环境，确保OFASys本身可正确运行。
```shell script
git clone https://github.com/OFA-Sys/OFASys.git
cd OFASys
python setup.py develop
```
环境安装完毕后，可根据类似quickstart的方式确保接入模型可运行，如Image Captioning任务；
```shell script
from ofasys import OFASys
model = OFASys.from_pretrained('multitask.pt')

instruction = '[IMAGE:img] what does the image describe?  -> [TEXT:cap]'
data = {'img': "./COCO_val2014_000000222628.jpg"}
output = model.inference(instruction, data=data)
print(output.text)
# "a man and woman sitting in front of a laptop computer"
```

## 3. 新增实现独立仓库到ModelScope流程
### 3.1 使用modelscope pipeline命令创建模型模板文件
首先，进入到项目主模块目录，使用modelscope命令创独立Repo开发模板命令，必传参数task_name，自定义模型的任务类型名称；
```shell script
# modelscope pipeline -h 查看相关参数说明
cd ofasys
modelscope pipeline -act create --task_name my-ofasys-task --configuration_path /tmp/snapdown/
```
接下来，将在当前目录下产生默认名称ms_wrapper.py的可执行文件，接下来将对模板文件关键方法做模型初始化并接入,如下所示；
```python
@MODELS.register_module('my-ofasys-task', module_name='my-custom-model')
class MyCustomModel(TorchModel):
    def __init__(self, model_dir, *args, **kwargs):
        super().__init__(model_dir, *args, **kwargs)
        self.model = self.init_model(**kwargs)

    def forward(self, input_tensor, **forward_params):
        if forward_params.get('instruction') is None:
            raise ValueError('instruction is missing')
        else:
            template = forward_params.pop('instruction')
        return self.model.inference(template, data=input_tensor, **forward_params)

    def init_model(self, **kwargs):
        from ofasys import OFASys
        # 注，self.model_dir是ModelScope托管模型download本地的文件路径，一般会和configuration.json一起
        # 这里可以默认self.model_dir = /tmp/snapdown/
        model = OFASys.from_pretrained(os.path.join(self.model_dir, ModelFile.TORCH_MODEL_BIN_FILE))
        return model.cuda(0)
```
### 3.2  撰写单测逻辑并测试通过
在完成init_model方法的模型初始化后，可通过提供的__main__方式实例执行文件确保结果正确性，添加如下代码；
注：模型文件已保存在本地临时文件夹中
```python
if __name__ == "__main__":
    from modelscope.pipelines import pipeline

    model = "damo/ofasys_multimodal_multitask_pretrain_base_en"
    pipe = pipeline('my-ofasys-task', model=model)
    instruction = '[IMAGE:img] what does the image describe? -> [TEXT:cap]'
    data = {
        'img': "https://ofasys.oss-cn-zhangjiakou.aliyuncs.com/data/coco/2014/val2014/COCO_val2014_000000222628.jpg"
    }
    output = pipe(data, instruction=instruction)
    print(output.text)
```
直接运行改py文件查看输出结果，同时，将在/tmp/snapdown/目录下生成configuration.json文件（注：可以在py脚本中修改输出保存路径）
```shell script
python ms_wrapper.py
```
模型将返回原repo执行时相同的结果，同时此时的/tmp/snapdown/目录下将由pytorch_model.bin和configuration.json文件。

### 3.3 编辑configuration.json文件，添加 allow_remote: true字段， 支持注册自定义组件，如：
注：涉及模型初始化参数需要外部传入时，可直接在model字段下配置相应的key值
```json
    {
      "framework": "pytorch",
      "task": "my-ofasys-task",
      "model": {"type": "my-custom-model"},
      "pipeline": {"type": "my-custom-pipeline"},
      "allow_remote": true
    }
```

### 3.4 使用modelscope modelcard命令将模型托管到魔搭平台
使用如下命令将帮你快速一键接入，创建和上传模型到ModelScope平台，这里务必首先申请到[SDK令牌](./tutorial/模型库/ModelScope Hub使用文档.md)，即ACCESS_TOKEN，
此外，gid代表组织名称，若不填将默认是damo，其余参数均可默认省略；
```shell script
modelscope modelcard -tk ***** -act upload -gid damo -mid ofasys_multimodal_multitask_pretrain_base_en -ch OFASys多模态多任务预训练模型-英文-通用领域-base -md /tmp/snapdown/
```
此时，模型将返回创建后的平台URL地址及相应的git地址，同时，将提供模型的README.md文件，可先查看是否符合展示预期。

## 4. 撰写模型介绍文档
由于默认上传的模型没有完整的README.md文档，因此，可参考模型卡片的撰写要求进行内容的填充和完善，之后可持续使用modelscope modelcard -act upload命令进行更新维护，
最后的完整版示例可见[OFASys](https://www.modelscope.cn/models/damo/ofasys_multimodal_multitask_pretrain_base_en/summary)。


## 5. 平台上的pipeline命令
当完成以上模型的推理能力接入后，便可使用统一访问接口进行使用，对用户无感知
```python
from modelscope.pipelines import pipeline
pipe = pipeline('my-ofasys-task', model="damo/ofasys_multimodal_multitask_pretrain_base_en", model_revision='v1.0.0')
```


通过以上几步，模型贡献者就完成了将模型的推理能力集成到ModelScope SDK的开发，可以享受到魔搭社区提供的模型demo的优势和便利。

