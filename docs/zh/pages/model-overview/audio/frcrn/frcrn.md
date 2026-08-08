<!-- modelscope-docs: frcrn | model-overview/audio/frcrn/frcrn_CN.md -->

# 模型概览
## 模型历史

在语音通信和自动语音识别 (ASR) 应用中，目标语音经常受到附加背景噪声和混响的严重污染。损坏的语音导致语音感知质量和可理解性以及自动语音识别 (ASR) 性能降低。语音增强的目标是从损坏的语音中提取目标信号，以获得更好的感知质量和可理解性以及更优秀的语音识别性能。几十年来，单通道语音增强一直被认为是一个具有挑战性的问题。

近年来，基于深度学习的方法取得了重大进展。语音增强问题可以较容易地转化为以模拟的嘈杂语音为输入、干净语音为目标的监督学习问题。目前，许多不同结构的深度模型被用来进行语音增强，例如前馈神经网络 (FNN) 【1】、递归神经网络 (RNN) 【2】 和卷积神经网络 (CNN) 【3】。FNN 模型在短时上下文窗口上执行，不能有效利用语音信号的长期上下文信息。 RNN 模型以基于序列的处理方式可以处理长期上下文信息，但通常需要人工提取的特征作为输入，例如 MFCC。 CNN 模型能够提取高阶特征，但主要局限于利用局部时谱模式。

最近，通过结合 CNN 和 RNN，卷积循环网络 (CRN) 被引入到语音增强问题上 【4、5】。 CRN 集成了卷积编码器-解码器 (CED) 结构和循环结构。 在 CED 中，编码器从局部时谱模式中提取高阶特征，解码器重建目标图谱。循环结构利用由编码器提供的高阶特征进一步对语音序列长期的时间依赖性进行建模。 因此，CRN不仅可以通过 CED 结构提取高阶特征，而且可以通过循环结构对长期时间依赖性进行建模。 CRN 已被证明对语音增强非常有效，从CRN通过扩展获得的复数值网络 DCCRN 【6】在 Interspeech 2020 DNS 挑战赛中取得了最佳性能。在 【7】 中，我们也证明了 CRN 在很大程度上依赖于 CED 中卷积的表征能力，并且通过引入复数卷积块注意模块 (CCBAM) 来提升特征表示，从而提高了性能。 

在FRCRN这项工作中，我们提出了一种新颖的卷积循环编码器-解码器 (CRED) 结构来提升沿频率轴的特征表示。与 CED 中的纯卷积操作不同，我们在 CRED 中的每个卷积之后添加一个频率递归。频率递归应用于沿频率轴的 3D 卷积特征图。具体而言，在每个时间帧上，首先以通道数为维度，从低频到高频形成频率序列。然后，频率序列的递归变换是基于前馈序列记忆网络（FSMN）【8】进行实现。卷积层和频率循环层形成卷积循环（CR）块。我们通过在编码器和解码器中堆叠多个 CR 块来形成 CRED。预计 CRED 不仅可以捕获局部时谱结构，还可以捕获远程频率相关性。和CNR一样，通过进一步添加一个时间循环结构，我们形成了一个称为频率循环 CRN (FRCRN) 的新框架。

以上引用论文：

