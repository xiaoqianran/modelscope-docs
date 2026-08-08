<!-- modelscope-docs: Model Hub Introduction | models/intro/intro_EN.md -->

This article introduces the features and quick start guide of ModelScope's Model Hub.
# About ModelScope's Model Hub
ModelScope's Model Hub is a place to share machine learning models, demos, datasets, and data metrics. You can easily create and manage your own model repository, using either the web interface or development environment to conveniently upload and download related model files, and obtain useful model and dataset metadata from the Model Hub.

## Prerequisites

### Terminology
- **Model**: Refers to a specific model instance, including the model network architecture and corresponding parameters. The ModelScope platform provides rich model information for users to experience and use.

- **Model Hub**: Refers to the model service that stores, versions, and manages models. Models uploaded and shared by users are stored in ModelScope's Model Hub. Users can also create their own model repositories in the Model Hub and use the platform's provided model management features for model administration.

### Model Visibility Settings
When creating a model on ModelScope, you can set the model's visibility through the "Public/Private" attribute. Based on the creator's configured visibility setting, models can be categorized into three types:
- **Public models**: Visible and downloadable by all community members.
- **Private models**: Only visible and downloadable by organization members or the model owner.
- **Gated models**: Any user can request access by submitting an application according to requirements, and upon approval by the model owner, gain visibility and download permissions.

## Downloading and Using Models from the Model Hub
Models on the Model Hub are stored and version-managed through Git. Users can download individual files or all related files of an entire model. Through the model ID, users can use the local SDK to download and load models from the Model Hub. ModelScope's SDK automatically caches locally downloaded model files, so they don't need to be re-downloaded when loading the same files again.

For specific methods of downloading models, please refer to the [Model Download](./model-download.md) documentation.

## Creating Your Own Model Repository
To create a model, you need a ModelScope account. If you don't have an account yet, please register for a new one.

You can create a model repository in two ways.

### 1. Creating a Model Repository via ModelScope's Web Interface

After registering and logging in, a "Create" button will appear to the left of your avatar. Click it to create a model or dataset. Click "Create Model" and fill in the basic information on the model page to create your model repository.

Using this method involves two steps:

#### Step 1. Fill in Basic Information

Basic information includes your model's English name, Chinese name, owner, license type, visibility setting, and model description.

- The license type determines which open-source protocol your model follows.
- The visibility setting determines whether your model can be discovered and viewed by other users. If set as private, other users cannot view it—only you can. You can also modify the permission settings on the configuration page after creation.
- We recommend describing your model's features and application scenarios in the model description, which will be displayed on the model list page to facilitate user search and discovery.

![image.png](./_resources/1659446858368-87839527-4ebd-4062-b2f4-0c4dd835cda6.png)

#### Step 2. Add README Documentation
If you already have a README document, you can upload it directly here. If you don't have a README document, the system will automatically create one for you.

To make your model introduction easier to understand and discover, we recommend writing according to the model card specifications. For details, please see [How to Write Effective Model Cards](../contributor-guide/model-integration/model-integration-help/writing-comprehensive-model-cards.md).

![image.png](./_resources/1659447304275-027198bb-ca6e-4b66-8f20-7b0f26aaa4bb.png)

Click "Create Model," and the system will parse your uploaded README.md file and display it on the model introduction page.

If you don't have a README document, you can find README.md in your model files and click "Edit" to edit it online.

![image.png](./_resources/179AB7D9-5EB1-4f46-8F40-95E9BF99DFD8.png)

Model card editing consists of YAML and Markdown sections. The system parses the corresponding fields and model tags by analyzing the YAML document.

![image.png](./_resources/1659447515576-7ccbc093-0857-42d7-b0c7-8491845b1a39.png)

After completion, the platform will assign you a storage address as shown below:
![image.png](./_resources/1659447862505-5c704ffa-4a90-469a-aedd-e3c1a8fcb52f.png)
You can add files to this model repository via the web interface or Git, or upload related model files through the web interface.

