---
paths:
  - "apps/web/**/*.tsx"
  - "apps/web/**/*.css"
---

# Visual implementation

Visual direction: docs/design/DESIGN_CONSTITUTION.md. Token values: docs/design/DESIGN_SYSTEM.md. Forbidden patterns: docs/design/UI_ANTI_PATTERNS.md.

- **Follow the token policy** in docs/design/DESIGN_SYSTEM.md § Token policy. Raw colors are never allowed (`bg-[#e11]`). Do not bypass the type, spacing, or radius scales with off-scale arbitrary values (`text-[13px]`). If a scale lacks a value you need, propose a change. Do not inline it.
- **Red marks the primary action and key brand moments.** One primary action per important screen. Skill colors are for recognition, never for primary actions.
- **Hierarchy comes from type size and weight first**, then spacing, and only then surfaces, borders, or shadows.
- **Restyle third-party primitives** (shadcn/ui, Radix) through tokens. The default library look must never ship.
- **Mobile first.** Write base styles for phones and add larger-breakpoint styles on top. Never hide essential actions on mobile.
- **Text containers must tolerate long Russian/Uzbek strings.** No fixed widths sized to English, and no truncation of meaningful labels.
- **Motion:** short and functional, and disabled under `prefers-reduced-motion`.
