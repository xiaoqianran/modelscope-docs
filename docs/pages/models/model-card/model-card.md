<!-- modelscope-docs: Model Card | models/model-card/model-card_EN.md -->

This article introduces the definition, editing guidelines, usage methods, and management instructions for model cards.

# Model Card

Model cards are a key source of information for community users to learn about models. They are primarily maintained through the README.md file in the model repository. A model card consists of two main parts: **YAML metadata** at the beginning and **Markdown body content**, serving as a medium for community users to quickly understand, use, and share models.

A comprehensive model card can include, but is not limited to, the following content:

*   **Model name and description**. Introduce basic information, characteristics, and architecture of the model.

*   **Intended usage and applicable scope**. Describe the application scenarios suitable for this model to help users understand its purpose.

*   **How to use**. Provide simple examples showing users how to use the model, including the framework used, runtime environment requirements, or data formats for model fine-tuning. Code examples are highly recommended for better illustration.

*   **Training data**. Describe the training datasets used or data format requirements.

*   **Training process**. Explain how the model was trained, including preprocessing methods and training parameters used.

*   **Evaluation data and results**. Present the model's performance and evaluation metrics.


For detailed content, please refer to the **Model Card Body Content** section below.

To help community users better understand, use, and discuss open-source models in the community, we strongly recommend that model contributors follow the writing guidelines to complete their model cards. We also encourage all community users to actively participate in building the open-source model ecosystem. You can provide suggestions to model owners through the discussion section on model pages, or directly modify, supplement, and improve model card content by submitting pull requests.

# Model Card Metadata

Model card metadata is maintained in the YAML section at the beginning of the README.md file, separated from the Markdown body content by `---`. The metadata is primarily used to describe basic fields related to the model, including but not limited to: license, language, tasks, frameworks, base_model, new_version, metrics, datasets, and custom tags.

In ModelScope, metadata is used to improve model discoverability and usability. For example, it displays the model's open-source license, enables model filtering on search pages, shows associated datasets on model detail pages, and displays fine-tuning lineage on model detail pages.

## Adding Card Metadata

The community provides two different ways to maintain card metadata:

*   Using the metadata configuration interface

*   Directly editing the YAML header in the README.md file


### Quick Addition Using Configuration Interface

You can navigate to "Model Files - README.md File - Edit" to enter edit mode and use our provided configuration interface to quickly and conveniently add important metadata. To add other metadata fields, you can directly add or edit them in the YAML header of the file.

![image.png](./_resources/模型卡片元数据配置UI.png)

### Editing YAML Header in File

You can also directly edit metadata using the YAML header in the README.md file. If the original file doesn't have a YAML header, you can add two paired `---` lines to enclose the metadata section and complete the YAML header editing.

Detailed metadata field descriptions and examples can be found in the following example:

```yaml
---
license: Apache License 2.0 # Open-source license type, such as Apache License 2.0, GPL-2.0, GPL-3.0, MIT, etc.
tasks:
  - image-classification # Task type corresponding to the model pipeline. Users can also define custom task types.
frameworks: # Supported deep learning frameworks, such as "pytorch", "tensorflow", etc.
  - pytorch
  - tensorflow
language: # Supported language types
  - en
  - fr
  - cn
tags: # Users can define custom tags to facilitate search and categorization
  - transformer
  - Alibaba
  - customized-tag
datasets: Datasets associated with the model
  - OmniData/Pile-BookCorpus2
# Or datasets can also be described like this
datasets:
  train:
    - owner_name/trainset1
    - owner_name/trainset2
  test:
    - owner_name/testset
  evaluation:
    - owner_name/mydataset
metrics: # Metrics for evaluating model performance
  - accuracy
  - recall
  - precision
base_model: owner_name/model_name

# The following describes evaluation metrics and results for the model across different tasks
indexing:
  results:
    - task:
        name: Image Classification # Task name
      dataset:
        name: mydataset1 # Dataset name
        type: images # Dataset type (optional)
        args: default # Other parameters (optional)
      metrics:
        - type: accuracy
          value: 0.8 # Accuracy on mydataset1
          description: true positive rate on data xxx
          args: default
        - type: recall
          value: 0.05 # Recall on mydataset1
          description: recall on data xxx
          args: default
    - task:
        name: Text Classification # Task name
      dataset:
        name: mydataset2 # Dataset name
        type: text # Dataset type (optional)
        args: default # Other parameters (optional)
      metrics:
        - type: precision
          value: 0.7 # Precision on mydataset2
          description: precision for classification on data xxx
          args: default
domain:
  - multi-modal # Model domain. Includes "cv", "nlp", "audio", "multi-modal", etc. Users can also define custom domains.
---
```
For the `tasks` field, detailed supported task types can be found in the [Task Types List](../Library与命令行教程/各任务最佳实践/任务的介绍.md). You can add appropriate metadata to your model card as needed, or you can also define custom metadata field names.

## Metadata Visualization

In model cards, the following metadata fields indicate relationships between the model, related models, and datasets. Properly filling these fields will activate features like "Model Lineage" and "Version Update Notifications" on the model card detail page, helping users gain a more comprehensive and systematic understanding of the current model and its related models and datasets, while also improving the model's discoverability within the community.

