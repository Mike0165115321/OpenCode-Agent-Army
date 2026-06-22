# OpenCode Agent Army — Architecture

> **Evidence Strength Key:** `Direct` = from files | `Inferred` = derived from code/config | `Assumed` = working premise | `Proposed` = not yet implemented

---

## 1. System Overview

**OpenCode Agent Army** is not a traditional application. It is a **multi-agent orchestration configuration** for [OpenCode](https://opencode.ai) — an AI coding assistant — augmented with a **media production pipeline** for generating anime-style videos via [HyperFrames](https://hyperframes.ai).

```
┌──────────────────────────────────────────────────────────────────┐
│                    OpenCode Agent Army                            │
│                                                                  │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐  │
│  │  Layer 1: Agents     │    │  Layer 2: Media Pipeline        │  │
│  │  (open reason + act) │    │  (deterministic production)     │  │
│  │                     │    │                                 │  │
│  │  @captain ──► G1    │    │  @director ─► SCRIPT.md         │  │
│  │            ├── G2   │    │  Asset Gate ─► validate         │  │
│  │            └── G3   │    │  @coder ─► composition          │  │
│  │                     │    │  @mediaqa ─► snapshots          │  │
│  └─────────────────────┘    └─────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

*Source: `CONTEXT.md`, `opencode.json`, `docs/media-workflow.md` — Direct*

---

## 2. Agent Architecture

### 2.1 Agent Hierarchy

```
                                    You (User)
                                       │
                                   @captain
                                  (orchestrator)
                              ┌───────┼───────────┐
                              │       │           │
                         Group 1  Group 2    Group 3
                      (Desktop)  (Build)    (Media)
```

*Source: `00-captain.md`, `CONTEXT.md` — Direct*

### 2.2 Agent Roles & Boundaries

| Agent | Model | Permission | Boundary |
|-------|-------|------------|----------|
| **@captain** | opencode/deepseek-v4-flash-free | full orchestrator | Classifies + delegates only |
| **@vision** | ollama/qwen3-vl:8b | screen read-only | Snapshots, OCR, UI detection |
| **@desktop** | opencode/deepseek-v4-flash-free | Click/Type/Shortcut | Windows app control |
| **@browser** | opencode/deepseek-v4-flash-free | Playwright | Web navigation |
| **@architect** | openai/gpt-5.5 | **edit=deny, write=deny** | Design only |
| **@coder** | deepseek/v4-pro | **full access** | Implementation |
| **@reviewer** | opencode/deepseek-v4-flash-free | **edit=deny, write=deny** | Code review |
| **@qa** | opencode/deepseek-v4-flash-free | **edit=deny**, bash=ask | Automated checks |
| **@director** | openai/gpt-5.5 | **edit=deny, write=deny** | Script/storyboard |
| **@mediaqa** | ollama/qwen3-vl:8b | **edit=deny, write=deny** | Visual QA |

*Source: `opencode.json` (agent config), `.opencode/agents/*.md` (role definitions) — Direct*

### 2.3 Key Architectural Decisions

| Decision | Rationale | Source |
|----------|-----------|--------|
| Agents split by capability groups | Prevents privilege escalation — desktop agents can't write files, build agents can't click UI | `SECURITY.md` |
| @director and @mediaqa are read-only | Creative work separated from technical implementation | `08-director.md` |
| @coder has full access but git push=ask | Enables implementation while preventing accidental remote pushes | `opencode.json` permission rules |
| Ollama for vision (local privacy) | No API cost, no data leaving machine | `01-vision.md` |
| OpenAI GPT-5.5 for architect/director | Higher reasoning quality for design decisions | `04-architect.md`, `08-director.md` |

*Source: Agent `.md` files, `opencode.json` permissions — Direct*

---

## 3. Media Pipeline Architecture

### 3.1 Pipeline Stages

```
Brief ──► Script ──► Assets ──► Compose ──► Check ──► Render ──► MP4
  │          │          │           │          │          │
  │    @director   Asset Gate   @coder    @reviewer   hyperframes
  │    SCRIPT.md   validate     index.html @qa         render
  │    STORYBOARD  manifest     GSAP tl    @mediaqa
  └──────────────────────────────────────────────────────────►
```

*Source: `docs/media-workflow.md`, `09-media-qa.md`, `08-director.md` — Direct*

### 3.2 File Responsibility Map

| File | Responsibility | Layer |
|------|---------------|-------|
| `opencode.json` | Root config: providers, MCP, agents, permissions | Orchestration |
| `CONTEXT.md` | Environment context + orchestration rules for primary agent | Orchestration |
| `.opencode/agents/00-captain.md` | Task classification + delegation logic | Orchestration |
| `.opencode/agents/01-09-*.md` | Per-agent instructions + permission boundaries | Orchestration |
| `index.html` | HyperFrames composition (the actual video) | Media |
| `schemas/` | JSON Schemas (character, asset-manifest, storyboard) | Media |
| `templates/anime-short/` | Production document templates for @director | Media |
| `characters/<id>/` | Character bible + manifests + pose SVGs/PNGs | Media |
| `scripts/env-check.mjs` | Environment prerequisite verification | Quality |
| `scripts/validate-assets.mjs` | Asset integrity checks | Quality |
| `scripts/snapshot-video.ps1` | Keyframe extraction from rendered video | Quality |
| `scripts/render-video.ps1` | Render command wrapper | Media |
| `qa/` | Snapshots + QA reports | Quality |
| `docs/` | Architecture + workflow documentation | Knowledge |
| `SECURITY.md` | Security guidelines and agent permissions | Safety |

*Source: Inspection of each file purpose — Direct*

### 3.3 Data Flow (Media Pipeline)

```
@director: Creative Brief
    │
    ▼
[SCRIPT.md] [STORYBOARD.md] [ASSET_MANIFEST.json]
    │
    ▼
Asset Gate:
  ┌─ Validate manifest entries exist
  └─ Check status === "approved"
    │
    ▼
@coder: Read storyboard + manifest → Write index.html
    │
    ▼
Quality Gates (sequential):
  ┌─ @reviewer: CRITICAL/MAJOR/MINOR issues
  ├─ @qa: hyperframes lint + validate + asset check
  ├─ @mediaqa: snapshot visual inspection
  └─ Fix loop (max 2 rounds)
    │
    ▼
hyperframes render → akira-intro-poc.mp4
    │
    ▼
QA Report → qa/report.json
```

*Source: `docs/media-workflow.md`, `00-captain.md` (media section) — Direct*

---

## 4. Module Map

### 4.1 Module Relationships

```
┌──────────────┐    references    ┌──────────────────┐
│  Characters   │◄──────────────►│   Templates       │
│  (assets)     │                 │   (production     │
│               │                 │    documents)     │
└──────┬───────┘                  └──────────────────┘
       │ used by
       ▼
┌──────────────┐    validated by  ┌──────────────────┐
│  index.html  │◄──────────────►│  Scripts          │
│  (composition)│                 │  (env-check,      │
│               │                 │   validate-assets)│
└──────┬───────┘                  └──────────────────┘
       │ generates
       ▼
┌──────────────┐    inspected by  ┌──────────────────┐
│  Output MP4   │◄──────────────►│  QA               │
│  (renders/)   │                 │  (snapshots +     │
│               │                 │   report.json)    │
└──────────────┘                  └──────────────────┘
       │
       ▼
┌──────────────┐
│  Projects/   │
│  (generated)  │
└──────────────┘
```

*Source: File structure + dependency analysis — Direct*

### 4.2 External Dependencies

| Dependency | Version | Purpose | Source |
|-----------|---------|---------|--------|
| Node.js | >= 22 | Runtime | `package.json` engines (inferred) |
| HyperFrames | ^0.7.0 | Video composition + rendering | `package.json` — Direct |
| FFmpeg | >= 7 | Video encoding | `env-check.mjs` — Direct |
| GSAP | 3.14.2 | Animation engine (CDN in composition) | `index.html` — Direct |
| Ollama | qwen3-vl:8b | Vision model for @vision + @mediaqa | `opencode.json` — Direct |
| OpenAI | GPT-5.5 | Reasoning for @architect + @director | `opencode.json` — Direct |

*Note: GSAP is loaded from CDN during composition — the HyperFrames compiler inlines it into the output. No external URL access during render.* — Direct

---

## 5. Open Questions

> Identified during architecture mapping. These do not block current work but affect future phases.

| # | Question | Impact | Suggested Action |
|---|----------|--------|-----------------|
| Q1 | Should AI-Council-Studio assets be merged into this repo or remain separate? | Duplication of TTS/mouth-shape logic | Decide at Phase 4 (Audio) |
| Q2 | Image provider for Phase 3: local ComfyUI, external FLUX API, or OpenAI Image? | Architecture of `ImageProvider` interface | Research before Phase 3 |
| Q3 | Git LFS or object storage for generated PNG assets? | Repo size management | Evaluate at Phase 3 |
| Q4 | Multi-character scenes — will this be needed in Phase 2+? | Composition complexity | Clarify before Phase 2 template expansion |
| Q5 | Docker render worker — local only or CI/CD integration? | Automation infrastructure | Define at Phase 5 |

*Source: Analysis of current architecture gaps — Inferred*

---

## 6. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | SVG placeholders don't behave like real PNGs (transparency, alpha, scaling) | Low | Medium | Phase 1 uses SVGs; Phase 3+ will use actual PNGs |
| R2 | Ollama Qwen3-VL 8B may not run reliably alongside Chrome (32GB RAM shared) | Medium | High | Monitor resource usage; fallback to @vision screenshot-only |
| R3 | Git push of large generated assets accidentally (despite .gitignore) | Low | Medium | .gitignore covers *.mp4, renders/, snapshots/; git push=ask |
| R4 | Phase 2 template complexity grows unmaintainable | Medium | Low | Plans caps at 5 animation types, 3 poses per POC |

*Source: Context from `CONTEXT.md` (32GB RAM), git rules, plan constraints — Inferred*

---

## 7. Validation Gate Answers

### Q1: Claim traceability — Does every important claim have a source?
- **Yes** — Every claim in this document is labeled `Direct`, `Inferred`, or `Assumed` with the source file. No unlabeled claims.

### Q2: Scope alignment — Does the final scope match the intake scope?
- **Yes** — Intake scope: "explain project structure, create /docs". Output: `docs/ARCHITECTURE.md` with all architectural views. No scope creep.

### Q3: Handoff readiness — Does the handoff include unknowns and safe next actions?
- **Yes** — Open questions (Q1–Q5), risk register (R1–R4), and next steps (below) are all documented.

---

## 8. Recommended Next Steps

1. **Review this architecture document** — Confirm or correct assumptions before Phase 2 expansion
2. **Answer open questions Q1–Q5** — Especially Q4 (multi-character) which affects template design
3. **Phase 2: Structured Media Pipeline** — Activate @director and @mediaqa in actual workflows
4. **Connect real image provider** — Begin planning for Phase 3 pose generation
5. **Commit current state to GitHub** — All Phase 0 and Phase 1 work is uncommitted

---

*Document created: 2026-06-23 | Pass level: Focus | Mode: Existing System Mapping*
