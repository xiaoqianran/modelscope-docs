<!-- modelscope-docs: Reranker Training | llm-training-and-inference/best-practices/reranker/reranker_EN.md -->

# Reranker Training

SWIFT already supports training of Reranker models. Currently supported models include:

1. modernbert reranker model
   - [ModelScope](https://www.modelscope.cn/models/iic/gte-reranker-modernbert-base) [Hugging Face](https://huggingface.co/Alibaba-NLP/gte-reranker-modernbert-base)
2. qwen3-reranker model
   - 0.6B: [ModelScope](https://www.modelscope.cn/models/Qwen/Qwen3-Reranker-0.6B) [Hugging Face](https://huggingface.co/Qwen/Qwen3-Reranker-0.6B)
   - 4B: [ModelScope](https://www.modelscope.cn/models/Qwen/Qwen3-Reranker-4B) [Hugging Face](https://huggingface.co/Qwen/Qwen3-Reranker-4B)
   - 8B: [ModelScope](https://www.modelscope.cn/models/Qwen/Qwen3-Reranker-8B) [Hugging Face](https://huggingface.co/Qwen/Qwen3-Reranker-8B)

## Implementation Methods

Currently, SWIFT supports two implementation methods for Reranker models, which differ significantly in architecture and loss function calculation:

### 1. Classification-based Reranker

**Applicable Models:** modernbert reranker models (e.g., gte-reranker-modernbert-base)

**Core Principle:**
- Based on sequence classification architecture, adding a classification head on top of the pre-trained model
- Input: query-document pairs, Output: single relevance score


### 2. Generative Reranker

**Applicable Models:** qwen3-reranker models (0.6B/4B/8B)

**Core Principle:**
- Based on generative language model architecture (CausalLM)
- Input: query-document pairs, Output: probability of specific tokens (e.g., "yes"/"no")
- Performs classification by comparing logits of specific tokens at the final position

## Loss Function Types

SWIFT supports multiple loss functions for training Reranker models:

### Pointwise Loss Functions
Pointwise methods transform the ranking problem into a binary classification problem, processing each query-document pair independently:

- **Core Idea:** Perform binary classification on each query-document pair to determine if the document is relevant to the query
- **Loss Function:** Binary cross-entropy
- **Applicable Scenarios:** Simple and efficient, suitable for large-scale data training

Environment variable configuration:
- `GENERATIVE_RERANKER_POSITIVE_TOKEN`: Positive token (default: "yes")
- `GENERATIVE_RERANKER_NEGATIVE_TOKEN`: Negative token (default: "no")

### Listwise Loss Functions
Listwise methods transform the ranking problem into a multi-classification problem, selecting positive examples from multiple candidate documents:

- **Core Idea:** Perform multi-classification on candidate document groups for each query (1 positive + n negatives) to identify the positive document
- **Loss Function:** Multi-class cross-entropy
- **Applicable Scenarios:** Learns relative ranking relationships between documents, better aligned with real-world information retrieval requirements

Environment variable configuration:
- `LISTWISE_RERANKER_TEMPERATURE`: Softmax temperature parameter (default: 1.0)
- `LISTWISE_RERANKER_MIN_GROUP_SIZE`: Minimum group size; if the number of documents in a group is less than this value, no loss is calculated (default: 2)

**Listwise vs Pointwise:**
- **Pointwise:** Independently judges relevance, simple training, but ignores relative relationships between documents
- **Listwise:** Learns relative ranking, better performance, more suitable for the essential nature of ranking tasks

The source code for loss functions can be found [here](https://github.com/modelscope/ms-swift/blob/main/swift/plugin/loss.py).

## Dataset Format

```json lines
{"messages": [{"role": "user", "content": "query"}], "positive_messages": [[{"role": "assistant", "content": "relevant_doc1"}],[{"role": "assistant", "content": "relevant_doc2"}]], "negative_messages": [[{"role": "assistant", "content": "irrelevant_doc1"}],[{"role": "assistant", "content": "irrelevant_doc2"}], ...]}
```

**Field Description:**
- `messages`: Query text
- `positive_messages`: List of relevant positive documents for the query, supports multiple positives
- `negative_messages`: List of irrelevant negative documents for the query, supports multiple negatives

**Environment Variable Configuration:**
- `MAX_POSITIVE_SAMPLES`: Maximum number of positive samples per query (default: 1)
- `MAX_NEGATIVE_SAMPLES`: Maximum number of negative samples per query (default: 7)

> By default, `MAX_POSITIVE_SAMPLES` positive samples and `MAX_NEGATIVE_SAMPLES` negative samples will be extracted from each data entry. Each positive sample will be combined with `MAX_NEGATIVE_SAMPLES` negative samples to form a group, so each data entry will be expanded into `MAX_POSITIVE_SAMPLES` × (1 + `MAX_NEGATIVE_SAMPLES`) data entries.
> If the number of positive/negative samples in the data is insufficient, all available positive/negative samples will be used. If the number of positive and negative samples exceeds `MAX_POSITIVE_SAMPLES` and `MAX_NEGATIVE_SAMPLES`, random sampling will be performed.
> **IMPORTANT**: The expanded data will be placed in the same batch, so the actual effective batch size per device will be `per_device_train_batch_size` × `MAX_POSITIVE_SAMPLES` × (1 + `MAX_NEGATIVE_SAMPLES`). Please adjust `per_device_train_batch_size` accordingly to avoid VRAM overflow.

## Scaffolding

SWIFT provides four scaffolding training scripts:

- [Pointwise Classification-based Reranker](https://github.com/modelscope/ms-swift/blob/main/examples/train/reranker/train_reranker.sh)
- [Pointwise Generative Reranker](https://github.com/modelscope/ms-swift/blob/main/examples/train/reranker/train_generative_reranker.sh)
- [Listwise Classification-based Reranker](https://github.com/modelscope/ms-swift/blob/main/examples/train/reranker/train_reranker_listwise.sh)
- [Listwise Generative Reranker](https://github.com/modelscope/ms-swift/blob/main/examples/train/reranker/train_generative_reranker_listwise.sh)

## Advanced Features

- Qwen3-Reranker Custom Instruction:
  - Default template as follows:

```text
<|system|>
Judge whether the Document meets the requirements based on the Query and the Instruct provided. Note that the answer can only be "yes" or "no".
<|user|>
<Instruct>: {Instruction}
<Query>: {Query}
<Document>: {Document}
<|assistant|>
```

- Default Instruction:
  - `Given a web search query, retrieve relevant passages that answer the query`

- Instruction Priority (nearest override):
  - `system` provided in `positive_messages`/`negative_messages` > `system` in main `messages` > Default Instruction.
  - That is: if a `system` is included within a positive/negative message sequence, it takes priority; otherwise, if the main `messages` contains a `system`, it will be used; if neither is provided, the default Instruction is used.