* [1]  T. Gao, J. Du, L. R. Dai, and C. H. Lee, “SNR-based progres- sive learning of deep neural network for speech enhancement,” in Interspeech, 2016. 
* [2]  T. Gao, J. Du, L. R. Dai, and C. H. Lee, “Densely connected progressive learning for lstm-based speech enhancement,” in IEEE ICASSP, 2018, pp. 5054–5058. 
* [3]  S. R. Park and J. W. Lee, “A fully convolutional neural network for speech enhancement,” in Interspeech, 2017. 
* [4]  K. Tan and D. Wang, “A convolutional recurrent neural net- work for real-time speech enhancement,” in Proc. Interspeech, 2018. 
* [5]  H. Zhao, S. Zarar, I. Tashev, and C.-H. Lee, “Convolutional- recurrent neural networks for speech enhancement,” in IEEE ICASSP, 2018, p. 2401–2405. 
* [6]  Y.Hu,Y.Liu,S.Lv,M.Xing,S.Zhang,Y.Fu,J.Wu,B.Zhang, and L. Xie, “DCCRN: Deep complex convolution recurrent network for phase-aware speech enhancement,” in Proc. Inter- speech, 2020. 
* [7]  S.Zhao,T.H.Nguyen,andB.Ma,“Monauralspeechenhance- ment with complex convolutional block attention module and joint time frequency losses,” in IEEE ICASSP, 2021. 
* [8]  S. Zhang, M. Lei, Z. Yan, and L. Dai, “Deep-fsmn for large vocabulary continuous speech recognition,” arXiv preprint arXiv:1803.05030, 2018.

## 技术特点

FRCRN语音降噪-16K模型是使用Deep Noise Suppression (DNS) Challenge 16kHz纯净语音和噪声数据训练的单通道智能语音降噪模型。我们在卷积编-解码(Convolutional Encoder-Decoder)架构的基础上提出卷积循环编-解码(Convolutional Recurrent Encoder-Decoder)架构，从而明显改善卷积核的视野局限性，提升降噪模型对频率维度的特征表达，尤其是频率长距离相关性表达获得促进，另外，我们引入前馈序列记忆网络（Feedforward Sequential Memory Network: FSMN）和对其进行复数域运算的扩展，从而更有效地对长序列语音进行建模。

## 相关论文

摘要：

```text
Convolutional recurrent networks (CRN) integrating a convolutional encoder-decoder (CED) structure and a recurrent structure have achieved promising performance for monaural speech enhancement. However, feature representation across frequency context is highly constrained due to limited receptive fields in the convolutions of CED. In this paper, we propose a convolutional recurrent encoder- decoder (CRED) structure to boost feature representation along the frequency axis. The CRED applies frequency recurrence on 3D convolutional feature maps along the frequency axis following each convolution, therefore, it is capable of catching long-range frequency correlations and enhancing feature representations of speech inputs. The proposed frequency recurrence is realized efficiently using a feedforward sequential memory network (FSMN). Besides the CRED, we insert two stacked FSMN layers between the encoder and the decoder to model further temporal dynamics. We name the proposed framework as Frequency Recurrent CRN (FRCRN). We design FRCRN to predict complex Ideal Ratio Mask (cIRM) in complex-valued domain and optimize FRCRN using both time-frequency-domain and time-domain losses. Our proposed approach achieved state-of-the-art performance on wideband bench- mark datasets and achieved 2nd place for the real-time fullband track in terms of Mean Opinion Score (MOS) and Word Accuracy (WAcc) in the ICASSP 2022 Deep Noise Suppression (DNS) challenge.
```

详见论文原文：

