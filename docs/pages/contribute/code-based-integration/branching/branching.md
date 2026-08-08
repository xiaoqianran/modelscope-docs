<!-- modelscope-docs: Create a Branch and Submit a PR | contribute/code-based-integration/branching/branching_EN.md -->

# Create a Branch

- If you're integrating a model on GitHub, please fork the [ModelScope Library](https://github.com/modelscope/modelscope) on GitHub, then create a new branch.
- If you're integrating a model on Aone, directly create a new branch.

```shell
# Assuming the code has already been cloned locally and you're currently in the directory
git checkout master
git pull
# feat/my-awesome-model-branch is a temporary name; please replace it with your actual branch name
git branch feat/my-awesome-model-branch
git checkout feat/my-awesome-model-branch
```

# Create an Empty Model File

**ModelScope models are located in the `modelscope/models` directory**, which is organized by domain such as `cv`, `nlp`, `audio`, `multi_modal`, and `science`, representing the five modalities supported by ModelScope. You need to choose one to place your model.

If the directory for your model doesn't exist, create one in the corresponding modality directory.

> For Natural Language Processing, Multi-modal, Audio, and Science modalities, directories are created based on the model name, while for Computer Vision modality, directories are created using the model name plus task name.

Once the directory is created, you can create the specific model code files.

# Create Task Code and Model Code

If the task type and model type don't exist in ModelScope, you need to add these names to the respective enumeration classes for future use. In `modelscope/utils/constant.py`, there are task enumerations for each domain: `NLPTasks`/`CVTasks`/`AudioTasks`/`MultiModalTasks`. Add the following to the appropriate class based on your domain:

```text
awesome_task = 'awesome-task'
```

In `modelscope/metainfo.py`, there's a model name enumeration called `Models`. Add the following:

```text
awesome_model = 'awesome-model'
```

Please note that the string on the right side should use hyphens instead of underscores. This right-side content (not the left-side variable name) is what should be specified in configuration files like `configuration.json`.

That's it! Now you can submit your PR.

## Submit a Pull Request

**This step is optional for users.** However, we recommend submitting a PR in the following situations:

- The model is complex, making integration for inference or training difficult
- You cannot reuse existing training, inference, or preprocessing components, or you don't understand how to use existing components
- Your model's task type is new
- You're confused about ModelScope's mechanisms or integration methods

After submitting your PR, you can ask questions by adding comments, and developers will help answer your questions and prevent you from going down the wrong path during integration.