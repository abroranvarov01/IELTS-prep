# Accessibility

Canonical owner of **accessibility requirements**. Target: **WCAG 2.2 Level AA**. This is a requirement, not polish.

## Requirements

### Touch and pointer
- Touch targets are at least **44×44 CSS px**, and 48 px is preferred for primary actions. Spacing between targets prevents mis-taps.
- No interaction depends only on hover, long-press, or complex gestures. Every gesture has a simple tap alternative.

### Visual
- Text contrast is ≥ 4.5:1 (≥ 3:1 for large text, 24 px regular or 19 px bold and up). Essential non-text UI (control borders, focus rings, icons that carry meaning) is ≥ 3:1.
- **Never convey meaning by color alone.** Correct/incorrect answers also use an icon and/or text label. Skill colors always come with the skill name.
- Content works at 200% text zoom and in 320 px width without horizontal scrolling (except realistic exam-simulation layouts on desktop).

### Semantics and screen readers
- Use semantic HTML first (`button`, `a`, `nav`, `main`, headings in order, `label` for inputs, lists for lists). ARIA only fills gaps that native semantics cannot cover.
- Every input and icon-only control has an accessible name.
- Dynamic results (answer checked, timer warnings, AI feedback loaded) are announced appropriately (live regions, used sparingly).
- Page language is set, and test content in English inside a Russian/Uzbek interface is marked with `lang="en"` so screen readers pronounce it correctly.

### Keyboard (desktop and exam simulation)
- Everything is operable by keyboard. Focus order is logical. Focus is visible and never removed.
- Dialogs trap focus and restore it when they close.

### Motion and time
- Respect `prefers-reduced-motion`.
- Timers in practice mode can be paused or turned off. Exam-simulation timers mirror real conditions, and that is stated up front.

### Audio and media
- Listening practice audio controls are accessible. Whether transcripts are offered (after an attempt) is a product decision (TBD), but transcripts must not leak answers during exam simulation.
- Speaking practice handles a denied microphone permission with a clear, plain-language explanation.

## Verification

- Manual: keyboard pass, screen-reader spot check (TalkBack on Android is the priority for our users), 200% zoom, 320 px width.
- Automated checks are planned. See [QUALITY_GATES.md](../engineering/QUALITY_GATES.md#future-deterministic-enforcement).
