# Design System

Canonical owner of **design token values, the token policy, and component state conventions**.

> **STATUS:**
> - **Core brand palette: APPROVED.** Change it only with explicit product approval.
> - **Everything else** (neutrals, skill shades, type sizes, spacing, radii, shadows, breakpoints): **INITIAL DIRECTION / SUBJECT TO DESIGN REVIEW**, unless a section marks a value Approved.
>
> Once implementation starts, the token source in code becomes the single source of truth for values. This document then describes intent and usage and stops duplicating raw numbers.
>
> **Token source in code:** `apps/web/src/shared/ui/tokens.css` (Tailwind v4 `@theme`). Tailwind's default colors, spacing, radii, font sizes, font weights, and shadows are reset there, so only these tokens produce utilities. Fonts are loaded in `apps/web/src/app/[locale]/layout.tsx` (`next/font`). `pnpm lint` runs `scripts/check-tokens.mjs`, which rejects raw colors outside the token file. The content max width (`--container-content`, `max-w-content`) the raised shadow (`--shadow-raised`, `shadow-raised`), and the Heading 1 size (`--text-heading-1` with its line height, `text-heading-1`) are in code. Since M3-07, M3-08, M4-13 and M4-18 also: the passage highlight (`--color-highlight`, `bg-highlight`), the Heading 2 and 3 sizes (`--text-heading-2`, `--text-heading-3`), the passage size (`--text-passage`, `text-passage`, Literata via `font-passage`), the reading measure (`--container-measure`, `max-w-measure`), the "base" duration (`--duration-base`, used as `duration-(--duration-base)`), the small meta text size (`--text-meta`, `text-meta`), the tablet breakpoint (`--breakpoint-tablet`, `tablet:`), the onboarding and home column (`--container-column`, `max-w-column`), the "fast" duration and easing as Tailwind's transition defaults (`--default-transition-duration`, `--default-transition-timing-function`), and since M5-06 the status color for correct answers (`--color-status-correct`, used only by the outcome icons in `views/reading-results/ui/OutcomeIcon.tsx`). The M3 primary button lives in `apps/web/src/shared/ui/` as `PrimaryLink` and `PrimaryButton` (shared classes in `primary-action.ts`), the quiet link as `QuietLink`, the answer option as `AnswerOption` and the option row as `OptionRow`; the M4 Reading components in `apps/web/src/views/reading-test/ui/` (`QuestionSheet`, `SecondaryButton`, `TestBar`, `ExamTimer`, the desktop `QuestionColumn` and `QuestionBar`, `ConfirmDialog`, sheet heights in `SHEET_HEIGHT`) and `apps/web/src/features/mark-passage/ui/` (`PassageView`, `SentenceActions`, `EvidenceList`). Tailwind's default breakpoints and container sizes are reset, so no unapproved breakpoint exists. The desktop breakpoint (64rem) is used since M4-21 by the Reading screen, which renders a different layout from it (a `matchMedia` query in `views/reading-test/ui/TestWorkspace.tsx`); no CSS uses it yet, so it has no token (added when first needed, owner decision 2026-10-09; the M1 values were approved on 2026-10-10 with the condition that no speculative token is added). Since the visual overhaul (owner request, 2026-10-12): the soft selected tint (`--color-brand-blush-soft`, `bg-brand-blush-soft`), the [quiet button](#quiet-button) (`QUIET_BUTTON` in `apps/web/src/shared/ui/quiet-action.ts`) and the [line icons](#icons) (`LineIcon` and the shared check, chevron and close icons in `apps/web/src/shared/ui/icons.tsx`).

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

