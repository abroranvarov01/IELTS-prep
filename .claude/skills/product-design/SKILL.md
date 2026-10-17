---
name: product-design
description: >
  Canonical product-design skill for IELTS Prep. Governs art direction,
  screen composition, visual hierarchy, component expression, responsive
  adaptation, and screenshot-based visual refinement for all user-facing UI.
  Use for every screen redesign, new screen, user-facing component, or visual
  quality task. Exact reusable tokens remain owned by DESIGN_SYSTEM.md.
---

# IELTS Prep — Product Design Skill

## 0. Mission

The job is not to make the UI merely clean.

The job is to make every user-facing IELTS Prep screen feel intentionally
designed, premium, calm, modern, mobile-first, and recognizably part of the
same product.

A technically correct screen can still be a design failure.

A screen is not done because:
- spacing is consistent,
- typography is smaller,
- shadcn defaults are hidden,
- tests pass,
- accessibility passes.

Those are baseline requirements.

A screen is done when the composition, hierarchy, proportions, interaction
presentation, brand expression, and responsive behavior feel deliberate.

## 1. Ownership and sources of truth

Use this order:

1. Owner-approved local visual references in `docs/design/references/`
2. `docs/design/DESIGN_SYSTEM.md`
3. `docs/design/DESIGN_CONSTITUTION.md`
4. `docs/design/UI_ANTI_PATTERNS.md`
5. `docs/product/UX_PRINCIPLES.md`
6. Relevant feature/product spec
7. Existing production implementation

Important:
- Existing code is NOT automatically visually correct.
- Existing code may contain legacy visual debt.
- Figma is optional; never block implementation on Figma.
- Local screenshots are the visual reference mechanism.
- Exact reusable values belong in DESIGN_SYSTEM.md, not in this skill.

## 2. Core art direction

IELTS Prep should feel:
- calm
- premium
- focused
- modern
- trustworthy
- human
- educational
- mobile-native
- lightweight
- precise
- confident

It should NOT feel:
- generic SaaS
- admin dashboard
- shadcn demo
- web form
- AI template
- glassmorphic
- neon/futuristic
- childish
- over-gamified
- empty because everything is tiny and centered
- busy because everything is in a card

Visual identity:
- white-first
- strong red primary accent
- ink/black typography
- warm/blush support surfaces
- subtle neutral borders
- soft semantic skill colors where useful
- clean line icons
- restrained shadows
- controlled whitespace
- occasional editorial/organic red motifs outside core task content

Red should direct attention, not decorate everything.

## 3. Design thinking before styling

Before touching CSS, answer:

1. What is the single most important thing on this screen?
2. What should the eye see second?
3. What can be visually quiet?
4. What can be removed?
5. Does this screen need a card at all?
6. What is the visual object of the screen?
7. How does desktop use its extra canvas?
8. How does mobile become more focused instead of simply narrower?
9. What makes this screen feel like IELTS Prep rather than any other app?
10. Is the current composition worth preserving?

Do NOT default to preserving an existing composition.

Behavior can remain identical while visual composition changes substantially.

Allowed visual changes include:
- regrouping content
- changing horizontal/vertical composition
- changing proportions
- changing visual focal point
- changing card/surface usage
- changing selected-state presentation
- introducing or removing decorative support areas
- moving secondary actions
- changing layout by breakpoint
- replacing generic primitives with product-specific presentation components

Do not change approved product behavior unless explicitly requested.

## 4. Composition rule

Never start with:

"How do I style these components?"

Start with:

"What composition best communicates this decision/task?"

Weak pattern:

Heading
Subtitle
Outlined option
Outlined option
Outlined option
Button

Even if polished, this often remains a form.

A stronger composition may use:
- two primary choices with different visual weight
- a quiet secondary action
- a brand/support region
- meaningful asymmetry
- a compact score selector
- a task-focused workspace
- a contextual panel
- one dominant action area

Do not use the same composition for every screen.

Consistency means shared visual language, not identical layout templates.

## 5. Desktop is not stretched mobile

This is mandatory.

On wide screens, do not leave a 480–560px form floating in a 1440px white canvas
unless the specific experience truly benefits from extreme focus.

Desktop must intentionally use space.

Possible strategies:
- two-column composition
- editorial/support area + task area
- wider task workspace
- centered but visually anchored composition with controlled background field
- side contextual information
- asymmetric balance

