# ADR-0007: Building Blocks for the Question Sheet and Passage Selection

- **Status:** Accepted (2026-10-10, owner, task M4-09; drafted in M4-08). Code locations: the folders it names (`domain/`, `data/`, `features/`, `components/`) moved with [ADR-0010](0010-feature-sliced-design-in-apps-web.md), which maps them.
- **Date:** 2026-10-10
- **Deciders:** Project owner (acceptance), Claude (draft)

## Context

The Reading screen (M4 drafts in [READING_EXPERIENCE.md](../../product/READING_EXPERIENCE.md#m4-specifications-drafts)) needs two interaction pieces the app does not have: a **persistent, non-modal bottom sheet** with three states, dragging with snap, tap and keyboard alternatives, and docking on the phone keyboard; and **passage selection** for highlighting and Pin Evidence (draft: whole sentences, chosen by tap, click or arrow keys). ROADMAP lists "UI primitives approach (shadcn/Radix or not)" as an M4 decision.

Forces:
- **Accessibility:** the sheet is not a dialog. The passage behind it stays readable and operable, so a modal's focus trap and hiding the rest of the page from screen readers would be wrong ([ACCESSIBILITY.md](../../design/ACCESSIBILITY.md)).
- **Mid-range Android phones on variable connections:** every kilobyte of JavaScript on the reading screen counts.
- **DESIGN_CONSTITUTION.md** allows shadcn/ui or Radix for behavior only, restyled through tokens; a dependency that sets a project-wide pattern needs a reason ([CODE_QUALITY.md](../../engineering/CODE_QUALITY.md#dependency-discipline)).
- Library state on 2026-10-10 (npm registry): **vaul** 1.1.2, last published 2024-12, built on Radix Dialog (modal by design); **react-modal-sheet** 5.6.0, maintained, requires the `motion` animation library; **react-spring-bottom-sheet** 3.4.1, last published 2022-07, no React 19 support; **@radix-ui/react-dialog** 1.2.0, maintained, a modal dialog primitive with about 15 internal packages.

## Decision

### 1. The question sheet is built in the app, without a library
- A `region` ("Questions") fixed to the bottom of the viewport, rendered after `main`, with three heights from the M4-05 proposal (collapsed, partial, expanded) set by the sheet state in the session's view (ADR-0006).
- **Tap and keyboard first:** the handle is a `<button>` toggling collapsed and partial; opening an option list or the navigator expands the sheet, and closing returns it to partial. These are ordinary state changes.
- **Dragging** on the handle area with Pointer Events (`setPointerCapture`), following the finger and snapping to the nearest state on release; the sheet's body scrolls natively and is never a drag target.
- **Phone keyboard:** the `VisualViewport` API positions the sheet above the on-screen keyboard while a text field has focus (resize and scroll events), and restores it afterwards.
- **Motion:** a CSS height (or transform) transition with the approved "base" duration and easing; none with reduced motion (the existing global rule).
- About two hundred lines plus tests, in `apps/web/src/features/reading/` (ADR-0004), not a shared component until a second feature needs it.

### 2. Sentences are React-rendered targets; no Selection or Range APIs
- The passage renders each sentence (ADR-0005 ids) as an inline element inside its paragraph, so the text reads continuously for everyone.
- **Tap or click** is handled by one delegated listener on the passage. **Keyboard:** the passage is one Tab stop; arrow keys move focus between sentence elements (roving `tabindex`); Enter opens the action bar.
- **Highlights** are rendered from session state as `<mark>` around the sentence's text; **pin markers** as inline chips. Nothing edits the DOM outside React, so hydration and re-renders stay correct.
- If the owner chooses free text ranges instead of sentences (M4-03 open question 1), this part changes to the Selection API for choosing, ranges stored as sentence id plus offsets, and the CSS Custom Highlight API (`::highlight()`) for drawing without changing the DOM. That would get its own design pass.

### 3. Confirmations use the native `<dialog>` element
- The Exam "Leave the test?" confirmation is a real modal decision, so it uses `<dialog>` with `showModal()`: the browser provides focus containment, Escape and making the page behind it inert, without a library. Styled with tokens.
- The finish confirmation stays inside the expanded sheet, as the M4-02 draft specifies.

### 4. No shadcn/ui or Radix in M4
Option lists are native radio and checkbox groups; buttons and links are native. Nothing in M4 needs a behavior primitive the platform lacks. The question comes back if a later component does (for example a combobox or a tooltip).

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A. Hand-built sheet, React-rendered sentences, native `<dialog>` (chosen)** | Exactly the non-modal semantics needed; no JavaScript added beyond our code; tokens everywhere; no dependency to watch | We write and test dragging, snapping and keyboard docking ourselves |
| B. vaul (`modal={false}`) | Snap points and dragging ready-made | Built on a modal dialog primitive; no release since 2024-12; brings Radix Dialog's dependencies |
| C. react-modal-sheet | Maintained; snap points | Requires the `motion` library on the reading screen; modal-oriented API |
| D. Radix Dialog as the sheet's base | Well-tested accessibility for dialogs | The sheet is not a dialog: focus trapping and hiding the passage are wrong here |
| E. Free text selection now (Selection API and CSS Custom Highlight API) | Closer to computer-delivered IELTS on desktop | Competes with the phone's own selection menu; ranges are hard by keyboard; depends on the M4-03 open question |

## Why this decision

- **Correctness:** the semantics match the spec (a persistent region, not a dialog), and the keyboard and screen-reader paths are designed, not inherited from a modal.
- **Simplicity:** no new dependency; the platform provides pointer events, `VisualViewport`, `<mark>` and `<dialog>`.
- **Consistency:** native elements first, as in the language switcher (M1) and onboarding (M3), styled only through tokens.

## Consequences

- **Positive:** the reading screen ships only its own code; every state is under our control and testable.
- **Costs accepted:** gesture code to maintain and test on real phones (drag, snap, keyboard docking); e2e tests emulate touch for dragging and use the tap and keyboard paths for everything else.
- **Harder to change later:** little; the sheet is one component inside the Reading feature.

## Follow-up / migration notes

- **Implementation:** M4-13 (sheet), M4-18 (sentences and highlighting), M4-19 (pins), M4-20 (the Exam exit `<dialog>`).
- **Docs on acceptance:** the ADR index; ROADMAP M4 ("UI primitives" decided); DESIGN_CONSTITUTION.md needs no change.
