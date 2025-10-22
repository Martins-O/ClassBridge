# ClassBridge Visual Guidelines

## Palette

| Token | Hex | Use |
| --- | --- | --- |
| `brand-600` | `#2F3F73` | Primary buttons, headings, navigation |
| `brand-500` | `#3C4D8A` | Icons, hover states, links |
| `ink-900` | `#1F2937` | Core body text |
| `ink-500` | `#5F6E8F` | Secondary copy, captions |
| `surface-base` | `#F9FAFC` | App background |
| `surface-elevated` | `#FFFFFF` | Cards, modals |
| `accent-emerald` | `#2E8E68` | Primary CTA fill, success highlights |
| `accent-indigo` | `#3C4D8A` | Secondary CTA outline, icons |
| `accent-amber` | `#F2994A` | Alerts, attention chips |

## Components

- **Buttons**: primary is solid `brand-600` with white text; hover shifts to `brand-700`. Secondary is white with `brand-100` border. Ghost keeps transparent background with `brand-50` hover.
- **Cards**: default to `surface-elevated` with `border-brand-100` and `shadow-soft`. Avoid translucent backgrounds so text always sits on solid surfaces.
- **Headers**: `GradientHeader` overlays white text on a subtle navy gradient. Keep descriptions to `text-white/80` for readability.

## Typographic Scale

- Headline: `text-ink-900`
- Body: `text-ink-700`
- Secondary: `text-ink-500`
- Metadata/captions: `text-ink-400`

## Motion

- `animate-float`: small vertical drift for decorative blobs.
- `animate-pulse-soft`: low contrast breathing effect for background accents.
- Limit to decorative elements—primary interactions rely on opacity/scale transitions.

## Usage Notes

- Use `bg-surface-base` for page shells. Only hero headers use gradient accents.
- Status chips: `bg-accent-emerald text-white` for success, `bg-accent-amber text-white` for warnings, `bg-danger text-white` for destructive contexts.
- Keep text over gradients to a minimum. When unavoidable, apply `text-white` and ensure the gradient intensity stays below 20% opacity.
