---
name: fix-bug
description: Debugging procedure for fixing a defect. Use when something behaves incorrectly, a test fails unexpectedly, or a user reports a bug.
---

# Fix a bug

1. **Pin down the symptom.** Write down expected vs. actual behavior, with the exact input, environment, viewport, and language where relevant.
2. **Reproduce it.** Find the smallest reliable reproduction. If you cannot reproduce it, do not guess at a fix. Report what you tried and what information is missing.
3. **Capture the bug** as required by `docs/engineering/TESTING_STRATEGY.md` § Bug-fix verification. Usually that means a failing regression test at the lowest level where the bug shows (mandatory for domain logic). For visual, environment, browser, or tooling bugs where a test would be disproportionate or unreliable, record a reliable reproduction instead and state why no test was written.
4. **Find the root cause.** Trace from the symptom to the origin. Form a hypothesis, then check it with evidence (read the code path, add temporary logging, inspect the data). Do not stop at the first place where the symptom can be suppressed.
5. **Check the blast radius.** Search for the same faulty pattern or the same duplicated logic elsewhere. If the bug comes from duplicated knowledge (e.g. band math in two places), the fix is to converge on the single source. Mention the duplication even if consolidating it is out of scope.
6. **Fix the cause minimally.** No unrelated refactors (`.claude/rules/01-change-discipline.md`). Do not mask the cause with defensive checks, retries, or swallowed errors.
7. **Verify.** The new test passes (or the recorded reproduction no longer reproduces the bug), the related tests pass, and the relevant gates from `docs/engineering/QUALITY_GATES.md` pass. Re-run the original reproduction.
8. **Clean up.** Remove temporary logging and debugging code.
9. **Summarize:** root cause in one sentence, the fix, how it was verified, and any similar risks found elsewhere.
