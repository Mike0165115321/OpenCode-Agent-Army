# Anime Short — Design Template

## Visual Style
- **Style:** Anime-inspired, clean, flat colors with soft gradients
- **Palette:** Per-character accent color + dark background (#1a1a2e) + white text
- **Typography:** 
  - Titles: Built-in sans-serif (system-ui, Arial, sans-serif)
  - Subtitles: System-ui
  - Sizes: Title 64px+, subtitle 32px+, body 24px
- **Motion:** Smooth ease-in-out, GSAP power3 easing
- **Background:** Solid color or gradient per scene

## Composition
- 1920×1080, 30 FPS
- Character positioned per storyboard (left/center/right)
- Speech bubbles with 24px padding, 16px border-radius
- Text centered or aligned per character position

## Animation Rules
- Entrance: GSAP `.from()` with y-offset + opacity
- Scene transitions: Crossfade (opacity)
- Character animations: idle breathing (subtle y-float), pose transitions
- Max 5 distinct animation types per POC

## Constraints
- All assets must be local PNG with transparency
- No external URLs during render
- Fonts: system built-in only