Avoid:
- tiny center column + 70% meaningless white space
- mobile card widths reused on desktop without thought

For onboarding, desktop should usually use roughly 900–1200px of intentional
composition, even when the actual decision controls remain compact.

## 6. Mobile is not compressed desktop

Mobile prioritizes:
- thumb reach
- one main action
- reduced decoration
- concise support content
- natural vertical flow
- edge-to-edge or near-edge usable content
- compact headers
- content-driven height

Do not mechanically stack desktop columns.

## 7. Typography

UI font comes from DESIGN_SYSTEM.md.
Reading passage font comes from DESIGN_SYSTEM.md.

Typography rules:
- compact, not timid
- bold used intentionally
- avoid giant mobile headings
- metadata is quiet
- helper text is visibly secondary
- question/task title is strong
- primary screen purpose is strongest only when necessary

Hierarchy:

metadata
< helper/instruction
< section title
< question/content title
< primary screen purpose

Avoid:
- everything bold
- everything same size
- excessive font-size jumps
- weak gray body text with poor contrast
- oversized body text that makes content feel zoomed

Reading passage:
- comfortable line length
- comfortable line-height
- clear paragraph rhythm
- no decorative typography that harms reading speed

## 8. Spacing and density

The goal is neither cramped nor empty.

Rules:
- related things sit closer
- unrelated sections get stronger separation
- do not use 24/32px everywhere by habit
- do not put huge margins around already-small content
- do not use whitespace as a substitute for composition

Bad:
- tiny module at top-center + giant unused page
- giant 80px+ blank areas between simple controls

Good:
- deliberate rhythm
- balanced density
- clear grouping
- meaningful breathing room

## 9. Surfaces, borders, cards

Cards are not the default.

Use a card when it expresses:
- grouping
- interaction boundary
- state
- emphasis

Preferred:
- white / near-white / soft blush
- subtle border
- soft radius
- minimal shadow

Avoid:
- every item in a rectangle
- nested card inside card inside card
- thick gray outlines
- strong black borders
- excessive shadows
- glassmorphism

A selected state should feel branded, not simply "border became red."

Possible selected treatment:
- soft blush fill
- stronger label weight
- red icon background or indicator
- subtle border
- checkmark integrated into composition

Use multiple signals; do not rely only on color.

## 10. shadcn policy

shadcn is implementation infrastructure, not visual identity.

Allowed uses:
- dialog semantics
- focus management
- popover behavior
- accessible primitives
- keyboard interactions

Forbidden as final appearance:
- default Button
- default RadioGroup presentation
- default Input look
- default Select look
- default Card look
- default focus treatment when it creates double rings/borders

Product-specific visible primitives should exist when needed:

Examples:
- `OnboardingChoice`
- `BandChoice`
- `QuestionOption`
- `QuestionNavigator`
- `ReadingSheet`
- `EvidenceAction`
- `ListeningPlayer`
- `EvidenceAudioCard`
- `GoalSummary`
- `NextStepCard`
- `MockResultSummary`

Create these only for real repeated product patterns.

## 11. Iconography

Use a single coherent line-icon language.

Rules:
- consistent stroke weight
- restrained size
- functional meaning first
- icon + text when ambiguous
- no random Unicode symbols as UI icons
- no mixing outline and filled icon families without a state reason
- no generic 3D illustrations for core UI

Decorative brand visuals may be abstract/editorial, but functional icons stay simple.

## 12. Brand expression without noise

Do not reduce branding to:
- logo
- red button
- red border

Brand can be expressed through:
- composition
- soft red/blush fields
- restrained organic arcs/shapes
- editorial negative space
- icon treatment
- selection language
- line motifs
- consistent proportions

Use brand motifs mainly in:
- onboarding
- empty states
- celebration
- marketing/support areas
- progress summaries

Keep core exam/practice content calmer.

Do not put decorative motifs behind text where they reduce readability.

## 13. Onboarding art direction

Onboarding must NOT feel like a survey.

It should feel like:
"Set your direction in a few confident choices."

### Step 1 — Exam type

Primary:
- Academic
- General Training

Secondary:
- Not sure yet

Do not render all three identically.

Desktop:
- primary choices can be expressive tiles/cards
- support/brand composition may occupy meaningful space
- secondary option is visually quieter

Mobile:
- compact stacked or grid choices
- minimal decorative support
- strong selected state

