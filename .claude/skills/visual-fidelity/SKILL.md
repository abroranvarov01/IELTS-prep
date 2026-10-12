---
name: visual-fidelity
description: Procedure for making user-facing UI look like IELTS Prep and verifying it visually: sources of truth, local reference screenshots, screenshots of the running app at set widths and locales, comparison, fixing, and the visual self-review. Mandatory for every user-facing UI task, together with ui-implementation, before the task counts as done.
---

# Visual fidelity

This skill owns **how** to implement and verify UI visually. It does not own what the product looks like. Do not restate those rules here; read them from their owners:

| What | Owner |
|---|---|
| Visual direction, target feeling, visual language, surface direction, no-Figma policy | `docs/design/DESIGN_CONSTITUTION.md` |
| Exact values: colors, type scale, spacing, radii, shadows, component values | `docs/design/DESIGN_SYSTEM.md` |
| Forbidden patterns | `docs/design/UI_ANTI_PATTERNS.md` |
| UX rules / accessibility | `docs/product/UX_PRINCIPLES.md` / `docs/design/ACCESSIBILITY.md` |
| Approved reference screenshots | `docs/design/references/` (what qualifies: its `README.md`) |
| When UI counts as done / screenshot commands | `docs/engineering/DEFINITION_OF_DONE.md` § When UI changes / `docs/engineering/QUALITY_GATES.md` |

**Functional correctness is necessary but not sufficient.** A screen that works and passes lint, types, tests and axe, but looks generic, heavy, cramped, empty or off-brand, is not done.

## Sources of truth, in order

1. Owner-approved reference screenshots in `docs/design/references/`
2. `DESIGN_SYSTEM.md`
3. `DESIGN_CONSTITUTION.md`
4. `UI_ANTI_PATTERNS.md`
5. `UX_PRINCIPLES.md`
6. The feature spec (e.g. `docs/product/READING_EXPERIENCE.md`, `docs/product/USER_FLOWS.md`)
7. Existing production code

- **Existing code is not a visual source of truth by itself.** Where the implementation visually conflicts with an approved reference, follow the reference, unless accessibility, approved product behavior, or a documented technical constraint requires otherwise. Then say which one and why.
- **A reference decides composition and visual quality; DESIGN_SYSTEM.md decides exact values.** If a screenshot seems to show a different value (a color, a size), use the token and mention the difference.
- **A screenshot never overrides approved behavior.** Behavior comes from the feature spec.
- **Never resolve a real conflict between a reference and a document silently.** State it in your summary and ask the owner. In the autonomous workflow it is a stop condition (`docs/execution/AUTONOMOUS_WORKFLOW.md`).
- **No Figma.** Nothing in this workflow needs Figma or any other external design tool, and no task waits for one (DESIGN_CONSTITUTION.md § Visual sources and design tooling).

## When no approved reference exists

This is the normal case for most screens, and it never blocks work.

