<!-- modelscope-docs: Alibaba Cloud Account Binding and Authorization Tutorial | accounts/aliyun-binding-and-authorization/aliyun-binding-and-authorization_EN.md -->

This tutorial will guide you through binding and authorizing your Alibaba Cloud main account and RAM (Resource Access Management) account with your ModelScope account, ensuring you can smoothly use the corresponding cloud services on ModelScope.

# 1. Main Account Binding and Authorization Process
## 1.1 Main Account Binding

1. **Click "Bind Now"**: Visit the ModelScope community and find the entry point for binding your Alibaba Cloud account, such as the "Bind Alibaba Cloud Account" option in the dropdown menu under your avatar in the top right corner.

![image.png](./_resources/立即绑定.png)

2. **Log in to Alibaba Cloud Account**: If you have already logged into Alibaba Cloud beforehand, you can skip this step. If you haven't registered with Alibaba Cloud before, please register according to the page instructions.

![image.png](./_resources/登陆阿里云.png)

3. **Authorize Binding**: After logging in, check all options on the pop-up authorization page to complete the binding. Please note that you must select all permissions to successfully authorize.

![image.png](./_resources/授权绑定.png)

This completes the successful binding of your Alibaba Cloud main account with your ModelScope account.

## 1.2 Main Account Authorization for ModelScope
1. **Click "Authorize ModelScope"**: On the corresponding service entry in the ModelScope community (such as My Notebook, Model Service pages), click the "Go Authorize" button.

![image.png](./_resources/去授权.png)

2. **Redirect to Authorization Page**: The system will automatically redirect you to the Alibaba Cloud authorization page. Follow the page instructions to confirm authorization for ModelScope to use the corresponding cloud services.

![image.png](./_resources/同意授权.png)

3. **Complete Authorization**: After completing the above authorization operation, the system will automatically return to the corresponding ModelScope service page, indicating successful authorization.

## 1.3 Main Account Cloud Service Activation & Usage

1. **Click "Activate and Authorize"**: On the corresponding service entry in the ModelScope community (such as My Notebook, Model Service pages), click the "Activate and Authorize" button.

![image.png](./_resources/开通并授权.png)

2. **Activate and Authorize Corresponding Cloud Services**: ModelScope will complete the activation of the corresponding cloud services based on the previous authorization.
3. **Complete Authorization**: After completing the above authorization operation, you can create corresponding cloud service instances based on your bound Alibaba Cloud account. Related fees can be viewed in the Alibaba Cloud console.

![image.png](./_resources/完成云服务授权.png)

