<!-- modelscope-docs: Notebook分享与协作 | notebook/sharing/sharing_CN.md -->

# Notebook分享与协作

ModelScope Notebook支持分享功能，您可以通过此功能，轻松地与他人共享您在Notebook交互式编程环境下开发的代码，以及笔记说明等信息。Notebook的分享能使得社区开发者可以方便的复现您的代码实现，并基于您的分享进行持续开发，从而更好促进社区合作。

## 分享
在ModelScope Notebook里打开pynb文件的Jupyter编辑页面后，即可以点击右上角带有ModelScope Logo的 “分享Notebook” 按键，实现分享。

![image.png](./_resources/share-button.png)

点击分享以后，ModelScope平台会为您自动生成一个分享链接。这个链接指向的是您当前编辑的Notebook的一个**快照版本**的链接。该链接是**公开可访问的**，在分享以后，任何获取链接的人都可以通过ModelScope查看您分享的快照版本的内容。您也可以点击“查看”按钮，来自己review一下分享内容的效果。
![image.png](./_resources/shared-notebook.png)

需要注意的是，如果您在当前Notebook编辑页面，继续修改和编辑内容，这些新的修改是**不会同步到之前分享的快照版本**的，除非您在编辑后再次进行分享操作。

## 基于分享Notebook进行持续开发

如果其他人给您分享了一个Notebook快照，也就是上图展示的`https://modelscope.cn/notebook/share/...` 这种链接，您可以直接在浏览器查看。如果您想运行这个Notebook，或者想基于基于当前的这个快照版本进行编辑修改，则可以点击页面右上角的“在Notebook中打开”的链接，根据页面引导选择合适的ModelScope Notebook实例打开即可，具体的操作可参照[Notebook相关介绍](./Notebook介绍.md)中**免费Notebook使用**部分的文档说明。打开Notebook实例后，就能直接进入Notebook编辑开发环境。

值得注意的是，您通过他人分享打开的Notebook，并且基于这个版本进行的编辑开发，**所有修改仅保存在您自己的工作空间中，不会同步至原始Notebook**。如果您希望与他人分享您的修改内容，需要主动将您的副本重新分享出去。


