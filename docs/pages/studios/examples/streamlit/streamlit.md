<!-- modelscope-docs: Streamlit SDK Examples | studios/examples/streamlit/streamlit_EN.md -->

This article introduces some simple examples of using Streamlit SDK in ModelScope Studios.
You can use Streamlit SDK to build and showcase various AI applications based on the atomic capabilities provided by models on the ModelScope platform, including custom model inputs and outputs, combinations of multiple models, and visual interactive presentations.

>  **Special Note:** You can freely create multiple Studios and share them with your friends. However, considering the quality of space display on the homepage, the Studios you create will not automatically enter the featured list on the Studios homepage. If you wish to apply for inclusion in the homepage list, please feel free to contact us (DingTalk group: 8010015744, email: contact@modelscope.cn)

## QuickStart Example:
- Python code
```python
import streamlit as st

st.text('Welcome to ModelScope.')
```
- Example

::modelscope-studio{#damo/damo-quickstart-streamlit-demo}

## More Examples:

Streamlit supports various forms of data input and output, such as text, images, audio, and video.

#### Image Input/Output Example:
- Python code

```python
import streamlit as st
from PIL import Image
from io import BytesIO
# Upload an image and rotate it by 45° before outputting
uploaded_file = st.file_uploader("Choose an image file to upload")
if uploaded_file is not None:
    bytes_data = uploaded_file.read()
    image_raw = Image.open(BytesIO(bytes_data))
    st.image(image_raw.rotate(45))

```
- Example

::modelscope-studio{#damo/damo-image-streamlit-demo}

#### Audio Input/Output Example:
- Python code

```python
import streamlit as st
# Upload an audio file and play it starting from the 3rd second
uploaded_file = st.file_uploader("Choose an audio file to upload")
if uploaded_file is not None:
    bytes_data = uploaded_file.read()
    st.audio(bytes_data, start_time=3)

```
- Example

::modelscope-studio{#damo/damo-audio-streamlit-demo}

#### Video Input/Output Example:
- Python code

```python
import streamlit as st
# Input video and display it as-is
uploaded_file = st.file_uploader("Choose a video file to upload")
if uploaded_file is not None:
    bytes_data = uploaded_file.read()
    st.video(bytes_data)
```
- Example

::modelscope-studio{#damo/damo-video-streamlit-demo}


#### Using ModelScope Models:
- Python code

```python
import streamlit as st
from modelscope.pipelines import pipeline
# Note: For Streamlit pipeline initialization, please use st.experimental_singleton for singleton pattern,
# otherwise the model will be repeatedly initialized, affecting service performance
@st.experimental_singleton
def get_pipeline():
    return pipeline('word-segmentation')

p = get_pipeline()
def word_segment(input_str):
    return p(input_str)['output']


col1, col2 = st.columns(2)
with col1:
    input = st.text_input('text input', '今天天气真好呀', key='word_seg_input')

with col2:
    input2 = st.text_input('text output', placeholder=word_segment(input), disabled=True)

```
- Example

::modelscope-studio{#damo/damo-modelscope-sdk-streamlit-demo}

Streamlit is compatible with most machine learning frameworks, including TensorFlow and PyTorch.
- Official tutorial: [https://docs.streamlit.io/](https://docs.streamlit.io/)