# 2. RAM Account Binding and Authorization Process
## 2.1 RAM Account Binding
To enable RAM accounts to access ModelScope, appropriate policies and roles need to be created first:
1. **Create Policy**: The main account creates a custom policy named "ProvisionExternalApplicationPolicy" in the [RAM Console](https://ram.console.aliyun.com/overview).
This policy can be generated through script editing, with the specific JSON as follows:

![image.png](./_resources/RAM创建策略.png)

```json
{
    "Version": "1",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "ram:ProvisionExternalApplication",
            "Resource": "*"
        }
    ]
}
```
2. **Authorize Policy**: Grant the "ProvisionExternalApplicationPolicy" policy to the RAM users who need to access ModelScope.

![image.png](./_resources/RAM授权策略.png)

> If your RAM account already has AliyunRamFullAccess permission, you can skip this step directly. **However, please note that AliyunRamFullAccess is a high-privilege setting**, and security risks should be carefully considered when using it.

3. **Complete Binding**: Visit the ModelScope community and find the entry point for binding your Alibaba Cloud account, click "Bind Alibaba Cloud Account", and follow the regular page prompts to complete the binding of your Alibaba Cloud RAM account with your ModelScope account.

## 2.2 RAM Account Authorization for ModelScope
For RAM user authorization, the prerequisite is creating two specific policies and roles. You can choose one of the following two methods to achieve these prerequisites:
#### Method 1🌟: Automatic Creation of Permissions and Roles
If the main account associated with the RAM account has already been bound to ModelScope and completed the authorization for ModelScope (mentioned in section 1.2), the system has already created the "VendorCrossAccountMODELSCOPERolePolicy" policy and "VendorCrossAccountMODELSCOPERole" role for the main account.

When your RAM account clicks the "Go Authorize" button on the ModelScope page, the system will automatically obtain the required console permissions and roles, confirming authorization for ModelScope.

![image.png](./_resources/完成授权.png)

#### Method 2: Manual Creation by Main Account
Method 2 is relatively complex and requires the main account to log into the console and create a policy named VendorCrossAccountMODELSCOPERolePolicy, granting the RAM account necessary permissions to operate ModelScope-related authorization.

1. **Create Policy**: The main account logs into the console to create the "VendorCrossAccountMODELSCOPERolePolicy" policy

![image.png](./_resources/主账号创建VendorCrossAccountMODELSCOPERolePolicy.png)

This policy can be generated through script editing, with the specific JSON as follows:

**VendorCrossAccountMODELSCOPERolePolicy Specific JSON**
```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "PaiDSW:StartInstance",
        "PaiDSW:CreateInstance",
        "PaiDSW:DeleteInstance",
        "PaiDSW:StopInstance",
        "PaiDSW:ListInstances",
        "PaiDSW:OpenInstance",
        "pai-workspace:CreateWorkspace",
        "paiworkspace:CreateWorkspace",
        "pai:CreateOrder",
        "pai-workspace:ListWorkspaces",
        "paiworkspace:ListWorkspaces"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "bssapi:DescribePricingModule",
        "bss:DescribeProduct"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "bssapi:GetPayAsYouGoPrice",
        "bss:DescribePrice"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "bssapi:ProductCode": [
            "learn"
          ]
        }
      }
    },
    {
      "Effect": "Allow",
      "Action": [
        "oss:GetBucketAcl",
        "oss:GetBucketEncryption",
        "oss:GetBucketInfo",
        "oss:GetBucketInventory",
        "oss:GetBucketLifecycle",
        "oss:GetBucketLocation",
        "oss:GetBucketLogging",
        "oss:GetBucketPolicy",
        "oss:GetBucketReferer",
        "oss:GetBucketReplication",
        "oss:GetBucketReplicationLocation",
        "oss:GetBucketReplicationProgress",
        "oss:GetBucketRequestPayment",
        "oss:GetBucketTagging",
        "oss:GetBucketTransferAcceleration",
        "oss:GetBucketVersioning",
        "oss:GetBucketWebsite",
        "oss:GetBucketWorm",
        "oss:GetLiveChannel",
        "oss:GetLiveChannelStat",
        "oss:GetObject",
        "oss:GetObjectAcl",
        "oss:GetObjectTagging",
        "oss:GetObjectVersion",
        "oss:GetObjectVersionAcl",
        "oss:GetObjectVersionTagging",
        "oss:AbortMultipartUpload",
        "oss:DeleteBucket",
        "oss:DeleteBucketEncryption",
        "oss:DeleteBucketLifecycle",
        "oss:DeleteBucketLogging",
        "oss:DeleteBucketPolicy",
        "oss:DeleteBucketReplication",
        "oss:DeleteBucketTagging",
        "oss:DeleteBucketWebsite",
        "oss:DeleteLiveChannel",
        "oss:DeleteObject",
        "oss:DeleteObjectTagging",
        "oss:DeleteObjectVersion",
        "oss:DeleteObjectVersionTagging",
        "oss:InitiateBucketWorm",
        "oss:PutBucket",
        "oss:PutBucketAcl",
        "oss:PutBucketEncryption",
        "oss:PutBucketInventory",
        "oss:PutBucketLifecycle",
        "oss:PutBucketLogging",
        "oss:PutBucketPolicy",
        "oss:PutBucketReferer",
        "oss:PutBucketReplication",
        "oss:PutBucketRequestPayment",
        "oss:PutBucketTagging",
        "oss:PutBucketTransferAcceleration",
        "oss:PutBucketVersioning",
        "oss:PutBucketWebsite",
        "oss:PutLiveChannel",
        "oss:PutLiveChannelStatus",
        "oss:PutObject",
        "oss:PutObjectAcl",
        "oss:PutObjectTagging",
        "oss:PutObjectVersionAcl",
        "oss:PutObjectVersionTagging",
        "oss:RestoreObject",
        "oss:RestoreObjectVersion",
        "oss:ListLiveChannel",
        "oss:ListMultipartUploads",
        "oss:ListObjects",
        "oss:ListObjectVersions",
        "oss:ListParts"
      ],
      "Resource": [
        "acs:oss:*:*:modelscope-dataset-*",
        "acs:oss:*:*:modelscope-dataset-*/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "oss:ListBuckets",
      "Resource": "acs:oss:*:*:*"
    },
    {
      "Action": [
        "vpc:DescribeVSwitchAttributes",
        "vpc:DescribeVpcAttribute",
        "vpc:DescribeVpcs",
        "vpc:DescribeVSwitches"
      ],
      "Resource": "*",
      "Effect": "Allow"
    },
    {
      "Action": [
        "ecs:CreateNetworkInterface",
        "ecs:DeleteNetworkInterface",
        "ecs:DescribeNetworkInterfaces",
        "ecs:CreateNetworkInterfacePermission",
        "ecs:DescribeNetworkInterfacePermissions",
        "ecs:DeleteNetworkInterfacePermission",
        "ecs:DescribeSecurityGroups"
      ],
      "Resource": "*",
      "Effect": "Allow"
    },
    {
      "Action": [
        "log:PostLogStoreLogs",
        "log:ListProject",
        "log:ListLogStores"
      ],
      "Resource": "*",
      "Effect": "Allow"
    },
    {
      "Action": [
        "cr:GetRepository",
        "cr:GetRepositoryTag",
        "cr:GetAuthorizationToken",
        "cr:PullRepository",
        "cr:GetRepoTagManifest",
        "cr:GetRepositoryManifest",
        "cr:GetArtifactTag",
        "cr:GetInstanceVpcEndpoint",
        "cr:GetInstance",
        "cr:CreateArtifactBuildTask",
        "cr:GetArtifactBuildRule",
        "cr:GetNamespace"
      ],
      "Resource": "*",
      "Effect": "Allow"
    },
    {
      "Action": [
        "fc:InvokeFunction",
        "mns:SendMessage",
        "mns:PublishMessage",
        "eventbridge:PutEvents",
        "mq:PUB",
        "mq:OnsInstanceBaseInfo"
      ],
      "Resource": "*",
      "Effect": "Allow"
    },
    {
      "Action": "fc:*",
      "Resource": "*",
      "Effect": "Allow"
    },
    {
      "Action": "ram:PassRole",
      "Resource": "*",
      "Effect": "Allow",
      "Condition": {
        "StringEquals": {
          "acs:Service": "fc.aliyuncs.com"
        }
      }
    },
    {
      "Action": [
        "ram:Get*",
        "ram:List*",
        "ram:CreateRole",
        "ram:AttachPolicyToRole",
        "ram:GenerateCredentialReport"
      ],
      "Resource": "*",
      "Effect": "Allow"
    },
    {
      "Effect": "Allow",
      "Action": "eas:*",
      "Resource": "*"
    },
    {
      "Action": "ram:CreateServiceLinkedRole",
      "Resource": "*",
      "Effect": "Allow",
      "Condition": {
        "StringEquals": {
          "ram:ServiceName": "eas.pai.aliyuncs.com"
        }
      }
    },
    {
      "Action": "nas:OpenNASService",
      "Resource": "*",
      "Effect": "Allow"
    }
  ]
}
```
---
#### ⚠️ Note
If the main account associated with your RAM account was bound to ModelScope and completed authorization for ModelScope before March 15, 2025, meaning the main account has already created the "VendorCrossAccountMODELSCOPERolePolicy" policy, due to updates in the specific policy content,
the main account associated with your RAM account needs to delete this policy in the console and re-bind with ModelScope, or copy the above JSON to manually update the "VendorCrossAccountMODELSCOPERolePolicy" policy content.

----

2. **Create Role**: Next, the main account needs to create the "VendorCrossAccountMODELSCOPERole" role in the console and grant the newly created policy to this role.

![image.png](./_resources/主账号创建VendorCrossAccountMODELSCOPERoleRole.png)

Then edit the trust policy of this role and paste the policy below.

![image.png](./_resources/编辑信任策略.png)

Specific JSON as follows:
```json
{
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "RAM": [
          "acs:ram::1970854481833065:user/cosplay"
        ]
      }
    }
  ],
  "Version": "1"
}
```

## 2.3 RAM Account Authorization & Cloud Service Usage
For RAM accounts to activate and use cloud services, the prerequisite is that the RAM account needs to obtain console-related permissions for corresponding cloud products like PAI-DSW, FC, etc., and create corresponding roles.

Similarly, you can choose one of the following two methods to achieve these prerequisites:

#### Method 1🌟. Automatic Creation of Permissions and Roles
If the main account associated with the RAM account has already been bound to ModelScope and completed (section 1.2 mentioned) authorization for ModelScope, as well as (section 1.3 mentioned) activation & authorization for related cloud services.

Then the RAM account only needs to complete the Alibaba Cloud account binding on the ModelScope page and can use the corresponding cloud services on ModelScope (through the ProvisionExternalApplicationPolicy permission granted by the main account).

#### Method 2: Main Account Manually Activates in Alibaba Cloud Console
Method 2 is relatively complex and requires the main account user to actively search for products like PAS-DSW, FC, etc., in the console for manual activation. The system will create the corresponding console permissions and roles during the process.

> **Taking PAI-DSW as an example:**
1. Search for product PAI-DSW on the Alibaba Cloud page and enter the console.

![image.png](./_resources/PAI.png)

2. Perform authorization operation

![image.png](./_resources/PAI授权.png)

3. After authorization completion, the following roles will be added to the RAM console

![image.png](./_resources/PAI新增角色.png)
![image.png](./_resources/PAI新增角色2.png)

4. Activate service

![image.png](./_resources/PAI开通服务.png)

> **Taking FC Function Compute as an example:**
1. Search for FC Function Compute on the Alibaba Cloud page and enter the console.

![image.png](./_resources/FC.png)

After activation and entering the console, a pop-up box for creating "AliyunFcDefaultRole" or "AliyunServiceRoleForFC" role will appear, which can be created by default.

2. Create "AliyunFCServerlessDevsRole" role in RAM console

![image.png](./_resources/AliyunFCServerlessDevsRole.png)
![image.png](./_resources/AliyunFCServerlessDevsRole2.png)

> Role content:
> Precise authorization: AliyunFCDefaultRolePolicy, AliyunFCServerlessDevsRolePolicy
> Additional authorization: AliyunFCFullAccess, AliyunNASFullAccess, AliyunLogReadOnlyAccess, AliyunVPCReadOnlyAccess, AliyunECSReadOnlyAccess, AliyunOSSReadOnlyAccess

Note: Application Center requires your role to contain policies needed by the application. It is recommended to create and use the system default role AliyunFCServerlessDevsRole.

> **Taking NAS File Storage as an example:**

1. Search for NAS on the Alibaba Cloud page and click "Activate Now".

![image.png](./_resources/NAS.png)

Afterwards, return to the corresponding service entry on the ModelScope page and refresh. The RAM account can then use the corresponding cloud services.