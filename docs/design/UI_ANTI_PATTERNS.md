# UI Anti-Patterns

Canonical owner of the **list of forbidden visual and interaction patterns**. They are the usual ways AI-generated and template UIs degrade. If a design or implementation contains one, change it.

| Anti-pattern | Why it fails here | Do instead |
|---|---|---|
| Generic AI-SaaS look (hero gradients, sparkles, floating blobs) | Feels templated and untrustworthy. It is not an education product. | White surfaces, bold type, red accent used with intent |
| Random purple/blue gradients, or gradients as decoration anywhere (buttons, backgrounds, cards) | Off-brand noise | Flat brand and skill colors from tokens |
| Excessive glassmorphism / blur | Low contrast and slow on mid-range phones | Solid surfaces |
| Every element wrapped in a rounded card | Flattens hierarchy and wastes phone width | Use spacing, headings, and dividers. Card only when something is a distinct, tappable unit. |
| Dashboard overload (many tiles, many numbers, a wall of cards) | Breaks the 10-second rule | One clear next action, then a small amount of progress context |
| A desktop interface shrunk onto a phone (dense columns, small targets, hover-only affordances) | Breaks mobile-first and is hard to use with a thumb | Phone layout first. Desktop gets its own layout. |
| Huge mobile headings | Push the content and the action below the fold, and shout | The approved type scale. Hierarchy from weight and spacing. |
| Giant CTA blocks (oversized buttons, banner-like CTA panels) | Shout instead of guiding, and waste phone height | The approved primary button, dominant through color, not size |
| Tiny long-form reading text, or passage text that feels zoomed | Tiring on a phone. Reading depends on comfort. | The approved passage size, line height and measure |
| Decorative charts that answer no question | Looks analytical, means nothing | A chart only when it answers a question the user actually has. Otherwise a sentence. |
| Low-contrast gray on gray | Unreadable outdoors, fails accessibility | Neutral tokens with verified contrast |
| Icon-only actions with unclear meaning | Users must guess, and translations cannot help | Icon + label. Icon-only only for universal actions (close, back, play), and even then with an accessible name. |
| Inconsistent icon families (mixed stroke weights, random filled and outline icons, emoji-like or 3D icons on controls) | Looks assembled, not designed | One line family with consistent stroke and size. Fill only where it carries meaning. |
| Heavy or many shadows | Visual noise, dated look | At most the two elevation levels in the design system |
| Excessive borders (every section outlined, thick or dark lines where space would do) | Busy, dated, form-like | Spacing and surface color first. `border.subtle` for decoration, `border.control` only for essential boundaries. |
| Stacked boundaries: double borders, or a border, ring and outline showing as separate lines on one element, or a focus ring on top of another ring | Visual noise. Focus becomes hard to read. | One boundary per state (heavier or darker when selected), plus only the approved focus ring for keyboard focus |
| Large empty hero sections inside the app | Pushes the action below the fold on phones | Start with the action |
| Decorative animation that delays interaction | Slows practice, ignores reduced motion | Short, functional motion only |
| Default shadcn/ui appearance | Recognizably generic | Restyle primitives through tokens, and keep their accessibility |
| Raw browser or generic form styling (thick gray borders, inset-looking inputs, a default radio or checkbox inside another bordered answer card) | Looks unfinished, like a form instead of a product | Controls restyled through tokens: one clean boundary, a soft radius, native semantics underneath |
| Two or more equally loud buttons | No primary action | One primary, others secondary/tertiary |
| Onboarding carousels / coach marks to explain the UI | A symptom of unclear design | Redesign the interaction (see UX rule 7) |
| Truncated or shrunk labels, or understandable labels swapped for ambiguous icons, to make a layout fit ("Prog…", "Узнать бол…") | Layout sized for English only | Wrapping/adaptive layouts with content-driven height, tested with the longest language |
| Showing every feature to new users | Overwhelming | Progressive disclosure |
| Confetti/score theatrics on AI estimates | Implies false certainty | Calm presentation of an estimated range |
| Unexplained visual novelty (a color, component look, or layout idea that no document or reference supports) | Fragments the visual language and looks accidental | Reuse existing patterns. A new one needs owner approval (the `product-design` skill). |

## Review question

For any screen, ask: *"Could this have come from a generic template generator?"* If yes, it is not done.
