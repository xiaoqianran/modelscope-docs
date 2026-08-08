<!-- modelscope-docs: Plugin System | llm-training-and-inference/customization/plugins/plugins_EN.md -->

# Plugin System

Plugin system is an important new capability introduced in SWIFT 3.0. We hope that through the plugin system, developers can customize their development workflow more naturally.

## Callback

Example is [here](https://github.com/modelscope/ms-swift/blob/main/swift/plugin/callback.py).

The `callback` mechanism is a training customization mechanism in transformers Trainer. Developers can control the training process within callbacks. Typically, callback customization looks like this:
```python
class CustomCallback(TrainerCallback):

    def on_train_begin(self, args: TrainingArguments, state: TrainerState, control: TrainerControl, **kwargs):
        # Doing something when the training begins.
        pass

    def on_save(self, args: TrainingArguments, state: TrainerState, control: TrainerControl, **kwargs):
        # Doing something when save checkpoint
        pass
```
Callbacks are registered into the trainer before trainer construction. The example provides a simple EarlyStop implementation. Registering your own callback is straightforward:
```python
extra_callbacks = [CustomCallback()]
```
Developers can add new callbacks in plugin/callback.py and customize their training workflow. For specific callback parameters, please refer to [here](https://huggingface.co/docs/transformers/main_classes/callback).


## Custom Loss

Example is [here](https://github.com/modelscope/ms-swift/blob/main/swift/plugin/loss.py).

SWIFT supports customizing loss functions in plugins. If this capability is not used, cross-entropy loss (CE Loss) is used by default. Developers can write code in this file, register it, and use their custom loss method during training by setting `--loss_type custom_loss`.
For example, add the following code in plugin/loss.py:
```python
def custom_loss_func(outputs, labels, loss_scale=None, num_items_in_batch=None) -> torch.Tensor:
    # Write your own loss calculating here
    return loss

loss_mapping['custom_loss'] = custom_loss_func
```
Note that loss functions are strongly related to trainer tasks. Currently, loss customization is only available for pt and sft tasks. Human alignment tasks (e.g., DPO, PPO) or classification tasks (seq_cls) cannot be customized in plugins.

## Custom Loss Scale

Example is [here](https://github.com/modelscope/ms-swift/blob/main/swift/plugin/loss_scale/loss_scale.py).

The loss_scale mechanism is one of the most important mechanisms in SWIFT. In pt and sft tasks, the loss of trainable tokens is uniform, meaning each token participates equally in backpropagation. However, in certain cases, some tokens have higher weights and need extra attention, requiring higher weights.
loss_scale allows developers to freely define their own token weights.
```python
class LastRoundLossScale(LossScale):

    def get_loss_scale(self, context: str, context_type: ContextType, is_last_round: bool, **kwargs):
        if context_type == ContextType.RESPONSE:
            return [context], [float(is_last_round)]
        return super().get_loss_scale(context, context_type, is_last_round)
```
In the code above, a tuple is returned. The first return value is the context (or decomposed context), and the second parameter is the corresponding loss_scale for the context, where float values represent weights. For example, with the following weight settings:
```text
["learning", "good", "math", "is", "important", "the"]
[1.0, 0.5, 2.0, 0.5, 2.0, 0.1]
```
We place more emphasis on "math" and "important", so we increase their weights to 2.0.
Returning to the code above, we check if the incoming context is a response, and if it's a response and the last round of a multi-turn conversation, we return [1]. In other cases, we use the base class implementation (which returns loss_scale as [0] in this scenario). Using this approach, we ensure that only the response from the last round participates in training, while other responses do not participate in training. This method allows all tokens (prompt, response) to participate in training, or enables focused training on special characters for agent tasks.
In pt and sft, loss_scale supports both participation in training and weight magnitude, while in human alignment tasks, it only supports whether certain tokens participate in training, not weight magnitude.

## Custom Metric

Example is [here](https://github.com/modelscope/ms-swift/blob/main/swift/plugin/metric.py).

Metrics can customize the evaluation parameters used during training:
```python
metric_mapping = {
    'acc': (compute_acc_metrics, preprocess_logits_for_acc),
    'nlg': (compute_nlg_metrics, None),
    'custom': (custom_metric, custom_preprocess),
}


def get_metric(metric: str):
    return metric_mapping[metric]
```
In the definition above, we added a new custom metric. Its value contains two elements: the first is the metric calculation process, returning a dict containing metric key-value pairs; the second is preprocessing for logits, returning actual predictions.

## Custom Optimizer

Example is [here](https://github.com/modelscope/ms-swift/blob/main/swift/plugin/optimizer.py).
- Use different learning rates for different parts of the model, e.g., ViT and LLM use different learning rates, refer to [here](https://github.com/modelscope/ms-swift/blob/main/examples/train/multimodal/lora_llm_full_vit/custom_plugin.py).

Users can add their own optimizer and lr_scheduler implementations here:
```python
def create_custom_optimizers(args, model, dataset):
    # Create your own optimizer
    return CustomOptimizer(optimizer_grouped_parameters, **optimizer_kwargs), CustomScheduler(...)

optimizers_map = {
    'custom': create_custom_optimizers,
    ...
}
```

When developers need to use other optimizers, such as those defined in new research papers, they can define the creation process here and use it with parameters:
```shell
--optimizer custom
```
to actually invoke it.

## Custom Agent Template

Example is [here](https://github.com/modelscope/ms-swift/blob/main/swift/plugin/agent_template).

## Custom Tuner

Example is [here](https://github.com/modelscope/ms-swift/blob/main/swift/plugin/tuner.py).
- For multimodal models, use full-parameter training for ViT part and LoRA training for LLM part, refer to [here](https://github.com/modelscope/ms-swift/tree/main/examples/train/multimodal/lora_llm_full_vit).
- Phi4-multimodal, directly train its existing LoRA without adding additional LoRA, refer to [here](https://github.com/modelscope/ms-swift/blob/main/examples/train/plugins/tuner_phi4_mm.sh).

Tuner customization is also one of swift's distinctive capabilities. Developers can ignore the complex tuner initialization process and code integration costs, registering new tuners here:
```python
class IA3(Tuner):

    @staticmethod
    def prepare_model(args: 'TrainArguments', model: torch.nn.Module) -> torch.nn.Module:
        model_arch: ModelKeys = model.model_meta.model_arch
        ia3_config = IA3Config(
            target_modules=find_all_linears(model), feedforward_modules='.*' + model_arch.mlp.split('{}.')[1] + '.*')
        return get_peft_model(model, ia3_config)

    @staticmethod
    def save_pretrained(
        model: torch.nn.Module,
        save_directory: str,
        state_dict: Optional[dict] = None,
        safe_serialization: bool = True,
        **kwargs,
    ) -> None:
        model: PeftModel
        model.save_pretrained(save_directory, state_dict=state_dict, safe_serialization=safe_serialization, **kwargs)

    @staticmethod
    def from_pretrained(model: torch.nn.Module, model_id: str, **kwargs) -> torch.nn.Module:
        return PeftModel.from_pretrained(model, model_id, **kwargs)
```

In the example above, we apply peft's IA3 to model training. This class contains three methods:
- prepare_model: How to wrap the original model using a tuner and set up trainable parameters
- save_pretrained: How to save the model during training
- from_pretrained: How to reload previously saved checkpoints for subsequent training and inference

These three methods will be called during the swift training process, allowing developers to use their own tuners without reading complex training code.

## PRM

Example is [here](https://github.com/modelscope/ms-swift/blob/main/swift/plugin/prm.py).

PRM stands for Process Reward Model, which is used in the `swift sample` command. PRM requires a simple interface:
```python
class PRM:

    def __init__(self):
        # init here
        pass

    def __call__(self, infer_requests: List[InferRequest], **kwargs) -> List[Union[float, List[float]]]:
        raise NotImplementedError
```

InferRequest comes from `swift.llm`, and the returned `List[Union[float, List[float]]]` can contain either rewards or multiple rewards. Developers can extract queries and responses from infer_requests and split them as needed, for example:
```text
Let's think step by step.

Step1: xxx

Step2: xxx

So, the answer is ...
```
Developers can split the process here and pass it in batches to PRM for inference and return rewards. More generally, developers can call a remote URL here, such as a closed-source PRM large model, and return rewards.

## ORM

Example is [here](https://github.com/modelscope/ms-swift/blob/main/swift/plugin/orm.py).

ORM stands for Outcome Reward Model. ORM generally uses regular expressions and determines whether a response is correct. For example:

```python
class MathORM(ORM):

    @staticmethod
    def extract_boxed_result(text):
        pattern = r'\\boxed{([^}]*)}'
        match = re.search(pattern, text)
        if match:
            return match.group(1).strip()
        else:
            return None

    def __call__(self, infer_requests: List[InferRequest], ground_truths: List[str],
                **kwargs) -> List[float]:
        rewards = []
        predictions = [request.messages[-1]['content'] for request in infer_requests]
        for prediction, ground_truth in zip(predictions, ground_truths):
            res1 = MathORM.extract_boxed_result(prediction) or ''
            res2 = MathORM.extract_boxed_result(ground_truth) or ''
            rewards.append(float(res1.strip() == res2.strip()))

        return rewards


orms = {
    'math': MathORM,
}
```

In the code above, we define a process for parsing mathematical responses. If the results are the same, it returns a score of 1.0; otherwise, it returns 0.0. Unlike PRM, this class's infer method has an additional parameter `ground_truths`, which represents the actual labels (standard responses defined in the dataset) corresponding to the infer_requests.