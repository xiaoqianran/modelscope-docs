<!-- modelscope-docs: 直接运行llamafile格式模型 | models/advanced-usage/llamafile/llamafile_CN.md -->

# 直接运行llamafile格式模型

Llamafile是由Mozilla发布开源的，一个将大型语言模型和运行环境全部封装在一个可执行文件中的创新项目。在ModelScope平台上开放的丰富的Llamafile模型，都可以通过ModelScope命令行，直接在Linux/Mac/Windows等不同操作系统环境中，实现一键运行大模型。

**无需提前配置或安装任何运行环境**，直接安装ModelScope后，即可一键拉起指定的大模型。

```shell
pip install modelscope -U
```

## 一键运行
ModelScope平台上目前开放了数百个Llamafile格式的大模型，基本对于头部的大模型，都提供了对应的llamafile格式。您可以在模型页面左侧的框架选项中，选中Lllamfile，即可以直接筛选出Llamafile格式的模型。

![img.png](./_resources/llamafile-list.png)

同时您也可以通过[对应的链接](https://www.modelscope.cn/models?libraries=Llamafile&page=1)直达列表页。

在选择了您想要使用的模型后，可以如下命令行来调用：
```shell
    modelscope  llamafile --model {model_id}
```
例如如果要运行Qwen2.5-3B模型：
```shell
    modelscope  llamafile --model Qwen-Llamafile/Qwen2.5-3B-Instruct-llamafile
```
- 在Linux环境上：
![img.png](./_resources/llamafile-basic.png)

- 在Mac笔记本上：
![img.png](./_resources/llamafile-mac.png)

## WebUI访问
同时llamafile底层基于llama.cpp搭建，在运行的同时，通过默认的`http://127.0.0.1:8080/` 地址即可访问其WebUI：

![img.png](./_resources/llamafile-webui.png)

## 命令行选项
除了如上基本的用法以外，使用ModelScope命令行拉起llamafile大模型时，还可以指定精度，或指定模型库里的llamafile文件等配置。例如如果要使用不同精度的llamafile文件，可以通过`--accuracy`参数来指定，例如`Q2_K`,`Q5_0`等等。 同时也可以通过`--file`参数，来直接指定模型库里的llamafile文件名，例如：

比如如下两种调用方式，是等效的，都是选择模型库里，精度为“Q2_K”的模型。

```shell
    modelscope  llamafile --model Qwen-Llamafile/Qwen2.5-3B-Instruct-llamafile --accuracy Q2_K
```

或

```shell
    modelscope  llamafile --model Qwen-Llamafile/Qwen2.5-3B-Instruct-llamafile --file qwen2.5-3b-instruct-q2_k.llamafile
```

更多的命令行选项，可以参见ModelScope[命令行介绍](../../Library与命令行教程/命令行介绍.md)。