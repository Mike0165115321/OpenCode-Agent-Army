# OpenCode Agent Army — Project Context

## Project Info
- **Name:** OpenCode Agent Army
- **GitHub:** https://github.com/Mike0165115321/OpenCode-Agent-Army
- **Local:** `E:\Project\OpenCode-Agent-Army`

## Agent Architecture

### Primary Agent (You)
**Model:** `opencode/deepseek-v4-flash-free`
You are the orchestrator. Use `task` to delegate to specialist agents.

### Group 1: Desktop & Browser Control
| Agent | Model | Tools |
|-------|-------|-------|
| @vision | ollama/qwen3:8b | playwright, windows-mcp (Snapshot) |
| @desktop | opencode/deepseek-v4-flash-free | windows-mcp (Click, Type, Shortcut, Scroll, Move, App, Process) |
| @browser | opencode/deepseek-v4-flash-free | playwright (navigate, click, fill, extract) |

### Group 2: Build Engineering
| Agent | Model | Tools | Permission |
|-------|-------|-------|------------|
| @architect | openai/gpt-5.5 | read, grep, glob | edit=deny, write=deny |
| @coder | deepseek/v4-pro | read, write, edit, bash | full |
| @reviewer | opencode/deepseek-v4-flash-free | read, grep, glob, bash | edit=deny, write=deny |
| @qa | opencode/deepseek-v4-flash-free | read, grep, bash | edit=deny, write=deny |

### Group 3: Media Pipeline (Video Production)
| Agent | Model | Tools | Permission |
|-------|-------|-------|------------|
| @director | openai/gpt-5.5 | read, write (script only) | edit=deny (composition), write=deny |
| @mediaqa | ollama/qwen3-vl:8b | read, bash (snapshot scripts) | edit=deny, write=deny |

Media pipeline flow (see `docs/media-workflow.md`):
1. @captain receives brief → classifies as "media"
2. @director creates SCRIPT.md, STORYBOARD.md, ASSET_MANIFEST.json
3. Asset Gate validates all assets exist and are approved
4. User approves new character art
5. @coder creates HyperFrames composition
6. @reviewer checks code + animation contract
7. @qa runs doctor, lint, validate
8. @mediaqa checks snapshots at key timecodes
9. Fix only CRITICAL and MAJOR issues
10. Render MP4
11. Report file, QA results, and cost

### Group 4: Ad-Hoc
Handle directly without delegation.

## Orchestration Rules

### Task Classification
Classify every request before delegating:
- **Simple** → handle directly (file search, Q&A, quick code lookup)
- **Desktop** → involves app/window control → delegate to Group 1
- **Browser** → involves web navigation → delegate to Group 1
- **Build** → involves designing/coding/testing → delegate to Group 2
- **Media** → involves video/animation production → delegate to Group 3

### Before Delegating
1. Classify the task into exactly one category
2. Choose the minimum agents needed
3. Never run destructive actions (delete, overwrite, force push) without user confirmation
4. For screen-dependent tasks, always call @vision BEFORE @desktop/@browser

### Build Pipeline (Group 2)
1. **@architect** first — produces the design spec (read-only)
2. **@coder** implements from the spec — only after spec is ready
3. **@reviewer** reviews the code — reports categorized issues (CRITICAL/MAJOR/MINOR)
4. Fix CRITICAL and MAJOR issues via **@coder**
5. **@reviewer** re-reviews to confirm fixes
6. **@qa** runs linters, type checkers, and tests
7. If QA fails → return to **@coder** once
8. **Stop after 2 fix loops** and report remaining issues to the user

### Output Format
Always report back to the user with:
- What was done
- Result: ✅ success / ⚠️ partial / ❌ failed
- Next steps if applicable

## Environment
- **Shell:** PowerShell 7
- **Node.js:** v22.16.0
- **npm:** 10.9.2
- **Python:** uv (Astral) 0.11.3
- **FFmpeg:** v8.1 (required for HyperFrames rendering)
- **API Keys:**
  - DeepSeek: env DEEPSEEK_API_KEY (for @coder)
  - OpenAI: OAuth (ChatGPT Pro, for @architect)
- **Ollama:** qwen3:8b, qwen3-vl:4b, qwen3-vl:8b
- **HyperFrames:** v0.7.0 (pinned in package.json)
- **Warning:** env OPENAI_API_BASE is set to https://api.deepseek.com — opencode.json overrides OpenAI base URL to fix this

## Media Pipeline: Writable Directories
Agents in the media pipeline may write to these directories only:
- `scripts/` — utility scripts
- `characters/*/` — character bibles and manifests
- `templates/anime-short/` — composition templates
- `schemas/` — JSON schemas
- `projects/generated-projects/*/` — per-project output
- `qa/` — QA reports

Do NOT write to:
- `.opencode/` — agent configurations (read-only for media agents)
- Root config files (opencode.json, CONTEXT.md, SECURITY.md — update only with user approval)

## Screen Configuration
- **Display 0 (จอซ้าย/jอ1)** = `\\.\DISPLAY1`: X=-1920,Y=0, 1536×960 logical (DPI 125%, physical 1920×1200)
  - Logical bounds: x=-1920 **ถึง x=-384** (1536 px wide)
- **Display 1 (จอขวา/จอ2)** = `\\.\DISPLAY5`: X=0,Y=0, 1920×1080, ⭐ Primary
  - Logical bounds: x=0 **ถึง x=1920** (1920 px wide)
- **ช่องว่าง logical:** x=-384 ถึง x=0 (384px) — เกิดจาก DPI scaling ไม่มีจออยู่ตรงนี้
- **Virtual desktop:** X=-1920 to 1920 (3840 px), Y=0 to 1080
- All windows-mcp Click/Type coordinates use logical (virtual desktop) pixel space
- Snapshot tool captures at physical resolution; apply `coordinate_scale` from Snapshot output when mapping

## MCP Servers
- playwright: npx @playwright/mcp@latest
- sequential-thinking: npx @modelcontextprotocol/server-sequential-thinking
- mcpvault: npx @bitbonsai/mcpvault@latest E:\MikeData (Obsidian vault)
- windows-mcp: windows-mcp serve
