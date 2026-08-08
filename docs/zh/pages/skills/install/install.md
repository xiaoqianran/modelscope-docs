<!-- modelscope-docs: Skills的下载安装 | skills/install/install_CN.md -->

# Skills 的下载安装

本文档介绍三种安装 Skills 的方式，支持安装单个 Skill 或 Skill 合集。

## 方式一：通过 npx 安装

### 安装单个 Skill

```bash
npx skills add https://modelscope.cn/skills/{skill_id}
```

**示例**：安装 [@anthropics/skill-creator](https://modelscope.cn/skills/@anthropics/skill-creator)

```bash
npx skills add https://modelscope.cn/skills/@anthropics/skill-creator
```

### 安装 Skill 合集

```bash
npx skills add https://modelscope.cn/collections/{collection_id}
```

**示例**：安装 [modelscope/awesome-skills](https://modelscope.cn/collections/modelscope/awesome-skills)

```bash
npx skills add https://modelscope.cn/collections/modelscope/awesome-skills
```

> [!NOTE]
> npx 方式不支持安装非公开（私有）的 Skill 或合集。如需安装私有资源，请使用 ModelScope SDK 或 Bash 脚本方式。

---

## 方式二：通过 ModelScope SDK 安装

### 前置条件

首先需要安装 ModelScope SDK：

```bash
pip install --upgrade modelscope
```

### 安装单个 Skill

```bash
modelscope skills add {skill_id}
```

**示例**：安装 [@anthropics/skill-creator](https://modelscope.cn/skills/@anthropics/skill-creator)

```bash
modelscope skills add @anthropics/skill-creator
```

> **提示**：也可以使用别名 `ms` 代替 `modelscope`：
> ```bash
> ms skills add @anthropics/skill-creator
> ```

### 安装多个 Skill

支持同时安装多个 Skill，多个 skill_id 之间用空格分隔：

```bash
modelscope skills add {skill_id1} {skill_id2} {skill_id3}
```

**示例**：同时安装多个 Skill

```bash
modelscope skills add @anthropics/skill-creator @modelscope/skill-web-search
```

### 安装 Skill 合集

```bash
modelscope download --collection {collection_id}
```

**示例**：安装 [modelscope/awesome-skills](https://modelscope.cn/collections/modelscope/awesome-skills)

```bash
modelscope download --collection modelscope/awesome-skills
```

更多 ModelScope SDK Cli 的功能参见 [命令行介绍](../../sdk/cli/cli_CN.md)

### 安装私有 Skill/合集

对于私有（非公开）的 Skill 或合集，需要通过 `--token` 参数指定访问令牌：

```bash
# 安装私有 Skill
modelscope skills add {private_skill_id} --token {Your_ModelScope_Token}

# 安装私有合集
modelscope download --collection {private_collection_id} --token {Your_ModelScope_Token}
```

---

## 方式三：通过 Bash 脚本安装

### 安装单个 Skill

```bash
curl -fsSL https://modelscope.cn/skills/install.sh | bash -s -- {skill_id}
```

**示例**：安装 [@anthropics/skill-creator](https://modelscope.cn/skills/@anthropics/skill-creator)

```bash
curl -fsSL https://modelscope.cn/skills/install.sh | bash -s -- @anthropics/skill-creator
```

### 安装 Skill 合集

```bash
curl -fsSL https://modelscope.cn/skills/install.sh | bash -s -- --collection {collection_id}
```

**示例**：安装 [modelscope/awesome-skills](https://modelscope.cn/collections/modelscope/awesome-skills)

```bash
curl -fsSL https://modelscope.cn/skills/install.sh | bash -s -- --collection modelscope/awesome-skills
```

### 安装私有 Skill/合集

对于私有（非公开）的 Skill 或合集，需要通过 `--token` 参数指定访问令牌：

```bash
# 安装私有 Skill
curl -fsSL https://modelscope.cn/skills/install.sh | bash -s -- {private_skill_id} --token {Your_ModelScope_Token}

# 安装私有合集
curl -fsSL https://modelscope.cn/skills/install.sh | bash -s -- --collection {private_collection_id} --token {Your_ModelScope_Token}
```

---

## 安装方式对比

| 方式 | 适用场景 | 特点 |
|------|----------|------|
| npx | 快速试用 | 无需安装额外工具，Node.js 环境即可使用 |
| ModelScope SDK | 日常使用 | 功能完整，支持更多高级操作 |
| Bash 脚本 | 自动化部署 | 适合 CI/CD 流程或批量安装 |


