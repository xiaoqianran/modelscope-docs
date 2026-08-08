<!-- modelscope-docs: Web-UI | llm-training-and-inference/intro/web-ui/web-ui_EN.md -->

# Web-UI

SWIFT now supports GUI-based training and inference with the same parameter support as script-based training. After installing SWIFT, use the following command:

```shell
swift web-ui --lang zh
# or en
swift web-ui --lang en
```

to launch the GUI for training and inference.

SWIFT web-ui is a high-level wrapper around command-line tools. When you start training, deployment, or other tasks through the GUI, it launches an independent process in the system via command line, similar to the following pseudocode:
```python
import os
os.system('swift sft --model xxx --dataset xxx')
```

This design gives web-ui several characteristics:
1. Each hyperparameter in the web-ui is labeled with `--xxx`, which corresponds to the [command-line parameters](../feature-guide/command-line-parameters.md)
2. web-ui can run multiple training/deployment tasks in parallel on a multi-GPU machine
3. When the web-ui service is closed, background services continue running—this prevents training processes from being interrupted when web-ui is closed. To stop background services, simply **select the corresponding task** and click "Kill Service" in the `Runtime` tab of the interface
4. After restarting web-ui, if you need to display running services, click "Recover Runtime Tasks" in the `Runtime` tab
5. The training interface supports displaying runtime logs. After selecting a task, manually click "Show Runtime Status". During training, the runtime status displays training charts including basic metrics like training loss, training accuracy, learning rate, etc. For human alignment tasks, the interface charts show key metrics like margin and logps
6. PPO training is not supported in web-ui due to its complexity. It's recommended to run directly using the [shell scripts](https://github.com/modelscope/ms-swift/tree/main/examples/train/rlhf/ppo) in the examples directory

To use share mode, add the `--share true` parameter. Note: Do not use this parameter in DSW, notebook, or similar environments.

Currently, ms-swift additionally supports GUI inference mode (i.e., Space deployment):

```shell
swift app --model '<model>' --studio_title My-Awesome-Space --stream true
# or
swift app --model '<model>' --adapters '<adapter>' --studio_title My-Awesome-Space --stream true
```

This launches an application with only an inference page, which deploys the model upon startup and provides it for subsequent use.