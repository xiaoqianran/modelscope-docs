<!-- modelscope-docs: Access Token | accounts/token/token_EN.md -->

On ModelScope, you can access community resources through both SDK and Git methods. We provide a unified access token (Access Token/ModelScope Token) that can be used for both resource access methods, making it easier for community users to manage and use.

This article introduces operations related to access tokens.

# Access Token Query
Go to the [Homepage -> Access Token](https://modelscope.cn/my/myaccesstoken) page to create or query your access tokens.
![image.png](./_resources/accesstoken.png)

# Access Token Management
- **Creating Access Tokens**: When using access tokens for the first time, you need to manually create one and specify an appropriate validity period, including "Long-term use" or "Short-term use" options. For short-term use, you can customize the validity duration on a monthly basis, allowing you to set it flexibly according to your actual usage scenarios.

- **Number of Access Tokens Allowed**: You can create multiple tokens with different names and validity periods. The maximum number of active access tokens cannot exceed 10.

- **Deleting Access Tokens**: Any access token can be **deleted**. To avoid affecting your normal usage, please ensure you update all usage scenarios after performing related operations.

# Using Access Tokens for GIT Operations
The unified access token currently supports Git-related operations with unchanged usage methods. For details, please refer to the relevant site documentation or page instructions.

When you need to reset, go to [Homepage -> Access Token](https://modelscope.cn/my/myaccesstoken) to create a new access token and delete the old one.

Please note: Once you delete an old access token, it will **expire immediately**, which may affect all scenarios where the access token is used, including model uploads and model training in the AIGC section.

If you need to update the remote URL of your associated local repository, you can follow these steps to complete the update:
```shell
# Assuming your account name is `user`, the model name to update is `my-test-model`, and the new access token is `new_access_token`,
git remote set-url origin https://oauth2:new_access_token@modelscope.cn/user/my-test-model.git
```

## Git Access Token (Deprecated)
- Original Git access tokens no longer support new creation and will be gradually phased out.
- For Git-related operations, you can still use already obtained Git access tokens, but the community **no longer supports querying or resetting Git access tokens**.
- **To avoid affecting your future usage, please upgrade to the unified access token as soon as possible**.