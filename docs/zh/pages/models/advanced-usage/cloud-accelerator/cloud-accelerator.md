<!-- modelscope-docs: 阿里云内网环境加速 | models/advanced-usage/cloud-accelerator/cloud-accelerator_CN.md -->

# 阿里云内网加速接入文档

# 背景

为了加速用户在阿里云环境下使用魔搭时的模型下载速度，魔搭在阿里云的多个地域提供了PVL（PrivateLink）内网加速方案。通过内网访问的方式不仅能够带来极速的下载体验及上传体验，同时又能极大的节省用户的带宽费用，并提升网络链路的稳定性。

# 支持加速地域

目前各地域的内网加速支持情况为：

| 地域      |  SDK下载加速  |  Git下载加速  |  Git-LFS文件上传加速  | SDK上传加速  | RegionId | 
|---------| --- | --- | --- | --- | --- |
| 杭州      |  ✅  |  ✅  |  ✅  |  ✅  | cn-hangzhou |
| 上海*     |  ✅  |  ✅  |  ✅  |  ✅  | cn-shanghai |
| 北京*     |  ✅  |  ✅  |  ✅  |  ✅  | cn-beijing |
| 张家口     |  ✅  |  ✅  |  ✅  |  ✅  | cn-zhangjiakou |
| 乌兰察布    |  ✅  |  ✅  |  ✅  |  ✅  | cn-wulanchabu |
| 美国（硅谷）* |  ✅  |  ✅  |  ✅  |  ✅  | us-west-1 |

其中**杭州、张家口、乌兰察布**几个区域支持全量所有模型的内网加速。其他的区域则为动态**部分选择性加速**。如果在已经报备过内网加速后，在所在区域仍遇到具体模型不支持内网加速的情况，可以写email联系contact@modelscope.cn ，申请将此模型加入内网加速的范畴。平台将综合考虑酌情进行支持。

> [!NOTE]
> 除了PVL之外，在云上环境使用ModelScope SDK或CLI进行模型下载时，
> 平台会自动判断云上region，来实现oss内网加速。但是针对部分无法自动获取region信息的环境，
> 也可以**通过配置环境变量**`INTRA_CLOUD_ACCELERATION_REGION`为上述region-id来获取加速效果。

各地域PVL终端服务名称：
- 杭州
  - com.aliyuncs.privatelink.cn-hangzhou.epsrv-bp1c4c0gx3jtgc7e5nv5
  - com.aliyuncs.privatelink.cn-hangzhou.epsrv-bp14tp9tn8lt8th518r5
- 上海
  - com.aliyuncs.privatelink.cn-shanghai.epsrv-uf6gs6s6yziowwc0f3by
  - com.aliyuncs.privatelink.cn-shanghai.epsrv-uf62pdcorqdt43e04kio
- 北京
  - com.aliyuncs.privatelink.cn-beijing.epsrv-2zelsxxkdnorzwr227vh
  - com.aliyuncs.privatelink.cn-beijing.epsrv-2zeeckb5ctw1vhrw7xp8
- 张家口
  - com.aliyuncs.privatelink.cn-zhangjiakou.epsrv-8vb3mcyuxd4th912159k
  - com.aliyuncs.privatelink.cn-zhangjiakou.epsrv-8vbkgy1ygoiri8e879ss
- 乌兰察布
  - com.aliyuncs.privatelink.cn-wulanchabu.epsrv-0jlfpt0n07y08njng076
- 美国（硅谷）
  - com.aliyuncs.privatelink.us-west-1.epsrv-rj9bfqwe4r3sfmepvwi7


# 加速申请说明

您可直接根据如下**PrivateLink内网打通**中的说明进行网络打通，平台会**自动通过连接创建申请**。

但请务必在完成相关创建后，发送备案邮件至 <contact@modelscope.cn>。如未报备，ModelScope平台在遭遇未预期流量时，**可能对于未备案的链接进行管控**。
报备邮件内如请附带以下详细信息：

*   魔搭账号ID
*   阿里云主账号UID
*   联系方式
*   申请主体：
    *   个人 
    *   公司（请填写真实公司名称）
*   终端节点的地域和交换机可用区 
*   预估下载及上传并发 
*   申请原因

# PrivateLink内网打通

以下为阿里云产品PrivateLink的大致使用方式，详细说明请查看该产品的官方文档：[私网连接 PrivateLink](https://help.aliyun.com/product/120462.html?spm=a2c4g.43185.0.i2)

同时需要注意：

*   通过Privatelink进行模型下载加速时，您需要向Privatelink支付经过Privatelink服务节点的流量费用。收费方式为参见[产品计费文档](https://help.aliyun.com/document_detail/198081.html)。
    

## 选择对应地域

![image](./_resources/80aead50-6974-4569-93e2-63e3c9a51669.png)

## 创建终端节点

![image](./_resources/20250225222916.jpg)

## 获取VPC内网地址

![image](./_resources/04cad7a2-a0a0-47fc-a652-c84d6ba72f8d.png)

## 配置本地DNS解析

当获取vpc内网地址后，将www.modelscope.cn域名**指向该地址**即可。

方法一：修改本地hosts文件，适用于单机情况

    echo '{这里换成你在上一步获取的内网地址} www.modelscope.cn' >> /etc/hosts

方法二：使用阿里云DNS相关产品，如：[内网DNS解析 (PrivateZone)](https://help.aliyun.com/document_detail/2592934.html)，该方案能够修改整个用户VPC内的域名解析。

## 上传或下载

完成上述所有步骤后，无需改变ModelScope的使用方式，在您配置好的机器或者VPC内即可享受到内网加速。

# CEN加速
非全量模型地域，除了上述加速方式外，您还可以参考[CEN加速方案](../跨地域内网加速下载（CEN）.md)来加速下载。
