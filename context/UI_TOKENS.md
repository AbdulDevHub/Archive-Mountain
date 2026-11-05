# UI Tokens

The gallery's design values, so new UI matches the bright, daytime frosted-glass look.
The source of truth is `Gallery/src/styles/theme.css` (`:root`) and `Gallery/src/data/sections.ts` (per-valley colours). Update this file when either changes.

## Base
- Text: `--ink #1b2a3a`, `--ink-soft #4d5f71`, `--ink-faint #7b8a99`
- Glass surfaces: `--glass rgba(255,255,255,.7)`, `--glass-strong .9`, 14px backdrop blur, `--glass-border rgba(255,255,255,.75)`
- Summit / "All" accent: `--summit #38bdf8` (also the summit flag)
- Radius: `--radius 18px`, `--radius-sm 12px`; pills use `999px`
- Fonts: `Outfit` (display: titles, labels, dock), `Inter` (body)
- Motion: `--ease-out cubic-bezier(.22,1,.36,1)`; all animation is disabled under `prefers-reduced-motion`
- Layout: `--gutter 16px` (12px under 640px), `--panel-w clamp(400px, 56vw, 980px)`; the panel becomes a bottom sheet at 860px and below

## Valley accents (`--accent` on cards, pills, labels, glow)
| Section | Accent | Meadow tint |
| --- | --- | --- |
| Awesome Effects | `#8b5cf6` | `#7cc49a` |
| Awesome Websites | `#e07a5f` | `#96c96b` |
| App Valley | `#2f6fe0` | `#8cc47e` |
| AI Valley | `#0e9f9f` | `#b9c968` |
| UI & Portfolios | `#e9a800` | `#a8d46f` |
| Chrome Extensions | `#ef476f` | `#7fb86c` |

## World palette
Sand `#f2dca4`, alpine grass `#93b47c`, rock `#a59789`, snow `#f6faff`, shallow sea `#7fe3dc`, deep sea `#2d8fc4`. The sky and sun colours come from `daylightAt()` in `world/lighting.ts`.
