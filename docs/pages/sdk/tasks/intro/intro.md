<!-- modelscope-docs: Introduction to Tasks | sdk/tasks/intro/intro_EN.md -->

This article introduces the concept, supported types, and usage of model tasks in the ModelScope community.

# Definition of Tasks

**Task**: Refers to a specific application's input and output within a particular domain, used to accomplish tasks in specific scenarios. Examples include image classification, text generation, speech recognition, etc. You can find the task type suitable for your application scenario based on the task's input and output, and use task filtering to find the models you need.

Tasks primarily involve three aspects of usage: **model inference, evaluation, and training**. Integrating tasks into Modelhub means users can utilize the inference API for that task and filter models by task category.

For users, tasks are often passed as parameters to common operation interfaces, such as pipeline, train, preprocess, postprocess, etc. The task parameter, together with model_type, can uniquely map to a "model with task".

For developers, ModelScope Library developers need to manage different preprocessing modules and models separately according to Task types, enabling querying of modules that support a specific task based on the Task.

Currently, the official documentation already supports best practices for several tasks. Please refer to other documents in the same directory for details.

# Task Types

## Domains

The ModelScope community platform provides model tasks covering multiple domains, including Natural Language Processing (NLP), Computer Vision (CV), Audio, Multi-Modal, etc., and offers inference, training, and other services for related tasks.

- Natural Language Processing (NLP): NLP is a branch of artificial intelligence and linguistics that focuses on processing and analyzing language. It includes large language models (LLM) for text generation, as well as techniques for identifying, classifying, extracting, and generating information related to lexical, syntactic, and semantic aspects.
- Multi-Modal: Multi-modal primarily refers to enabling machines to understand and process multiple types of modalities from nature or artificially defined sources, such as images, videos, audio, tables, point cloud information, etc. The goal of multi-modal technology is to bridge communication between modalities and enhance understanding of each modality through complementary information. Common tasks include image generation, video generation, visual question answering, and image captioning.
- Audio Processing: Audio processing refers to the process where machines extract audio features from large amounts of audio data and learn to discover patterns within them.
- Computer Vision (CV): Computer vision refers to a machine's ability to perceive its environment. Classic tasks in this category include image generation, image processing, image extraction, and 3D reasoning of images.
- Science: The scientific domain currently includes protein prediction models, among others.

## Task List

Currently, the ModelScope community platform supports task types categorized by domain as follows. This task list will be continuously updated and expanded.

### Natural Language Processing

| **Task (Chinese)** | **Task (English)** | **Task Description** |
|----------------|----------------------------|------------------------------------------------------------------|
| 文本生成 | text-generation | The model accepts various forms of information as input, including text or non-text structured information, and generates readable textual descriptions. |
| 文本摘要 | text-summarization | Automatically extracts key information from input text and generates a summary of specified length. |
| 预训练 | fill-mask | Pre-training base models. |
| 分词 | word-segmentation | Word segmentation, which splits continuous natural language text into semantically reasonable and complete word sequences. |
| 命名实体识别 | named-entity-recognition | Identifies entities with specific meanings in natural language text, such as names, locations, and organizations in general domains. |
| 聊天机器人 | chatbot | Used for chat conversations. |
| 词性标注 | part-of-speech | Assigns a part of speech (e.g., noun, verb, adverb) to each word in natural language text. |
| 序列标注 | token-classification | Performs annotation analysis on input information. |
| 文本向量 | sentence-embedding | Converts input text from characters into vector representations. |
| 文本分割 | document-segmentation | For long text data from speech recognition, uses text paragraph segmentation models to improve the readability of transcription results; can also be used for paragraph correction of formal long texts. |
| 文本纠错 | text-error-correction | Accurately identifies spelling errors and their paragraph positions in input text, and provides targeted suggestions for correct text content. |
| 文本分类 | text-classification | Maps a piece of informative text to one or more pre-defined categories or topic themes. |
| 情感分析 | sentiment-classification | Analyzes and provides the positive or negative sentiment tendency of text. |
| 通用信息抽取 | universal-information-extraction | Extracts information from text. |
| 零样本分类 | zero-shot-classification | Provides sentence classification by only requiring the sentence to be classified and category labels. |
| 句子相似度 | sentence-similarity | Computes similarity between different texts and outputs a score between 0 and 1, where a higher score indicates greater similarity between texts. |
| 自然语言推理 | nli | Determines the semantic relationship between two sentences (Premise, Hypothesis) or two words. |
| 问答 | question-answering | Given a long passage of text and a question, understands the passage and answers the question. |
| 任务型对话 | task-oriented-conversation | Primarily refers to multi-turn dialogues generated by robots to fulfill user needs, where robots determine user intent through understanding and clarification, then complete the task through responses or API calls. |
| FAQ问答 | faq-question-answering | Takes a candidate FAQ list and one or more queries as input, and outputs a ranked FAQ list. |
| 表格问答 | table-question-answering | Given a table and a query asking about information in the table, the model provides an answer. |
| 翻译 | translation | Translates text from one language to specified target language text. |
| 翻译质量评估 | translation-evaluation | Evaluates the quality of translated text given source input, reference translation, or both. |
| 端到端文本生成 | text2text-generation | The model's encoder understands and encodes input information, and the decoder decodes the information to generate readable textual descriptions. |
| 特征抽取 | feature-extraction | Converts raw input data into vector features through a model. |
| 关系抽取 | relation-extraction | Identifies relationships between subjects and objects in unstructured or semi-structured data and represents them as entity-relation triples. |
| 孪生通用信息抽取 | siamese-uie | Unified Siamese Universal Information Extraction for multiple natural language understanding tasks. |
| 实体分类 | entity-typing | Classifies entities. |
| 抽取式摘要 | extractive-summarization | Extracts text summaries using extractive methods. |

