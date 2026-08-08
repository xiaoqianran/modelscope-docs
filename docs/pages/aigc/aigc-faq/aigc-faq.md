<!-- modelscope-docs: AIGC Zone FAQ | aigc/aigc-faq/aigc-faq_EN.md -->

# FAQ Compilation

📢 Thank you all for your enthusiasm and support for ModelScope AIGC Zone models. Here we have compiled some common questions encountered during the use of the AIGC Zone.

### Q1: Why has my training task been queued for a long time but still shows "Waiting"?
Each training task is assigned a corresponding priority. Training tasks that meet the following conditions have the highest priority: (1) The first training task of each user on that day; (2) Training tasks with models set to public. Tasks that do not meet these two conditions have lower priority and will be queued behind other high-priority training tasks.

### Q2: Why did my training task fail after running for a long time?
Each training task has a maximum training time limit. If this time limit is exceeded, the training task will be automatically terminated. The platform ensures that this training time limit is sufficient to meet the requirements of a normal LoRA training duration.

### Q3: Why can't I train anymore / Why has my training quota been reduced?
Please strictly follow the usage guidelines for models obtained using the open-source community's free training resources. When moving models to other platforms, **please clearly indicate that the model source is "ModelScope AIGC Zone"**. The platform reserves the right to restrict accounts of users who violate these guidelines.

### Q4: Do I own the models trained using ModelScope AIGC's free resources?
According to the community user agreement guidelines, content generated through the ModelScope platform's AIGC Zone, including trained LoRA models as well as images and videos, is **jointly owned by the original creator and the ModelScope platform**. When reposting, please clearly indicate that the content source is from "ModelScope AIGC Zone" and include the original author's information. This is basic respect for the community as a whole and the creator's work, and is also an important principle for maintaining a healthy community ecosystem. If this fundamental principle is violated, the platform reserves the right to take action and hold accountable.