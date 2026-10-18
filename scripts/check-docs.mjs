// Docs check (`pnpm check:docs`, also part of `pnpm check`): the checks a
// documentation-only change needs (docs/engineering/DEFINITION_OF_DONE.md
// § Validation by risk). It checks the task queue's shape
// (docs/execution/AUTONOMOUS_WORKFLOW.md) and that relative links in tracked
// Markdown files point to files that exist.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const problems = [];

// The task queue.
const QUEUE = "docs/execution/TASKS.json";
const queue = JSON.parse(readFileSync(QUEUE, "utf8"));
const TASK_FIELDS = [
  "id",
  "title",
  "milestone",
  "owner",
  "status",
  "dependsOn",
  "goal",
  "scope",
  "outOfScope",
  "acceptanceCriteria",
  "validation",
  "references",
];
const LISTS = [
  "dependsOn",
  "scope",
  "outOfScope",
  "acceptanceCriteria",
  "validation",
  "references",
];
const milestones = new Map(queue.milestones.map((m) => [m.id, m]));
if (milestones.size !== queue.milestones.length)
  problems.push(`${QUEUE}: duplicate milestone ids`);
for (const m of queue.milestones) {
  if (!queue.milestoneStatusValues.includes(m.status))
    problems.push(`${QUEUE}: ${m.id} has status "${m.status}"`);
  if (m.status === "done" && !m.completedAt)
    problems.push(`${QUEUE}: ${m.id} is done without completedAt`);
}
if (queue.milestones.filter((m) => m.status === "active").length > 1)
  problems.push(`${QUEUE}: more than one milestone is active`);

const ids = new Set();
for (const task of queue.tasks) {
  const name = task.id ?? JSON.stringify(task.title);
  for (const field of TASK_FIELDS)
    if (!(field in task)) problems.push(`${QUEUE}: ${name} has no ${field}`);
  for (const field of LISTS)
    if (field in task && !Array.isArray(task[field]))
      problems.push(`${QUEUE}: ${name}.${field} is not a list`);
  if (ids.has(task.id)) problems.push(`${QUEUE}: ${name} is listed twice`);
  ids.add(task.id);
  if (!milestones.has(task.milestone))
    problems.push(`${QUEUE}: ${name} names milestone "${task.milestone}"`);
  if (!queue.statusValues.includes(task.status))
    problems.push(`${QUEUE}: ${name} has status "${task.status}"`);
  if (!["worker", "human"].includes(task.owner))
    problems.push(`${QUEUE}: ${name} has owner "${task.owner}"`);
  if (task.status === "done" && !task.completedAt)
    problems.push(`${QUEUE}: ${name} is done without completedAt`);
  if (task.status === "blocked" && !task.blockedReason)
    problems.push(`${QUEUE}: ${name} is blocked without blockedReason`);
}
for (const task of queue.tasks)
  for (const dependency of task.dependsOn ?? [])
    if (!ids.has(dependency))
      problems.push(`${QUEUE}: ${task.id} depends on unknown "${dependency}"`);

// Relative links in Markdown. Web links and same-page anchors are not checked;
// a link's #anchor is dropped and only its file is.
const LINK = /\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const markdown = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "*.md"],
  { encoding: "utf8" },
)
  .split("\n")
  .filter(Boolean);
for (const file of markdown) {
  // Code blocks and inline code show link syntax without being links.
  const text = readFileSync(file, "utf8")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]*`/g, "");
  for (const [, target] of text.matchAll(LINK)) {
    if (/^[a-z][a-z+.-]*:/i.test(target) || target.startsWith("#")) continue;
    const path = decodeURI(target.split("#")[0]);
    if (!existsSync(join(dirname(file), path)))
      problems.push(`${file}: broken link to ${target}`);
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
