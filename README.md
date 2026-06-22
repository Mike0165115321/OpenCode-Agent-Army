# Anime Video Pipeline

สร้างวิดีโออนิเมะด้วย HyperFrames

## วิธีใช้

```bash
# ดูตัวอย่าง
npm run preview

# Render
npm run render -- --output my-video.mp4

# หรือ
npx hyperframes render --output my-video.mp4
```

## ไฟล์หลัก
- `index.html` — composition หลัก
- `characters/akira/` — ตัวละคร Akira (SVG poses)
- `scripts/` — utility scripts

## Prerequisites
- Node.js 22+
- FFmpeg 7+
- `npm install`
