<!-- modelscope-docs: Paraformer | model-overview/audio/paraformer/paraformer_EN.md -->

# Introduction to Paraformer Model

This article introduces the non-autoregressive model Paraformer, including an overview of speech recognition models, introduction to the Paraformer model, how to use the Paraformer-large model on ModelScope, and the performance of the Paraformer-large model on various speech recognition tasks.

## What is a Speech Recognition Model

Speech, as the most natural and effective communication method, has always been one of the most focused research areas in human-computer communication and interaction. The main purpose of automatic speech recognition is to enable computers to "understand" human speech and convert speech waveform signals into text. It is one of the key technologies for achieving intelligent human-computer interaction. Technical breakthroughs over the past decade have enabled speech recognition to move from research to practical applications, unlocking many application scenarios such as voice input methods, intelligent customer service, voice-enabled vehicle navigation, and intelligent meeting minutes.

The fundamental framework of speech recognition has evolved from initially complex hybrid speech recognition systems to efficient and convenient end-to-end speech recognition systems. The representative model is Transformer. Transformer is an autoregressive end-to-end model that needs to generate target text sequentially, resulting in low computational parallelism and inefficient GPU-based inference. To address the low parallel computing efficiency of Transformer's autoregressive text generation, the academic community proposed non-autoregressive models (Non-autoregressive model) to output target text in parallel (as shown in Figure 1). Based on the number of iteration rounds when generating target text, non-autoregressive models are divided into: multi-round iterative and single-round non-autoregressive models.

<div align=center>
<img src="./_resources/ar_nar.png">
</div>


Compared to autoregressive end-to-end speech recognition models represented by Transformer, non-autoregressive end-to-end speech recognition systems offer better inference efficiency but have some gap in recognition accuracy. The speech team at Tongyi Lab has proposed a new generation of non-autoregressive end-to-end speech recognition system based on Paraformer, which achieves recognition accuracy comparable to autoregressive end-to-end speech recognition while significantly improving inference efficiency.

## Paraformer Non-autoregressive End-to-End Speech Recognition Model

Recently, we have released on ModelScope speech recognition models trained on Alibaba's large-scale business data, covering different model architectures (UniASR, Paraformer), different model sizes (small, large), and different languages (Chinese, English, Chinese-English code-switching, Japanese, Russian, Indonesian, etc.). Taking Paraformer as an example, we will introduce its principles and how to experience and train your own Paraformer model.


### Basic Principles of Paraformer

<p align="center">
<img src="./_resources/struct.png" alt="Paraformer Model Architecture"  width="500" />


As shown in the figure above, the Paraformer model architecture consists of five components: Encoder, Predictor, Sampler, Decoder, and Loss function. The Encoder can adopt different network structures, such as self-attention, conformer, SAN-M, etc. The Predictor is a two-layer FFN that predicts the number of target characters and extracts acoustic vectors corresponding to target characters. The Sampler is a parameter-free module that generates semantic feature vectors based on input acoustic vectors and target vectors. The Decoder structure is similar to autoregressive models but uses bidirectional modeling (autoregressive uses unidirectional modeling). For the Loss function, in addition to cross-entropy (CE) and MWER discriminative optimization objectives, it also includes the MAE optimization objective for the Predictor.

Its core points mainly include:
- Predictor module: Uses a Continuous integrate-and-fire (CIF)-based predictor to extract acoustic feature vectors corresponding to target characters, enabling more accurate prediction of the number of target characters in speech.
- Sampler: Transforms acoustic feature vectors and target character vectors into semantic feature vectors through sampling, combined with a bidirectional Decoder to enhance the model's contextual modeling capability.
- MWER training criterion based on negative sample sampling.