**Approved** (owner, 2026-10-10, task M3-05; proposed in M3-02): `text.secondary` (the "You can change this later." line and the step indicator text), `border.control` (the answer option's boundary), and `border.subtle` (the progress track, decorative). `text.tertiary` remains a proposal until used.

**Approved** (owner, 2026-10-10, task M4-09; proposed in M4-05): `text.tertiary` (disabled option text in "choose several").

### Selected tint

**Visual overhaul** (owner request, 2026-10-12; values to confirm in the owner's screenshot review). The owner asked for a subtle selected background: `brand.blush` was too loud on rows that are chosen often.

| Token | Value | Use | Contrast |
|---|---|---|---|
| `brand.blushSoft` | `#FCE9EA` (`brand.blush` mixed 40% into white: no new hue) | Selected answers and options, the selected sentence, the current gap, and hover and open states of quiet buttons | `ink` 15.9:1, `text.secondary` 7.0:1. Never the only sign of a state: a selected answer also has the 2 px `ink` boundary and the check |

`brand.blush` itself is unchanged and stays in the palette for later emphasis surfaces.

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

**Approved** (owner, 2026-10-10, task M1-03; proposed in M1-02), with Heading 1 and Heading 2 **revised in the visual overhaul** (owner request, 2026-10-12: mobile headings felt oversized; previously 1.75rem/1.2 and 1.375rem/1.3). Sizes are in rem (16 px = 1rem at the default browser setting), so text follows the user's font-size setting. Line heights are unitless. One scale for every width: on desktop, hierarchy comes from layout and spacing, not from bigger type.

| Role | Size | Line height | Weight | Rationale |
|---|---|---|---|---|
| Heading 1 (page title) | 1.5rem (24 px) | 1.25 | 800 | Bold and clear at the top of a phone screen without shouting; the weight carries it. A long Russian or Uzbek title fits in two lines at 320 px. |
| Heading 2 (section) | 1.25rem (20 px) | 1.3 | 700 | Between H1 and H3; with its weight, clearly above body (the passage title, the next action on home). |
| Heading 3 (subsection) | 1.125rem (18 px) | 1.4 | 700 | The smallest heading. It is told apart from body by weight. |
| Body | 1rem (16 px, unchanged) | 1.5 | 400 | The existing minimum body size. 1.5 is the line height Tailwind's base styles already apply; this makes it explicit. |
| Small meta text | 0.875rem (14 px) | 1.4 | 400 or 500 | The top of the allowed 13–14 px range, for reading outdoors. Color `text.tertiary` or darker: 6.2:1 on `surface.base`, 5.9:1 on `surface.warm`. |
| Passage (Literata) | 1.0625rem (17 px) | 1.6 | 400 | Larger than body for long reading. 17 px rather than 18 px keeps more words per line on a 320–360 px phone, where Literata sets wide. The user's font-size setting can enlarge it. |

All headings and body text use `ink` (18.6:1 on `surface.base`, 17.7:1 on `surface.warm`). Heading levels below H3 are not needed yet.

## Spacing

A 4 px base unit. Proposed scale: 4, 8, 12, 16, 24, 32, 48, 64. Mobile page gutter: 16 px (verify at 320 px width).

**Approved** (owner, 2026-10-10, task M3-05; proposed in M3-02): the steps the M3 components use, 4, 8, 12, 16 (gutter), 24, 32, and 48. See [M3 components](#m3-components-onboarding-and-home). 64 remains a proposal until something uses it.

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

**Approved** (owner, 2026-10-10, task M3-05; proposed in M3-02): `radius.md` (14 px: the primary button and the answer option) and `radius.full` (the step indicator's progress track). The others remain proposals until used.

**Approved** (owner, 2026-10-10, task M4-09; proposed in M4-05): `radius.sm` (navigator cells, the selected-sentence background) and `radius.xl` (the question sheet's top corners).

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

## Shared controls (visual overhaul)

**Visual overhaul** (owner request, 2026-10-12; to confirm in the owner's screenshot review). They replace underlined links and mixed icons in bars and headers, so tools stop looking like raw HTML.

### Quiet button

For tool actions in bars, headers and panels: the test bar's "Exit", "Mark for review", "All questions", "Back", the sentence actions, the other passages in the desktop navigator bar, and the language switcher.

| Property | Value |
|---|---|
| Look | A 16 px line icon and the label in `ink`, weight 500; no fill, no boundary, no underline |
| Size | At least 48 px high, 12 px side padding (pulled back by 12 px where it starts or ends a row, so its text lines up with the gutter), 8 px between icon and label; a long label wraps inside the button |
| Hover, pressed, open | `brand.blushSoft` fill, `radius.md` (`ink` 15.9:1) |
| Focus | The approved ring |

The underlined [quiet link](#quiet-secondary-action-text-link) stays for a secondary choice under a primary button ("Not now", "Keep working", "Leave", "Start again") and for actions inside content ("Clear answer", "Show in passage", "Remove from evidence"), now with a 4 px underline offset.

### Icons

One line family (this answers the icon-convention question of 2026-10-12): a 16 px grid, a 1.5 px stroke with round ends and joins, `currentColor`; drawn with `LineIcon`. 16 px next to a label, 20 px for the selected check, 12 px in the navigator's flag badge. Hidden from screen readers; the label or the control's name carries the meaning. A fill is used only where it carries a state: the flag while a question is marked, and the M5 outcome icons. No emoji, no filled glyph families.

### Confirmation dialog

The native `<dialog>` for leaving a running Exam and for "Finish test" on desktop: `surface.base`, `radius.xl`, 24 px padding, the approved raised shadow, **no boundary**, and an `ink` scrim at 40% behind it, so the decision stands apart without a second outline.

### Language switcher

The header's quiet button: a 20 px line globe, the language code and a down chevron; `brand.blushSoft` while the list is open. The list: `surface.base`, `radius.md`, 4 px padding, the raised shadow; each language a 48 px row with `radius.sm` hover in `brand.blushSoft`, the current one bold with the check.

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

## M3 components (onboarding and home)

**Approved** (owner, 2026-10-10, task M3-05; proposed in M3-02), including the progress bar under the step indicator. Visual values for the components in the M3 flows ([USER_FLOWS.md](../product/USER_FLOWS.md#onboarding-and-home-flows-m3)). Approved values are reused unchanged: the brand palette, the type scale (H1, H2, body, small meta text), the focus-visible style, the motion durations and easing, and the breakpoints. Contrast ratios were computed with the WCAG 2.x formula. Nothing here is in code yet; each value goes into `tokens.css` with its first use (M3-07, M3-08), and no other token is added.

### Primary button

The one red action per screen ("Start the level check"). It formalizes the style M1 already uses for its red action (`StatusMessage.tsx`), so the app has one primary button.

| Property | Proposed value | Rationale |
|---|---|---|
| Height | at least 48 px (`spacing` 48); grows when the label wraps | ACCESSIBILITY.md prefers 48 px for primary actions |
| Padding | 12 px vertical, 24 px horizontal | Room for a two-line Russian or Uzbek label without touching the edges |
| Radius | `radius.md` (14 px) | Not a pill (Radii section) |
| Type | Body size (1rem), weight 700, centered; the label wraps and is never truncated | Bold carries the emphasis; the size stays readable at 200% zoom |
| Default | `surface.base` text on `brand.primary` | 4.58:1 (AA for 16 px bold) |
| Hover (pointer) and pressed | `brand.primaryDeep` background | 5.18:1. The palette names `primaryDeep` as the hover and pressed color. Background change in 120 ms (motion "fast") |
| Focus-visible | The approved 2 px `ink` ring, offset 2 px | Approved style, 4.1:1 against the red |
| Width | Full column width below the tablet breakpoint (600 px); its natural width from 600 px, aligned with the column's start | A full-width target is easiest to hit with a thumb; on wide screens a stretched button looks like a banner |
| Disabled, loading | Not proposed: no M3 screen has a disabled or loading primary button | No speculative states (Token policy) |

The M1 status pages keep their approved inline button layout unless the owner wants them to adopt the full-width rule.

### Quiet secondary action (text link)

"Not now" (onboarding step 3) and "Change goal" (home). It formalizes M1's quieter "Go to home page" link.

| Property | Proposed value | Rationale |
|---|---|---|
| Look | `ink` text, weight 500, always underlined; no fill, no border | Clearly an action, clearly quieter than the red button; underline means it is not told apart by color |
| Tap area | At least 48 px high (the text sits in a 48 px tall link) | Touch target |
| Hover, pressed | No change other than the browser default cursor | Nothing to compete with the primary button |
| Contrast | 18.58:1 on `surface.base` | |

### Answer option (single-choice answer button)

The answers on onboarding steps 1 and 2. Each is a button that saves and advances (USER_FLOWS.md: answering rules).

| State | Proposed treatment | Contrast |
|---|---|---|
| Default | `surface.base` fill, 1 px `border.control` boundary, `radius.md`, `ink` text at body size weight 500, left-aligned; at least 48 px high with 12 px vertical and 16 px horizontal padding; full column width | Boundary 3.22:1 against white (meets 3:1 for an essential boundary); text 18.58:1 |
| Hover (pointer) | Boundary becomes `ink` | 18.58:1 |
| Pressed | `surface.warm` fill | Text 17.68:1 |
| Focus-visible | The approved ring | |
| Selected (the earlier answer when returning to a step) | `brand.blushSoft` fill (visual overhaul, 2026-10-12; was `brand.blush`), a 2 px `ink` boundary, and a 20 px `ink` check mark at the end (the shared line check, hidden from screen readers, with the text "Selected" for them) | Text and check 15.9:1 on the soft tint. Selected is shown by the check mark and the heavier boundary, not by the fill alone (I-8) |

- **Arrangement:** one vertical list with 8 px between answers (visual overhaul, 2026-10-12; was 12 px), the same on step 1 and step 2 and in every option list. The five band values are a list too, not a grid: one scan direction, the same component on both steps, and it works at 320 px and at 200% zoom. Six 48 px answers with 8 px gaps take about 330 px, so the whole step still fits a 360 × 800 screen without scrolling.
- **Not red:** the answers are not primary buttons. Steps 1 and 2 have no red element at all (USER_FLOWS.md: one primary action).

### Step indicator

"Step 1 of 3" above the question on every onboarding step.

| Part | Proposed treatment | Contrast |
|---|---|---|
| Text | Small meta text (0.875rem), weight 500, `text.secondary` | 8.22:1. The text alone carries the meaning |
| Progress bar (optional) | A 4 px high track in `border.subtle` with `radius.full`, filled one third per step in `brand.highlight`, 8 px under the text; decorative and hidden from screen readers | Fill against track 2.48:1, below 3:1. Acceptable only because the text carries the meaning (WCAG 1.4.11 applies to graphics needed for understanding). `brand.highlight` is the palette's color for progress fills |

**Option:** drop the bar and keep the text only. **Recommendation: keep the bar.** It shows at a glance that the flow is short, which matters on the first screen a new user sees.

**Onboarding art direction** (owner request, 2026-10-12; to confirm in the owner's screenshot review). The bar becomes three 32 × 4 px segments (`radius.full`, 4 px apart, `brand.highlight` up to the current step, `border.subtle` after it) on the same line as the text, 12 px before it; still decorative.

### Onboarding art direction (steps 1–3)

**Owner request, 2026-10-12** (replaces the M3 "one vertical list of answer options" look on these steps; behavior, order, choices and copy unchanged; to confirm in the owner's screenshot review). Each step has one focal decision instead of a stack of identical bordered rows. The answers stay submit buttons in one group named by the question.

- **Step 1, exam type: two paths.** Academic and General Training as two tiles side by side (12 px apart, also at 320 px): `surface.base`, a 1 px `border.subtle` boundary (decorative: the label names the button), `radius.lg`, 16 px padding; a 64 px `brand.blushSoft` circle with the path's [illustration](#illustrations) in `brand.primaryDeep` (a graduation cap, a briefcase), then the label in Heading 3, 24 px apart. Hover: `brand.primary` boundary. **Selected** (when returning): a 2 px `brand.primary` boundary, `brand.blushSoft` fill, the circle filled `brand.primary` with a white illustration, and the check badge.
- **Step 2, target band: a row of bands on an [accent panel](#accent-panel).** The five values in one row (8 px gaps), each at least 64 px high, `radius.md`, `surface.base` with a 1 px `brand.blush` boundary, the value in Heading 2 size, weight 800, tabular figures. **Selected:** `brand.primary` fill with the value in `surface.base` (4.6:1 at 20 px, weight 800) and the check badge. At 320 px each value is about 45 px wide (at least the 44 px target).
- **"I don't know yet"** (steps 1 and 2): under the main answers, 16 px apart, as a quiet row, not a tile: a 24 px question-mark illustration in `text.secondary`, the label in body weight 500, a right chevron; no boundary; hover `brand.blushSoft`. Selected: `brand.blushSoft` fill, a 2 px `ink` boundary and the check badge.
- **Check badge** (every selected answer): a 24 px `ink` circle with a 16 px white check, over the answer's top end corner; "Selected" for screen readers. With the boundary or the fill it shows the choice by shape, never by color alone.
- **Step 3, level-check invitation:** an [accent panel](#accent-panel) above the H1 with the target illustration (48 px, `brand.primaryDeep`) centered in a 96 px white circle, then the H1, the sentence in `text.secondary`, the red button 32 px below, and "Not now".

### Home: next-action block and goal line

**Revised in the onboarding art direction** (owner request, 2026-10-12, replacing "no card"; to confirm in the owner's screenshot review). The next action is the screen's one focal block, so it gets the one emphasis surface.

- **H1 ("Your next step"):** a quiet label above the block: meta size, weight 700, `brand.primaryDeep` (5.2:1). The next action, not the page's name, is what the screen shows.
- **Next-action block:** an [accent panel](#accent-panel) 12 px under the H1 (24 px inner padding from the tablet breakpoint, 16 px on phones): a 48 px white circle with the target illustration, the H2 in Heading 1 size, weight 800, 16 px under it, the sentence in `text.secondary` 8 px under the H2, and the primary button 24 px under the sentence.
- **Goal line:** 24 px under the block, one wrapping row: a 16 px line flag, the line in `text.secondary` with the band in `ink` weight 700 ("Target band: **7.0** · Academic"), and "Change goal" as the quiet link at the row's end. No divider.

### Accent panel

The one soft brand surface of a screen (onboarding step 2 and 3, the home next action): `brand.blushSoft`, `radius.lg`, 16 px padding, two decorative 2 px `brand.blush` arcs (concentric circles, clipped) in the top end corner. One per screen at most; never nested, never for ordinary sections.

### Illustrations

Spot illustrations in the line-icon style, drawn on a 24 px grid with the same 1.5 px stroke and round ends (`Illustration` in `apps/web/src/shared/ui/illustrations.tsx`), shown at 24–48 px in `brand.primaryDeep`, or white on `brand.primary` when selected. Decorative and hidden from screen readers: the text beside them carries the meaning. Current set: graduation cap (Academic), briefcase (General Training), question mark ("I don't know yet"), target ("Find your level").

### Column width for onboarding and home

| Property | Proposed value | Rationale |
|---|---|---|
| Maximum width | 36rem (576 px at the default font size), centered in the 1200 px content column | About 65 characters of body text per line, and answers and buttons do not stretch across a desktop screen. In rem, so it grows with the user's font size |
| Below 600 px | The full width between the 16 px gutters | |

This would be one new layout token (a container width) used by onboarding and home only.

### Spacing used by these components

4 (progress bar height), 8 (heading to sentence, indicator to bar), 12 (button vertical padding, gap between answers), 16 (gutter, answer horizontal padding), 24 (button horizontal padding, H1 to block, sentence to button, indicator to question), 32 (block to goal line), 48 (minimum heights). All are on the proposed 4 px scale.

## M4 components (Reading)

**Approved** (owner, 2026-10-10, task M4-09; proposed in M4-05), with the highlight's bottom border added at approval. Visual values for the M4 Reading specs ([READING_EXPERIENCE.md, M4 specifications](../product/READING_EXPERIENCE.md#m4-specifications-drafts)). Reused unchanged: the brand palette, the type scale (including the approved Heading 3 and passage sizes), the focus style, motion, the breakpoints, the M3 primary button, quiet link and answer option. Contrast computed with the WCAG 2.x formula. Status colors (correct/incorrect) stay TBD: M4 shows no correctness (M4-01 open question 2).

### New color: passage highlight

| Token | Proposed value | Use | Contrast |
|---|---|---|---|
| `highlight` | `#FFEFA3` (soft yellow) | Background of highlighted sentences (`<mark>`) | `ink` text on it 16.04:1. Against white 1.16:1. |

- Yellow is what readers expect from a highlighter (computer-delivered IELTS uses it too), and it is clearly not the red of actions or the blush of selection (blush against it 1.30:1, plus selection has its own underline below).
- **Plus a subtle bottom border** (owner decision at approval, 2026-10-10): a 2 px bottom border in `border.control` (3.22:1 against white), so a highlight stays visible against white without relying on the light fill alone. The fill keeps the text easy to read (`ink` 16.04:1); screen readers get the highlight from `<mark>`.

### Test bar
- 48 px high, `surface.base`, a 1 px `border.subtle` line under it (decorative).
- "Exit" as a [quiet button](#quiet-button) with the close icon (visual overhaul, 2026-10-12; was the underlined quiet link), 12 px between the bar's items; "Passage 1 of 3" in body text, weight 500; the timer in body text, weight 700, with tabular figures so it does not jiggle, weight 800 from 5 minutes left.

### Passage
- The approved passage size (Literata 17 px, line height 1.6), `ink` (18.58:1). Paragraph spacing 16 px.
- Width: the full width between the gutters on phones; from the tablet breakpoint a reading measure of **40rem** (about 70 characters of Literata at 17 px).
- Passage title: Heading 2 (Onest). Paragraph letters: bold Onest in `text.secondary` (8.22:1) at the start of the paragraph, followed by a space; not a separate column, so phones lose no width.

### Sentences: keyboard focus, selection, highlight, pin marker
- **Keyboard focus** on a sentence: the approved focus ring.
- **Selected** (action bar open): `brand.blushSoft` background (visual overhaul, 2026-10-12; `ink` 15.9:1) with a 2 px `ink` underline, `radius.sm` corners, so selection is not shown by color alone.
- **Highlighted:** the `highlight` background above.
- **Pin marker** (the current question's pins): an inline chip before the sentence, `radius.full`, 1 px `ink` border, a 14 px line pin icon and the question number in bold meta text, `ink` on `surface.base` (18.58:1).

### Sentence action bar
- Floats 8 px above the sheet, the full width between the gutters on phones (at most 36rem), `surface.base`, `radius.md`, the approved raised shadow, 4 px inner padding; its actions are [quiet buttons](#quiet-button) with a line icon and a label (no underline), each at least 48 px.
- **Height follows the content** (owner, 2026-10-11, replacing the earlier 56 px): compact on phones, **at most two rows**, no horizontal clipping, no critical action hidden, and understandable in uz, ru and en. Where the labels would need a third row, shorter approved labels or icons are used, with the full label kept as the accessible name.
- **Arrangement** (M4-24): Highlight (or Remove highlight) and Cancel share the first row, Cancel as a 48 px × icon button named "Cancel"; Pin (or Unpin), where offered, takes the second row. A label too long for its row wraps inside its own button rather than adding a row. The refused-pin message is contextual feedback above the actions, shown only after a refused pin; it does not count as one of the two rows (owner, 2026-10-11).

### Question sheet (phone and tablet)
- `surface.base`, `radius.xl` top corners, the approved raised shadow; 16 px side padding.
- **Handle:** a 32 × 4 px bar in `border.control` (3.22:1 on white), 8 px from the top. The handle button covers the bar and the question's title row (about 52 px), so the title shares the grab area instead of sitting under a 48 px row of its own (visual overhaul, 2026-10-12).
- **Heights:** collapsed = its content (handle and title, 80 px; 96 px before the visual overhaul); partial = 45% of the visible viewport height, at least 240 px; expanded = the visible height below the test bar. State changes animate height with the approved "base" duration (200 ms) and easing, none with reduced motion.
- **Header row:** "Question 5 of 40" in Heading 3 (18 px, 700) with "· answered" in meta text, then one row with the flag toggle and "All questions" as [quiet buttons](#quiet-button), 48 px high; a long Russian or Uzbek label wraps inside its own button rather than adding a row. The flag icon is filled while the question is marked (the fill carries the state). Panels (the navigator, an option list) have "Back" as a quiet button with a left chevron.
- **Footer row:** Previous and Next as **secondary buttons** (new component, below) with a left or right chevron; the red primary button only for "Finish test". On phones "Finish test" is full width, as the primary button is there, on its own row under Previous (owner, 2026-10-11).

### Secondary button (new)
- For Previous / Next and similar navigation that must look like buttons but not compete with the red action: 48 px minimum height, 12/16 px padding (visual overhaul, 2026-10-12; was 12/24 px), an optional 16 px line chevron 8 px from the label, `radius.md`, 1 px `border.control` boundary (3.22:1), `ink` text weight 500 on `surface.base`; hover: `ink` boundary; pressed: `surface.warm` fill (`ink` 17.68:1); focus: the approved ring.

### Choice controls in the sheet
- **Option rows** reuse the M3 answer option (default, hover, pressed, focus, selected with `brand.blushSoft`, the 2 px `ink` boundary and the 20 px check mark at the end) over a visually hidden native radio or checkbox. **No radio or checkbox indicator is drawn inside the row** (visual overhaul, owner request 2026-10-12: a circle or square inside a bordered row read as a nested, form-like double boundary). The check's room is kept when unchosen, so choosing never moves the text. "Choose several" is explained by its instruction and the "1 of 2 chosen" line. The option letter is bold before the text.
- **Disabled** (the limit of "choose several" reached): text in `text.tertiary` (6.24:1 on white), boundary `border.subtle`, no hover.
- **Answer button** ("choose from a list"): the option-row look with a trailing chevron; "Choose an answer" in `text.secondary` (8.22:1) when empty, the chosen option's letter and text in `ink` when filled.
- **Typed-answer field:** 48 px high, 1 px `border.control` boundary (3.22:1), `radius.md`, 12/16 px padding, body text; focus: the approved ring.
- **Gaps in summaries and notes:** the number in bold followed by a 2 px `ink` underline as wide as about six characters; the **current gap** gets the selected look (`brand.blushSoft` background, `radius.sm`).
- **Word-limit warning** (Practice): body text in `ink` with a 20 px warning icon (a circle with "!"), not a status color.

### "Your evidence" block
- Each pinned sentence as a quote on `surface.warm` with `radius.md`, 12/16 px padding: the paragraph label in meta text `text.secondary` (7.83:1 on warm), the sentence in the approved passage typography (`ink`, 17.68:1 on warm), then "Show in passage" and "Remove from evidence" as quiet links.

### Question navigator
- Cells 44 × 44 px with 4 px gaps, `radius.sm`, the number in body text weight 700 with tabular figures.
- **Unanswered:** `surface.base` with a 1 px `border.control` boundary (3.22:1). **Answered:** `ink` fill with a `surface.base` number (18.58:1). **Current:** a 3 px `ink` bar 4 px under the cell, in addition to its fill or outline. **Marked for review:** a 16 px badge in the top corner: a `surface.base` circle with a 1 px `ink` border and an `ink` flag. Each state is a shape, so none relies on color.
- Group headings ("Passage 1") in Heading 3.

### Desktop exam layout (from 64rem / 1024 px)
- Columns: passage 55%, questions 45%, separated by a 1 px `border.subtle` line (decorative: the columns are also separated by space and scroll on their own); both on `surface.base`; the passage at the 40rem measure inside its column. The question column has 32 px side padding, its content at most the 36rem column width, and 48 px between question groups (visual overhaul, 2026-10-12).
- The current question in the question column: a 4 px `ink` bar along its start edge.
- Navigator bar: a 1 px `border.subtle` line above it; the same 44 px cells; other passages as [quiet buttons](#quiet-button) with their progress and a right chevron (visual overhaul, 2026-10-12; were secondary buttons); "Mark for review" as a quiet button with the flag icon. **Its height follows its content** (owner, 2026-10-11, replacing the fixed 64 px): 64 px is the preferred compact height when everything fits one row; two rows at 1280 px and up to three rows at 1024 px are acceptable. Previous, Next and "Mark for review" keep their text labels; they are not made icon-only to save space.

### Tokens this would add
`--color-highlight`, `--container-measure` (40rem), `--breakpoint-desktop` (the approved 64rem, first use), and the approved "base" duration (200 ms) for the sheet. Everything else uses existing or approved values.


## M5 components (Reading results and review)

**Approved with amendments** (owner, 2026-10-11, task M5-01). Visual values for the M5 drafts ([READING_EXPERIENCE.md, M5 specifications](../product/READING_EXPERIENCE.md#m5-specifications-drafts)). Reused unchanged: the brand palette, the type scale, the focus style, motion, the breakpoints, the M3 primary button and quiet link, the M4 secondary button, option rows, test bar, sheet, navigator cells, "Your evidence" quote style and desktop columns, including the approved desktop navigator bar (content-driven height: two rows at 1280 px and up to three at 1024 px acceptable; Previous, Next and "Mark for review" keep their text labels). Contrast computed with the WCAG 2.x formula.

### Status: correct, not correct, no answer
The [Status colors](#status-colors) are TBD and M5 is the first milestone that shows correctness. **Every outcome is an icon plus a word** ("Correct", "Not correct", "No answer", and for a "choose several" item "1 of 2 correct"), never color alone (I-8); color only supports "correct". "No answer" is its own state, never drawn as "not correct".

| Outcome | Icon (20 px; 16 px in navigator badges) | Color | Contrast |
|---|---|---|---|
| Correct | A check mark in a filled circle | **New token `status.correct` `#157A3C`** (green) for the circle; white check | 5.41:1 on `surface.base`, 5.15:1 on `surface.warm`; white on it 5.41:1. Usable for text too (AA) |
| Not correct | A cross in an outlined circle | `ink` (no new color) | 18.58:1 |
| No answer | A dash in a dashed-outline circle | `text.secondary` | 8.22:1 |
| Partly correct ("choose several" item only) | A circle whose start half is filled | `status.correct` fill, `ink` outline | Fill 5.41:1, outline 18.58:1 on `surface.base`; the words "1 of 2 correct" carry the meaning |

- **Why "not correct" gets no color (decided, D11):** red is the brand's action color and this document requires "incorrect" to stay distinct from it and from Reading's red family; a second hue (orange, amber, purple) would collide with a skill color or read as a warning. The cross and the word carry the meaning; the screen stays calm, as review should.
- **Not chosen:** a dedicated "incorrect" hue outside the red family (for example a dark amber `#9A5B00`, 5.43:1 on white): amber reads as "warning", and Writing's orange is close.
- `status.correct` is a yellower green than Speaking's teal (`#0F7A5A`); the two never appear together without their labels.

### Results page
- Inside the shell (header with the language switcher), in the approved onboarding and home column (36rem).
- "Time is up." (when the Exam timed out) in Heading 3 above the H1, as on the M4 finished page.
- **Score:** "27 of 40 correct" in Heading 1 size, weight 800, the score in tabular figures, prominent but **allowed to wrap** at narrow widths and at 200% zoom (never forced onto one line, never truncated). No ring, gauge, chart, percentage, confetti or color fill ([UI_ANTI_PATTERNS.md](UI_ANTI_PATTERNS.md)).
- The honest line in body text `ink` directly under the score; the breakdown ("Not correct: 9 · No answer: 4") in body text `text.secondary`, each count with its outcome icon.
- Notes (rechecked, imported, older version, storage) in body text `ink` with the 20 px info icon, 16 px under the breakdown, before the button.
- The red review button 24 px below (its text names what it opens); "Mistakes that repeated" 32 px below it; the quiet links ("Try 14 questions again: not correct or no answer", "Start again") last, 8 px apart. Long Russian and Uzbek link texts wrap.

**Result states** (each is the same page; only the listed parts change):

| State | Score line | Note | Red button | Repeated mistakes | Quiet links |
|---|---|---|---|---|---|
| Finished, mistakes and unanswered | "27 of 40 correct" | none | "Review mistakes and unanswered questions" | Cards, or the "none" text, with the scope line | Try again, Start again |
| Finished, mistakes only | as above | none | "Review mistakes" | as above | as above |
| Finished, unanswered only | as above | none | "Review unanswered questions" | as above | as above |
| Everything correct | "40 of 40 correct" | none | "Review answers" | the "none" text | Start again |
| Exam time-out | as above, "Time is up." above the H1 | none | as above | as above | as above |
| Rechecked, score changed | the new score | "Rechecked… Your earlier result was 27 of 40." | as above | from the first attempt's current record | as above |
| Rechecked, score unchanged but outcomes or notes changed | the score | "Rechecked… Your score is the same; some answers or notes changed." | as above | as above | as above |
| Rechecked, nothing visible changed | the score | none | as above | as above | as above |
| Imported from M4 | as above | "You finished this test before the app checked answers…" | as above | "We can't tell which was your first try…" | as above |
| First attempt from an earlier content version | as above | none | as above | "Repeated mistakes can't be shown because this test has changed…" | as above |
| Earlier content version, result stored | the stored score | "This test has changed since you took it, so a detailed review is not available." | none; "Start the test" becomes the red button | none | none |
| Earlier content version, no result | none | "…so your answers can't be checked." | "Start the test" | none | none |
| No attempt on this device | none; H1 "No results on this device yet" and its sentence | none | "Start the test" | none | none |
| Storage blocked or full | as in the matching state | the storage notice | as above | as above | as above |
| Loading (the history is read after the page mounts, usually within a moment) | none | none | none | none | none; the shell and the H1 only, so nothing jumps or announces twice |
| A retry's results | H1 "Your retry", "9 of 14 now correct" and "These are questions you have attempted before…" | none | the review button for the retry | never | "Back to your test results" |
| A retry that can't be started | H1 "This practice can't be started" and the reason (source missing, earlier content version, questions not allowed) | none | "See your last results" | never | "Start the test" |

### Pattern card ("Mistakes that repeated")
- At most two cards. A card is allowed here because each is one distinct unit with its own action ([UI_ANTI_PATTERNS.md](UI_ANTI_PATTERNS.md)): `surface.warm`, `radius.lg`, 16 px padding, no shadow, no border.
- The scope line ("In this attempt at this test…" or "From your first attempt…") in body text `text.secondary` under the section heading, before the cards.
- Title in Heading 3; the count line in body text; the tip in body text `text.secondary` (7.83:1 on warm); the action "Practise these questions again" as a quiet link (48 px tap area). English answer words (TRUE, NOT GIVEN) inside are `lang="en"`, not styled differently.
- The "not enough evidence", "first try unknown" and "unavailable" texts are plain body text, not cards.

### Review: passage marks
- **Evidence of the current question:** an inline chip before the sentence, like the M4 pin marker (`radius.full`, 1 px `ink` border, `surface.base`), with a 14 px quote-mark icon and the question number in bold meta text, plus a 2 px **dotted** `ink` underline under the sentence (18.58:1). Accessible name: "Evidence for question 5".
- **NOT GIVEN "related" sentences:** the same chip with an outlined (not filled) quote icon and the accessible name "Related to question 3"; the underline is dashed, so "related" and "evidence" differ by shape, not color.
- **The user's own marks:** highlights keep the approved `highlight` tint and border; the current question's pins keep the M4 pin chip. A sentence can carry both chips; the chips sit side by side and wrap with the text.
- Selection (blush) is not used in review: sentences are not selectable there.

### Review card (phone sheet and desktop column)
- **One card per answer unit** ("Questions 22–23" is one card). **Header row:** "Question 5 of 40" in Heading 3, then the unit outcome (icon and word, body weight 700) on its own line; on phones, "All questions" stays in the header as in M4. In the review sequence, "To review: 3 of 12" (cards) in meta text `text.secondary` under the heading.
- **Answers:**
  - Choice and list types (including "choose several"): the question's option rows, read-only (no hover, no pressed state; they are a list, not controls), each labeled on its own: "Your answer, correct" (correct icon, 2 px `status.correct` boundary), "Your answer, not correct" (cross icon, 2 px `ink` dashed boundary), or "Correct answer" for an accepted option the learner did not choose (correct icon, 2 px `status.correct` boundary). Other options stay plain. Labels are text, so nothing depends on the boundary color, and no label ties a positional mark to a letter.
  - Typed types: two label-value rows, "Your answer" and "Correct answer" (and "Also accepted"), the values in passage typography with `lang="en"`. An unanswered question shows "You did not answer this question." in place of the value, with the "No answer" icon.
- **Evidence block:** the M4 "Your evidence" quote style (`surface.warm`, `radius.md`, 12/16 px padding, the paragraph label in meta text, the sentence in passage typography) under the heading "Evidence in the passage" (or "Where the passage talks about this"), each with "Show in passage" as a quiet link. **When a NOT GIVEN answer has no related sentences, the block is not rendered**: no heading, no empty container, no "Show in passage".
- **Explanation:** heading "Why" in Heading 3, body text in the interface language; `lang="en"` spans in the same style.
- **"Explain simpler":** a secondary button (the M4 secondary button) with `aria-expanded`; the simpler text appears right after it, introduced by "In simple words" in bold, with a 4 px `ink` bar along its start edge (the approved current-question bar), so it is visibly a second version and not a new section.
- **Signal notes:** one sentence each in body text with a 20 px info icon (a circle with "i", `ink`), not a status color.
- **Your evidence comparison** (Practice attempts with pins): the M4 "Your evidence" block, followed by one sentence in body text weight 700 about agreement with the key's cited sentences.
- Spacing between blocks 24 px; inside a block 8 px. Previous / Next as in M4.

### Review: navigator outcome badges
- The M4 cells (44 × 44 px, number in the cell). In review: a correct question's cell gets the 16 px correct badge in the top corner (where M4 shows the flag); a not-correct question's cell the cross badge; an unanswered question keeps the M4 "unanswered" outline style plus the dash badge. Both cells of a "choose several" item show **the unit's** badge (including "partly correct") and open the same card. Fills: none (all cells are outlined), so the badge shapes carry the outcome. The current cell keeps the M4 3 px `ink` bar. Flags are not shown in review.
- Accessible names: "Question 5, not correct, current"; "Question 38, no answer"; "Questions 22–23, partly correct".
- **In a retry**, the navigator lists only the retried units (as in the test screen, without badges).

### Review on phone, tablet and desktop

| | Phone (320–599 px) | Tablet (600–1023 px) | Desktop (from 1024 px) |
|---|---|---|---|
| Frame | Test bar ("Results", passage, no timer) | Same | Same |
| Passage | Full width between the gutters, read-only, marks as above | Centered at the 40rem measure | Start column, 55%, at the 40rem measure |
| Review card | In the M4 sheet: partial by default, expanded for long cards and the navigator, collapsed to read; the card scrolls inside the sheet | The phone sheet, as wide as the passage | End column, 45%: the current question's card only, scrolling on its own |
| Navigator | "All questions" opens it in the expanded sheet | Same | The M4 bottom bar with outcome badges, Previous and Next, content-driven height, text labels |
| Question change | The passage scrolls so the first evidence sentence sits above the sheet; focus to the card heading | Same | The passage column scrolls the evidence into view; focus to the card heading |

### Accessibility treatment (M5 screens)
- **Not by color alone (I-8):** outcomes are icon plus word; answer rows carry text labels; evidence and related marks differ by icon and underline style; navigator badges differ by shape (check, cross, dash, half-filled circle) and are named in words.
- **Focus:** results H1 on arrival from the test; the review card's heading on opening and on every question change; "Show in passage" moves focus to the sentence; the navigator returns focus to "All questions" on Escape. The approved focus ring everywhere.
- **Announcements:** the focused headings announce the outcome; nothing else uses a live region except the storage notice (polite, once).
- **Disclosure:** "Explain simpler" is a button with `aria-expanded`; the simpler text follows it in reading order.
- **Language:** English test content, typed and accepted answers, and `en` spans in explanations and copy carry `lang="en"`.
- **Targets:** every control at least 44 × 44 px (48 px for buttons and quiet links), including at 320 px.
- **320 px and 200% zoom:** no horizontal scroll; the score and long uz and ru labels wrap and are never truncated; at 200% the partial sheet may show only the card header, with the rest scrolling inside it, as in M4.
- **Reduced motion:** the passage jumps to the evidence instead of scrolling smoothly; the sheet does not animate.

### Tokens this would add
`--color-status-correct` (`#157A3C`) only. Everything else uses existing or approved values.
