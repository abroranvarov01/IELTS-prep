---
paths:
  - "**/*scor*"
  - "**/*band*"
  - "**/scoring/**"
  - "**/feedback/**"
  - "**/assessment/**"
---

# IELTS scoring and feedback code

The product rule is owned by docs/product/PRODUCT.md § Honest feedback. This file owns the code-level consequences. The globs are name-based until feature directories exist. Narrow them when the module structure is decided.

- **One canonical implementation** of band logic: raw score → band conversion, overall-band averaging and rounding (INVARIANTS I-2). Search for it before writing any band math. Never duplicate it in UI, API, or SQL.
- **Source every IELTS rule.** Conversion tables and rounding rules come from official IELTS guidance. Cite the source in a comment and test against it. Never invent or "approximate" a conversion table. If the source is missing, stop and ask.
- **Academic and General Training Reading use different conversions.** Do not assume one table fits both. Which modules we support at launch is TBD (PRODUCT.md § Open questions).
- **Bands are values in half-band steps from 0 to 9.** Represent them so that invalid values (e.g. 6.3) cannot be produced, and validate at boundaries.
- **Keep estimates distinguishable from computed results in the types.** An AI-estimated band must not be assignable where a deterministic practice score is expected, and the presentation must carry the "estimated" label. Prefer ranges when certainty is low.
- **Explanation and certainty are separate fields.** Never derive or display confidence from the length or detail of an explanation.
- **Answer checking** (spelling, word limits, accepted variants) is domain logic with tests for every rule and its edge cases.
