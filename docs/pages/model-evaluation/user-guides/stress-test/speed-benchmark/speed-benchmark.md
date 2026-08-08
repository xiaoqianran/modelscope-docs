<!-- modelscope-docs: Speed Benchmark | model-evaluation/user-guides/stress-test/speed-benchmark/speed-benchmark_EN.md -->

# Speed Benchmark

If you want to perform a speed test (the standard speed of a model under a single request) and obtain speed benchmarks similar to the [official Qwen](https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html) report as shown below:

![image](./_resources/qwen_speed_benchmark.png)

You can use `--dataset [speed_benchmark|speed_benchmark_long]` to specify the dataset for speed testing:

- `speed_benchmark`: Tests prompts with lengths of [1, 6144, 14336, 30720], with a fixed output of 2048 tokens. A total of 8 requests, with 2 requests for each prompt length.
- `speed_benchmark_long`: Tests prompts with lengths of [63488, 129024], with a fixed output of 2048 tokens. A total of 4 requests, with 2 requests for each prompt length.


## Online API Inference

> [!NOTE]
> For speed testing, `--url` needs to use the `/v1/completions` endpoint instead of `/v1/chat/completions` to avoid additional processing by the chat template affecting the input length.

```bash
evalscope perf \
 --parallel 1 \
 --number 8 \
 --url http://127.0.0.1:8000/v1/completions \
 --model qwen2.5 \
 --log-every-n-query 5 \
 --connect-timeout 6000 \
 --read-timeout 6000 \
 --max-tokens 2048 \
 --min-tokens 2048 \
 --api openai \
 --dataset speed_benchmark
```


## Local Transformer Inference
```bash
CUDA_VISIBLE_DEVICES=0 evalscope perf \
 --parallel 1 \
 --model Qwen/Qwen2.5-0.5B-Instruct \
 --attn-implementation flash_attention_2 \
 --log-every-n-query 5 \
 --connect-timeout 6000 \
 --read-timeout 6000 \
 --max-tokens 2048 \
 --min-tokens 2048 \
 --api local \
 --dataset speed_benchmark \
 --number 8
```

Sample output:
```text
Speed Benchmark Results:
+---------------+-----------------+----------------+
| Prompt Tokens | Speed(tokens/s) | GPU Memory(GB) |
+---------------+-----------------+----------------+
|       1       |      50.69      |      0.97      |
|     6144      |      51.36      |      1.23      |
|     14336     |      49.93      |      1.59      |
|     30720     |      49.56      |      2.34      |
+---------------+-----------------+----------------+
```

## Local vLLM Inference
```bash
CUDA_VISIBLE_DEVICES=0 evalscope perf \
 --parallel 1 \
 --number 8 \
 --model Qwen/Qwen2.5-0.5B-Instruct \
 --log-every-n-query 5 \
 --connect-timeout 6000 \
 --read-timeout 6000 \
 --max-tokens 2048 \
 --min-tokens 2048 \
 --api local_vllm \
 --dataset speed_benchmark
```

Sample output:
> [!NOTE]
> GPU usage is obtained through the `torch.cuda.max_memory_allocated` function, so GPU usage is not displayed here.
```text
Speed Benchmark Results:
+---------------+-----------------+----------------+
| Prompt Tokens | Speed(tokens/s) | GPU Memory(GB) |
+---------------+-----------------+----------------+
|       1       |     343.08      |      0.0       |
|     6144      |     334.71      |      0.0       |
|     14336     |     318.88      |      0.0       |
|     30720     |     292.86      |      0.0       |
+---------------+-----------------+----------------+
```