<!-- modelscope-docs: New Editor | notebook/new-editor/new-editor_EN.md -->

# New Editor

## Editor Entry

My Notebook: Click "View Notebook" and select "Try New Version"

![image.png](./_resources/entry.png)

## Instance Non-Runtime Mode

In non-runtime mode, the editor will always display a ModelScope WorkSpace directory.

- ModelScope WorkSpace Directory: The storage space corresponding to the user account, associated with the user account, always displayed. Currently, it only supports creating and storing ipynb files.

![image.png](./_resources/common.png)

## Instance Runtime Mode

### Connect to Runtime

Click "Connect to Runtime" in the upper right corner and select an instance.

- CPU Type: 8 cores 32GB, long-term valid
- GPU Type: 8 cores 32GB, 24GB VRAM; New users get 32 hours of free quota

![image.png](./_resources//connect-runtime.png)

### Editor Modules

After connecting to the runtime, it supports interaction with the instance terminal, instance status display, sidebar /mnt/workspace file management, etc.

- Instance /mnt/workspace File Directory: The persistent storage file directory within the instance, bound to the current instance, only displayed after connecting to the runtime.

![image.png](./_resources/runtime.png)

### View Running Instance

After the instance runs successfully, move the mouse to the "Instance Running" button to enter the current running instance, or stop the running instance manually.

![image.png](./_resources/view-instance.png)

## Share Files to Gallery

For all ipynb files in the editor, you can click the "Share to Gallery" button in the upper right corner to share the current ipynb file to Gallery.
![image.png](./_resources/share-to-gallery.png)

## Temporary Workspace Files

When entering the editor from certain ModelScope pages, a temporary workspace directory will be automatically created. Files in this directory will not be persisted.

- Temporary Workspace Files: Files in the temporary workspace directory can be modified and run, but will not be saved. If you need to save files, you can copy them to the ModelScope WorkSpace directory.

### Example: Edit Gallery Source Files

Click "Edit Source File" in Gallery to enter the editor:
![image.png](./_resources/edit-gallery-example-1.png)

Corresponding temporary files for the Gallery will be generated in the editor's left directory:
![image.png](./_resources/edit-gallery-example-2.png)
