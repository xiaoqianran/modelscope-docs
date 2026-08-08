<!-- modelscope-docs: Studio Card | studios/studio-card/studio-card_EN.md -->

This article introduces the definition, editing guidelines, usage methods, and management instructions for ModelScope Studio cards.

>  **Special Note:** You can freely create multiple Studios and share them with your friends. However, considering the quality of space display on the homepage, the Studios you create will not automatically enter the featured list on the Studios homepage. If you wish to apply for inclusion in the homepage list, please feel free to contact us (DingTalk group: 8010015744, email: contact@modelscope.cn)

# What is a Studio Card
A Studio card is a key source for ModelScope community users to obtain Studio information. It is a file attached to the Studio, primarily obtained by parsing the README.md file within the Studio. The Studio card contains YAML metadata that provides convenient information. Therefore, we strongly recommend that platform users write Studio cards according to the guidelines to help community users better understand and discover your Studios!

# What Information Does a Studio Card Provide
We recommend that Studio cards provide the following content descriptions, including but not limited to:

- **Studio Name and Description**. Introduce basic information about the Studio, its domain, tags, etc., to facilitate search
- **Associated Models**. Introduce the list of models associated with this Studio
- **Associated Datasets**. Introduce the list of datasets associated with this Studio
- **Deployment Specifications**. Introduce the resource specifications for Studio deployment

# Metadata for Studio Cards
A valid Studio card needs to include YAML header information, with the YAML information separated using --- delimiters. A complete example of the YAML section content is as follows:

```yaml
---
domain: # Domain: cv/nlp/audio/multi-modal/AutoML
- cv
tags: # Custom tags
-
datasets: # Associated datasets
  evaluation:
  - damotest/beans
  test:
  - damotest/squad
  train:
  - modelscope/coco_2014_caption
models: # Associated models
- damo/speech_charctc_kws_phone-xiaoyunxiaoyun
# # Deployment entry file (if SDK is Gradio/Streamlit, default is app.py; if Static HTML, default is index.html)
# deployspec:
#   entry_file: app.py
license: Apache License 2.0
---
```

## Field Descriptions
```yaml
domain: The domain to which the Studio belongs. Includes "cv", "nlp", "audio", "multi-modal", "AutoML", etc., representing computer vision (cv), natural language processing (nlp), audio interaction (audio), multi-modal (multi-modal), AutoML (AutoML), etc. You can also define custom domains.
license: The open-source license that this Studio follows. Examples include Apache License 2.0, GPL-2.0, GPL-3.0, MIT, etc.
language: For specific domains (such as audio, text, etc.), the language types supported by the Studio.
tags: Users can define custom tags for Studio search and filtering.
datasets: The datasets associated with this Studio, including training sets, validation sets, etc. Adding datasets enables users to click and navigate to the corresponding dataset detail page.
models: The models associated with this Studio. Adding models enables users to click and navigate to the corresponding model detail page.
deployspec:
- entry_file: Studio deployment entry file (if SDK is Gradio/Streamlit, default is app.py; if Static HTML, default is index.html)
```