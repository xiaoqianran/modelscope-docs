<!-- modelscope-docs: Gradio SDK Examples | studios/examples/gradio/gradio_EN.md -->

This article introduces some simple examples for ModelScope Studios.

Studios currently support building interactive applications based on Gradio. You can build and showcase various AI applications based on the atomic capabilities provided by models on the ModelScope platform, including custom model inputs and outputs, combinations of multiple models, and visual interactive presentations.

>  **Special Note:** You can freely create multiple Studios and share them with your friends. However, considering the quality of space display on the homepage, the Studios you create will not automatically enter the featured list on the Studios homepage. If you wish to apply for inclusion in the homepage list, please feel free to contact us (DingTalk group: 8010015744, email: contact@modelscope.cn)

## QuickStart Example:
- Python code
```python
import gradio as gr
def modelscope_quickstart(name):
    return "Welcome to modelscope, " + name + "!!"
demo = gr.Interface(fn=modelscope_quickstart, inputs="text", outputs="text", allow_flagging="never")
demo.launch()
```
- Example

::modelscope-studio{#damo/damo-quickstart-demo}

## More Examples:

Gradio supports various forms of data input and output, such as text, images, audio, and video.

#### Text Input/Output Example:
- Python code

```python
import gradio as gr

# Input a name string, output "Hello {name}!" string
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
- Example

::modelscope-studio{#damo/damo-text-demo}

#### Image Input/Output Example:
- Python code

```python
import gradio as gr
import os

# Input an image and output it rotated by 45°
def image_mod(image):
    return image.rotate(45)


demo = gr.Interface(image_mod, gr.Image(type="pil"), "image",
    allow_flagging="never")

if __name__ == "__main__":
    demo.launch()

```
- Example

::modelscope-studio{#damo/damo-image-demo}

#### Audio Input/Output Example:
- Python code

```python
import os

import numpy as np

import gradio as gr


# Input audio from microphone and output reversed audio
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
- Example

::modelscope-studio{#damo/damo-audio-demo}

#### Video Input/Output Example:
- Python code

```python
import gradio as gr
import os

# Input a video and output it as-is
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
- Example

::modelscope-studio{#damo/damo-video-demo}


#### Using ModelScope Models:
- Python code

```python
import gradio as gr
from modelscope.pipelines import pipeline
# Use word-segmentation pipeline model inference capability
word_segmentation = pipeline('word-segmentation')


def word_segmentation_demo(input_str):
    # Return word segmentation output
    return word_segmentation(input_str)['output']


model_input = gr.Textbox(lines=7, placeholder='Input a long sentence, e.g.: The weather is nice today, perfect for going out', label='Input')
model_output = gr.Textbox(lines=7, label='Output')
demo = gr.Interface(fn=word_segmentation_demo, inputs=model_input, outputs=model_output, allow_flagging="never")
demo.launch()

```
- Example

::modelscope-studio{#damo/damo-modelscope-sdk-demo}

Gradio supports defining interfaces through Blocks, combining different inputs and outputs, etc. For detailed tutorials, please check:
- Official tutorial: [https://gradio.app/quickstart/](https://gradio.app/quickstart/)
- More examples: [https://gradio.app/demos/](https://gradio.app/demos/)