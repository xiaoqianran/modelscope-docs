<!-- modelscope-docs: Frontend Component Documentation | contribute/model-file/help/model-demo/demo-fontend-component/demo-fontend-component_EN.md -->

# Frontend Component Documentation

This document introduces the frontend input and output components in widget configuration.

> In the components below, the data type corresponds to the input or output value during inference, while additional properties define the display effect of the frontend component, corresponding to the `displayProps` field in the widget.

## Text

### Input Components

#### TextArea

Standard text input component.

##### Data Type

string

##### Additional Properties

| Property    | Type                                     | Required | Description                                                                 |
| ----------- | ---------------------------------------- | -------- | --------------------------------------------------------------------------- |
| type        | enum type, values: 'string' \| 'number' | No       | Defaults to `string`. When type is `number`, input is restricted to numbers only. |
| placeholder | string                                   | No       | Default placeholder text for the input field.                               |
| style       | object                                   | No       | Configure frontend styling for the input field.                             |

#### Input

Similar to TextArea, but accepts only single-line input, generally used for entering small amounts of text.

##### Data Type

string

##### Additional Properties

| Property    | Type   | Required | Description                              |
| ----------- | ------ | -------- | ---------------------------------------- |
| placeholder | string | No       | Default placeholder text for the input field. |

#### InputList

List of text input fields, allowing configuration of minimum and maximum length. Generally corresponds to the widget's `text-list` field, used for multiple lines of text with arbitrary quantity.

##### Data Type

string[]

##### Additional Properties

| Property | Type         | Required | Description                                                                 |
| -------- | ------------ | -------- | --------------------------------------------------------------------------- |
| addBtn   | string, null | No       | Text for the list addition button, default value is `Add`.                  |
| min      | number       | No       | Minimum list length, default value is `1`.                                  |
| max      | number       | No       | Maximum list length.                                                        |
| input    | object       | No       | Configure additional properties for `Input`, refer to `Input` component for specific properties. |

#### TagInput

Text input list, generally corresponding to the widget's `text-list` field, used for multiple lines of **short text** with arbitrary quantity, typically for inputting text tags and similar content.

##### Data Type

string[]

##### Additional Properties

| Property    | Type   | Required | Description                              |
| ----------- | ------ | -------- | ---------------------------------------- |
| placeholder | string | No       | Default placeholder text for the input field. |

### Output Components

#### Text

Standard text output component. All input content will be converted to string, generally used for task types where inference results are text.

##### Data Type

string | array | object

##### Additional Properties

| Property      | Type                                 | Required | Description                                                                                                                                                     |
| ------------- | ------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| arrayParser   | enum type, values: 'json' \| 'text' | No       | Configures display format when output content is an array:<br />1. When set to text, array values are separated by \\n.<br />2. When set to json, array is displayed in JSON structure.<br />Default value is `text`. |
| replaceList   | [v1: string, v2: string][]           | No       | Array of text pairs to be replaced. Iterates through inference results, replacing all occurrences of v1 strings with v2.                                        |

#### TextEntity

Specialized text output component, generally used for text entity-related tasks.

##### Data Type

{type: string; span: string; start: number; end: number}[]<br />A list of text entities, with each item having the following structure:

| Property | Type   | Required | Description     |
| -------- | ------ | -------- | --------------- |
| type     | string | Yes      | Entity type     |
| span     | string | Yes      | Entity content  |
| start    | number | Yes      | Entity start position |
| end      | number | Yes      | Entity end position   |

#### WordSegmentation

Specialized text output component, generally used for word segmentation tasks.

##### Data Type

string[]

## Images

### Input Components

#### ImageUploader

Standard image upload component.

##### Data Type

string

##### Additional Properties

| Property | Type   | Required | Description                              |
| -------- | ------ | -------- | ---------------------------------------- |
| label    | object | No       | Configure additional prompt information. |
| tips     | string | No       | Hover tooltip for the `Upload Image` button. |

**label**

| Property   | Type   | Required | Description            |
| ---------- | ------ | -------- | ---------------------- |
| label      | string | Yes      | Prompt text.           |
| bgColor    | string | No       | Prompt background color. |
| textColor  | string | No       | Prompt text color.     |

#### ImageCanvas

Image drawing component that adds black-and-white image drawing functionality on top of image upload.<br />**Note:** Since this component generates two input values, it requires occupying two positions in the inputs array and must be used together with the `Empty` component.

