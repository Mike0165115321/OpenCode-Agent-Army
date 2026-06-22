# Media Pipeline — ขั้นตอนการทำงาน

> คู่มือการทำงานสายพานผลิตวิดีโอผ่าน OpenCode Agent Army

## การแยกประเภทงาน

เมื่อ `@captain` ได้รับคำขอ ให้จัดเป็น `media` ถ้าเกี่ยวข้องกับ:
- สร้างวิดีโอจากตัวละคร
- ทำอนิเมชันฉากต่างๆ
- Render อนิเมชัน
- ผลิตสื่อ visual ใดๆ

## ขั้นตอนการทำงาน

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

## กฎ Asset Gate

- **ห้ามข้าม Asset Gate** — asset ที่ผิดตั้งแต่ต้น ต่อให้ animation สวยก็เป็นเพียงความผิดพลาดที่เคลื่อนไหวได้
- ใช้ได้เฉพาะ asset ที่มี status = `approved`
- Assets ต้องมี manifest entry ครบทุกไฟล์
- ขนาด (dimension) ต้องตรงตาม manifest

## ด่านตรวจสอบคุณภาพ (Quality Gates)

| ด่าน | เครื่องมือ | ผู้รับผิดชอบ | เกณฑ์ผ่าน |
|-----|-----------|-------------|-----------|
| Lint | `hyperframes lint` | @qa | 0 errors |
| Validate | `hyperframes validate` | @qa | ต้องผ่าน |
| Inspect | `hyperframes inspect` | @reviewer | 0 issues |
| ตรวจ snapshot | Manual + @mediaqa | @mediaqa | ความสม่ำเสมอทางภาพ |
| ตรวจ Render | FFprobe | @qa | 1920×1080, 30 FPS |

## สิ่งที่ต้องมีก่อนเริ่ม (Prerequisites)

```bash
node --version          # ต้อง >= 22
npm --version           # ต้อง >= 10
ffmpeg -version         # ต้อง >= 7
npx hyperframes doctor  # ทุกข้อต้องผ่าน
npx hyperframes --version  # ต้อง >= 0.7
```
