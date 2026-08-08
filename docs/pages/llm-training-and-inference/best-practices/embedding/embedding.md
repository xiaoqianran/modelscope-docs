<!-- modelscope-docs: Embedding Training | llm-training-and-inference/best-practices/embedding/embedding_EN.md -->

# Embedding Training

SWIFT already supports training of Embedding models, including both pure text and multimodal types. Currently supported models include:

1. modernbert embedding model
   - [ModelScope](https://modelscope.cn/models/iic/gte-modernbert-base) [Hugging Face](https://huggingface.co/Alibaba-NLP/gte-modernbert-base)
2. gte embedding model
   - 1.5B: [ModelScope](https://www.modelscope.cn/models/iic/gte_Qwen2-1.5B-instruct) [Hugging Face](https://huggingface.co/Alibaba-NLP/gte-Qwen2-1.5B-instruct)
   - 7B: [ModelScope](https://www.modelscope.cn/models/iic/gte_Qwen2-7B-instruct) [Hugging Face](https://huggingface.co/Alibaba-NLP/gte-Qwen2-7B-instruct)
3. gme embedding model
   - 2B: [ModelScope](https://www.modelscope.cn/models/iic/gme-Qwen2-VL-2B-Instruct) [Hugging Face](https://huggingface.co/Alibaba-NLP/gme-Qwen2-VL-2B-Instruct)
   - 7B: [ModelScope](https://www.modelscope.cn/models/iic/gme-Qwen2-VL-7B-Instruct) [Hugging Face](https://huggingface.co/Alibaba-NLP/gme-Qwen2-VL-7B-Instruct)
4. qwen3-embedding model
   - 0.6B: [ModelScope](https://www.modelscope.cn/models/Qwen/Qwen3-Embedding-0.6B) [Hugging Face](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B)
   - 4B: [ModelScope](https://www.modelscope.cn/models/Qwen/Qwen3-Embedding-4B) [Hugging Face](https://huggingface.co/Qwen/Qwen3-Embedding-4B)
   - 8B: [ModelScope](https://www.modelscope.cn/models/Qwen/Qwen3-Embedding-8B) [Hugging Face](https://huggingface.co/Qwen/Qwen3-Embedding-8B)

Developers can integrate their own models. The model's forward output needs to satisfy:

```text
{"last_hidden_state": some-embedding-tensor}
```

The return value should be a JSON object with a `last_hidden_state` key, where the value is the embedding tensor. For input, you can use the templates we already support. Users can also specify the parameter:

```shell
   --task_type embedding
```

to convert any other model into an embedding model for training.

Note that currently, SWIFT only supports embedding models that conform to pure text or multimodal LLMs, and does not support CLIP-type model training.

Additionally, all embedding models supported by SWIFT have added normalization at the end of the model's forward pass. Please remember to add a normalization layer when integrating new models.

## Loss

Currently, SWIFT-supported Embedding models can use the following loss functions:

- cosine_similarity: cosine similarity loss, which calculates the similarity between two embeddings and fits according to the label value (essentially MSE loss)
- contrastive: contrastive learning loss with adjustable margin, where labels only support values 0 and 1
- online_contrastive: contrastive loss considering hard negative and hard positive samples, where labels only support values 0 and 1
- infonce: computes cosine similarity pairwise between different rows within the same batch, maximizing similarity within rows and minimizing similarity between different rows, without requiring labels

The source code for these loss functions can be found [here](https://github.com/modelscope/ms-swift/blob/main/swift/plugin/loss.py).

## Dataset Format

> Notes:
> 1. `<image>` tags can appear in any position within `messages`/`positive_messages`/`negative_messages`; they each have independent `images`/`positive_images`/`negative_images` fields to provide image paths or URLs.
> 2. Cross-field "corresponding order" is no longer required. Alignment rules: the length of `images` equals the number of `<image>` tags in `messages`; `positive_images` and `negative_images` are both "list of lists", where the outer length equals the length of `positive_messages` and `negative_messages` respectively; and the inner list length of each outer item equals the number of `<image>` tags in that message sequence.
> 3. `messages` represents the anchor sample; `positive_messages`/`negative_messages` are "list of messages" (thus having an additional `[]` layer); correspondingly, `positive_images`/`negative_images` also have an additional `[]` layer and align item-by-item.
> 4. `<video>` and `<audio>` tags are also supported; corresponding modal data can be provided through `videos`/`positive_videos`/`negative_videos` and `audios`/`positive_audios`/`negative_audios` following the same rules.
> 5. Current constraint: the outer length of `positive_messages` must be 1 (i.e., only one positive sample is provided); correspondingly, the outer length of `positive_images` must also be 1.

### Format for cosine_similarity loss

```json lines
# LLM
{"messages": [{"role": "user", "content": "sentence1"}], "positive_messages": [[{"role": "user", "content": "sentence2"}]], "label": 0.8}
# MLLM
{"messages": [{"role": "user", "content": "<image>"}], "images": ["/some/images1.jpg"],"positive_messages": [[{"role": "user", "content": "<image>sentence"}]], "positive_images": [["/some/images2.jpg"]], "label": 0.7}
{"messages": [{"role": "user", "content": "sentence1"}], "positive_messages": [[{"role": "user", "content": "<image>sentence2"}]], "positive_images": [["/some/images.jpg"]], "label": 0.7}
```


### Format for contrastive/online_contrastive loss

```json lines
# LLM
{"messages": [{"role": "user", "content": "sentence1"}], "positive_messages": [[{"role": "user", "content": "sentence2"}]], "label": 1}
# MLLM
{"messages": [{"role": "user", "content": "<image>"}], "images": ["/some/images1.jpg"], "positive_messages": [[{"role": "user", "content": "<image>sentence"}]], "positive_images": [["/some/images2.jpg"]], "label": 1}
{"messages": [{"role": "user", "content": "sentence1"}], "positive_messages": [[{"role": "user", "content": "<image>sentence2"}]], "positive_images": [["/some/images.jpg"]], "label": 0}
```

Evaluation metrics include Pearson and Spearman coefficients for Euclidean distance, dot product, and other measures between two embeddings, totaling eight metrics.

### infonce format

```json lines
# LLM
{"messages": [{"role": "user", "content": "sentence1"}], "positive_messages": [[{"role": "user", "content": "sentence2"}]]}
# MLLM
{"messages": [{"role": "user", "content": "<image>"}], "images": ["/some/images.jpg"], "positive_messages": [[{"role": "user", "content": "sentence"}]]}
{"messages": [{"role": "user", "content": "<image>sentence1"}], "images": ["/some/images.jpg"], "positive_messages": [[{"role": "user", "content": "<image>sentence2"}]], "positive_images": [["/some/positive_images.jpg"]], "negative_messages": [[{"role": "user", "content": "<image><image>sentence3"}], [{"role": "user", "content": "<image>sentence4"}]], "negative_images": [["/some/negative_images1.jpg", "/some/negative_images2.jpg"], ["/some/negative_images3.jpg"]]}
```

infonce loss supports several environment variables:
1. `INFONCE_TEMPERATURE`: temperature parameter, default value is 0.1 if not set
2. `INFONCE_USE_BATCH`: whether to use `negative_messages` within the sample (hard negative examples) or use other samples within a batch as in-batch negatives; default is True, meaning using samples within the batch as negative examples
3. `INFONCE_HARD_NEGATIVES`: number of hard negatives; if not set, all provided `negative_messages` in the data will be used. Since lengths may vary, loss calculation will use a for loop (slower computation). If set to a specific value, insufficient samples will be randomly sampled to fill, and excess will use the first `INFONCE_HARD_NEGATIVES` samples
4. `INFONCE_MASK_FAKE_NEGATIVE`: mask fake negatives. Default is False; when enabled, it checks `positive_similarity + INFONCE_FAKE_NEG_MARGIN`, and samples with similarity above this threshold will be set to `-inf` to prevent positive sample leakage
5. `INFONCE_FAKE_NEG_MARGIN`: margin for fake negative masking, default is `0.1`
6. `INFONCE_INCLUDE_QQ`: whether to include q–q components (query-query similarity) in the denominator as negative examples, default is `False`
7. `INFONCE_INCLUDE_DD`: whether to include d–d components (similarity between positive document samples and all documents in the batch) in the denominator as negative examples, default is `False`

> You can also set the number of hard negatives to be equal in the dataset, so even without setting this parameter, the for loop method won't be used, speeding up computation
> `negative_messages` can also be omitted. In this case, keeping `INFONCE_USE_BATCH=True` will use other samples within the batch as negative examples

infonce loss evaluation includes the following metrics:
- mean_neg: average of all hard_negative values
- mean_pos: average of all positive values  
- margin: average of positive-max_hard_negative

## Scaffolding

SWIFT provides two scaffolding training scripts:

- [Qwen3-Embedding model](https://github.com/modelscope/ms-swift/blob/main/examples/train/embedding/train_emb.sh)
- [GME model](https://github.com/modelscope/ms-swift/blob/main/examples/train/embedding/train_gme.sh)

## Inference

SWIFT already supports deployment of GME, GTE, and Qwen3-Embedding models. Please check [here](https://github.com/modelscope/ms-swift/blob/main/examples/deploy/embedding/client.py).

You can also use the original model's code for inference:

https://www.modelscope.cn/models/iic/gte_Qwen2-7B-instruct

https://www.modelscope.cn/models/iic/gme-Qwen2-VL-7B-Instruct

If you trained an embedding model from scratch using other models (e.g., original `qwen2-vl` model + `--task_type embedding`), you can also use GME's inference code, but please note:

https://www.modelscope.cn/models/iic/gme-Qwen2-VL-7B-Instruct/file/view/master/gme_inference.py?status=1#L111

Please modify the template here to match your model's own template to ensure the final embeddings align correctly. Note that the GME model's template differs from the `qwen2-vl` or `qwen2.5-vl` series' chatml template—the ending character in the inference code is `` instead of ``.

## Advanced Features

- Qwen3-Embedding Custom Instruction:
  - Default has no Instruction, input template is: `{Query}`.
  - By adding an Instruction in the system message, the input can be changed to: `{Instruction} {Query}`.
  - Example:

```json lines
{"messages": [
  {"role": "system", "content": "Please answer in Chinese and output concise key points"},
  {"role": "user", "content": "Introduce Qwen3-Embedding"}
]}
```

> Note: The Qwen3-Embedding template prepends the system content to the first user message and uses `` as the ending marker.

### Examples Before and After Conversion

- Without Instruction:

  Input data (messages):

  ```json lines
  {"messages": [
    {"role": "user", "content": "What's the weather like in Beijing tomorrow?"}
  ]}
  ```

  Template conversion result (actual text fed to the model):

  ```text
  What's the weather like in Beijing tomorrow?
  ```

- With Instruction:

  Input data (messages with system):

  ```json lines
  {"messages": [
    {"role": "system", "content": "Please use Chinese and output concise key points"},
    {"role": "user", "content": "What's the weather like in Beijing tomorrow?"}
  ]}
  ```

  Template conversion result (actual text fed to the model):

  ```text
  Please use Chinese and output concise key points What's the weather like in Beijing tomorrow?
  ```

- positive/negative works similarly:

  If a system is provided in a positive/negative message sequence, the system content will be prepended to the first user content of that sequence; if no system is provided, nothing is prepended.

  Input data (containing one positive with system, and one negative without system):

  ```json lines
  {
    "messages": [
      {"role": "user", "content": "Anchor"}
    ],
    "positive_messages": [[
      {"role": "system", "content": "Instruction"},
      {"role": "user", "content": "Positive"}
    ]],
    "negative_messages": [[
      {"role": "user", "content": "Negative"}
    ]]
  }
  ```

  Template conversion result (actual text fed to the model):

  ```text
  Anchor
  Instruction Positive
  Negative
  ```