<!-- modelscope-docs: Notebook Instance Creation and Management | notebook/instance-management/instance-management_EN.md -->

Before using Notebook, you need to create a Notebook instance. This article introduces how to create, open, and manage Notebook instances.

# Prerequisites
Before creating a Notebook instance, you need to log in to your **ModelScope account**. If you don't have a ModelScope account, you need to register first.

# Creating Instances

- You can create a new instance in **Personal Center > My Notebook**, and choose to create either a CPU instance or GPU instance according to your needs. The interface will display the remaining resource quota through a countdown timer (for details about the platform's complimentary free quota, please refer to the **Free Notebook Usage** section in the [Notebook Introduction](./Notebook介绍.md) documentation).

![image.png](./_resources/image8.png)

- You can also create a new instance from the **ModelScope model detail page**.

![image.png](./_resources/image9.png)<br>
If you haven't bound your Alibaba Cloud account yet, you won't be able to access free instance resources. Please complete the binding process as prompted before creating an instance.<br />
![image.png](./_resources/image10.png)<br>
If you have already completed the binding, when you open Notebook again through the model detail page, the platform's partnered Notebook products and their related environments will be displayed. Select the product and environment you need, then click the "Launch" button to create the corresponding instance.<br>
![image.png](./_resources/image11.png)<br>
The instance startup time is expected to be within 2 minutes, please wait patiently. After the instance starts successfully, click "View Notebook" to navigate to the corresponding Notebook product page. At this point, the environment already has the ModelScope official image built-in, so you can use it without reinstalling environment dependencies.

# Instance Status Management

- Running instances support reopening the Notebook interface and closing the instance.
   - Click **View Notebook** to open the running Notebook instance in a new tab.
   - After clicking **Close Instance**, the code execution processes in your Notebook will be terminated. The platform persists data stored in specific directories under certain instances. Please refer to the detailed explanation in [Notebook Introduction](Notebook介绍.md). Data not stored according to these guidelines **will be automatically cleared when the instance is closed**.

# Instance Interface Introduction

## Interface Components
After launching the instance environment from either the **model detail page** or **personal center**, you'll enter the Notebook instance interface. The Notebook instance interface mainly includes the following parts:

![image.png](./_resources/image12.png)

| **Functional Area Number** | **Description** |
| --- | --- |
| ① | Top menu bar. |
| ② | Left toolbar. |
| ③ | Tool content. |
| ④ | Main workspace. |

## Creating New Notebook Files
On the Launcher page, click different file options in the **main workspace** to create new files.

- If you want to develop code using Python 3 language in the IDE, click the red-boxed button below to create a new ipynb file.

![image.png](./_resources/image13.png)

- If you want to submit training tasks or perform dependency package management operations via CLI, click the red-boxed button below to open the Terminal page.

![image.png](./_resources/image14.png)

## Development Within Notebook
If you choose to create a new ipynb file, you can use Python 3 language for code development in the main workspace. You can directly copy the **Quick Start** code from the **model detail page** and execute model inference, training, evaluation, and other task operations in the main workspace.

![image.png](./_resources/image15.png)

## Development Within Terminal
If you choose to open the Terminal, you can use CLI commands to execute tasks in the workspace, including (but not limited to):

- Code deployment
- Dependency package management
- File management
- Submitting training/inference/evaluation tasks

![image.png](./_resources/image16.png)<br />