<!-- modelscope-docs: widget配置文档 | contribute/model-file/help/model-demo/widget-config/widget-config_CN.md -->

# widget配置文档

本篇将介绍模型  Demo  接入的相关  widget  配置项。

## 配置示例

```yaml
tasks:
  - word-segmentation
widgets: # 注意 widgets 是一个 list
  - enable: true
    version: 1
    task: word-segmentation
    examples:
      - inputs:
          - data: 阿里巴巴集团的使命是让天下没有难做的生意
      - inputs:
          - data: 今天天气不错，适合出去游玩
      - inputs:
          - data: 武汉市长江大桥于1955年9月1日动工兴建
    inputs:
      - type: text
        displayType: TextArea
        validator:
          max_words: 128
    output:
      displayType: WordSegmentation
      displayValueMapping: output
```

## 配置项

### tasks

当前模型所支持的任务类型列表，widget  配置的  task  需要与其匹配。

```yaml
tasks:
  - translation
  - ocr
```

### widgets 

widgets  是一个  list，内部每个子项元素都代表一个  Demo  配置项，可以渲染对应数量的  Demo  实例。

**注意：** 当前版本只支持单个  Demo  渲染，只会读取  widgets  的第一个元素。

一个  Demo  配置项由以下部分组成：

| 属性                   | 类型    | 是否必填 | 描述                                                          |
| ---------------------- | ------- | -------- | ------------------------------------------------------------- |
| version                | number  | 是       | widget  版本号                                                |
| enable                 | boolean | 否       | 是否开启  Demo  实例                                          |
| task                   | string  | 是       | 模型测试推理对应  pipeline  的  task                          |
| model_revision         | string  | 否       | 该值为模型库的  git tag，用于指定  Demo  运行时使用的模型版本 |
| **inputs（重要）**     | array   | 是       | Demo  输入配置（UI）                                          |
| **parameters（重要）** | array   | 否       | Demo  额外参数输入配置（UI）                                  |
| extendsParameters      | object  | 否       | 直接指定的  Demo  额外参数值                                  |
| **output（重要）**     | object  | 是       | Demo  输出配置（UI）                                          |
| **examples（重要）**   | array   | 是       | Demo  示例配置                                                |
| externals              | object  | 否       | Demo  额外配置项                                              |
| inferencespec          | object  | 否       | Demo  需要用到的资源配置项                                    |

#### version

widget  版本号，不同版本号之间  widget  的配置会有所不同，**建议手动指定**，如果不填会自动合并最新版本  widget  的默认配置。

#### enable

用于开启模型详情页面的  Demo  实例，不填默认为  false，即不在页面展示  Demo。

#### task

用于模型测试推理，在推理时会使用对应  task  的  pipeline。

**注意：** 该值必须被包含在上方  tasks  字段内。

#### model_revision

值为模型库的  git tag，用于指定  Demo  运行时使用的模型版本。默认使用不晚于 SDK 发布时间的最新版本。如有运行特定版本需求，可利用该参数进行指定。

```yaml
widgets:
  - model_revision: v1.0.0
```

#### inputs（重要）

Demo  的输入配置项，结构为  list。  该字段有两个作用：

- 配置前端交互界面。

- 每个元素的值会经过组合对应  pipeline  接口的  input  参数。

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

单个元素的配置项如下：

| 属性         | 类型    | 是否必填 | 描述                                                                                                     |
| ------------ | ------- | -------- | -------------------------------------------------------------------------------------------------------- |
| displayType  | enum    | 是       | 前端对应输入组件。                                                                                       |
| displayProps | object  | 否       | 前端对应输入组件的属性值。                                                                               |
| name         | string  | 否       | 对应  pipeline  中  input  参数支持的  key，如果  input  参数为  tuple  则无需填写。                     |
| type         | enum    | 否       | 输入值的类型，如果需要使用  validator  则必须填写。                                                      |
| label        | string  | 否       | 仅用于前端显示，在每个输入项上方会展示该值。                                                             |
| validator    | object  | 否       | 前端数据校验规则。                                                                                       |
| disabled     | boolean | 否       | 仅用于前端显示，是否允许用户输入，如果为  true  则用户只能使用内置示例值。                               |
| hidden       | boolean | 否       | 仅用于前端显示，是否向用户展示输入组件（无论值是否为  true，都会作为  pipleline  接口的  input  参数）。 |

##### displayType

该字段对应  Demo  中的前端展示组件，值为  enum  类型，见 [前端组件文档](./前端组件文档.md)，推荐使用 Demo 配置器实时查看 UI 效果。

