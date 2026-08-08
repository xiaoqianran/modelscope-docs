<!-- modelscope-docs: Training Tutorial | aigc/train/train_EN.md -->

Welcome to the LoRA model training section of ModelScope's Civision!

The LoRA training module in Civision allows you to quickly fine-tune existing large models (such as Qwen-Image, etc.) using LoRA (Low-Rank Adaptation) based on a small number of image (or video) materials. This enables you to train your own exclusive style LoRA model and create unique image generators!

Compared to training LoRA on your own computer, using the ModelScope platform offers the following advantages:
- **No need to configure complex Python or GPU environments** – the entire process can be operated through a web interface
- **Free computing resources provided by the community** with GPU performance superior to RTX 4090
- **Supports training resource-intensive LoRA models for image generation (such as Flux.1) and video generation (such as Wanxiang 2.1)**, with the ability to choose any base model
- **Strict authentication for models, parameters, and training tasks**, ensuring your information won't be stolen by others

> [!NOTE]
> For more questions regarding training resource usage, please refer to [Civision FAQ](./AIGC专区常见问题.md).

# Step 1: Prepare Training Data
The first step in training LoRA is preparing your dataset locally.

Taking the dataset in the figure below as an example, we prepared two subfolders representing two categories of concepts to be trained (scenes, cats). The number before the underscore in each folder name represents the expected repetition count for images within that folder.
![image.png](./_resources/文件目录.png)

Within a single folder, there are training images and corresponding prompts, as shown in the figure below. There are three important considerations:

1. Keep the filename of each image consistent with its corresponding prompt file, otherwise the training script won't be able to accurately read the prompt for each image
2. Ensure that each prompt contains your desired trigger word, otherwise the LoRA may not work effectively
3. Make sure the prompt content matches the actual image content, otherwise the LoRA effect may not meet expectations

![image.png](./_resources/子文件目录.png)

After preparing the above two folders, compress them into a zip package. We will upload this compressed package in Step 2 for subsequent training use.

![image.png](./_resources/压缩.png)

# Step 2: Create Training Task

## Template Selection

On the training page, you first need to select the desired training template based on your specific requirements. Currently, the community provides the following preset training templates:

- Wan2.1-1.3B: This template supports LoRA training for Tongyi Wanxiang 2.1-1.3B text-to-video models, suitable for creating high-quality text-to-video content to help you quickly realize creative ideas.
- MaiJu ChaoRan: This template is evolved from the Flux.1 architecture and focuses on generating high-quality portrait images, excelling at creating realistic, delicate, and light-shadow-rich image content.
- Flux.1-Dev: This template is based on cutting-edge hybrid architecture, combining multimodal and parallel diffusion transformer modules to achieve perfect balance between image generation performance and quality, suitable for diverse style creation.
- Anime: Designed for anime creators and fans, this template optimizes color saturation and line clarity, particularly suitable for generating works with Japanese/Korean or Western anime styles.
- Realistic: Emphasizing detail realism and lighting effects, this template is suitable for users pursuing high-fidelity image generation, such as landscape paintings and portrait photography, capable of simulating near-photographic realistic textures.
- Custom: This template is suitable for users with more customization needs, allowing you to set personalized base models and parameters to create your exclusive model.

## Upload Images

After selecting the base model, we need to upload the required training images via drag-and-drop or clicking. You can directly upload the local zip package prepared in Step 1 to Muse. (You can also directly select already uploaded image datasets)
![image.png](./_resources/上传图片.png)

Note that different types of LoRA training templates have varying requirements for uploaded images. Please refer to the specific prompts on the page for details.
![image.png](./_resources/图片要求.png)

## Image Preprocessing

After uploading the image dataset, the platform provides flexible preprocessing options:
1. Users can **crop** images according to their needs to ensure format consistency across all input data.
2. Users can utilize our provided **captioning feature** to add semantic information to their images. For example, using the **Qwen** model or **JoyCaption** model to supplement your images with rich and accurate textual descriptions.

![image.png](./_resources/图片打标.png)

After successfully initiating a training task, you can also view the generated training dataset and corresponding annotation information for your current task on the **Model Training** -> **Data Management** page, with support for export and secondary modification.

## Parameter Settings

Next, we need to fill in the basic information for the training task, including:
- **Repetitions per Image**: Defines how many times each image is used during training, affecting the model's learning depth for each sample.
- **Training Epochs**: Sets the number of complete passes the model makes over the entire dataset. Adjust this parameter appropriately to balance training effectiveness and efficiency.
- **LoRA Model Name**: Customize the name for your model to be trained.
- **Model Trigger Word** (optional): Please enter a word corresponding to the training concept, **avoid common English words as much as possible**, and it's recommended to use pinyin of the training concept.
- **Model Visibility**: Whether the model will be public after training completion.
> Note: Public models not only receive higher training priority but also promote resource sharing and technical exchange within the community.

![image.png](./_resources/参数设置.png)

If you have more advanced training requirements, you can also click the **Advanced Parameters** panel on the right side of parameter settings to customize additional training parameters.

![image.png](./_resources/详细参数.png)

## Start Training
After confirming that the basic information is correct, you can click the "Start Training" button to submit this training task.

# Step 3: Monitor Training Progress

After submitting the training task, you can see a new task card in the **Training Management** interface.

You can click on this card to view the details of this training task and its current status.

Current training tasks have the following states:
- Queuing
- Training
- Training Completed
- Training Failed
- Timeout Terminated

![image.png](./_resources/训练管理.png)

When a task is in the "Timeout Terminated" state, you can continue training by clicking the "Restart" button in the upper right corner of the task card.

![image.png](./_resources/超时终止.png)

When a task is in the "Training" state, you can monitor real-time progress through the progress bar above the training details.

In the details page of a specific task, the bottom-left shows LoRA checkpoint information. Each LoRA checkpoint generates a **real-time sample image** based on the sample image settings in the detailed parameters from Step 2.
Additionally, the right side displays detailed training parameters.

# Step 4: Training Complete, Proceed to Generation
When the training task status changes to "Training Completed," you can directly click the "Start Generation" button on the details interface to use your newly trained LoRA for personalized creation in the corresponding interface.

![image.png](./_resources/训练详情.png)