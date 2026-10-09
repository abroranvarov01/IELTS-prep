# Reading Experience

Canonical owner of the **Reading interaction model**, the product's signature experience.

> **STATUS: APPROVED PRODUCT/UX DIRECTION.** The interaction model below is decided. Exact visual measurements, gestures, component structure, and implementation are **not** decided. Nothing here is implemented.

General UX rules still apply ([UX_PRINCIPLES.md](UX_PRINCIPLES.md)), as do accessibility requirements ([ACCESSIBILITY.md](../design/ACCESSIBILITY.md)) and the visual system ([DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md)).

## Mobile Reading (approved direction)

1. **The passage is the main visual object.** It gets the screen, the reading typography, and the user's attention.
2. **Questions live in a persistent, floating bottom sheet** over the passage, not on separate pages.
3. **The sheet shows the current question** without forcing the user to keep switching between a passage page and a question page. Users read and answer in the same place.
4. **Question UI adapts to the IELTS question type** (e.g. multiple choice, True/False/Not Given, matching headings, completion tasks). Each type gets the interaction that suits it on a phone. A generic form is not enough.
5. **Users can highlight text** in the passage.
6. **Pin Evidence.** While answering, the user can pin the sentence or paragraph they believe supports their answer, so it stays visible next to the question.

## Review (Practice Mode)

**Evidence-first review.** For each question, review shows:
- **where the answer comes from** in the passage (the evidence, located in context), and
- **why**: the paraphrase or reasoning that connects the question wording to the passage wording.

If the user pinned evidence, review compares it with the actual evidence. Review feeds Error Intelligence and supports "Explain simpler" (both owned by [PRODUCT.md](PRODUCT.md#approved-product-principles)).

## Practice Mode vs Exam Mode

| | Practice Mode | Exam Mode |
|---|---|---|
| Goal | Comfortable learning | Reproduce real test constraints |
| Learning help (explanations, hints, Explain simpler) | May be available | **Removed** |
| Highlighting | Yes | Expected yes, because the real computer-delivered test allows it. Confirm in design. |
| Pin Evidence | Yes | Not decided |
| Timing | Flexible (see [ACCESSIBILITY.md](../design/ACCESSIBILITY.md#motion-and-time)) | Real test timing |
| Feedback | Evidence-first review | After the test only |

## Desktop

**Desktop Exam Mode** may use a realistic side-by-side passage/question layout that resembles computer-delivered IELTS, instead of copying the mobile bottom-sheet layout. Mobile is optimized for comfortable learning. Desktop can provide realistic simulation.

## Open details (not yet decided)

- Sheet sizes and snap points, gestures, and how the passage scroll position relates to the current question.
- Highlight colors and styles, and whether highlights and pinned evidence persist across sessions and devices.
- Whether Pin Evidence is available in Exam Mode.
- The exact Practice Mode help features beyond evidence-first review.
- The interaction for each question type (this needs one design pass per type).
- Accessibility of the sheet: screen-reader order between passage and sheet, keyboard access on desktop, behavior at 200% zoom and 320 px width, reduced motion.
