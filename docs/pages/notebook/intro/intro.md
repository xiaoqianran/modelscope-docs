<!-- modelscope-docs: Notebook Introduction | notebook/intro/intro_EN.md -->

This article provides a basic overview of ModelScope Notebook to help you quickly understand this feature.

ModelScope Notebook is a cloud-based machine learning development IDE tool that provides an interactive programming environment suitable for AI developers of different skill levels. Through collaboration with Alibaba Cloud [PAI-DSW](https://www.aliyun.com/activity/bigdata/pai/dsw) and Elastic Accelerated Computing Instances [EAIS](https://www.aliyun.com/product/ecs/eais), Notebook offers users out-of-the-box limited-time free computing resources, enabling seamless connection between ModelScope model development environments and diverse computing resources such as CPU/GPU.
![image.png](./_resources/notebook.png)

## Features
ModelScope Notebook is based on Jupyter Notebook and provides an out-of-the-box model development experience by combining cloud-based CPU/GPU computing instances. Additionally, Notebook also configures a [Web-IDE entry point](./通过Web-IDE使用VS-Code.md) to facilitate online development using VS-Code IDE. For official feature introductions of native Jupyter Notebook, please refer to the [official documentation](https://jupyter-notebook.readthedocs.io/en/stable/notebook.html). On this foundation, ModelScope's Notebook comes pre-installed with ModelScope model development packages and algorithm libraries, and supports custom installation of third-party libraries. Additionally, Notebooks based on different cloud computing resources have some different product features:

| **Feature** | **PAI-DSW Notebook** | **EAIS Notebook** |
|----------|------------------------|---------------------------|
| GPU Support | Yes | Yes |
| CPU Cores and Memory | 8 cores, 32GB | 8 cores, 32GB |
| Network Access | Restricted access to external networks like Hugging Face | Restricted access to external networks like GitHub, Hugging Face |
| Root Permissions | Default root account | Default root account |
| Persistent Storage | **/mnt/workspace/ directory** | Not available |

### Storage Description
- Free Notebook environments all provide a certain amount of storage space. Currently, Notebooks based on PAI-DSW instances provide **100GB** of free persistent storage, mounted under the default **/mnt/workspace** directory. For data that needs to be persistently saved, please ensure it is saved under /mnt/workspace/ before closing the instance. **Data placed in other paths will be automatically cleared after the instance is closed**.
- You can use the `du -sh /mnt/workspace` command to check your current free persistent storage usage and clean up unnecessary files promptly.
- The free storage provided by the platform is intended to facilitate developer usage and **does not provide SLA guarantees**. Please **do not store any sensitive private data or important data**, and always back up all data yourself to avoid loss. Additionally, if an account remains **inactive for a long time (more than 365 days)**, the platform may clear the corresponding account's persistent storage data.
- EAIS Notebook does not currently support persistent data storage.
- If you are using paid DSW or EAIS resources for Notebook, you can mount cloud storage resources according to the relevant cloud product documentation.

## Running Model Inference, Evaluation, and Other Examples in Notebook
When using models from ModelScope through ModelScope Notebook, all dependency environments are pre-installed and **ready to use directly**.

### Running Inference Pipeline
Taking Chinese word segmentation as an example, here's the basic usage of the pipeline function.

1. The pipeline function supports specifying a particular task name, loading the default model for that task, and creating the corresponding pipeline object.
Execute the following Python code:
```python
from modelscope.pipelines import pipeline
word_segmentation = pipeline('word-segmentation')
```

2. Input text
```python
input_str = '今天天气不错，适合出去游玩'
print(word_segmentation(input_str))
{'output': '今天 天气 不错 ， 适合 出去 游玩'}
```

3. Input multiple samples

The pipeline object also supports passing a list of multiple samples as input and returns a corresponding output list, where each element corresponds to the return result of the input sample.

```python
inputs = ['今天天气不错，适合出去游玩','这本书很好，建议你看看']
print(word_segmentation(inputs))
[{'output': '今天 天气 不错 ， 适合 出去 游玩'}, {'output': '这 本 书 很 好 ， 建议 你 看看'}]
```

### Loading Datasets
ModelScope provides a standard `MsDataset` interface for users to load data sources based on the ModelScope ecosystem. Below is a demonstration using the NLP domain afqmc (Ant Financial Question Matching Corpus) dataset:
```python
from modelscope.msdatasets import MsDataset
# Load training data
train_dataset = MsDataset.load('afqmc_small', split='train')
# Load evaluation data
eval_dataset = MsDataset.load('afqmc_small', split='validation')
```

### Data Preprocessing
In ModelScope, data preprocessing is strongly related to the model. Therefore, after specifying a model, the ModelScope framework automatically reads the preprocessor keyword from the configuration file in the corresponding model card and automatically instantiates the preprocessing.

```python
# Specify text classification model
model_id = 'damo/nlp_structbert_sentence-similarity_chinese-tiny'
```

### Training
First, configure the parameters needed for training:
```python
from modelscope.trainers import build_trainer

# Specify working directory
tmp_dir = "/tmp"

# Configure parameters
kwargs = dict(
        model=model_id,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        work_dir=tmp_dir)
```

Second, instantiate the trainer object based on the parameters:
```python
trainer = build_trainer(default_args=kwargs)
```

Finally, call the train interface for training:
```python
trainer.train()
```

Congratulations, you've completed a model training session 😀

### Evaluation
After training is complete, configure the evaluation dataset and directly call the evaluate function of the trainer object to complete model evaluation:
```python
# Directly call trainer.evaluate, you can pass the checkpoint generated during the training phase
# Or you can call without parameters to directly validate the model
metrics = trainer.evaluate(checkpoint_path=None)
print(metrics)
```

## Free Notebook Usage

The ModelScope platform provides each user with a certain amount of free initial computing resources to experience the complete workflow of model training, inference, and evaluation within Notebook.

### Resource Specifications
For each new user, Notebook's product partners provide the following free initial computing resources:

| **Partner Cloud Product** | **PAI-DSW** | **EAIS** |
|-----------|-------------------------------------|---------------------------------------------|
| CPU Environment | 8 cores, 32GB, long-term usage | 8 cores, 32GB, long-term usage |
| GPU Environment | 8 cores, 32GB RAM, 24GB VRAM, <br /> 36 hours free quota | 8 cores, 32GB RAM, 16GB VRAM, <br /> 64 hours free quota |
| Storage Space | See storage description above | See storage description above |
| Persistent Storage | **/mnt/workspace/ directory** | Not available |

### Obtaining Free Notebook Resources
ModelScope collaborates with Alibaba Cloud products to provide users with free Notebook CPU/GPU development environments. Using Notebook requires authorization to bind an Alibaba Cloud account to obtain free initial quotas. Follow these steps to obtain resources.<br />1. Before using Notebook, log in to your ModelScope account (register if you don't have one)<br />![image.png](./_resources/image7.png)

2. Bind your Alibaba Cloud account as prompted to receive free initial resources<br />![image.png](./_resources/image1.png)<br />![image.png](./_resources/image2.png)

3. Log in to your Alibaba Cloud account (register if you don't have one)<br />![image.png](./_resources/image3.png)

4. After logging in, authorize the binding and make sure to check **all options**, otherwise authorization will fail<br />![image.png](./_resources/image4.png)

5. After successful binding, you'll receive your free initial quota<br />![image.png](./_resources/image6.png)

6. After binding your Alibaba Cloud account, you won't need to bind again when using Notebook. Just ensure that the associated Alibaba Cloud account is logged in when using Notebook.

### Usage Restrictions

- The above free computing resources **belong to the user**, and users are responsible for the legal compliance of their resource usage. **Do not use computing resources for illegal operations**.
- The above free computing resources can only be used within ModelScope Notebook, with a maximum single instance runtime of no more than 10 hours.
- ModelScope Notebook prioritizes interactive computing. If your Notebook remains idle for more than **1 hour** without activity, it will automatically close due to timeout. If the instance is not running, it's recommended to manually close it to avoid consuming free quotas.
- If your free quota is exhausted or you have customized resource requirements, please go to the corresponding Alibaba Cloud product console to purchase the commercial version of Notebook services.
- The ModelScope community will launch more activities in the future to provide free GPU computing resources, so stay tuned.

## Handling Exhausted Free Resource Quotas

After your free GPU resource quota is exhausted, you can continue development in the CPU Notebook environment, local development, or paid development in the commercial version of Notebook. This article explains what to do after your free resource quota is exhausted.

### How to Know When Resources Are Exhausted
You can check your remaining free resource quota in the resource countdown area at the top right of **Personal Console > My Notebook**. The image shows a remaining quota of 16 hours.<br />![image.png](./_resources/image1.png)<br />

If your free resource quota is exhausted, you'll receive a prompt at the top right of **Personal Console > My Notebook**, and you won't be able to continue development in the GPU environment. If you're editing files in Notebook when resources are exhausted, no code execution operations will be supported, so save your edited files promptly.<br />![image.png](./_resources/image2.png)

### Actions After Free Resources Are Exhausted

#### Option 1: Switch to CPU Environment for Continued Development
You need to return to **Personal Console > My Notebook** and launch a **CPU environment instance**. In the CPU environment, you can continue to access and use the pynb files you created previously in the GPU instance, as well as data that was persistently stored according to the storage guidelines above.

#### Option 2: Export Files for Local Development
You can refer to the "Data Reading/Writing and File Transfer" documentation to export code, datasets, and model files for continued development in local IDEs such as Jupyter Notebook, PyCharm, or VSCode.

#### Option 3: Use the Commercial Version of Notebook with Payment
Before formally using the commercial version of Notebook for development, you can first open ModelScope Notebook to create a CPU environment instance and export your saved code, datasets, and model files.<br />You can find the commercial version entry for Notebook in **Personal Console > My Notebook**. Click to redirect to the Alibaba Cloud console login and complete the purchase of the commercial version instance according to the instructions.<br />![image.png](./_resources/image3.png)

### Creating PAI-DSW Paid Instances
The following describes how to purchase resources when PAI-DSW resources are exhausted.<br />Click the link from **Personal Console > My Notebook > PAI-DSW Notebook Commercial Version**, or click the following [link](https://pai.console.aliyun.com/?regionId=cn-hangzhou#/notebook-buy/buy?imgid=image-qg4mas1gt2rxi9gwma&from=outer) to access.

If you have already activated Alibaba Cloud's Machine Learning PAI products, you can directly navigate to the order purchase page after logging in. If you haven't activated the service yet, follow the PAI service page guidance to complete the activation and purchase of paid resources. Through PAI's cloud product service page, you can activate PAI products, create workspaces, create paid instances of different specifications in different regions, bind different cloud storage including NAS, and other operations. Additionally, your paid DSW instances can also select different pre-installed ModelScope official images for normal model development work.