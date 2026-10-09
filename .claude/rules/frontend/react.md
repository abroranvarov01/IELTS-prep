---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
---

# React components

Framework-specific rules (for example Next.js server/client components and data fetching) will be added here once the framework ADR is accepted. Until then these rules are framework-agnostic.

- **Components render and collect input.** Scoring, answer checking, band conversion, and recommendation logic come from domain code (docs/architecture/INVARIANTS.md I-2, I-3). If you are writing an IELTS rule inside JSX or a hook, move it to domain code.
- **Keep state as local as possible.** Lift it only when a second consumer actually exists. Do not add global state for data that one screen uses.
- **Derive instead of syncing.** Do not mirror props or other state into state through effects. Use effects only to synchronize with systems outside React.
- **Semantic HTML first.** Buttons are `<button>`, navigation is `<a>`/links, inputs have `<label>`s. Requirements: docs/design/ACCESSIBILITY.md.
- **No hard-coded user-facing strings.** See docs/product/LOCALIZATION.md. Test content (passages, questions) is data passed in, not interface text.
- **Mark English test content inside a localized interface with `lang="en"`.**
- **Props describe the domain, not the styling.** Prefer `variant="primary"` with token-based styles over passing class strings or colors from the outside.
- **Extract a component** when the threshold in docs/engineering/CODE_QUALITY.md § Abstraction threshold is met. Not to make a file shorter.
- **Every async UI has loading, empty, and error states**, with localized plain-language messages.
- For UI work, follow the `ui-implementation` skill.
