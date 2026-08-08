<!-- modelscope-docs: Model Integration Process | contribute/model-integration/model-integration_EN.md -->

# Model Integration Process

## 0. Become a ModelScope Contributor

First, the ModelScope community warmly welcomes everyone to participate, and we value every contribution. We welcome contributions of models, datasets, as well as answering questions and improving documentation.<br />Regardless of your chosen contribution method, we hope you will pay attention to and respect our [Open Source Code of Conduct](https://www.modelscope.cn/docs/%E5%BC%80%E6%BA%90%E8%A1%8C%E4%B8%BA%E5%87%86%E5%88%99).<br />Below are some preparations needed before contributing models.<br />Step one,<br />You need to choose whether to contribute as an individual community contributor or as an organizational contributor.<br />If you choose to contribute as an individual, you can contribute models after registering an account on ModelScope.<br />If you choose to contribute as an organization, and if your organization has not been created yet, please contact [contact@modelscope.cn](contact@modelscope.cn), and the ModelScope community team will help you create the organization and add your account as an organization member. If your organization already exists, we recommend contacting the organization administrator to add you as a member.<br />Step two,<br />You can choose the specific model integration approach based on the category and characteristics of the model you want to contribute.


## 1. Share Model Files to ModelHub

The prerequisite for sharing model files is that the accompanying model code already exists in the ModelScope Library. This includes:

- Task-specific model code and backbone code already existing in ModelScope across various domains

- Supported classic external models, such as GPT-Neo, GPT2, T5, Bloom, etc. from the transformers library

The basic process for sharing model files on ModelScope is as follows:

1. Register a user account, create a model repository, and upload files
2. The model automatically enters pre-release status awaiting publication
3. [Optional] Integrate with online demo experience via Demo-service

For the above steps, please refer to the [Model Creation and Upload Guide](./接入模型文件/模型的创建与文件上传.md), which will help you step-by-step with file uploading and management.

Note: For those integrating models originally based on third-party packages like transformers, during integration, all original model files need to be included, along with two additional files: configuration.json and README.md. Below is an example `configuration.json` for BERT integration.

```
{
    "framework": "pytorch",
    "task": "fill-mask",
    "model": {
        "type": "bert",
        "language": "zh"
    },
    "pipeline": {
        "type": "fill-mask"
    },
    "preprocessor": {
        "type": "fill-mask"
    }
}
```

## 2. Share Model Code to ModelScope

The basic process for sharing model code on ModelScope is as follows:

1. Prepare the environment and understand ModelScope's basic mechanisms
2. Create a branch and submit a PR (Pull Request)
3. Develop model, preprocessor, and Pipeline components and debug the inference workflow
4. Prepare local model files
5. Write test cases
6. Share model files to ModelHub (same as [Share Model Files to ModelHub] section above)
7. [Optional] Develop training workflow
8. [Optional] Develop export workflow
9. Add docstrings and push the PR

For the above steps, please refer to the [Share Model Code to ModelScope](贡献模型代码/准备工作.md) documentation, which will guide you step-by-step through the code sharing process.

## 3. Register External Components to ModelScope

For scenarios where you want to quickly leverage the ModelScope ecosystem and use modelscope SDK and modelhub components, we provide rapid integration solutions, including:

- For scenarios with only a few components, you can quickly wrap components through interfaces and register/manage them via modelhub
- For scenarios with many components, we support independent repositories from external sources, such as projects on PyPI, independently maintained GitHub projects, or newly created local projects

If you encounter issues during model integration, you can provide feedback through the following channels:

- Submit an issue to our GitHub community
- Join our DingTalk group (see: [ModelScope Community](../ModelScope社区/联系我们.md))
- Provide comments through PRs

## Appendix: Reference Documents

- [How to Write Effective Model Cards](./接入模型文件/模型接入帮助/撰写完善的模型卡片.md)
- [Model File Formats](./接入模型文件/模型接入帮助/模型文件格式.md)
- [Model Demo Integration Process](./接入模型文件/模型接入帮助/接入模型Demo/模型Demo接入流程.md)