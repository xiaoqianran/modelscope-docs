<!-- modelscope-docs: Multimodal GRPO Training | llm-training-and-inference/best-practices/multimodal-grpo/multimodal-grpo_EN.md -->

# Complete Multimodal GRPO Experimental Workflow
This document describes how to use SWIFT GRPO for training multimodal models and tasks. The goal is to train on multiple multimodal tasks to improve task accuracy. Task definitions and training parameters reference [R1-V](https://github.com/Deep-Agent/R1-V.git) and [open-r1-multimodal](https://github.com/EvolvingLMMs-Lab/open-r1-multimodal.git).

## ClevrCount Task
### Task and Dataset Definition
This task starts from the clevr_cogen_a_train dataset, where the model's objective is to output the number of objects contained in an image. Therefore, we define the dataset as follows:

```python
class ClevrPreprocessor(ResponsePreprocessor):

    def preprocess(self, row: Dict[str, Any]) -> Dict[str, Any]:
        query = row.get('query', '')
        query = f"""{query} Output the thinking process in <thinking> </thinking> and
 final answer (number) in <answer> </answer> tags."""
        row.update({'query': query})
        return super().preprocess(row)


register_dataset(
    DatasetMeta(
        ms_dataset_id='AI-ModelScope/clevr_cogen_a_train',
        subsets=[
            SubsetDataset(
                name='default',
                subset='default',
                split=['train'],
            ),
        ],
        preprocess_func=ClevrPreprocessor(),
        tags=['qa', 'math']))

```
The purpose of redefining the dataset preprocessor here is to modify the query. Sample dataset entries are shown below, containing messages, images, and solution fields. The solution field will be passed to subsequent reward functions, while messages and images will serve as model inputs.
- Note: `{'role': 'assistant', 'content': '<answer> 3 </answer>'}` will be removed in GRPOTrainer and can be ignored. The 'solution' field will be passed through to the ORM. When creating custom datasets, organize the 'images' field as `["image_path1", "image_path2"]`.

```json
{
    "images": ["image_path1", "image_path2"],
    "messages": [
        {
            "role": "user",
            "content": "How many items are there in the image? Output the thinking process in <thinking> </thinking> and \n final answer (number) in <answer> </answer> tags."
        }
    ],
    "solution": "<answer> 3 </answer>"
}
```


## Reward Function Definition:
This task uses two reward functions: one is the format reward function mentioned in Deepseek-R1, and the other is the accuracy reward function for ClevrCount. The former is already built into swift and can be used directly via `--reward_funcs format`, while the latter needs to be defined by ourselves. Here, we use the external_plugin approach to define the accuracy reward function, placing the code in `swift/examples/train/grpo/plugin/plugin.py`.

In this case, the reward function inputs include completions and solution fields, representing the model-generated text and ground truth respectively. Each is a list, supporting simultaneous calculation of multiple completions. Note that the solution field is passed through from the dataset definition. If there are task changes, corresponding modifications can be made to both the dataset and reward function.

```python

class MultiModalAccuracyORM(ORM):

    def __call__(self, completions, solution, **kwargs) -> List[float]:
        """
        Reward function that checks if the completion is correct.
        Args:
            completions (list[str]): Generated outputs
            solution (list[str]): Ground Truths.

        Returns:
            list[float]: Reward scores
        """
        rewards = []
        from math_verify import parse, verify
        for content, sol in zip(completions, solution):
            reward = 0.0
            # Try symbolic verification first
            try:
                answer = parse(content)
                if float(verify(answer, parse(sol))) > 0:
                    reward = 1.0
            except Exception:
                pass  # Continue to next verification method if this fails

            # If symbolic verification failed, try string matching
            if reward == 0.0:
                try:
                    # Extract answer from solution if it has think/answer tags
                    sol_match = re.search(r'<answer>(.*?)</answer>', sol)
                    ground_truth = sol_match.group(1).strip() if sol_match else sol.strip()

                    # Extract answer from content if it has think/answer tags
                    content_match = re.search(r'<answer>(.*?)</answer>', content)
                    student_answer = content_match.group(1).strip() if content_match else content.strip()

                    # Compare the extracted answers
                    if student_answer == ground_truth:
                        reward = 1.0
                except Exception:
                    pass  # Keep reward as 0.0 if both methods fail
            rewards.append(reward)
        return rewards
orms['external_r1v_acc'] = MultiModalAccuracyORM
```

### GRPO Training Experimental Records
#### Training Parameters:
We selected Qwen2.5-VL-3B-Instruct as the base model for training. The main reason for choosing Instruct over the base model is to obtain format rewards more quickly. We conducted experiments on eight GPUs. If you encounter vLLM deployment errors with qwen2.5-vl, please refer to [issue](https://github.com/vllm-project/vllm/issues/13285).

Since the task is simple, we set max_completion_length to 1024. The reward functions selected are external_r1v_acc and format, with learning rate and beta set to 1e-6 and 0.001 respectively. Other settings are shown below. The principles for setting batch_size and num_generations can be referenced from [Complete GRPO Workflow](./GRPO完整流程.md).
First, start the external vLLM server:
```bash
CUDA_VISIBLE_DEVICES=6,7 \
swift rollout \
    --model Qwen/Qwen2.5-VL-3B-Instruct \
    --vllm_data_parallel_size 2
```

```shell
WANDB_API_KEY=your_wandb_api_key \
CUDA_VISIBLE_DEVICES=0,1,2,3,4,5 \
NPROC_PER_NODE=6 \
swift rlhf \
    --rlhf_type grpo \
    --model Qwen/Qwen2.5-VL-3B-Instruct \
    --external_plugins examples/train/grpo/plugin/plugin.py \
    --reward_funcs external_r1v_acc format \
    --use_vllm true \
    --vllm_mode server \
    --vllm_server_host 127.0.0.1 \
    --vllm_server_port 8000 \
    --train_type full \
    --torch_dtype bfloat16 \
    --dataset 'okwinds/clevr_cogen_a_train' \
    --max_completion_length 1024 \
    --num_train_epochs 1 \
    --per_device_train_batch_size 8 \
    --per_device_eval_batch_size 8 \
    --learning_rate 1e-6 \
    --gradient_accumulation_steps 2 \
    --save_strategy 'steps' \
    --eval_strategy 'steps' \
    --eval_steps 1000 \
    --save_steps 1000 \
    --save_total_limit 10 \
    --logging_steps 1 \
    --output_dir output/GRPO_CLEVR_COUNTDOWN \
    --warmup_ratio 0.01 \
    --dataloader_num_workers 4 \
    --num_generations 24 \
    --temperature 1.0 \
    --system 'examples/train/grpo/prompt.txt' \
    --deepspeed zero3 \
    --log_completions true \
    --report_to wandb \
    --num_iterations 1 \
    --async_generate false \
    --beta 0.001 \
```

#### Experimental Observations
![image.png](./_resources/grpo_clevr_count.png)

Since the dataset and task are relatively simple, the model has essentially converged after training for 500 epochs, with the following observations:
1. The custom ClevrORM continues to increase, proving that the model has learned how to complete this task, with the final task success rate climbing from an initial 0.4 to around 1.
2. Since it's an Instruct model, Format Reward remains stable at 1, which may also be related to all samples in the dataset having identical queries.
3. reward_std stabilizes below 0.1.
4. completion length eventually stabilizes between 60-80, with the model learning a fixed output pattern of enumerating objects one by one.

step 1:
```
"<thinking> The image shows 5 distinct items: a cyan metallic cylinder, a red metallic cylinder, a small purple metallic cylinder, a large gray metallic sphere, and a small yellow metallic cube. To count the number of items, I add the counts of each type of object: 1 cyan cylinder, 1 red cylinder, 1 purple cylinder, 1 gray sphere, and 1 yellow cube. Therefore, the total number of items is 5. </thinking>\n<answer>5</answer>"
"Let's count the number of items in the image:\n1. A large cyan metallic cylinder.\n2. A small purple metallic cylinder.\n3. A large red metallic cylinder.\n4. A large gray metallic sphere.\n5. A small yellow metallic cube.\n\n<answer>5</answer>"
"<thinking> The image shows four distinct objects: a large cyan metallic cylinder, a smaller purple metallic cylinder, a large red metallic cylinder, and a small yellow metallic cube. Counting each of these items individually, there are five items in total. </thinking>\n<answer>5</answer>"
```

step 400:
```
"<thinking> Counting the number of items in the image:\n1. Green matte sphere\n2. Large metallic yellow sphere\n3. Small metallic brown cube\n\nThere are three distinct objects in total.\n</thinking>\n<answer>3</answer>"
"<thinking> Counting the objects in the image:\n1. Large yellow metallic sphere\n2. Small green rubber sphere\n3. Small brown metallic cube\n\nThere are three distinct items in the image.\n</thinking>\n<answer>3</answer>"
```

Overall, this task is relatively simple, and the reward convergence is quite typical.

## Geometric QA Task
### Task and Dataset Definition
This task is a Geometric QA task, described as: given a geometric figure, answer mathematical questions about the geometric figure. The original data comes from [paper](https://arxiv.org/pdf/2312.11370), and [R1-V](https://github.com/Deep-Agent/R1-V.git) has preprocessed the data, converting all data into problem-solution format, while images are retained in the image field. Therefore, we don't need to define additional datasets and can directly use `--dataset AI-ModelScope/GEOQA_R1V_Train_8K`.

### Reward Function
Since this is also a math problem, and the answers have been processed into final results, we directly use the previously defined `MultiModalAccuracyORM` reward function.

### GRPO Training Experimental Records
#### Training Parameters:
The selected model and most hyperparameters are similar to the previous experiment, with two main differences:
1. SWIFT now supports the `--num_iteration` parameter, allowing multiple updates per single rollout. Here it's set to 2.
2. During experimentation, we found that training might become unstable in mathematical problems, causing the model to collapse. This manifests as all rewards rapidly decreasing, with loss, grad_norm, and kl rapidly increasing, making recovery difficult. Therefore, we set `--max_grad_norm 0.5` to ensure stable training, although this phenomenon also has some randomness.

```shell
WANDB_API_KEY=your_wandb_api_key \
CUDA_VISIBLE_DEVICES=0,1,2,3,4,5 \
MAX_PIXELS=401408 \
NPROC_PER_NODE=6 \
swift rlhf \
    --rlhf_type grpo \
    --model Qwen/Qwen2.5-VL-3B-Instruct \
    --external_plugins examples/train/grpo/plugin/plugin.py \
    --reward_funcs external_r1v_acc format \
    --use_vllm true \
    --vllm_mode server \
    --vllm_server_host 127.0.0.1 \
    --vllm_server_port 8000 \
    --train_type full \
    --torch_dtype bfloat16 \
    --dataset 'AI-ModelScope/GEOQA_R1V_Train_8K' \
    --max_completion_length 1024 \
    --num_train_epochs 1 \
    --per_device_train_batch_size 8 \
    --per_device_eval_batch_size 8 \
    --learning_rate 1e-6 \
    --gradient_accumulation_steps 2 \
    --save_strategy 'steps' \
    --eval_strategy 'steps' \
    --eval_steps 400 \
    --save_steps 400 \
    --save_total_limit 10 \
    --logging_steps 1 \
    --output_dir output/GRPO_GEOQA \
    --warmup_ratio 0.05 \
    --dataloader_num_workers 4 \
    --num_generations 8 \
    --temperature 1.0 \
    --repetition_penalty 1.1 \
    --system 'examples/train/grpo/prompt.txt' \
    --deepspeed zero3 \
    --log_completions true \
    --report_to wandb \
    --num_iterations 2 \
    --async_generate false \
    --beta 0.001 \
    --max_grad_norm 0.5 \
```

#### Experimental Observations
![image.png](./_resources/grpo_geoqa.png)

The training curve is shown in the figure above.
1. Compared to the Count task, the Geometric QA task is significantly more difficult, so Accuracy Reward converges much slower and with明显 larger oscillations.
2. The completion_length trend is quite clear, eventually converging to around 250 tokens.
3. The reward has essentially converged, with standard deviation stabilizing around 0.2 at 1300 steps.

Here's an example of model completions after training:
```
User:
"If AB is the tangent to circle O with the tangent point A, and BO intersects circle O at point C, and point D is located on circle O, what is the measure of angle ADC if the degree of angle ABO is 32.0?"
Assistant:
"<thinking>\nTo find the measure of angle ADC, we first need to understand the properties of the tangent and the circle. Since AB is a tangent to the circle at point A, the line segment OA (which is perpendicular to the tangent AB) is perpendicular to AB. This means that angle OAB is 90 degrees.\n\nGiven that angle ABO is 32 degrees, we can find angle BAO by subtracting angle ABO from 90 degrees:\n∠BAO = 90° - ∠ABO = 90° - 32° = 58°\n\nSince angle BAO is an angle in the minor arc AD, the angle ADC, which is an angle in the minor arc AD, is half the angle BAO. Therefore, angle ADC is:\n∠ADC = 1/2 × ∠BAO = 1/2 × 58° = 29°\n\nSo, the measure of angle ADC is 29 degrees.\n</thinking>\n<answer>\nThe measure of angle ADC is 29 degrees.\n</answer>"
```

## Multimodal Open R1 Dataset Experiment
### Task and Dataset Definition
This task references the experiment from [open-r1-multimodal](https://github.com/EvolvingLMMs-Lab/open-r1-multimodal.git), using the dataset: [lmms-lab/multimodal-open-r1-8k-verified](https://www.modelscope.cn/datasets/lmms-lab/multimodal-open-r1-8k-verified). This dataset focuses on multimodal mathematical reasoning tasks, with data generated by GPT4o based on `Math360K` and `Geo170K` datasets, containing reasoning paths and verifiable answers. The dataset already includes image, problem, and solution fields, and we don't need to modify prompts, so no additional dataset definition is required.

### Reward Function
We directly use the previously defined `MultiModalAccuracyORM` reward function.

### GRPO Training Experimental Records
#### Training Parameters:
The selected model and most hyperparameters are similar to the previous experiment. Due to OOM issues during training, we set `MAX_PIXELS=262144` to reduce VRAM usage.

```shell
WANDB_API_KEY=your_wandb_api_key \
CUDA_VISIBLE_DEVICES=0,1,2,3,4,5 \
MAX_PIXELS=262144 \
MASTER_PORT=29600 \
NPROC_PER_NODE=6 \
swift rlhf \
    --rlhf_type grpo \
    --model Qwen/Qwen2.5-VL-3B-Instruct \
    --external_plugins examples/train/grpo/plugin/plugin.py \
    --reward_funcs external_r1v_acc format \
    --use_vllm true \
    --vllm_mode server \
    --vllm_server_host 127.0.0.1 \
    --vllm_server_port 8000 \
    --train_type full \
    --torch_dtype bfloat16 \
    --dataset 'lmms-lab/multimodal-open-r1-8k-verified' \
    --max_completion_length 1024 \
    --num_train_epochs 1 \
    --per_device_train_batch_size 8 \
    --per_device_eval_batch_size 8 \
    --learning_rate 1e-6 \
    --gradient_accumulation_steps 2 \
    --save_strategy 'steps' \
    --eval_strategy 'steps' \
    --eval_steps 400 \
    --save_steps 400 \
    --save_total_limit 10 \
    --logging_steps 1 \
    --output_dir output/GRPO_GEOQA \
    --warmup_ratio 0.05 \
    --dataloader_num_workers 4 \
    --num_generations 8 \
    --temperature 1.0 \
    --repetition_penalty 1.1 \
    --system 'examples/train/grpo/prompt.txt' \
    --deepspeed zero3 \
    --log_completions true \
    --report_to wandb \
    --num_iterations 2 \
    --async_generate false \
    --beta 0.001 \
    --max_grad_norm 0.5 \
```

#### Experimental Observations
![image.png](./_resources/grpo_openr1_multimodal.png)

The training curve is shown in the figure above.
With a total of 8k data points and 1268 training steps, Accuracy Reward converged to around 0.5, completion_length essentially converged to around 200 tokens, and reward_std eventually oscillated around 0.2.

Here's an example of model completions after training:
```
User:
"Based on the map, which state falls into the lowest percentage range of lots, and what is that percentage range?"
Assistant:
"<thinking>\nThe image provided shows a color-coded map of the USA indicating different ranges of lot percentages across various states. According to the legend at the bottom, the lowest percentage range (6.0% - 6.5%) is represented by white. In the image, Alabama (AL) is shaded in white, which corresponds to the 6.0% - 6.5% category. Therefore, based on the map, the state that falls into the lowest percentage range of lots is Alabama, with the percentage range of 6.0% - 6.5%.\nTherefore, the answer is 6.0% - 6.5%.\n</thinking>\n<answer>Alabama</answer>"
```