<!-- modelscope-docs: Organization Permission Description | accounts/org-permission/org-permission_EN.md -->

This article introduces the operational permissions corresponding to different organization roles.

# Organization Permission List

| Role Type | Role | Page Control | Feature Control |
| --- | --- | --- | --- |
| Organization Management Roles | Organization Administrator<br />admin | 【Organization's Models/Datasets/Studios Settings Page】<br />1. Can modify basic information<br />2. Can delete and modify visibility<br />【List Page】<br />2. All models/datasets/studios belonging to the organization are visible (regardless of whether they are private)<br />【Model Details Page】<br />1. Can see all comments, with reply and delete buttons<br />2. Can see the "Model Files" page (new) | 1. Organization models/datasets/studios operation permissions (view, add, modify, delete, modify visibility)<br />2. Add and manage members<br />3. Edit organization basic information<br />4. Reply to and delete comments on models under the organization namespace<br />5. Create new organizations |
|  | Model/Dataset<br />Creator<br />owner  | 【Organization's Models/Datasets/Studios Settings Page】<br />1. Can modify basic information<br />【List Page】<br />2. All models/datasets/studios belonging to the organization are visible (regardless of whether they are private)<br />【Model Details Page】<br />1. Can see all comments, with reply and delete buttons<br />2. Can see the "Model Files" page (new) | 1. Organization models/datasets/studios operation permissions (view, add, modify)<br />2. Edit organization basic information<br />3. Reply to and delete comments on models owned by the creator |
|  | Organization Contributor<br />write | 【Organization's Models/Datasets/Studios Settings Page】<br />1. Can modify basic information<br />【List Page】<br />2. All models/datasets/studios belonging to the organization are visible (regardless of whether they are private)<br />2. Can see the "Model Files" page (new) | 1. Organization models/datasets/studios operation permissions (view, add, modify, modify visibility)<br />2. Edit organization basic information |
|  | Organization Participant<br />read | 【List Page】<br />1. All models/datasets/studios belonging to the organization are visible (regardless of whether they are private)<br />2. Can see the "Model Files" page (new) | 1. Organization models/datasets/studios operation permissions (view) |
| Personal Roles | Model/Dataset<br />Creator | 【Organization's Models/Datasets/Studios Settings Page】<br />1. Can modify basic information<br />【List Page】<br />2. All public models/datasets/studios are visible | 1. Own models/datasets/studios operation permissions (view, add, delete, modify, modify visibility)<br />2. Create new organizations |

# Detailed Organization Permission Description
## Admin Permissions
Admin is the administrator of the repository.

- Administrators can add new members and assign admin, write, or read permissions to members. Administrators can also set their own permissions to write or read.
- Administrators can create new models.
- Administrators can search for all models under the organization, regardless of whether the model is private.
- Administrators can edit all model files under the organization and have merge permissions.
- Administrators can modify the repository's settings information.
- **Administrators can delete the repository.**

## Member Permissions
Member permissions are divided into write (edit) and read (read-only).
### Write Permissions (Edit Permissions)

- Can search for all models under the organization, regardless of whether the model is private.
- Can create new models.
- Can edit all model repository files under the organization and have merge permissions.
- Can edit model settings information.
- **Cannot modify model repository visibility permissions. (Only admins can modify)**
- **Cannot delete the repository. (Only admins can delete; model owners cannot delete)**
### Read Permissions (Read-only Permissions)

- Can search for all models under the repository, regardless of whether the model is private. Can edit files and submit PRs, but without merge permissions.
- Cannot modify settings content.
- Cannot delete models.