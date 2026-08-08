<!-- modelscope-docs: Add Docstrings and Submit a PR | contribute/code-based-integration/submit-a-pr/submit-a-pr_EN.md -->

## Add Documentation

After adding the use cases, you can add some documentation to your code. Please refer to the [Code Comment Guidelines](./接入帮助/代码注释规范.md) for ModelScope's documentation requirements.

## Submit a PR

Before submitting a PR, please note:

- The integrated models, preprocessors, pipelines, trainers, etc. are fully functional, model files have been uploaded to ModelHub, and test cases can run properly
- Code formatting and comments comply with ModelScope's requirements. ModelScope supports automatic code formatting correction via pre-commit

```shell
pip install pre-commit
# Run in the ModelScope folder
pre-commit run --all-files
# If pre-commit reports errors, please fix the code according to the prompts.
```

If you have already submitted a PR previously, simply push the modified code. Otherwise, please submit a new PR now and wait for review by ModelScope developers.