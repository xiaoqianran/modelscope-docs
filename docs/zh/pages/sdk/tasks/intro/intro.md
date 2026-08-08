<!-- modelscope-docs: 任务的介绍 | sdk/tasks/intro/intro_CN.md -->

本篇文章介绍ModelScope社区的模型任务的概念、支持的类型和用法。
# 任务的定义
**任务（Task）**：指某一领域具体的应用输入输出，以用于完成特定场景的任务。例如图像分类、文本生成、语音识别等，您可根据任务的输入输出找到适合您的应用场景的任务类型，通过任务的筛选来查找您所需的模型。
任务包含主要三个使用方面： **模型的推理、评估和训练**。将任务集成到Modelhub中，意味着用户可以使用该任务的推理API，同时可通过任务分类筛选所需的模型。

对于使用者而言，任务常常作为常用的操作接口的参数传入，比如pipeline，train，preprocess，postprocess等。task参数可以和model_type一起，唯一映射到一个“带task的model”。

对于开发者而言， ModelScope Library 的开发者需要根据Task类型把不同的预处理模块、Model 分开管理起来，做到可以根据Task查询到能够支持该任务的各个模快。

目前官方文档中，已经支持了若干任务的最佳实践，具体请查看同目录下的其他文档介绍。

# 任务的类型
## 领域
ModelScope 社区平台提供了覆盖多个领域的模型任务，包括自然语言处理（NLP）、计算机视觉（CV)、语音（Audio)、多模态（Multi-Modal）等，并提供相关任务的推理、训练等服务。

- 自然语言处理（NLP）：自然语言处理是人工智能和语言学领域的分支学科，是对语言进行处理和加工的科学。包括了文本生成大模型（LLM），以及对词法、句法、语义等信息的识别、分类、抽取、生成等技术。
- 多模态（Multi-Modal）: 多模态主要是指让机器能够理解和处理自然界或人工定义的多种模态信息，如图像，视频，音频，以及表格、点云信息等。多模态技术的目的是打通模态之间沟通的桥梁和通过信息互补提升理解各自模态的能力。常见任务有图像生成，视频生成，视觉问答，图片描述等。
- 语音处理（Audio)：语音处理指机器从大量的语音数据中提取语音特征，学习和发现其中蕴含的规律的过程。
- 计算机视觉（CV)：计算机视觉是指机器感知环境的能力。这一技术类别中的经典任务有图像生成、图像处理、图像提取和图像的三维推理。
- 科学 （Science）：科学领域，目前包含了蛋白质预测模型等。
## 任务列表
当前，ModelScope 社区平台支持的任务类型按照领域分为如下的任务类型，该任务列表将持续更新扩展。

### 自然语言处理