FRCRN: Boosting Feature Representation using Frequency Recurrence for Monaural Speech Enhancement [链接](https://arxiv.org/abs/2206.07293)

# 模型配置

## 模型参数

FRCRN模型的参数可以在下载下来的模型文件夹中找到configuration.json文件，该文件中"model"节点内容如下：

```json
{
    "type": "speech_frcrn_ans_cirm_16k",
    "complex": true,
    "model_complexity": 45,
    "model_depth": 14,
    "log_amp": false,
    "padding_mode": "zeros",
    "win_len": 640,
    "win_inc": 320,
    "fft_len": 640,
    "win_type": "hanning"
}
```

FRCRN模型的参数会从这个配置加载。

* **type** (str): 指定要使用的模型，目前只支持`speech_frcrn_ans_cirm_16k`模型。
* **complex** (bool): 模型建模网络是否使用复数域运算，缺省值为true, 目前仅支持复数域运算。
* **model_complexity** (int): 模型复杂度配置，缺省值为45。
* **model_depth** (int): 模型编解码器的卷积模块深度，缺省值为14，编解码器各使用7层卷机模块。
* **log_amp**(bool): 对幅度进行取对数运算压缩，缺省值为false。
* **padding_mode** (str): 编解码器里卷积运算时的添加数值类型，缺省值为zero，加0操作。
* **win_len** (int): 语音处理时的窗长，缺省值为640个样点。
* **win_inc** (int): 语音处理时的窗移，缺省值为320个样点或20毫秒。
* **fft_len** (int): 快速傅立叶变换的长度，缺省值为640，输出640个频率间隔。
* **win_type** (str): 快速傅立叶变换前使用的信号处理窗，缺省值为`hanning`窗。

当用户在推理中使用FRCRN模型时，这些参数一般都是固定的。您可以使用Model类直接拉起模型：

```python
from modelscope.models import Model
model = Model.from_pretrained('damo/speech_frcrn_ans_cirm_16k')
```

如果您使用modelscope的trainer进行训练，modelscope推荐您在trainer中对模型参数等进行配置和调节。训练过程可以参考下文“模型的训练”。

## 模型使用

### forward参数
    
* **input** (`torch.FloatTensor` of shape `(batch_size, sample_length)`) – 为输入的音频时间序列，可以按照batch_size进行batch批处理

### 返回值
模型返回一个list，其中元素依序分别为：

* speck L1 处理后的频谱，为模型中间结果
* wav L1 处理后的音频，为模型中间结果
* mask L1 音频对应的mask掩蔽值， 为模型中间结果
* speck L2：处理后的频谱，为模型输出结果 
* wav L2 处理后的音频，为模型输出结果
* mask L2 音频对应的mask掩蔽值，为模型输出结果

### Pipeline

如果用户的场景是推理，modelscope推荐您直接使用pipeline来完成您的需求。

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

ans = pipeline(
    Tasks.acoustic_noise_suppression,
    model='damo/speech_frcrn_ans_cirm_16k')
result = ans(
    'https://modelscope.oss-cn-beijing.aliyuncs.com/test/audios/speech_with_noise.wav',
    output_path='output.wav')
```

有关pipeline的使用和它们的输出格式请参考[这里](https://www.modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E6%8E%A8%E7%90%86Pipeline)。

# 模型的训练

FRCRN模型的训练可以使用modelscope提供的trainer来进行。下面的代码展示了一个完整的模型训练过程。

**注意**：示例代码中使用的是本地数据集，需要用户下载[数据集](https://modelscope.cn/datasets/modelscope/ICASSP_2021_DNS_Challenge/summary)后按照说明在本地生成。用实际本地路径替换示例代码中的`/your_local_path/ICASSP_2021_DNS_Challenge` ，然后才能正常运行。

```python
import os

from datasets import load_dataset

from modelscope.metainfo import Trainers
from modelscope.msdatasets import MsDataset
from modelscope.trainers import build_trainer
from modelscope.utils.audio.audio_utils import to_segment

tmp_dir = f'./ckpt'
if not os.path.exists(tmp_dir):
    os.makedirs(tmp_dir)

hf_ds = load_dataset(
    '/your_local_path/ICASSP_2021_DNS_Challenge',
    'train',
    split='train')
mapped_ds = hf_ds.map(
    to_segment,
    remove_columns=['duration'],
    num_proc=8,
    batched=True,
    batch_size=36)
mapped_ds = mapped_ds.train_test_split(test_size=3000)
mapped_ds = mapped_ds.shuffle()
dataset = MsDataset.from_hf_dataset(mapped_ds)

kwargs = dict(
    model='damo/speech_frcrn_ans_cirm_16k',
    model_revision='beta',
    train_dataset=dataset['train'],
    eval_dataset=dataset['test'],
    work_dir=tmp_dir)
trainer = build_trainer(
    Trainers.speech_frcrn_ans_cirm_16k, default_args=kwargs)
trainer.train()
```

训练的具体细节和产出文件的使用请参考[模型的训练文档](https://www.modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E8%AE%AD%E7%BB%83Train)。






