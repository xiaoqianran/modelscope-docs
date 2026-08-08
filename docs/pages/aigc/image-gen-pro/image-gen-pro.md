<!-- modelscope-docs: Professional Image Generation | aigc/image-gen-pro/image-gen-pro_EN.md -->

# 1. Prompts
In the field of image generation, "Prompt" refers to the practice of guiding Stable Diffusion (hereinafter referred to as SD) to generate desired images through textual instructions.

Prompts are divided into two types: Positive Prompts and Negative Prompts. Positive Prompts encompass content you wish to appear in the image, such as a magnificent sunset or an adorable puppy; while Negative Prompts specify elements you want to avoid in the image, such as obstacles or unwanted details.

Prompts typically consist of concise English phrases that describe various aspects of the image, including subject matter, materials, style, color harmony, and lighting.

![image.png](./_resources/prompt.png)

# 2. Prompt Optimization
When creating visually appealing images, crafting an appropriate Prompt is a crucial step. Writing effective Prompts requires consideration of numerous factors, such as word count, word order, and keyword weights. Additionally, Stable Diffusion (SD) itself does not directly understand text but relies on the CLIP model to convert Prompts into tokens it can recognize. Since the CLIP model was trained exclusively on English materials, Prompts must be written in English.

To address this challenge, Muse has introduced the "Prompt Optimization" feature. This functionality leverages the creativity of Large Language Models (LLM) to further enrich and expand upon user inputs.

> Helps users overcome the complexity of writing Prompts and the limitation of not being able to use Chinese

![image.png](./_resources/提示词优化.png)

# 3. Prompt Translation
A potential issue with the "Prompt Optimization" feature is that Large Language Models (LLM) might over-exercise their "imagination," resulting in Prompts containing elements the user didn't expect. If you don't want the LLM to excessively expand your Prompt, yet you're struggling with remembering how to spell certain Chinese words in English, you can utilize the "Prompt Translation" feature to directly translate Chinese into English.

> This approach allows you to precisely control Prompt content while overcoming language barriers.

![image.png](./_resources/提示词翻译.png)

