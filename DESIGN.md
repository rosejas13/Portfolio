# Design

## Theme

### Scene

A software engineer's portfolio viewed on a laptop in a well-lit room (light mode) or in the evening (dark mode). The visitor is a hiring manager or fellow engineer taking a first pass — they should feel welcomed, not impressed into submission. Calm confidence, not performance.

### Light

Warm off-white base with soft teal accents. A subtle warmth that feels approachable without being cozy. Coral accents for energy where it matters.

### Dark

Deep navy-toned charcoal base. Teal glows softly against the dark; coral pops warm. Feels like a well-lit terminal at night — focused, not harsh.

## Color

### Strategy

Committed base (teal carries the identity) with restrained surfaces and a coral pop accent for high-energy moments.

### Tokens

All values in OKLCH for perceptual consistency.

#### Light

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `oklch(98.5% 0.005 85)` | Page background |
| `--color-surface` | `oklch(99% 0.003 85)` | Card, elevated surfaces |
| `--color-surface-hover` | `oklch(97% 0.005 85)` | Card hover state |
| `--color-text` | `oklch(20% 0.01 85)` | Primary body text |
| `--color-text-secondary` | `oklch(50% 0.01 85)` | Secondary text |
| `--color-text-muted` | `oklch(65% 0.008 85)` | Muted text |
| `--color-border` | `oklch(88% 0.008 85)` | Subtle borders |
| `--color-border-strong` | `oklch(80% 0.01 85)` | Stronger borders |
| `--color-primary` | `oklch(55% 0.13 195)` | Teal — primary identity |
| `--color-primary-hover` | `oklch(50% 0.14 195)` | Teal hover |
| `--color-primary-subtle` | `oklch(92% 0.04 195)` | Teal tinted backgrounds |
| `--color-accent` | `oklch(65% 0.16 35)` | Coral — pop, CTA emphasis |
| `--color-accent-hover` | `oklch(60% 0.18 35)` | Coral hover |
| `--color-accent-subtle` | `oklch(92% 0.05 35)` | Coral tinted backgrounds |
| `--color-success-bg` | `oklch(92% 0.04 145)` | Success banner bg |
| `--color-success-text` | `oklch(35% 0.06 145)` | Success banner text |
| `--color-error-bg` | `oklch(92% 0.05 30)` | Error banner bg |
| `--color-error-text` | `oklch(40% 0.08 30)` | Error banner text |

#### Dark

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `oklch(14% 0.008 220)` | Page background |
| `--color-surface` | `oklch(19% 0.01 220)` | Card, elevated surfaces |
| `--color-surface-hover` | `oklch(22% 0.01 220)` | Card hover |
| `--color-text` | `oklch(90% 0.005 85)` | Primary text |
| `--color-text-secondary` | `oklch(65% 0.005 85)` | Secondary text |
| `--color-text-muted` | `oklch(45% 0.005 85)` | Muted text |
| `--color-border` | `oklch(28% 0.01 220)` | Subtle borders |
| `--color-border-strong` | `oklch(35% 0.01 220)` | Stronger borders |
| `--color-primary` | `oklch(62% 0.12 195)` | Teal glow |
| `--color-primary-hover` | `oklch(68% 0.13 195)` | Teal hover |
| `--color-primary-subtle` | `oklch(25% 0.04 195)` | Teal tinted surfaces |
| `--color-accent` | `oklch(70% 0.15 35)` | Coral pop |
| `--color-accent-hover` | `oklch(75% 0.16 35)` | Coral hover |
| `--color-accent-subtle` | `oklch(25% 0.05 35)` | Coral tinted surfaces |
| `--color-success-bg` | `oklch(22% 0.04 145)` | Success banner |
| `--color-success-text` | `oklch(65% 0.06 145)` | Success banner text |
| `--color-error-bg` | `oklch(22% 0.05 30)` | Error banner |
| `--color-error-text` | `oklch(65% 0.08 30)` | Error banner text |

## Typography

### Fonts

| Role | Font | Weight range | Source |
|---|---|---|---|
| Display / headings | Sora | 400–700 | Google Fonts |
| Body text | Onest | 300–600 | Google Fonts |

### Scale

Fluid modular scale with 1.25 ratio:

| Step | Size |
|---|---|
| `--fs-xs` | `clamp(0.75rem, 0.7rem + 0.15vw, 0.875rem)` |
| `--fs-sm` | `clamp(0.875rem, 0.8rem + 0.2vw, 0.938rem)` |
| `--fs-base` | `clamp(1rem, 0.9rem + 0.3vw, 1.125rem)` |
| `--fs-lg` | `clamp(1.125rem, 1rem + 0.4vw, 1.25rem)` |
| `--fs-h5` | `clamp(1.25rem, 1.1rem + 0.5vw, 1.375rem)` |
| `--fs-h4` | `clamp(1.5rem, 1.3rem + 0.7vw, 1.75rem)` |
| `--fs-h3` | `clamp(1.75rem, 1.4rem + 1vw, 2rem)` |
| `--fs-h2` | `clamp(2rem, 1.5rem + 1.5vw, 2.5rem)` |
| `--fs-h1` | `clamp(2.25rem, 1.6rem + 2vw, 3rem)` |

Line height: 1.6 base, 1.2 for headings, 1.05 for hero display.
Body max-width: 70ch.

## Spacing

Fluid scale:

| Token | Value |
|---|---|
| `--space-xs` | `0.25rem` |
| `--space-sm` | `0.5rem` |
| `--space-md` | `1rem` |
| `--space-lg` | `1.5rem` |
| `--space-xl` | `2rem` |
| `--space-2xl` | `3rem` |
| `--space-3xl` | `4rem` |
| `--space-4xl` | `6rem` |

## Borders & Radius

| Token | Value |
|---|---|
| `--radius-sm` | `4px` |
| `--radius-md` | `8px` |
| `--radius-lg` | `12px` |
| `--radius-xl` | `16px` |
| `--radius-full` | `9999px` |

## Shadows

| Token | Value |
|---|---|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.04)` |
| `--shadow-md` | `0 2px 8px 0 rgb(0 0 0 / 0.06)` |
| `--shadow-lg` | `0 4px 16px 0 rgb(0 0 0 / 0.08)` |

## Motion

| Token | Value |
|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--transition-fast` | `150ms var(--ease-out)` |
| `--transition-base` | `250ms var(--ease-out)` |
| `--transition-slow` | `400ms var(--ease-out)` |


