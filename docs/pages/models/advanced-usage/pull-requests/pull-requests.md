<!-- modelscope-docs: Submit Pull Requests | models/advanced-usage/pull-requests/pull-requests_EN.md -->

The feedback section encourages community members to collaborate with resource authors by creating PRs. You can directly upload model files with the same name on the web page to modify original files, or upload files with different names to add new files and submit a PR. Alternatively, you can create a PR branch by submitting a PR with just a title on the web page and then update the content in the Pull Request branch using Git commands. This article introduces how to "manage Pull Requests locally" using Git commands.

## Create a PR Branch and Obtain the Branch Name

Follow the steps below to obtain the branch name. The key fields in the name include `<your username>` and `<pull request branch id>`.

Step 1: Create a Pull Request

![image.png](./_resources/create_pr.png)

![image.png](./_resources/submit_pr.png)

Step 2: Obtain the branch name

![image.png](./_resources/branch_name.png)

![image.png](./_resources/branch_name_got.png)

## Update PR Content Using Git Commands

1. Clone the model repository
```shell
git clone https://www.modelscope.ai/<namespace>/<model-name>.git
# Example: git clone https://www.modelscope.ai/damo/ofa_image-caption_coco_large_en.git
```

2. Navigate to the model repository folder
```shell
cd <model-name>
# Example: cd ofa_image-caption_coco_large_en
```

3. Update the model repository branch information and switch to the created PR branch
```shell
git fetch
git checkout pr/<your username>/<pull request branch id>
# Example: git checkout pr/foo/20240206200503
```

4. Update the model files

5. Add the updated content to this commit and add a commit message
```shell
git add .
git commit -m "<your message>"
# Example: git commit -m "Modified README.md"
```

6. Push the committed changes to the remote model repository
```shell
git push origin pr/<your username>/<pull request branch id>
# Example: git push origin pr/foo/20240206200503
```

7. Enter your username and access token for authentication. If you have previously used the Git command-line tool with an access token, you may not need to authenticate again. If authentication is required, log in to <https://www.modelscope.ai>, go to [Homepage -> Access Token] page, and copy your access token.

![image.png](./_resources/git_token.png)

## View Historical PRs

Log in to <https://www.modelscope.ai> and navigate to [Homepage -> My Creations -> My Posts -> Pull Requests] to view your previously created PRs.

![image.png](./_resources/prs.png)