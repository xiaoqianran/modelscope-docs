<!-- modelscope-docs: Widget Configuration Documentation | contribute/model-file/help/model-demo/widget-config/widget-config_EN.md -->

# Widget Configuration Documentation

This document introduces the widget configuration options related to Model Demo integration.

## Configuration Example

```yaml
tasks:
  - word-segmentation
widgets: # Note: widgets is a list
  - enable: true
    version: 1
    task: word-segmentation
    examples:
      - inputs:
          - data: Alibaba Group's mission is to make it easy to do business anywhere
      - inputs:
          - data: The weather is nice today, perfect for going out
      - inputs:
          - data: Construction of the Wuhan Yangtze River Bridge began on September 1, 1955
    inputs:
      - type: text
        displayType: TextArea
        validator:
          max_words: 128
    output:
      displayType: WordSegmentation
      displayValueMapping: output
```

## Configuration Options

### tasks

A list of task types supported by the current model. The `task` in widget configuration must match one of these values.

```yaml
tasks:
  - translation
  - ocr
```

### widgets

`widgets` is a list where each child element represents a Demo configuration item, allowing rendering of the corresponding number of Demo instances.

**Note:** The current version only supports single Demo rendering and will only read the first element of `widgets`.

A Demo configuration item consists of the following parts:

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| version | number | Yes | Widget version number |
| enable | boolean | No | Whether to enable the Demo instance |
| task | string | Yes | The task corresponding to the model inference pipeline |
| model_revision | string | No | This value is the git tag of the model repository, used to specify the model version for Demo runtime |
| **inputs (Important)** | array | Yes | Demo input configuration (UI) |
| **parameters (Important)** | array | No | Demo additional parameter input configuration (UI) |
| extendsParameters | object | No | Directly specified Demo additional parameter values |
| **output (Important)** | object | Yes | Demo output configuration (UI) |
| **examples (Important)** | array | Yes | Demo example configuration |
| externals | object | No | Demo additional configuration items |
| inferencespec | object | No | Resource configuration items needed for Demo |

#### version

Widget version number. Widget configurations may differ between different version numbers. **Manual specification is recommended.** If not specified, the default configuration of the latest widget version will be automatically merged.

#### enable

Used to enable the Demo instance on the model detail page. Defaults to `false` if not specified, meaning the Demo won't be displayed on the page.

#### task

Used for model inference testing. During inference, the pipeline corresponding to this task will be used.

**Note:** This value must be included in the `tasks` field above.

#### model_revision

The value is the git tag of the model repository, used to specify the model version for Demo runtime. By default, the latest version not later than the SDK release time is used. If you need to run a specific version, you can specify it using this parameter.

```yaml
widgets:
  - model_revision: v1.0.0
```

#### inputs (Important)

Demo input configuration items, structured as a list. This field serves two purposes:

- Configures the frontend interactive interface.
- Each element's value will be combined to correspond to the `input` parameter of the pipeline interface.

```yaml
widgets:
  - inputs:
      - type: image
        displayType: ImageUploader
      - type: text
        displayType: TextArea
        validator:
          max_length: 100
```

Configuration options for a single element:

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| displayType | enum | Yes | Corresponding frontend input component. |
| displayProps | object | No | Property values for the corresponding frontend input component. |
| name | string | No | Corresponds to the key supported by the `input` parameter in the pipeline. Not required if the `input` parameter is a tuple. |
| type | enum | No | Input value type. Must be specified if using `validator`. |
| label | string | No | Used only for frontend display; shown above each input item. |
| validator | object | No | Frontend data validation rules. |
| disabled | boolean | No | Used only for frontend display; whether user input is allowed. If `true`, users can only use built-in example values. |
| hidden | boolean | No | Used only for frontend display; whether to show the input component to users (regardless of the value, it will be passed as an `input` parameter to the pipeline interface). |

##### displayType

This field corresponds to the frontend display component in the Demo, with enum values. See [Frontend Component Documentation](./frontend-component-documentation.md). It's recommended to use the Demo configurator to preview UI effects in real-time.

