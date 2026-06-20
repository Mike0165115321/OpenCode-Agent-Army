# OpenCode Agent Army — Project Context

## Project Info
- **Name:** OpenCode Agent Army
- **Location:** `E:\Project\OpenCode-Agent-Army`
- **Drive E:** 393 GB free
- **GitHub:** Mike0165115321

## Agent Architecture

### Group 1: Desktop & Browser Control
| Agent | Model | Tools |
|-------|-------|-------|
| @vision | google/gemini-2.5-flash-image | playwright, windows-mcp (Snapshot) |
| @desktop | opencode/deepseek-v4-flash-free | windows-mcp (Click, Type, Shortcut, Scroll, Move, App, Process) |
| @browser | opencode/deepseek-v4-flash-free | playwright (navigate, click, fill, extract) |

### Group 2: Build Engineering
| Agent | Model | Tools | Permission |
|-------|-------|-------|------------|
| @architect | openai/gpt-5.5 | read, grep, glob | edit=deny, write=deny |
| @coder | deepseek/v4-pro | read, write, edit, bash | full |
| @reviewer | opencode/deepseek-v4-flash-free | read, grep, glob, bash | edit=deny, write=deny |
| @qa | opencode/deepseek-v4-flash-free | read, grep, bash | edit=deny, write=deny |

### Group 3: Direct
Primary model (opencode/deepseek-v4-flash-free) handles simple tasks directly.

## Environment
- **Shell:** PowerShell 7
- **Node.js:** v22.16.0
- **Python:** uv (Astral)
- **API Keys:**
  - DeepSeek: env DEEPSEEK_API_KEY
  - Gemini: env GEMINI_API_KEY
  - OpenAI: OAuth (ChatGPT Pro)
- **Warning:** env OPENAI_API_BASE is set to https://api.deepseek.com — opencode.json overrides OpenAI base URL to fix this

## MCP Servers
- playwright: npx @playwright/mcp@latest
- sequential-thinking: npx @modelcontextprotocol/server-sequential-thinking
- mcpvault: npx @bitbonsai/mcpvault@latest E:\MikeData (Obsidian)
- windows-mcp: windows-mcp serve

## Workflow
For simple tasks: use primary agent directly.
For desktop/browser: primary delegates to @vision/@desktop/@browser via task tool.
For build: primary delegates to @architect -> @coder -> @reviewer -> @qa pipeline.
