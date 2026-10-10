# Design System

Canonical owner of **design token values, the token policy, and component state conventions**.

> **STATUS:**
> - **Core brand palette: APPROVED.** Change it only with explicit product approval.
> - **Everything else** (neutrals, skill shades, type sizes, spacing, radii, shadows, breakpoints): **INITIAL DIRECTION / SUBJECT TO DESIGN REVIEW**, unless a section marks a value Approved.
>
> Once implementation starts, the token source in code becomes the single source of truth for values. This document then describes intent and usage and stops duplicating raw numbers.
>
> **Token source in code:** `apps/web/src/styles/tokens.css` (Tailwind v4 `@theme`). Tailwind's default colors, spacing, radii, font sizes, font weights, and shadows are reset there, so only these tokens produce utilities. Fonts are loaded in `apps/web/src/app/[locale]/layout.tsx` (`next/font`). `pnpm lint` runs `scripts/check-tokens.mjs`, which rejects raw colors outside the token file. The content max width (`--container-content`, `max-w-content`) the raised shadow (`--shadow-raised`, `shadow-raised`), and the Heading 1 size (`--text-heading-1` with its line height, `text-heading-1`) are in code. Tailwind's default breakpoints and container sizes are reset, so no unapproved breakpoint exists. Not yet in code (added when first needed, owner decision 2026-10-09; the M1 values were approved on 2026-10-10 with the condition that no speculative token is added): motion durations, the Heading 2 and 3 sizes, passage and meta text sizes, the two approved breakpoints.

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

### Type scale

**Approved** (owner, 2026-10-10, task M1-03; proposed in M1-02). Sizes are in rem (16 px = 1rem at the default browser setting), so text follows the user's font-size setting. Line heights are unitless. One scale for every width: on desktop, hierarchy comes from layout and spacing, not from bigger type.

| Role | Size | Line height | Weight | Rationale |
|---|---|---|---|---|
| Heading 1 (page title) | 1.75rem (28 px) | 1.2 | 800 | Bold and clear at the top of a phone screen. A long Russian or Uzbek title still fits in two or three lines at 320 px. |
| Heading 2 (section) | 1.375rem (22 px) | 1.3 | 700 | Clearly smaller than H1 and clearly larger than body, so the step is visible by size and weight alone. |
| Heading 3 (subsection) | 1.125rem (18 px) | 1.4 | 700 | The smallest heading. It is told apart from body by weight. |
| Body | 1rem (16 px, unchanged) | 1.5 | 400 | The existing minimum body size. 1.5 is the line height Tailwind's base styles already apply; this makes it explicit. |
| Small meta text | 0.875rem (14 px) | 1.4 | 400 or 500 | The top of the allowed 13–14 px range, for reading outdoors. Color `text.tertiary` or darker: 6.2:1 on `surface.base`, 5.9:1 on `surface.warm`. |
| Passage (Literata) | 1.0625rem (17 px) | 1.6 | 400 | Larger than body for long reading. 17 px rather than 18 px keeps more words per line on a 320–360 px phone, where Literata sets wide. The user's font-size setting can enlarge it. |

All headings and body text use `ink` (18.6:1 on `surface.base`, 17.7:1 on `surface.warm`). Heading levels below H3 are not needed yet.

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

**Raised level: Approved** (owner, 2026-10-10, task M1-03; proposed in M1-02). One shadow: `0 2px 12px 0` in `ink` at 12% opacity. The only other level is none.
- Rationale: a soft, short shadow lifts overlays, bottom sheets, and sticky elements without looking dated. With a small vertical offset and a larger blur, it also shows along the top edge of a bottom sheet. Deriving it from `ink` keeps it inside the palette.
- Contrast: the shadow is supporting depth, not an essential boundary, so it has no contrast requirement. Where an edge is essential to understand the component, it also needs a boundary of at least 3:1 (`border.control`) or a scrim.

## Motion

Short (≤ 200 ms) and functional: it shows a state change or a spatial relationship (for example, a bottom sheet expanding). Never delay interaction. Honor `prefers-reduced-motion`.

**Durations and easing: Approved** (owner, 2026-10-10, task M1-03; proposed in M1-02).

| Token | Value | Use | Rationale |
|---|---|---|---|
| Duration fast | 120 ms | Small state changes: color, opacity, pressed state, a list opening | Feels immediate, but still shows that something changed. |
| Duration base | 200 ms | Spatial changes: a bottom sheet expanding, a panel sliding in | The documented maximum. Larger movements need slightly more time to follow. |
| Easing | `cubic-bezier(0.2, 0, 0, 1)` | All transitions | Starts fast and settles gently, so a response begins at once and never feels like a delay. |

With `prefers-reduced-motion: reduce`, transitions and animations are effectively off (the base styles in `globals.css` already do this).

## Component states

Every interactive component defines: default, hover (pointer devices), focus-visible, pressed, disabled, loading. Where it applies, also selected, error, and correct/incorrect (answer states). The focus-visible state is never removed.

**Focus-visible style: Approved** (owner, 2026-10-10, task M1-03; proposed in M1-02). A 2 px solid `ink` outline, offset 2 px from the element, on every focusable element. This is the style F-09 implemented as an assumption, approved unchanged.
- Rationale: `ink` is the highest-contrast token and does not compete with the red primary action or look like an error. The offset puts the ring on the surface around the element, so it stays visible on red buttons too. An outline (not a box shadow) also stays visible in Windows forced-colors mode.
- Contrast of the ring against the surface around it: 18.6:1 on `surface.base`, 17.7:1 on `surface.warm`, 12.4:1 on `brand.blush`, and 15.8:1 or more on every skill tint. All meet the 3:1 minimum for non-text UI. The ring is 2 px thick and fully surrounds the element, as WCAG 2.2's focus appearance criterion (2.4.13) describes.
- Limit: against `brand.primary` the ring would be only 4.1:1, and 3.6:1 against `brand.primaryDeep`. Both still pass 3:1, with less margin.

## Responsive behavior

| Range | Treatment |
|---|---|
| 320–359 px | Must work: no horizontal scroll, no clipped actions |
| 360–599 px | **Primary design target** |
| 600–1023 px | Tablet: phone layout given more room, or two columns where that is meaningful |
| ≥ 1024 px | Desktop layout of its own where it helps (e.g. realistic Exam Mode with passage and questions side by side, see [READING_EXPERIENCE.md](../product/READING_EXPERIENCE.md)) |

**Breakpoints: Approved** (owner, 2026-10-10, task M1-03; proposed in M1-02). Two breakpoints, as minimum widths. They are written in rem, so a user with a larger default font size gets the roomier layout later, which keeps text from being squeezed.

| Breakpoint | Value | Starts the range |
|---|---|---|
| Tablet | 37.5rem (600 px) | 600–1023 px |
| Desktop | 64rem (1024 px) | ≥ 1024 px |

- Rationale: they match the documented range boundaries exactly. 320–599 px is one phone layout, so there is no breakpoint at 360 px. 360 px is a design target, not a layout change. Tailwind's default breakpoints would be reset like the other token namespaces, so only these two exist.
- Today, Tailwind's default breakpoints still apply, because no approved values existed when the foundation was built (ADR-0001 did not decide them).

**Content max width: Approved** (owner decision 2026-10-10). Page content on desktop sits in a centered column with a default maximum width of 1200 px. Feature-specific layouts, such as Reading Exam mode, may override it later.
