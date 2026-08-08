<!-- modelscope-docs: space_t_cn | model-overview/nlp/space-t/space-t-cn/space-t-cn_CN.md -->

# 模型概览

Space-T-CN模型是一个中文多轮表格知识预训练语言模型，可用于解决下游的多轮Text-to-SQL语义解析任务。该模型并通过海量中文表格数据预训练(千万级)，在中文Text2SQL数据集上取得不错的效果。模型结构上，采用统一的 Transformer 架构作为模型底座，对输入的自然语言问题和表格的schema结构进行理解。然后，采用sketch-based方法分别预测SQL语句中select子句和where子句，从而构成最终的SQL语句。测试TableQA-中文-通用领域-base模型可以使用通用领域Text2SQL测试集。我们的模型获得了SOTA效果，预测的SQL exact-match准确率为0.861。

# 模型配置项

Space-T-CN模型的超参数控制可以在下载下来的模型文件中找到config.json文件，该文件一般格式如下：

```text
{
    "dropout": 0.2,
    "smoothing": 0.15,
    "beam_size": 2,
    "word_vocab": 30522
}
```
在预训练模型中，这些配置只是模型全部配置中的一部分。Space-T-CN的模型参数会通过Config类传入，下面是API文档中列举的常用的配置项：

## 参数列表

    
* **word_vocab** (`int`, optional, defaults to 30522) – Vocabulary size of the BERT model. Defines the number of different tokens that can be represented by the
`inputs_ids` passed when calling `BertModel`.

* **dropout** (`float`, optional, defaults to 0.2) – Dropout value in training process.

* **smoothing** (`float`, optional, defaults to 0.15) – Smoothing value in training process.

* **beam_size** (`int`, optional, defaults to 2) – Beam size of beam search algorithm in inference process.

当用户在推理中使用的Space-T-CN模型时，这些参数一般都是固定的。您可以使用Model类直接拉起模型：
```python
from modelscope.models import Model
model = Model.from_pretrained('damo/nlp_convai_text2sql_pretrain_cn')
```

# 模型前处理

## 前处理器（Preprocessor）

ModelScope的前处理器对各类任务进行了特化封装，有关Preprocessor的整体使用可以参考[这里](https://www.modelscope.cn/docs/%E6%95%B0%E6%8D%AE%E7%9A%84%E9%A2%84%E5%A4%84%E7%90%86)。

这里给出了在本任务中，初始化前处理器TableQuestionAnsweringPreprocessor的流程，代码如下。

```python
from transformers import BertTokenizer
from modelscope.utils.constant import ModelFile
from modelscope.preprocessors.space_T_cn.fields.database import Database
from modelscope.preprocessors import TableQuestionAnsweringPreprocessor
tokenizer = BertTokenizer(os.path.join(model.model_dir, ModelFile.VOCAB_FILE))
db = Database(
    tokenizer=tokenizer,
    table_file_path=[
        os.path.join(model.model_dir, 'databases', fname)
        for fname in os.listdir(
            os.path.join(model.model_dir, 'databases'))
    ],
    syn_dict_file_path=os.path.join(model.model_dir, 'synonym.txt'),
    is_use_sqlite=True)
preprocessor = TableQuestionAnsweringPreprocessor(
    model_dir=model.model_dir, db=db)
```

#### 数据库类Database的参数

* **tokenizer** (`Transformers.BertTokenizer`) – Directly use BertTokenizer of Huggingface.

* **table_file_path** (`List [String]`) – The path of tables in database.

* **syn_dict_file_path** (`String`) - The path of synonym file in database.

* **is_use_sqlite** (`Bool`) - If use sqlite, the bot will execute the predicted SQL query in database and return the result table.


#### 前处理器TableQuestionAnsweringPreprocessor的参数

* **model_dir** (`String`) - The directory of the model.

* **db** (`Database`) - The initialized Database instance.


# 模型调用

ModelScope的模型调用采用Pipeline的封装方式，有关Pipeline的整体使用可以参考[这里](https://www.modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E6%8E%A8%E7%90%86Pipeline)

这里给出了在本任务中，初始化流水线pieline的流程，代码如下。

```python
from modelscope.utils.constant import Tasks
from modelscope.pipelines import pipeline
pl = pipeline(
    Tasks.table_question_answering,
    model=model,
    preprocessor=preprocessor
)

questions = [
    '有哪些风险类型？',
    '风险类型有多少种？',
    '珠江流域的小(2)型水库的库容总量是多少？',
    '那平均值是多少？',
    '换成中型的呢？'
]
for question in questions:
    historical_queries = None
    output_dict = pl({
        'question': question,
        'history_sql': historical_queries
    })[OutputKeys.OUTPUT]
    sql_query = output_dict[OutputKeys.SQL_QUERY]
    historical_queries = output_dict[OutputKeys.HISTORY]
```

#### 流水线初始化的参数

* **model** (`Model`) – The initialized Model instance.

* **preprocessor** (`TableQuestionAnsweringPreprocessor`) – The initialized Preprocessor instance.


#### 流水线调用的参数

* **inputs** (`Dict`) – The inputs of pipeline.

这里，调用流水线进行模型预测时，需要使用到两部分输入：
1. question：指的是对该Text-to-SQL模型提出的问题，如上面的例子，用户可以提出问题“珠江流域的小(2)型水库的库容总量是多少？”
2. historical_queries：表示整个多轮对话过程中保存的历史信息，初始化时置为None，表示没有任何历史，随着对话的进行过程中，将模型预测的SQL query作为历史信息不断传给模型，可以实现多轮对话的需求，这里历史信息对应到`output_dict[OutputKeys.HISTORY]`。