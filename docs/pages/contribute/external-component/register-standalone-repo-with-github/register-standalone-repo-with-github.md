<!-- modelscope-docs: Register Standalone Repository Based on GitHub and Other Platforms | contribute/external-component/register-standalone-repo-with-github/register-standalone-repo-with-github_EN.md -->

# Register Standalone Repository Based on GitHub and Other Platforms

This guide is intended for developers who wish to maintain a component library through an independent GitHub repository and utilize various models available on ModelScope.

The previous section introduced the method of registering and defining components based on ModelScope, which is suitable for scenarios with fewer components, primarily supporting pipeline inference and trainer training for specific models. However, when dealing with a large number of model components or other types of components, maintaining them through an independent component library should be considered.

The advantages of this approach include:

1. It resolves conflicts between dependencies of newly added custom components and the main library's dependencies, especially when it's difficult to merge into the main library. Developers only need to maintain the dependency relationship between their component library and ModelScope components, without considering the main library.
2. Models using these components only need to add a simple configuration entry.
3. Maintaining an independent component library allows for better management of systematic, independent components and reduces design coupling with the ModelScope main library.

### Usage Steps

The following steps are specifically for contributors:

1. Developers complete the relevant component development code according to the [Development Process](../contribute-model-code/develop-model-components-and-inference-pipeline.md) and create an independent GitHub repository.
2. In the new project, developers should properly manage `requirements.txt`, which **must** include the corresponding version of the `modelscope` package.
3. To facilitate user adoption of the models, developers **must** add `setup.py` information and upload the completed component library to a package management center such as `PyPI`.
4. In the model's configuration file `configuration.json` that needs to use this independent repository, add the `plugins: []` field and include your package name. For example, if you need to reference the third-party plugin `adaseq`, you can use the following example:
   
   Note: Multiple plugins can be added, and each plugin must be completed according to the steps above.
   ```json
   {
     "task": "awesome-task",
     "model": {
       "type": "awesome-model",
       ...
     },
     "plugins": ["adaseq"]
   }
   ```
5. Once the configuration includes package information, the ModelScope main library will automatically invoke the `pip` command to install the plugin in subsequent model usage scenarios.
6. Upload the model to ModelScope following the steps in [Upload Model](../integrate-model-files/model-creation-and-file-upload.md).

From the perspective of model usage, the usage method is identical to other models.

### Notes

It's worth noting that both the ModelScope-based component registration method described in the previous section and the method described in this section relax dependency management. End users may potentially encounter dependency installation issues when using these models.

Therefore, the model's README should guide users to create a new environment when using the model.