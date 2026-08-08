<!-- modelscope-docs: Common Platform Questions | faq/common/common_EN.md -->

# Common Platform Questions

This document compiles common questions encountered during the use of ModelScope models, hoping to resolve your doubts during usage.

### Q1: Are models on the ModelScope community platform commercially available? <br>

Commercial use of open-source models requires compliance with open-source licenses. Please refer to the corresponding model's open-source license for details.

### Q2: What should I do if some packages download very slowly when using pip install? <br>

When installing with pip in China, if the default source is the overseas PyPI source, download speeds may be limited due to network issues. It is recommended to configure the repository source to use the "Tsinghua source" via the "-i [https://pypi.tuna.tsinghua.edu.cn/simple](https://pypi.tuna.tsinghua.edu.cn/simple)" command-line option. For example:

```shell
pip install "modelscope[nlp]" -f https://modelscope.oss-cn-beijing.aliyuncs.com/releases/repo.html -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### Q3: When pulling models to local using git, I found that the model file sizes differ from remote repository files. What could be the issue? <br>

Since some files are stored using LFS, you need to install the LFS tool first. Please check if git-lfs is not installed (pip list|grep lfs). If not installed, please install using the git lfs install command. See the Quick Use page on the model details page for more information.

### Q4: My system is currently Windows, and I get an error when using a certain model. What could be the issue? <br>

The ModelScope framework itself supports running in Windows environments. However, among the diverse models on the platform, some models may partially depend on system environments, affecting compatibility on Windows. On one hand, you can try using the notebook environment provided on the ModelScope website. On the other hand, for a few models that require separate configuration on Windows, you can simulate a Linux environment by creating a Windows Linux Subsystem, or install independently in the Windows environment according to the official website instructions of specific third-party dependency packages.

### Q5: Does using ModelScope models require internet connection? <br>

ModelScope manages and version-controls models and datasets through Model Hub and Dataset Hub. Therefore, to get the best user experience, we recommend using in online environments as much as possible. This ensures that the models and datasets you use are the latest versions, providing the best models and datasets. On the other hand, if your environment for using ModelScope open-source models has no internet connection, you can also download models locally and load them directly from local storage. Specific examples are as follows:
Step 1: Pull model data to local:

```python
from modelscope.hub.snapshot_download import snapshot_download
path = snapshot_download('damo/cv_convnextTiny_ocr-recognition-general_damo')
print(path)
```

Step 2: Then copy the model data (i.e., the contents of the path folder) to a new local path called new_path.
Step 3: Load the model via the local path and build the pipeline.

```python
 ocr_recognition = pipeline(Tasks.ocr_recognition, model=new_path)
```

Note: It needs to be emphasized again that using this method means you won't be able to detect updates directly if the community has model updates.

### Q6: Environment mac os x86, system Ventura 13 Beta 13, installation error "missing xcrun at: /Library/Developer/CommandLineTools/usr/bin/xcrun" <br>

For this issue in a new MBP environment, you need to execute xcode-select --install.

### Q7: How do I support downstream models after downloading a foundational large model? <br>

For large models, you can try zero-shot, and fine-tuning will yield better performance.

### Q8: In multi-GPU environments, how do I specify which GPU to use for inference? <br>

Inference can pass the device parameter, and the pipeline parameter: setting device to 'gpu:0' is sufficient.

### Q9: Can zero-shot classification models be fine-tuned with my own downstream data? <br>

Yes. If your data labels change significantly, to pursue model effectiveness, the classifier can process init weights. If your data labels don't change much, you can continue fine-tuning directly on the classifier.

### Q10: Where can I find ModelScope tutorials and practical materials? <br>

You can view the ModelScope Practical Training Camp, and click to register to view all recorded video courses.

### Q11: Does ModelScope have pre-built Docker images, and where should I download and use them? <br>

ModelScope provides GPU and CPU images, with specific information about the latest version images available in [Environment Installation](https://modelscope.cn/docs/%E7%8E%AF%E5%A2%83%E5%AE%89%E8%A3%85).

### Q12: Does ModelScope support algorithm evaluation? <br>

Currently, the API supports fine-tuning and evaluation of individual models. Batch evaluation functionality is still under continuous development, and you can temporarily write a script to achieve this. For algorithm evaluation, please refer to [here](https://modelscope.cn/docs/%E6%A8%A1%E5%9E%8B%E7%9A%84%E8%AF%84%E4%BC%B0).

### Q13: Will ModelScope release a pure offline SDK version? <br>

Most models still require server-side computing power support. Pruning and conversion of pure terminal-side models can be solved using some tools, and these tool capabilities are still in planning for release.

### Q14: When uploading datasets or models via the SDK, I get the error "requests.exceptions.HTTPError: 400 Client Error: Bad Request for url:" What should I do? <br>

You can first check your current library version to confirm if it's the latest. Then check if the token used is an Access Token. If the problem persists, please contact official support for assistance.

### Q15: Using the official image, but encountering errors during model loading, how should I resolve this?

You can first check via methods like pip list, comparing with the version numbers in [Environment Installation](https://modelscope.cn/docs/%E7%8E%AF%E5%A2%83%E5%AE%89%E8%A3%85) to see if the current image is the latest version. If not the latest version, you can update and retry. If retrying still fails to solve the problem, please contact us through the official DingTalk group.

### Q16: How to resolve issues with uploading large model files?

Model files are generally quite large, and we manage large files in models through git lfs. First, ensure you have installed the correct version of git-lfs, and also ensure your large files are in the file list (.gitattributes file).
If you encounter the error `error: RPC failed. HTTP 413 curl 22 The requested URL returned error:413` when committing with `Git`, you need to reset the buffer with `git reset` and manually track all files over 5 MB before committing again.