# Anime Video Pipeline — โครงสร้างโปรเจกต์

## ภาพรวม

```
index.html → npx hyperframes render → MP4
```

แค่นั้น ไม่มีอะไรซับซ้อน

## ไฟล์และโฟลเดอร์

| ที่ | อธิบาย |
|----|--------|
| `index.html` | **หัวใจของโปรเจกต์** — ไฟล์ composition ที่ HyperFrames ใช้อ่าน scene, animation, timeline |
| `characters/` | ตัวละคร + assets |
| `scripts/` | utility ช่วยทำงาน |
| `qa/` | ตัวอย่างผลตรวจสอบคุณภาพ |
| `projects/` | ไว้เก็บงานที่ render แล้ว |

## การทำงาน

1. เขียน `index.html` (HTML + CSS + GSAP timeline)
2. ใช้ asset จาก `characters/` 
3. Render ด้วย `npx hyperframes render --output ชื่อ.mp4`

## ตัวละคร

```
characters/
└── akira/
    ├── CHARACTER.md     ← ข้อมูลตัวละคร (สีผม, ชุด, ข้อห้าม)
    ├── manifest.json    ← รายการ assets ทั้งหมด
    └── poses/           ← pose PNG/SVG
```

การเพิ่มตัวละครใหม่ = ก็อป `akira/` ไป改名 ใส่รูป pose แล้วเปลี่ยน `manifest.json`

## เกร็ด

- `index.html` ใช้ `data-composition-id`, `data-start`, `data-duration`, `data-track-index` กับ GSAP timeline
- ทุกอย่าง local — ไม่มี external URL ตอน render
- HyperFrames inlines ของให้เอง เปิดไฟล์ดูเฉยๆ ไม่เห็น animation ต้อง render ก่อน
