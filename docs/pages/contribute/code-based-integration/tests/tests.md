<!-- modelscope-docs: Writing Test Cases | contribute/code-based-integration/tests/tests_EN.md -->

# Writing Test Cases

In the previous steps, we added new components such as models, preprocessors, and pipelines, and registered them into ModelScope. Now we need to write some tests to ensure their correctness.

## Test Case Execution Cycle

ModelScope test cases are executed according to their test level when other branches are merged into master:

- Test cases with `testlevel=0` run during every branch merge to master. These are typically smoke tests or integration tests that complete quickly.
- Test cases with `testlevel>0` run during daily master branch testing. These are typically integration tests requiring specific hardware or longer execution time (avoid tests that run for several hours).
- Skipped test cases are not executed automatically. These are typically used for scenario reproduction and are run manually by users.

```python
import unittest
from modelscope.utils.test_utils import test_level


class TestExample(unittest.TestCase):

    @unittest.skipUnless(test_level() >= 2, 'Finetune case for daily running')
    def test_export_sbert_sequence_classification(self):
        ...
```

# Test Requirements

1. **Inference Tests**: Pull the model using its model ID and invoke the pipeline for inference. The assertion should verify that inference completes successfully and produces results consistent with the output before integration. Set these test cases to `testlevel=0`.

2. **Training Tests**: Use a sample dataset and the model under test to run training with the minimum number of epochs, and verify the following:

   - Training with the original model plus cross-validation can complete successfully (smoke test)
   - The generated `.pth` file after training can be used as the `checkpoint_path` parameter in `trainer.train/evaluate/predict`, and can properly continue training, evaluation, prediction, and generate label files
   - After training completes, an output folder is generated, and files within can be used for pipeline inference with normal output results

   It's recommended to set these test cases to `testlevel=0`. If hardware requirements are high or execution time is long, set to `testlevel=2`.

3. **Recommendation**: Write comprehensive training test cases that reproduce the SOTA results of the model being integrated. These test cases should be skipped:

   - Verify that loss decreases normally and metric parameters can reproduce the original code results