<!-- modelscope-docs: Installation | model-evaluation/get-started/installation/installation_EN.md -->

## Method 1. Install using pip
We recommend using conda to manage your environment and pip to install dependencies, allowing you to use the latest evalscope PyPI package.

1. Create a conda environment (optional)
```shell
# Python 3.10 is recommended
conda create -n evalscope python=3.10

# Activate the conda environment
conda activate evalscope
```

2. Install dependencies using pip
```shell
pip install evalscope
```

3. Install additional dependencies (optional)
  - To use model service inference stress testing functionality, install the perf dependency:
    ```shell
    pip install 'evalscope[perf]'
    ```
  - To use visualization features, install the app dependency:
    ```shell
    pip install 'evalscope[app]'
    ```
  - To use other evaluation backends, install OpenCompass, VLMEvalKit, or RAGEval as needed:
    ```shell
    pip install 'evalscope[opencompass]'
    pip install 'evalscope[vlmeval]'
    pip install 'evalscope[rag]'
    ```
  - Install all dependencies:
    ```shell
    pip install 'evalscope[all]'
    ```

> [!NOTE]
> Due to the project being renamed to `evalscope`, for versions `v0.4.3` or earlier, you can use the following installation:
> ```shell
>  pip install llmuses<=0.4.3
> ```
> Import related dependencies using `llmuses`:
> ``` python
> from llmuses import ...
> ```

## Method 2. Install from source code
Installing from source code allows you to use the latest code and facilitates secondary development and debugging.

1. Download the source code
```shell
git clone https://github.com/modelscope/evalscope.git
```

2. Install dependencies
```shell
cd evalscope/

pip install -e .
```

3. Install additional dependencies
- To use model service inference stress testing functionality, install the perf dependency:
   ```shell
   pip install '.[perf]'
   ```
 - To use visualization features, install the app dependency:
   ```shell
   pip install '.[app]'
   ```
 - To use other evaluation backends, install OpenCompass, VLMEvalKit, or RAGEval as needed:
   ```shell
   pip install '.[opencompass]'
   pip install '.[vlmeval]'
   pip install '.[rag]'
   ```
 - Install all dependencies:
   ```shell
   pip install '.[all]'
   ```


## Docker Images

You can view ModelScope's official Docker images, which include the EvalScope library. Refer to [here](https://modelscope.cn/docs/intro/environment-setup#%E6%9C%80%E6%96%B0%E9%95%9C%E5%83%8F)