```yaml
widgets:
  - inputs: # First element corresponds to uploaded image, second field corresponds to drawn black-and-white image
      - type: image
        displayType: ImageCanvas
      - type: image
        displayType: Empty
```

##### Data Type

string, string

### Output Components

#### Image

Standard image output component

##### Data Type

string

#### ImageList

Image output list, used when inference returns a list of images.

##### Data Type

string[]

#### ImageDraw

Image annotation component, used to return corresponding annotation results for images used in inference, including data such as `points`, `boxes`, and `masks`.<br />**Note:** When using this component, the input component must be `ImageUploader` or `ImageCanvas`.

##### Data Type

object, with the following fields:

| Property  | Type                                                                                                | Required | Description                                                                                                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| boxes     | [x1: number, y1: number, x2: number, y2: number][]                                                  | No       | Collection of standard quadrilateral coordinate points. `[x1: number, y1: number, x2: number, y2: number]` represents coordinates for each box.                                          |
| points    | [x1:number, x2: number][]<br />or<br />[x1:number, x2: number][][]                                  | No       | Collection of annotation points. `[x1:number, x2: number]` represents coordinates for each point.<br />Since points typically coexist with boxes (one box can correspond to multiple points), the data structure `[x1:number, x2: number][][]` is additionally supported. |
| masks     | number[][][]                                                                                        | No       | Collection of mask pixel arrays. `number[][]` is a 2D array representing the mask's `height x width` pixel grid.                                                                           |
| polygons  | [x1:number, y1:number, x2:number, y2:number,<br />x3:number, y3:number,<br />x4:number,y4:number][] | No       | Collection of irregular polygon coordinate points.                                                                                                                                        |
| labels    | string[]                                                                                            | No       | Annotation text values.                                                                                                                                                                   |

##### Additional Properties

| Property  | Type   | Required | Description                 |
| --------- | ------ | -------- | --------------------------- |
| boxes     | object | No       | Standard quadrilateral styling settings |
| points    | object | No       | Annotation point styling settings |
| masks     | object | No       | Mask styling settings |
| polygons  | object | No       | Irregular polygon styling settings |
| labels    | object | No       | Annotation text styling settings |

**boxes**

| Property   | Type   | Required | Description                            |
| ---------- | ------ | -------- | -------------------------------------- |
| lineWidth  | number | No       | Line width, default value is 6px.      |

**points**

| Property | Type   | Required | Description                               |
| -------- | ------ | -------- | ----------------------------------------- |
| size     | number | No       | Annotation point size, default value is 10px. |

**masks**

| Property | Type     | Required | Description                                                                                                                         |
| -------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| colors   | number[] | No       | Color value configuration for masks. This is an array of color values, sequentially corresponding to mask inference results.<br />If not specified, random color values will be automatically generated corresponding to the number of masks. |

**polygons**

| Property | Type   | Required | Description                            |
| -------- | ------ | -------- | -------------------------------------- |
| size     | number | No       | Line width, default value is 6px.      |

**labels**

| Property     | Type                                                     | Required | Description                                                                                                                               |
| ------------ | -------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| type         | enum type, values: 'point' \| 'box-center' \| 'box'     | No       | Annotation text position. When set to `point`, it binds to annotation points; when set to `box-center`, it appears at the exact center of the quadrilateral; when set to `box`, it appears at the top-left corner of the quadrilateral.<br />Default value is `box-center`. |
| indexLabel   | boolean                                                  | No       | When this field is set, index labels will be generated based on inference results' `points` or `boxes`, even if `labels` are not returned in the inference results. |

#### GrayscaleImage

Grayscale image display component.

##### Data Type

object, with the following fields:

| Property | Type       | Required | Description                                                                  |
| -------- | ---------- | -------- | ---------------------------------------------------------------------------- |
| masks    | number[][] | Yes      | Collection of mask pixel arrays. `number[][]` is a 2D array representing the mask's `height x width` pixel grid. |

#### HeatMap

Heatmap display component

##### Data Type

object, with the following fields:

| Property | Type       | Required | Description                                                                  |
| -------- | ---------- | -------- | ---------------------------------------------------------------------------- |
| masks    | number[][] | Yes      | Collection of mask pixel arrays. `number[][]` is a 2D array representing the mask's `height x width` pixel grid. |
| label    | string     | No       | Center text for heatmap                                                      |

#### ImageSegmentation

Image segmentation component, a wrapper around the `ImageDraw` component, specifically designed for image segmentation task scenarios.<br />**Note:** When using this component, the input component must be `ImageUploader` or `ImageCanvas`.

