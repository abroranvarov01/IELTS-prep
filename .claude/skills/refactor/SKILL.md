---
name: refactor
description: Procedure for behavior-preserving restructuring of existing code. Use only when refactoring is the explicit task, or is required to make a requested change feasible and has been agreed.
---

# Refactor

1. **State the reason.** Name the concrete current problem: the change that is hard to make, the duplicated knowledge, the misleading structure. "Cleaner" or "more modern" is not a reason (`docs/engineering/CODE_QUALITY.md` § Refactoring discipline).
2. **Define the target** in one or two sentences, and check it against existing patterns and ADRs. A refactor that introduces a new project-wide pattern needs an ADR proposal first (`architecture-decision` skill).
3. **Secure the behavior.** Make sure tests cover the behavior you are about to restructure. Add characterization tests first if they do not.
4. **Change the structure in small steps,** keeping the tests green after each step. Do not change behavior. If you find a bug, note it and fix it separately (`fix-bug`), unless the user agrees to combine the two.
5. **Avoid moving complexity around.** Check that the result has fewer concepts, layers, or files than before, not just smaller files.
6. **Delete what is replaced:** old paths, shims, unused exports. Do not leave both versions in place.
7. **Validate** with the relevant gates and confirm that public behavior is unchanged.
8. **Summarize:** reason, what moved, how behavior preservation was verified.
