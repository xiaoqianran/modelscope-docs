<!-- modelscope-docs: Notebook Common Questions | faq/notebooks/notebooks_EN.md -->

# Notebook Common Questions

This document compiles common questions encountered during the use of ModelScope Notebooks, hoping to resolve your doubts during usage.

### Q: Authorization failed, please try again
![image.png](./_resources/a.png)<br />If you encounter the error "Authorization failed, please try again" when binding your Alibaba Cloud account, it is because the authorization information was incomplete during authorization. You need to check all options to authorize normally. You can try rebinding and checking all options during authorization.<br />![image.png](./_resources/b.png)

### Q: You have not bound an Alibaba Cloud account, cannot use, please authorize and try again
If you encounter the error "You have not bound an Alibaba Cloud account, cannot use, please authorize and try again" when using the Notebook, it is because you have not bound an Alibaba Cloud account. You can bind an Alibaba Cloud account in **Personal Center > My Notebook** according to the prompts, and then open the Notebook.<br />![image.png](./_resources/c.png)

### Q: Current Alibaba Cloud account does not match the associated account, please log in with the associated Alibaba Cloud account and try again
![image.png](./_resources/d.png)<br />If you encounter the error "Current Alibaba Cloud account does not match the associated account, please log in with the associated Alibaba Cloud account and try again" when using the Notebook, it is because the currently logged-in Alibaba Cloud account does not match the Alibaba Cloud account used during initial ModelScope binding.<br />The associated bound Alibaba Cloud account can be viewed in **Personal Center > My Notebook**, and they need to remain consistent to properly open the Notebook<br />![image.png](./_resources/e.png)
### Q: This Alibaba Cloud account has already been bound to a ModelScope account, please try again
If you receive the error message "This Alibaba Cloud account has already been bound to a ModelScope account, please try again" when authorizing and binding an Alibaba Cloud account, it indicates that the Alibaba Cloud account has already been bound to a ModelScope account. You can try with another Alibaba Cloud account. Unbinding and changing bindings are not supported in the current version, please stay tuned.
### Q: Please use the Alibaba Cloud primary account for association
If you receive the error message "Please use the Alibaba Cloud primary account for association" when authorizing and binding an Alibaba Cloud account, it indicates that the current binding account is not a primary account. ModelScope requires that the bound Alibaba Cloud account be an Alibaba Cloud primary account. Please switch to an Alibaba Cloud primary account and try again.

### Q: What to do if opening an instance takes a long time?
Due to machine resources needing to queue, and each instance requiring pre-installation of the official ModelScope image, instance opening typically takes within 2 minutes. Please be patient. If the waiting time is too long, please join the **ModelScope Developer Alliance DingTalk Group** to contact administrators for resolution.
<br />Scan the DingTalk QR code to join the Developer Alliance group:

<img width="228" src="https://modelscope-docs-dev.oss-cn-hangzhou.aliyuncs.com/static/dingding.png">

### Q: What happens if the instance startup time exceeds 4 hours and the instance is closed?
To avoid resource waste, the system has a 4-hour silent closure setting. If the runtime of a single instance startup will exceed 4 hours, please save your pynb files in advance, and ensure that other data files have been saved to persistent storage according to the instructions in [Notebook Feature Introduction](../Notebook/Notebook%E4%BB%8B%E7%BB%8D.md), then return to **Personal Console > My Notebook** to restart the instance to continue development.

### Q: What to do when GPU free quota is used up?
Please refer to the documentation [Handling when Free Resource Quota is Exhausted](../Notebook/Notebook%E4%BB%8B%E7%BB%8D.md#handling-when-free-resource-quota-is-exhausted).

### Q: What to do if errors occur during instance startup or shutdown?
Please pay attention to the error codes within the page, join the **ModelScope Developer Alliance DingTalk Group**, and provide the following information to the group administrators:

- Username
- Error type and error code
- Instance type started: CPU or GPU
- Instance URL

After submitting error information, we will have dedicated personnel follow up on your issue and resolve it. Thank you for your feedback and support. Scan DingTalk QR code to report issues

<img width="228" src="https://modelscope-docs-dev.oss-cn-hangzhou.aliyuncs.com/static/dingding.png">


### Q: If I accidentally close the Notebook page, will the instance close?
If you have opened this instance for less than 4 hours, and idle time does not exceed 1 hour, your created instance will not close. You can return to **Personal Console > My Notebook** and click the **View notebook** button to reopen the instance interface.<br />Of course, if you no longer use the Notebook feature, it is strongly recommended that you manually close the instance to avoid ineffective resource waste.<br />![image.png](./_resources/h.png)

### Q: After closing the instance and restarting, will the dependency packages I downloaded in Notebook and the files I saved still be retained?
Due to the need to maintain official images, any dependency packages you download after opening an instance are only valid during this instance startup process. After you close the instance and restart it, the dependency packages you downloaded will be automatically cleared and need to be re-downloaded. For data that needs to be persistently saved, please follow the instructions in [Notebook Feature Introduction](../Notebook/Notebook%E4%BB%8B%E7%BB%8D.md) and save to persistent storage.

### Q: How is GPU resource consumption timed?
GPU resources begin timing after instance startup and automatically stop after closure. So if you no longer use the Notebook feature, be sure to close the instance to avoid consuming free quota and wasting resources.

### Q: What happens if my storage files exceed the limit?
If your storage exceeds the limit, you will not be able to continue writing and will receive an error prompt. If you have greater cloud storage needs, it is recommended to go to the Alibaba Cloud console to purchase paid Notebook instances.

### Q: Does Notebook currently support mounting your own NAS?
Currently commercialized Notebooks can mount NAS themselves. The platform's free trial notebooks do not support mounting NAS from your own cloud account.

### Q: Other questions or suggestions for the ModelScope community
ModelScope aims to create the next generation of open-source model-as-a-service sharing platforms, providing flexible, easy-to-use, low-cost, one-stop model service products for AI developers. We look forward to hearing more voices from developers, whether you are beginners in algorithms or industry experts. You can join our DingTalk group (44837352) to provide your valuable suggestions and questions.
<img width="228" src="https://modelscope-docs-dev.oss-cn-hangzhou.aliyuncs.com/static/dingding.png">