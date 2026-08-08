<!-- modelscope-docs: Introduction to Studios | studios/intro/intro_EN.md -->

This article provides a basic introduction to ModelScope Studios.

# About ModelScope Studios
ModelScope Studios provide you with a free and flexible space to showcase AI applications. Based on the atomic capabilities provided by models on the ModelScope platform, you can build and showcase various AI applications, including custom model inputs and outputs, combinations of multiple models, and visual interactive presentations. We hope that here, we can inspire the creativity and innovation of AI developers. With Studios as your blank canvas, models as your paint, and imagination as your brush, together we can create a vibrant new picture of AI applications!

>  **Special Note:** You can freely create multiple Studios and share them with your friends. However, considering the quality of space display on the homepage, the Studios you create will not automatically enter the featured list on the Studios homepage. If you wish to apply for inclusion in the homepage list, please feel free to contact us (DingTalk group: 8010015744, email: contact@modelscope.cn)

## Terminology Explanation
**Studio**: A private visualization space and operational platform for model applications provided by the ModelScope platform. Here, you can flexibly build diverse AI applications based on the rich model ecosystem available on ModelScope.

**Gradio**: Gradio provides a lightweight tool for customizing interactive machine learning web pages, offering developers a quick-start scaffold for rapidly building AI applications. Studios currently support using Gradio to customize online applications built around ModelScope models. [Visit the Gradio official website](https://gradio.app/) to learn more.

**Streamlit**: Streamlit is more advanced compared to Gradio. Streamlit's official website provides richer examples and interactive templates, supporting Markdown and HTML rendering. Studios currently support using Streamlit to customize online applications built around ModelScope models. [Visit the Streamlit official website](https://streamlit.io/) to learn more.

**Static**: The HTML Static SDK pre-configured by the ModelScope platform supports quickly displaying existing HTML pages in your project space, making it suitable for algorithm demos that require heavy interaction and visual experience.

## Quick Start

### 1. View Studio List

You can view currently public展示 spaces on the [Studios homepage](https://modelscope.cn/studios):

- ![image.png](./_resources/1667305016921-52bf5a9d-4cae-49f8-8d31-acdbb23e00d5.png)

### 2. Experience a Studio

After clicking into a specific Studio, you can view the space's presentation and files. Here, we'll use the **AI Art Generation** Studio as an example. In this space, you can input a textual description, and AI will generate corresponding images for you:

- ![image.png](./_resources/1667296545983-f3e24853-3c3d-46d0-971d-99b5d9c9c538.png)
> Note: AI art generation typically takes 30 seconds to 1 minute. If many people are experiencing it simultaneously during certain periods, we implement a queuing mechanism that generates images sequentially based on request order. During peak times, the waiting time for art generation may be longer, so please be patient.

After inputting your description and waiting briefly, the space will return an image corresponding to your description:
- ![image.png](./_resources/1667296572307-051b48c7-1c34-4450-add4-6cde90445477.png)

## Differences Between Studios and Online Experience in Model Library
Studios are not limited to showcasing single-model experiences. Since building Studios doesn't require extensive frontend knowledge, you can freely build pages using the algorithm visualization SDKs provided by the platform (currently supporting Gradio, Streamlit, and Static SDK, with more visualization configuration SDKs being integrated). This makes Studios more flexible and free, with additional functional uses including but not limited to:

- **Single-model application building**: You can build domain-specific model applications here based on models provided by the platform, such as building a jump rope counting application using human detection models or a text similarity application using text vector models.
- **Multi-model combination application showcase**: Display multiple related models in the same space, such as showcasing portrait cartoonization models in sketch, 3D, artistic, and hand-drawn styles within the same space, allowing visitors to quickly and conveniently experience multiple similar models on the same page.
- **Complex parameter model application showcase**: Some models have numerous input parameters that are difficult to present comprehensively in standard model experiences. Here, you can showcase your skills, such as configuring multiple parameters in AI art generation including image dimensions, language, number of generated images, aspect ratio, and more.
- Many more creative uses waiting for you to co-create...

We hope that based on everyone's imagination and creativity, more high-quality, interesting, and exciting space showcases will emerge here!

# Studios in the ModelScope Community
ModelScope is an open-source and open AI community platform. We support and encourage more high-quality Studios to join the ModelScope community. The platform currently provides several examples, and we hope more partners can join us. If you have any suggestions or questions, please [contact us](../联系我们/联系我们.md)!