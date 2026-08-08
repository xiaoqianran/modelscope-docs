<!-- modelscope-docs: Introduction to Skills Center | skills/intro/intro_EN.md -->

**Welcome to the ModelScope Skills Center!**

## What is a Skill
### Original Meaning

**Skill** refers to the method or capability required to accomplish a specific task.

### Technical Definition

In Agent development, **a Skill is a structured capability encapsulation** that enables large language models to invoke external tools, code, or knowledge on demand to complete specific tasks.

Its specification originates from the **Anthropic Agent Skills Protocol**, with core principles:
> Package "functional description + input/output definitions + execution logic + reference materials" into a standard folder for agents to discover and execute.

A Skill requires only a minimum of one `SKILL.md` file:

```yaml
---
name: skill_name
description: A brief description of the functionality
---

## Usage Instructions
- Function: What it does
- Input: What parameters are needed
- Output: What results are returned
- Example: Code snippet for invocation
```

> ✅ Optional extensions: `scripts/` (executable code), `resources/` (static resources), `reference.md` (detailed documentation)

**Skill = Standardized Description + Executable Logic + Context Management**, making it a key component that enables large models to transition from "being able to chat" to "being able to take action."

## How to Search and Discover Skills

After entering the ModelScope Skills Center, you can find the skills you need through the following methods:

**Keyword Search**
Enter a functional description in the search box, such as "weather," "code execution," or "PDF parsing." The system will match skill names, descriptions, and tags.

**Category Filtering**
Filter by the category panel on the left. Common categories include:
- Development Tools: Code generation, debugging, deployment
- Data Processing: Format conversion, cleaning, analysis
- Content Creation: Copywriting, image generation, video
- Industry Applications: Healthcare, legal, education, finance
- General Tools: Search, computation, translation

**View Skill Cards**
Each skill displays its name, brief description, author, tags, and basic statistics. Click the name to enter the details page, where you can view the complete description, input/output definitions, and usage examples.

---

## How to Download and Use Skills


### Downloading Skills
**Method 1: Command-Line Installation (Recommended)**

If the skill supports package management installation, you can directly execute:

```bash
# Node.js environment
npx skills add https://modelscope.cn/skills/<skill-id>

# Bash execution
curl -fsSL https://modelscope.cn/skills/install.sh | bash -s -- <skill-id>
```

The `<skill-id>` format is `@author/skill-name`, which can be copied from the top of the skill details page.

**Method 2: Manual Download**

1. On the skill details page, click the "Download" button to get the ZIP package
2. Extract to a local directory, such as `./skills/weather_query/`
3. Ensure the directory contains the `SKILL.md` file


### Using Skills

**Using Skills in Common Software**

## How to Use Skills in Various Software

ModelScope Skills follow the common Agent Skills standard protocol, which is essentially a "structured capability package." As long as the software supports loading external skills or tools, it can be integrated and used through the following methods.

### Core Concept

**Treat the Skill as a "plugin" or "extension package"**: It contains functional descriptions, parameter definitions, and execution logic. The software only needs to load it according to the specification, enabling the AI to invoke the capability.

### General Integration Steps

**1. Obtain the Skill Package**
- Download the ZIP package from ModelScope or install via command line
- Ensure the local package includes `SKILL.md` and necessary script/resource files

**2. Place it in the Software's Skills Directory**
- Most software that supports Skills has a configuration option to specify the skill loading path (e.g., `skills/`, `plugins/`)
- Place the Skill folder in that directory, or declare the path in the configuration file

**3. Enable and Configure**
- Enable the skill in the software configuration (some software requires manually listing skill names)
- If parameters such as API keys or endpoints are required, supplement the configuration according to the skill instructions

**4. Invoke in Conversations or Workflows**
- Trigger via natural language (e.g., "help me check the weather"), and the software automatically matches the skill
- Or invoke explicitly via commands/instructions (e.g., `/weather_query city=Hangzhou`)

### Integration Methods for Common Software Types

| Software Type | Typical Integration Method | Example |
|----------|--------------|------|
| **Local AI Assistants** | Configure `skills_dir` path, restart to load | OpenClaw, CoPaw |
| **IDE Plugins** | Add custom skill directory in plugin settings | VS Code, Cursor |
| **Chatbots** | Access skill execution logic via webhook or plugin mechanism | DingTalk, Feishu bots |
| **Low-Code Platforms** | Import skill configuration as "custom tools" | Dify, Flowise |
| **MCP-Supported Platforms** | Register skill endpoints via MCP Server | Claude Desktop, other MCP clients |

### Key Checkpoints

- ✅ Does the software support loading external skills/tools (check documentation for keywords: `skills`, `tools`, `plugins`, `extensions`)
- ✅ Is the Skill's `input_schema` compatible with the software's parameter passing method
- ✅ Does the execution environment meet the skill's dependencies (e.g., Python version, network permissions)
- ✅ Is sandbox or access control enabled to ensure execution safety

**Using in ms-agent**

```python
from ms_agent.agent import create_agent_skill

agent = create_agent_skill(
    skills_dir="./skills/weather_query",  # local path
    # or reference a community skill
    # skills_dir="@author/skill-name",
    model="Qwen/Qwen3-235B-A22B-Instruct-2507"
)

result = agent.run("What's the weather like in Hangzhou today?")
print(result)
```

**Verifying Whether the Skill is Active**

- Call `agent.list_skills()` to view the list of loaded skills
- Use `agent.test_skill("skill_name", **params)` to test a specific skill individually
- Check log output to confirm whether the skill is triggered correctly

**Notes**

- For first-time use, it is recommended to enable `use_sandbox=True` to execute scripts in an isolated environment, avoiding security risks
- Some skills depend on third-party APIs and require you to configure your own keys or network permissions
- Before use, read the `input_schema` in the skill description to ensure the parameter format is correct
- If you encounter issues, you can leave a message in the "Feedback" section on the skill details page, or refer to the example code provided by the author
