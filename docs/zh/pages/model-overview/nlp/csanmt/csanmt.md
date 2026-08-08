<!-- modelscope-docs: csanmt | model-overview/nlp/csanmt/csanmt_CN.md -->

# 模型概览

神经机器翻译是目前主流的AI翻译技术，它需要从大量双语数据中学习翻译能力。然而，双语数据规模有限且获取成本很高，使得翻译质量的提升遇到诸多困难，数据稀缺的场景所存在的问题尤为凸显，极大地限制了神经机器翻译的应用场景。针对这一问题，连续语义增强机器翻译 (CSANMT) ([Learning to Generalize to More: Continuous Semantic Augmentation for Neural Machine Translation.](https://aclanthology.org/2022.acl-long.546/) Wei et al, ACL 2022. Outstanding Paper Award)突破了传统的离散语义空间数据增强模式，以有限的训练样本为锚点，学习连续语义分布以建模全局的句子空间；同时，结合邻域风险最小化策略优化神经机器翻译模型，有效提升双语数据的利用效率，显著改善模型的泛化能力和鲁棒性。

具体来说，CSANMT模型基于[Transformer](https://arxiv.org/abs/1706.03762)实现，除编码器和解码器以外，额外引入了一个跨语言（源语言和目标语言共享）语义编码器，用于构建连续语义空间。该模型的训练过程由三个阶段构成。首先，基于极大似然估计目标函数训练一个标准的Transformer模型；其次，基于困难负样例构造切线式对比学习目标函数，优化语义编码器，为任意一个训练样本构造一个语义邻接区域；最后，从邻接语义分布中采样增强样本，结合邻域风险最小化策略优化整体模型。该模型背后的主体思路可以应用于任意自然语言处理任务，缓解训练样本有限导致的模型泛化能力差的问题。

关于该模型更多细节介绍可以前往论文了解，论文摘要如下：

*The principal task in supervised neural machine translation (NMT) is to learn to generate target sentences conditioned on the source inputs from a set of parallel sentence pairs, and thus produce a model capable of generalizing to unseen instances. However, it is commonly observed that the generalization performance of the model is highly influenced by the amount of parallel data used in training. Although data augmentation is widely used to enrich the training data, conventional methods with discrete manipulations fail to generate diverse and faithful training samples. In this paper, we present a novel data augmentation paradigm termed Continuous Semantic Augmentation (CSANMT), which augments each training instance with an adjacency semantic region that could cover adequate variants of literal expression under the same meaning. We conduct extensive experiments on both rich-resource and low-resource settings involving various language pairs, including WMT14 English-\{German,French\}, NIST Chinese-English and multiple low-resource IWSLT translation tasks. The provided empirical evidences show that CSANMT sets a new level of performance among existing augmentation techniques, improving on the state-of-theart by a large margin.*

重要提示：

* 区别于句子编码器，额外引入一个语义编码器是必要的，可以有效缓解不同任务所提取的特征表示相互冲突。
* 切线式对比学习只是在机器翻译任务上训练语义编码器的有效技术之一，在其他任务上可能不是最合适的，建议尝试更多训练目标函数（如相似度最大化、欧氏距离最小化等），择优使用。
* 语义编码器在第二阶段训练完成以后，固定器其参数，在第三训练阶段会取得更好的效果；可以采用现有的多语言预训练模型（如[XLM-R](https://arxiv.org/abs/1911.02116)，[InfoXLM](https://arxiv.org/abs/2007.07834)，[HiCTL](https://arxiv.org/abs/2007.15960)等）作为语义编码器。
* 连续语义增强技术可以跟离散的数据增强方法（如[Back-translation](https://arxiv.org/abs/1511.06709)）结合使用。

大规模实验结果显示，该技术在多个公开数据集上均取得了最佳效果。在使用同等双语数据的前提下，相比传统方法，连续语义增强能够显著提升翻译质量。即便只使用少量的双语数据也能充分学习，达到与传统方法使用全部双语数据同等的效果。该技术已应用于AliExpress国际化电商翻译场景，为全球商家提供精准的多语种翻译服务，并显著提升商品转化效率。

CSANMT与业内相关技术的异同点：

| 方法                                                   | 是否新增训练集外数据 | 是否对原数据改写 | 是否保持原语义 | 覆盖数据规模 |
|:------------------------------------------------------|:-----------------:|:-------------:|:------------:|:----------:|
| [SwitchOut](https://arxiv.org/abs/1808.07512)         |          否        |        是     |        否    |    有限     |
| [Back-translation](https://arxiv.org/abs/1511.06709)  |          是        |        否     |        是    |    有限     |
| [CSANMT](https://aclanthology.org/2022.acl-long.546/) |          是        |        是     |        是    |    无限     |


# 模型参数配置项

CSANMT模型的参数配置可以在下载下来的模型文件中找到configuration.json
文件，该文件一般格式如下：

```text
{
    "framework": "tensorflow",
    "task": "translation",
    "pipeline": {
        "type": "csanmt-translation"
    },
    "model": {
        "type": "csanmt-translation",
        "hidden_size": 1024,                          # 词嵌入维度，模型隐含层神经元个数
        "filter_size": 4096,                          # FFN激活层神经元个数
        "num_heads": 16,                              # 多头注意力机制heads数量
        "num_encoder_layers": 24,                     # 编码器深度
        "num_decoder_layers": 6,                      # 解码器深度
        "attention_dropout": 0.0,                     # 注意力层dropout权重，finetune阶段推荐设置为0.1
        "residual_dropout": 0.0,                      # 参差连接层dropout权重，finetune阶段推荐设置为0.1
        "relu_dropout": 0.0,                          # FNN激活层dropout权重，finetune阶段推荐设置为0.1
        "layer_preproc": "layer_norm",                # pre-norm设置，若layer_preproc=layer_norm，那么layer_postproc必须设置为none
        "layer_postproc": "none",                     # post-norm设置，若layer_postproc =layer_norm，那么layer_preproc必须设置为none
        "shared_embedding_and_softmax_weights": true, # 词嵌入矩阵与softmax权值矩阵参数是否共享
        "shared_source_target_embedding": true,       # 源语言和目标语言词嵌入急诊参数是否共享
        "initializer_scale": 0.1,                     # 参数初始化范围
        "position_info_type": "absolute",             # 位置编码模式，可选模式[absolute, relative]
        "max_relative_dis": 16,                       # 相对位置编码窗口大小
        "num_semantic_encoder_layers": 4,             # 语义编码器深度
        "src_vocab_size": 50000,                      # 源语言词表大小
        "trg_vocab_size": 50000,                      # 目标语言词表大小
        "seed": 1234,
        "beam_size": 4,
        "lp_rate": 0.6,
        "max_decoded_trg_len": 100
    },
    "dataset": {
        "train_src": "train.zh",          # 指定源语言数据文件
        "train_trg": "train.en",          # 指定目标语言数据文件
        "src_vocab": {
            "file": "src_vocab.txt"       # 指定源语言词典
        },
        "trg_vocab": {
            "file": "trg_vocab.txt"       # 指定目标语言词典
        }
    },
    "preprocessor": {
        "src_lang": "zh",                 # 指定源语言
        "tgt_lang": "en",                 # 指定目标语言
        "src_bpe": {
            "file": "bpe.zh"              # 指定源语言BPE文件
        },
        "tgt_bpe": {
            "file": "bpe.en"              # 指定目标语言BPE文件
        }
    },
    "train": {
        "num_gpus": 0,                          # 指定GPU数量，0表示CPU运行
        "warmup_steps": 4000,                   # 冷启动所需要的迭代步数，默认为4000
        "update_cycle": 1,                      # 累积update_cycle个step的梯度进行一次参数更新，默认为1
        "keep_checkpoint_max": 1,               # 训练过程中保留的checkpoint数量
        "confidence": 0.9,                      # label smoothing权重
        "optimizer": "adam",
        "adam_beta1": 0.9,
        "adam_beta2": 0.98,
        "adam_epsilon": 1e-9,
        "gradient_clip_norm": 0.0,
        "learning_rate_decay": "linear_warmup_rsqrt_decay", # 学习衰减策略，可选模式包括[none, linear_warmup_rsqrt_decay, piecewise_constant]
        "initializer": "uniform_unit_scaling",  # 参数初始化策略，可选模式包括[uniform, normal, normal_unit_scaling, uniform_unit_scaling]
        "initializer_scale": 0.1,
        "learning_rate": 1.0,                   # 学习率的缩放系数，即根据step值确定学习率以后，再根据模型的大小对学习率进行缩放
        "train_batch_size_words": 1024,         # 单训练batch所包含的token数量
        "scale_l1": 0.0,
        "scale_l2": 0.0,
        "train_max_len": 100,                   # 默认情况下，限制训练数据的长度为100，用户可自行调整
        "max_training_steps": 5,                # 最大训练步数
        "save_checkpoints_steps": 1000,         # 间隔多少steps保存一次模型
        "num_of_samples": 4,                    # 连续语义采样的样本数量
        "eta": 0.6                              # 混合高斯循环采样的组合系数
    },
    "evaluation": {
        "beam_size": 4,                         # 解码过程中的集束搜索空间
        "lp_rate": 0.6,                         # 长度惩罚系数
        "max_decoded_trg_len": 100              # 最大解码长度，超过阈值自动终止解码过程，用户可自行调整
    }
}
```

如果您使用了modelscope提供的backbone模型文件进行后续finetune，那么大多数的参数都需要保持原样，以便模型文件可以正常加载，但是仍然可以对dropout prob等参数进行修改。

# 模型前处理

## Tokenizer
CSANMT模型对英语/德语/法语/俄语等语言使用[sacremoses](https://github.com/alvations/sacremoses)进行令牌化、使用[jieba](https://github.com/fxsjy/jieba)进行中文分词；此外，利用[subword_nmt](https://github.com/rsennrich/subword-nmt)进行bpe：

```py
import jieba
from sacremoses import MosesDetokenizer, MosesPunctNormalizer, MosesTokenizer
from subword_nmt import apply_bpe

from modelscope.utils.config import Config

cfg = Config.from_file(osp.join("damo/nlp_translation_zh2en", "configuration.json"))

lang_id = cfg['preprocessor']['src_lang'] # or cfg['preprocessor']['tgt_lang']
bpe_path = osp.join("damo/nlp_translation_zh2en", self.cfg['preprocessor']['src_bpe']['file'])

# tokenizer
if lang_id == 'zh':
    tok = jieba
else:
    punct_normalizer = MosesPunctNormalizer(lang=lang_id)
    tok = MosesTokenizer(lang=lang_id)

# detokenizer
detok = MosesDetokenizer(lang=lang_id)

# byte-pair-encoding
bpe = apply_bpe.BPE(open(bpe_path))
```

## 前处理器（Preprocessor）
对输入的字符串序列进行处理，形成数值化tensor
```
input_str = "阿里巴巴的使命是让天下没有难做的生意"
input_tok = ' '.join(list(tok.cut(input_str))) # or tok.tokenize(input_str, return_str=True) for other languages
input_bpe =bpe.process_line(input_tok)

input_ids = np.array([[
            src_vocab[w]
            if w in src_vocab else cfg['model']['src_vocab_size']
            for w in input_bpe.strip().split()]])

input = {'input_ids': input_ids}
```

# 模型主体

## 模型类

CSANMT模型继承modelscope.models.base.Model基类

```text
class modelscope.models.nlp.CsanmtForTranslation (modelscope.models.base.Model)

    def __init__(self, model_dir, *args, **kwargs):
        """
        Args:
            params (dict): the model configuration.
        """
        super().__init__(model_dir, *args, **kwargs)
        self.params = kwargs
```
### 参数列表   
* **model_dir** (str) – The model_dir to load the configuration from. Note that this model_dir must exist in the local file system.

* **kwargs** (`dict`, optional) 
    
    hidden_size: (int, defaults to 1024) – Dimensionality of the encoder layers and the embedding layer.
    
    filter_size: (int, defaults to 4096) – Dimensionality of the FFN activation layers.
    
    num_heads: (int, defaults to 16) – Number of attention heads.
    
    num_encoder_layers: (int, defaults to 24) – Number of hidden layers in the Transformer encoder.

    num_decoder_layers: (int, defaults to 6) – Number of hidden layers in the Transformer decoder.
    
    ...
    
    and other parameters reported in `model` items of `configuration.json`.


## 模型Forward函数

```text
def forward(self,input: Dict[str, Tensor],label: Dict[str, Tensor] = None) -> Dict[str, Tensor]:
```
### 参数列表 

* **input** (`tensor` of shape `(batch_size, sequence_length)`) – Indices of input sequence tokens in the source vocabulary.

* **label** (`tensor` of shape `(batch_size, sequence_length)`, optional) – Indices of label sequence tokens in the target vocabulary. Set as `None` during pipeline inference.


## 模型输出
```
outputs =
{
    'output_seqs': output_seqs,       # beam search解码出的最优输出序列
    'output_scores': output_scores,   # 最优输出序列对应的打分
}
```

### 参数列表 

* ** output_seqs** (`tensor` of shape `(batch_size, sequence_length)`) – Indices of output sequence tokens in the target vocabulary.

* ** output_scores** (`tensor` of shape `(batch_size)`, optional) – Scores of output sequences.


# 模型后处理

将数值化tensor恢复成字符串序列

```text
output_seqs = outputs['output_seqs'][0]
wids = list(output_seqs[0]) + [0] # 词表中位置0对应的token是句子结束符 </s>
wids = wids[:wids.index(0)]

translation_out = ' '.join([
    trg_rvocab[wid] if wid in trg_rvocab else '<unk>'
    for wid in wids]).replace('@@ ', '').replace('@@', '')

translation_out = detok.detokenize(translation_out.split())

result = {"translation": translation_out}
```

# Pipeline使用示例

```python
# Chinese-to-English

from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

input_sequence = '声明补充说，沃伦的同事都深感震惊，并且希望他能够投案自首。'

pipeline_ins = pipeline(task=Tasks.translation, model="damo/nlp_csanmt_translation_zh2en")
outputs = pipeline_ins(input=input_sequence)

print(outputs['translation']) # 'The statement added that Warren's colleagues were deeply shocked and expected him to turn himself in.'
```

# 模型微调

## 修改参数配置

用户可根据实际情况对如下参数进行调整，其他参数可保持默认值
```
{
    "model": {
        "attention_dropout": 0.1,
        "residual_dropout": 0.1,   
        "relu_dropout": 0.1
    },
    "train": {
        "num_gpus": 8,                          # 单机8卡（GPU）               
        "update_cycle": 1,                      # 累积梯度更新频次设置为1
        "keep_checkpoint_max": 5,               # 训练过程中最多保留5个checkpoint
        "max_training_steps": 100000,
    },
    "dataset": {
        "train_src": "train.zh",                # 指定源语言数据文件
        "train_trg": "train.en",                # 指定目标语言数据文件
    }
}
```

## 示例
```python
# model_dir目录的文件组织应包含如下结构：
# model_dir
# |_ configuration.json
# |_ src_vocab.txt
# |_ trg_vocab.txt
# |_ bpe.zh
# |_ bpe.en
# |_ train.zh
# |_ train.en
# |_ tf_ckpts
#    |_ checkpoint
#    |_ ckpt-0.data-00000-of-00001
#    |_ ckpt-0.index
#    |_ ckpt-0.meta

# Chinese-to-English

from modelscope.trainers.nlp import CsanmtTranslationTrainer

trainer = CsanmtTranslationTrainer(model="damo/nlp_csanmt_translation_zh2en")
trainer.train()
```

# 模型支持的语向及评估效果

<table>
   <tr>
      <td>语向</td>
      <td>模型大小</td>
      <td>参数量</td>
      <td>存储大小</td>
      <td>新闻 (NLTK_BLEU)</td>
      <td>口语 (NLTK_BLEU)</td>
   </tr>
   <tr>
      <td>中英</td>
      <td>24-6-1024</td>
      <td>570 millions</td>
      <td>2.2 G</td>
      <td>(WMT18-20) Google 35.8 > ModelScope 34.9 </td>
      <td>(IWSLT 16-17) ModelScope 28.4 > Google 27.8 </td>
   </tr>
   <tr>
      <td>英中</td>
      <td>24-6-1024</td>
      <td>570 millions</td>
      <td>2.2 G</td>
      <td>(WMT18-20) Google 31.3 > ModelScope 29.8 </td>
      <td>(IWSLT 16-17) Google 19.8 = ModelScope 19.8 </td>
   </tr>
   <tr>
      <td>英法</td>
      <td>24-6-512</td>
      <td>168 millions</td>
      <td>642M</td>
      <td>(WMT14) ModelScope 46.83 > Google 46.01 </td>
      <td>(IWSLT 14) ModelScope 46.90 > Google 45.92 </td>
   </tr>
   <tr>
      <td>法英</td>
      <td>24-6-512</td>
      <td>168 millions</td>
      <td>642M</td>
      <td>(WMT14) Google 42.77 > ModelScope 42.10 </td>
      <td>(IWSLT 14) Google 47.14 > ModelScope 46.91 </td>
   </tr>
   <tr>
      <td>英西</td>
      <td>24-6-512</td>
      <td>168 millions</td>
      <td>642M</td>
      <td>(WMT13) ModelScope 37.1 > Google 37.0 </td>
      <td>(IWSLT 14) Google 47.55 > ModelScope 47.28 </td>
   </tr>
   <tr>
      <td>西英</td>
      <td>24-6-512</td>
      <td>168 millions</td>
      <td>642M</td>
      <td>(WMT13) ModelScope 38.37 > Google 37.79 </td>
      <td>(IWSLT 14) Google 49.76 > ModelScope 49.25 </td>
   </tr>
</table>

# 论文引用
如果你觉得这个该模型对有所帮助，请考虑引用下面的相关的论文：
``` bibtex
@inproceedings{wei-etal-2022-learning,
  title = {Learning to Generalize to More: Continuous Semantic Augmentation for Neural Machine Translation},
  author = {Xiangpeng Wei and Heng Yu and Yue Hu and Rongxiang Weng and Weihua Luo and Rong Jin},
  booktitle = {Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics, ACL 2022},
  year = {2022},
}
```