After creating your model, you can upload your model files. For details, please refer to the [Model Upload](./model-upload.md) documentation.

### 2. Creating a Model Repository Using the SDK

Assume your username is `user` and your desired model English name is `my-test-model`.

> You can obtain your SDK access token (SDK_TOKEN) from [Account Settings -> Access Tokens](https://modelscope.ai/my/myaccesstoken).

```python
from modelscope.hub.constants import Licenses, ModelVisibility
from modelscope.hub.api import HubApi

api = HubApi()
api.login(access_token="YOUR_MODELSCOPE_SDK_TOKEN")

username = 'user'
model_name = 'my-test-model'
model_id = f"{username}/{model_name}"

api.create_model(
    model_id,
    visibility=ModelVisibility.PUBLIC,
    license=Licenses.APACHE_V2,
    chinese_name="My Test Model"
)
```

**Parameter Description**

|  **Field Name**     |  **Required**  |  **Type**   | **Description**                 |
| ------------------- |  :---------: | :----------: |------------------------|
|  model_id           |  Yes        |  str       | Model ID                   |
|  visibility         |  No        |  int       | Model visibility: 1-private, 5-public. Default is 5 if not specified |
|  license            |  No        |  str       | Model license. Default is Apache-2.0 if not specified |
|  chinese_name       |  No        |  str       | Model Chinese name. Default is None               |

For more parameters, please refer to the interface documentation in the open-source code.

## How Contributors Configure Gated Models

### Default Behavior
When a model is set as a gated model, **by default, users viewing the model will be required to accept the model download agreement and share their contact information (email and username) by clicking the "Request Download" button**. You can view application information on the model settings page and approve or reject applications.

### Automatic Approval
You can also enable the "Automatic Approval" toggle, which immediately grants model download permissions to requesting users after they click the request download button, without waiting for model owner confirmation.

### Customizing User Information Collection
If you want to collect additional user information, you can configure a form in your `README.md`:
- `extra_gate_fields`: Add form fields by adding key-value pairs, where the field name serves as the "form item" title, and the field value can be either `text` (text input) or `checkbox` (checkbox) to declare the form item type.
- `extra_gated_prompt`: Additional form information. You can configure a link for users to view more details, specifying the link display text with the `description` field and the redirect URL with the `link` field.
- `extra_gated_licence`: Configures a custom agreement acceptance component for download requests. You can configure an agreement link for users to review, specifying the agreement text title with the `description` field and the redirect URL with the `link` field.

Below is an example of a custom application form, where "Phone" and "Email" are required fields. Additional information collection fields can be extended as needed.

  ```
  extra-gated:
    extra_gated_fields:
      Phone: text
      Email: text
      Agreement: checkbox
    extra_gated_prompt:
      description: Additional Information
      link: www.modelscope.ai
    extra_gated_licence:
      name: Accept Agreement Terms
      link: www.modelscope.ai
  ```

  Note: Phone and Email are fixed fields; please do not modify them.

  After configuration, the user's view of the application form will appear as shown below:

  ![image](https://img.alicdn.com/imgextra/i3/O1CN01hexl9m1qwzQnUdsXR_!!6000000005561-0-tps-2088-758.jpg)

# Models in the ModelScope Community
ModelScope is an open-source and open AI community platform. We support and encourage more high-quality models to join the ModelScope community. As one of the initiators and contributors of the ModelScope community, Tongyi Lab has taken the lead in contributing numerous high-quality SOTA models. We also continue to welcome more partners to join, and community models are continuously being updated. If you have models you'd like to share and discuss, you're welcome to publish them through the community. If you have further collaboration intentions, please [contact us](../contact-us/contact-us.md)!

- [Model Download](./model-download.md)
- [Model Upload](./model-upload.md)
- [Model Inference](../library-tutorials/model-inference-pipeline.md)