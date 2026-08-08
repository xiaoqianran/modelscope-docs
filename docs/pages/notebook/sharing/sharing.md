<!-- modelscope-docs: Notebook Sharing and Collaboration | notebook/sharing/sharing_EN.md -->

# Notebook Sharing and Collaboration

ModelScope Notebook supports sharing functionality, allowing you to easily share code developed in the Notebook interactive programming environment, as well as notes and other information with others. Notebook sharing enables community developers to conveniently reproduce your code implementation and continue development based on your shared content, thereby better promoting community collaboration.

## Sharing
After opening a pynb file in the Jupyter editing page within ModelScope Notebook, you can click the "Share Notebook" button with the ModelScope logo in the top right corner to enable sharing.

![image.png](./_resources/share-button.png)

After clicking share, the ModelScope platform will automatically generate a sharing link for you. This link points to a **snapshot version** of your currently edited Notebook. The link is **publicly accessible**, and after sharing, anyone who obtains the link can view your shared snapshot content through ModelScope. You can also click the "View" button to review the sharing content yourself.
![image.png](./_resources/shared-notebook.png)

It should be noted that if you continue to modify and edit content on the current Notebook editing page, these new modifications **will not be synchronized to the previously shared snapshot version** unless you perform another sharing operation after editing.

## Continuous Development Based on Shared Notebook

If someone else shares a Notebook snapshot with you, i.e., a link like `https://modelscope.cn/notebook/share/...` as shown in the image above, you can directly view it in your browser. If you want to run this Notebook or make edits based on the current snapshot version, you can click the "Open in Notebook" link in the top right corner of the page and follow the page instructions to select an appropriate ModelScope Notebook instance to open. For specific operations, please refer to the **Free Notebook Usage** section in the [Notebook Introduction](./Notebook介绍.md) documentation. After opening the Notebook instance, you can directly enter the Notebook editing and development environment.

It's worth noting that any Notebook you open through someone else's sharing and any edits you make based on this version **are saved only in your own workspace and will not be synchronized to the original Notebook**. If you wish to share your modifications with others, you need to actively re-share your copy.