For more detailed information, see:
- Paper: [Paraformer: Fast and Accurate Parallel Transformer for Non-autoregressive End-to-End Speech Recognition](https://arxiv.org/abs/2206.08317)
- Paper interpretation: [Paraformer: A Single-round Non-autoregressive End-to-End Speech Recognition Model with High Recognition Accuracy and High Computational Efficiency](https://mp.weixin.qq.com/s/xQ87isj5_wxWiQs4qUXtVw)


### ModelScope Open-source Industrial-grade Paraformer

#### Large Model

The open-source Paraformer-large model adopts a deeper and larger model structure compared to the academic Paraformer model described in the paper. The Paraformer-large model's Encoder has 50 layers, including memory-equipped self-attention (SAN-M) and feed-forward networks (FFN). The Decoder has 16 layers, including SAN-M, FFN, and multi-head attention (MHA).

#### Large Data

Unlike the paper's validation on individual closed datasets (AISHELL-1, AISHELL-2, etc.), we trained our model on larger-scale industrial data, utilizing tens of thousands of hours of 16K general data from domains including semi-far-field, input methods, audio-video, live streaming, and meetings. In fine-tuning experiments, we used individual datasets like AISHELL-1 and AISHELL-2 for model finetuning.

#### High Efficiency

In the open-source Paraformer-large model, we adopted a 6x downsampled low frame rate modeling scheme with a window length of 70ms and window shift of 60ms. Compared to a 10ms window shift, this reduces computational requirements by nearly 6x, enabling efficient inference for large models.


#### High Performance

The Paraformer-large model significantly outperforms published results on mainstream Chinese speech recognition tasks and demonstrates industrial deployment capability, achieving performance comparable to Alibaba Cloud's public cloud file transcription service on industrial-scale data.

### Performance of Paraformer

We conducted experiments on a series of speech recognition tasks to validate the superior performance of our proposed Paraformer model, including academic datasets AISHELL-1, AISHELL-2, WenetSpeech, and third-party evaluation SpeechIO TIOBE white-box test sets.

### Public Datasets

#### AISHELL-1

| AISHELL-1 test                                   | w/o LM                                | w/ LM                                 |
|:------------------------------------------------:|:-------------------------------------:|:-------------------------------------:|
| <div style="width: 150pt">Espnet</div>           | <div style="width: 150pt">4.90</div>  | <div style="width: 150pt">4.70</div>  |
| <div style="width: 150pt">Wenet</div>            | <div style="width: 150pt">4.61</div>  | <div style="width: 150pt">4.36</div>  |
| <div style="width: 150pt">K2</div>               | <div style="width: 150pt">-</div>     | <div style="width: 150pt">4.26</div>  |
| <div style="width: 150pt">Blockformer</div>      | <div style="width: 150pt">4.29</div>  | <div style="width: 150pt">4.05</div>  |
| <div style="width: 150pt">Paraformer-large</div> | <div style="width: 150pt">1.95</div>  | <div style="width: 150pt">-</div>     |

#### AISHELL-2

|           | dev_ios| test_android| test_ios|test_mic|
|:-------------------------------------------------:|:-------------------------------------:|:-------------------------------------:|:------------------------------------:|:------------------------------------:|
| <div style="width: 150pt">Espnet</div>            | <div style="width: 70pt">5.40</div>  |<div style="width: 70pt">6.10</div>  |<div style="width: 70pt">5.70</div>  |<div style="width: 70pt">6.10</div>  |
| <div style="width: 150pt">WeNet</div>             | <div style="width: 70pt">-</div>     |<div style="width: 70pt">-</div>     |<div style="width: 70pt">5.39</div>  |<div style="width: 70pt">-</div>    |
| <div style="width: 150pt">Paraformer-large</div>  | <div style="width: 70pt">2.80</div>  |<div style="width: 70pt">3.13</div>  |<div style="width: 70pt">2.85</div>  |<div style="width: 70pt">3.06</div>  |


#### Wenetspeech

|           | dev| test_meeting| test_net|
|:-------------------------------------------------:|:-------------------------------------:|:-------------------------------------:|:------------------------------------:|
| <div style="width: 150pt">Espnet</div>            | <div style="width: 100pt">9.70</div>  |<div style="width: 100pt">15.90</div>  |<div style="width: 100pt">8.80</div>  |
| <div style="width: 150pt">WeNet</div>             | <div style="width: 100pt">8.60</div>  |<div style="width: 100pt">17.34</div>  |<div style="width: 100pt">9.26</div>  |
| <div style="width: 150pt">K2</div>                | <div style="width: 100pt">7.76</div>  |<div style="width: 100pt">13.41</div>  |<div style="width: 100pt">8.71</div>  |
| <div style="width: 150pt">Paraformer-large</div>  | <div style="width: 100pt">3.57</div>  |<div style="width: 100pt">6.97</div>   |<div style="width: 100pt">6.74</div>  |

The three tables above show the performance of the Paraformer-large model on AISHELL-1, AISHELL-2, and WenetSpeech test sets, significantly outperforming current published results and models trained on individual closed datasets. From the test results, we can see the importance of large data for speech recognition system performance.


### SpeechIO TIOBE

- Decode config w/o LM:
  - Decode without LM
  - Beam size: 1
- Decode config w/ LM:
  - Decode with Transformer-LM
  - Beam size: 10
  - LM weight: 0.15

| testset | w/o LM | w/ LM |
|:------------------:|:----:|:----:|
|<div style="width: 200pt">SPEECHIO_ASR_ZH00001</div>| <div style="width: 150pt">0.49</div> | <div style="width: 150pt">0.35</div> |
|<div style="width: 200pt">SPEECHIO_ASR_ZH00002</div>| <div style="width: 150pt">3.23</div> | <div style="width: 150pt">2.86</div> |
|<div style="width: 200pt">SPEECHIO_ASR_ZH00003</div>| <div style="width: 150pt">1.13</div> | <div style="width: 150pt">0.80</div> |
|<div style="width: 200pt">SPEECHIO_ASR_ZH00004</div>| <div style="width: 150pt">1.33</div> | <div style="width: 150pt">1.10</div> |
|<div style="width: 200pt">SPEECHIO_ASR_ZH00005</div>| <div style="width: 150pt">1.41</div> | <div style="width: 150pt">1.18</div> |
|<div style="width: 200pt">SPEECHIO_ASR_ZH00006</div>| <div style="width: 150pt">5.25</div> | <div style="width: 150pt">4.85</div> |
|<div style="width: 200pt">SPEECHIO_ASR_ZH00007</div>| <div style="width: 150pt">5.51</div> | <div style="width: 150pt">4.97</div> |
|<div style="width: 200pt">SPEECHIO_ASR_ZH00008</div>| <div style="width: 150pt">3.69</div> | <div style="width: 150pt">3.18</div> |
|<div style="width: 200pt">SPEECHIO_ASR_ZH00009</div>| <div style="width: 150pt">3.02</div> | <div style="width: 150pt">2.78</div> |
|<div style="width: 200pt">SPEECHIO_ASR_ZH000010</div>| <div style="width: 150pt">3.35</div> | <div style="width: 150pt">2.99</div> |
|<div style="width: 200pt">SPEECHIO_ASR_ZH000011</div>| <div style="width: 150pt">1.54</div> | <div style="width: 150pt">1.25</div> |
|<div style="width: 200pt">SPEECHIO_ASR_ZH000012</div>| <div style="width: 150pt">2.06</div> | <div style="width: 150pt">1.68</div> |
|<div style="width: 200pt">SPEECHIO_ASR_ZH000013</div>| <div style="width: 150pt">2.57</div> | <div style="width: 150pt">2.25</div> |
|<div style="width: 200pt">SPEECHIO_ASR_ZH000014</div>| <div style="width: 150pt">3.86</div> | <div style="width: 150pt">3.08</div> |
|<div style="width: 200pt">SPEECHIO_ASR_ZH000015</div>| <div style="width: 150pt">3.34</div> | <div style="width: 150pt">2.67</div> |


## How to Quickly Experience Model Performance

### Online Experience

From the ModelScope official website, enter the [model homepage](https://www.modelscope.cn/models/damo/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch/summary). On the right side of the page, you can see pre-prepared sample audio in the "Online Experience" section. Click the play button to listen, and click the "Run Test" button. After inference completes, the recognition results will be displayed in the "Test Results" section below. If you want to test your own audio, click the "Change Audio" button to upload or record an audio clip, then click "Run Test" to display the recognition content in the test results section.

### Development in Notebook

For users with development needs, we especially recommend using Notebook for offline processing. First, log in to your ModelScope account and click the "Open in Notebook" button in the upper right corner of the model page to bring up a dialog box. On first use, you'll be prompted to associate your Alibaba Cloud account—follow the instructions to complete this.

<div align=center>
<img src="./_resources/screenshot1.png" width=80% />
</div>

After account association, you'll enter the instance selection interface. Choose computing resources and create an instance. We recommend using a CPU environment, which is currently available for free.

<div align=center>
<img src="./_resources/screenshot2.png" width=80% />
</div>

After the instance is created, enter the Notebook development environment and select "New Notebook Script."

<div align=center>
<img src="./_resources/screenshot3.png" width=80% />
</div>

Paste the API call example code below into a Notebook code block and run it. The final recognition result will be displayed after recognition completes.

<div align=center>
<img src="./_resources/screenshot4.png" width=80% />
</div>

<div align=center>
<img src="./_resources/screenshot5.png" width=80% />
</div>

API call examples are as follows:

```python
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

inference_16k_pipline = pipeline(
    task=Tasks.auto_speech_recognition,
    model='damo/speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch')

rec_result = inference_16k_pipline(audio_in='https://modelscope.oss-cn-beijing.aliyuncs.com/test/audios/asr_example_zh.wav')
print(rec_result)
```

If the input audio is in PCM format, you need to pass the audio sampling rate parameter `audio_fs` when calling the API, for example:

```python
rec_result = inference_16k_pipline(audio_in='https://modelscope.oss-cn-beijing.aliyuncs.com/test/audios/asr_example_zh.pcm', audio_fs=16000)
```

## How to Train Your Own Paraformer Model?

The Paraformer introduced in this article is a general-domain recognition model trained on large-scale data. Developers can further customize the model for specific domains using the corresponding GitHub code repository.

### How to Train Your Own Model Based on Open-source Models

#### Model Training and Inference Based on GitHub

The FunASR framework supports training & fine-tuning of ModelScope's open-source industrial-grade speech recognition models (Paraformer-large), making it more convenient for researchers and developers to conduct speech recognition model research and production. It has been open-sourced on GitHub: (https://github.com/alibaba-damo-academy/FunASR)

##### Environment Setup

###### Install FunASR

```sh
# Clone the repo:
git clone https://github.com/alibaba/FunASR.git

# Install Conda:
wget https://repo.continuum.io/miniconda/Miniconda3-latest-Linux-x86_64.sh
sh Miniconda3-latest-Linux-x86_64.sh
conda create -n funasr python=3.7
conda activate funasr

# Install Pytorch (version >= 1.7.0):
conda install pytorch==1.7.0 torchvision==0.8.0 torchaudio==0.7.0 cudatoolkit=9.2 -c pytorch  # For more versions, please see https://pytorch.org/get-started/locally/

# Install other packages:
pip install --editable ./
```

###### Install ModelScope

```sh
pip install "modelscope[audio]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html
```


##### Model Fine-tuning Training

Next, we'll use FunASR framework's `egs_modelscope/common` as an example to demonstrate how to perform domain-specific training on the Paraformer-large model using small-scale proprietary corpora and experience the resulting model performance.

###### Data Preparation

Currently, FunASR supports the following data format:

```sh
tree ./example_data/
./example_data/
├── dev
│   ├── text
│   └── wav.scp
├── test
│   ├── text
│   └── wav.scp
└── train
    ├── text
    └── wav.scp

3 directories, 6 files
```

The `text` file contains audio annotations, and the `wav.scp` file contains absolute paths to WAV audio files, as shown in the following example:

```sh
cat text
BAC009S0002W0122 而 对 楼市 成交 抑制 作用 最 大 的 限 购
BAC009S0002W0123 也 成为 地方 政府 的 眼中 钉

cat wav.scp
BAC009S0002W0122 /mnt/data/wav/train/S0002/BAC009S0002W0122.wav
BAC009S0002W0123 /mnt/data/wav/train/S0002/BAC009S0002W0123.wav
```

###### Feature Extraction

```sh
cd egs_modelscope/common

# compute fbank features
utils/compute_fbank.sh --cmd "utils/run.pl" --nj 32 --speed_perturb "1.0" \
        example_data/train ${exp_dir}/exp/make_fbank/train ${fbankdir}/train
utils/fix_data_feat.sh ${fbankdir}/train

# apply low_frame_rate and cmvn
utils/apply_lfr_and_cmvn.sh --cmd "utils/run.pl" --nj 32 --lfr True --lfr-m 7 --lfr-n 6 \
        ${fbankdir}/train am.mvn ${exp_dir}/exp/make_fbank/train ${feat_train_dir}

# Text Tokenize
# 我爱reading->我 爱 read@@ ing
utils/text_tokenize.sh --cmd "utils/run.pl" --nj 32 ${fbankdir}/train seg_dict ${feat_train_dir}/log ${feat_train_dir}

# Dictionary Preparation
awk -v v=,vocab_size '{print $0v}' ${feat_train_dir}/text_shape > ${feat_train_dir}/text_shape.char
cp ${feat_train_dir}/speech_shape ${feat_train_dir}/text_shape ${feat_train_dir}/text_shape.char asr_stats_fbank_zh_char/train

# dev set audio feature extraction follows the same process as the train set above
```

###### Download Model

The Paraformer-large model is a general-domain recognition model trained on large-scale data provided by Tongyi Lab's speech laboratory. We'll use this as our base model for subsequent fine-tuning. After setting the model name, execute the command to complete the model download.

```sh
modelname="speech_paraformer-large_asr_nat-zh-cn-16k-common-vocab8404-pytorch"
python modelscope_utils/download_model.py --model_name $modelname
```

###### Model Training

After completing data processing and model downloading, you can modify the configuration in `conf/train_asr_paraformer_sanm_50e_16d_2048_512_lfr6.yaml`, such as learning rate (lr), maximum training epochs (max_epoch), etc. Then you can fine-tune the model using the following command:

```sh
python asr_train_paraformer.py \
  --train_data_path_and_name_and_type ${feat_train_dir}/feats.scp,speech,kaldi_ark \
  --train_data_path_and_name_and_type ${feat_train_dir}/text,text,text \
  --valid_data_path_and_name_and_type ${feat_dev_dir}/feats.sc,speech,kaldi_ark \
  --valid_data_path_and_name_and_type ${feat_dev_dir}/text,text,text \
  --output_dir exp/model_dir \
  --init_param base_model.pth \
  --config finetune_config.yaml
```

##### Model Performance Experience

After model fine-tuning is complete, you can use the resulting model for speech recognition. Execute the following command to decode and infer audio:

```sh
cp finetuned_model.pth exp_dir/finetune_model_name.modelscope
cp -r ${HOME}/.cache/modelscope/hub/damo/pretrained_model_name/* exp_dir/

python -m funasr.bin.modelscope_infer \
  --local_model_path exp_dir \
  --wav_list example_data/dev/wav.scp \
  --output_file logdir/text
```

##### One-stop Experience

You can also configure data paths and parameters in the `modelscope_common_finetune.sh` script, then execute it with one command for model fine-tuning and inference, as follows:

```sh
# Configure parameters in modelscope_common_finetune.sh
# dataset:  data path, structured as shown in example_data; dev/test can be omitted. If no dev data is available, 1000 audio samples will be automatically extracted from the training set as dev set during processing
# tag:  suffix for result saving path

# After configuration modification, execute the command to start model fine-tuning training and inference:
sh modelscope_common_finetune.sh
```

Additionally, we provide fine-tuning and inference scripts for AISHELL-1, AISHELL-2, WenetSpeech, and SpeechIO. After configuring the data paths as above, you can execute them to start training.


##### Experience with NNLM Model Integration

The Paraformer-large model can be combined with an NNLM language model for inference. Simply configure `use_lm=true` in the inference shell script to use NNLM decoding. Next, we'll use the SpeechIO test set as an example to demonstrate how to decode with a language model:

```sh
cd egs_modelscope/speechio/paraformer

# Configure parameters in paraformer_large_infer.sh
# ori_data:       # test data path
# data_dir:       # data processing path
# exp_dir:        # result saving path
# test_sets:      # test set name
# use_lm=true     # whether to use LM
# beam_size=10    # set beam_size
# lm_weight=0.15  # set lm_weight

# Test set directory structure tree, must have trans.txt and wav.scp
tree SPEECHIO_ASR_ZH00001
SPEECHIO_ASR_ZH00001
├── metadata.tsv
├── trans.txt
├── wav
│   ├── e5oipIfM49I__20190201_CCTV_10.wav
│   └── e5oipIfM49I__20190201_CCTV_1.wav
│   └── ...
└── wav.scp


# After configuration modification, execute the command to start model inference:
sh paraformer_large_infer.sh
```

#### Model Training and Inference Based on MaaSlib

Integration is currently in progress and expected to be completed by the end of December. Stay tuned.


## Summary

This article introduced the Paraformer model proposed by Tongyi Lab's speech laboratory, including model architecture, usage methods, and experimental results. The Paraformer model is now open-sourced on ModelScope, and the code framework FunASR is open-sourced on GitHub. Welcome to try it out.


## Related Papers and Citation Information

```BibTeX
@inproceedings{gao2022paraformer,
  title={Paraformer: Fast and Accurate Parallel Transformer for Non-autoregressive End-to-End Speech Recognition},
  author={Gao, Zhifu and Zhang, Shiliang and McLoughlin, Ian and Yan, Zhijie},
  booktitle={INTERSPEECH},
  year={2022}
}
```