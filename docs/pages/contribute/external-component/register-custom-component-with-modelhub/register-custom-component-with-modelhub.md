<!-- modelscope-docs: Register Custom Components via ModelHub | contribute/external-component/register-custom-component-with-modelhub/register-custom-component-with-modelhub_EN.md -->

# Register Custom Components via ModelHub

This article is aimed at users who want to quickly leverage ModelScope's component capabilities to integrate new custom models or components into the ModelHub ecosystem and utilize capabilities such as pipeline and trainer.

Previous chapters introduced the method of sharing model code to the ModelScope main repository, which already covered how to register components, including configuration and registration methods for core components such as model, preprocessor, pipeline, and trainer.

It's worth noting that contributing new components to the main repository presents the following challenges:
1. High requirements for code standardization of new custom components
2. Significant modifications needed when dependencies of new custom components conflict with main repository dependencies, making merging difficult
3. Conflict between the desire for rapid component registration and sharing on ModelHub versus the slower main repository release cycle

For the above scenarios, we provide a quick custom component registration mechanism based on ModelHub repositories. Users can quickly generate component wrapper structures for pipeline inference or training through template commands.
Simply complete the adaptation development code and corresponding configuration according to the aforementioned documentation, and upload them to the ModelHub repository,
and you can start using the model.

### Usage Steps

For model contributors, the specific steps are as follows:
1. Developers prepare code and configuration files according to the [Development Process](../贡献模型代码/开发模型等组件及推理流程.md);
2. Add the `allow_remote: true` field in the configuration file `configuration.json`, for example:
    ```json
    {
      "task": "awesome-task",
      "model": {
        "type": "awesome-model",
        ...
      },
      "allow_remote": true
    }
    ```
3. Add dependency file `requirements.txt`. Third-party library dependencies for related components need to be added here again to ensure correct dependency installation during loading.
4. Upload the model to ModelHub according to the steps in [Upload Model](../接入模型文件/模型的创建与文件上传.md)
5. Use the model according to standard pipeline or training workflows based on your uploaded content.

For model users, the usage method is no different from other models.

### Note
It's worth noting that this chapter's approach relaxes dependency library management. End users may potentially encounter dependency installation issues when using these models.

Therefore, model README files should guide users to enable a new environment when using these models.