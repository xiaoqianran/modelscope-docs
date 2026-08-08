<!-- modelscope-docs: Preparation | contribute/code-based-integration/prep/prep_EN.md -->

# Set up the environment and familiarize yourself with existing models

- Please prepare your development and testing environment according to the [Environment Setup Guide](../../quick-start/environment-setup.md).
- If there are similar models (in terms of model architecture, training methodology, or task type) in ModelScope, we recommend reading the source code of those models, paying particular attention to the model registration method, preprocessor implementation, pipeline implementation, and training process.
- Visit the [ModelScope official website](www.modelscope.ai) to find the corresponding model, run the sample code from the ModelCard once, and briefly review the configuration.json file to understand its settings.

Developers can also refer to the check-in history on ModelScope's GitHub repository to find examples of how different models were integrated. For instance, here's a [commit example](https://github.com/modelscope/modelscope/commit/5343c899fbaac1f33bdb208c8e99944af962ca7a) of an existing model integration. Developers are free to choose commit samples from their respective domain models from GitHub's commit history as references.


## Install ModelScope from source code
You can install ModelScope by downloading the source code from [GitHub](https://github.com/modelscope/modelscope).

You can directly clone the ModelScope source code to your local machine:

```shell
git clone git@github.com:modelscope/modelscope.git
cd modelscope
git fetch origin master
git checkout master

```
### Install domain-specific model dependencies from source

To experience only `multi-modal` domain models, run the following command to install dependencies:
```shell
pip install ".[multi-modal]"
```

To experience only `NLP` domain models, run the following command to install dependencies:
```shell
pip install ".[nlp]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

If you're using a miniconda environment, you need to install setuptools_scm beforehand.

To experience only `CV` domain models, run the following command to install dependencies:
```shell
pip install ".[cv]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

Some CV models currently use mmcv 1.7.0, which can be installed as follows:
```shell
# Currently only supports python3.10, torch versions 2.1.0 and 2.1.1, and cuda versions 11.8.0, 12.1.0
# Corresponding versions: 1.7.0+torch2.1.1cu121, 1.7.0+torch2.1.0cu121, 1.7.0+torch2.1.1cu118, 1.7.0+torch2.1.0cu118
pip install mmcv_full=='1.7.0+torch2.1.1cu121' -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

To experience only `audio` domain models, run the following command:
```shell
pip install ".[audio]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

To experience only `science` domain models, run the following command:
```shell
pip install ".[science]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

If you want to experience models from all domains, run the following command:
```shell
pip install "modelscope[audio,cv,nlp,multi-modal,science]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```

** Note: A very small number of models only support TensorFlow 1.15.5 on Linux environments **

## Key considerations to keep in mind

1. Understand the **operating mechanism** of ModelScope Library. You can refer to the [Brief Introduction to ModelScope Mechanism](../../ModelScope%20Library%20Tutorial/Detailed%20Tutorial/Library%20Framework%20Mechanism.md). Users unfamiliar with ModelScope configuration file formats can check [Configuration Details](../../ModelScope%20Library%20Tutorial/Detailed%20Tutorial/Configuration%20Details.md).
2. Understand the **computing framework** (PyTorch, TensorFlow, etc.) of the model to be integrated, and whether reusable Pipelines and Preprocessors for this model can be found in ModelScope.
3. Understand the **complexity** of the model to be integrated. For basic tasks (such as text classification, image object detection) with relatively standard models, you can copy and paste existing similar code. Otherwise, contact ModelScope developers to align on the basic approach to avoid taking wrong turns.
4. Understand the **modularity** of the model to be integrated. If the model has good modularity, we recommend reusing existing backbones or registering new backbones to the backbone registry (the head component can optionally be integrated into the head registry). If the model has poor modularity and modularization is difficult, the entire model can be integrated directly.
5. Understand the **domain** of the model to be integrated. ModelScope models are categorized into five domains: audio, video and image, multi-modal, natural language, and science. While the overall integration requirements are similar across domains, there are slight differences in the integration approach for each domain, which we will introduce separately in the following steps.