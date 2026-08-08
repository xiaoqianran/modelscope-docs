<!-- modelscope-docs: Dataset Introduction | datasets/intro/intro_EN.md -->

This article provides an overview of datasets and DatasetHub, including related concepts and usage.

# What are Datasets and DatasetHub?

- **Dataset**: A collection of data that is easy to share and access, used for model training, testing, and validation. Datasets are typically presented in tabular format and can be of various types including text, images, audio, video, or multimodal data.

- **DatasetHub**: A centralized repository for managing datasets that supports model training and prediction. It provides easy access, management, and sharing of data.


# Creating a Dataset

## Prerequisites
You need to have a ModelScope account.

## Creation Steps
Please refer to the [Dataset Creation Guide](./creating-a-dataset.md) for detailed steps.


# Using Datasets

Data on DatasetHub is stored in public addresses or ModelScope's data repositories. Datasets use git for version management, allowing you to download individual files or entire datasets. With a namespace and dataset name, you can download data from DatasetHub and load it using the SDK. The next time you need the same files, they will be loaded from your cache without re-downloading.

You only need the following information to easily obtain datasets through code:
- **`dataset_name`** Dataset name
- **`namespace`** Namespace (default: `modelscope`)
- **`subset_name`** Subset name (default: `default`)
- **`version`** Dataset version (default: `master`)
- **`split`** Dataset split (default: `None`)

Here's an example of downloading and loading with a single line of code. Apart from the dataset name, other parameters can use default values:

```python
from modelscope import MsDataset
ds_dict = MsDataset.load('squad')
print(ds_dict['train'][0])

>>> {'id': '5733be284776f41900661182', 'title': 'University_of_Notre_Dame', 'context': 'Architecturally, the school has a Catholic character. Atop the Main Building\'s gold dome is a golden statue of the Virgin Mary. Immediately in front of the Main Building and facing it, is a copper statue of Christ with arms upraised with the legend "Venite Ad Me Omnes". Next to the Main Building is the Basilica of the Sacred Heart. Immediately behind the basilica is the Grotto, a Marian place of prayer and reflection. It is a replica of the grotto at Lourdes, France where the Virgin Mary reputedly appeared to Saint Bernadette Soubirous in 1858. At the end of the main drive (and in a direct line that connects through 3 statues and the Gold Dome), is a simple, modern stone statue of Mary.', 'question': 'To whom did the Virgin Mary allegedly appear in 1858 in Lourdes France?', 'answers': {'text': ['Saint Bernadette Soubirous'], 'answer_start': [515]}}
```

If you want to specify a different subset, you can specify `subset_name`:
```python
from modelscope import MsDataset
ds_dict = MsDataset.load('ceval-exam', subset_name='operating_system')
print(ds_dict['test'][0])

>>> {'id': 0, 'question': 'A set of rules used to determine string patterns is called ____.', 'A': 'String matching', 'B': 'Regular expressions', 'C': 'Filename matching', 'D': 'Filters', 'answer': '', 'explanation': ''}
```

If you want to specify a different organization to load the dataset, you can specify `namespace`:
```python
from modelscope import MsDataset
ds_dict = MsDataset.load('ceval-exam', namespace='opencompass', subset_name='computer_network')
print(ds_dict['test'][0])

>>> {'id': 0, 'question': 'The resources of computer networks mainly refer to ____.', 'A': 'Servers, routers, communication lines, and user computers', 'B': 'Computer operating systems, databases, and application software', 'C': 'Computer hardware, software, and data', 'D': 'Web servers, database servers, and file servers', 'answer': '', 'explanation': ''}
```


If you want to specify a non-default version, you can specify `version`:
```python
from modelscope import MsDataset
ds_dict = MsDataset.load('ceval-exam', subset_name='computer_network', version='v1')
print(ds_dict['test'][0])

>>> {'id': 0, 'question': 'The resources of computer networks mainly refer to ____.', 'A': 'Servers, routers, communication lines, and user computers', 'B': 'Computer operating systems, databases, and application software', 'C': 'Computer hardware, software, and data', 'D': 'Web servers, database servers, and file servers', 'answer': '', 'explanation': ''}
```


If you only want to load a specific split, you can specify `split`:
```python
from modelscope import MsDataset
ds = MsDataset.load('ceval-exam', subset_name='computer_network', split='dev')
print(ds[0])

>>> {'id': 0, 'question': 'Which of the following devices belongs to the resource subnet?', 'A': 'Computer software', 'B': 'Bridge', 'C': 'Switch', 'D': 'Router', 'answer': 'A', 'explanation': '1. First, the resource subnet refers to networks that provide shared resources, such as printers and file servers.\r\n2. Second, we need to understand the functions of the devices in the options. Bridges, switches, and routers primarily function to enable communication and data transmission between different networks, making them communication subnet devices. Computer software, however, can provide shared resource functionality.'}
```
# How Contributors Can Configure Application-Based Datasets

## Default Case
When a dataset is set as an application-based dataset, **by default, users viewing the dataset will be required to accept the dataset download agreement and share their contact information (email and username) by clicking the "Apply for Download" button**. You can view application information on the dataset settings page and approve or reject applications.

## Automatic Approval
You can also enable the "Automatic Approval" switch, which immediately grants dataset download permissions to applicants after they click the apply download button, without waiting for owner confirmation.

## Customizing Applicant Information Collection
If you want to collect more user information, you can configure a form via `README.md`:
- `extra_gate_fields`: Add new key-value pairs to add form fields, where the field name is the "form item" title, and the field value can be `text` (text box) or `checkbox` (checkbox) to declare the form field type.
- `extra_gated_prompt`: Additional form information. You can configure links for users to view here, specifying the link display text with the `description` field and the redirect URL with the `link` field.
- `extra_gated_licence`: Used to configure a custom agreement acceptance component for download applications. You can configure protocol links for users to view here, specifying the protocol text title with the `description` field and the redirect URL with the `link` field.

Here's an example of a custom application form, where "Phone" and "Email" are required fields, and additional information collection fields can be extended as needed.

  ```
  extra-gated:
    extra_gated_fields:
      Phone: text
      Email: text
      Agreement: checkbox
    extra_gated_prompt:
      description: Additional supplementary information
      link: www.modelscope.cn
    extra_gated_licence:
      name: Accept agreement terms
      link: www.modelscope.cn
  ```

  Note: Phone and Email are fixed fields; please do not modify them.

  After configuration, the applicant's view will appear as shown in the figure below:

![image.png](./_resources/restricted_dataset.png)

# Notes

- Dataset English names must be unique within the same organization account;
- Public visibility setting controls dataset access permissions:
   - When selecting a public dataset, it is visible to all users;
   - When selecting a non-public dataset, it is only visible within the current organization account;
- Dataset description
  - The dataset description is an important component of the dataset and contains crucial information including the dataset's source, purpose, format, etc.;

You can continue maintaining your dataset through the web interface or git commands. See [Dataset Download](./downloading-datasets.md) for details.