##### displayProps

该字段对应 Demo  中的前端展示组件的属性值，见 [前端组件文档](./前端组件文档.md)，推荐使用 Demo 配置器实时查看 UI 效果。

##### name

当  input  参数的值为  dict  时该字段的值要跟  pipeline  代码中的  input  支持的  key  一致，如果  input  参数为  tuple  则无需填写。

pipeline  中的  input  支持两种格式，tuple  和  dict：

- 当不提供  name  字段时，用户输入值会默认被组装成  tuple  传入  pipeline

- 当提供  name  字段时，会以  name  作为  key，用户输入值为  value  组装成  dict  传入  pipeline

##### type

输入值的类型，如果需要使用  validator  则必须填写，可选值：text、image、video、audio、text-list、image-list、video-list、audio-list。

**注意：** list  类型只有在确认需要某个字段传入  list  值使用，该  list  整体为一个输入样本。

##### validator

该字段为一个对象，其下每个  key  都对应一个前端数据传输前的参数校验规则（相应规则是否生效由同级的  type  字段决定）。

```yaml
widgets:
  - inputs:
      - validator:
          max_length: 100
```

支持的校验规则如下：

| 属性           | 类型    | 支持的  type                                            | 描述                                                      |
| -------------- | ------- | ------------------------------------------------------- | --------------------------------------------------------- |
| max_length     | number  | text、text-list                                         | 最大字符数                                                |
| max_words      | number  | text、text-list                                         | 最大单词数                                                |
| min_size       | string  | image、video、audio、image-list、video-list、audio-list | 最小文件大小，例如：10M、10K、10G、10T                    |
| max_size       | string  | image、video、audio、image-list、video-list、audio-list | 最大文件大小，例如：10M、10K、10G、10T                    |
| min_resolution | string  | image、image-list                                       | 最小图片分辨率，写法为长\*宽   例如：1000\*1000、200\*200 |
| max_resolution | string  | image、image-list                                       | 最大图片分辨率，写法为长\*宽   例如：1000\*1000、200\*200 |
| accept         | string  | image、video、audio、image-list、video-list、audio-list | 支持的文件类型，例如：\`\*.png,\*.jpg                     |
| required       | boolean | 所有类型                                                | 是否必填                                                  |

每条规则触发失败时都有默认的报错文本，如果需要修改此文本，对应规则需要变为如下的填写方式：

```yaml
widgets:
  - inputs:
      - validator:
          max_length:
            rule: 100 # max_length 对应的规则值
            message: 最大字符数为 100 # 自定义报错文本
```

#### parameters（重要）

Demo  的额外参数配置项，结构为  list，该字段有两个作用：

- 配置前端交互界面。

- 指定  pipeline  中除  input  参数外的其他参数项。

```yaml
widgets:
  - parameters:
      - type: number
        name: data_size
        label: 数据大小
```

单个元素的配置项如下：

| 属性                     | 类型    | 是否必填 | 描述                                                                                                     |
| ------------------------ | ------- | -------- | -------------------------------------------------------------------------------------------------------- |
| type                     | enum    | 是       | 输入值的类型，值为 string、number、enum 三种，不同类型会在前端显示不同的输入组件。                       |
| values                   | array   | 否       | 仅当  type  为  enum  时支持，用于配置用户选项。                                                         |
| name                     | string  | 是       | 对应  pipleline  中额外参数的  key                                                                       |
| displayProps             | object  | 否       | 前端对应输入组件的属性值（与  inputs  不同，这里的前端组件会根据  type  进行映射）。                     |
| label（旧版使用  title） | string  | 否       | 仅用于前端显示，在每个输入项左边会展示该值，不填默认使用  name。                                         |
| validator                | object  | 否       | 前端数据校验规则。                                                                                       |
| disabled                 | boolean | 否       | 仅用于前端显示，是否允许用户输入，如果为  true  则用户只能使用内置示例值。                               |
| hidden                   | boolean | 否       | 仅用于前端显示，是否向用户展示输入组件（无论值是否为  true，都会作为  pipleline  接口的  input  参数）。 |

##### type

输入值的类型，值为 string、number、enum 三种，不同类型会在前端显示不同的输入组件，当值为 enum 时必须填写  values  字段。

##### values

仅当  type  为  enum  时支持，用于配置用户枚举选项，写法如下：

```yaml
widgets:
  - parameters:
      - type: enum
        name: language
        label: 语言
        values:
          - name: en-zh # 推理时需要使用的值
            title: 英-中 # 用于前端给用户展示，如果不写会使用 name 显示
          - name: zh-en
            title: 中-英
