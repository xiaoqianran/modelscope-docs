<!-- modelscope-docs: 阿里云账号绑定与授权教程 | accounts/aliyun-binding-and-authorization/aliyun-binding-and-authorization_CN.md -->

本教程将指导您在魔搭社区上完成阿里云主账号和RAM（Resource Access Management）账号与魔搭账号的绑定及授权，确保您能顺利使用ModelScope上对应云服务。

# 1. 主账号绑定与授权流程
## 1.1 主账号绑定

1. **点击立即绑定**：访问魔搭社区并找到绑定阿里云账号的对应入口，如右上角头像下拉栏处的"绑定阿里云账号"选项。

![image.png](./_resources/立即绑定.png)

2. **登录阿里云账号**：如果您已经事先登陆了阿里云，可忽略。如果您之前未注册过阿里云，请根据页面引导注册。

![image.png](./_resources/登陆阿里云.png)

3. **授权绑定**：登录后，在弹出的授权页面中勾选所有选项以完成绑定。请注意，必须选择全部权限才能成功授权。

![image.png](./_resources/授权绑定.png)

如此一来，您的阿里云主账号就已经顺利完成了与魔搭账号的绑定。

## 1.2 主账号授权ModelScope
1. **点击授权ModelScope**：在魔搭社区对应的服务入口（如我的Notebook、模型服务等页面），点击“去授权”按钮。

![image.png](./_resources/去授权.png)

2. **跳转授权页面**：系统会自动跳转至阿里云授权页面，按照页面提示操作，确认授权给ModelScope使用对应云服务。

![image.png](./_resources/同意授权.png)

3. **完成授权**：完成上述授权操作后，系统会自动跳回魔搭对应服务页面，表示授权成功。

## 1.3 主账号开通&使用云服务

1. **点击开通并授权**：在魔搭社区对应的服务入口（如我的Notebook、模型服务等页面），点击“开通并授权”按钮。

![image.png](./_resources/开通并授权.png)

2. **开通并授权对应云服务**：ModelScope会基于之前的授权，完成对应云服务的开通。
3. **完成授权**：完成上述授权操作后，您就可以基于绑定的阿里云账号创建对应的云服务实例了。相关费用可前往阿里云控制台查看。

![image.png](./_resources/完成云服务授权.png)