# 4. Model Selection
Stable Diffusion (SD) models can be primarily categorized into the following types. For more detailed information, please refer to the [Model Type Introduction](https://www.uisdc.com/stable-diffusion-guide-4):

**1. Checkpoint**: These are base models with multiple versions available based on model architecture and parameter size. They are mandatory when generating images.

**2. LoRA**: Used to fix specific target characteristics, which can include actions, age, expressions, clothing, materials, perspectives, and artistic styles. This type is widely applied in anime character reproduction, style transfer, and scene design. It's optional when generating images.

**3. VAE (Variational Autoencoder)**: Responsible for converting image information from latent space into normal visible images. It's optional when generating images.

Checkpoint and LoRA are relatively common model types. Users can select appropriate models based on the desired image style. Through the "Model Management" feature, users **can filter models by type, name, SD version, and other criteria** to find the most suitable model configuration.

![image.png](./_resources/模型管理.png)

![image.png](./_resources/模型选择.png)

# 5. Basic Image Generation Parameters
When generating images, we set several basic parameters. For detailed information, please refer to ["Understanding Stable Diffusion Basics in Ten Minutes"](https://juejin.cn/post/7276808079143780389):

**1. Sampling Method**: This is the algorithm used to remove noise from generated images. Typically, DPM++ 2M Karras is sufficient.

**2. Prompt Guidance Scale**: This parameter adjusts the correlation between the generated image and the original text. Lower values allow for higher creativity in generated images, while higher values strengthen the text's guidance over the image.

**3. Random Seed**: This enables different random seeds to generate images with varying styles under identical conditions, providing nearly infinite creative possibilities. Conversely, using the same seed produces consistent images. -1 represents using a different random number each time.

**4. Sampling Steps**: This represents the number of iterations during the denoising process. Increasing sampling steps improves image detail and accuracy but also extends generation time. Different samplers may require different sampling steps to achieve similar denoising effects. Typically, setting sampling steps between 20-30 is a conventional choice.

**5. Number of Images to Generate**: The quantity of images that can be generated in a single operation.

**6. Width**: The width dimension of the generated image.

**7. Height**: The height dimension of the generated image.

By adjusting these parameters, users can control the image generation process and results.

![image.png](./_resources/生图基本参数.png)

# 6. Image-to-Image Inpainting
Inpainting is a powerful feature that allows users to mask specific areas of an image using a mask, then have Stable Diffusion (SD) redraw these masked regions based on the Prompt while keeping the rest of the image unchanged. This process gives users finer control over which elements should appear in the image, significantly enhancing image generation quality. The inputs for inpainting mainly include:

**1. Original Image**: The base image requiring inpainting.

**2. Mask**: A black-and-white image where white areas indicate regions to be inpainted.

**3. Inpainting Strength**: This parameter controls the extent of inpainting. Higher values give the model greater freedom during inpainting, resulting in more significant changes compared to the original image.

Regarding masks, users have multiple options: **they can directly upload existing mask files, manually draw using brush tools, or leverage "Muse Image Preprocessing Features" to quickly create masks.**

![image.png](./_resources/图生图.png)

# 7. Image Preprocessing
When performing "Inpainting," users need to provide the original image to be processed and a mask that defines the regions requiring inpainting. For objects with complex shapes, precisely drawing masks can be quite time-consuming and labor-intensive. To address this issue, Muse provides a convenient solution—during the "Inpainting-Mask Upload" stage, Muse includes an "Auto Cutout" feature that allows users **to generate object masks with a single click.**

![image.png](./_resources/抠图.png)

Muse offers several main cutout techniques:

**1. Subject Cutout**: Automatically locates and extracts the main subject from the image.

**2. Product Cutout**: Automatically identifies and extracts products from the image.

**3. Human Body Cutout**: Provides options to extract only skin, clothing, or background.

When using the "Inpainting" feature, the system **will inpaint the white areas in the mask.**
Therefore, we recommend selecting the most suitable mask image from the cutout results for your operation.

![image.png](./_resources/抠图并选择蒙版.png)

# 8. High-Resolution Restoration
High-resolution restoration technology uses AI algorithms to convert images from low resolution to high resolution, significantly enhancing image detail and clarity. This technology involves several key adjustable parameters:

**1. Model (Algorithm Type)**: We recommend using R-ESRGAN 4x+ for standard image enhancement. For anime-style images, R-ESRGAN 4x+ Anime 6B is more suitable.

**2. Upscale Factor**: This is the multiplier for image resolution enhancement. Due to VRAM limitations, the typical range is 1-2x.

**3. Denoising Strength**: This determines the creative freedom during the resolution enhancement process. Higher values allow greater freedom, meaning more innovative elements can be introduced during detail reconstruction.

By adjusting these parameters, users can optimize image restoration effects according to specific needs, enabling applications ranging from simple clarity enhancement to complex artistic redrawing.

![image.png](./_resources/高清修复.png)

# 9. ADetailer
ADetailer is a specialized tool designed to improve distorted and blurry faces or hands in generated images. It provides the following adjustable parameters for fine-tuning the restoration process. For more detailed information about this tool, please visit [Adetailer: Automatic Face and Hand Restoration](https://stable-diffusion-art.com/adetailer/):

**1. Model**: Specifies the algorithm used for restoration. For face restoration, we recommend using the face_yolov8s.pt model; for hand restoration, the hand_yolov8s.pt model is suggested.

**2. Positive Prompt**: Defines details you want to appear in the restored faces or hands.

**3. Negative Prompt**: Specifies details you don't want to appear in the restored faces or hands.

By adjusting these parameters, users can precisely restore faces or hands in generated images according to their needs, improving image quality and realism.

![image.png](./_resources/ADetailer.png)

# 10. ControlNet
Before ControlNet was introduced, the image generation process was full of uncertainty for users—it was like drawing unknown cards, making it impossible to predict what kind of images AI would generate, creating an uncertain user experience. However, with ControlNet, we can now control the image generation process more precisely—for example, uploading sketches for AI to color and render, controlling human poses, or generating line drawings.

ControlNet provides several adjustable parameters to achieve fine control over the image generation process. For more details and in-depth guidance, please refer to ControlNet: Complete Guide:

1. Control Image: An image that provides control information for image generation **(Note: Both the height and width of uploaded images must be divisible by 16, otherwise an error will occur)**.

2. ControlType: Supports multiple control methods:
   - Canny: Used for edge detection to extract image contours, suitable for preserving original image composition;
   - Depth: Obtains depth information from reference images;
   - Lineart: Converts images into line art style contours, suitable for simple drawings;
   - OpenPose: Detects human body keypoints such as head, shoulders, and hand positions, helpful for replicating human poses rather than other detailed information;
   - SoftEdge: Similar to Canny but can simplify image contours in complex details;
   - Scribble/Sketch: Converts reference images into doodle or hand-drawn styles;
   - ControlNet Models: Each ControlType comes with multiple model algorithm options, each varying in effect but generally aligning with the ControlType description;

3. Control Weight: Determines how much emphasis the control image receives relative to the prompt, similar to keyword weights in prompts. Lower values mean less adherence to the control image by ControlNet;

4. Preprocessor: Different ControlTypes require different preprocessors to convert original images into the format required by ControlNet. You can preview the processed image by clicking "Preview Preprocessing Results";

5. Starting Step: Indicates the step at which ControlNet activates, with 0 representing activation from the first step;

6. Ending Step: Indicates the step at which ControlNet stops activating, with 1 representing the final step.

Although multiple ControlNets can be stacked to achieve multi-faceted image control, due to VRAM limitations, a maximum of three ControlNets can be used simultaneously.

![image.png](./_resources/controlnet.png)