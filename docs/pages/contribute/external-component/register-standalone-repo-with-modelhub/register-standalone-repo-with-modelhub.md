<!-- modelscope-docs: Example of Registering a Standalone Repository with ModelHub | contribute/external-component/register-standalone-repo-with-modelhub/register-standalone-repo-with-modelhub_EN.md -->

# Why Use a Standalone Repository

ModelScope is a community in China that provides open-source AI models and services, with its SDK offering convenient inference capabilities. Many model contributors want users to easily invoke their models through the ModelScope SDK, enabling them to showcase demos and provide quick user experiences. However, integrating many models into the ModelScope SDK can be time-consuming, or some models are still under rapid iteration, making it inconvenient to repeatedly merge them into ModelScope.

# What is a Standalone Repository

A standalone repository addresses this need. It essentially upgrades a complete code hosting platform by providing unified calling interfaces and demo presentation capabilities. ModelScope's standalone repository feature allows code to be hosted externally while still enabling the SDK to utilize external models.

# Example: Registering OFASys with ModelHub
Below is the workflow for model contributors to integrate their models as standalone repositories with ModelScope:

## 1. Preparation
Please prepare your development and testing environment according to the [Environment Setup Documentation](./tutorial/quick-start/environment-setup.md). You can install only the ModelScope core framework:

```shell script
pip install modelscope
```

After successful installation, you can use the `modelscope` command to perform common operations such as model upload, download, and template file creation. Use the following command to verify the installation:

```shell script
modelscope --help
```

## 2. Determine Standalone Repository Code Location
After completing your model project development, you typically use GitHub for hosting and maintenance. Using the [OFASys](https://github.com/OFA-Sys/OFASys) project as an example, we'll demonstrate how to quickly integrate your project into the ModelScope platform using ModelScope.

Clone the project to your local development environment (where ModelScope is properly installed) and initialize the project runtime environment using the project's built-in `setup.py` or `requirements.txt` to ensure OFASys runs correctly:

```shell script
git clone https://github.com/OFA-Sys/OFASys.git
cd OFASys
python setup.py develop
```

After environment setup, you can verify that the integrated model works correctly using a quickstart approach, such as for Image Captioning tasks:

```shell script
from ofasys import OFASys
model = OFASys.from_pretrained('multitask.pt')

instruction = '[IMAGE:img] what does the image describe?  -> [TEXT:cap]'
data = {'img': "./COCO_val2014_000000222628.jpg"}
output = model.inference(instruction, data=data)
print(output.text)
# "a man and woman sitting in front of a laptop computer"
```

## 3. Implement Standalone Repository Integration with ModelScope
### 3.1 Create Model Template Files Using ModelScope Pipeline Command
First, navigate to the project's main module directory and use the ModelScope command to create a standalone repository development template. The required parameter `task_name` specifies your custom model's task type name:

```shell script
# modelscope pipeline -h to view parameter descriptions
cd ofasys
modelscope pipeline -act create --task_name my-ofasys-task --configuration_path /tmp/snapdown/
```

This will generate an executable file named `ms_wrapper.py` in the current directory. Next, implement model initialization and integration in the key methods of the template file as shown below:

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
        # Note: self.model_dir is the local file path where ModelScope-hosted models are downloaded
        # It's typically stored together with configuration.json
        # Here, self.model_dir can default to /tmp/snapdown/
        model = OFASys.from_pretrained(os.path.join(self.model_dir, ModelFile.TORCH_MODEL_BIN_FILE))
        return model.cuda(0)
```

### 3.2 Write Unit Tests and Verify Functionality
After implementing the `init_model` method for model initialization, you can execute the file using the provided `__main__` approach to ensure correctness. Add the following code:

Note: Model files have already been saved in a local temporary folder.

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

Run the Python file directly to check the output results. A `configuration.json` file will be generated in the `/tmp/snapdown/` directory (note: you can modify the output save path in the Python script):

```shell script
python ms_wrapper.py
```

The model will return the same results as when executed in the original repository, and the `/tmp/snapdown/` directory will now contain `pytorch_model.bin` and `configuration.json` files.

### 3.3 Edit the configuration.json File to Add allow_remote: true Field
Add the `allow_remote: true` field to support registering custom components:

Note: When model initialization parameters need to be passed externally, you can directly configure the corresponding key values under the `model` field.

```json
    {
      "framework": "pytorch",
      "task": "my-ofasys-task",
      "model": {"type": "my-custom-model"},
      "pipeline": {"type": "my-custom-pipeline"},
      "allow_remote": true
    }
```

### 3.4 Use ModelScope ModelCard Command to Host Models on ModelScope Platform
Use the following command to quickly integrate, create, and upload your model to the ModelScope platform. First, you must obtain an [SDK token](./tutorial/models/modelscope-hub-usage-documentation.md), i.e., `ACCESS_TOKEN`.

Additionally, `gid` represents the organization name; if not specified, it defaults to `damo`. Other parameters can be omitted with default values:

```shell script
modelscope modelcard -tk ***** -act upload -gid damo -mid ofasys_multimodal_multitask_pretrain_base_en -ch OFASys Multimodal Multitask Pretrained Model - English - General Domain - Base -md /tmp/snapdown/
```

The model will return the platform URL and corresponding Git address after creation, along with a `README.md` file for the model. You can first check if it meets your display expectations.

## 4. Write Model Documentation
Since the default uploaded model doesn't include a complete `README.md` document, you can reference the model card writing requirements to fill in and improve the content. You can then continuously use the `modelscope modelcard -act upload` command for updates and maintenance.

The final complete example can be found at [OFASys](https://www.modelscope.ai/models/damo/ofasys_multimodal_multitask_pretrain_base_en/summary).

## 5. Pipeline Commands on the Platform
After completing the model inference capability integration above, you can use the unified access interface without user awareness:

```python
from modelscope.pipelines import pipeline
pipe = pipeline('my-ofasys-task', model="damo/ofasys_multimodal_multitask_pretrain_base_en", model_revision='v1.0.0')
```

Through these steps, model contributors have successfully integrated their model's inference capabilities into the ModelScope SDK, enjoying the advantages and convenience of ModelScope community's model demo features.