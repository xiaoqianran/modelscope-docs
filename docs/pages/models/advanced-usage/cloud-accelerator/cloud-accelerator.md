<!-- modelscope-docs: Alibaba Cloud Intranet Acceleration | models/advanced-usage/cloud-accelerator/cloud-accelerator_EN.md -->

# Alibaba Cloud Intranet Acceleration Documentation

# Background

To accelerate model download speeds for users accessing ModelScope within Alibaba Cloud environments, ModelScope provides PrivateLink (PVL) intranet acceleration solutions across multiple Alibaba Cloud regions. Accessing via intranet not only delivers ultra-fast download and upload experiences but also significantly reduces users' bandwidth costs while enhancing network link stability.

# Supported Acceleration Regions

Current intranet acceleration support status by region:

| Region | SDK Download Acceleration | Git Download Acceleration | Git-LFS File Upload Acceleration | SDK Upload Acceleration | RegionId |
|---------| --- | --- | --- | --- | --- |
| Hangzhou | ✅ | ✅ | ✅ | ✅ | cn-hangzhou |
| Shanghai* | ✅ | ✅ | ✅ | ✅ | cn-shanghai |
| Beijing* | ✅ | ✅ | ✅ | ✅ | cn-beijing |
| Zhangjiakou | ✅ | ✅ | ✅ | ✅ | cn-zhangjiakou |
| Ulanqab | ✅ | ✅ | ✅ | ✅ | cn-wulanchabu |
| US (Silicon Valley)* | ✅ | ✅ | ✅ | ✅ | us-west-1 |

The regions **Hangzhou, Zhangjiakou, and Ulanqab** support full intranet acceleration for all models. Other regions provide dynamic **selective partial acceleration**. If you encounter specific models that don't support intranet acceleration in your region even after filing for intranet acceleration, please email contact@modelscope.cn to request inclusion of this model in the intranet acceleration scope. The platform will consider such requests on a case-by-case basis.

> [!NOTE]
> Besides PVL, when using ModelScope SDK or CLI for model downloads in cloud environments,
> the platform automatically detects the cloud region to enable OSS intranet acceleration. However, for environments where region information cannot be automatically obtained,
> you can also achieve acceleration effects by **configuring the environment variable** `INTRA_CLOUD_ACCELERATION_REGION` with the region-id listed above.

PrivateLink endpoint service names by region:
- Hangzhou
  - com.aliyuncs.privatelink.cn-hangzhou.epsrv-bp1c4c0gx3jtgc7e5nv5
  - com.aliyuncs.privatelink.cn-hangzhou.epsrv-bp14tp9tn8lt8th518r5
- Shanghai
  - com.aliyuncs.privatelink.cn-shanghai.epsrv-uf6gs6s6yziowwc0f3by
  - com.aliyuncs.privatelink.cn-shanghai.epsrv-uf62pdcorqdt43e04kio
- Beijing
  - com.aliyuncs.privatelink.cn-beijing.epsrv-2zelsxxkdnorzwr227vh
  - com.aliyuncs.privatelink.cn-beijing.epsrv-2zeeckb5ctw1vhrw7xp8
- Zhangjiakou
  - com.aliyuncs.privatelink.cn-zhangjiakou.epsrv-8vb3mcyuxd4th912159k
  - com.aliyuncs.privatelink.cn-zhangjiakou.epsrv-8vbkgy1ygoiri8e879ss
- Ulanqab
  - com.aliyuncs.privatelink.cn-wulanchabu.epsrv-0jlfpt0n07y08njng076
- US (Silicon Valley)
  - com.aliyuncs.privatelink.us-west-1.epsrv-rj9bfqwe4r3sfmepvwi7


# Acceleration Application Instructions

You can directly follow the instructions below under **PrivateLink Intranet Connection Setup** to establish network connectivity, and the platform will **automatically approve connection creation requests**.

However, please ensure to send a filing email to <contact@modelscope.cn> after completing the relevant setup. If not filed, the ModelScope platform **may restrict unfiled connections** when encountering unexpected traffic.
Please include the following detailed information in your filing email:

*   ModelScope Account ID
*   Alibaba Cloud Primary Account UID
*   Contact Information
*   Applicant Type:
    *   Individual
    *   Company (please provide actual company name)
*   Endpoint region and VSwitch availability zone
*   Estimated download and upload concurrency
*   Reason for application

# PrivateLink Intranet Connection Setup

Below is a general overview of using Alibaba Cloud's PrivateLink product. For detailed instructions, please refer to the official product documentation: [PrivateLink](https://help.aliyun.com/product/120462.html?spm=a2c4g.43185.0.i2)

Please also note:

*   When using PrivateLink for model download acceleration, you will be charged by PrivateLink for traffic passing through PrivateLink service nodes. Pricing details can be found in the [product billing documentation](https://help.aliyun.com/document_detail/198081.html).


## Select Corresponding Region

![image](./_resources/80aead50-6974-4569-93e2-63e3c9a51669.png)

## Create Endpoint

![image](./_resources/20250225222916.jpg)

## Obtain VPC Intranet Address

![image](./_resources/04cad7a2-a0a0-47fc-a652-c84d6ba72f8d.png)

## Configure Local DNS Resolution

After obtaining the VPC intranet address, simply **point the domain www.modelscope.ai to this address**.

Method 1: Modify local hosts file (suitable for single-machine scenarios)

    echo '{replace this with the intranet address obtained in the previous step} www.modelscope.ai' >> /etc/hosts

Method 2: Use Alibaba Cloud DNS products such as [PrivateZone](https://help.aliyun.com/document_detail/2592934.html), which allows modifying domain name resolution across your entire VPC.