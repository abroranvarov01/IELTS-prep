---
name: architecture-decision
description: Procedure for making and recording a significant technical decision (framework, library that sets a pattern, data model, hosting, boundaries). Use before introducing a project-wide pattern or reversing an existing decision.
---

# Make an architecture decision

1. **Check whether an ADR is warranted** against the criteria in `docs/architecture/decisions/README.md`. If it is not, make the choice in code, mention it in your summary, and stop here. At scaffolding, group the foundational choices into the single foundation ADR described there.
2. **Check what already exists.** Read the ADR index, `docs/architecture/ARCHITECTURE.md` (confirmed vs. proposed vs. TBD), and related invariants. If an accepted ADR covers this, you are either following it or explicitly superseding it.
3. **Frame the problem.** Write down the forces: product needs, users (phones, weak connections, uz/ru/en), legal constraints (data residency, minors), team size, cost. Separate facts from assumptions.
4. **Compare at least two credible options plus "defer / do the simplest thing".** For each, list the real pros and cons, the cost to reverse, and its effect on the project priority order. Check current documentation for libraries. Do not rely on memory for version-specific facts.
5. **Prefer the boring option** that meets the current requirements. Choose the more complex option only when a current, concrete requirement demands it.
6. **Ask the project owner** when the decision is hard to reverse, has cost or legal impact, or touches product scope. Present the comparison and a recommendation. Do not decide unilaterally.
7. **Write the ADR** with `docs/architecture/decisions/ADR-TEMPLATE.md`. Use the next number and status `Proposed`.
8. **Plan enforcement.** List which lint rule, test, or CI check will enforce the decision (`docs/engineering/QUALITY_GATES.md`).
9. **Update the index** in `decisions/README.md`. Once the ADR is accepted, move the item from TBD/proposed to confirmed in `ARCHITECTURE.md`.
