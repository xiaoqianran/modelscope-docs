<!-- modelscope-docs: Complete GRPO Workflow | llm-training-and-inference/best-practices/grpo/grpo_EN.md -->

# Complete GRPO Experimental Workflow

This article starts from a relatively simple mathematical task, the Countdown Game, and introduces the complete GRPO training workflow through several steps: dataset definition, reward function definition, and GRPO training. Task definitions and training parameters reference [mini-deepseek-r1](https://github.com/philschmid/deep-learning-pytorch-huggingface/blob/main/training/mini-deepseek-r1-aha-grpo.ipynb).

## Task and Dataset Definition

The goal of the Countdown Game task is to reach a target number using given numbers and four arithmetic operations (addition, subtraction, multiplication, and division). Therefore, we define the dataset as follows:
```python
class CoundownTaskPreprocessor(ResponsePreprocessor):

    def preprocess(self, row: Dict[str, Any]) -> Dict[str, Any]:
        numbers = row['nums']
        target = row.pop('response', None)
        query = f"""
        Using the numbers {numbers}, create an equation that equals {target}.
        You can use basic arithmetic operations (+, -, *, /) and each number can only be used once.
        Show your work in <thinking> </thinking> tags. And return the final equation and answer in <answer> </answer> tags,
        for example <answer> (1 + 2) / 3 * 4 = 4 </answer>.
        """
        row.update({'target': target, 'query': query})
        return super().preprocess(row)

register_dataset(
    DatasetMeta(
        ms_dataset_id='zouxuhong/Countdown-Tasks-3to4',
        subsets=['default'],
        preprocess_func=CoundownTaskPreprocessor(),
        tags=['math']))
```
Through the template, we complete the task definition using numbers and target, and provide the query field for model sampling. At the same time, we need to retain the nums and target fields for subsequent reward function calculation.

## Reward Function Definition:
This task uses two reward functions: one is the format reward function mentioned in Deepseek-R1, and the other is the accuracy reward function for the Countdown Game. The former is already built into swift and can be used directly via `--reward_funcs format`, while the latter needs to be defined by ourselves. Here, we use the external_plugin approach to define the accuracy reward function, placing the code in `swift/examples/train/grpo/plugin/plugin.py`.

In this case, the reward function inputs include three fields: completions, target, and nums, representing the model-generated text, target answer, and available numbers respectively. Each is a list, supporting simultaneous calculation of multiple completions. Note that apart from completions, all other parameters are passed through from fields defined in the dataset. If there are task changes, corresponding modifications can be made to both the dataset and reward function.

```python
class CountdownORM(ORM):
    def __call__(self, completions, target, nums, **kwargs) -> List[float]:
        """
        Evaluates completions based on Mathematical correctness of the answer
        Args:
            completions (list[str]): Generated outputs
            target (list[str]): Expected answers
            nums (list[str]): Available numbers
        Returns:
            list[float]: Reward scores
        """
        rewards = []
        for completion, gt, numbers in zip(completions, target, nums):
            try:
                # Check if the format is correct
                match = re.search(r"<answer>(.*?)<\/answer>", completion)
                if match is None:
                    rewards.append(0.0)
                    continue
                # Extract the "answer" part from the completion
                equation = match.group(1).strip()
                if '=' in equation:
                    equation = equation.split('=')[0]
                # Extract all numbers from the equation
                used_numbers = [int(n) for n in re.findall(r'\d+', equation)]
                # Check if all numbers are used exactly once
                if sorted(used_numbers) != sorted(numbers):
                    rewards.append(0.0)
                    continue
                # Define a regex pattern that only allows numbers, operators, parentheses, and whitespace
                allowed_pattern = r'^[\d+\-*/().\s]+$'
                if not re.match(allowed_pattern, equation):
                    rewards.append(0.0)
                    continue
                # Evaluate the equation with restricted globals and locals
                result = eval(equation, {'__builtins__': None}, {})
                # Check if the equation is correct and matches the ground truth
                if abs(float(result) - float(gt)) < 1e-5:
                    rewards.append(1.0)
                else:
                    rewards.append(0.0)
            except Exception as e:
                # If evaluation fails, reward is 0
                rewards.append(0.0)
        return rewards
orms['external_countdown'] = CountdownORM
```

## GRPO Training Experimental Records
First, here is the GRPO formula:

$$
{\scriptstyle
\begin{aligned}
\mathcal{J}_{G R P O}(\theta) & =\mathbb{E}\left[q \sim P(Q),\left\{o_i\right\}_{i=1}^G \sim \pi_{\theta_{o l d}}(O \mid q)\right] \\
& \frac{1}{G} \sum_{i=1}^G \frac{1}{\left|o_i\right|} \sum_{t=1}^{\left|o_i\right|}\left\{\min \left[\frac{\pi_\theta\left(o_{i, t} \mid q, o_{i,<t}\right)}{\pi_{\theta_{o l d}}\left(o_{i, t} \mid q, o_{i,<t}\right)} \hat{A}_{i, t}, \operatorname{clip}\left(\frac{\pi_\theta\left(o_{i, t} \mid q, o_{i,<t}\right)}{\pi_{\theta_{o l d}}\left(o_{i, t} \mid q, o_{i,<t}\right)}, 1-\varepsilon, 1+\varepsilon\right) \hat{A}_{i, t}\right]-\beta \mathbb{D}_{K L}\left[\pi_\theta| | \pi_{r e f}\right]\right\}
\end{aligned}
}
$$

### Training Parameters:
We selected Qwen2.5-3B-Instruct as the base model for training. The main reason for choosing Instruct over the base model is to obtain format rewards more quickly. We conducted experiments on three GPUs, so vLLM inference deployment was on the last GPU card, while the process count was set to 2, performing gradient updates on the remaining two cards.

Since the task is relatively simple, we set max_completion_length and vllm_max_model_len to 1024. For more complex tasks, the model output length can be appropriately increased, but please note that **the larger these two parameters are, the more VRAM the model training requires, the slower the training speed becomes, and the training time per step has a linear relationship with max_completion_length**.

In our experiment, the total batch_size was:

```
num_processes * per_device_train_batch_size * gradient_accumulation_steps = 2 * 8 * 8 = 128
```

Note that the single-GPU batch_size setting is also closely related to VRAM. Please set an appropriate value according to your VRAM limit. Additionally, there's another formula for the total number of steps: $num\_steps = epochs \times len(datasets) \times num\_generations \div batch\_size$, which should be used to reasonably plan the learning rate and warmup settings.

The most important settings are the learning rate and beta. The learning rate is relatively straightforward to understand, while beta corresponds to $\beta$ in the above formula, representing the weight of the KL divergence gradient. The larger these two parameters are set, the faster the model convergence in principle, but training often becomes unstable. Through experimentation, we set them to `5e-7` and `0.001` respectively. In actual training, please adjust these two parameters appropriately based on whether unstable oscillations occur.

Regarding KL divergence, there has been extensive community discussion. You can refer to [Why GRPO Insists on Using KL Divergence](https://zhuanlan.zhihu.com/p/25862547100).

Other parameter settings were not extensively explored, so they won't be explained in detail here.

```bash
CUDA_VISIBLE_DEVICES=2 \
swift rollout \
    --model Qwen/Qwen2.5-3B-Instruct
```

```bash
CUDA_VISIBLE_DEVICES=0,1 \
WANDB_API_KEY=your_wandb_key \
NPROC_PER_NODE=2 \
swift rlhf \
    --rlhf_type grpo \
    --model Qwen/Qwen2.5-3B-Instruct \
    --external_plugins examples/train/grpo/plugin/plugin.py \
    --reward_funcs external_countdown format \
    --use_vllm true \
    --vllm_mode server \
    --vllm_server_host 127.0.0.1 \
    --vllm_server_port 8000 \
    --train_type full \
    --torch_dtype bfloat16 \
    --dataset 'zouxuhong/Countdown-Tasks-3to4#50000' \
    --load_from_cache_file true \
    --max_length 2048 \
    --max_completion_length 1024 \
    --num_train_epochs 1 \
    --per_device_train_batch_size 8 \
    --per_device_eval_batch_size 8 \
    --learning_rate 5e-7 \
    --gradient_accumulation_steps 8 \
    --eval_steps 500 \
    --save_steps 100 \
    --save_total_limit 20 \
    --logging_steps 1 \
    --output_dir output/GRPO_COUNTDOWN \
    --warmup_ratio 0.01 \
    --dataloader_num_workers 4 \
    --num_generations 8 \
    --temperature 1.0 \
    --system 'You are a helpful assistant. You first thinks about the reasoning process in the mind and then provides the user with the answer.' \
    --deepspeed zero3 \
    --log_completions true \
    --report_to wandb \
    --beta 0.001 \
    --num_iterations 1
```

### Experimental Observations
![image.png](./_resources/grpo_countdown.png)

From the experimental results after training for 2000 steps, several observations can be made:

1. The custom CountdownORM continues to increase, proving that the model has learned how to complete this task, with a final task success rate around 0.5.
2. Format Reward remains at a high level overall, oscillating between 0.9-1.
3. reward_std eventually stabilizes around 0.2-0.3, indicating incomplete convergence, and the model still has room to further improve its reward.
4. Observing model outputs reveals that a significant portion of failure cases are due to the model making errors in simple arithmetic operations. Consequently, the model's final convergence direction shifted toward step-by-step calculations. With a larger model, different convergence directions might emerge.
5. Completion length initially decreases then increases, reaching its lowest point around step 200, then gradually rising to around 350. This demonstrates that the model underwent a transformation in its thinking approach.
6. The model's thinking approach continuously evolves. Eventually, the model discovered that performing permutations/combinations with step-by-step calculations better accomplishes this task. Most final sampling outputs follow this format. Below are completion changes at different steps:

step 1:
```
"<thinking>\nWe need to create an equation using the given numbers [70, 5, 42, 30] exactly once and make it equal to 77. \n\nFirst, let's consider the possibility of multiplication or division to get closer to 77. Notice that 77 is close to 70 and 42. If we can use these numbers together, it might work.\n\nMultiplying 70 by 1.1 would give us approximately 77, which is very close. So, let's try to make 1.1 using the remaining numbers 5 and 30. \nIf we take 30/5 = 6, and then 5/6 = 0.8333..., this isn't useful here, so let's look at other possibilities.\n\nNext, let's consider if there's another way to achieve 77 using addition, subtraction, or another combination of our numbers. Given the numbers provided, it seems that multiplication or division will be key. \n\nWe can try subtracting 5 from 30 to get 25. Then, if we divide 42 by 25, we don't get a whole number, but we can round it to the nearest whole number, 1. Now, we need to make the equation fit 77. Let's multiply 25 by 3 and add 7 (since 77 = 25*3 + 7). However, we only have one 7 available and we need to find a way to use the remaining numbers to get 7.\n\nLet's try:  \n70 - 42 = 28  \nThen, 28 + 5 = 33  \nNext, 33 + 30 = 63  \nFinally, 77 - 63 = 14, which doesn't help.\n\nConsidering different combinations, one viable way is:\n(70 - 42) * (30 / 5) = 28 * 6 = 168 / 2 = 84 / 2 = 42 / 2 = 21 / 3 = 7\n\nSo, (70 - 42) * (30 / 5) = 77.\n</thinking>\n<answer>(70 - 42) * (30 / 5) = 77</answer>"
```

step 200:
```
"<thinking>\nWe need to use all the given numbers in a way that the resultant value of the calculation is 99. Given these restrictions, it's clear we should look into how the numbers relate and the mathematical operations that will bring them together to meet our condition.\n\nFirstly, let's evaluate the sums, differences, and multiplication/division among the numbers and their relations to see how this could lead us towards an outcome of 99.\n- Summing the three numbers: 96 + 70 + 73 = 239, which is far from 99. This shows addition isn't practical.\n- Subtracting numbers: For instance, subtracting the lowest two (i.e., 73 - 70 = 3) and combining with the highest one (96) does not work. Also, there is no other combination of subtraction that would result in the number needing to add up to 99.\n- Multiplying or dividing the numbers alone wouldn't reach to any near solution since none of the products or division results of the numbers themselves is very close to 99. We might think more carefully about the arrangement of them using a combination of the operations provided.\nTherefore, considering the possible arrangement, a combination like taking (73 - 70 + 96) may produce an effective solution as this will sum the values in such a manner that it aligns with the goal of 99.\n\nSo we conclude that the operation: 73 - 70 + 96 gives the right sequence to equal 99.\n</thinking>\n\n<answer>73 - 70 + 96 = 99</answer>"
```

step 500:
```
"<thinking>\nLet's begin by exploring various possible combinations of the given numbers using the arithmetic operators we have access to.\n\n- If I add the numbers, I get: 56 + 73 + 51 = 180 which is not equal to our target number (68)\n- If I subtract one number from another I will still exceed our target value as well since the maximum difference is: |(difference between max-min):| | (73 - 51) or | (73 - 56), etc.|\n- Let's multiply the numbers individually and see if the division operation can bring us closer to the goal:\n    - (73 * 51) - 56 = 3723 - 56 = 3667 which isn't the goal either.\n    - The only operator left is addition and subtraction; I'll try the combination: \n    ((73 - 56) + 51) gives me (17 + 51) = 68.\n    \nThus, our solution fits the provided problem constraints and meets the required outcome.\n</thinking>\n<answer>(73 - 56) + 51 = 68</answer>"
```

step 1000:
```
"<thinking>\nWe need to form an expression using the given numbers (50, 86, and 49) such that it equals 85. Let's try different combinations:\n\n(86 - 50) + 49 = 76 + 49 = 125 (too big)\n(86 - 49) + 50 = 37 + 50 = 87 (too big)\n(86 - 50) + 49 = 37 + 49 = 86 (too big)\n(86 + 50) - 49 = 136 - 49 = 87 (too big)\n(86 - 50) + (49 - x)? Not working!\n(50 + 86) - 49: this is 136 which isn't our aim.\n50 + (86 - 49) = 50 + 37 = 87 which wasn't correct.\n50 - 86 + 49 = -16 + 49: This doesn't match up as well.\n86 - (50 + 49) = 86 - 99 which doesn't work too.\n\nWe try one more:\n(86 + 49) - 50 = 135 - 50 = 85!\n\nThat's it!\n</thinking>\n\n<answer>(86 + 49) - 50 = 85</answer>"
```

step 2000:
```
"<thinking>\nWe need to form an expression using the numbers 58, 9, 78, and 44 which evaluates to 73. Let's try different combinations:\n(78 - 58) + (9 + 44) = 10 + 53 = 63 (too low)\n(78 - 58) + (9 - 44) = 20 - 35 = -15 (too low)\n(78 - 58) + (44 - 9) = 20 + 35 = 55 (too low)\n(78 + 58) - (9 + 44) = 136 - 53 = 83 (too high)\n(78 + 58) - (9 - 44) = 136 + 35 = 171 (too high)\n(78 + 58) - (44 + 9) = 136 + 53 = 189 (too high)\n(78 + 9) - (58 + 44) = 87 - 102 = -15 (too low)\n(78 + 9) - (58 - 44) = 87 - 14 = 73\n\nSo our solution is: (78 + 9) - (58 - 44) = 73</thinking>\n\n<answer>(78 + 9) - (58 - 44) = 73</answer>"
```

Additional experimental records with learning_rate and beta set to 1e-6 and 0.04 respectively show instability, with the model exhibiting oscillations around step 200 and both format and CountdownORM rewards dropping sharply:
![](./_resources/grpo_countdown_1.png)