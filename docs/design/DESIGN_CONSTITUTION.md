# Design Constitution

Canonical owner of the **approved visual direction** (what the product should look and feel like) and of the **design-tooling policy**.

- Concrete values (colors, type, spacing): [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
- What to avoid: [UI_ANTI_PATTERNS.md](UI_ANTI_PATTERNS.md)
- UX rules: [UX_PRINCIPLES.md](../product/UX_PRINCIPLES.md)
- Approved reference screenshots: [references/](references/README.md)
- How Claude implements and verifies the look: the [`visual-fidelity` skill](../../.claude/skills/visual-fidelity/SKILL.md)

## Approved core (do not change without explicit product approval)

1. **White-first.** Clean white surfaces carry the interface. Color is used with intent, not as wallpaper.
2. **Red is the brand accent.** It is strong and confident, inspired by IELTS's visual identity but **not copied** from it (not the same red, logo treatment, or layouts). Red marks the primary action and key brand moments. It does not flood whole screens.
3. **Bold, modern typography.** Hierarchy comes mainly from type size and weight, not from boxes, borders, and shadows.
4. **Strong contrast.** Text is clearly readable outdoors on a mid-range phone.
5. **Modern education product.** Premium rather than corporate. Friendly without becoming childish.
6. **Simple interaction.** Attractive, and still obvious at a glance.
7. **Mobile-first.** See [UX_PRINCIPLES.md](../product/UX_PRINCIPLES.md#5-mobile-first).

## Target feeling

**Approved** (owner, 2026-10-12). Calm, premium, focused, modern, trustworthy, educational and mobile-native. Simple without looking empty, and visibly designed on purpose. It must never read as generic AI-generated SaaS, default shadcn, raw HTML forms, a component-library demo, or a desktop interface scaled down to a phone ([UI_ANTI_PATTERNS.md](UI_ANTI_PATTERNS.md)).

## Visual language

**Approved** (owner, 2026-10-12). Exact values are in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

- **Color balance:** white surfaces, `ink` text, subtle neutral boundaries, and restrained pale tints that carry meaning. Red guides attention to what matters most and never floods the interface. Shadows are very soft and rare.
- **Typography:** "bold" means weight, not size. The type scale is deliberately compact, and mobile headings stay within it. Hierarchy runs metadata < instructions < question or content < the screen's main purpose. Long-form Reading text is set for comfort: a reading size (never tiny, never like browser zoom), clear paragraph rhythm, and a controlled line length.
- **Spacing:** breathable, not empty. One consistent vertical rhythm from the spacing scale, with no giant gaps, random margins, or padding that only adds bulk.
- **Cards are not the default layout primitive.** Use one only to group, show a state, make a distinct interactive unit, or add emphasis. A card is quiet: a soft radius, a subtle boundary or tint, and no shadow beyond the approved elevation. Cards are not nested.
- **Buttons:** the primary button is red, with a clear label and strong contrast. It is compact and dominant only when it really is the screen's primary action. No gradients and no giant CTA blocks.
- **Answer controls:** one clean boundary, a soft radius, a compact but comfortable height, and a clear selected state that does not rely on color alone. The approved focus ring is the only extra line. Minimal visual noise.
- **Icons:** one coherent line-icon language, with consistent stroke weight and size. Visually light and never emoji-like, and no 3D artwork for functional controls. A filled shape is used only where the fill carries meaning (as in the approved M5 outcome and evidence marks), never as a random mix of families. Use icon and text together when the meaning is not immediately clear.

## Surface direction

**Approved** (owner, 2026-10-12). How each area should feel. Behavior is owned by the feature specs. For surfaces without a spec yet (Listening, mocks, progress), this guides design until the spec exists and does not decide anything marked TBD.

- **Home** answers "What should I do next?" One obvious next action. The goal and target band stay quiet, and progress stays compact. No dashboard, no hero text, no oversized CTA, and no corporate-SaaS look.
- **Listening is audio-first.** Typical order: a compact top bar, progress, the player (or waveform), the current question, its answer controls, then compact navigation. Practice may offer learning help (rewind, speed, transcript, evidence timestamps, explanations). Exam Mode removes it. Restrained blue, the Listening skill color, may be a secondary accent, and red stays the brand. **Listening review's signature evidence** is the exact timestamp, a transcript excerpt with the evidence phrase highlighted, replay, and the explanation.
- **Mocks measure, they do not judge.** Present the result calmly as one snapshot, with a range or trend once enough data exists ([honest feedback](../product/PRODUCT.md#honest-feedback-non-negotiable)), then what went wrong and what to do next. No large red failure screens, no shame language, and no public comparison by default.
- **Progress** answers three questions: Am I improving? What is weak? What should I do next? Show a trend or range only when real data supports it. No vanity metrics, no meaningless dashboard cards, no false precision, no clutter.

Reading is covered in [Reading is the signature experience](#reading-is-the-signature-experience) below.

## Supporting color

- Each of the four skills (Reading, Listening, Speaking, Writing) may have a supporting color that helps users recognize it quickly.
- Skill colors are **supporting**: for tags, small accents, and soft background tints. They never compete with red for the primary action.
- Soft supporting tints are used selectively, for example to group related content. They are not applied to every card.

## Typography direction

- **UI:** Manrope, or an equivalent modern and highly readable sans-serif.
- **Long reading passages:** a quality reading serif such as Literata, *if* testing shows it improves long-form reading on phones.
- Font choices must cover Uzbek Latin characters and Cyrillic (see [LOCALIZATION.md](../product/LOCALIZATION.md)).

## Reading is the signature experience

The phone Reading experience is a key differentiator, and its design gets more care than anything else. The approved interaction model (passage-first, question bottom sheet, Pin Evidence, Practice/Exam modes) is owned by [READING_EXPERIENCE.md](../product/READING_EXPERIENCE.md).

How it should feel (owner, 2026-10-12):
- **Phone:** the passage is the main visual surface. The question sheet feels like part of reading, not a giant detached form, and its controls are compact and fit the question type.
- **Pin Evidence** is the signature interaction. A selected or pinned sentence is obvious but quiet, and the text stays fully readable.
- **Desktop:** a compact, exam-like workspace of passage and questions with a clear navigator, never a raw document next to an HTML form. Long Russian and Uzbek labels get content-driven height, not ambiguous icons.

## Component libraries

shadcn/ui (or Radix) may be used as **behavior, accessibility and interaction infrastructure**. Its default look is never acceptable as the final IELTS Prep design, and neither is the browser's default form styling. Every primitive is restyled through our tokens, and its accessibility is kept. Accessible default styling is not a reason to ship a visually poor control.

## Visual sources and design tooling

**Approved** (owner, 2026-10-12).
- **The visual source of truth is local:** owner-approved screenshots in [references/](references/README.md) together with these design documents. Existing code is not a visual reference by itself. The order in which sources win is in the [`visual-fidelity` skill](../../.claude/skills/visual-fidelity/SKILL.md).
- **Figma is optional design tooling, not repository infrastructure.** Development stays fully usable without Figma, a Figma MCP server, paid design subscriptions, or external design API credits. If a Figma design exists, the owner may export screenshots, approve them, and add them to [references/](references/README.md). No task requires Figma or waits for it.

## Quality bar

The product should match the clarity and polish of the best modern education apps. When unsure, choose the option that is **clearer**, not the one that is more decorative.
