# OpenCode Agent Army

[![OpenCode](https://img.shields.io/badge/opencode-%3E%3D0.25-blue)](https://opencode.ai)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A modular multi-agent configuration for OpenCode that turns your terminal into a coordinated team of AI specialists — capable of controlling Windows apps, automating browsers, and building software end-to-end.

```
┌─────────────────────────────────────────────┐
│              You (user)                      │
│          talk to the primary agent           │
├─────────────────────────────────────────────┤
│  @captain  (opencode/deepseek-v4-flash-free) │
│  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Group 1      │  │  Group 2             │  │
│  │  Desktop/     │  │  Build Engineering   │  │
│  │  Browser      │  │                      │  │
│  │               │  │  @architect  🏗️     │  │
│  │  @vision  👁️  │  │  @coder      💻     │  │
│  │  @desktop 🖱️  │  │  @reviewer   🔍     │  │
│  │  @browser 🌐  │  │  @qa         🧪     │  │
│  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Agent Roster

### Group 1: Desktop & Browser Control

| Agent | Model | Tools | Role |
|-------|-------|-------|------|
| **@vision** | `ollama/qwen3-vl:8b` | playwright, windows-mcp | Screen analysis, OCR, UI element detection |
| **@desktop** | `opencode/deepseek-v4-flash-free` | windows-mcp | Click, type, keyboard shortcuts, app control |
| **@browser** | `opencode/deepseek-v4-flash-free` | playwright | Web navigation, form filling, content extraction |

### Group 2: Build Engineering

| Agent | Model | Tools | Permission | Role |
|-------|-------|-------|------------|------|
| **@architect** | `openai/gpt-5.5` | read, grep, glob | edit=deny, write=deny | System design & specification |
| **@coder** | `deepseek/v4-pro` | read, write, edit, bash | full | Code implementation |
| **@reviewer** | `opencode/deepseek-v4-flash-free` | read, grep, glob, bash | edit=deny, write=deny | Code review & issue detection |
| **@qa** | `opencode/deepseek-v4-flash-free` | read, grep, bash | edit=deny, write=deny | Test execution & verification |

### Group 3: Ad-Hoc

The primary agent handles simple tasks directly — file search, documentation reading, Q&A — no delegation overhead.

## Prerequisites

- **OpenCode** v0.25+ (`npm i -g opencode` / `npx opencode`)
- **Node.js** 22+
- **PowerShell 7**
- **Ollama** with `qwen3-vl:8b` model (for @vision) — `ollama pull qwen3-vl:8b`
- **API Keys:**
  - [DeepSeek](https://platform.deepseek.com) API key (for @coder)
  - [OpenAI ChatGPT Pro](https://chatgpt.com) subscription (for @architect)
- **MCP Servers (auto-configured):**
  - `windows-mcp` — Windows desktop control
  - `@playwright/mcp` — Browser automation
  - `@bitbonsai/mcpvault` — Obsidian vault access
  - `@modelcontextprotocol/server-sequential-thinking` — Chain-of-thought reasoning

## Quick Start

### 1. Clone & configure

```powershell
git clone https://github.com/Mike0165115321/OpenCode-Agent-Army.git
cd OpenCode-Agent-Army
```

### 2. Set environment variables

```powershell
$env:DEEPSEEK_API_KEY = "sk-your-deepseek-key"

# @vision ใช้ local Ollama — ไม่ต้องใช้ API key
# ตรวจสอบว่า Ollama เปิดอยู่: ollama serve
```

Or use a `.env` file (see `.env.example`).

### 3. Ensure Ollama is running

```powershell
ollama serve
ollama list  # ควรเห็น qwen3-vl:8b
```

### 4. Install MCP dependencies

```powershell
# Install windows-mcp
uv tool install windows-mcp

# Required npx packages (auto-downloaded on first run):
# @playwright/mcp, @bitbonsai/mcpvault, @modelcontextprotocol/server-sequential-thinking
```

### 4. Launch OpenCode

```powershell
opencode
```

OpenCode loads `opencode.json` and all agent definitions automatically.

## Workflows

### Desktop Control
```
You: "เปิด Notepad แล้วพิมพ์ Hello World"

@captain → task @desktop: "กด Win+R, พิมพ์ notepad, Enter"
@desktop: ✅ Notepad opened
@captain → task @desktop: "พิมพ์ 'Hello World'"
@desktop: ✅ Done
```

### Screen Understanding + Action
```
You: "ดูจอหน่อย มี Chrome เปิดอยู่มั้ย"

@captain → task @vision: "Snapshot จอ มี Chrome ไหม?"
@vision: "พบ Chrome window ที่พิกัด (100, 200)"
@captain: "มี Chrome เปิดอยู่แล้วครับ"
```

### Full Build Pipeline
```
You: "สร้าง REST API CRUD ผู้ใช้ด้วย FastAPI"

@captain → task @architect: "ออกแบบระบบ CRUD ผู้ใช้"
@architect: "spec: models.py, schemas.py, routes/, tests/"
@captain → task @coder: "implement ตาม spec"
@coder: "✅ created 6 files"
@captain → task @reviewer: "review โค้ด"
@reviewer: "1 MAJOR: missing input validation"
@captain → task @coder: "fix input validation"
@coder: "✅ fixed"
@captain → task @qa: "run pytest + ruff"
@qa: "✅ 12/12 tests passed, lint clean"
@captain: "ระบบพร้อมใช้งานครับ"
```

## Configuration Reference

### `opencode.json`
Root configuration with provider setup, MCP server definitions, and agent assignments.

### `.opencode/agents/*.md`
Individual agent definitions using YAML frontmatter + markdown instructions:

| File | Agent |
|------|-------|
| `00-captain.md` | Orchestrator — delegates to specialist agents |
| `01-vision.md` | 👁️ Vision Agent |
| `02-desktop.md` | 🖱️ Desktop Control Agent |
| `03-browser.md` | 🌐 Browser Agent |
| `04-architect.md` | 🏗️ Architect Agent |
| `05-coder.md` | 💻 Coder Agent |
| `06-reviewer.md` | 🔍 Reviewer Agent |
| `07-qa.md` | 🧪 QA Agent |

### `CONTEXT.md`
Project context and orchestration rules consumed by the primary agent.

## Security

> **WARNING:** This configuration gives AI agents control over your desktop,
> browser, and file system. Review the [security guidelines](SECURITY.md)
> before deploying.

Key precautions:
- `@desktop` and `@browser` agents can execute arbitrary actions on your machine
- `@coder` has full file system write access
- Permission rules are defined per-agent; review them before use
- Never run this in a production environment without additional sandboxing

## File Structure

```
OpenCode-Agent-Army/
├── opencode.json               Root configuration
├── CONTEXT.md                  Environment & orchestration context
├── SECURITY.md                 Security guidelines
├── .env.example                Environment variable template
├── .gitignore
└── .opencode/
    └── agents/
        ├── 00-captain.md       Orchestrator
        ├── 01-vision.md        Vision
        ├── 02-desktop.md       Desktop control
        ├── 03-browser.md       Browser automation
        ├── 04-architect.md     System design
        ├── 05-coder.md         Implementation
        ├── 06-reviewer.md      Code review
        └── 07-qa.md            Testing & validation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test with `opencode lint` or run an end-to-end workflow
4. Submit a pull request

## License

MIT
