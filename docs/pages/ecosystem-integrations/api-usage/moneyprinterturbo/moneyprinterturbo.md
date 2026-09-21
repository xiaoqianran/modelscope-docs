<!-- modelscope-docs: MoneyPrinterTurbo | ecosystem-integrations/api-usage/moneyprinterturbo/moneyprinterturbo_EN.md -->

# MoneyPrinterTurbo

## Overview

MoneyPrinterTurbo is an all-in-one AI short video generation tool. Provide a video topic or keywords, and it automatically completes video script generation, footage matching, subtitle generation, background music and voiceover, and finally composes a high-definition short video. The entire process is fully automated.

Features:

- Provides four usage methods: **AI Agent**, **WebUI**, **API**, and **CLI**
- Supports AI automatic video script generation, and also supports custom scripts
- Supports both vertical 9:16 (1080x1920) and horizontal 16:9 (1920x1080) high-definition sizes
- Supports batch video generation, generating multiple videos at once and selecting the most satisfactory one
- Supports video segment duration settings to adjust footage switching frequency
- Supports multilingual video script generation
- Supports speech synthesis including Edge TTS, Azure Speech, SiliconFlow, Google Gemini, Xiaomi MiMo, ElevenLabs, and Chatterbox, with real-time preview
- Supports subtitle generation, with adjustable font, position, color, size, outline, and background style
- Supports background music, with random selection or specified music, and adjustable volume
- Supports using local footage, and can also obtain free high-definition footage from Pexels, Pixabay, and Coverr
- Supports one-click cross-platform publishing, automatically uploading to TikTok, Instagram, and YouTube Shorts after generation is complete

Supported LLM services include Kimi/Moonshot AI, OpenAI, Google Gemini, DeepSeek, Alibaba Cloud Tongyi Qianwen, ModelScope, Microsoft Azure OpenAI, Volcengine Ark, xAI Grok, MiniMax, Xiaomi MiMo, etc., and is also compatible with unified gateways and local runtime environments such as Cloudflare AI Gateway, AIHubMix, Ollama, OneAPI, LiteLLM, etc.

## Resources

| Resource | URL |
|------|------|
| Repository | [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) |
| Releases | [Releases](https://github.com/harry0703/MoneyPrinterTurbo/releases/latest) |

## Configuration Requirements

| Item | Minimum | Recommended | Ideal |
|------|---------|---------|---------|
| CPU | 4 cores | 6-8 cores | 8 cores and above |
| RAM | 4 GB | 8 GB | 16 GB and above |
| GPU | Not required | 4 GB VRAM and above | 8 GB VRAM and above |

GPU is not a requirement. If you primarily rely on cloud LLM, cloud TTS, and online footage sources, CPU and memory are more important than GPU. If you enable `faster-whisper` local transcription or batch generation, GPU will significantly improve speed.

## ModelScope Integration

MoneyPrinterTurbo supports configuring ModelScope as an LLM provider, using open-source models on ModelScope to generate video scripts. ModelScope is used for the script generation stage, while voiceover and video composition use other services.

## Getting Started

### Configure ModelScope as LLM Provider

1. On the MoneyPrinterTurbo web page, click the settings button in the upper right corner
2. In the LLM settings, select ModelScope as the model provider, and enter the desired model name model-id
3. After configuration is complete, enter keywords or a topic on the page and click the generate button

![MoneyPrinterTurbo using ModelScope to generate video script effect 1](../_resources/moneyprinterturbo-1.png)

![MoneyPrinterTurbo using ModelScope to generate video script effect 2](../_resources/moneyprinterturbo-2.png)

### Footage API Configuration

In the footage API option in the upper right corner settings, you can enter API Keys for footage sources such as Pexels, Pixabay, Coverr, etc., to obtain free high-definition video footage.

![MoneyPrinterTurbo footage API configuration](../_resources/moneyprinterturbo-3.png)

> **Note**: This project also supports using your own local footage, so filling in the footage API Key is not necessarily required.

### Cache Management

In the cache management option in the upper right corner settings, you can view the location, quantity, and occupied space of cache files. It supports cleaning cache by days, with the default recommendation of cleaning cache older than 30 days, and you can also customize the cleaning scope.

![MoneyPrinterTurbo cache management](../_resources/moneyprinterturbo-4.png)

### Task Management

In the task management in the upper right corner, you can view the full task list, or view by status: generating, completed, and failed tasks.

![MoneyPrinterTurbo task management](../_resources/moneyprinterturbo-5.png)

### Video, Audio, and Subtitle Settings

On the MPT homepage, in addition to the script settings area, there are three independent settings areas:

- **Video settings**: video footage source, video stitching mode, transition mode, video aspect ratio (vertical 9:16 or horizontal 16:9), video segment duration, etc.
- **Audio settings**: voiceover method, voiceover service (Edge TTS, Azure Speech, SiliconFlow, etc.), volume, speech rate, etc.
- **Subtitle settings**: whether to enable subtitles, subtitle font, subtitle color, subtitle position, size, outline, and background style, etc.

![MoneyPrinterTurbo video audio subtitle settings](../_resources/moneyprinterturbo-6.png)

### Generate Videos with AI Agent

If your AI Agent (such as Claude Code, Cursor, etc.) supports reading Skill documentation and operating the local terminal, you can directly send the following message, and the Agent will automatically complete the installation, configuration, and video generation, returning the video file path upon completion. Currently supports macOS and Windows.

```
Use this Skill: https://raw.githubusercontent.com/harry0703/MoneyPrinterTurbo/main/docs/skill/SKILL.md
Help me generate a video with the topic "How artificial intelligence changes the daily life of ordinary people".
```

### Deployment Methods

MoneyPrinterTurbo provides multiple deployment methods:

- **Windows one-click startup package**: download and use, double-click `start.bat` to start
- **Manual deployment**: clone the code, use `uv` or `pip` to install dependencies, run `webui.sh` (macOS/Linux) or `webui.bat` (Windows)
- **Docker deployment**: `docker compose -f docker-compose.release.yml up`
- **Google Colab**: no local environment configuration needed, experience directly in the browser
