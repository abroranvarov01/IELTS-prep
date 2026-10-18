import {
  LEVEL_RULES_VERSION,
  type LevelCheckAttempt,
  type LevelCheckHistory,
  type LevelCheckResultRecord,
  deviceLevelCheckHistory,
  latestAttempt,
  levelCheckResult,
} from "@/entities/level-check";
import {
  type AnswerKey,
  type ReadingTest,
  SCORING_RULES_VERSION,
  checkAttempt,
  deviceStorage,
  loadSessions,
} from "@/entities/reading";
import { scoredPositions } from "../model/scored-positions";

/** The result the page shows (USER_FLOWS.md, Level check flows: the result and its states). */
export type LoadedResult =
  | { kind: "none" }
  | {
      kind: "result";
      attempt: LevelCheckAttempt;
      record: LevelCheckResultRecord;
      /** False when the result lives only in this tab (ADR-0011 §6). */
      saved: boolean;
    }
  | {
      kind: "earlierForm";
      attempt: LevelCheckAttempt;
      record: LevelCheckResultRecord | undefined;
    };

/**
 * Finds the attempt (the one asked for, or the latest at the current form)
 * and makes sure it has a result record for the current key revision,
 * checking-rules and level-rules versions (ADR-0011 §3). A finished section
 * whose commit failed is checked for this tab from its localStorage copy.
 */
export async function loadLevelCheckResult(
  form: ReadingTest,
  key: AnswerKey,
  attemptId: string | null,
): Promise<LoadedResult> {
  const history = await deviceLevelCheckHistory();
  const now = Date.now();
  const attempts = await history.read("reading").catch(() => []);
  const left = loadSessions(deviceStorage(), form).current;
  const uncommitted: LevelCheckAttempt | undefined =
    left?.status === "finished" &&
    left.finishedAt !== undefined &&
    !attempts.some((a) => a.id === left.sessionId)
      ? {
          id: left.sessionId,
          skill: "reading",
          formId: form.id,
          formVersion: form.version,
          startedAt: left.startedAt,
          finishedAt: left.finishedAt,
          answers: left.answers,
          timeTakenMs: Math.max(0, left.finishedAt - left.startedAt),
          committedAt: now,
        }
      : undefined;
  const all = uncommitted ? [...attempts, uncommitted] : attempts;
  const attempt = attemptId
    ? all.find((a) => a.id === attemptId)
    : (latestAttempt(all, form) ?? uncommitted);
  if (!attempt) return { kind: "none" };

  const committed = attempt !== uncommitted;
  if (attempt.formId !== form.id || attempt.formVersion !== form.version) {
    const records = committed
      ? await history.results(attempt).catch(() => [])
      : [];
    return { kind: "earlierForm", attempt, record: records.at(-1) };
  }

  const versions = {
    keyRevision: key.revision,
    rulesVersion: SCORING_RULES_VERSION,
    levelRulesVersion: LEVEL_RULES_VERSION,
  };
  const stored = committed
    ? await currentRecord(history, attempt, versions).catch(() => undefined)
    : undefined;
  if (stored)
    return {
      kind: "result",
      attempt,
      record: stored,
      saved: history.persistent,
    };

  const check = checkAttempt(form, key, {
    answers: attempt.answers,
    pins: {},
    finishReason: "user",
  });
  const result = levelCheckResult(scoredPositions(form, check.outcomes));
  const record: LevelCheckResultRecord = {
    attemptId: attempt.id,
    ...versions,
    checkedAt: now,
    outcomes: check.outcomes,
    score: result.score,
    total: result.total,
    answered: result.answered,
    level: result.level,
    practiseFirst: result.practiseFirst,
  };
  if (!committed) return { kind: "result", attempt, record, saved: false };
  const added = await history.addResult(attempt, record).catch(() => undefined);
  return {
    kind: "result",
    attempt,
    record: added ?? record,
    saved: Boolean(added) && history.persistent,
  };
}

async function currentRecord(
  history: LevelCheckHistory,
  attempt: LevelCheckAttempt,
  versions: Pick<
    LevelCheckResultRecord,
    "keyRevision" | "rulesVersion" | "levelRulesVersion"
  >,
): Promise<LevelCheckResultRecord | undefined> {
  return (await history.results(attempt)).find(
    (r) =>
      r.keyRevision === versions.keyRevision &&
      r.rulesVersion === versions.rulesVersion &&
      r.levelRulesVersion === versions.levelRulesVersion,
  );
}
