# Change discipline (global)

Keep every change surgical. A reviewer should be able to explain each line of the diff from the task itself.

## Do not
- refactor, rename, move, or reformat code that the task does not require
- rewrite nearby code for style or taste
- redesign APIs that are not part of the task
- remove comments you do not understand (find out why they exist first)
- update dependencies, configs, or lockfiles unless the task requires it
- "fix" adjacent issues in the same change

## When you notice an unrelated problem
Mention it in your summary as a follow-up. Do not fix it. If it blocks the task, say so and ask.

## Clean up after yourself
Before finishing, remove anything **your change** made unnecessary: unused imports, helpers, branches, flags, compatibility shims, debug output, commented-out code, and TODOs you created. Do not leave two code paths where one is enough.

## Review your own diff
Read the complete diff before reporting completion. For each hunk, ask:
1. Does the task require it?
2. Is there a simpler way?
3. Did I introduce an abstraction, parameter, or file that has only one use and no domain meaning?

If any answer is wrong, fix it before reporting.