Avoid:
- three identical full-width outlined rows
- narrow form floating in giant white page

### Step 2 — Target band

The score is the visual object.

It should read:
"This is my goal."

Prefer:
- compact band selector
- pills/tiles
- clear selected score
- strong but controlled red state
- quiet "not sure yet"

Avoid:
- six full-width radio rows
- settings-menu feeling

### Step 3 — Level check

This screen creates momentum.

Communicate:
- what the check does
- optionally approximate effort/time if product-approved
- one primary CTA
- quiet skip

A supporting visual may be used, but do not create a giant decorative banner
that consumes more attention than the action.

The visual should feel useful, not filler.

## 14. Home art direction

Home answers:
"What should I do now?"

One clear primary action.

The home screen should contain only information that helps the next decision.

Avoid:
- dashboard card grids
- equal visual weight for everything
- giant hero title
- giant CTA
- analytics for the sake of analytics

Goal/target context should be visible but quiet.

Progress should be compact and actionable.

## 15. Reading art direction

### Mobile
Passage is the dominant surface.

Question UI uses the approved bottom sheet:
- collapsed
- partial
- expanded

The sheet must feel integrated, not like a generic modal/form.

Question hierarchy:
- metadata quiet
- instructions secondary
- question clear
- controls compact

Passage must not auto-scroll on question change.

### Pin Evidence
Signature interaction.

Should feel:
- precise
- obvious
- calm
- connected to the current question

Avoid:
- giant toolbars
- excessive highlight opacity
- heavy boxes around text

### Desktop
Exam workspace:
- passage left
- questions right
- clear divider
- compact navigator
- intentional proportions
- no raw HTML form feeling

Navigator is content-driven height.

Do not replace clear labels with icons merely to save space.

## 16. Listening art direction

Listening is audio-first.

Hierarchy:
1. compact header
2. progress
3. player/waveform
4. current question
5. answer controls
6. compact navigation

Practice may expose:
- rewind
- speed
- transcript
- evidence timestamp
- explanation

Exam removes learning support.

Listening may use blue as restrained semantic support, but brand red remains primary.

### Evidence in audio
Signature review pattern:
- timestamp
- transcript excerpt
- highlighted evidence phrase
- replay
- explanation

Avoid turning review into a giant stack of bordered cards.

## 17. Mock and progress

Mocks are measurement, not judgment.

Avoid:
- failure-red screens
- harsh emotional framing
- overfocus on one score

Prefer:
- calm result
- score range/trend when justified
- weak areas
- next action

Progress answers:
- am I improving?
- what is weak?
- what next?

Do not turn progress into a vanity dashboard.

## 18. Responsive strategy

At a screen's checkpoint, inspect at:
- 320px
- 390px
- 1024px
- 1280px
- 1440px when desktop composition matters

While iterating, capture only the widths and states the adjustment affects.

Check:
- English
- Russian
- Uzbek

Do not fix overflow by:
- shrinking important text too far
- clipping labels
- hiding meaning
- converting understandable labels into ambiguous icons

Allow content-driven height.

## 19. Accessibility

Beautiful AND accessible.

Maintain:
- contrast
- visible focus
- keyboard interaction
- semantic structure
- screen-reader meaning
- touch targets
- non-color state cues

Do not preserve ugly default styles in the name of accessibility.
Restyle the primitive while keeping semantics.

## 20. Golden references

Local approved screenshots live in:

`docs/design/references/`

They represent:
- composition
- visual hierarchy
- proportions
- density
- visual quality

They do NOT automatically define every pixel/token.

Exact reusable values come from DESIGN_SYSTEM.md.

When the owner approves a new screen:
- save the approved screenshot in the relevant references folder
- use it for future visual comparisons

Temporary screenshots must not automatically become approved references.

## 21. Mandatory creative workflow

For a new or weak screen:

### Phase A — Diagnose
Capture the current UI.

Write a short internal diagnosis:
- what feels generic?
- what is the visual focal point?
- is the composition appropriate?
- is desktop using its canvas?
- is mobile focused?
- is there too much form-like structure?
- is the brand expressed only through red borders/buttons?

### Phase B — Recompose
Before CSS polish, decide:
- primary object
- secondary object
- screen structure
- grouping
- desktop composition
- mobile adaptation

If needed, substantially change layout.

### Phase C — Implement
Use existing tokens and product-specific primitives.

### Phase D — Screenshot
Capture actual rendered UI.

