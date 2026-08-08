<!-- modelscope-docs: entropy_mask | llm-training-and-inference/user-guide/grpo-guide/advanced-research/entropy-mask/entropy-mask_EN.md -->

# Beyond the 80/20 Rule: High-Entropy Minority Tokens Drive Effective Reinforcement Learning for LLM Reasoning

**Version Dependency**: ms-swift>=3.7

The [paper](https://arxiv.org/abs/2506.01939) discovered that when training large language models for reasoning capabilities using methods like RLVR, the key drivers of learning progress are a small subset of high-entropy "minority tokens," rather than the majority of low-entropy tokens.

The paper points out that in the token distribution of model reasoning, only a very small number of high-entropy tokens play a dominant role. These tokens often appear at critical decision points where reasoning and decision paths diverge the most (such as "wait," "since," etc.), determining whether the model can learn complex reasoning tasks. In contrast, most low-entropy tokens have limited impact on improving the model's reasoning capabilities. The paper proposes computing policy gradients only for high-entropy tokens while discarding gradients from low-entropy tokens.

Token entropy formula:

$
H_t := -∑_{j=1}^{V} p_{t,j} \log p_{t,j}, \qquad where (p_{t,1}, ···, p_{t,V}) = \mathbf{p}_t = π_θ(\cdot | \mathbf{q}, \mathbf{o}_{<t}) = \text{Softmax}(\frac{\mathbf{z}_t}{T})
$

Where:
- $\pi_\theta$: Model with parameters $\theta$
- $\mathbf{q}$: Input query
- $\mathbf{o}_{<t} = (o_1, o_2, \cdots, o_{t-1})$: Token sequence generated before timestep $t$
- $V$: Vocabulary size
- $\mathbf{z}_t \in \mathbb{R}^V$: Pre-softmax logits at timestep $t$
- $\mathbf{p}_t \in \mathbb{R}^V$: Model's probability distribution over the vocabulary
- $T \in \mathbb{R}$: Decoding temperature, controlling the smoothness of the distribution

Entropy calculation target: $H_t$ is the entropy of the token generation distribution $\mathbf{p}_t$, used to measure the uncertainty of the training policy $\pi_\theta$ given the context $(\mathbf{q}, \mathbf{o}_{<t})$.

> "Token entropy" $H_t$ always refers to the uncertainty of the generation distribution $\mathbf{p}_t$ at position $t$, not an attribute of the token $o_t$ itself. That is, $H_t$ is the entropy of the distribution $\mathbf{p}_t$ corresponding to position $t$, independent of the sampled token $o_t$.

In practice, we can control the training scope in GRPO training through the parameter `top_entropy_quantile`. The paper's experimental setup uses this parameter as 0.2, meaning training optimization is performed only on tokens in the top 20% of the entropy distribution.

Additionally, using the parameter `log_entropy`, you can record entropy changes during training. Refer to the [documentation](../get-started/grpo.md#logged-metrics).