| **任务（Task）中文** | **任务（Task）英文**             | **任务说明**                                                         |
|----------------|----------------------------|------------------------------------------------------------------|
| 文本生成           | text-generation            | 模型接受各种形式的信息作为输入，包括文本或者非文本结构化信息等，生成可读的文字表述。                       |
| 文本摘要           | text-summarization         | 自动抽取输入文本中的关键信息并生成指定长度的摘要                                         |
| 预训练            | fill-mask         | 预训练基础模型                                                          |
| 分词             | word-segmentation          | 分词，将连续的自然语言文本，切分成具有语义合理性和完整性的词汇序列                                |
| 命名实体识别         | named-entity-recognition   | 指识别自然语言文本中具有特定意义的实体，通用领域如人名、地名、机构名等                              |
| 聊天机器人          | chatbot                    | 用于聊天对话                                                           |
| 词性标注           | part-of-speech             | 指为自然语言文本中的每个词汇赋予一个词性的过程，如名词、动词、副词等                               |
| 序列标注           | token-classification            | 对于输入信息进行标注分析                                                     |
| 文本向量           | sentence-embedding         | 将输入文本从字符转化成向量表示                                                  |
| 文本分割           | document-segmentation      | 对于口语识别的长文本数据，使用文本段落分割模型来提升转写结果的可读性；同时也可用于书面化长文本的分段修正。            |
| 文本纠错           | text-error-correction      | 准确识别输入文本中出现的拼写错别字及其段落位置信息，并针对性给出正确的建议文本内容                        |
| 文本分类           | text-classification        | 模型将载有信息的一篇文本映射到预先给定的某一类别或某几类别主题的过程                               |
| 情感分析           | sentiment-classification   | 分析并给出文本的情感正负倾向                                                   |
| 通用信息抽取         | universal-information-extraction        | 抽取文本中的信息                                                         |
| 零样本分类          | zero-shot-classification   | 只需要提供待分类的句子和类别标签即可给出句子类别                                         |
| 句子相似度          | sentence-similarity        | 文本相似度服务提供不同文本之间相似度的计算，并输出一个介于0到1之间的分数，分数越大则文本之间的相似度越高            |
| 自然语言推理         | nli                        | 判断两个句子（Premise, Hypothesis）或者两个词之间的语义关系                          |
| 问答             | question-answering         | 给定一长段文字，然后再给一个问题，然后理解长段文字之后，对这个问题进行解答。                           |
| 任务型对话          | task-oriented-conversation | 主要指机器人为满足用户某一需求而产生的多轮对话，机器人通过理解、澄清等方式确定用户意图，继而通过答复、调用API等方式完成该任务 |
| FAQ问答          | faq-question-answering     | 输入候选FAQ列表和一个或多个query，模型输出排序后的FAQ列表                               |
| 表格问答           | table-question-answering   | 给定一张表格和一个query，query是询问表格里面的一些信息，模型给出答案                          |
| 翻译             | translation                | 将一种语言的文本翻译成指定语言的文本                                               |
| 翻译质量评估         | translation-evaluation     | 在给定源端输入、翻译端参考答案、或两者均有提供的情况下，算法用于评估翻译文本的质量                        |
| 端到端文本生成        | text2text-generation       | 模型encoder端通过对输入信息进行理解编码后，在decoder端将信息解码生成可读的文字表述                 |
| 特征抽取           | feature-extraction         | 通过模型将原始输入数据转化为向量特征                                               |
| 关系抽取           | relation-extraction        | 非结构或半结构化数据中找出主体与客体之间存在的关系，并将其表示为实体关系三元组                          |
| 孪生通用信息抽取       | siamese-uie                | 对多类自然语言理解任务的统一孪生通用信息抽取                                           |
| 实体分类       | entity-typing               | 对于实体进行分类                                                         |
| 抽取式摘要      | extractive-summarization               | 使用抽取式方式来提取文本摘要                                                   |

### 多模态技术
| **任务（Task）中文** | **任务（Task）英文** | **任务说明**                                        |
|---------------| - |-------------------------------------------------|
| 文本生成图片        | text-to-image-synthesis | 根据描述，生成符合描述的图片                                  |
| 文本生成视频        | text-to-video-synthesis | 根据描述，生成符合描述的视频                                  |
| 图片生成视频        | image-to-video | 根据输入图片生成视频                                      |
| 视觉多模态理解       | image-text-to-text | 根据图片以及输入的需求描述，生成针对性的描述输出                        |
| 图像描述          | image-captioning | 根据图片生成一段文本描述                                    |
| 视觉定位          | visual-grounding | 根据描述，在图片中定位出物体框                                 |
| 多模态表征         | multi-modal-embedding | 抽取模态的向量表征，这些向量在同一个空间中（目前主要是图片和文本）               |
| 视觉问答          | visual-question-answering | 根据图片和问题，给出文本答案                                  |
| 文档理解          | document-understanding | 理解包含图文等多种元素的文档                                  |
| 图文检索          | image-text-retrieval | 根据图片/文本直接搜索文本/图片的数据                             |
| 视觉蕴含          | visual-entailment | 根据图片和一段假设，判断二者的蕴含关系                             |
| 生成式多模态表征      | generative-multi-modal-embedding | 抽取模态的向量表征，这些向量在同一空间中（目前主要是图片和文本），同时支持图片生成文本描述功能 |
| 多模态相似度        | multi-modal-similarity | 输入一对不同模态的数据（如图片+文本），模型可以计算两者的语义相似度              |
| 视频描述          | video-captioning | 根据视频生成一段文本描述                                    |
| 视频问答          | video-question-answering | 根据一段视频，给出文本答案                                   |
| 视频时序定位        | video-temporal-grounding | 给定自然语言输入条件下，快速定位长视频片段                           |
| 生成模型调优        | efficient-diffusion-tuning | 对于生成式Diffusion模型进行调优                            |
| 多模态对话        | multimodal-dialogue | 图、文、视频等混合对话                                     |



