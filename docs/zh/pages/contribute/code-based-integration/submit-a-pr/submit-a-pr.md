<!-- modelscope-docs: 增加docstr并推送PR | contribute/code-based-integration/submit-a-pr/submit-a-pr_CN.md -->

## 添加文档

用例添加完成后，可以对代码增加一些文档了。ModelScope对文档的要求请查看[代码注释规范](./接入帮助/代码注释规范.md)。

## 提交PR

提交PR之前，请注意：

- 接入的模型、预处理器、pipeline、trainer等完全可用，模型文件已经放入ModelHub，测试用例可正常运行
- 代码格式、代码注释符合ModelScope的要求。ModelScope支持pre-commit代码格式自动修正

```shell
pip install pre-commit
# 在ModelScope文件夹中运行
pre-commit run --all-files
# 如果pre-commit报错，请按照提示对代码进行修正。
```

如果之前已经提交了PR，只需要将有改动的代码push上去即可，否则请在此时提交一个，并等待ModelScope开发人员的review。