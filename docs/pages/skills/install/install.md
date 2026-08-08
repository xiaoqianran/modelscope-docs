<!-- modelscope-docs: Download and Install Skills | skills/install/install_EN.md -->

# Download and Install Skills

This document introduces three methods to install Skills, supporting installation of individual Skills or Skill collections.

## Method 1: Install via npx

### Install a Single Skill

```bash
npx skills add https://modelscope.cn/skills/{skill_id}
```

**Example**: Install [@anthropics/skill-creator](https://modelscope.cn/skills/@anthropics/skill-creator)

```bash
npx skills add https://modelscope.cn/skills/@anthropics/skill-creator
```

### Install a Skill Collection

```bash
npx skills add https://modelscope.cn/collections/{collection_id}
```

**Example**: Install [modelscope/awesome-skills](https://modelscope.cn/collections/modelscope/awesome-skills)

```bash
npx skills add https://modelscope.cn/collections/modelscope/awesome-skills
```

> [!NOTE]
> The npx method does not support installing non-public (private) Skills or collections. To install private resources, please use the ModelScope SDK or Bash script method.

---

## Method 2: Install via ModelScope SDK

### Prerequisites

First, you need to install the ModelScope SDK:

```bash
pip install --upgrade modelscope
```

### Install a Single Skill

```bash
modelscope skills add {skill_id}
```

**Example**: Install [@anthropics/skill-creator](https://modelscope.cn/skills/@anthropics/skill-creator)

```bash
modelscope skills add @anthropics/skill-creator
```

> **Tip**: You can also use the alias `ms` instead of `modelscope`:
> ```bash
> ms skills add @anthropics/skill-creator
> ```

### Install Multiple Skills

Supports installing multiple Skills simultaneously, with multiple skill_ids separated by spaces:

```bash
modelscope skills add {skill_id1} {skill_id2} {skill_id3}
```

**Example**: Install multiple Skills simultaneously

```bash
modelscope skills add @anthropics/skill-creator @modelscope/skill-web-search
```

### Install a Skill Collection

```bash
modelscope download --collection {collection_id}
```

**Example**: Install [modelscope/awesome-skills](https://modelscope.cn/collections/modelscope/awesome-skills)

```bash
modelscope download --collection modelscope/awesome-skills
```

For more ModelScope SDK CLI features, see [Command Line Introduction](../../sdk/cli/cli_EN.md)

### Install Private Skills/Collections

For private (non-public) Skills or collections, you need to specify an access token using the `--token` parameter:

```bash
# Install private Skill
modelscope skills add {private_skill_id} --token {Your_ModelScope_Token}

# Install private collection
modelscope download --collection {private_collection_id} --token {Your_ModelScope_Token}
```

---

## Method 3: Install via Bash Script

### Install a Single Skill

```bash
curl -fsSL https://modelscope.cn/skills/install.sh | bash -s -- {skill_id}
```

**Example**: Install [@anthropics/skill-creator](https://modelscope.cn/skills/@anthropics/skill-creator)

```bash
curl -fsSL https://modelscope.cn/skills/install.sh | bash -s -- @anthropics/skill-creator
```

### Install a Skill Collection

```bash
curl -fsSL https://modelscope.cn/skills/install.sh | bash -s -- --collection {collection_id}
```

**Example**: Install [modelscope/awesome-skills](https://modelscope.cn/collections/modelscope/awesome-skills)

```bash
curl -fsSL https://modelscope.cn/skills/install.sh | bash -s -- --collection modelscope/awesome-skills
```

### Install Private Skills/Collections

For private (non-public) Skills or collections, you need to specify an access token using the `--token` parameter:

```bash
# Install private Skill
curl -fsSL https://modelscope.cn/skills/install.sh | bash -s -- {private_skill_id} --token {Your_ModelScope_Token}

# Install private collection
curl -fsSL https://modelscope.cn/skills/install.sh | bash -s -- --collection {private_collection_id} --token {Your_ModelScope_Token}
```

---

## Installation Method Comparison

| Method | Use Case | Features |
|------|----------|------|
| npx | Quick trial | No additional tools required, works with Node.js environment |
| ModelScope SDK | Daily usage | Complete functionality, supports more advanced operations |
| Bash script | Automated deployment | Suitable for CI/CD pipelines or batch installation |