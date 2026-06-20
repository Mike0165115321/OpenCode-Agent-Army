# Security Guidelines for OpenCode Agent Army

> **WARNING:** This configuration grants AI agents significant control over
> your system. Read and understand these guidelines before use.

## Risk Overview

| Risk | Agent | Impact |
|------|-------|--------|
| Desktop control | @desktop, @vision | Can click, type, launch apps, read screen |
| Browser automation | @browser | Can navigate, fill forms, extract data |
| File modification | @coder | Can read, write, delete any file |
| Code execution | @coder, @qa | Can run arbitrary commands via bash |

## Mitigations

### 1. Permission Rules
- `@architect`, `@reviewer`, `@qa` have **edit=deny** — they cannot modify files
- `@desktop`, `@browser` have no write access to your file system
- `@coder` has full access but requires user confirmation for bash commands
- Global `bash` permissions restrict dangerous commands

### 2. User Confirmation
- `edit: ask` at global level — you must approve every file change
- `bash: ask` for non-whitelisted commands — you approve each execution
- You always see what the agent wants to do before it does it

### 3. Recommended Practices
- Review agent `.md` files before first use
- Start with a test session — observe what agents do
- Never run with `edit: allow` or `bash: allow` in production
- Consider running in a VM or sandbox for high-risk operations
- Keep the environment variables secure (never commit API keys)

### 4. Git Safety
- Permission rules prevent `git reset`, `git clean`, `git checkout` from running without approval
- Review all staged changes before committing
- The `@reviewer` cannot push code — only `@coder` can, with your approval

## Reporting Issues

If you discover a security concern with this configuration, please open an issue on GitHub.
