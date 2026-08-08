<!-- modelscope-docs: Gradio SDK示例 | studios/examples/gradio/gradio_CN.md -->

本篇文章介绍ModelScope创空间的一些简单示例。

创空间目前支持基于Gradio构建交互式应用，您可以基于ModelScope平台上模型提供的原子能力，自行搭建与展示不同AI应用，包括自定义的模型输入输出，多模型的组合，以及可视化交互展现形式等等。

>  **特别说明：** 您可以自由创建多个创空间并分享给您的朋友，但考虑到首页的空间展示质量，您所创建的空间并不会自动进入创空间首页精选列表，如您有意愿申请进入首页列表，非常欢迎与我们取得联系（钉钉群：8010015744，邮箱：contact@modelscope.cn）

## QuickStart示例：
- python代码
```python
import gradio as gr
def modelscope_quickstart(name):
    return "Welcome to modelscope, " + name + "!!"
demo = gr.Interface(fn=modelscope_quickstart, inputs="text", outputs="text", allow_flagging="never")
demo.launch()
```
- 示例

::modelscope-studio{#damo/damo-quickstart-demo}

## 更多示例：

Gradio支持多种不同形式的数据输入与输出，例如文本、图像、音频、视频等。

#### 文字输入输出示例：
- python代码

```python
import gradio as gr

# 输入name字符串，输出Hello {name}!字符串
def greet(name):
    return "Hello " + name + "!"

demo = gr.Interface(
    fn=greet,
    inputs=gr.Textbox(lines=2, placeholder="Name Here..."),
    outputs="text",
    allow_flagging="never",
)
if __name__ == "__main__":
    demo.launch()

```
- 示例

::modelscope-studio{#damo/damo-text-demo}

#### 图片输入输出示例：
- python代码

```python
import gradio as gr
import os

# 输入一张图片，旋转45°后输出
def image_mod(image):
    return image.rotate(45)


demo = gr.Interface(image_mod, gr.Image(type="pil"), "image",
    allow_flagging="never")

if __name__ == "__main__":
    demo.launch()

```
- 示例

::modelscope-studio{#damo/damo-image-demo}

#### 音频输入输出示例：
- python代码

```python
import os

import numpy as np

import gradio as gr


# 输入麦克风的音频，输出反向后的音频
def reverse_audio(audio):
    sr, data = audio
    return (sr, np.flipud(data))


demo = gr.Interface(fn=reverse_audio, 
                    inputs="microphone", 
                    outputs="audio", 
                    examples=[
                    "https://samplelib.com/lib/preview/mp3/sample-3s.mp3"], 
                    cache_examples=True,
                    allow_flagging="never")

if __name__ == "__main__":
    demo.launch()

```
- 示例

::modelscope-studio{#damo/damo-audio-demo}

#### 视频输入输出示例：
- python代码

```python
import gradio as gr
import os

# 输入一个视频，原样输出
def video_identity(video):
    return video


demo = gr.Interface(video_identity, 
                    gr.Video(), 
                    "playable_video", 
                    cache_examples=True,
                    allow_flagging="never")

if __name__ == "__main__":
    demo.launch()

```
- 示例

::modelscope-studio{#damo/damo-video-demo}


#### 使用modelscope模型：
- python代码

```python
import gradio as gr
from modelscope.pipelines import pipeline
# 使用word-segmentation pipeline模型推理能力
word_segmentation = pipeline('word-segmentation')


def word_segmentation_demo(input_str):
    # 返回分词输出
    return word_segmentation(input_str)['output']


model_input = gr.Textbox(lines=7, placeholder='输入一个长句,例如:今天天气不错，适合出去游玩', label='输入')
model_output = gr.Textbox(lines=7, label='输出')
demo = gr.Interface(fn=word_segmentation_demo, inputs=model_input, outputs=model_output, allow_flagging="never")
demo.launch()

```
- 示例

::modelscope-studio{#damo/damo-modelscope-sdk-demo}

Gradio支持通过Blocks定义界面、组合不同输入输出等，详细教程可以查看
- 官方教程：[https://gradio.app/quickstart/](https://gradio.app/quickstart/)
- 更多示例：[https://gradio.app/demos/](https://gradio.app/demos/)
