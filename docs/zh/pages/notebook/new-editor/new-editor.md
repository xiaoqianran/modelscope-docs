<!-- modelscope-docs: 新版编辑器 | notebook/new-editor/new-editor_CN.md -->

# 新版编辑器

## 编辑器入口

我的 notebook：点击「查看notebook」，选择「体验新版」

![image.png](./_resources/entry.png)

## 实例非运行时

在非运行时情况下，编辑器内会常驻一个 ModelScope WorkSpace 目录。

- ModelScope WorkSpace 目录: 用户账号对应存储空间，与用户账号关联，常驻展示，目前仅支持创建与存储 ipynb 文件。

![image.png](./_resources/common.png)

## 实例运行时

### 连接运行时

点击右上角「连接运行时」，选择实例

- CPU 类型：8核 32GB，长期有效
- GPU 类型：8核 32GB，显存24G；新用户 免费额度 32 小时

![image.png](./_resources//connect-runtime.png)

### 编辑器模块

连接运行时后，支持与实例终端交互、实例状态展示、侧边栏 /mnt/workspace 文件管理等。

- 实例 /mnt/workspace 文件目录：实例内持久化存储文件目录，与当前实例绑定，仅在连接运行时后展示。

![image.png](./_resources/runtime.png)

### 查看运行实例

实例运行成功后，鼠标移动到”实例运行中“按钮上方，可以进入当前运行的实例，或者手动停止启动中的实例。
![image.png](./_resources/view-instance.png)

## 分享文件到灵感流

对于编辑器内的所有 ipynb 文件，您都可以点击 ipynb 文件右上角的「分享作品」按钮，将当前 ipynb 文件分享到灵感流。
![image.png](./_resources/share-to-gallery.png)

## 临时工作区文件

当从部分 ModelScope 页面进入编辑器时，会自动创建临时工作区目录，该目录下的文件不会被持久化保存。

- 临时工作区文件：临时工作区目录的文件可以被更改和运行，但不会被保存。如果您需要保存文件，可以将它们复制到 ModelScope WorkSpace 目录中。

### 示例：编辑灵感流源文件

在灵感流中点击编辑源文件进入编辑器：
![image.png](./_resources/edit-gallery-example-1.png)

在编辑器左侧目录会生成对应灵感流的临时文件：
![image.png](./_resources/edit-gallery-example-2.png)