##### displayProps

This field corresponds to the property values of the frontend display component in the Demo. See [Frontend Component Documentation](./frontend-component-documentation.md). It's recommended to use the Demo configurator to preview UI effects in real-time.

##### name

When the `input` parameter value is a dict, this field's value must match the key supported by the `input` in the pipeline code. Not required if the `input` parameter is a tuple.

The pipeline's `input` supports two formats: tuple and dict:

- When the `name` field is not provided, user input values will be assembled into a tuple and passed to the pipeline by default.
- When the `name` field is provided, it will be used as the key and the user input value as the value, assembled into a dict and passed to the pipeline.

##### type

Input value type. Must be specified if using `validator`. Available values: text, image, video, audio, text-list, image-list, video-list, audio-list.

**Note:** List types should only be used when you need a specific field to pass a list value, where the entire list represents a single input sample.

##### validator

This field is an object where each key corresponds to a parameter validation rule before frontend data transmission (whether the corresponding rule is effective depends on the `type` field at the same level).

```yaml
widgets:
  - inputs:
      - validator:
          max_length: 100
```

Supported validation rules:

| Property | Type | Supported types | Description |
| --- | --- | --- | --- |
| max_length | number | text, text-list | Maximum character count |
| max_words | number | text, text-list | Maximum word count |
| min_size | string | image, video, audio, image-list, video-list, audio-list | Minimum file size, e.g.: 10M, 10K, 10G, 10T |
| max_size | string | image, video, audio, image-list, video-list, audio-list | Maximum file size, e.g.: 10M, 10K, 10G, 10T |
| min_resolution | string | image, image-list | Minimum image resolution, format: width*height, e.g.: 1000*1000, 200*200 |
| max_resolution | string | image, image-list | Maximum image resolution, format: width*height, e.g.: 1000*1000, 200*200 |
| accept | string | image, video, audio, image-list, video-list, audio-list | Supported file types, e.g.: `*.png,*.jpg` |
| required | boolean | All types | Whether required |

Each rule has a default error message when triggered. To customize this message, the corresponding rule should be written as follows:

```yaml
widgets:
  - inputs:
      - validator:
          max_length:
            rule: 100 # Rule value corresponding to max_length
            message: Maximum character count is 100 # Custom error message
```

#### parameters (Important)

Demo additional parameter configuration items, structured as a list. This field serves two purposes:

- Configures the frontend interactive interface.
- Specifies other parameters in the pipeline besides the `input` parameter.

```yaml
widgets:
  - parameters:
      - type: number
        name: data_size
        label: Data Size
```

Configuration options for a single element:

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| type | enum | Yes | Input value type, with values: string, number, enum. Different types display different input components on the frontend. |
| values | array | No | Only supported when `type` is `enum`, used to configure user options. |
| name | string | Yes | Corresponds to the key of additional parameters in the pipeline |
| displayProps | object | No | Property values for the corresponding frontend input component (different from `inputs`, here the frontend component is mapped based on `type`). |
| label (title in older versions) | string | No | Used only for frontend display; shown to the left of each input item. Defaults to `name` if not specified. |
| validator | object | No | Frontend data validation rules. |
| disabled | boolean | No | Used only for frontend display; whether user input is allowed. If `true`, users can only use built-in example values. |
| hidden | boolean | No | Used only for frontend display; whether to show the input component to users (regardless of the value, it will be passed as an `input` parameter to the pipeline interface). |

##### type

Input value type, with values: string, number, enum. Different types display different input components on the frontend. When the value is enum, the `values` field must be specified.

##### values

Only supported when `type` is `enum`, used to configure user enumeration options, written as follows:

```yaml
widgets:
  - parameters:
      - type: enum
        name: language
        label: Language
        values:
          - name: en-zh # Value needed for inference
            title: English-Chinese # Displayed to users on frontend, defaults to name if not specified
          - name: zh-en
            title: Chinese-English
```

