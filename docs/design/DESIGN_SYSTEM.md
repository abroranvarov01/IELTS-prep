# Design System

Canonical owner of **design token values, the token policy, and component state conventions**.

> **STATUS:**
> - **Core brand palette: APPROVED.** Change it only with explicit product approval.
> - **Everything else** (neutrals, skill shades, type sizes, spacing, radii, shadows, breakpoints): **INITIAL DIRECTION / SUBJECT TO DESIGN REVIEW.**
>
> Once implementation starts, the token source in code becomes the single source of truth for values. This document then describes intent and usage and stops duplicating raw numbers.

## Token policy

Tokens exist to hold **design decisions**, not to give every number a name.

**Must use tokens:**
- **All colors.** No raw color values (hex, rgb, hsl, named colors) appear outside the token definitions. The only exception is platform metadata that cannot read CSS variables (the web app manifest and the `theme-color` meta tag). It must mirror token values exactly, and the token check allowlists it explicitly.
- Typography (families, sizes, weights, line heights), the spacing scale, radii, shadows, and motion durations.
- Any value that is repeated or carries semantic meaning (e.g. "page gutter", "touch target minimum"), and reusable component states.

**May stay local:**
- A genuinely local structural dimension. For example, the fixed aspect of one illustration, or the width of a specific layout column that only this component uses. It may stay in the component when a global token would add indirection without reusable or semantic meaning.

**Never:**
- Use a local value to bypass the system, for example an "almost-16" padding, an off-scale font size, or a one-off radius. If a design needs a value the scale lacks, either use the nearest scale value or propose a scale change here.
- Add tokens "for completeness". Every token exists because it is used.

Contrast values below were computed with the WCAG 2.x formula. Re-verify them whenever a value changes.

## Color

### Core brand palette (APPROVED)

| Token | Value | Role | Contrast notes |
|---|---|---|---|
| `brand.primary` | `#E51F3A` | Primary brand and action color: primary CTAs, key brand moments | White text on it: 4.6:1 (passes AA). As text on `surface.warm`: 4.4:1, **fails** for small text. Use `brand.primaryDeep` there. |
| `brand.primaryDeep` | `#D90D31` | Pressed/hover state, red text on light surfaces | White text on it: 5.2:1. On `surface.warm`: 4.9:1. |
| `brand.highlight` | `#FF5268` | Non-text accents: indicators, progress fills, small graphic details | 3.15:1 on white. Meets 3:1 for non-text UI only. **Never** use it for text, and never with white text on it. |
| `brand.blush` | `#F7C7CA` | Soft brand surfaces, selected/emphasis backgrounds | Use only `ink` text on it (12.4:1). Red text on blush fails. |
| `ink` | `#111318` | Primary text, headings | 18.6:1 on white, 17.7:1 on `surface.warm` |
| `surface.warm` | `#FFF8F4` | Warm background: page backgrounds behind white surfaces, quiet grouping | n/a |
| `surface.base` | `#FFFFFF` | Default surface. The interface is white-first. | n/a |

Red is the application's **unmistakable** primary action color. No other color (including skill colors) is used for a primary CTA.

### Neutrals (proposal)

| Token | Proposed value | Use | Contrast |
|---|---|---|---|
| `text.secondary` | `#4A4F59` | Supporting text | 8.2:1 white, 7.8:1 warm |
| `text.tertiary` | `#5B616B` | Minimum for small meta text | 6.2:1 white, 5.9:1 warm |
| `border.subtle` | `#E2E4E8` | Decorative dividers only | 1.3:1 (not for essential boundaries) |
| `border.control` | `#8A9099` | Input and control boundaries | 3.2:1 white, 3.1:1 warm (meets 3:1 for non-text UI) |

### Status colors

Status colors (correct, incorrect, warning, info) are **TBD** and will be set at implementation. Constraints:
- "Incorrect" must stay clearly distinguishable from the brand red and from Reading's red family.
- Status is never conveyed by color alone (see [ACCESSIBILITY.md](ACCESSIBILITY.md)).

### Skill recognition colors