### 语音处理
| **任务（Task）中文** | **任务（Task）英文**             | **任务说明**                          |
|----------------|----------------------------|-----------------------------------|
| 语音识别           | auto-speech-recognition    | 将人类的语音信号转换成文本或者指令                 |
| 语音合成           | text-to-speech             | 将文本转换成人类听的到的声音                    |
| 语音唤醒           | keyword-spotting           | 对语音信号进行处理，消除信号当中的噪声               |
| 音频分类           | audio-classification       | 对音频按照事件如“哭声”“爆炸声”“音乐”等事件类型进行识别和分类 |
| 语音降噪           | acoustic-noise-suppression | 对语音信号进行处理，消除信号当中的噪声               |
| 回声消除           | acoustic-echo-cancellation | 在信号处理领域用来抵消回波信号的方法                |
| 语音分离           | speech-separation          | 混合多人音频中，分离出不同人的音频                 |
| 说话人确认          | speaker-verification       | 从音频中确认说话人                         |
| 说话人日志          | speaker-diarization        | 识别音频中的对话人数，并且对其进行区分               |
| 标点预测           | punctuation                | 识别音频中输出文本的标点预测                    |
| 时间戳预测           | timestamp-prediction       | 预测音频的时间戳                          |
| 语音端点检测         | voice-activity-detection   | 检测音频中的人话                          |
| 困惑度计算          | language-score-prediction  | 预测音频中的语言打分                        |
| 语音语种识别         | speech-language-recognition | 识别音频对话中的语言种类                      |
| 音频量化编码         |  audio-codec | 对音频进行量化编码                         |
| 音视频语音识别        |  audio-visual-speech-recognition | 识别音视频中的语音                         |
| 情绪识别           |  emotion-recognition | 对音频中的情绪进行识别                       |
| 逆文本正则化           |  inverse-text-processing | 语音识别模型结果后处理中的逆文本正则化               |


