<!-- modelscope-docs: 编写测试用例 | contribute/code-based-integration/tests/tests_CN.md -->

# 编写测试用例

上面我们添加了模型、预处理器、pipeline等新组件并将他们注册进入了ModelScope，下面需要进行一些测试来保证正确性。

## 用例运行周期

ModelScope的测试用例在其他分支合并master时，会按照testlevel运行测试。

- testlevel=0的用例会在每个分支合并master时运行, 此level的用例一般是功能冒烟用例、集成用例，且运行需时短暂
- testlevel>0的用例会在master daily测试时运行，此level的用例一般是需要一定时间或硬件条件的集成用例，可以运行一定时间（避免长达数个小时的用例出现）
- skip的用例不会自动运行，此level的用例一般用于场景复现，用户自行把控

```python
import unittest
from modelscope.utils.test_utils import test_level


class TestExample(unittest.TestCase):

    @unittest.skipUnless(test_level() >= 2, 'Finetune case for daily running')
    def test_export_sbert_sequence_classification(self):
        ...
```

# 用例要求

1. 推理用例：根据模型id拉取模型，并调用pipeline进行推理。需要在断言中判断推理是否能正常完成，且推理给出的结果是符合接入之前的代码输出的。这个测试用例设置为testlevel=0

2. 训练用例：传入sample dataset和待测试模型，以最低的epoch运行训练，并验证如下过程：

   - 使用原始模型进行训练+交叉验证可以冒烟完成
   - 训练后生成的pth文件可以用于填入trainer.train/evaluate/predict的checkpoint_path参数中，并可以正常继续训练、评估、预测及生成label文件
   - 训练完成后可以生成output文件夹，其内的文件可以用于pipeline推理，推理结果输出正常

   此用例建议testlevel=0，如硬件要求较高或时间较长可以设置为testlevel=2

3. 建议：编写完整的训练用例，复现待接入模型的SOTA结果，此用例skip：

   - 验证loss下降正常，metric参数可以回归原始代码结果