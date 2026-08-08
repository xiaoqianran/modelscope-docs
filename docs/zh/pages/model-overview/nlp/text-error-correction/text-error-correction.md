<!-- modelscope-docs: text-error-correction | model-overview/nlp/text-error-correction/text-error-correction_CN.md -->

# 模型概览

文本纠错任务旨在发现并纠正文本中存在的错误，包括拼写错误，语法错误，语义错误等。我们采用基于transformer的seq2seq建模，输入错误文本，生成正确的文本。具体地，我们使用fairseq库，使用中文BART预训练模型作为底座，先在Lang8数据上进行第一阶段训练，再在HSK数据上进行第二阶段训练。本模型为论文[MuCGEC](https://aclanthology.org/2022.naacl-main.227/)的seq2seq方法的benchmark，更多训练细节详见论文。在此基础上，我们优化了BART词典，补充了一些常见字和标点，进一步增强了纠错效果，详见论文（已录用，Publish中）。

论文的摘要信息如下：

```text
我们围绕数据、模型、评估方法构建了一套benchmark，希望能进一步推动纠错任务的发展。数据上，我们人工构建了多答案、多来源的验证、测试集(约7k)；模型上，我们开源了主流的seq2seq和seq2eidts纠错模型；评估方法上，我们提出基于字的评估方法。
```

模型领先性：

	1.	使用最新开源的中文BART模型作为底座，并针对词典缺失常见字和标点问题进行补充。
	2.	在高质量dev集上进行模型评估和选取，选取的模型更符合需求。

# 模型配置项

本模型基于fairseq库开发，暂时仅支持pipeline的推理，推理所需的模型参数已存储在模型中。后续支持finetuning后，会给出相对较好的超参数设置。

本模型的输入基本单位是句子，如需输入段落，可自行进行分句操作。

# 模型
本节介绍如何跑通文本纠错模型，包括从modelscope中获取模型，加载模型，前处理等等。
## 模型文件&模型加载
您可以用snapshot_download下载我们的模型到本地。
```python
from modelscope.hub.snapshot_download import snapshot_download
model_dir = snapshot_download('damo/nlp_bart_text-error-correction_chinese') 
```

您可以用BartForTextErrorCorrection类直接下载并加载模型。
```python
from modelscope.models.nlp import BartForTextErrorCorrection
model = BartForTextErrorCorrection.from_pretrained('damo/nlp_bart_text-error-correction_chinese')
```
### 模型forward参数


* **input** (`Dict[str, Tensor]`) the outputs of preprocessor.
           
                Example:
                {'net_input':
                    {'src_tokens':tensor([2478,242,24,4]),
                    'src_lengths': tensor([4])}
                }

### 模型输出

* (`Dict[str, Tensor]`): the outputs of model.
  
                Example:
                    {
                        'predictions': Tensor([1377, 4959, 2785, 6392...]), # tokens need to be decode by tokenizer
                    }

## 前处理器
```python
model_dir = model.model_dir #获取本地模型路径
preprocessor = TextErrorCorrectionPreprocessor(model_dir)
print(preprocessor('这洋的话，下一年的福气来到自己身上。'))
```
## 文本纠错的pipeline
我们将上述模型加载，前处理和后处理封装成了pipeline, 方便快捷使用
```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

model_id = 'damo/nlp_bart_text-error-correction_chinese'
input = '这洋的话，下一年的福气来到自己身上。'
pipeline = pipeline(Tasks.text_error_correction, model=model_id)
result = pipeline(input)
print(result['output'])
```







