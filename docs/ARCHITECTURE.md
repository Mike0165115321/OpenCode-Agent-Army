# OpenCode Agent Army — สถาปัตยกรรม

> **ป้ายระดับหลักฐาน:** `Direct` = ยืนยันจากไฟล์ | `Inferred` = อนุมานจากโค้ด/config | `Assumed` = สมมติฐานที่ใช้ทำงาน | `Proposed` = ยังไม่ implement

---

## 1. ภาพรวมระบบ

**OpenCode Agent Army** ไม่ใช่แอปพลิเคชันทั่วไป มันคือ **การจัดวาง multi-agent** สำหรับ [OpenCode](https://opencode.ai) — AI coding assistant — ที่เพิ่ม **สายพานผลิตสื่อ (Media Pipeline)** สำหรับสร้างวิดีโอแนวอนิเมะผ่าน [HyperFrames](https://hyperframes.ai)

```
┌──────────────────────────────────────────────────────────────────┐
│                    OpenCode Agent Army                            │
│                                                                  │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐  │
│  │  Layer 1: Agents     │    │  Layer 2: Media Pipeline        │  │
│  │  (คิด + สั่งการ)      │    │  (ผลิตแบบ deterministic)        │  │
│  │                     │    │                                 │  │
│  │  @captain ──► G1    │    │  @director ─► SCRIPT.md         │  │
│  │            ├── G2   │    │  Asset Gate ─► ตรวจสอบ          │  │
│  │            └── G3   │    │  @coder ─► composition          │  │
│  │                     │    │  @mediaqa ─► snapshots          │  │
│  └─────────────────────┘    └─────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

*ที่มา: `CONTEXT.md`, `opencode.json`, `docs/media-workflow.md` — Direct*

---

## 2. สถาปัตยกรรม Agent

### 2.1 ลำดับชั้น Agent

```
                                    คุณ (ผู้ใช้)
                                       │
                                   @captain
                                  (ผู้ประสานงาน)
                              ┌───────┼───────────┐
                              │       │           │
                         Group 1  Group 2    Group 3
                      (Desktop)  (Build)    (Media)
```

*ที่มา: `00-captain.md`, `CONTEXT.md` — Direct*

### 2.2 บทบาทและขอบเขตของ Agent

| Agent | Model | สิทธิ์ | ขอบเขต |
|-------|-------|--------|--------|
| **@captain** | opencode/deepseek-v4-flash-free | จัดการทุกอย่าง | แยกประเภทงาน + มอบหมายเท่านั้น |
| **@vision** | ollama/qwen3-vl:8b | อ่านหน้าจออย่างเดียว | Snapshots, OCR, หา UI elements |
| **@desktop** | opencode/deepseek-v4-flash-free | คลิก/พิมพ์/คีย์ลัด | ควบคุม Windows app |
| **@browser** | opencode/deepseek-v4-flash-free | Playwright | ท่องเว็บ |
| **@architect** | openai/gpt-5.5 | **edit=deny, write=deny** | ออกแบบอย่างเดียว |
| **@coder** | deepseek/v4-pro | **เข้าถึงเต็ม** | ลงมือเขียนโค้ด |
| **@reviewer** | opencode/deepseek-v4-flash-free | **edit=deny, write=deny** | รีวิวโค้ด |
| **@qa** | opencode/deepseek-v4-flash-free | **edit=deny**, bash=ask | ตรวจสอบอัตโนมัติ |
| **@director** | openai/gpt-5.5 | **edit=deny, write=deny** | เขียนบท/storyboard |
| **@mediaqa** | ollama/qwen3-vl:8b | **edit=deny, write=deny** | ตรวจสอบ visual |

*ที่มา: `opencode.json` (config agent), `.opencode/agents/*.md` (นิยามบทบาท) — Direct*

### 2.3 การตัดสินใจทางสถาปัตยกรรมที่สำคัญ

| การตัดสินใจ | เหตุผล | ที่มา |
|-------------|--------|------|
| แยก Agent ตามกลุ่มความสามารถ | ป้องกัน privilege escalation — desktop agents เขียนไฟล์ไม่ได้, build agents คลิก UI ไม่ได้ | `SECURITY.md` |
| @director และ @mediaqa เป็น read-only | แยกงานสร้างสรรค์ออกจากงานเทคนิค | `08-director.md` |
| @coder เข้าถึงเต็ม แต่ git push=ask | ให้เขียนโค้ดได้ แต่ป้องกันการ push โดยไม่ตั้งใจ | `opencode.json` permission |
| Ollama สำหรับ vision (local) | ไม่เสียค่า API, ข้อมูลไม่ต้องออกเครื่อง | `01-vision.md` |
| OpenAI GPT-5.5 สำหรับ architect/director | คุณภาพการคิดออกแบบสูงกว่า | `04-architect.md`, `08-director.md` |

*ที่มา: ไฟล์ `.md` ของ Agent, `opencode.json` permissions — Direct*

---

## 3. สถาปัตยกรรม Media Pipeline

### 3.1 ขั้นตอนใน Pipeline

```
Brief ──► Script ──► Assets ──► ประกอบ ──► ตรวจ ──► Render ──► MP4
  │          │          │           │          │          │
  │    @director   Asset Gate   @coder    @reviewer   hyperframes
  │    SCRIPT.md   ตรวจสอบ     index.html @qa         render
  │    STORYBOARD  manifest     GSAP tl    @mediaqa
  └──────────────────────────────────────────────────────────►
```

*ที่มา: `docs/media-workflow.md`, `09-media-qa.md`, `08-director.md` — Direct*

### 3.2 ไฟล์แต่ละตัวรับผิดชอบอะไร

| ไฟล์ | หน้าที่ | ชั้น |
|------|--------|------|
| `opencode.json` | Config หลัก: providers, MCP, agents, permissions | Orchestration |
| `CONTEXT.md` | บริบท environment + กฎการทำงานของ agent หลัก | Orchestration |
| `.opencode/agents/00-captain.md` | แยกประเภทงาน + ตรรกะการมอบหมาย | Orchestration |
| `.opencode/agents/01-09-*.md` | คำแนะนำ + ขอบเขตสิทธิ์ของแต่ละ agent | Orchestration |
| `index.html` | HyperFrames composition (ตัววิดีโอจริง) | Media |
| `schemas/` | JSON Schemas (ตัวละคร, asset-manifest, storyboard) | Media |
| `templates/anime-short/` | Template เอกสารผลิตสำหรับ @director | Media |
| `characters/<id>/` | Character bible + manifest + pose SVGs/PNGs | Media |
| `scripts/env-check.mjs` | ตรวจสอบ prerequisite ของระบบ | Quality |
| `scripts/validate-assets.mjs` | ตรวจสอบความถูกต้องของ assets | Quality |
| `scripts/snapshot-video.ps1` | ดึง keyframe จากวิดีโอที่ render แล้ว | Quality |
| `scripts/render-video.ps1` | คำสั่งเรียก render แบบสะดวก | Media |
| `qa/` | Snapshots + รายงาน QA | Quality |
| `docs/` | เอกสารสถาปัตยกรรม + การทำงาน | Knowledge |
| `SECURITY.md` | แนวทางความปลอดภัย + สิทธิ์ของ agent | Safety |

*ที่มา: ตรวจสอบวัตถุประสงค์ของแต่ละไฟล์ — Direct*

### 3.3 การไหลของข้อมูล (Media Pipeline)

```
@director: รับ Brief
    │
    ▼
[SCRIPT.md] [STORYBOARD.md] [ASSET_MANIFEST.json]
    │
    ▼
Asset Gate:
  ┌─ ตรวจสอบว่ารายการใน manifest มีอยู่จริง
  └─ ตรวจสอบสถานะ === "approved"
    │
    ▼
@coder: อ่าน storyboard + manifest → เขียน index.html
    │
    ▼
Quality Gates (เรียงลำดับ):
  ┌─ @reviewer: แจ้ง issues CRITICAL/MAJOR/MINOR
  ├─ @qa: รัน hyperframes lint + validate + asset check
  ├─ @mediaqa: ตรวจสอบ snapshot ด้วยสายตา
  └─ แก้ไข (สูงสุด 2 รอบ)
    │
    ▼
hyperframes render → akira-intro-poc.mp4
    │
    ▼
รายงาน QA → qa/report.json
```

*ที่มา: `docs/media-workflow.md`, `00-captain.md` (ส่วน media) — Direct*

---

## 4. แผนผังโมดูล

### 4.1 ความสัมพันธ์ระหว่างโมดูล

```
┌──────────────┐    อ้างอิง     ┌──────────────────┐
│  Characters   │◄──────────────►│   Templates       │
│  (assets)     │                 │   (เอกสารผลิต)    │
│               │                 │                   │
└──────┬───────┘                  └──────────────────┘
       │ ถูกใช้โดย
       ▼
┌──────────────┐    ตรวจสอบโดย  ┌──────────────────┐
│  index.html  │◄──────────────►│  Scripts          │
│  (composition)│                 │  (env-check,      │
│               │                 │   validate-assets)│
└──────┬───────┘                  └──────────────────┘
       │ สร้าง
       ▼
┌──────────────┐    ตรวจสอบโดย  ┌──────────────────┐
│  Output MP4   │◄──────────────►│  QA               │
│  (renders/)   │                 │  (snapshots +     │
│               │                 │   report.json)    │
└──────────────┘                  └──────────────────┘
       │
       ▼
┌──────────────┐
│  Projects/   │
│  (ผลงานที่สร้าง) │
└──────────────┘
```

*ที่มา: โครงสร้างไฟล์ + วิเคราะห์ dependency — Direct*

### 4.2 Dependencies ภายนอก

| ตัว | เวอร์ชัน | 用途 | ที่มา |
|-----|---------|------|------|
| Node.js | >= 22 | Runtime ที่ใช้รัน | `package.json` engines (inferred) |
| HyperFrames | ^0.7.0 | ประกอบวิดีโอ + render | `package.json` — Direct |
| FFmpeg | >= 7 | เข้ารหัสวิดีโอ | `env-check.mjs` — Direct |
| GSAP | 3.14.2 | เอ็นจิน animation (CDN ใน composition) | `index.html` — Direct |
| Ollama | qwen3-vl:8b | โมเดล vision สำหรับ @vision + @mediaqa | `opencode.json` — Direct |
| OpenAI | GPT-5.5 | การคิดวิเคราะห์สำหรับ @architect + @director | `opencode.json` — Direct |

*หมายเหตุ: GSAP ถูกโหลดจาก CDN ตอนเขียน composition — ตอน render HyperFrames compiler จะ inline ให้เอง ไม่มีการเชื่อมต่อ URL ภายนอกขณะ render* — Direct

---

## 5. คำถามที่ยังเปิดอยู่

> พบระหว่างการทำแผนที่สถาปัตยกรรม ไม่ขัดขวางงานปัจจุบัน แต่มีผลต่อเฟสถัดไป

| # | คำถาม | ผลกระทบ | ข้อแนะนำ |
|---|-------|---------|----------|
| Q1 | ควรรวม AI-Council-Studio assets ไว้ใน repo เดียวกันหรือแยก? | โค้ด TTS/mouth-shape ซ้ำซ้อน | ตัดสินใจตอน Phase 4 (Audio) |
| Q2 | Image provider สำหรับ Phase 3: ใช้ ComfyUI ในเครื่อง, FLUX API ภายนอก, หรือ OpenAI Image? | สถาปัตยกรรมของ `ImageProvider` interface | ค้นคว้าก่อน Phase 3 |
| Q3 | ใช้ Git LFS หรือ object storage สำหรับ PNG assets ที่สร้าง? | การจัดการขนาด repo | ประเมินตอน Phase 3 |
| Q4 | ฉากที่มีหลายตัวละคร — จะต้องใช้ใน Phase 2+ ไหม? | ความซับซ้อนของ composition | ทำให้ชัดก่อนขยาย template |
| Q5 | Docker render worker — ใช้ในเครื่องหรือ CI/CD? | โครงสร้างพื้นฐาน automation | กำหนดตอน Phase 5 |

*ที่มา: วิเคราะห์ช่องว่างสถาปัตยกรรมปัจจุบัน — Inferred*

---

## 6. ทะเบียนความเสี่ยง

| # | ความเสี่ยง | โอกาส | ผลกระทบ | การป้องกัน |
|---|-----------|-------|----------|-----------|
| R1 | SVG placeholder มีพฤติกรรมต่างจาก PNG จริง (transparency, alpha, scaling) | ต่ำ | กลาง | Phase 1 ใช้ SVG; Phase 3+ จะใช้ PNG จริง |
| R2 | Ollama Qwen3-VL 8B อาจทำงานไม่เสถียรคู่กับ Chrome (RAM 32GB แบ่งกันใช้) | กลาง | สูง | ติดตามการใช้ทรัพยากร; fallback ให้ @vision ใช้ screenshot อย่างเดียว |
| R3 | เผลอ push assets ขนาดใหญ่ขึ้น GitHub (ถึงจะมี .gitignore) | ต่ำ | กลาง | .gitignore ครอบคลุม *.mp4, renders/, snapshots/; git push=ask |
| R4 | ความซับซ้อนของ template Phase 2 ใหญ่เกินไป | กลาง | ต่ำ | แผนจำกัดที่ 5 animation types, 3 poses ต่อ POC |

*ที่มา: บริบทจาก `CONTEXT.md` (RAM 32GB), กฎ git, ข้อจำกัดของแผน — Inferred*

---

## 7. คำตอบ Validation Gate

### Q1: ตรวจสอบที่มาของข้อมูล — ทุก claim มีที่มาหรือไม่?
- **ใช่** — ทุก claim ในเอกสารนี้มีป้าย `Direct`, `Inferred`, หรือ `Assumed` พร้อมระบุไฟล์ที่มา ไม่มี claim ที่ไม่มีป้าย

### Q2: ขอบเขตตรงกัน — ขอบเขตสุดท้ายตรงกับที่กำหนดไว้ตอนรับงานหรือไม่?
- **ใช่** — ขอบเขตที่รับ: "อธิบายโครงสร้างโปรเจค, สร้าง /docs" ผลลัพธ์: `docs/ARCHITECTURE.md` พร้อมมุมมองสถาปัตยกรรมครบ ไม่มีการขยายขอบเขต

### Q3: พร้อมส่งต่อ — มีการบันทึก unknowns และ actions ที่ปลอดภัยหรือไม่?
- **ใช่** — คำถามที่ยังเปิดอยู่ (Q1–Q5), ทะเบียนความเสี่ยง (R1–R4), และขั้นตอนถัดไป บันทึกไว้ครบ

---

## 8. ขั้นตอนถัดไปที่แนะนำ

1. **อ่านเอกสารสถาปัตยกรรมนี้** — ยืนยันหรือแก้ไขสมมติฐานก่อนขยาย Phase 2
2. **ตอบคำถามที่ยังเปิดอยู่ Q1–Q5** — โดยเฉพาะ Q4 (หลายตัวละคร) ที่มีผลต่อการออกแบบ template
3. **Phase 2: Structured Media Pipeline** — เริ่มใช้ @director และ @mediaqa ในงานจริง
4. **เชื่อมต่อ image provider จริง** — เริ่มวางแผนสำหรับ Phase 3 (สร้างภาพ pose)
5. **Commit สถานะปัจจุบันขึ้น GitHub** — งาน Phase 0 และ Phase 1 ยังไม่ commit

---

*เอกสารสร้าง: 2026-06-23 | ระดับ Pass: Focus | โหมด: Existing System Mapping*
