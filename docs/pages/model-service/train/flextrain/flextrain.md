<!-- modelscope-docs: FlexTrain User Guide | model-service/train/flextrain/flextrain_EN.md -->

# Introduction to FlexTrain
ModelScope FlexTrain is a cloud-based no-code training tool. With simple configuration through the interface, you can train new models in the cloud. The trained models will be automatically pushed to your private ModelScope repository for easy subsequent use.

# Product Features
In the current version, ModelScope collaborates with Alibaba Cloud PAI-DLC to provide users with generous limited-time free initial resource quotas. Additionally, ModelScope and PAI-DLC are connected via a dedicated network, which significantly improves model upload and download speeds compared to local networks or standard ECS instances.

# Prerequisites
Log in to ModelScope and navigate to FlexTrain ([https://www.modelscope.ai/my/modelService/train](https://www.modelscope.ai/my/modelService/train)). Complete the cloud account binding process as prompted.
![image.png](./_resources/1.png)

Continue to complete the DLC service authorization process and claim your DLC coupon. Since DLC is activated by availability zone, there's a certain probability that you'll need to activate DLC service for the Hangzhou region again after claiming the coupon. Once authorization is complete, the interface will appear as follows:
![image.png](./_resources/2.png)

# Creating a Training Job
1. Click "New Training." A new project interface will pop up on the right side of the page. Select your base model, task type (not required for single-task models), enter a project name, and click "Create Training Project."
![image.png](./_resources/3.png)

2. Add a dataset. The interface provides example datasets that you can reference to understand field mappings when selecting ModelScope datasets or uploading local datasets.
![image.png](./_resources/4-1.png)

3. If you choose a ModelScope dataset, click "Select from Dataset." Simply select an appropriate dataset, configure the corresponding data subset and usage purpose, then choose the dataset usage. Here we've selected "Auto Split," which will divide the dataset into training and test sets according to a specified ratio. Alternatively, you can separately select datasets for training or evaluation.
![image.png](./_resources/4.png)
![image.png](./_resources/5.png)

4. If you choose to upload local files, click "Upload Local Files." After your files are successfully uploaded, the system will automatically create a private dataset for you. Once the automatic review status changes from "Under Review" to "Upload Successful," you can proceed to the next step.
![image.png](./_resources/6.png)
![image.png](./_resources/7.png)

5. Configure training parameters. The system will automatically select appropriate training hardware and configure default hyperparameters. Typically, you only need to specify the maximum runtime and output repository name. The maximum runtime primarily prevents excessive costs from overly long training sessions, and the output repository name must not duplicate existing repository names. After filling in the corresponding parameters, click "Start Training" to submit your training job.
![image.png](./_resources/8.png)

6. Wait patiently for training to complete. You can check the training status and corresponding logs in the console at any time. Training generally takes a considerable amount of time, so once the logs show that the task has started normally, you can temporarily work on other tasks without continuously monitoring progress.
![image.png](./_resources/9.png)

7. After training completes, you can view evaluation results, training duration, model ID, and other information on the training interface.
![image.png](./_resources/10.png)

8. If training fails, you can check logs and task status on the training interface to identify the failure cause. Then return to the dataset or parameter configuration page to modify settings and resubmit.
![image.png](./_resources/11.png)

# Viewing Model Results
1. On the evaluation results page, click "View Model Details" to navigate to the corresponding model detail page, which contains information about the model's training task and evaluation results.
![image.png](./_resources/12.png)

2. Click "Quick Use" to reference the system-generated pipeline code for using your newly trained model. Note that pipeline initialization must include the `model_revision` parameter.
![image.png](./_resources/13.png)