##### Data Type

object, with the following fields:

| Property | Type                                               | Required | Description                                                                                          |
| -------- | -------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| boxes    | [x1: number, y1: number, x2: number, y2: number][] | Yes      | Collection of standard quadrilateral coordinate points. `[x1: number, y1: number, x2: number, y2: number]` represents coordinates for each box. |
| masks    | number[][][]                                       | Yes      | Collection of mask pixel arrays. `number[][]` is a 2D array representing the mask's `height x width` pixel grid. |
| scores   | string[]                                           | Yes      | Confidence scores for each segmented image.                                                          |
| labels   | string[]                                           | Yes      | Annotation text values.                                                                              |

## Audio

### Input Components

#### AudioUploader

Standard audio upload component, supporting both user recording and manual audio file upload.

##### Data Type

string

##### Additional Properties

| Property            | Type                                                         | Required | Description                                                                                                                              |
| ------------------- | ------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| sampleRate          | number                                                       | No       | Audio sampling rate during user recording.<br />Default value is 16000 (16kHz sampling rate).                                             |
| label               | Record<string, any>                                          | No       | Configure additional prompt information                                                                                                  |
| type                | enum type, values: 'recording' \| 'upload' \| 'default'     | No       | Supported audio upload modes. `default` supports both recording and upload, `upload` supports upload only, `recording` supports recording only.<br />Default value is `default`. |
| recordingDuration   | number \| false                                              | No       | Maximum recording duration. Acceptable values are number (in seconds) or `false`. If `false`, there is no upper limit.<br />Default value is 15. |

**label**

| Property   | Type   | Required | Description            |
| ---------- | ------ | -------- | ---------------------- |
| label      | string | Yes      | Prompt text.           |
| bgColor    | string | No       | Prompt background color. |
| textColor  | string | No       | Prompt text color.     |

#### AudioUploaderList

Audio upload list, allowing configuration of minimum and maximum length. Generally corresponds to the widget's `audio-list` field, used for multiple audio files with arbitrary quantity.

##### Data Type

string[]

##### Additional Properties

| Property          | Type         | Required | Description                                                             |
| ----------------- | ------------ | -------- | ----------------------------------------------------------------------- |
| addBtn            | string, null | No       | Text for the list addition button, default value is `Add`.              |
| min               | number       | No       | Minimum list length, default value is `1`.                              |
| max               | number       | No       | Maximum list length.                                                    |
| audioUploader     | object       | No       | Configure additional properties for `AudioUploader`, refer to `AudioUploader` component for specific properties. |

### Output Components

#### Audio

Standard audio output component.

##### Data Type

string

##### Additional Properties

| Property    | Type    | Required | Description                                                                                       |
| ----------- | ------- | -------- | ------------------------------------------------------------------------------------------------- |
| sampleRate  | number  | No       | Audio sampling rate for browser playback when inference results return PCM audio.<br />Default value is 16000 (16kHz sampling rate). |
| download    | boolean | No       | Whether to display download button.<br />Default value is true.                                    |
| fileName    | string  | No       | Audio filename displayed to users.                                                                |

#### AudioList

Audio output list, used when inference returns a list of audio files.

##### Data Type

string[]

##### Additional Properties

| Property | Type   | Required | Description                                             |
| -------- | ------ | -------- | ------------------------------------------------------- |
| audio    | object | No       | Configure additional properties for `Audio`, refer to `Audio` component for specific properties. |

## Video

### Input Components

#### VideoUploader

Standard video upload component.

##### Data Type

string

#### VideoCanvas

Video drawing component that adds target bounding box functionality on top of video upload.<br />**Note:** Since this component generates two input values, it requires occupying two positions in the inputs array and must be used together with the `Empty` component.

```yaml
widgets:
  - inputs: # First element corresponds to uploaded video, second field corresponds to bounding box coordinates
      - type: video
        displayType: VideoCanvas
      - displayType: Empty
```

##### Data Type

string, [x1, y1, x2, y2]

### Output Components

#### Video

Standard video output component

##### Data Type

string

#### VideoSegmentation

Video segmentation component, used to display different video frames in segments.

##### Data Type

{ frames: [number, number]; timestamps: [string, string] }[]<br />Each item contains a list of video start/end frames and timestamps.