### Multi-Modal Technology

| **Task (Chinese)** | **Task (English)** | **Task Description** |
|---------------|----------------------------|-------------------------------------------------|
| 文本生成图片 | text-to-image-synthesis | Generates images that match the description based on the input text. |
| 文本生成视频 | text-to-video-synthesis | Generates videos that match the description based on the input text. |
| 图片生成视频 | image-to-video | Generates videos based on input images. |
| 视觉多模态理解 | image-text-to-text | Generates targeted descriptive outputs based on images and input requirement descriptions. |
| 图像描述 | image-captioning | Generates a text description based on an image. |
| 视觉定位 | visual-grounding | Locates object bounding boxes in images based on descriptions. |
| 多模态表征 | multi-modal-embedding | Extracts vector representations of modalities that exist in the same space (currently mainly images and text). |
| 视觉问答 | visual-question-answering | Provides text answers based on images and questions. |
| 文档理解 | document-understanding | Understands documents containing multiple elements such as images and text. |
| 图文检索 | image-text-retrieval | Searches for text/images directly based on images/text. |
| 视觉蕴含 | visual-entailment | Determines the entailment relationship between an image and a hypothesis statement. |
| 生成式多模态表征 | generative-multi-modal-embedding | Extracts vector representations of modalities in the same space (currently mainly images and text), while supporting image-to-text description generation. |
| 多模态相似度 | multi-modal-similarity | Given a pair of data from different modalities (e.g., image + text), the model calculates their semantic similarity. |
| 视频描述 | video-captioning | Generates a text description based on a video. |
| 视频问答 | video-question-answering | Provides text answers based on a video. |
| 视频时序定位 | video-temporal-grounding | Quickly locates segments in long videos given natural language input. |
| 生成模型调优 | efficient-diffusion-tuning | Fine-tunes generative Diffusion models. |
| 多模态对话 | multimodal-dialogue | Mixed dialogue involving images, text, videos, etc. |

### Audio Processing

| **Task (Chinese)** | **Task (English)** | **Task Description** |
|----------------|----------------------------|-----------------------------------|
| 语音识别 | auto-speech-recognition | Converts human speech signals into text or commands. |
| 语音合成 | text-to-speech | Converts text into audible human-like sounds. |
| 语音唤醒 | keyword-spotting | Processes speech signals to eliminate noise. |
| 音频分类 | audio-classification | Identifies and classifies audio by event types such as "crying," "explosion," "music," etc. |
| 语音降噪 | acoustic-noise-suppression | Processes speech signals to eliminate noise. |
| 回声消除 | acoustic-echo-cancellation | A signal processing method used to cancel echo signals. |
| 语音分离 | speech-separation | Separates different speakers' audio from mixed multi-person audio. |
| 说话人确认 | speaker-verification | Confirms the speaker from audio. |
| 说话人日志 | speaker-diarization | Identifies the number of speakers in audio and distinguishes between them. |
| 标点预测 | punctuation | Predicts punctuation for transcribed text from audio. |
| 时间戳预测 | timestamp-prediction | Predicts timestamps for audio. |
| 语音端点检测 | voice-activity-detection | Detects human speech in audio. |
| 困惑度计算 | language-score-prediction | Predicts language scores for audio. |
| 语音语种识别 | speech-language-recognition | Identifies language types in audio conversations. |
| 音频量化编码 | audio-codec | Performs quantization encoding on audio. |
| 音视频语音识别 | audio-visual-speech-recognition | Recognizes speech in audio-video content. |
| 情绪识别 | emotion-recognition | Recognizes emotions in audio. |
| 逆文本正则化 | inverse-text-processing | Inverse text normalization in post-processing of speech recognition results. |