### Phase E — Critique
Review:
- composition
- hierarchy
- balance
- typography
- spacing
- surfaces
- selected states
- iconography
- brand presence
- responsive adaptation
- localization

### Phase F — Iterate
If it still looks like:
- a form
- a component library
- a wireframe
- a generic SaaS page

then continue.

One pass is not enough when the composition is weak.

## 22. Screenshot comparison workflow

A user-facing UI task is not complete until the actual rendered page is visually reviewed.

Required loop:

implement
→ screenshot (dev server)
→ critique
→ fix
→ screenshot again
→ … until the batch is coherent
→ checkpoint: full screenshot set + the change class's checks, once
→ done

Do not run automated suites between iterations. Batch related adjustments
(one screen, or one shared pattern across screens) into one checkpoint. Which
checks a checkpoint needs, and when the full suite runs, is owned by
`docs/engineering/DEFINITION_OF_DONE.md` § Validation by risk. Record each
checkpoint in the validation record in `docs/execution/PROGRESS.md`.

For visual-redesign tasks, screenshots are mandatory. Capture commands:
`docs/engineering/QUALITY_GATES.md` (Screenshots). Wait for real content
before capturing. Screenshots are working files in the session scratchpad,
never committed.

Do not mark done because:
- tests pass
- no overflow exists
- spacing tokens are used

## 23. Visual self-review checklist

Before completion:

- Does this look intentionally designed?
- Is there a clear visual focal point?
- Does desktop use its space deliberately?
- Does mobile feel native rather than compressed?
- Is this recognizably IELTS Prep without relying only on the logo?
- Does it look like a form?
- Does it look like default shadcn?
- Are there too many rectangles?
- Are selected states expressive enough?
- Are borders too visible?
- Is red used with restraint?
- Are icons consistent?
- Is typography hierarchical?
- Is there meaningless whitespace?
- Are cards actually necessary?
- Does RU fit?
- Does UZ fit?
- Does the screen match an approved reference when one exists?

If a major answer is wrong, continue.

## 24. Anti-patterns

Never ship:

- generic AI SaaS look
- purple/blue AI gradients
- glassmorphism
- default shadcn appearance
- raw browser controls
- every choice as an outlined rectangle
- card-heavy dashboards
- tiny centered forms in giant desktop canvases
- huge mobile headings
- giant CTA blocks
- excessive borders
- double focus rings
- inconsistent icon families
- excessive shadows
- decorative motion that delays learning
- desktop UI merely shrunk to mobile
- mobile UI merely stretched to desktop
- brand identity that is only a logo + red button
- empty decoration that adds no hierarchy or meaning

## 25. When no reference exists

If no approved reference exists:

1. Reuse established product patterns.
2. Follow DESIGN_SYSTEM and DESIGN_CONSTITUTION.
3. Use this skill to create intentional composition.
4. Do not introduce a new aesthetic family.
5. Capture screenshots.
6. If a meaningful new visual pattern is introduced, require owner approval before treating it as canonical.
7. Once approved, save a local reference screenshot.

No Figma dependency.

## 26. Refactoring rules for visual redesign

Visual redesign may reveal weak component boundaries.

Allowed:
- extracting repeated product-specific presentation components
- consolidating duplicated visual patterns
- creating reusable variants for genuine repeated states

Not allowed:
- speculative design frameworks
- giant universal components
- architecture rewrites unrelated to visual quality
- unnecessary dependencies

Prefer:
Correctness
→ Clarity
→ Simplicity
→ Consistency
→ Maintainability
→ Performance
→ Cleverness

## 27. Definition of done for UI

A user-facing screen is visually done only when:

- approved behavior is preserved
- the checkpoint checks for its change class pass (DEFINITION_OF_DONE.md § Validation by risk)
- accessibility remains correct
- responsive screenshots were reviewed
- representative RU and UZ were reviewed
- composition is intentional
- hierarchy is clear
- product-specific visual language is visible
- default library styling is not visible
- no known major visual regression remains
- if an approved reference exists, implementation is visually aligned with it

Functional correctness alone is never sufficient.

## 28. Final quality standard

Do not optimize for:

"Clean enough."

Do not optimize for:

"Looks better than before."

Optimize for:

"This screen feels like a deliberate, premium IELTS Prep product and is good
enough that we would not expect to redesign the same visual foundation again
in the next milestone."
