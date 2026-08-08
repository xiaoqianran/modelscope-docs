<!-- modelscope-docs: Notebook环境配置与管理 | notebook/environment-setup/environment-setup_CN.md -->

# 配置和使用Conda环境
Conda 是一个开源的软件包管理和环境管理系统，通过Conda可以创建和管理多个独立的开发环境，避免相互干扰。在Python等语言开发过程中，使用Conda来进行环境保存和隔离是常见的操作。

在ModelScope Notebook中（PAI-DSW版本），提供了持久化存储的支持（详情请参见[Notebook介绍](./Notebook介绍.md)中**存储说明**部分的介绍），为跨session的Conda环境持久化提供了基础。但是一般的Conda安装方法由于默认安装路径和配置等原因，在ModelScope Notebook关闭重启后会失效。本文说明一下如何进行Conda的安装与配置，让你的开发环境配置能够在ModelScope Notebook不同的Session间得到延续。

Conda有多个发行版本，这里以Miniconda 为例进行说明，其他版本类似。

## 安装Conda
ModelScope Notebook为Linux环境，所以首先要获取Miniconda的Linux安装包，您可以到[Miniconda官网](https://docs.anaconda.com/miniconda/)下载安装包`Miniconda3-latest-Linux-x86_64.sh`，并确保其可执行：

```sh
# 下载链接为范例，实际请以官方站点的安装脚本链接为准
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
chmod +x Miniconda3-latest-Linux-x86_64.sh
```
Miniconda 允许用户在安装过程中指定安装路径。当您下载 Miniconda 安装包后，在运行安装命令时可以通过 -p 或 --prefix 参数来指定安装目录。我们要确保将其安装到Notebook的默认存储路径`/mnt/workspace`下，**因为只有这个路径下的文件，才会被持久化保存**。

具体来说，假如我们希望将其安装到`/mnt/worksapce/miniconda3` 目录下，可使用如下命令：

```sh
!bash Miniconda3-latest-Linux-x86_64.sh -b -p /mnt/workspace/miniconda3
```
这里
- `-p`指定的是您希望安装 Miniconda 的完整路径。
- `-b`表示以批处理模式运行安装程序，不需要在安装过程提示交互。

Notebook上这部分安装需要一点时间，请稍作等待，等安装完成。

## 初始化Conda
手工指定安装路径时，在安装后需要显式地调用`conda` binary 进行初始化：
```sh
/mnt/workspace/miniconda3/bin/conda init
```
初始化成功以后，关闭当前的terminal窗口，再重新打开。就可以正常使用`conda`命令了。

请注意，在您关闭ModelScope Notebook实例后，后续**每次打开ModelScope Notebook的时候，都需要重新执行一次如上的初始化命令**。
## 使用Conda
接下来就可以正常的使用Conda环境了，例如要创建一个名字为`mymodelscope`的Conda环境，可以通过如下命令
```sh
conda create -n mymodelscope
```
![img.png](./_resources/conda-create.png)

可以看到此时生成的环境文件，也会保存到`/mnt/workspace/miniconda/`的路径下。这时候根据提示activate conda环境即可。
## 重启ModelScope Notebook后，恢复Conda环境
在ModelScope Notebook实例关闭后，重新打开新的实例，只需要如下两个步骤，就可恢复之前实例的Conda环境：
- 首先，重新初始化Conda：
```sh
/mnt/workspace/miniconda/bin/conda init
```
关闭命令行窗口后重新打开。

- 重新激活Conda环境
```sh
conda activate mymodelscope
```
![img.png](./_resources/restart-conda.png)

这样就恢复到您之前的Conda环境了。

# 三方库安装与管理

ModelScope Notebook提供的开发环境包括不同的版本，对应不同的Python，Pytorch，Tensorflow等框架的组合。请根据使用需求自行选择合适的镜像环境。

打开Notebook后，您可以在Notebook的Terminal中，直接安装、查看、卸载第三方库。
## 查看第三方库
使用以下命令查看已安装的第三方库。
```shell
pip list
```
## 卸载第三方库
```shell
pip uninstall <your-library-name>
```
需要将<yourLibraryName>替换为已安装的第三方库名称，只能卸载自己安装的第三方库。
## 更新第三方库
一些第三方库不支持卸载，比如**tensoflow-gpu**，只能使用更新命令安装固定版本的**tensoflow-gpu**，且新版本必须与CUDA版本兼容。您可以使用以下命令更新已安装的第三方库。
```shell
pip install --upgrade --user tensorflow-gpu=<versionNumber>
```
需要将<versionNumber>替换为待安装的tensoflow-gpu版本号。过程中请不要升级系统pip，否则可能导致无法安装。


# Notebook镜像更新与管理

## 如何获取镜像更新通知
进入**个人中心 > 我的Notebook**后，您将在启动镜像按钮处看到更新镜像提示。
![image.png](./_resources/1663209465960-44cd7f73-3ff9-4c3f-8772-8f52ec6edd84.png)
## 保存原有实例中的文件
需要注意的是，直接更新镜像文件不会保存，可先前往**原有实例**中进行文件保存后再更新镜像并启动，即您可以先启动原有实例，确保文件均已保存后再关闭实例，更新镜像。若您已打开实例，保存文件后关闭实例即可。
![image.png](./_resources/1663210173680-15eb5f27-54a2-49bf-9df2-c56162718e9c.png)
## 镜像更新
点击**更新镜像并启动**按钮，后台将自动更新实例并载入最新版本镜像，更新时间大约在1-2分钟内。完成更新后，镜像版本信息将同步更新，并自动为您打开载入最新版本镜像的新实例。
![image.png](./_resources/1663209709494-037e73ae-9974-45ab-a94a-477aea5aa9db.png)