**Families: APPROVED. Exact shades: proposal.** Skill colors are supporting only. They help users recognize a skill. They never act as a CTA color and never appear in gradients.

| Skill | Family | Strong (icon/marker) | Tint (background) | Notes |
|---|---|---|---|---|
| Reading | Red | `#D90D31` (`brand.primaryDeep`) | `#FDE8EA` | Strong on tint is 4.4:1. Use `ink` labels on the tint, and use the strong color for icons/markers. |
| Listening | Blue | `#1D5FD1` | `#EAF1FD` | Strong on tint 5.1:1 |
| Speaking | Green | `#0F7A5A` | `#E8F6F0` | Strong on tint 4.8:1 |
| Writing | Warm orange | `#C2410C` | `#FFEDDF` | Strong on tint 4.5:1 (borderline; prefer `ink` labels) |

Because Reading shares the brand's red family, Reading identity must rely on the **skill name and icon** as well as color. A Reading tag must never look like a button.

### Dark mode

**TBD.** Do not build dark mode until it is decided. Keep components token-based so that it stays possible.

## Typography

| Role | Proposal |
|---|---|
| UI font | **Onest** (owner decision 2026-10-09, replacing Manrope, which has no U+02BB/U+02BC glyphs). Weights 400, 500, 700, 800. |
| Passage font | **Literata** (approved direction), subject to real readability and font-coverage testing on phones. Weights 400, 700. |
| Body size (mobile) | 16 px minimum. Never smaller for running text. |
| Passage size (mobile) | 17–18 px, line height ~1.6, measure ≤ ~70 characters on desktop |
| Headings | Bold/extra-bold. Hierarchy through size and weight. |
| Small meta text | 13–14 px minimum, `text.tertiary` or darker |

- **Required verification before adoption:** both fonts render Cyrillic and U+02BB/U+02BC correctly, and they load acceptably on slow mobile connections (subsetting, `font-display`).
- Text must respect the user's font-size settings. Use relative units.

## Spacing

A 4 px base unit. Proposed scale: 4, 8, 12, 16, 24, 32, 48, 64. Mobile page gutter: 16 px (verify at 320 px width).

## Radii

Soft, modern surfaces with moderately generous corners, applied **systematically by element size**, so the result does not look like "everything is a pill".

| Token | Proposed value | Use |
|---|---|---|
| `radius.sm` | 8 px | Small elements: tags, checkboxes, inline highlights |
| `radius.md` | 14 px | Buttons, inputs, answer options |
| `radius.lg` | 20 px | Cards and content surfaces |
| `radius.xl` | 28 px | Bottom sheets (top corners), dialogs |
| `radius.full` | 9999 px | **Only** avatars, toggles, progress tracks, and small status chips |

Primary buttons use `radius.md`. They are not pills. Nested surfaces use a smaller radius than their container.

## Shadows / elevation

Minimal. Proposal: **two levels at most**: none (default) and a subtle raised level for overlays, bottom sheets, and sticky elements. Separation comes from spacing and surface color (`surface.base` on `surface.warm`) first.

## Motion

Short (≤ 200 ms) and functional: it shows a state change or a spatial relationship (for example, a bottom sheet expanding). Never delay interaction. Honor `prefers-reduced-motion`.

## Component states

Every interactive component defines: default, hover (pointer devices), focus-visible, pressed, disabled, loading. Where it applies, also selected, error, and correct/incorrect (answer states). The focus-visible state is never removed.

## Responsive behavior

| Range | Treatment |
|---|---|
| 320–359 px | Must work: no horizontal scroll, no clipped actions |
| 360–599 px | **Primary design target** |
| 600–1023 px | Tablet: phone layout given more room, or two columns where that is meaningful |
| ≥ 1024 px | Desktop layout of its own where it helps (e.g. realistic Exam Mode with passage and questions side by side, see [READING_EXPERIENCE.md](../product/READING_EXPERIENCE.md)) |

Exact breakpoint values are finalized in the foundation ADR (see [decisions/README.md](../architecture/decisions/README.md#foundation-adr)).
