<!-- modelscope-docs: Run Llamafile Format Models Directly | models/advanced-usage/llamafile/llamafile_EN.md -->

# Run Llamafile Format Models Directly

Llamafile is an innovative open-source project released by Mozilla that packages large language models and their runtime environment into a single executable file. The extensive collection of Llamafile models available on the ModelScope platform can be run with a single command across different operating systems including Linux, Mac, and Windows using the ModelScope command line.

**No prior configuration or installation of any runtime environment is required** – simply install ModelScope and you can launch your desired large model with one command.

```shell
pip install modelscope -U
```

## One-Click Execution
ModelScope currently offers hundreds of large models in Llamafile format, providing Llamafile versions for most leading models. You can filter for Llamafile format models by selecting "Llamafile" in the framework options on the left side of the model page.

![img.png](./_resources/llamafile-list.png)

You can also directly access the [list page](https://www.modelscope.ai/models?libraries=Llamafile&page=1) via the corresponding link.

After selecting your desired model, you can invoke it using the following command:
```shell
    modelscope  llamafile --model {model_id}
```
For example, to run the Qwen2.5-3B model:
```shell
    modelscope  llamafile --model Qwen-Llamafile/Qwen2.5-3B-Instruct-llamafile
```
- On Linux environment:
![img.png](./_resources/llamafile-basic.png)

- On Mac laptop:
![img.png](./_resources/llamafile-mac.png)

## WebUI Access
Llamafile is built on top of llama.cpp, and when running, you can access its WebUI through the default address `http://127.0.0.1:8080/`:

![img.png](./_resources/llamafile-webui.png)

## Command Line Options
Beyond the basic usage described above, when launching Llamafile large models using the ModelScope command line, you can also specify precision levels or directly reference specific Llamafile files from the model repository. For example, to use different precision Llamafile files, you can specify the `--accuracy` parameter, such as `Q2_K`, `Q5_0`, etc. You can also use the `--file` parameter to directly specify the Llamafile filename from the model repository, for example:

The following two invocation methods are equivalent, both selecting the model with "Q2_K" precision from the model repository.

```shell
    modelscope  llamafile --model Qwen-Llamafile/Qwen2.5-3B-Instruct-llamafile --accuracy Q2_K
```

or

```shell
    modelscope  llamafile --model Qwen-Llamafile/Qwen2.5-3B-Instruct-llamafile --file qwen2.5-3b-instruct-q2_k.llamafile
```

For more command line options, please refer to the ModelScope [Command Line Introduction](../../Library与命令行教程/命令行介绍.md).