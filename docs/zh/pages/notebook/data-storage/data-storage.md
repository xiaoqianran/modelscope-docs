<!-- modelscope-docs: Notebook数据存储 | notebook/data-storage/data-storage_CN.md -->

# 数据上传与导出
您可以在Notebook实例的JupyterLab页面，上传或下载小数据量文件。本文为您介绍如何上传或下载数据文件。
## 在JupyterLab页面上传下载数据文件

1. 进入Notebook实例开发环境。
2. 上传数据可按照下图操作指引：

![image.png](./_resources/1659693464416-107a7f18-1a68-4f82-8b7d-614e2a2da9db.png)

3. 下载数据可按照下图操作指引：

![image.png](./_resources/1659693570932-ea5b12ca-a3d7-4614-aac1-223a99613112.png)
## 导出Notebook文件
您可以将Notebook文件导出为多种形式，以便本地查看或分享。
### 背景信息
ModelScope Notebook支持将Notebook文件导出为以下几种形式：

- Asciidoc：**.asciidoc**文件
- HTML：**.html**文件
- Latex：**.tex**文件
- Markdown：**.md**文件
- PDF：**.pdf**文件
- ReStructured Text：**.rst**文件
- Executable Script：**.py**文件
- Reveal.js Slides：**.html**文件
### 操作步骤

1. 进入Notebook开发环境
2. 打开待导出的Notebook文件。
3. 在顶部菜单栏，选择**File > Export Notebook As... > 目标格式**，即可将该文件导出为所选的**目标格式**文件。

![image.png](./_resources/1659693029956-948c37cd-f821-4410-9b6b-ecb58e74cfa0.png)


# 存储迁移

## 从魔搭免费实例迁移到阿里云OSS付费实例

如果您购买了个人付费OSS实例，并且希望将魔搭免费实例下的个人数据，迁移至您的个人付费实例，我们为您提供如下引导：
![image.png](./_resources/notebook-storage.png)

### 一、迁移前准备
在进行数据迁移前，请确保您已完成以下准备工作：

- 已购买阿里云OSS个人付费实例
- 确认目标存储区域（region）及Bucket名称
- 了解迁移数据范围及容量需求

### 二、OSS命令行工具安装
第一步，您需要在魔搭免费的notebook terminal环境下，下载并安装OSS命令行工具

- 下载并解压OSS命令行工具包

```
curl -o ossutil-2.1.1-linux-amd64.zip https://gosspublic.alicdn.com/ossutil/v2/2.1.1/ossutil-2.1.1-linux-amd64.zip && unzip ossutil-2.1.1-linux-amd64.zip
```
- 拷贝OSS工具到系统目录

```
cd ossutil-2.1.1-linux-amd64 && mv ossutil /usr/local/bin/ && ln -s /usr/local/bin/ossutil /usr/bin/ossutil
```

- 修改OSS配置文件（暂时先用cn-hangzhou region，如购买其他region的OSS，请手动修改对应的region信息）
```
cat << EOF > /root/.ossutilconfig
[default]
region=cn-hangzhou # 默认华东1（杭州）区域
mode=uri # 使用凭证URI模式
credential-uri=http://localhost:7002/api/v1/credentials/0
EOF
```
> ⚠️ 注意：如使用其他区域，请修改region参数为对应区域（如cn-beijing、cn-shanghai等）


### 三、数据迁移操作

#### 3.1 单文件迁移示例

使用命令行工具拷贝自己需要备份的文件到OSS上

例如，拷贝当前目录的文件example.ipynb 到OSS Bucket modelscope-dataset-test

```
ossutil cp example.ipynb oss://modelscope-dataset-test
```
> ⚠️ 注意: 需要前提要创建好对应region的OSS Bucket，Bucket名字命名以 "modelscope-" 开头

查看OSS bucket modelscope-dataset-test的文件，也可在阿里云控制台查看
```
ossutil ls oss://modelscope-dataset-test
```

#### 3.2 批量文件迁移

如果文件数过多，建议打成压缩包之后再上传。
- 使用tar命令打包文件
```
tar -czf data.tar.gz directory_name/
```

- 上传压缩包
```
ossutil cp data.tar.gz oss://modelscope-dataset-test
```

- 迁移状态验证
```
# 查看OSS存储桶文件列表
ossutil ls oss://modelscope-dataset-test

# 查看具体文件详情
ossutil stat oss://modelscope-dataset-test/example.ipynb
```

更多OSS操作命令可参考[阿里云文档](https://help.aliyun.com/zh/oss/getting-started/command-line-tools-ossutil-quickstart?spm=a2c4g.11186623.help-menu-31815.d_3_2.1c234f6aXgSyAm
) 

> **重要提示⚠️**️️：数据迁移会产生如网络传输、存储等额外费用，具体将在对应云产品账单中体现，请前往阿里云控制台查看明细。️

#### 3.3 断点续传
在传输大文件或网络环境不稳定的情况下，文件上传或下载可能因连接中断而失败。为避免重复传输、提升效率，推荐使用 ossutil 2.0 的断点续传功能，实现从中断处继续传输，保障任务进度可恢复。

ossutil 2.0 支持上传和下载任务的断点续传。该功能通过记录传输过程中的分片信息和进度状态，确保在任务中断后能从断点处继续执行，无需重新开始。

>**注意⚠️**：断点续传功能默认不启用，需在执行 cp 命令时显式指定 --checkpoint-dir 参数。

- 断点续传单个文件
```
ossutil cp upload.rar oss://modelscope-dataset-notebook --checkpoint-dir 
```

- 断点续传批量文件
```
ossutil cp -u -r local_directory oss://modelscope-dataset-notebook --checkpoint-dir 
```

关于详细机制与更多配置项，请参考[阿里云文档](https://help.aliyun.com/zh/oss/developer-reference/breakpoint-file-resumable?spm=5176.21213303.J_ZGek9Blx07Hclc3Ddt9dg.1.66f02f3dy33sfh&scm=20140722.S_help@@%E6%96%87%E6%A1%A3@@2835411._.ID_help@@%E6%96%87%E6%A1%A3@@2835411-RL_oss%E6%96%AD%E7%82%B9%E7%BB%AD%E4%BC%A0-LOC_2024SPHelpResult-OR_ser-PAR1_2150440317557751376536995ef074-V_4-PAR3_o-RE_new5-P0_0-P1_0)



