<!-- modelscope-docs: Custom Datasets | llm-training-and-inference/customization/custom-dataset/custom-dataset_EN.md -->

# Custom Datasets

There are three methods to integrate custom datasets, with increasing control over preprocessing functions but also increasing complexity. For example, Method 1 is the most convenient but offers the least control over preprocessing functions, requiring you to pre-convert your dataset into a specific format:

1. **【Recommended】** Directly use command-line arguments: `--dataset <dataset_path1> <dataset_path2>`. This uses AutoPreprocessor to convert datasets into standard format (supports 4 dataset formats, see details about AutoPreprocessor below). You can use `--columns` for column name conversion. Supports csv, json, jsonl, txt, and folders (e.g., git clone open-source datasets). This method doesn't require modifying dataset_info.json and is suitable for users new to ms-swift. The following two methods are suitable for developers extending ms-swift.

2. Add datasets to `dataset_info.json`, referencing ms-swift's built-in [dataset_info.json](https://github.com/modelscope/ms-swift/blob/main/swift/llm/dataset/data/dataset_info.json). This method also uses AutoPreprocessor to convert datasets into standard format. dataset_info.json contains a list of dataset metadata, where each metadata entry must include one of ms_dataset_id/hf_dataset_id/dataset_path. Column name conversion is performed using the `columns` field. Datasets added to `dataset_info.json` or registered datasets will automatically generate [Supported Datasets Documentation](https://swift.readthedocs.io/en/latest/Instruction/Supported Models and Datasets.html) when running [run_dataset_info.py](https://github.com/modelscope/ms-swift/blob/main/scripts/utils/run_dataset_info.py). Additionally, you can use an external `dataset_info.json` by specifying `--custom_dataset_info xxx.json` to parse the JSON file (convenient for pip install users rather than git clone), then specify `--dataset <dataset_id/dataset_dir/dataset_path>`.

