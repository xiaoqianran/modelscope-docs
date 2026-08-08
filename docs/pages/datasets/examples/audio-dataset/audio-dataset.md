<!-- modelscope-docs: Audio Dataset | datasets/examples/audio-dataset/audio-dataset_EN.md -->

Audio files are organized similarly to image files, as shown in the following example:

# Organizing Dataset Folder Structure

Create a dataset repository on modelscope.cn and organize your dataset directory as follows:

```
my_dataset/
├── README.md
├── metadata.csv
└── data/
    ├── first_audio_file.mp3
    ├── second_audio_file.mp3
    └── third_audio_file.mp3
```

The `data` folder can be named anything you prefer.

# Metadata Format

The metadata file should contain a `file_name` column to associate audio files with their metadata:

```csv
file_name,transcription
data/first_audio_file.mp3,Transcription text 1
data/second_audio_file.mp3,Transcription text 2
data/third_audio_file.mp3,Transcription text 3
```


# Multi-Split Datasets

If your dataset involves multiple splits, the directory structure might look like this:

```
my_dataset/
├── README.md
├── metadata.csv
└── data/
    ├── train/
    │   ├── first_train_audio_file.mp3
    │   └── second_train_audio_file.mp3
    └── test/
        ├── first_test_audio_file.mp3
        └── second_test_audio_file.mp3
```

**Note**: If audio files are not in the same directory level as the metadata file, the `file_name` column should display the complete relative path to the audio files, not just the filename.

Example metadata.csv:
```csv
file_name,transcription
data/train/first_train_audio_file.mp3,Transcription text 1
data/train/second_train_audio_file.mp3,Transcription text 2
data/test/first_test_audio_file.mp3,Transcription text 3
data/test/second_test_audio_file.mp3,Transcription text 4
```

# Automatic Label Inference

For audio datasets without associated metadata, category labels will be automatically inferred based on directory names, which is particularly useful for audio classification tasks. Example dataset directory structure:

```
data/train/electronic/01.mp3
data/train/punk/01.mp3
data/test/electronic/09.mp3
data/test/punk/09.mp3
```

When loading the dataset through the SDK, it will create a `label` column based on directory names:

```python
dataset = MsDataset.load("/path/to/data")
print(dataset["train"][0])
```

Example output:
```python
{'audio': {'path': '/path/to/electronic/01.mp3', ...},
 'label': 0  # "electronic"
}
```