<!-- modelscope-docs: Pre-release and Status Appeals | contribute/pre-release/pre-release_EN.md -->

This article introduces important fields in ModelScope releases and their impact.

# Definition of Pre-release Status

To ensure the quality of models and datasets on the platform, we have implemented a file review mechanism for all contributors' models or datasets. Currently, this review mechanism checks the following conditions, and if any one is met, the model or dataset will be marked as pre-release status:

**Model Library**

1. README has fewer than 200 characters or uses the default README template.
2. No files uploaded other than .gitattributes, README.md, and config.json/configuration.json.
3. English name contains **only "test"**.
4. Chinese name contains **only "test"** or **only "测试"**.

**Datasets**
1. English name contains **only "test"**.
2. Chinese name contains **only "test"** or **only "测试"**.
3. Dataset contains only the following types of files:
    - README.md
    - dataset_infos.json
    - JSON file with the same name as the dataset or an empty Python file with the same name as the dataset. Note: If the Python file is not empty, it can exit pre-release status.

Once you have uploaded your files to the hub and your uploaded model or dataset does not meet any of the above conditions, we will automatically mark your model or dataset as **pre-release (preview) status**. In pre-release status, **the resource will not be displayed on listing pages or searchable**. We encourage more developers to share models and datasets within the ModelScope community, and we also hope to work together with developers to improve the quality of models and datasets.

# Fields That Don't Affect Publishing But Impact Usage

Some incorrectly filled fields will affect **search and information display** of models and datasets, but **will not trigger pre-release** status:

## YAML Files

### Tasks Information in YAML Header

Missing this information will cause your resource to be **unfindable when searching by task**. To **avoid reduced exposure**, please ensure this field is correctly filled.

### License Information in YAML Header:

1. Missing this information means the resource has no license, which **affects users' evaluation of the resource's usability**.

```yaml
tasks:
- text-generation
license: Apache License 2.0
```

## configuration.json File

### Framework Field and pipeline.type Field in configuration.json

If your **model needs to use ModelScope Library's Pipeline**, you need to correctly fill in these fields.

### Task Field and model.type Field in configuration.json

If your **model is not in HuggingFace format**, you need to correctly fill in these fields, otherwise the model may fail to load.

```json
{
  "framework": "pytorch", # pytorch, tensorflow, kaldi, etc.
  "task": "text-generation",
  "model": {
    "type": "bert"
  },
  "pipeline": {
    "type": "my-custom-generation-name"
  }
}
```

# How to Appeal
If you are concerned about your model or dataset being marked as pre-release status, you can email us (contact@modelscope.cn) or join our technical discussion group (DingTalk group number: 44837352) to contact our official staff.

You need to provide the following information:

- Model/Dataset Name: Provide the Chinese or English name of the pre-release model/dataset
- Provider: The identity that created the model - if created as an individual, provide the username; if created as an organization, provide the organization name
- Remarks: You can explain why you believe the pre-release status marking is unreasonable and provide any additional supplementary information