### 计算机视觉
| **任务（Task）中文** | **任务（Task）英文** | **任务说明** |
| --- | --- | --- |
| 单标签图像分类 | image-classification | 对图像中的不同特征根据类别进行区分 |
| 通用图像分割 | image-segmentation | 识别图像主体与图像背景进行分离 |
| 文字检测 | ocr-detection | 将图像中的文字检测出来并返回检测点坐标位置 |
| 人像美肤 | skin-retouching | 对图像中的人像皮肤进行细节美化 |
| 风格迁移 | image-style-transfer | 对图像或视频的色彩风格进行另一种风格转化 |
| 图像翻译 | image-to-image-translation | 将一张图片上的文字翻译成目标语言并生成新的图片 |
| 以图生图 | image-to-image-generation | 根据输入图像生成新的类似图像 |
| 搜索推荐 | image-search | 根据输入图像进行范围匹配 |
| 审核评估 | image-evaluation | 对图像进行解析并自动给出一个评估信息 |
| 视频处理 | video-processing | 对视频信息进行自动运算处理 |
| 视频检测 | video-detection | 对视频信息进行内容解析 |
| 视频分割 | video-segmentation | 对视频信息进行背景和主体分离 |
| 视频生成 | video-generation | 对视频进行解析匹配视频信息进行生成 |
| 视频编辑 | video-editing | 对视频进行解析转化为可编辑状态 |
| 视频表征 | video-embedding | 对视频特征进行多模态匹配 |
| 视频检索 | video-search | 对视频解析根据规则提取部分信息 |
| 视频审核评估 | video-evaluation | 根据规则对视频解析并给出评估结果 |
| 视频文本识别 | video-ocr | 对视频中的文字内容进行识别 |
| 视频到文本 | video-captioning | 将视频中的音频转化为文本信息 |
| 三维重建 | 3d-reconstruction | 对三维模型解析并重新构建 |
| 三维识别 | 3d-recognition | 对三维模型进行识别并进行标注 |
| 三维编辑 | 3d-editing | 对三维模型解析转化为可编辑状态 |
| 驱动交互 | 3d-driven | 对三维模型解析转为为动态效果 |
| 渲染呈现 | 3d-rendering | 对三维模型进行渲染并以图像展示 |
| 虚拟试衣 | virtual-try-on | 给定模特图片和衣服图片，合成模特穿上给定衣服的图片 |
| 文字识别 | ocr-recognition | 将图像中的文字识别出来并返回文本内容 |
| 人脸检测 | face-detection | 对图像中的人脸进行检测并返回人脸坐标位置 |
| 人脸识别 | face-recognition | 对矫正对齐后的人脸图像提取特征向量 |
| 人体检测 | human-detection | 对图像中的人体关键点进行检测并返回关键点标签与坐标位置 |
| 人物交互关系 | human-object-interaction | 对图像中的肢体关键点和物品进行检测和识别对坐标信息进行处理 |
| 人脸生成 | face-image-generation | 对图像中的人脸进行区域位置检测并生成虚拟人脸 |
| 多标签图像分类 | image-multilabel-classification | 解析图像特征支持多个类别区分 |
| 通用目标检测 | image-object-detection | 对输入图像中的较通用物体定位及类别判断 |
| 目标检测-自动驾驶场景(行人、车辆、交通标注等) | image-object-detection-autopilot | 对自动驾驶中的场景进行目标检测，图像中的人、车辆及交通信息等进行实时解析并进行标注（行人、车辆、交通标注） |
| 目标检测-自动驾驶场景(车道线) | image-object-detection-laneline | 对自动驾驶中的场景进行目标检测，图像中的人、车辆及交通信息等进行实时解析并进行标注（车道线） |
| 人像抠图 | portrait-matting | 对输入的图像将人体部分抠出并对背景进行透明化处理 |
| 人像增强 | image-portrait-enhancement | 对图像中的人像主体进行细节增强 |
| 图像超分辨 | image-super-resolution | 对图像进行倍数放大且不丢失画面质量 |
| 图像上色 | image-colorization | 对黑白图像进行区域解析并对其进行类别上色 |
| 图像颜色增强 | image-color-enhancement | 对图像中色彩值进行解析并对其进行规则处理 |
| 图像降噪 | image-denoising | 对图像中的噪点进行处理降低 |
| 人像卡通化 | image-portrait-stylization | 对输入的图像进行卡通化处理，实现风格变化 |
| 图像表征 | image-embedding | 对输入图像特征进行多模态匹配 |
| 直播商品类目识别 | live-category | 实时解析识别直播画面中的商品类别进行信息展示 |
| 行为识别 | action-recognition | 对视频中的动作行为进行识别并返回类型 |
| 短视频内容分类 | video-category | 解析短视频语义进行场景分类 |
| 目标跟踪及重识别 | reid-and-tracking | 可对图片和视频进行目标识别可重复识别 |
| 增强/虚拟现实 | ar-vr | 对vr图像信息进行画面增强 |
| 人体2D关键点 | body-2d-keypoints | 检测图像中人体2D关键点位置 |
| 商品图片特征 | product-retrieval-embedding | 对商品图像进行表征向量提取 |
| 视频场景分割 | movie-scene-segmentation | 输入一段长视频，算法将其分割成不同的场景子视频 |
| 人脸表情识别 | facial-expression-recognition | 识别图像中人脸的表情 |
| 手部2D关键点 | hand-2d-keypoints | 检测图像中手部21点关键点坐标 |
| 视频摘要 | video-summarization | 输入一段长视频，算法找出其中的一些关键片段进行拼接，输出拼接的短的摘要视频 |
| 人脸2D关键点 | face-2d-keypoints | 检测图像中人脸106点关键点坐标和人脸朝向姿态角 |
| 行人重识别 | image-reid-person | 输入包含人的图片，输出图片的特征向量 |
| 3D人体关键点 | body-3d-keypoints | 检测视频中人体姿态的3D关键点坐标 |
| 视频单目标跟踪 | video-single-object-tracking | 输入视频和第一帧目标位置，在所有视频帧中预测该目标位置 |
| 行为检测 | action-detection | 检测视频中发生的行为动作，并给出动作的时空位置 |
| 人群密度估计 | crowd-counting | 输入一张图片，输出图片内有多少人 |
| 卡证检测矫正 | card-detection | 检测输入图片中是否存在卡证，并定位其角点，根据角点将卡证矫正为正视图 |
| 全身关键点检测 | human-wholebody-keypoint | 检测图片中全身关键点坐标，包括人脸关键点，骨骼关键点、脚步关键点和手势关键点，共计133点 |
| 视频目标检测 | video-object-detection | 任务的输入输出类型及数据格式  |
| 语义分割 | semantic-segmentation | 图像显著性，预测图中每个像素的重要程度 |
| 人体美型 | image-body-reshaping | 给定一张人物图像（半身或全身），无需任何额外输入，端到端地实现对人物身体区域（肩部，腰部，腿部等）的自动化美型处理 |
| 目标检测-自动驾驶场景 | image-object-detection-auto | 检测自动驾驶场景图片的目标，包括车辆，行人等 |
| 图像填充 | image-inpainting | 输入一张图片；同时用户根据该图片，自定义地可以进行在线绘制任意形状的mask；最终输出恢复、补全后的图像 |
| 视频修复 | video-inpainting | 对视频中指定的区域和帧范围，进行视频修复 |
| 2D手势语义识别 | hand-static | 对图片中的人手动作的语义进行识别 |
| 人脸情绪识别 | face-emotion | 对图片中的人的情绪进行识别 |
| 人脸人体人手三合一检测 | face-human-hand-detection | 对图片中的人脸、人体、人手进行检测 |
| 通用商品分割 | product-segmentation | 对图片中的商品进行分割 |
| 商品显著性分割 | shop-segmentation | 对商品图像进行显著性分割 |
| 文本指导的图像分割 | text-driven-segmentation | 根据文本对图像进行分割 |
| 动物识别 | animal-recognition | 对图片中的动物主体的进行识别 |
| 视频文本表征 | video-multi-modal-embedding | 输入任意视频和文本pair，输出相应的视频-文本pair特征，和相应得分 |
| 自然语言引导的视频摘要 | language-guided-video-summarization | 输入一段长视频和N句英文描述，算法找出其中和英文描述相关的一些关键片段进行拼接，输出拼接的短的摘要视频 |
| 文本指导的视频目标分割 | referring-video-object-segmentation | 通过用户输入的文本描述（英文）从输入视频中分割出指定的物体，支持一次性输入两个物体描述 |
| 万物识别 | general-recognition | 对图片中的物体主体的进行识别 |

### 科学计算
| **任务（Task）中文** | **任务（Task）英文** | **任务说明** |
| --- | --- | --- |
| 蛋白质结构生成 | protein-structure | 输入蛋白质一级结构，预测三级结构 |

更多任务类型持续接入中。
