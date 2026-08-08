<!-- modelscope-docs: 发起Pull-Requests | models/advanced-usage/pull-requests/pull-requests_CN.md -->

交流反馈版块鼓励社区成员通过创建 PR 的方式与资源作者共建内容，您可以直接在 Web 页面上传同名模型文件完成原文件修改或非同名模型文件完成文件新增并提交 PR ，也可以仅在 Web 页面填写标题后提交来完成 PR Branch 创建并通过 Git 命令来更新 Pull Request 分支中的内容。本文介绍通过 Git 命令来实现 “本地管理 Pull Requests”的方法。

## 创建 PR Branch 并获取分支名称
按照下图操作获取分支名称，名称关键字段包括`<your username>`和`<pull request branch id>`。  

第一步，创建 Pull Request  

![image.png](./_resources/create_pr.png)  

![image.png](./_resources/submit_pr.png)
  
  第二步，获取分支名称  

![image.png](./_resources/branch_name.png)  

![image.png](./_resources/branch_name_got.png)

## 通过 Git 命令更新 PR 内容

1. 下载模型库
```shell
git clone https://www.modelscope.cn/<namespace>/<model-name>.git
# 例如: git clone https://www.modelscope.cn/damo/ofa_image-caption_coco_large_en.git
```

2. 进入模型库文件夹
```shell
cd <model-name>
# 例如: cd ofa_image-caption_coco_large_en
```

3. 更新模型库分支信息并切换到创建的PR分支
```shell
git fetch
git checkout pr/<your username>/<pull request branch id>
# 例如: git checkout pr/foo/20240206200503
```

4. 更新模型文件

5. 将更新后的内容添加到本次提交中，并添加本次提交的信息
```shell
git add .
git commit -m "<your message>"
# 例如: git commit -m "修改了README.md"
```

6. 将本次提交的内容推送到远端模型库中
```shell
git push origin pr/<your username>/<pull request branch id>
# 例如: git push origin pr/foo/20240206200503
```

7. 输入用户名和访问令牌以通过鉴权，如果您之前已通过访问访问令牌使用过 git 命令行工具，则可能不需要再次验证。如遇鉴权要求，登录 <https://www.modelscope.cn> ，在【首页->访问令牌】页面，拷贝您的访问令牌.  

![image.png](./_resources/git_token.png)

## 查看历史 PR
登录<https://www.modelscope.cn> ，在【首页->我创建的->我的帖子->Pull Request】 查看您创建过的 PR。  
	
![image.png](./_resources/prs.png)