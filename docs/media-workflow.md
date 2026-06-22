# Media Pipeline Workflow

> Full workflow for video production via OpenCode Agent Army

## Task Classification

When `@captain` receives a request, classify as `media` if it involves:
- Creating a video from a character
- Animating scenes
- Rendering an animation
- Producing any visual media output

## Workflow Steps

```text
1. @captain รับโจทย์และตรวจ input
2. @director สร้าง SCRIPT, STORYBOARD และ ASSET_MANIFEST
3. Asset Gate ตรวจว่ามี asset ครบหรือไม่
4. ผู้ใช้อนุมัติภาพตัวละครใหม่ที่ถูกสร้าง
5. @coder สร้าง HyperFrames composition
6. @reviewer ตรวจโค้ดและ animation contract
7. @qa รัน doctor, lint และ validate
8. @mediaqa ตรวจ snapshots
9. แก้เฉพาะ CRITICAL และ MAJOR
10. Render MP4
11. รายงานไฟล์ ผล QA และต้นทุน
```

## Asset Gate Rules

- **ห้ามข้าม Asset Gate** — asset ที่ผิดตั้งแต่ต้น ต่อให้ animation สวยก็เป็นเพียงความผิดพลาดที่เคลื่อนไหวได้
- ใช้ได้เฉพาะ asset ที่มี status = `approved`
- Assets ต้องมี manifest entry ครบทุกไฟล์
- dimension ต้องตรงตาม manifest

## Quality Gates

| Gate | Tool | Who | Pass/Fail |
|------|------|-----|-----------|
| Lint | `hyperframes lint` | @qa | 0 errors required |
| Validate | `hyperframes validate` | @qa | Pass required |
| Inspect | `hyperframes inspect` | @reviewer | 0 issues required |
| Snapshot check | Manual + @mediaqa | @mediaqa | Visual consistency |
| Render check | FFprobe | @qa | 1920×1080, 30 FPS |

## Environment Prerequisites

```bash
node --version          # >= 22
npm --version           # >= 10
ffmpeg -version         # >= 7
npx hyperframes doctor  # All checks pass
npx hyperframes --version  # >= 0.7
```
