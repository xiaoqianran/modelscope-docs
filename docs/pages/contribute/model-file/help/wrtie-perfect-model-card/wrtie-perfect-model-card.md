<!-- modelscope-docs: Writing a Perfect Model Card | contribute/model-file/help/wrtie-perfect-model-card/wrtie-perfect-model-card_EN.md -->

## Model Card Writing

The Model Card (i.e., README.md) is a crucial way for ModelScope users—the model consumers—to understand your model. Beyond providing essential metadata about the model, its content is also used to render the model's landing page on the ModelScope website. Therefore, besides the necessary binaries and configuration files required to load the model, the README.md file plays a vital role in ensuring your model can be properly used on ModelScope. Before your model is officially accepted by ModelScope, please ensure that the README.md file is thoroughly completed according to the [specifications and examples](../how-to-write-a-useful-model-card).

A well-crafted model card helps users better understand your model and enhances its visibility, searchability, and readability. Below are several official model card examples recommended for reference:

- https://www.modelscope.ai/models/damo/ofa_image-caption_coco_large_en/summary

To ensure model quality across the platform, we have implemented a file review mechanism for all contributor-submitted models. Currently, this review mechanism checks for the following conditions, and if any one is met, the model will be marked as pre-release status:

1. README contains fewer than 200 characters or uses the default README template.
2. No files other than .gitattributes, README.md, and config.json/configuration.json have been uploaded.
3. The English name contains **only "test"**.
4. The Chinese name contains **only "test"** or **only "测试"**.

If you have already uploaded your model files to the hub and your model meets any of the above conditions, we will automatically mark your model as **pre-release (preview) status**. In pre-release status, **the resource will not be displayed on listing pages or searchable**. We encourage more developers to share models within the ModelScope community, and we also hope to work together with developers to improve model quality.

#### **Organization of Images/Tables in README (Model Card)**

Markdown files support image insertion. If you wish to display images in your model card, we recommend uploading all image files to a `description` folder within your repository. A simple organizational structure example is as follows:

```
├── README.md
├── configuration.json
├── description
│   └── model_image.jpg <--- image that can be displayed on model card
└── pytorch_model.pt
```

Then, simply add the appropriate reference in the relevant location within your README.md file:

```
![Model Image](description/model_image.jpg)
```

For inserting tables, formulas, code segments, etc., use the corresponding Markdown syntax directly.

Below are the common pieces of information that should be included in a Model Card.

# <Model Name> Introduction

Introduce basic information about the model.

## Model Description
Provide a model description, including model architecture, training datasets used, applicable scenarios, and other relevant details.

## Intended Model Usage and Scope
Describe the target usage scenarios for the model.

### How to Use
Explain how to use the model, including model inference procedures and other relevant information. We encourage model providers to include comprehensive examples and code snippets demonstrating model usage. For models requiring complex runtime environment setup, detailed instructions on configuring the model's runtime environment should also be provided here.

If the model supports fine-tuning functionality, this section should also include information about the required dataset format for fine-tuning preparation.

#### Code Examples
Provide code blocks.

### Model Limitations and Potential Biases
Describe the scenarios where the model performs well, as well as scenarios where it may have limitations. Also discuss potential biases that may have been introduced during model construction and training due to factors such as training data and training methodologies.

## Training Data Introduction
Explain how the training data was acquired, organized, and formatted according to the model's requirements.

## Model Training Process
Describe how the model was specifically trained.

### Preprocessing

### Training

## Data Evaluation and Results
Provide performance evaluations of the model on different datasets, including how the evaluation data was obtained. Evaluation results can be presented through various methods such as tables and graphs.

### Related Papers and Citation Information
If your model has associated published papers or is based on certain research papers, provide references in BibTeX format here.

[
](https://test.modelscope.ai/#/models/damo/ofa_image-caption_coco_large_en/)