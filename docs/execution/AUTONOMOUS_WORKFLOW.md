# Autonomous Workflow

Canonical owner of **how an autonomous worker executes tasks** from [TASKS.json](TASKS.json). Start a run with the `work-next-task` skill.

**One worker, one task at a time.** Do not run several worker sessions in parallel. The `in_progress` status acts as the lock.

## Hard limits (never)

- **Never `git push`**, add remotes, or change remote configuration. `.claude/settings.json` also denies push.
- **Never deploy** or run any command that publishes, releases, or provisions anything outside this machine.
- **Never create, read, or modify secrets**: real `.env` files, credentials, tokens, keys. `.env.example` with placeholder values is allowed when a task needs it.
- **Never work on more than one task at a time**, and never do work that belongs to another task.
- **Never rewrite history**: no amend of earlier commits, no rebase, no reset of committed work, no force operations.
- **Never bypass gates**: no `--no-verify`, no disabling or weakening lint rules, type checks, or tests to make them pass, no skipped tests.
- **Never mark a task `done`** while any of its validation commands fail or any acceptance criterion is unverified.

## The loop

### 0. Preconditions (check every time)
1. `git status --porcelain` is empty, **or** the only changes are ones the next task explicitly expects (e.g. F-01 commits pre-existing untracked governance). Otherwise **stop**: uncommitted work may belong to the owner.
2. No task is `in_progress`. If one is, a previous run was interrupted. Inspect its diff against the task scope. Resume only if the state is clearly understood. Otherwise **stop**.
3. Runtime matches ADR-0001 (`node --version` → v24.x) once F-00 is done.
4. Exactly one milestone in `TASKS.json` has `status: "active"`. If none does, the owner has not approved the next milestone: report and **stop**. If more than one does, **stop**.

### 1. Select
Take the **first** task in `TASKS.json` order whose `milestone` is the active milestone, where `owner` is `"worker"`, `status` is `"todo"`, and every `dependsOn` task is `"done"`. Never take a task from a `planned` milestone.
- If none is ready and all tasks of the active milestone are `done`: the milestone is complete. Set its `status` to `"done"` and add `"completedAt"`, append a PROGRESS.md entry, commit both, report, and stop. **Never activate the next milestone.** The owner does that, after its tasks are written.
- If none is ready otherwise: report which tasks wait on what (human tasks, blocked tasks) and stop.

### 2. Claim
Set the task's `status` to `"in_progress"`. Do not commit the claim on its own.

### 3. Understand
Read the whole task entry and every file in `references`. Read the ADRs relevant to it. Restate the goal and acceptance criteria to yourself. If they are ambiguous or conflict with governance, **stop** (see Stop conditions).

### 4. Implement
Follow the `implement-feature` skill, plus `ui-implementation` / `testing` where relevant. Stay strictly inside `scope`. Treat `outOfScope` as forbidden.
- Dependencies named in the task or in ADR-0001 are pre-approved. A small, non-pattern-setting dev dependency is allowed if you record its reason in PROGRESS.md. Anything that sets a project-wide pattern means **stop**.
- Use current stable versions. Check official documentation for version-specific setup. Do not rely on memory.

### 5. Validate
Run every command in the task's `validation` list, plus every gate that already exists in [QUALITY_GATES.md](../engineering/QUALITY_GATES.md) (lint, typecheck, tests). All must pass.
- If a gate does not exist yet, record "not available yet" instead of claiming it passed.
- To fix a failure, apply the `fix-bug` skill within the task's scope. See the failure budget below.

### 6. Review the diff
Run `git diff` (and `git status` for new files). Apply the `review-change` skill and the self-review in `.claude/rules/01-change-discipline.md`. Check [DEFINITION_OF_DONE.md](../engineering/DEFINITION_OF_DONE.md). Fix what you find, then re-run step 5.

### 7. Record
- Update the docs listed in the task's `docsToUpdate`. Update other docs only if the change made them inaccurate.
- In `TASKS.json`, set `status: "done"` and add `"completedAt": "YYYY-MM-DD"`.
- Append an entry to [PROGRESS.md](PROGRESS.md) in its format.

### 8. Commit locally
- Stage only the files belonging to this task (review `git status` first. Do not stage unexpected files).
- One commit per task. The commit includes the code, the docs, the TASKS.json update, and the PROGRESS.md entry:
  ```
  F-03: Prettier and base ESLint at the root

  <2–5 lines: what changed and how it was verified>

  Task: F-03
  ```
  Append any attribution trailer the session requires.
- Afterwards, `git status --porcelain` must be empty.

### 9. Continue
Return to step 0 for the next task. Stop when the active milestone is complete or a stop condition occurs.

## Stop conditions (ask for human approval)

Stop **immediately** and report when any of the following happens:

| Trigger | Examples |
|---|---|
| **Architecture or product decision needed** | Anything marked TBD in `docs/`; deviating from or extending an ADR; a pattern-setting dependency; product name, copy, or design choices not specified |
| **Ambiguous requirements** | Acceptance criteria unclear or contradictory; task conflicts with governance; scope cannot be met without touching `outOfScope` |
| **Secrets or credentials required** | API keys, accounts, paid services, signing keys, real `.env` values |
| **Repeated failures** | The same gate still fails after **3** distinct fix attempts; an environment or tool failure (network, install, browser deps) happens **twice**; **2** tasks in a row end blocked |
| **Environment changes outside the repo** | Installing OS packages, changing system Node, editing global config |
| **Destructive or irreversible action needed** | Deleting files not created by the current task (other than template boilerplate the task says to remove), history rewrites |
| **Precondition failure** | Dirty tree not explained by the task, unexpected `in_progress` task, wrong runtime |

**How to stop:**
1. Do **not** commit failing or partial work. Leave the changes in the working tree for the owner to see.
2. Set the task's `status` to `"blocked"` with a `"blockedReason"` (one or two sentences).
3. Add the question to "Open questions for the owner" in PROGRESS.md. State what you need, the options you see, and your recommendation.
4. Report in the session: task, reason, question, and current working-tree state.

The owner resolves the issue and sets the task back to `"todo"` (or adjusts it). The next run then continues.
