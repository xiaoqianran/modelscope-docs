<!-- modelscope-docs: Streamlit SDK示例 | studios/examples/streamlit/streamlit_CN.md -->

# Streamlit SDK示例

本篇文章介绍ModelScope创空间使用Stremlit SDK 一些简单示例。
您可以使用Streamlit SDK基于ModelScope平台上模型提供的原子能力，自行搭建与展示不同AI应用，包括自定义的模型输入输出，多模型的组合，以及可视化交互展现形式等等。

>  **特别说明：** 您可以自由创建多个创空间并分享给您的朋友，但考虑到首页的空间展示质量，您所创建的空间并不会自动进入创空间首页精选列表，如您有意愿申请进入首页列表，非常欢迎与我们取得联系（钉钉群：8010015744，邮箱：contact@modelscope.cn）

## QuickStart示例：
- python代码
```python
import streamlit as st

st.text('Welcome to ModelScope.')
```
- 示例

::modelscope-studio{#damo/damo-quickstart-streamlit-demo}

## 更多示例：

Streamlit 支持多种不同形式的数据输入与输出，例如文本、图像、音频、视频等。

#### 图片输入输出示例：
- python代码

```python
import streamlit as st
from PIL import Image
from io import BytesIO
#上传一张图片，旋转45°后输出
uploaded_file = st.file_uploader("Choose an image file to upload")
if uploaded_file is not None:
    bytes_data = uploaded_file.read()
    image_raw = Image.open(BytesIO(bytes_data))
    st.image(image_raw.rotate(45))

```
- 示例

::modelscope-studio{#damo/damo-image-streamlit-demo}

#### 音频输入输出示例：
- python代码

```python
import streamlit as st
#上传一段音频并从第3秒开始播放
uploaded_file = st.file_uploader("Choose an audio file to upload")
if uploaded_file is not None:
    bytes_data = uploaded_file.read()
    st.audio(bytes_data, start_time=3)

```
- 示例

::modelscope-studio{#damo/damo-audio-streamlit-demo}

#### 视频输入输出示例：
- python代码

```python
import streamlit as st
#输入视频，原样展示
uploaded_file = st.file_uploader("Choose a video file to upload")
if uploaded_file is not None:
    bytes_data = uploaded_file.read()
    st.video(bytes_data)
```
- 示例

::modelscope-studio{#damo/damo-video-streamlit-demo}


#### 使用modelscope模型：
- python代码

```python
import streamlit as st
from modelscope.pipelines import pipeline
#注意streamlit对于pipeline的初始化，请使用st.experimental_singleton进行单例化，否则会重复初始化模型，影响服务性能
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
- 示例

::modelscope-studio{#damo/damo-modelscope-sdk-streamlit-demo}

Streamlit与大部分机器学习框架兼容，包括 Tensorflow 和 Pytorch
- 官方教程：[https://docs.streamlit.io/](https://docs.streamlit.io/)
