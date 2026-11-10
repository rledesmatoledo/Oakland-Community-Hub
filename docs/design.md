# UI design — "D: Oakland, professional"

The visual direction for Oakland Hub. Calm, civic, readable. Content comes first; color is used sparingly and always means something.

## Colors

| Token | Hex | Use |
| --- | --- | --- |
| `canvas` | `#FBFAF7` | Page background (warm off-white) |
| `surface` | `#FFFFFF` | Cards and other tappable containers |
| `ink` | `#14161A` | Primary text |
| `muted` | `#5B616B` | Meta text, secondary labels |
| `line` | `#E6E3DC` | Card borders, dividers |
| `line-soft` | `#EFECE6` | Lighter dividers inside lists |
| `field-border` | `#D5D1C8` | Input and textarea borders |
| `brand` | `#184A45` | Deep blue-green: logo, active nav, links |
| `accent` | `#F2A93B` | Amber: primary actions only (see rules) |
| `accent-ink` | `#8A5300` | Text/icons that need to read as amber on light backgrounds |
| `danger` | `#B42318` | Errors, destructive actions |

### Category dots

| Category | Token | Hex |
| --- | --- | --- |
| Safety | `cat-safety` | `#C2410C` |
| Happening | `cat-happening` | `#2C5DA8` |
| Neighbors | `cat-neighbors` | `#184A45` (same as `brand`) |
| Help | `cat-help` | `#7A5A9E` |

## Typography

- **Headlines:** Schibsted Grotesk, weight 700 or 800, slight negative letter-spacing (about `-0.01em` to `-0.02em`). Tailwind: `font-display`.
- **Body:** Public Sans, weights 400–700. Tailwind: `font-body`.
- Body text is **16px minimum**.
- Meta text (timestamps, counts, bylines) is **14px** in `muted`.

## Rules

- **Amber is reserved.** Use `accent` only for primary actions (+ Post, Send) and the active filter underline (3px). Nothing else is amber.
- **Active nav tab** = `brand` color for text and icon. No background pill.
- **Separate content with spacing and 1px dividers**, not boxes.
- **Only tappable units get a container** (post cards, quick-call buttons): `surface` background, 1px `line` border, 12px radius, **no shadows**.
- **Category tags** = small 8px colored dot + plain label. No pills.
- **Tap targets** are at least 44px.
- **Never:** gradients, glow, emoji, serif fonts, small-caps labels.

## Logo

A simple oak tree mark in `brand`:
- canopy: three overlapping circles
- a trunk
- a base line

Beside it, the wordmark "Oakland Hub" in Schibsted Grotesk 700.

## Screens

- Feed
- Post detail
- Compose
- Safety
- Help
- Me

### Bottom nav

Four tabs, each icon + label: **Feed, Safety, Help, Me**. Active tab follows the nav rule above.
