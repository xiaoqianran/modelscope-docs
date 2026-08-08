<!-- modelscope-docs: 通过Web-IDE使用VS-Code | notebook/web-ide/web-ide_CN.md -->

# Web-IDE入口

基于ModelScope 平台提供的算力和存储支持，ModelScope Notebook上也基于VS-Code提供了Web-IDE的入口，方便广大开发者在Notebook环境里进行更方便、更高效的开发工作。Web-IDE结合持久化存储能力（详情请参见[Notebook介绍](./Notebook介绍.md)中**存储说明**部分的介绍），能提供更完整的开发体验，因此和持久化存储一样，当前Web-IDE只在基于PAI-DSW的Notebook上提供，可以通过右上角的入口进入：

![img.png](./_resources/ide-entry.png)

进入Web-IDE页面后，就是熟悉的VS-Code界面了，这时候右上角的图标就变成返回Jupyer "Notebook"的入口，方便在Web-IDE和Jupyter Notebook之间自由切换。

![img.png](./_resources/vs-code-1.png)

开发者熟悉的VS-Code功能，都可以基于底层的CPU或GPU资源自由使用，包括Auto-Completion(因为是远程所以可能有一点延迟)，断点Debug，Terminal窗口等等

![img.png](./_resources/debug.png)

**Happy Coding！💻**