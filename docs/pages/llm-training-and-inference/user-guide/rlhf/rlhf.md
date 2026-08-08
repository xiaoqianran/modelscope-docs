<!-- modelscope-docs: Human Alignment | llm-training-and-inference/user-guide/rlhf/rlhf_EN.md -->

# Human Alignment

This document provides training scripts for various human preference alignment algorithms. For more detailed information about the algorithms and their selection methods, please refer to the [documentation](https://github.com/modelscope/modelscope-classroom/blob/main/LLM-tutorial/M.%E4%BA%BA%E7%B1%BB%E5%81%8F%E5%A5%BD%E5%AF%B9%E9%BD%90%E8%AE%AD%E7%BB%83.md).


## Dataset
PPO and GRPO algorithms only require model input data, which consists of system prompt (optional) plus query. The reward functions in GRPO may require additional data columns, such as a `solution` column as reference answers for accuracy calculation.

RM and DPO-type algorithms like ORPO, CPO, and SimPO require data in $(x,y_w,y_l)$ format, where $x$ represents the model input, and $y_w,y_l$ represent the preferred response that aligns with human preferences and the rejected response that doesn't align with human preferences, respectively. For example: ![dpo_data](./_resources/dpo_data.png)

KTO algorithm data is special, requiring only $(x,y,\text{label})$ format data, where $x$ represents the model input, $y$ represents the model output, and label indicates whether the response aligns with human preferences. For example: ![kto_data](./_resources/kto_data.png)

For RLHF training of text models or multimodal large models using custom datasets, please refer to the [Custom Dataset Documentation](../customization/custom-dataset.md#rlhf).

## GRPO
[Paper arXiv](https://arxiv.org/abs/2402.03300)

Training script reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/grpo).

## DPO
[Paper arXiv](https://arxiv.org/abs/2305.18290)

Hyperparameters:

- beta: KL regularization coefficient. Higher values indicate stronger penalties for deviating from the reference model. Default is 0.1.
- loss_type: Different DPO algorithm variants. Available options can be found in the [documentation](https://huggingface.co/docs/trl/main/en/dpo_trainer#loss-functions). Default is 'sigmoid'.
- (Optional) loss_weights: Weight settings when mixing multiple losses.
- (Optional) ld_alpha: From [LD-DPO paper](https://arxiv.org/abs/2409.06411), applies weighting $\alpha$ to logps beyond the common prefix to suppress length preference.
- (Optional) discopop_tau: Temperature parameter $\tau$ from [DiscoPOP paper](https://arxiv.org/abs/2406.08414), used to scale the log-ratio. Default value is 0.05. Only effective when loss_type is set to discopop.

It's recommended to perform SFT training using the user-preferred answers from the preference dataset before starting DPO training to ensure the data distribution better meets DPO algorithm requirements.

To mix multiple losses simultaneously (e.g., for [MPO](https://arxiv.org/abs/2411.10442) training), specify multiple loss_type values and set their respective weights through loss_weights.

By setting the hyperparameter `rpo_alpha`, you can mix a certain proportion of SFT loss into the total loss to improve training stability.

Training script references:

- [DPO script](https://github.com/modelscope/ms-swift/tree/main/examples/train/rlhf/dpo).
- [MPO script](https://github.com/modelscope/ms-swift/tree/main/examples/train/rlhf/mpo.sh).

## RM
[Paper arXiv](https://arxiv.org/abs/2203.02155)

Reward Modeling phase in RLHF

Uses the base model or instruct model trained with SFT as the base model, adds a value head, and trains it as a reward model using preference datasets.

The weights of the added value head are saved in `value_head.safetensors` or `value_head.bin` files.

RM loss function:

$
\text{loss} = -\log \sigma \left( r^{(c)} - r^{(r)} - m \right) + \lambda \left( r^{(c)} + r^{(r)} \right)^2
$

- $r^{(c)}$: Model's score for the chosen response
- $r^{(r)}$: Model's score for the rejected response  
- $\lambda$: L2 regularization coefficient, encouraging model outputs to be close to 0. Set using parameter `center_rewards_coefficient`, from [paper](https://arxiv.org/pdf/2307.09288). Default is 0.
- $m$: Margin term, encouraging the model to distinguish between samples of different difficulty levels. Requires a `margin` column in the dataset. Default is 0, from [paper](https://arxiv.org/pdf/2307.09288).

Training script reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/rlhf/rm.sh).

## PPO
[Paper arXiv](https://arxiv.org/abs/2203.02155)

PPO (proximal policy optimization) phase in RLHF involves four models:
- model: Training model, base model or instruct model trained with SFT
- ref_model: Reference model, defaults to model
- reward_model: Reward model, obtained from RM phase training
- value_model: Value model, initialized from reward_model, updated synchronously during training

Hyperparameters:

- local_rollout_forward_batch_size: Batch size for each data sampling, default is 64
- whiten_rewards: Normalize rewards, default is False
- kl_coef: Coefficient for KL divergence term, default is 0.05
- cliprange: Clip range in PPO policy loss function, default is 0.2
- vf_coef: Value loss function coefficient, default is 0.1
- cliprange_value: Clip range in PPO value loss function, default is 0.2
- gamma: Discount factor for cumulative rewards, default is 1.0
- lam: Lambda coefficient in [GAE](https://arxiv.org/abs/1506.02438), default is 0.95
- num_sample_generations: Number of debug samples generated during training, default is 10

Note: When training base models, SFT should be performed first before RLHF, specify chat template, and SFT_type is recommended to use full.

Explanation of training metrics can be found in the [documentation](https://huggingface.co/docs/trl/ppov2_trainer#explanation-of-the-logged-metrics).

## KTO
[Paper arXiv](https://arxiv.org/abs/2402.01306)

Hyperparameters:

- beta: KL regularization coefficient. Higher values indicate stronger penalties for deviating from the reference model. Default is 0.1
- desirable_weight: $\lambda_D$ term in loss function, loss weight for preferred response samples. Default is 1.0
- undesirable_weight: $\lambda_U$ term in loss function, loss weight for rejected response samples. Default is 1.0

Let $n_D$ and $n_U$ represent the number of preferred and rejected response samples in the dataset, respectively. For hyperparameters $\lambda_D$ and $\lambda_U$, the authors recommend setting $\frac{\lambda_Dn_D}{\lambda_Un_U}\in[1,\frac{4}{3}]$.

Training script:
Train using $(x,y,\text{label})$ format data.

Training script reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/rlhf/kto.sh).

## CPO
[Paper arXiv](https://arxiv.org/abs/2401.08417)
Hyperparameters:

- beta: Coefficient before implicit reward, default is 0.1
- cpo_alpha: NLL loss coefficient, default is 1.0

Training script reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/rlhf/cpo.sh).

## ORPO
[Paper arXiv](https://arxiv.org/abs/2403.07691)

Hyperparameters:

- lambda: Odds Ratio loss coefficient

Note: ORPO uses parameter `--beta` to pass the hyperparameter `lambda`.

Training script reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/rlhf/orpo.sh).

## SimPO
[Paper arXiv](https://arxiv.org/abs/2405.14734)
Hyperparameters:

- beta: Coefficient before implicit reward, default is 2.0
- simpo_gamma: Reward margin term, default is 1.0
- cpo_alpha: Mix CPO NLL loss to improve training stability, default is 1.0. Set to 0.0 to use the original SimPO algorithm.

Training script reference [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/rlhf/simpo.sh).