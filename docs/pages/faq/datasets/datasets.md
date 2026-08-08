<!-- modelscope-docs: Common Dataset Questions | faq/datasets/datasets_EN.md -->

# Common Dataset Questions

## Creation Related
### Q1: Why do I get an "Initialize Project" failure error when creating a dataset? <br />
This may be due to legacy accounts that were previously not added to the "owner" space you selected on the Git side. In such cases, you can contact us for backend operations.

### Q2: After creating a dataset, the file list prompts "Readme.md file has syntax errors and cannot be parsed correctly, please fix as soon as possible" and "Current PYTHON file is empty, please improve documentation content as soon as possible"? 
To ensure the quality of datasets within the platform, we perform content and syntax checks on uploaded readme files. If errors occur, you can check whether the following issues exist in the dataset:
1. Whether the yaml header includes task and license information, and whether the overall readme can be parsed successfully
2. Whether the markdown section contains >200 characters
3. If the dataset is hosted to a public host, whether the python file is empty<br>
Specific dataset creation can refer to the documentation [Hosting to ModelScope](https://modelscope.cn/docs/%E6%89%98%E7%AE%A1%E5%88%B0ModelScope%E6%95%B0%E6%8D%AE%E9%9B%86%E5%88%9B%E5%BB%BA%E6%B5%81%E7%A8%8B) and [Hosting to Public Host](https://modelscope.cn/docs/%E6%89%98%E7%AE%A1%E5%88%B0%E5%85%AC%E5%BC%80Host%E6%95%B0%E6%8D%AE%E9%9B%86%E5%88%9B%E5%BB%BA%E6%B5%81%E7%A8%8B).

## Preview Related
### Q3: Why can't dataset_infos.json be modified?<br />
This file is auto-generated to support front-end preview, and users do not need to edit it manually. If errors are found, you can contact us. Other dataset file specifications can be referenced in the article "Dataset File Specifications"

### Q4: Why can't I see the preview generated after uploading data files?<br />
Preview generation is an asynchronous operation. For datasets of normal size, please wait patiently for 3-5 minutes. For larger datasets, longer waiting times are needed. If there is no response for a long time, you can contact us.

### Q5: How to trigger preview?<br />
When modifying data files (except README.md, dataset_infos.json), the system will automatically trigger re-preview.

## Maintenance Related
### Q6: I want to change the dataset's归属 space, is that possible?<br />
This function is currently not supported, and you need to recreate it under the new space.

### Q7: How to upload data files currently?<br />
There are currently two ways to upload data files: 1: Upload via the Web interface, supporting single file, multiple files, and folder uploads. 2: Upload via git, and if uploading large files, git lfs is required.

### Q8: How to fill in tags in Readme?<br />
When you click the Edit button on the right side of Readme.md, an editing interface will appear. In the upper right corner there is a "Use Template Editor" function that can help you quickly generate a tag, which you can then paste in. Pay particular attention to the fact that after the three hyphens "---" that separate the yaml part and the subsequent markdown part in Readme, do not include extra spaces, please go directly to a new line.

### Q9: SDK modelscope==1.13.2 or higher versions have comprehensively optimized datasets. If you encounter errors when loading datasets using the SDK, please try upgrading the SDK to the latest version<br />