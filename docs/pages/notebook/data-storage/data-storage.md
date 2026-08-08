<!-- modelscope-docs: Notebook Data Storage | notebook/data-storage/data-storage_EN.md -->

# Data Upload and Export
You can upload or download small data files on the JupyterLab page of your Notebook instance. This article introduces how to upload or download data files.

## Uploading and Downloading Data Files on the JupyterLab Page

1. Enter the Notebook instance development environment.
2. To upload data, follow the operation guide shown in the figure below:

![image.png](./_resources/1659693464416-107a7f18-1a68-4f82-8b7d-614e2a2da9db.png)

3. To download data, follow the operation guide shown in the figure below:

![image.png](./_resources/1659693570932-ea5b12ca-a3d7-4614-aac1-223a99613112.png)

## Exporting Notebook Files
You can export Notebook files in various formats for local viewing or sharing.

### Background Information
ModelScope Notebook supports exporting Notebook files in the following formats:

- Asciidoc: **.asciidoc** files
- HTML: **.html** files
- Latex: **.tex** files
- Markdown: **.md** files
- PDF: **.pdf** files
- ReStructured Text: **.rst** files
- Executable Script: **.py** files
- Reveal.js Slides: **.html** files

### Operation Steps

1. Enter the Notebook development environment
2. Open the Notebook file to be exported.
3. In the top menu bar, select **File > Export Notebook As... > Target Format** to export the file as the selected **target format**.

![image.png](./_resources/1659693029956-948c37cd-f821-4410-9b6b-ecb58e74cfa0.png)


# Storage Migration

## Migrating from ModelScope Free Instance to Alibaba Cloud OSS Paid Instance

If you have purchased a personal paid OSS instance and wish to migrate your personal data from the ModelScope free instance to your personal paid instance, we provide the following guidance:
![image.png](./_resources/notebook-storage.png)

### I. Pre-migration Preparation
Before performing data migration, please ensure you have completed the following preparations:

- Purchased an Alibaba Cloud OSS personal paid instance
- Confirmed the target storage region and Bucket name
- Understood the scope and capacity requirements of the data to be migrated

### II. OSS Command Line Tool Installation
First, you need to download and install the OSS command line tool in the ModelScope free notebook terminal environment.

- Download and extract the OSS command line tool package

```
curl -o ossutil-2.1.1-linux-amd64.zip https://gosspublic.alicdn.com/ossutil/v2/2.1.1/ossutil-2.1.1-linux-amd64.zip && unzip ossutil-2.1.1-linux-amd64.zip
```

- Copy the OSS tool to the system directory

```
cd ossutil-2.1.1-linux-amd64 && mv ossutil /usr/local/bin/ && ln -s /usr/local/bin/ossutil /usr/bin/ossutil
```

- Modify the OSS configuration file (temporarily use cn-hangzhou region; if you purchased OSS in other regions, please manually modify the corresponding region information)
```
cat << EOF > /root/.ossutilconfig
[default]
region=cn-hangzhou # Default China (Hangzhou) region
mode=uri # Use credential URI mode
credential-uri=http://localhost:7002/api/v1/credentials/0
EOF
```
> ⚠️ Note: If using other regions, please modify the region parameter to the corresponding region (such as cn-beijing, cn-shanghai, etc.)

### III. Data Migration Operations

#### 3.1 Single File Migration Example

Use the command line tool to copy files you need to back up to OSS.

For example, copy the file example.ipynb from the current directory to OSS Bucket modelscope-dataset-test:

```
ossutil cp example.ipynb oss://modelscope-dataset-test
```
> ⚠️ Note: You need to create an OSS Bucket in the corresponding region beforehand. Bucket names should start with "modelscope-".

View files in OSS bucket modelscope-dataset-test, or check in the Alibaba Cloud console:
```
ossutil ls oss://modelscope-dataset-test
```

#### 3.2 Batch File Migration

If there are too many files, it's recommended to compress them into a package before uploading.

- Use the tar command to package files
```
tar -czf data.tar.gz directory_name/
```

- Upload the compressed package
```
ossutil cp data.tar.gz oss://modelscope-dataset-test
```

- Migration status verification
```
# View OSS bucket file list
ossutil ls oss://modelscope-dataset-test

# View specific file details
ossutil stat oss://modelscope-dataset-test/example.ipynb
```

For more OSS operation commands, please refer to [Alibaba Cloud Documentation](https://help.aliyun.com/zh/oss/getting-started/command-line-tools-ossutil-quickstart?spm=a2c4g.11186623.help-menu-31815.d_3_2.1c234f6aXgSyAm)

> **Important Notice ⚠️**: Data migration will incur additional costs such as network transmission and storage, which will be reflected in the corresponding cloud product billing statement. Please check the details in the Alibaba Cloud console.

#### 3.3 Resumable Transfer
When transferring large files or in unstable network environments, file uploads or downloads may fail due to connection interruptions. To avoid repeated transfers and improve efficiency, it is recommended to use the resumable transfer feature of ossutil 2.0 to continue transmission from the interruption point and ensure task progress recovery.

ossutil 2.0 supports resumable transfer for both upload and download tasks. This feature records the chunk information and progress status during transmission, ensuring that execution can continue from the breakpoint after task interruption without restarting.

>**Note ⚠️**: The resumable transfer feature is not enabled by default and must be explicitly specified with the --checkpoint-dir parameter when executing the cp command.

- Resumable transfer for a single file
```
ossutil cp upload.rar oss://modelscope-dataset-notebook --checkpoint-dir
```

- Resumable transfer for batch files
```
ossutil cp -u -r local_directory oss://modelscope-dataset-notebook --checkpoint-dir
```

For detailed mechanisms and more configuration options, please refer to [Alibaba Cloud Documentation](https://help.aliyun.com/zh/oss/developer-reference/breakpoint-file-resumable?spm=5176.21213303.J_ZGek9Blx07Hclc3Ddt9dg.1.66f02f3dy33sfh&scm=20140722.S_help@@%E6%96%87%E6%A1%A3@@2835411._.ID_help@@%E6%96%87%E6%A1%A3@@2835411-RL_oss%E6%96%AD%E7%82%B9%E7%BB%AD%E4%BC%A0-LOC_2024SPHelpResult-OR_ser-PAR1_2150440317557751376536995ef074-V_4-PAR3_o-RE_new5-P0_0-P1_0)