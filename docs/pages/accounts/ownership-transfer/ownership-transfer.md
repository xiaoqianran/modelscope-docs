<!-- modelscope-docs: Model and Dataset Owner Permission Transfer | accounts/ownership-transfer/ownership-transfer_EN.md -->

This article introduces how to manage organization model and dataset owner permissions when organizational members undergo role changes.

# Owner Permission Definition
If a developer creates a model or dataset under an organization identity, they are granted owner permissions for that model or dataset.<br />Model/Dataset owners have the following operational permissions:

- **File operation permissions (view, add, modify) and detail editing permissions for their owned models/datasets**
- Visibility of all models/datasets/studios belonging to the organization (regardless of whether they are private)
- **Reply to model comments on their owned models**
- Other permissions granted based on their organization identity (read-only, edit, or admin)

Owner permissions are managed at the granularity of individual models and individual datasets. The original model/dataset owner and administrators can perform permission transfer operations, which means removing the original owner's owner permissions for the corresponding model/dataset and granting organization members owner permissions for that model/dataset.<br />

# Owner Permission Transfer
Organization administrators or model owners can find the permission transfer entry point on the model details page.<br>
![image.png](./_resources/1666855278677-181c0f65-d98b-46a6-b36a-99ba20b4f39c.png)<br>After clicking, a pop-up window will prompt you to select the transfer recipient. Simply enter the username of the transfer recipient. The transfer recipient must be a **member of the organization that created the model/dataset**.<br>
![image.png](./_resources/1666855414098-24043fe8-831c-468c-b321-e83466277932.png)