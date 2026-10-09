# Engineering core (global)

How to work in this repository. Code properties are defined in `docs/engineering/CODE_QUALITY.md`. Read it before writing code in an area you have not touched in this session.

## Priorities
Correctness → clarity → simplicity → consistency → maintainability → performance → cleverness. When two of these conflict, the earlier one wins.

## Build the smallest coherent solution
Implement what the current requirement needs, completely and correctly, and nothing more. Hypothetical future requirements are not requirements. For abstraction criteria, see CODE_QUALITY.md § Abstraction threshold.

## Do not silently assume
If an unresolved question would materially change architecture, data shape, user-visible behavior, or the honest-feedback rules:
- **stop and ask** if the choice is hard to reverse, or
- **choose the most conservative reversible option** if it is not, and state the assumption explicitly in your summary.

Do not invent product requirements, IELTS rules, or legal and data-handling policy. Items marked TBD in `docs/` stay TBD until a human decides them.

## Existing pattern first
Before creating a new component pattern, folder pattern, helper, utility, state approach, API wrapper, styling approach, or testing approach:
1. Search the repository for an existing one.
2. Check `docs/architecture/decisions/` for a relevant ADR.
3. Reuse or extend the existing approach. Introduce a new pattern only when the existing one cannot reasonably serve. Say why, and if the pattern will be project-wide, propose an ADR.

## Let tools enforce what tools can
Do not rely on memory or instructions for things that types, lint, formatting, tests, or CI can check. Run the real gates listed in `docs/engineering/QUALITY_GATES.md`. If a needed gate is missing, say so. Never claim a check passed if you did not run it.

## Report honestly
State what you verified, what you could not verify, and which assumptions you made. "Done" means `docs/engineering/DEFINITION_OF_DONE.md` is satisfied, in proportion to the change.