##### name

Corresponds to the key of additional parameters in the pipeline. This value is required.

##### label

Used only for frontend display; shown to the left of each input item. Defaults to `name` if not specified.

##### displayProps

This field corresponds to the property values of the frontend display component in the Demo. See [Frontend Component Documentation](./frontend-component-documentation.md). It's recommended to use the Demo configurator to preview UI effects in real-time.

##### validator

This field is an object where each key corresponds to a parameter validation rule before frontend data transmission (whether the corresponding rule is effective depends on the `type` field at the same level).

```yaml
widgets:
  - parameters:
      - validator:
          min: 100
```

Supported validation rules:

| Property | Type | Supported types | Description |
| --- | --- | --- | --- |
| min | number | number | Minimum value |
| max | number | number | Maximum value |

Each rule has a default error message when triggered. To customize this message, the corresponding rule should be written as follows:

```yaml
widgets:
  - inputs:
      - validator:
          min:
            rule: 100 # Rule value corresponding to min
            message: Minimum value is 100 # Custom error message
```

#### extendsParameters

This field is a key-value object that can directly specify Demo additional parameter values, typically used to pass configuration parameters that don't require user input. The values will eventually be merged with the `parameters` values.

Example:

```yaml
widgets:
  - parameters:
      - name: foo
        type: string
    extendsParameters:
      bar: 'fixed value' # Will be directly merged with parameters values
```

Final result:

```json
{
  "foo": "user input value",
  "bar": "fixed value"
}
```

#### output (Important)

Demo output configuration item. Unlike `inputs` and `parameters`, this field has an object structure, meaning only a single output item can be configured. This field serves two purposes:

- Configures the frontend interactive interface.
- Maps the return values from the pipeline.

```yaml
widgets:
  - output:
    displayType: Text
    displayValueMapping: output
```

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| displayType | enum | Yes | Corresponding frontend output component. |
| displayProps | object | No | Property values for the corresponding frontend output component. |
| displayValueMapping | string, array, object | No | Defines the mapping relationship from pipeline return values to frontend components. |
| transformOutputs | object | No | Defines the server-side transformation behavior for pipeline return values. |

##### displayType

This field corresponds to the frontend display component in the Demo, with enum values. See [Frontend Component Documentation](./frontend-component-documentation.md). It's recommended to use the Demo configurator to preview UI effects in real-time.

##### displayProps

This field corresponds to the property values of the frontend display component in the Demo. See [Frontend Component Documentation](./frontend-component-documentation.md). It's recommended to use the Demo configurator to preview UI effects in real-time.

##### displayValueMapping

This field defines the mapping relationship from pipeline return values to frontend components. If not specified, the inference results will be returned as-is. Examples:

Example 1: Return value is a single field

Pipeline return value:

```json
{
  "output": "Alibaba Group's mission is to make it easy to do business anywhere"
}
```

Widget configuration:

```yaml
widgets:
  - output:
      displayType: Text
      displayValueMapping: output
```

Text only supports string values, so it will directly use the `output` field from `{ "output": "xx" }`.

Example 2: Return value has multiple fields

Pipeline return value:

```json
{
  "boxes": [
    [20, 20, 40, 40],
    [60, 60, 80, 80]
  ],
  "keypoints": [
    [30, 30],
    [70, 70]
  ]
}
```

Widget configuration:

```yaml
widgets:
  - output:
      displayType: ImageDraw
      displayValueMapping:
        points: keypoints
        boxes: boxes
```

ImageDraw supports object values, so it will convert `{ "boxes": "xx", "keypoints": "xx" }` to `{ "boxes": "xx", "points": "xx" }`.

Example 3: Return value has nested fields

Pipeline return value:

```json
{
  "output": {
    "text": "Alibaba Group's mission is to make it easy to do business anywhere"
  }
}
```

Widget configuration:

```yaml
widgets:
  - output:
      displayType: Text
      displayValueMapping:
        - output
        - text
```