# 2. RAM账号绑定与授权流程
## 2.1 RAM账号绑定
为了使RAM账号能够访问ModelScope，需要先创建适当的策略和角色：
1. **创建策略**：主账号在 [RAM控制台](https://ram.console.aliyun.com/overview) 新增名为"ProvisionExternalApplicationPolicy"的自定义策略。  
此策略可通过脚本编辑生成，具体JSON如下：

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
2. **授权策略**：将"ProvisionExternalApplicationPolicy"策略授权给需要访问ModelScope的RAM用户。

![image.png](./_resources/RAM授权策略.png)

> 如果您的RAM账号已经拥有AliyunRamFullAccess权限，则可以直接跳过此步骤。**但请注意，AliyunRamFullAccess是一个高权限设置**，使用时需谨慎考虑安全风险。

3. **完成绑定**：访问魔搭社区并找到绑定阿里云账号的对应入口，点击"绑定阿里云账号"，按照页面常规提示操作，即可完成阿里云RAM账号与魔搭账号的绑定。

## 2.2 RAM账号授权ModelScope
对于RAM用户的授权，前提依赖是创建两个特定策略和角色。您可以选择以下两种方法之一来实现这些前置依赖：
#### 方法一🌟：自动创建权限与角色
如果RAM账号关联的主账号已与魔搭进行绑定，并完成了(1.2中提及的)对Modelscope的授权，此时系统已经为主账号创建了"VendorCrossAccountMODELSCOPERolePolicy"策略和"VendorCrossAccountMODELSCOPERole"角色。

那么当您的RAM账号在魔搭页面点击"去授权"按钮时，系统会自动获取所需的控制台权限和角色，确认授权给ModelScope。

![image.png](./_resources/完成授权.png)

#### 方法二：主账号手动创建
方法二相对复杂，需要主账号登陆控制台并创建名为VendorCrossAccountMODELSCOPERolePolicy的策略，赋予RAM账号必要的权限来操作ModelScope相关授权。

1. **创建策略**：主账号登录控制台创建"VendorCrossAccountMODELSCOPERolePolicy"策略

![image.png](./_resources/主账号创建VendorCrossAccountMODELSCOPERolePolicy.png)

此策略可通过脚本编辑生成，具体JSON如下：

**VendorCrossAccountMODELSCOPERolePolicy策略具体JSON**
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
#### ⚠️ 注意
如果您RAM账号关联的主账号在2025年3月15日前已与魔搭进行绑定，并完成了对Modelscope的授权，即主账号已经创建了"VendorCrossAccountMODELSCOPERolePolicy"策略，由于策略具体内容的更新，
您RAM账号关联的主账号需要在控制台删除该策略重新已与魔搭进行绑定，或者复制上述JSON去手动更新"VendorCrossAccountMODELSCOPERolePolicy"策略内容。

----


2. **创建角色**：接着主账号需要在控制台创建"VendorCrossAccountMODELSCOPERole"角色，并将刚刚创建的策略授权给该角色。

![image.png](./_resources/主账号创建VendorCrossAccountMODELSCOPERoleRole.png)

然后编辑该角色的信任策略，将下方的策略粘贴进去。

![image.png](./_resources/编辑信任策略.png)

具体JSON如下：
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


## 2.3 RAM账号授权&使用云服务
RAM账号开通并使用云服务，前置依赖是RAM账号需要获得PAI-DSW、FC等对应云产品的控制台相关权限并创建对应角色。

同样的，您可以选择以下两种方法之一来实现这些前置依赖：

#### 方法1🌟. 自动创建权限与角色
如果RAM账号关联的主账号已与魔搭进行绑定，并完成了(1.2中提及的)对Modelscope的授权，以及(1.3中提及的)对相关云服务的开通&授权。

那么RAM账号仅需要在魔搭页面完成阿里云账号绑定后，就可以（通过主账号授予的ProvisionExternalApplicationPolicy权限）在魔搭页面使用对应云服务了。

#### 方法2：主账号在阿里云控制台自主开通
方法二相对复杂，需要主账号用户在控制台主动搜索PAS-DSW、FC等产品进行主动开通，系统在过程中会创建好对应的控制台权限与角色。

> **以PAI-DSW为例：**
1. 阿里云页面搜索产品PAI-DSW，进入控制台。

![image.png](./_resources/PAI.png)

2. 进行授权操作

![image.png](./_resources/PAI授权.png)

3. 授权完成后RAM控制台会新增如下角色

![image.png](./_resources/PAI新增角色.png)
![image.png](./_resources/PAI新增角色2.png)

4. 开通服务

![image.png](./_resources/PAI开通服务.png)

> **以FC函数计算为例：**
1. 阿里云页面搜索FC函数计算，进入控制台。

![image.png](./_resources/FC.png)

开通进入控制台后，会弹出创建"AliyunFcDefaultRole"或"AliyunServiceRoleForFC"角色的弹出框，默认创建即可。

2. RAM控制台创建"AliyunFCServerlessDevsRole"角色

![image.png](./_resources/AliyunFCServerlessDevsRole.png)
![image.png](./_resources/AliyunFCServerlessDevsRole2.png)

> 角色内容：
> 精确授权：AliyunFCDefaultRolePolicy、AliyunFCServerlessDevsRolePolicy
> 新增授权：AliyunFCFullAccess、AliyunNASFullAccess、AliyunLogReadOnlyAccess、AliyunVPCReadOnlyAccess、AliyunECSReadOnlyAccess、AliyunOSSReadOnlyAccess 

备注：应用中心需要您的角色中包含应用所需策略，推荐创建并使用系统默认角AliyunFCServerlessDevsRole。

> **以NAS文件存储为例：**

1.阿里云页面搜索NAS，点击立即开通。

![image.png](./_resources/NAS.png)

之后，回到魔搭页面对应服务入口并进行刷新，RAM账号就可以使用对应云服务了。