| Property    | Type                         | Required | Description                                             |
| ----------- | ---------------------------- | -------- | ------------------------------------------------------- |
| frames      | [start: number, end: number] | Yes      | Start and end frames for each segment                   |
| timestamps  | [start: string, end: string] | Yes      | Start and end times for each segment, time format: `hh:mm:ss`. |

#### VideoDraw

Video annotation component, used to return corresponding annotation results for videos used in inference. Unlike image annotation, due to performance considerations, it does not include `masks` and currently only contains `boxes` data.<br />**Note:** When using this component, the input component must be `VideoUploader` or `VideoCanvas`.

##### Data Type

object, with the following fields:

| Property    | Type                                                                                                                 | Required | Description                                                                                                                                                       |
| ----------- | -------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| boxes       | [x1: number, y1: number, x2: number, y2: number][]<br />or<br />[x1: number, y1: number, x2: number, y2: number][][] | No       | Collection containing standard quadrilateral coordinate points for each frame. `[x1: number, y1: number, x2: number, y2: number]` represents coordinates for each box.<br />Supports both single and multiple boxes per frame. |
| labels      | string[]<br />or<br />string[][]                                                                                     | No       | Annotation text values corresponding sequentially to boxes.                                                                                                       |
| timestamps  | string[]                                                                                                             | Yes      | Specific timestamp for each frame, time format: `hh:mm:ss`.                                                                                                        |

## Scientific

### Output Components

#### Prediction

Label and confidence display component.

##### Data Type

object: with the following fields

| Property | Type     | Required | Description                                                   |
| -------- | -------- | -------- | ------------------------------------------------------------- |
| labels   | string[] | No       | Confidence label list. If not provided, indices from confidence list will be used as values by default. |
| scores   | number[] | Yes      | Confidence list.                                              |

##### Additional Properties

| Property | Type   | Required | Description           |
| -------- | ------ | -------- | --------------------- |
| title    | object | No       | Component header information. |

**title**

| Property | Type   | Required | Description                                             |
| -------- | ------ | -------- | ------------------------------------------------------- |
| label    | string | No       | Header for `labels`.<br />Default value: `Prediction Category`. |
| score    | string | No       | Header for `scores`.<br />Default value: `Probability`.     |

#### Preview3D

3D file preview component, currently supports only pdb format.

##### Data Type

string

## Special Components

Special components designed for specific tasks, generally used only within their corresponding tasks.

### face-attribute-recognition

#### FaceAttributeRecognitionResult

Output component for `face-attribute-recognition` task.

##### Data Type

| Property | Type                 | Required | Description                        |
| -------- | -------------------- | -------- | ---------------------------------- |
| labels   | [string[], string[]] | No       | Labels for two `Prediction` components. |
| scores   | [number[], number[]] | Yes      | Scores for two `Prediction` components. |

### keyword-spotting

#### AudioSpotting

Input component for `keyword-spotting` task

##### Data Type

string

##### Additional Properties

| Property       | Type   | Required | Description                                                          |
| -------------- | ------ | -------- | -------------------------------------------------------------------- |
| sampleRate     | number | No       | Audio sampling rate during user recording.<br />Default value is 16000 (16kHz sampling rate). |
| recordingTip   | string | No       | Hover tooltip for the `Record` button.                               |

#### SpottingResult

Output component for `keyword-spotting` task.

##### Data Type

{ confidence: number; keyword: string; type: 'wakeup' | 'action'; offset: number; length: number }[]

| Property    | Type                                     | Required | Description                     |
| ----------- | ---------------------------------------- | -------- | ------------------------------- |
| confidence  | number                                   | Yes      | Wake word confidence.           |
| keyword     | string                                   | Yes      | Wake keyword.                   |
| type        | enum type, values: 'wakeup' \| 'action' | Yes      | Wake word type.                 |
| offset      | number                                   | Yes      | Start time of wake word in audio. |
| length      | number                                   | Yes      | Duration of wake word.          |

### table-question-answering

#### TableQuestionInput

Input component for `table-question-answering` task.

##### Data Type

string

#### TableQuestionInputTable

Input component for `table-question-answering` task.

##### Data Type

string, this value is a link to a JSON file.

#### TableQuestionResult

Output component for `table-question-answering` task.

##### Data Type

| Property    | Type   | Required | Description             |
| ----------- | ------ | -------- | ----------------------- |
| tableData   | object | Yes      | Retrieved table information |
| sqlQuery    | string | Yes      | Executable SQL statement |
| sqlString   | string | Yes      | Query SQL statement     |