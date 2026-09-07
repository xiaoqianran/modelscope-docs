<!-- modelscope-docs: MoneyPrinterTurbo | ecosystem-integrations/api-usage/moneyprinterturbo/moneyprinterturbo_CN.md -->

# MoneyPrinterTurbo

## 概述

MoneyPrinterTurbo 是一站式 AI 短视频生成工具。提供视频主题或关键词，即可自动完成视频脚本生成、素材匹配、字幕生成、背景音乐和配音，最终合成高清短视频。整个流程自动化完成。

功能特性：

- 提供 **AI Agent**、**WebUI**、**API** 和 **CLI** 四种使用方式
- 支持 AI 自动生成视频脚本，也支持自定义脚本
- 支持竖屏 9:16（1080x1920）和横屏 16:9（1920x1080）两种高清尺寸
- 支持批量视频生成，一次生成多个视频后选择最满意的
- 支持视频片段时长设置，调节素材切换频率
- 支持多语言视频脚本生成
- 支持 Edge TTS、Azure Speech、SiliconFlow、Google Gemini、小米 MiMo、ElevenLabs 和 Chatterbox 等语音合成，可实时试听
- 支持字幕生成，可调整字体、位置、颜色、大小、描边和背景样式
- 支持背景音乐，可随机选择或指定音乐，可调音量
- 支持使用本地素材，也可从 Pexels、Pixabay 和 Coverr 获取免费高清素材
- 支持一键跨平台发布，生成完成后可自动上传至 TikTok、Instagram 和 YouTube Shorts

支持的 LLM 服务包括 Kimi/Moonshot AI、OpenAI、Google Gemini、DeepSeek、阿里云通义千问、魔搭 ModelScope、Microsoft Azure OpenAI、火山引擎方舟、xAI Grok、MiniMax、小米 MiMo 等，同时兼容 Cloudflare AI Gateway、AIHubMix、Ollama、OneAPI、LiteLLM 等统一网关和本地运行环境。

## 相关资源

| 资源 | 地址 |
|------|------|
| 仓库 | [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) |
| 发布版本 | [Releases](https://github.com/harry0703/MoneyPrinterTurbo/releases/latest) |

## 配置要求

| 项目 | 最低配置 | 推荐配置 | 理想配置 |
|------|---------|---------|---------|
| CPU | 4 核 | 6-8 核 | 8 核及以上 |
| RAM | 4 GB | 8 GB | 16 GB 及以上 |
| GPU | 非必须 | 4 GB 显存及以上 | 8 GB 显存及以上 |

GPU 不是必需项。如果主要依赖云端 LLM、云端 TTS 和在线素材源，CPU 和内存比 GPU 更重要。如果启用了 `faster-whisper` 本地转录或批量生成，GPU 会明显提升速度。

## ModelScope 集成

MoneyPrinterTurbo 支持将 ModelScope 配置为 LLM 提供商，使用 ModelScope 上的开源模型生成视频文案。ModelScope 用于文案生成环节，配音和视频合成使用其他服务。

## 接入流程

### 配置 ModelScope 作为 LLM 提供商

1. 在 MoneyPrinterTurbo 的 Web 页面中，点击右上角的设置
2. 在大模型设置中选择 ModelScope 作为模型提供商，并输入希望使用的模型名称 model-id
3. 配置完成之后，在页面中输入关键词或主题，点击生成按钮

![MoneyPrinterTurbo 使用 ModelScope 生成视频文案效果 1](../_resources/moneyprinterturbo-1.png)

![MoneyPrinterTurbo 使用 ModelScope 生成视频文案效果 2](../_resources/moneyprinterturbo-2.png)

### 素材 API 配置

在右上角设置的素材 API 选项中，可以填入 Pexels、Pixabay、Coverr 等素材源的 API Key，用于获取免费高清视频素材。

![MoneyPrinterTurbo 素材 API 配置](../_resources/moneyprinterturbo-3.png)

> **注意**：该项目也支持使用自己的本地素材，不一定需要填写素材 API Key。

### 缓存管理

在右上角设置的缓存管理选项中，可以查看缓存文件的位置、数量和占用空间。支持按天数清理缓存，默认推荐清理 30 天前的缓存，也可以自定义清理范围。

![MoneyPrinterTurbo 缓存管理](../_resources/moneyprinterturbo-4.png)

### 任务管理

在右上角的任务管理中，可以查看全部任务列表，也可以按状态分类查看：生成中、已完成和失败的任务。

![MoneyPrinterTurbo 任务管理](../_resources/moneyprinterturbo-5.png)

### 视频、音频和字幕设置

在 MPT 的主页中，除了文案设置区域，还有三个独立的设置区域：

- **视频设置**：视频素材来源、视频拼接模式、转场模式、视频比例（竖屏 9:16 或横屏 16:9）、视频片段时长等
- **音频设置**：配音方式、配音服务（Edge TTS、Azure Speech、SiliconFlow 等）、音量、语速等
- **字幕设置**：是否启用字幕、字幕字体、字幕颜色、字幕位置、大小、描边和背景样式等

![MoneyPrinterTurbo 视频音频字幕设置](../_resources/moneyprinterturbo-6.png)

### 使用 AI Agent 生成视频

如果你的 AI Agent（如 Claude Code、Cursor 等）支持读取 Skill 文档并操作本地终端，可以直接发送下面这段话，Agent 会自动完成安装、配置和视频生成，完成后返回视频文件路径。目前支持 macOS 和 Windows。

```
使用这个 Skill：https://raw.githubusercontent.com/harry0703/MoneyPrinterTurbo/main/docs/skill/SKILL.md
帮我生成一个主题为"人工智能如何改变普通人的日常生活"的视频。
```

### 部署方式

MoneyPrinterTurbo 提供多种部署方式：

- **Windows 一键启动包**：下载即用，双击 `start.bat` 启动
- **手动部署**：克隆代码后使用 `uv` 或 `pip` 安装依赖，运行 `webui.sh`（macOS/Linux）或 `webui.bat`（Windows）
- **Docker 部署**：`docker compose -f docker-compose.release.yml up`
- **Google Colab**：免去本地环境配置，直接在浏览器中体验