Values will be extracted in the order specified in the list, i.e., first get `{ "text": "xxx" }` through `output`, then get the target value through `text`.

Each frontend component has a corresponding mappable list. For specific values, see the data types of each component in the [Frontend Component Documentation](./frontend-component-documentation.md). It's recommended to use the Demo configurator to preview UI effects in real-time.

##### transformOutputs

This field defines the server-side transformation behavior for pipeline return values. Its structure is relatively fixed and generally only needs to be specified when return values contain video, audio, images, or similar content.

```yaml
widgets:
  - output:
      displayType: Image
      displayValueMapping: output_img
      transformOutputs:
        output_img: # The key here corresponds one-to-one with the pipeline return fields, i.e., output_img is the field returning the image
          type: image # Transformation type
```

Configuration for each custom field:

| Property | Type | Values | Required | Description |
| --- | --- | --- | --- | --- |
| type | enum | image, image-list, audio, audio-list, video, video-list, 3d | Yes | Field type requiring transformation. The `list` type represents that the returned field is a list, and each value within needs transformation. |
| fileType | string | | No | File type to transform, e.g., png, pcm. Generally not required. |

Several commonly used fixed transformation behaviors:

Image:

```yaml
widgets:
  - output:
      transformOutputs:
        output_img:
          type: image
```

Audio:

```yaml
widgets:
  - output:
      transformOutputs:
        output_pcm:
          type: audio
```

Video:

```yaml
widgets:
  - output:
      transformOutputs:
        output_img:
          type: video
```

#### examples (Important)

Demo example configuration items, structured as a list, used to configure default user experience examples (can configure `inputs` and `parameters`). Each item represents a default example.

```yaml
widgets:
  - examples:
      - inputs:
          - data: Alibaba Group's mission is to make it easy to do business anywhere
          - data: The weather is nice today, perfect for going out
        parameters:
          - name: language
            value: cn
          - name: size
            value: large
```

Configuration for a single element:

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| inputs | array | No | Sets default values for outer `inputs` |
| parameters | array | No | Sets default values for outer `parameters` |

##### inputs

Sets default values for outer `inputs`. Single `inputs` configuration:

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| data | any type | Yes | Actual input data |

**Note:** When the `data` value is a URL (string), there are two optional formats:

1. `http://xxx` - Public HTTP address.
2. `git://xxx` - Upload files to the current model's repo, where `xxx` is the relative file path (relative to the model root directory). For example, if the file is `1.jpg` located in the `widget/image-matting` directory, then `data` would be `git://widget/image-matting/1.jpg`.

##### parameters

Sets default values for outer `parameters`. Single `parameters` configuration:

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| name | string | Yes | Corresponds to the `name` field of outer `parameters` |
| value | any type | Yes | Actual parameter data |

**Note:** To better ensure model quality, it's recommended to provide at least one example for each Demo.

#### externals

Demo additional parameter configuration items that support configuring extra styles like the test execution button.

```yaml
widgets:
  - externals:
      maximize: true # Automatically maximize the inference interface after inference completes
      testingButtonProps:
        tooltip:
          title: Execute Test # Tooltip text on mouse hover
```

Related configurations:

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| maximize | boolean | No | Used only for frontend display; controls whether to automatically maximize the inference interface after inference completes. |
| testingButtonProps | number | No | Used only for frontend display; can set properties for the execute test button. |

#### inferencespec

`inferencespec` refers to the resources needed to deploy the current Demo. Related configurations:

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| cpu | number | No | CPU count |
| memory | number | No | Memory size in MB |
| gpu | number | No | GPU count |
| gpu_memory | number | No | GPU memory size in MB |

**Note:** If `inferencespec` is not specified, the default `inferencespec` for the task will be used.

Example:

```yaml
widgets:
  - inferencespec:
      cpu: 2 # CPU count
      memory: 4000 # in MB
      gpu: 0 # GPU count
      gpu_memory: 16000 # in MB
```