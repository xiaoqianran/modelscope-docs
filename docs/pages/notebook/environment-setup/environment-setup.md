<!-- modelscope-docs: Notebook Environment Configuration and Management | notebook/environment-setup/environment-setup_EN.md -->

# Configuring and Using Conda Environment
Conda is an open-source package management and environment management system. With Conda, you can create and manage multiple independent development environments to avoid interference between them. In Python and other language development processes, using Conda for environment preservation and isolation is a common practice.

In ModelScope Notebook (PAI-DSW version), persistent storage support is provided (see the **Storage Description** section in [Notebook Introduction](./Notebook介绍.md) for details), which provides the foundation for cross-session Conda environment persistence. However, general Conda installation methods will become invalid after ModelScope Notebook is closed and restarted due to default installation paths and configuration reasons. This article explains how to install and configure Conda so that your development environment configuration can be maintained across different ModelScope Notebook sessions.

Conda has multiple distribution versions. Here we use Miniconda as an example, and other versions are similar.

## Installing Conda
ModelScope Notebook runs on a Linux environment, so first you need to obtain the Miniconda Linux installation package. You can download the installation package `Miniconda3-latest-Linux-x86_64.sh` from the [Miniconda official website](https://docs.anaconda.com/miniconda/) and ensure it is executable:

```sh
# Download link is for example purposes; please use the official site's installation script link in practice
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
chmod +x Miniconda3-latest-Linux-x86_64.sh
```
Miniconda allows users to specify the installation path during the installation process. After downloading the Miniconda installation package, you can specify the installation directory using the `-p` or `--prefix` parameter when running the installation command. We need to ensure it is installed under the Notebook's default storage path `/mnt/workspace`, **because only files under this path will be persistently saved**.

Specifically, if we want to install it to the `/mnt/worksapce/miniconda3` directory, we can use the following command:

```sh
!bash Miniconda3-latest-Linux-x86_64.sh -b -p /mnt/workspace/miniconda3
```
Here:
- `-p` specifies the complete path where you want to install Miniconda.
- `-b` indicates running the installer in batch mode without interactive prompts during installation.

This installation will take some time on the Notebook, please wait until it completes.

## Initializing Conda
When manually specifying the installation path, you need to explicitly call the `conda` binary for initialization after installation:
```sh
/mnt/workspace/miniconda3/bin/conda init
```
After successful initialization, close the current terminal window and reopen it. You can then use the `conda` command normally.

Please note that **every time you open ModelScope Notebook after closing the instance, you need to re-execute the above initialization command**.

## Using Conda
You can now use the Conda environment normally. For example, to create a Conda environment named `mymodelscope`, you can use the following command:
```sh
conda create -n mymodelscope
```
![img.png](./_resources/conda-create.png)

You can see that the generated environment files will also be saved to the `/mnt/workspace/miniconda/` path. At this point, you can activate the conda environment according to the prompt.

## Restoring Conda Environment After Restarting ModelScope Notebook
After closing the ModelScope Notebook instance and reopening a new instance, you only need the following two steps to restore the previous instance's Conda environment:

- First, reinitialize Conda:
```sh
/mnt/workspace/miniconda/bin/conda init
```
Close the command line window and reopen it.

- Reactivate the Conda environment
```sh
conda activate mymodelscope
```
![img.png](./_resources/restart-conda.png)

This restores your previous Conda environment.

# Third-party Library Installation and Management

The development environment provided by ModelScope Notebook includes different versions corresponding to different combinations of frameworks such as Python, PyTorch, and TensorFlow. Please choose the appropriate image environment according to your usage requirements.

After opening the Notebook, you can directly install, view, and uninstall third-party libraries in the Notebook's Terminal.

## Viewing Third-party Libraries
Use the following command to view installed third-party libraries.
```shell
pip list
```

## Uninstalling Third-party Libraries
```shell
pip uninstall <your-library-name>
```
Replace `<yourLibraryName>` with the name of the installed third-party library. You can only uninstall third-party libraries that you have installed yourself.

## Updating Third-party Libraries
Some third-party libraries do not support uninstallation, such as **tensorflow-gpu**, and can only use the update command to install a specific version of **tensorflow-gpu**, where the new version must be compatible with the CUDA version. You can use the following command to update installed third-party libraries.
```shell
pip install --upgrade --user tensorflow-gpu=<versionNumber>
```
Replace `<versionNumber>` with the tensorflow-gpu version number to be installed. During the process, please do not upgrade the system pip, as this may cause installation issues.

# Notebook Image Update and Management

## How to Receive Image Update Notifications
After entering **Personal Center > My Notebook**, you will see an image update prompt at the launch image button.
![image.png](./_resources/1663209465960-44cd7f73-3ff9-4c3f-8772-8f52ec6edd84.png)

## Saving Files from Original Instance
Note that directly updating the image file will not save your work. You should first go to the **original instance** to save your files before updating the image and launching. That is, you can first launch the original instance, ensure all files are saved, then close the instance and update the image. If you already have an instance open, simply save your files and close the instance.

![image.png](./_resources/1663210173680-15eb5f27-54a2-49bf-9df2-c56162718e9c.png)

## Image Update
Click the **Update Image and Launch** button, and the backend will automatically update the instance and load the latest version image. The update takes approximately 1-2 minutes. After completion, the image version information will be synchronized and updated, and a new instance with the latest version image will be automatically opened for you.

![image.png](./_resources/1663209709494-037e73ae-9974-45ab-a94a-477aea5aa9db.png)