3. Manually register datasets, offering the most flexible preprocessing function customization capability, supporting function-based dataset preprocessing, but with higher difficulty. Reference [built-in datasets](https://github.com/modelscope/ms-swift/blob/main/swift/llm/dataset/dataset/llm.py) or examples in [examples](https://github.com/modelscope/ms-swift/blob/main/examples/custom). You can parse external registration content by specifying `--custom_register_path xxx.py` (convenient for pip install users rather than git clone).
   - Methods 1 and 2 are implemented using Method 3, with the registration process happening automatically.

The following sections introduce the dataset formats that `AutoPreprocessor` can handle:

ms-swift's standard dataset format accepts the following keys: 'messages', 'rejected_response', 'label', 'images', 'videos', 'audios', 'tools', and 'objects'. Among these, 'messages' is a required key, 'rejected_response' is used for DPO and other RLHF training, 'label' is used for KTO training and classification model training, 'images', 'videos', 'audios' store paths or URLs for multimodal data, 'tools' is used for Agent tasks, and 'objects' is used for grounding tasks.

ms-swift has three core preprocessors: `MessagesPreprocessor`, `AlpacaPreprocessor`, and `ResponsePreprocessor`. MessagesPreprocessor converts messages-like and sharegpt-format datasets into standard format, AlpacaPreprocessor converts alpaca-format datasets, and ResponsePreprocessor converts query/response-like format datasets. `AutoPreprocessor` automatically selects the appropriate preprocessor.

The following four formats will all be converted to the 'messages' field in ms-swift's standard format by `AutoPreprocessor`, meaning they can all be directly integrated using `--dataset <dataset-path>`:

**messages format (standard format):**
```jsonl
{"messages": [{"role": "system", "content": "<system>"}, {"role": "user", "content": "<query1>"}, {"role": "assistant", "content": "<response1>"}, {"role": "user", "content": "<query2>"}, {"role": "assistant", "content": "<response2>"}]}
```
- Note: The system part is optional. The system in the dataset takes precedence over the `--system` passed via command line, followed by the `default_system` defined in the template.

**sharegpt format:**
```jsonl
{"system": "<system>", "conversation": [{"human": "<query1>", "assistant": "<response1>"}, {"human": "<query2>", "assistant": "<response2>"}]}
```

**query-response format:**
```jsonl
{"system": "<system>", "query": "<query2>", "response": "<response2>", "history": [["<query1>", "<response1>"]]}
```
Note: The following fields will be automatically converted to corresponding system, query, response fields. (The solution field will be retained)
- system: 'system', 'system_prompt'.
- query: 'query', 'prompt', 'input', 'instruction', 'question', 'problem'.
- response: 'response', 'answer', 'output', 'targets', 'target', 'answer_key', 'answers', 'solution', 'text', 'completion', 'content'.

**alpaca format:**
```jsonl
{"system": "<system>", "instruction": "<query-inst>", "input": "<query-input>", "output": "<response>"}
```
- Note: instruction and input fields will be combined into the query field. If both instruction and input are not empty strings, `query = f'{instruction}\n{input}'`.

## Standard Dataset Format

Below is ms-swift's standard dataset format, where the system field is optional and defaults to the `default_system` defined in the template. The four dataset formats introduced earlier can also be processed by AutoPreprocessor into the standard dataset format.

### Pre-training

```jsonl
{"messages": [{"role": "assistant", "content": "I love music"}]}
{"messages": [{"role": "assistant", "content": "Coach, I want to play basketball"}]}
{"messages": [{"role": "assistant", "content": "Which is more authoritative: tomato and egg rice or eggplant rice?"}]}
```

### Supervised Fine-tuning

```jsonl
{"messages": [{"role": "system", "content": "You are a helpful and harmless assistant"}, {"role": "user", "content": "Tell me tomorrow's weather"}, {"role": "assistant", "content": "Tomorrow will be sunny"}]}
{"messages": [{"role": "system", "content": "You are a helpful and harmless math calculator"}, {"role": "user", "content": "What is 1+1?"}, {"role": "assistant", "content": "It equals 2"}, {"role": "user", "content": "What about adding 1 more?"}, {"role": "assistant", "content": "It equals 3"}]}
```

### RLHF

#### DPO/ORPO/CPO/SimPO/RM

```jsonl
{"messages": [{"role": "system", "content": "You are a helpful and harmless assistant"}, {"role": "user", "content": "Tell me tomorrow's weather"}, {"role": "assistant", "content": "Tomorrow will be sunny"}], "rejected_response": "I don't know"}
{"messages": [{"role": "system", "content": "You are a helpful and harmless math calculator"}, {"role": "user", "content": "What is 1+1?"}, {"role": "assistant", "content": "It equals 2"}, {"role": "user", "content": "What about adding 1 more?"}, {"role": "assistant", "content": "It equals 3"}], "rejected_response": "I don't know"}
```

For multimodal data formats, refer to [Multimodal Datasets](#multimodal), with additional fields like `images` representing other modal inputs. When different image information needs to be associated with preference pair data, the `rejected_images` field can be used to annotate image information corresponding to rejected responses.
Alignment datasets require at least one of `rejected_images` or `rejected_response` to be provided.
> Note: RM additionally supports a margin column, refer to [RM Documentation](../功能指引/Human Alignment.md#rm)

#### KTO

```jsonl
{"messages": [{"role": "system", "content": "You are a helpful and harmless assistant"}, {"role": "user", "content": "Tell me tomorrow's weather"}, {"role": "assistant", "content": "I don't know"}], "label": false}
{"messages": [{"role": "system", "content": "You are a helpful and harmless math calculator"}, {"role": "user", "content": "What is 1+1?"}, {"role": "assistant", "content": "It equals 2"}, {"role": "user", "content": "What about adding 1 more?"}, {"role": "assistant", "content": "It equals 3"}], "label": true}
```

#### PPO/GRPO

```jsonl
{"messages": [{"role": "system", "content": "You are a helpful and harmless assistant"}, {"role": "user", "content": "Tell me tomorrow's weather"}]}
{"messages": [{"role": "system", "content": "You are a helpful and harmless math calculator"}, {"role": "user", "content": "What is 1+1?"}, {"role": "assistant", "content": "It equals 2"}, {"role": "user", "content": "What about adding 1 more?"}]}
{"messages": [{"role": "user", "content": "What is your name?"}]}
```
- Note: GRPO passes through all additional field content to ORM, unlike other training methods which delete additional fields by default. For example, you can additionally pass 'solution'. Custom ORMs need to include a positional parameter `completions`, with others as keyword parameters passed through from additional dataset fields.

#### GKD
If `seq_kd` is not enabled (i.e., the parameter is False), the dataset format is as follows (you can use a teacher model for pre-distillation):
```jsonl
{"messages": [{"role": "system", "content": "You are a helpful and harmless assistant"}, {"role": "user", "content": "Tell me tomorrow's weather"}, {"role": "assistant", "content": "Tomorrow will be sunny"}]}
{"messages": [{"role": "system", "content": "You are a helpful and harmless math calculator"}, {"role": "user", "content": "What is 1+1?"}, {"role": "assistant", "content": "It equals 2"}, {"role": "user", "content": "What about adding 1 more?"}, {"role": "assistant", "content": "It equals 3"}]}
```

If `seq_kd` is enabled, the final 'assistant' part is not needed (teacher model generates data during training):
```jsonl
{"messages": [{"role": "system", "content": "You are a helpful and harmless assistant"}, {"role": "user", "content": "Tell me tomorrow's weather"}]}
{"messages": [{"role": "system", "content": "You are a helpful and harmless math calculator"}, {"role": "user", "content": "What is 1+1?"}, {"role": "assistant", "content": "It equals 2"}, {"role": "user", "content": "What about adding 1 more?"}]}
```

### Sequence Classification

**Single-label tasks:**
```jsonl
{"messages": [{"role": "user", "content": "The weather is really nice today"}], "label": 1}
{"messages": [{"role": "user", "content": "I'm having such bad luck today"}], "label": 0}
{"messages": [{"role": "user", "content": "So happy"}], "label": 1}
```
**Multi-label tasks:**
```jsonl
{"messages": [{"role": "user", "content": "<sentence>"}], "label": []}
{"messages": [{"role": "user", "content": "<sentence>"}], "label": [0, 2]}
{"messages": [{"role": "user", "content": "<sentence>"}], "label": [1, 3, 5]}
```

**Single regression tasks:**
```jsonl
{"messages": [{"role": "user", "content": "Calculate the similarity between two sentences, ranging from 0-1.\nsentence1: <sentence1>\nsentence2: <sentence2>"}], "label": 0.8}
```
**Multi-regression tasks:**

```jsonl
{"messages": [{"role": "user", "content": "<sentence>"}], "label": [1.2, -0.6, 0.8]}
```

### Embedding

Please refer to [Embedding Training Documentation](../最佳实践/Embedding Training.md#Dataset Format)

### Reranker

Please refer to [Reranker Training Documentation](../最佳实践/Reranker Training.md#Dataset Format)

### Multimodal

For multimodal datasets, the format is the same as the tasks above. The difference is the addition of `images`, `videos`, `audios` keys, representing URLs or paths (absolute paths recommended) of multimodal resources. `<image>`, `<video>`, `<audio>` tags represent the positions where images/videos/audio are inserted. ms-swift supports multiple images/videos/audio. These special tokens will be replaced during preprocessing, refer to [here](https://github.com/modelscope/ms-swift/blob/main/swift/llm/template/template/qwen.py#L198). The following four examples show pure text and data formats containing image, video, and audio data respectively.

Pre-training:
```
{"messages": [{"role": "assistant", "content": "Pre-training text goes here"}]}
{"messages": [{"role": "assistant", "content": "<image> is a dog, <image> is a cat"}], "images": ["/xxx/x.jpg", "/xxx/x.png"]}
{"messages": [{"role": "assistant", "content": "<audio> describes how nice the weather is today"}], "audios": ["/xxx/x.wav"]}
{"messages": [{"role": "assistant", "content": "<image> is an elephant, <video> is a lion running"}], "images": ["/xxx/x.jpg"], "videos": ["/xxx/x.mp4"]}
```

Fine-tuning:
```jsonl
{"messages": [{"role": "user", "content": "What is the capital of Zhejiang?"}, {"role": "assistant", "content": "The capital of Zhejiang is Hangzhou."}]}
{"messages": [{"role": "user", "content": "<image><image> What's the difference between these two images?"}, {"role": "assistant", "content": "The first one is a cat, the second one is a dog"}], "images": ["/xxx/x.jpg", "/xxx/x.png"]}
{"messages": [{"role": "user", "content": "<audio> What did the voice say?"}, {"role": "assistant", "content": "The weather is really nice today"}], "audios": ["/xxx/x.mp3"]}
{"messages": [{"role": "system", "content": "You are a helpful and harmless assistant"}, {"role": "user", "content": "<image> What's in the image, <video> What's in the video?"}, {"role": "assistant", "content": "There's an elephant in the image, and a dog running on grass in the video"}], "images": ["/xxx/x.jpg"], "videos": ["/xxx/x.mp4"]}
```
- Note: The following fields will be automatically converted to corresponding images, videos, audios fields.
  - images: image, images.
  - videos: video, videos.
  - audios: audio, audios.
- If you want to pass base64 format instead of file paths, here's an example: `"videos": ['data:video/mp4;base64,{base64_encoded}']`, `"images": ['data:image/jpg;base64,{base64_encoded}']`.
- If you want to directly pass video frames instead of videos, you can use the following format (requires "ms-swift>=3.8.3"): `"videos": [["/xxx/x.png", "/xxx/y.png"], ["/xxx/a.png", "/xxx/b.png", "/xxx/c.png"]]`. This format is only supported by certain models, including Qwen2/2.5/3-VL, Qwen2.5/3-Omni and their derivative models.

The RLHF and sequence classification data formats for multimodal models can reference the formats for pure text large models, with the addition of `images` and other fields.

#### Grounding

For grounding (object detection) tasks, ms-swift supports two approaches:

1. Directly use the corresponding model's grounding task dataset format, for example, qwen2-vl format is as follows:

```jsonl
{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "<image> Describe the image"}, {"role": "assistant", "content": "A dog (221,423),(569,886) and a woman (451,381),(733,793) are playing on the beach"}], "images": ["/xxx/x.jpg"]}
{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "<image> Find the sheep in the image"}, {"role": "assistant", "content": "(101,201),(150,266)(401,601),(550,666)"}], "images": ["/xxx/x.jpg"]}
{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "<image> Help me open Google Chrome"}, {"role": "assistant", "content": "Action: click(start_box='(246,113)')"}], "images": ["/xxx/x.jpg"]}
```
When using this type of data, note:
- Different models have different special characters and dataset formats for grounding tasks.
- Different models handle bbox normalization differently. For example: qwen2.5-vl uses absolute coordinates, while qwen2/3-vl and internvl2.5 require thousandth coordinate normalization for bbox coordinates.
  - Note: Qwen2.5-VL uses absolute coordinates, so be careful with image scaling each time. If using Method 1 dataset format, you need to pre-resize the image (H and W should be multiples of 28) and scale coordinates accordingly. If using Method 2 dataset format, ms-swift will handle image scaling for you, and you can still use `MAX_PIXELS` or `--max_pixels` for image scaling (training only; for inference scenarios, you still need to handle image scaling yourself).

2. Use ms-swift's grounding dataset format:

```jsonl
{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "<image> Describe the image"}, {"role": "assistant", "content": "<ref-object><bbox> and <ref-object><bbox> are playing on the beach"}], "images": ["/xxx/x.jpg"], "objects": {"ref": ["a dog", "a woman"], "bbox": [[331.5, 761.4, 853.5, 1594.8], [676.5, 685.8, 1099.5, 1427.4]]}}
{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "<image> Find the <ref-object> in the image"}, {"role": "assistant", "content": "<bbox><bbox>"}], "images": ["/xxx/x.jpg"], "objects": {"ref": ["sheep"], "bbox": [[90.9, 160.8, 135, 212.8], [360.9, 480.8, 495, 532.8]]}}
{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "<image> Help me open Google Chrome"}, {"role": "assistant", "content": "Action: click(start_box='<bbox>')"}], "images": ["/xxx/x.jpg"], "objects": {"ref": [], "bbox": [[615, 226]]}}
```
This format will automatically convert the dataset to the corresponding model's grounding task format and select the appropriate bbox normalization method for the model. This format has an additional `objects` field compared to the general format, containing:
- `ref`: Used to replace `<ref-object>` in messages. The length of ref must match the number of `<ref-object>` placeholders.
- `bbox`: Used to replace `<bbox>` in messages. If each box in bbox has length 2, it represents x and y coordinates; if length 4, it represents x and y coordinates of two points. The length of bbox must match the number of `<bbox>` placeholders.
  - Note: `<ref-object>` and `<bbox>` have no correspondence; ref and bbox replace their respective placeholders independently.
- `bbox_type`: Optional values are 'real', 'norm1'. Defaults to 'real', meaning bbox contains real bbox values. If 'norm1', bbox is already normalized to 0~1.
- `image_id`: Usually used for multi-image grounding tasks. This parameter only takes effect when bbox_type is 'real', representing which image the bbox corresponds to for scaling purposes. Index starts from 0, defaults to all being the 0th image. The number of image_ids must match the number of bboxes. For example: if bbox length is 10 and images length is 2, then image_id length must be 10 with values in the set `{0, 1}`.

For Qwen2.5-VL/Qwen3-VL, you can use the environment variable `QWENVL_BBOX_FORMAT='new'` (defaults to 'legacy', requires "ms-swift>=3.9.1") to be compatible with the [official cookbook](https://github.com/QwenLM/Qwen3-VL/blob/main/cookbooks/2d_grounding.ipynb) format. Define the dataset as follows:
```jsonl
{"messages": [{"role": "user", "content": "<image> Find the <ref-object> in the image"}, {"role": "assistant", "content": "[\n\t{\"bbox_2d\": <bbox>, \"label\": \"<ref-object>\"},\n\t{\"bbox_2d\": <bbox>, \"label\": \"<ref-object>\"}\n]"}], "images": ["cat.png"], "objects": {"ref": ["sheep", "sheep", "sheep"], "bbox": [[90.9, 160.8, 135, 212.8], [360.9, 480.8, 495, 532.8]]}}
```

Test the final format of ms-swift's grounding dataset format:
```python
import os
os.environ["MAX_PIXELS"] = "1003520"
from swift.llm import get_model_tokenizer, get_template

_, tokenizer = get_model_tokenizer('Qwen/Qwen2.5-VL-7B-Instruct', load_model=False)
template = get_template(tokenizer.model_meta.template, tokenizer)
data = {...}
template.set_mode('train')
encoded = template.encode(data, return_template_inputs=True)
print(f'[INPUT_IDS] {template.safe_decode(encoded["input_ids"])}\n')
print(f'[LABELS] {template.safe_decode(encoded["labels"])}')
print(f'images: {encoded["template_inputs"].images}')
```

### Text-to-Image Format

```jsonl
{"messages": [{"role": "system", "content": "You are a helpful and harmless assistant"}, {"role": "user", "content": "Draw me an apple"}, {"role": "assistant", "content": "<image>"}], "images": ["/xxx/x.jpg"]}
```

### Agent Format

Here are example data samples for both text-only Agent and multimodal Agent:
```jsonl
{"tools": "[{\"type\": \"function\", \"function\": {\"name\": \"realtime_aqi\", \"description\": \"Weather forecast. Get real-time air quality. Current air quality, PM2.5, PM10 information\", \"parameters\": {\"type\": \"object\", \"properties\": {\"city\": {\"type\": \"string\", \"description\": \"City name, e.g.: Shanghai\"}}, \"required\": [\"city\"]}}}]", "messages": [{"role": "user", "content": "What's the weather like in Beijing and Shanghai today?"}, {"role": "tool_call", "content": "{\"name\": \"realtime_aqi\", \"arguments\": {\"city\": \"Beijing\"}}"}, {"role": "tool_call", "content": "{\"name\": \"realtime_aqi\", \"arguments\": {\"city\": \"Shanghai\"}}"}, {"role": "tool_response", "content": "{\"city\": \"Beijing\", \"aqi\": \"10\", \"unit\": \"celsius\"}"}, {"role": "tool_response", "content": "{\"city\": \"Shanghai\", \"aqi\": \"72\", \"unit\": \"fahrenheit\"}"}, {"role": "assistant", "content": "According to the weather forecast tool, Beijing's air quality index today is 10, which is good; Shanghai's air quality index today is 72, which is light pollution."}]}
{"tools": "[{\"type\": \"function\", \"function\": {\"name\": \"click\", \"description\": \"Click on a specific position on the screen\", \"parameters\": {\"type\": \"object\", \"properties\": {\"x\": {\"type\": \"integer\", \"description\": \"Horizontal coordinate, representing the horizontal position on the screen\"}, \"y\": {\"type\": \"integer\", \"description\": \"Vertical coordinate, representing the vertical position on the screen\"}}, \"required\": [\"x\", \"y\"]}}}]", "messages": [{"role": "user", "content": "<image> What time is it now?"}, {"role": "assistant", "content": "\nI can open the Calendar app to get the current time.\n\n"}, {"role": "tool_call", "content": "{\"name\": \"click\", \"arguments\": {\"x\": 105, \"y\": 132}}"}, {"role": "tool_response", "content": "{\"images\": \"<image>\", \"status\": \"success\"}"}, {"role": "assistant", "content": "Successfully opened the Calendar app, the current time is 11 AM"}], "images": ["desktop.png", "calendar.png"]}
```
- When agent_template is "react_en", "hermes", etc., this format is compatible with all model Agent training, allowing easy switching between different models.
- The tools field is a JSON string containing a list of tools, and the content parts of messages with role 'tool_call' and 'tool_response/tool' must be JSON strings.
- The tools field will be combined with the `{"role": "system", ...}` part during training/inference to form the complete system part according to agent_template.
- The `{"role": "tool_call", ...}` part will be automatically converted to the corresponding format of `{"role": "assistant", ...}` according to agent_template, and multiple consecutive `{"role": "assistant", ...}` will be concatenated to form the complete assistant_content.
- `{"role": "tool_response", ...}` can also be written as `{"role": "tool", ...}`, and these two notations are equivalent. This part will also be automatically converted according to `agent_template`. During training, loss calculation will not be performed on this part, similar to `{"role": "user", ...}`.
- This format supports parallel tool calls, as shown in the first data sample. In multimodal Agent data samples, the number of `<image>` tags should match the length of "images", with tag positions representing where image features are inserted. Other modalities like audios and videos are also supported.
- Note: You can also manually process the data into the standard messages format with roles system/user/assistant. The agent_template's role is to automatically map the tools field and messages parts with roles tool_call and tool_response to the standard messages format with roles system/user/assistant.
- For more details, please refer to [Agent Documentation](../功能指引/Agent Support.md).

## dataset_info.json

Refer to ms-swift's built-in [dataset_info.json](https://github.com/modelscope/ms-swift/blob/main/swift/llm/dataset/data/dataset_info.json). This method uses AutoPreprocessor to convert datasets into standard format. The dataset_info.json file contains a list of dataset metadata, with some examples below:

```json
[
  {
    "ms_dataset_id": "xxx/xxx"
  },
  {
    "dataset_path": "<dataset_dir/dataset_path>"
  },
  {
    "ms_dataset_id": "<dataset_id>",
    "subsets": ["v1"],
    "split": ["train", "validation"],
    "columns": {
      "input": "query",
      "output": "response"
    }
  },
  {
    "ms_dataset_id": "<dataset_id>",
    "hf_dataset_id": "<hf_dataset_id>",
    "subsets": [{
      "subset": "subset1",
      "columns": {
        "problem": "query",
        "content": "response"
      }
    },
    {
      "subset": "subset2",
      "columns": {
        "messages": "_",
        "new_messages": "messages"
      }
    }]
  }
]
```

Supported parameters:
- ms_dataset_id: Refer to DatasetMeta parameters.
- hf_dataset_id: Refer to DatasetMeta parameters.
- dataset_path: Refer to DatasetMeta parameters.
- dataset_name: Refer to DatasetMeta parameters.
- subsets: Refer to DatasetMeta parameters.
- split: Refer to DatasetMeta parameters.
- columns: Perform column name conversion on the dataset before preprocessing.

## Dataset Registration

register_dataset registers datasets in `DATASET_MAPPING`. Simply call the function `register_dataset(dataset_meta)` to complete dataset registration, where dataset_meta stores the model's metadata. The parameters for DatasetMeta are as follows:
- ms_dataset_id: ModelScope's dataset_id, defaults to None.
- hf_dataset_id: HuggingFace's dataset_id, defaults to None.
- dataset_path: Local path of the dataset (absolute path recommended). Defaults to None.
- dataset_name: Dataset alias, can be specified using `--dataset <dataset_name>`, convenient when dataset_path is very long. Defaults to None.
- subsets: List of sub-dataset names or `SubsetDataset` objects, defaults to `['default']`. (Only dataset_id or dataset_dir (git clone open-source datasets) have concepts of sub-datasets and splits).
- split: Defaults to `['train']`.
- preprocess_func: Preprocessing function or callable object, defaults to `AutoPreprocessor()`. This preprocessing function interface takes `HfDataset` as input and returns `HfDataset` in standard format.
- load_function: Defaults to `DatasetLoader.load`. If custom loading function is needed, the loading function should return `HfDataset` in standard format, discarding ms-swift's dataset loading mechanism and providing maximum freedom to users. Usually this parameter doesn't need to be modified.