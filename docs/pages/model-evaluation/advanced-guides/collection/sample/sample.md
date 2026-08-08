<!-- modelscope-docs: Sampling Data | model-evaluation/advanced-guides/collection/sample/sample_EN.md -->

# Sampling Data

In data mixing evaluation, sampling data is the second step of data mixing evaluation. Currently, three sampling methods are supported: weighted sampling, stratified sampling, and uniform sampling.

## Data Format

The sampling data format is JSONL, where each line is a JSON object containing attributes such as `index`, `prompt`, `tags`, `task_type`, `weight`, `dataset_name`, and `subset_name`.

```json
{
    "index": 0,
    "prompt": {"question": "What is the capital of France?"},
    "tags": ["en", "reasoning"],
    "task_type": "question_answering",
    "weight": 1.0,
    "dataset_name": "arc",
    "subset_name": "ARC-Easy",
}
```

## Weighted Sampling

Weighted sampling samples data according to dataset weights—the higher the weight, the more samples are drawn. For nested schemas, weighted sampling scales according to each schema's weight, ensuring the sum of all dataset weights equals 1.

For example, when sampling 100 data points in total, if the schema contains two datasets—Dataset A with a weight of 3 and Dataset B with a weight of 1—then Dataset A will have 75 samples and Dataset B will have 25 samples.

```python
from evalscope.collections import WeightedSampler
from evalscope.utils.io_utils import dump_jsonl_data

sampler = WeightedSampler(schema)
mixed_data = sampler.sample(100)
dump_jsonl_data(mixed_data, 'outputs/weighted_mixed_data.jsonl')
```

## Stratified Sampling

Stratified sampling draws samples based on the number of samples in each dataset within the schema, where the number of samples from each dataset is proportional to its own sample count.

For example, when sampling 100 data points in total, if the schema contains two datasets—Dataset A with 800 data points and Dataset B with 200 data points—then Dataset A will have 80 samples and Dataset B will have 20 samples.

```python
from evalscope.collections import StratifiedSampler

sampler = StratifiedSampler(schema)
mixed_data = sampler.sample(100)
dump_jsonl_data(mixed_data, 'outputs/stratified_mixed_data.jsonl')
```

## Uniform Sampling

Uniform sampling draws samples based on the number of datasets in the schema, where each dataset receives the same number of samples.

For example, when sampling 100 data points in total, if the schema contains two datasets—Dataset A with 800 data points and Dataset B with 200 data points—then both Dataset A and Dataset B will have 50 samples each.

```python
from evalscope.collections import UniformSampler

sampler = UniformSampler(schema)
mixed_data = sampler.sample(100)
dump_jsonl_data(mixed_data, 'outputs/uniform_mixed_data.jsonl')
```