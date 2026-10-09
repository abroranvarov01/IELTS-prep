# UI Anti-Patterns

Canonical owner of the **list of forbidden visual and interaction patterns**. They are the usual ways AI-generated and template UIs degrade. If a design or implementation contains one, change it.

| Anti-pattern | Why it fails here | Do instead |
|---|---|---|
| Generic AI-SaaS look (hero gradients, sparkles, floating blobs) | Feels templated and untrustworthy. It is not an education product. | White surfaces, bold type, red accent used with intent |
| Random purple/blue gradients | Off-brand noise | Flat brand and skill colors from tokens |
| Excessive glassmorphism / blur | Low contrast and slow on mid-range phones | Solid surfaces |
| Every element wrapped in a rounded card | Flattens hierarchy and wastes phone width | Use spacing, headings, and dividers. Card only when something is a distinct, tappable unit. |
| Dashboard overload (many tiles, many numbers) | Breaks the 10-second rule | One clear next action, then a small amount of progress context |
| Decorative charts that answer no question | Looks analytical, means nothing | A chart only when it answers a question the user actually has. Otherwise a sentence. |
| Low-contrast gray on gray | Unreadable outdoors, fails accessibility | Neutral tokens with verified contrast |
| Icon-only actions with unclear meaning | Users must guess, and translations cannot help | Icon + label. Icon-only only for universal actions (close, back, play), and even then with an accessible name. |
| Heavy or many shadows | Visual noise, dated look | At most the two elevation levels in the design system |
| Large empty hero sections inside the app | Pushes the action below the fold on phones | Start with the action |
| Decorative animation that delays interaction | Slows practice, ignores reduced motion | Short, functional motion only |
| Default shadcn/ui appearance | Recognizably generic | Restyle primitives through tokens |
| Two or more equally loud buttons | No primary action | One primary, others secondary/tertiary |
| Onboarding carousels / coach marks to explain the UI | A symptom of unclear design | Redesign the interaction (see UX rule 7) |
| Truncated labels ("Prog…", "Узнать бол…") | Layout sized for English only | Wrapping/adaptive layouts tested with the longest language |
| Showing every feature to new users | Overwhelming | Progressive disclosure |
| Confetti/score theatrics on AI estimates | Implies false certainty | Calm presentation of an estimated range |

## Review question

For any screen, ask: *"Could this have come from a generic template generator?"* If yes, it is not done.