```

##### name

对应  pipleline  中额外参数的  key，该值为必填项

##### label

仅用于前端显示，在每个输入项左侧会展示该值，不填默认使用  name。

##### displayProps

该字段对应 Demo  中的前端展示组件的属性值，见 [前端组件文档](./前端组件文档.md)，推荐使用 Demo 配置器实时查看 UI 效果

##### validator

该字段为一个对象，其下每个  key  都对应一个前端数据传输前的参数校验规则（相应规则是否生效由同级的  type  字段决定）。

```yaml
widgets:
  - parameters:
      - validator:
          min: 100
```

支持的校验规则如下：

| 属性 | 类型   | 支持的  type | 描述   |
| ---- | ------ | ------------ | ------ |
| min  | number | number       | 最小值 |
| max  | number | number       | 最大值 |

每条规则触发失败时都有默认的报错文本，如果需要修改此文本，对应规则需要变为如下的填写方式：

```yaml
widgets:
  - inputs:
      - validator:
          min:
            rule: 100 # min 对应的规则值
            message: 最小值 100 # 自定义报错文本
```

#### extendsParameters

该字段是一个  key-value  对象，可直接指定的  Demo  额外参数值，一般用于传输无需用户输入的配置参数，最终会与  parameters  的值合并。

如：

```yaml
widgets:
  - parameters:
      - name: foo
        type: string
    extendsParameters:
      bar: '固定值' # 会直接与 parameters 的值合并
```

最终结果

```json
{
  "foo": "用户输入值",
  "bar": "固定值"
}
```

#### output（重要）

Demo  的输出配置项，与  inputs  和  parameters  不同，该字段的结构为  object，即只可配置单个输出项。  该字段有两个作用：

- 配置前端交互界面。

- 对  pipeline  中返回值做映射

```yaml
widgets:
  - output:
    displayType: Text
    displayValueMapping: output
```

| 属性                | 类型                  | 是否必填 | 描述                                         |
| ------------------- | --------------------- | -------- | -------------------------------------------- |
| displayType         | enum                  | 是       | 前端对应输出组件。                           |
| displayProps        | object                | 否       | 前端对应输出组件的属性值。                   |
| displayValueMapping | string、array、object | 否       | 定义  pipeline  返回值到前端组件的映射关系。 |
| transformOutputs    | object                | 否       | 定义服务端对  pipeline  返回值的转义行为。   |

##### displayType

该字段对应  Demo  中的前端展示组件，值为  enum  类型，见 [前端组件文档](./前端组件文档.md)，推荐使用 Demo 配置器实时查看 UI 效果  。

##### displayProps

该字段对应 Demo  中的前端展示组件的属性值，待见 [前端组件文档](./前端组件文档.md)，推荐使用 Demo 配置器实时查看 UI 效果

##### displayValueMapping

该字段用于定义  pipeline  返回值到前端组件的映射关系，不填写则会按照推理结果原样返回值。如：

示例一：返回值为单个字段

pipeline  返回值：

```json
{
  "output": "阿里巴巴集团的使命是让天下没有难做的生意"
}
```

widget  配置：

```yaml
widgets:
  - output:
      displayType: Text
      displayValueMapping: output
```

Text  只支持传入值为  string，这里会直接取用  { "output": "xx" }  中的  output  字段。

示例三：返回值为多个字段

pipeline  返回值：

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

widget  配置：

```yaml
widgets:
  - output:
      displayType: ImageDraw
      displayValueMapping:
        points: keypoints
        boxes: boxes
```

ImageDraw  支持传入  object  值，这里会将  { "boxes": "xx", "keypoints": "xx" }   转换为   { "boxes": "xx", "points": "xx" }

示例三：返回值为嵌套字段

pipeline  返回值：

```json
{
  "output": {
    "text": "阿里巴巴集团的使命是让天下没有难做的生意"
  }
}
```

widget  配置：

```yaml
widgets:
  - output:
      displayType: Text
      displayValueMapping:
        - output
        - text