1. Reuse existing project patterns (`apps/web/src/shared/ui/`, the slice's own `ui/`) and the component values in DESIGN_SYSTEM.md.
2. Follow DESIGN_SYSTEM.md and DESIGN_CONSTITUTION.md. Do not invent a new visual language.
3. Build the smallest consistent solution.
4. Capture screenshots (below).
5. If the result introduces a meaningful new visual pattern (a new component look, layout idea, or use of color), ask the owner to approve it and show the screenshots. In the autonomous workflow, a design choice that is not specified is a stop condition.
6. Once approved, the owner may promote a screenshot into `docs/design/references/`. Never promote your own screenshots.

## Workflow (every user-facing UI task)

1. **Read** the sources relevant to the change (the `ui-implementation` skill lists them), including the surface's section in DESIGN_CONSTITUTION.md.
2. **Check for a reference** in `docs/design/references/<area>/`. If one exists, open the image and note what it decides: composition, density, hierarchy, proportions.
3. **Implement** the functionality (`ui-implementation`, `implement-feature`).
4. **Run the engineering checks** (QUALITY_GATES.md).
5. **Render the real application**: a production build of the actual page, not a component in isolation.
6. **Capture screenshots** at the widths, locales and states below.
7. **Compare.** Open each image and look at it. Do not judge from the DOM or the code. Put it side by side with the reference, if one exists, and check it against the design docs.
8. **Review** every dimension in the table below.
9. **Fix** the visual problems.
10. **Capture again** and review the fixed states.
11. **Only then is the UI done.** Report as described at the end.

### What to capture

| Width | Why | When |
|---|---|---|
| 320 px | The smallest supported width | Always |
| 360 px | The approved primary design target and the e2e `mobile` project | Always |
| 390 px | A common larger phone | Always |
| 1024 px | The desktop breakpoint, where desktop layouts are tightest | When the change is visible on desktop |
| 1280 px | A common laptop and the e2e `desktop` project | When the change is visible on desktop |
| A tablet width (e.g. 768 px) | The 600–1023 px range | Only when the layout has a tablet treatment |

- **Locales:** all three at 320 px, where long strings break first. At the other widths, use at least the locale with the longest strings for that screen (usually Russian or Uzbek). English appears at least once.
- **States:** every state the change affects: default, selected, keyboard focus, error, empty, loading, disabled, and open overlays (sheet partial and expanded, dialogs, the action bar). Use the longest realistic content.
- **Framing:** capture the viewport, which is what the user sees first (10-second rule). For pages that scroll, also capture the full page. Phone height is 800 px unless the state depends on height.
- **Proportionality:** scale the set to the change, as DEFINITION_OF_DONE.md does. For a copy change, the affected state at 320 px in the locale with the longest string is enough. A new screen needs the full set. A user-visible change never gets zero screenshots.

### How to capture

- Commands: QUALITY_GATES.md (Screenshots row). Any browser automation that renders the real app works. The repository's Playwright is always available.
- **Wait for real content** (a heading or the element under review) before capturing. A blank or half-loaded image is a failed capture, not a check.
- Screenshots are working files. Keep them outside the repository (the session scratchpad) or in git-ignored output (`test-results/`). Never commit them, and never place them in `docs/design/references/`.

### Review dimensions

| Dimension | Look for | Rule owner |
|---|---|---|
| Identity | Does it read as IELTS Prep, or as a template, default shadcn, raw HTML form, or component-library demo? | DESIGN_CONSTITUTION, UI_ANTI_PATTERNS |
| Typography | Only type-scale sizes. Mobile headings not oversized. Hierarchy: metadata < instructions < question/content < the screen's purpose. Long Reading text comfortable, never tiny, never "zoomed" | DESIGN_SYSTEM § Type scale |
| Hierarchy | One dominant action, obvious within about 10 seconds | UX_PRINCIPLES 1, 3 |
| Spacing and density | Consistent rhythm from the spacing scale. Breathable, not empty. No giant gaps, random margins, or padding that pushes the action below the fold | DESIGN_SYSTEM § Spacing |
| Borders | Quiet. One boundary per state. No double borders, and no border, ring and outline stacked | DESIGN_SYSTEM § Neutrals, § Component states |
| Radii | Set by element size. Nested surfaces smaller than their container. Not everything a pill | DESIGN_SYSTEM § Radii |
| Cards | Each card justified (grouping, state, interaction, emphasis). No nesting | DESIGN_CONSTITUTION, UI_ANTI_PATTERNS |
| Buttons | Red only for the primary action. Approved proportions. No gradients, no giant CTA blocks | DESIGN_SYSTEM (primary, secondary button) |
| Controls | One clean boundary, compact but comfortable height, selected state not shown by color alone, the approved focus ring and no extra ring | DESIGN_SYSTEM (answer option, option rows) |
| Icons | One line family. Stroke and size consistent with the existing icons. Filled only where the fill carries meaning. Icon plus text when the meaning is not obvious | DESIGN_CONSTITUTION |
| Color balance | Red guides attention and does not flood. Tints pale and meaningful. Shadows none or the approved raised level | DESIGN_CONSTITUTION, DESIGN_SYSTEM |
| Responsive | Phone looks designed for a phone. Desktop is its own layout. No horizontal scroll, no clipped actions | DESIGN_SYSTEM § Responsive behavior |
| Localization | Russian and Uzbek fit without shrinking text, clipping, hiding words, or swapping understandable labels for ambiguous icons. Height follows content | LOCALIZATION rule 2 |
| Accessibility | Contrast, visible focus, touch targets, states not by color alone, semantics: all intact after restyling | ACCESSIBILITY |

### Restyling shadcn, Radix and native controls

These provide behavior and accessibility. The look is ours. Keep the primitive's semantics (native inputs, roles, labels, focus handling) and replace its look through tokens. "Accessible default styling" never justifies shipping a visually poor control, and restyling never justifies losing accessibility. The forbidden results (default library look, raw browser controls, stacked boundaries, double focus rings) are listed in UI_ANTI_PATTERNS.md.

## Self-review before completing

Answer each question by looking at the screenshots, not at the code:

- Does it clearly look like IELTS Prep, and not like default shadcn, a template, or a raw form?
- Is the typography on the scale and no larger than the content needs?
- Are controls compact and light, not too tall or heavy?
- Is the primary action obvious?
- Is every card justified?
- Is the spacing breathable, without excessive empty space?
- Are borders quiet, with no double borders or stacked focus rings?
- Are the icons one consistent line family?
- Does red guide attention to the right thing, and only there?
- Does the phone layout look designed for a phone?
- **Surface checks** (DESIGN_CONSTITUTION.md § Surface direction): does Home show one next action? Is Reading comfortable to read, with the passage first on phones? Is Listening audio-first? Do Mocks measure without punishing? Does Progress answer its three questions without a dashboard?
- Does Russian fit? Does Uzbek fit?
- Does it match the approved reference, if one exists?

If an important answer is "no", keep working.

## Report

In the summary, state:
- the widths, locales and states captured, and whether a reference existed and was compared
- the problems found and fixed, and the recapture
- anything you did not check, and why
- any new pattern that needs owner approval, and any conflict between a reference and the docs

Never claim a visual check you did not do. If you cannot render the app, the UI is not done: say so.
