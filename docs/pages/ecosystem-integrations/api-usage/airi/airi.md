<!-- modelscope-docs: airi | ecosystem-integrations/api-usage/airi/airi_EN.md -->

# airi

## Overview

airi (Project AIRI) is a self-hosted AI companion project inspired by Neuro-sama. It is not a simple chatbot, but a virtual character that runs in the browser, supports game interaction, and features real-time voice.

airi's technology stack makes extensive use of web technologies (WebGPU, WebAudio, Web Workers, WebAssembly, WebSocket) and runs in modern browsers, with mobile support (PWA). The desktop version can leverage native NVIDIA CUDA and Apple Metal (via HuggingFace's candle project) to accelerate inference.

Core features:

- **Virtual avatars**: Supports VRM and Live2D models, with automatic blinking, automatic gaze tracking, and idle eye movement
- **Real-time voice chat**: Multi-provider speech synthesis (ElevenLabs, Microsoft/Azure, OpenAI-compatible, Alibaba Cloud, Kokoro TTS), client-side speech recognition and voice activity detection
- **Game interaction**: Can play Minecraft, Factorio, with a Dome Keeper PoC available
- **Multi LLM Provider**: Supports 30+ providers, including OpenAI, Anthropic, DeepSeek, Qwen, Google Gemini, xAI, Groq, SiliconFlow, ModelScope, etc.
- **Pure in-browser local inference**: Supports in-browser inference via WebGPU, no server required
- **Multi-platform**: Browser version, desktop version (macOS/Windows), mobile version
- **Memory system**: In-browser database (DuckDB WASM / pglite), Memory Alaya (in development)

## Resources

| Resource | URL |
|----------|-----|
| Repository | [moeru-ai/airi](https://github.com/moeru-ai/airi) |
| Official website | [airi.moeru.ai](https://airi.moeru.ai) |
| Discord | [discord.gg/TgQ3Cu2F7A](https://discord.gg/TgQ3Cu2F7A) |

## ModelScope Integration

airi lists ModelScope as one of its supported LLM API providers. After selecting ModelScope in the settings, airi calls open-source models such as Qwen, DeepSeek, and Kimi through ModelScope's OpenAI-compatible API to drive conversations.

## Getting Started

Select ModelScope as the LLM API Provider in airi's settings:

1. Open airi settings
2. Under the LLM Provider source options, select `ModelScope`
3. Enter the API Key
4. Select a model

![airi ModelScope configuration screenshot 1](../_resources/airi-1.png)

![airi ModelScope configuration screenshot 2](../_resources/airi-2.png)

![airi ModelScope configuration screenshot 3](../_resources/airi-3.png)

After configuration, airi can use ModelScope models to drive conversations. airi supports sending images in chat for image recognition (requires selecting a multimodal model).

![airi ModelScope configuration screenshot 5](../_resources/airi-5.png)

### Character Card Management

In the settings, you can upload or create new character cards. When creating a character card, you can define identity, behavior, and other traits to build a personalized AI companion. Built-in character models can also be selected under "Settings → Character Models".

![airi ModelScope configuration screenshot 6](../_resources/airi-6.png)

![airi ModelScope configuration screenshot 7](../_resources/airi-7.png)

![airi ModelScope configuration screenshot 8](../_resources/airi-8.png)

![airi ModelScope configuration screenshot 9](../_resources/airi-9.png)

After selecting a model, you can fine-tune the scene (parameters such as camera angle, camera distance, and model orientation).

![airi ModelScope configuration screenshot 10](../_resources/airi-10.png)