```

这里会按照  list  的写入顺序取值，即先通过 output 获取到  { "text": "xxx" }，再通过 text 获取到目标值。

每一个前端组件的都有对应的可映射列表，具体值见 [前端组件文档](./前端组件文档.md) 每个组件的数据类型，推荐使用 Demo 配置器实时查看 UI 效果。

##### transformOutputs

该字段用于定义服务端对  pipeline  返回值的转义行为，其值的结构比较固定，一般情况下，只有当返回值包含视频、音频、图片等内容时才需要填写。

```yaml
widgets:
  - output:
      displayType: Image
      displayValueMapping: output_img
      transformOutputs:
        output_img: # 这里的 key 与 pipeline 返回的字段一一对应，即 output_img 为返回 image 的字段
          type: image # 转义的类型
```

每个自定义字段的配置如下：

| 属性     | 类型   | 值                                                          | 是否必填 | 描述                                                                                                |
| -------- | ------ | ----------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| type     | enum   | image、image-list、audio、audio-list、video、video-list、3d | 是       | 需要转义的字段类型。其中   list  类型的  type  代表返回的字段是一个  list，内部每一个值都需要转义。 |
| fileType | string |                                                             | 否       | 要转义的文件类型，如  png、pcm。  一般不用填写。                                                    |

几个常用的固定转义行为：

图片：

```yaml
widgets:
  - output:
      transformOutputs:
        output_img:
          type: image
```

音频：

```yaml
widgets:
  - output:
      transformOutputs:
        output_pcm:
          type: audio
```

视频：

```yaml
widgets:
  - output:
      transformOutputs:
        output_img:
          type: video
```

#### examples（重要）

Demo  的示例配置项，结构为  list，用于配置默认的用户体验示例（可以配置  inputs  与  parameters），每一项即代表一个默认示例。

```yaml
widgets:
  - examples:
      - inputs:
          - data: 阿里巴巴集团的使命是让天下没有难做的生意
          - data: 今天天气不错，适合出去游玩
        parameters:
          - name: language
            value: cn
          - name: size
            value: large
```

单个元素的配置如下：

| 属性       | 类型  | 是否必填 | 描述                         |
| ---------- | ----- | -------- | ---------------------------- |
| inputs     | array | 否       | 设置外层  inputs  默认值     |
| parameters | array | 否       | 设置外层  parameters  默认值 |

##### inputs

设置外层  inputs  默认值，单个   inputs  配置：

| 属性 | 类型     | 是否必填 | 描述                |
| ---- | -------- | -------- | ------------------- |
| data | 任意类型 | 是       | 实际的  input  数据 |

**注：** 当  data  值为链接（string）时，有两种可选形式：

1.  http://xxx，公开的  http  地址。

2.  git://xxx，可以将文件上传到当前  model  的  repo  中，xxx  为文件相对路径（相对模型根目录）。如文件为  1.jpg，放在  widget/image-matting  目录下，则  data  为  git://widget/image-matting/1.jpg。

##### parameters

设置外层  inputs  默认值，单个  parameters  配置：

| 属性  | 类型     | 是否必填 | 描述                               |
| ----- | -------- | -------- | ---------------------------------- |
| name  | string   | 是       | 对应外层  parameters  字段的  name |
| value | 任意类型 | 是       | 实际的  parameter  数据            |

**注：** 为了更好地保证模型质量，建议每个  Demo  至少提供一个  examples。

#### externals

Demo  额外的参数配置项，可以支持配置执行测试按钮等  Demo  的额外样式。

```yaml
widgets:
  - externals:
      maximize: true # 推理结束后自动最大化推理界面
      testingButtonProps:
        tooltip:
          title: 执行测试 # 鼠标 hover 时的提示语
```

相关配置如下：

| 属性               | 类型    | 是否必填 | 描述                                                   |
| ------------------ | ------- | -------- | ------------------------------------------------------ |
| maximize           | boolean | 否       | 仅用于前端显示，控制推理结束后是否自动最大化推理界面。 |
| testingButtonProps | number  | 否       | 仅用于前端显示，可设置执行测试按钮的相关属性。         |

#### inferencespec

inferencespec  是指部署当前  Demo  需要用到的资源，相关配置如下：

| 属性       | 类型   | 是否必填 | 描述               |
| ---------- | ------ | -------- | ------------------ |
| cpu        | number | 否       | CPU  数量          |
| memory     | number | 否       | 内存大小，单位  MB |
| gpu        | number | 否       | GPU  数量          |
| gpu_memory | number | 否       | 显存大小，单位  MB |

**注意：** 不指定  inferencespec  会使用  task  默认的  inferencespec。

示例：

```yaml
widgets:
  - inferencespec:
      cpu: 2 #CPU数量
      memory: 4000 #单位MB
      gpu: 0 #GPU数量
      gpu_memory: 16000 #单位MB
```