|  **Field Name**  |  **Description**  |  **Example Value**  |
| --- | --- | --- |
|  base\_model  |  Base model: Model ID of the base model from which the current model is derived through certain methods.  |  The base model of `Qwen/Qwen2.5-7B-Instruct` is `Qwen/Qwen2.5-7B`. Multiple values can be provided in list format.  |
|  base\_model\_relation  |  Lineage type: Enumerated value, one of "adapter", "merge", "quantized", "finetune". Can be directly specified in this field or automatically determined by the platform.  |  `adapter`  |
|  new\_version  |  New version of the current model series  |  The new version of `Qwen/Qwen2-72B-Instruct` is `Qwen/Qwen2.5-72B-Instruct`  |
|  datasets  |  Related datasets: Dataset IDs of datasets used for training, evaluation, etc. of the current model  |  The related dataset for model `BAAI/Aquila-135M` is `BAAI/Infinity-Instruct`  |

### Model Lineage

For fine-tuned models, adapter models, quantized versions of base models, or new models created by merging multiple community models, you can configure the base model (base_model) in the model card metadata. When you configure a valid model ID as the base model, the model card page will display the model lineage for the current model.

![image.png](./_resources/模型系谱.png)

The model lineage is derived step by step from the current model, base model, and the lineage relationship between them. You can easily discover more base models that produced the current model or new models derived from the current model through the model lineage.

The lineage relationship between the current model and base model displayed in the model lineage can be automatically inferred based on certain rules, or it can be explicitly specified in the "lineage relationship (base_model_relation)" field in the model card metadata. Its value must be one of `"adapter", "merge", "quantized", "finetune"`.

### Version Update Notification

When a newer version of the same model series exists on ModelScope, you can complete the new version association by specifying the `new_version` field value as the corresponding model ID in the metadata. After configuration, the model card page will display a notification: "A new version of this model series has been released. Click to go to the latest model."

For example, if `Qwen/Qwen2-72B-Instruct` has a new version `Qwen/Qwen2.5-72B-Instruct`, you can configure the following in the model card metadata of `Qwen/Qwen2-72B-Instruct`:

```yaml
new_version: Qwen/Qwen2.5-72B-Instruct
```

### Related Datasets

When the datasets used by the model have already been uploaded to the ModelScope community, you can complete the association by specifying the `datasets` field as the corresponding dataset ID in the metadata. After configuration, the platform will automatically associate the model and dataset, and provide quick mutual navigation links in the "Related Datasets" section of the model card page and the "Related Models" section of the dataset card page.

# Model Card Body Content

This section provides a recommended model card body template. You can refer to this template and flexibly organize the body content as needed.

````markdown
<!--- Please provide the following model card description in Chinese (except for code, bibtex, etc.) --->

# <Model Name> Introduction
Introduce basic information about the model.

## Model Description

Provide a model description, including model architecture, training datasets used, applicable scenarios, etc. You can also link to the model's source, including code repositories, papers, or demos.

## Intended Usage and Applicable Scope

Describe the target usage scenarios for the model.

### How to Use

Explain how to use the model, including model inference and fine-tuning information. We hope model providers can provide detailed examples and code snippets to illustrate model usage methods. For models requiring complex runtime environment configuration, please also provide detailed instructions on how to configure the model runtime environment here.

If the model supports fine-tuning, please also describe the required dataset format and requirements for fine-tuning in this section.

#### Code Examples
<!--- Please provide code examples for both model inference and model fine-tuning --->
```python
import cv2
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks
from modelscope.pipelines.outputs import OutputKeys

img_matting = pipeline(Tasks.portrait_matting,model='damo/cv_unet_image-matting')
result = img_matting('test.png')
cv2.imwrite('result.png', result[OutputKeys.OUTPUT_IMG])
```

### Model Limitations and Potential Biases
Describe the scenarios where the model is applicable, as well as scenarios where it may have limitations. Also describe potential biases that may have been introduced during model construction and training due to factors such as training data and training methods.

## Model Training
Describe how the model was specifically trained.

### Training Data Introduction
Describe how the training data was obtained, organized, and formatted according to the model's requirements.

### Preprocessing
Describe how the training data was preprocessed.

### Training
Describe hardware requirements and environment, hyperparameter settings, training steps and procedures, and provide necessary training code blocks.

## Evaluation Data and Results
Provide performance evaluations of the model on different datasets, including how the evaluation data was obtained. Evaluation results can be presented through various methods such as tables and images.


### Related Papers and Citation Information
If this model has related published papers or is based on certain papers, please provide references in BibTeX format here.

````

For specific examples of model card body content, please refer to the README.md file of: [iic/cv\_swin-b\_image-instance-segmentation\_coco](https://modelscope.ai/models/iic/cv_swin-b_image-instance-segmentation_coco/summary).


# Model Online Demo Service

In addition to the Markdown information on the model card, model cards can also provide visual online demos for users to quickly test model performance.

![image.png](./_resources/1656470804417-7bc7c5fc-c0bc-4a95-b6b5-b64adcec70fc.png)

When editing the README.md file, you can find the "DEMO Configuration" entry to select a community-supported online DEMO template for your model. For details, please see the [DEMO Center](https://modelscope.ai/tools/demo-gallery).

It's worth noting that the model online demo provides default examples for users to experience model services without logging in. If you need to customize input test content, you'll need to log in first. All content generated by the current demo service is produced by artificial intelligence models. We make no guarantees regarding the accuracy, completeness, or functionality of the generated content, and the generated content does not represent our attitudes or views. ModelScope encourages green and friendly product experiences. Any inappropriate text, images, or other content in inputs and outputs do not represent the platform's stance, and the platform will prohibit such content. Thank you for your understanding!