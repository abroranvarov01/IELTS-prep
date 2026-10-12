---
name: ui-implementation
description: Procedure for building or changing any user-facing screen or component. Use whenever UI, layout, styling, or interface text is created or modified. Visual verification is the visual-fidelity skill, which is mandatory before the UI counts as done.
---

# Implement UI

**For every user-facing UI task, the `visual-fidelity` skill is mandatory before the task counts as done.** It covers the sources of truth, reference screenshots, screenshot review, and the visual self-review. Functional tests passing is not sufficient.

## Before building
1. **Read the canonical sources** relevant to the change:
   - `docs/product/UX_PRINCIPLES.md` (the UX rules)
   - `docs/design/DESIGN_CONSTITUTION.md` and `docs/design/DESIGN_SYSTEM.md` (direction, tokens)
   - `docs/design/UI_ANTI_PATTERNS.md`
   - `docs/design/ACCESSIBILITY.md`
   - `docs/product/LOCALIZATION.md` if the change has text
   - `docs/product/READING_EXPERIENCE.md` for any Reading surface
   - `docs/design/references/` for an approved reference screenshot of this surface (`visual-fidelity`)
2. **Find existing components and patterns** in the codebase (`apps/web/src/shared/ui/` for primitives, the slice's own `ui/` for the rest). Compose from them before creating new ones.
3. **Name the screen's single primary action** and the user's goal. If you cannot name one primary action, resolve that before writing code.
4. **Count the steps** from home to this action. If it is a primary action that takes more than 3, redesign it or record the justification in the flow spec (`docs/product/USER_FLOWS.md`).

## Build
5. **Phone layout first** (360 px), then verify at 320 px, then add tablet and desktop treatments where they help. Desktop is its own layout, not an enlarged phone.
6. Follow the token policy (`docs/design/DESIGN_SYSTEM.md` § Token policy). Use semantic HTML. Make every interactive state visible (focus, pressed, disabled, loading, error).
7. Put all interface text through localization. Check the layout with the **longest** translation (usually Russian or Uzbek).
8. Show advanced options progressively. Start with the minimum a new user needs.

## Check before finishing
Answer each question explicitly in your summary:
- **10-second rule:** can a first-time user tell what to do here within about 10 seconds?
- **3-click rule:** is the primary action reachable in 3 actions or fewer?
- **One primary action:** is exactly one action dominant?
- **Plain language:** is there any jargon left in any language?
- **Anti-patterns:** does anything match UI_ANTI_PATTERNS.md? Could this come from a generic template?
- **Accessibility:** keyboard, focus, accessible names, contrast, touch targets ≥ 44 px, no color-only meaning, reduced motion, `lang="en"` on test content.
- **States:** loading, empty, error, and offline (where relevant) are designed, not left as defaults.
- **Visual fidelity:** the `visual-fidelity` workflow is done. That means screenshots of the running app at its widths and in its locales (no horizontal scroll, no clipped actions), compared with any approved reference and the design docs, problems fixed and recaptured, and its self-review answered.

If you cannot render the app and capture screenshots, the UI is not done: say so. Do not claim a visual check you did not do.