### Computer Vision

| **Task (Chinese)** | **Task (English)** | **Task Description** |
| --- | --- | --- |
| 单标签图像分类 | image-classification | Distinguishes different features in images by category. |
| 通用图像分割 | image-segmentation | Separates image foreground from background. |
| 文字检测 | ocr-detection | Detects text in images and returns detection point coordinates. |
| 人像美肤 | skin-retouching | Enhances skin details in portrait images. |
| 风格迁移 | image-style-transfer | Transforms the color style of images or videos into another style. |
| 图像翻译 | image-to-image-translation | Translates text in an image to target language and generates a new image. |
| 以图生图 | image-to-image-generation | Generates new similar images based on input images. |
| 搜索推荐 | image-search | Performs range matching based on input images. |
| 审核评估 | image-evaluation | Analyzes images and automatically provides evaluation information. |
| 视频处理 | video-processing | Automatically processes video information. |
| 视频检测 | video-detection | Analyzes video content. |
| 视频分割 | video-segmentation | Separates background and foreground in videos. |
| 视频生成 | video-generation | Generates videos by analyzing and matching video information. |
| 视频编辑 | video-editing | Converts videos into editable states through analysis. |
| 视频表征 | video-embedding | Performs multi-modal matching of video features. |
| 视频检索 | video-search | Extracts partial information from videos based on rules. |
| 视频审核评估 | video-evaluation | Analyzes videos according to rules and provides evaluation results. |
| 视频文本识别 | video-ocr | Recognizes text content in videos. |
| 视频到文本 | video-captioning | Converts audio in videos to text information. |
| 三维重建 | 3d-reconstruction | Analyzes and reconstructs 3D models. |
| 三维识别 | 3d-recognition | Recognizes and annotates 3D models. |
| 三维编辑 | 3d-editing | Converts 3D models into editable states through analysis. |
| 驱动交互 | 3d-driven | Converts 3D models into dynamic effects through analysis. |
| 渲染呈现 | 3d-rendering | Renders 3D models and displays them as images. |
| 虚拟试衣 | virtual-try-on | Given a model image and clothing image, synthesizes an image of the model wearing the given clothing. |
| 文字识别 | ocr-recognition | Recognizes text in images and returns text content. |
| 人脸检测 | face-detection | Detects faces in images and returns face coordinates. |
| 人脸识别 | face-recognition | Extracts feature vectors from aligned and corrected face images. |
| 人体检测 | human-detection | Detects human body keypoints in images and returns keypoint labels and coordinates. |
| 人物交互关系 | human-object-interaction | Detects and recognizes body keypoints and objects in images, processing coordinate information. |
| 人脸生成 | face-image-generation | Detects facial regions in images and generates virtual faces. |
| 多标签图像分类 | image-multilabel-classification | Analyzes image features to support multiple category distinctions. |
| 通用目标检测 | image-object-detection | Locates and classifies general objects in input images. |
| 目标检测-自动驾驶场景(行人、车辆、交通标注等) | image-object-detection-autopilot | Performs object detection in autonomous driving scenarios, real-time analysis and annotation of people, vehicles, and traffic information in images (pedestrians, vehicles, traffic signs). |
| 目标检测-自动驾驶场景(车道线) | image-object-detection-laneline | Performs object detection in autonomous driving scenarios, real-time analysis and annotation of people, vehicles, and traffic information in images (lane lines). |
| 人像抠图 | portrait-matting | Extracts human subjects from input images and makes the background transparent. |
| 人像增强 | image-portrait-enhancement | Enhances details of human subjects in images. |
| 图像超分辨 | image-super-resolution | Magnifies images without losing quality. |
| 图像上色 | image-colorization | Analyzes regions in black-and-white images and applies category-based coloring. |
| 图像颜色增强 | image-color-enhancement | Analyzes color values in images and applies rule-based processing. |
| 图像降噪 | image-denoising | Reduces noise points in images. |
| 人像卡通化 | image-portrait-stylization | Applies cartoon-style processing to input images for style transformation. |
| 图像表征 | image-embedding | Performs multi-modal matching of input image features. |
| 直播商品类目识别 | live-category | Real-time analysis and recognition of product categories in live streaming footage for information display. |
| 行为识别 | action-recognition | Recognizes actions in videos and returns types. |
| 短视频内容分类 | video-category | Analyzes short video semantics for scene classification. |
| 目标跟踪及重识别 | reid-and-tracking | Performs object recognition in images and videos with repeatable identification capability. |
| 增强/虚拟现实 | ar-vr | Enhances VR image information. |
| 人体2D关键点 | body-2d-keypoints | Detects 2D human body keypoint positions in images. |
| 商品图片特征 | product-retrieval-embedding | Extracts representation vectors from product images. |
| 视频场景分割 | movie-scene-segmentation | Takes a long video as input and segments it into different scene sub-videos. |
| 人脸表情识别 | facial-expression-recognition | Recognizes facial expressions in images. |
| 手部2D关键点 | hand-2d-keypoints | Detects 21-point hand keypoint coordinates in images. |
| 视频摘要 | video-summarization | Takes a long video as input, identifies key segments, and outputs a concatenated short summary video. |
| 人脸2D关键点 | face-2d-keypoints | Detects 106-point facial keypoint coordinates and head pose angles in images. |
| 行人重识别 | image-reid-person | Takes images containing people as input and outputs image feature vectors. |
| 3D人体关键点 | body-3d-keypoints | Detects 3D human pose keypoint coordinates in videos. |
| 视频单目标跟踪 | video-single-object-tracking | Takes a video and target position in the first frame as input, and predicts the target position in all video frames. |
| 行为检测 | action-detection | Detects actions in videos and provides spatiotemporal locations of actions. |
| 人群密度估计 | crowd-counting | Takes an image as input and outputs the number of people in the image. |
| 卡证检测矫正 | card-detection | Detects whether ID cards exist in input images, locates corner points, and corrects cards to frontal view based on corner points. |
| 全身关键点检测 | human-wholebody-keypoint | Detects whole-body keypoint coordinates in images, including facial keypoints, skeletal keypoints, foot keypoints, and hand gesture keypoints, totaling 133 points. |
| 视频目标检测 | video-object-detection | Input/output types and data formats for tasks. |
| 语义分割 | semantic-segmentation | Image saliency, predicting the importance of each pixel in the image. |
| 人体美型 | image-body-reshaping | Given a half-body or full-body portrait image, automatically reshapes body areas (shoulders, waist, legs, etc.) end-to-end without additional input. |
| 目标检测-自动驾驶场景 | image-object-detection-auto | Detects objects in autonomous driving scenario images, including vehicles, pedestrians, etc. |
| 图像填充 | image-inpainting | Takes an image as input; users can draw masks of arbitrary shapes online based on the image; outputs the restored and completed image. |
| 视频修复 | video-inpainting | Repairs specified regions and frame ranges in videos. |
| 2D手势语义识别 | hand-static | Recognizes semantic meaning of hand gestures in images. |
| 人脸情绪识别 | face-emotion | Recognizes human emotions in images. |
| 人脸人体人手三合一检测 | face-human-hand-detection | Detects faces, human bodies, and hands in images. |
| 通用商品分割 | product-segmentation | Segments products in images. |
| 商品显著性分割 | shop-segmentation | Performs saliency segmentation on product images. |
| 文本指导的图像分割 | text-driven-segmentation | Segments images based on text guidance. |
| 动物识别 | animal-recognition | Recognizes animal subjects in images. |
| 视频文本表征 | video-multi-modal-embedding | Takes any video-text pair as input and outputs corresponding video-text pair features and scores. |
| 自然语言引导的视频摘要 | language-guided-video-summarization | Takes a long video and N English descriptions as input, identifies key segments related to the descriptions, and outputs a concatenated short summary video. |
| 文本指导的视频目标分割 | referring-video-object-segmentation | Segments specified objects from input videos based on user-provided text descriptions (English), supporting two object descriptions in a single input. |
| 万物识别 | general-recognition | Recognizes object subjects in images. |

### Scientific Computing

| **Task (Chinese)** | **Task (English)** | **Task Description** |
| --- | --- | --- |
| 蛋白质结构生成 | protein-structure | Predicts tertiary structure from primary protein structure. |

More task types are continuously being integrated.