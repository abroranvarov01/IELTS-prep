import {
  LEVEL_RULES_VERSION,
  type LevelCheckAttempt,
  type LevelCheckHistory,
  type LevelCheckResultRecord,
  type ScoredPosition,
  type Skill,
  deviceLevelCheckHistory,
  latestAttempt,
  levelCheckResult,
} from "@/entities/level-check";
import {
  LISTENING_SCORING_RULES_VERSION,
  type ListeningKey,
  type ListeningTest,
  type Transcript,
  checkAttempt as checkListening,
  loadSessions as loadListeningSessions,
} from "@/entities/listening";
import {
  type AnswerKey,
  type ReadingTest,
  SCORING_RULES_VERSION,
  checkAttempt,
  deviceStorage,
  loadSessions,
} from "@/entities/reading";
import {
  listeningScoredPositions,
  scoredPositions,
} from "../model/scored-positions";

/** The result the page shows for one section (USER_FLOWS.md, Level check flows: the result and its states). */
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

/** A finished section left in localStorage, as the attempt it becomes. */
type Left = Omit<LevelCheckAttempt, "committedAt"> | undefined;

/**
 * Finds the Reading section's attempt (the one asked for, or the latest at
 * the current form) and makes sure it has a result record for the current
 * key revision, checking-rules and level-rules versions (ADR-0011 §3). A
 * finished section whose commit failed is checked for this tab from its
 * localStorage copy.
 */
export function loadLevelCheckResult(
  form: ReadingTest,
  key: AnswerKey,
  attemptId: string | null,
): Promise<LoadedResult> {
  const left = loadSessions(deviceStorage(), form).current;
  return loadSection({
    skill: "reading",
    form,
    attemptId,
    left:
      left?.status === "finished" && left.finishedAt !== undefined
        ? {
            id: left.sessionId,
            skill: "reading",
            formId: form.id,
            formVersion: form.version,
            startedAt: left.startedAt,
            finishedAt: left.finishedAt,
            answers: left.answers,
            timeTakenMs: Math.max(0, left.finishedAt - left.startedAt),
          }
        : undefined,
    versions: {
      keyRevision: key.revision,
      rulesVersion: SCORING_RULES_VERSION,
    },
    positions: (attempt) =>
      scoredPositions(
        form,
        checkAttempt(form, key, {
          answers: attempt.answers,
          pins: {},
          finishReason: "user",
        }).outcomes,
      ),
  });
}

/**
 * The same for the Listening section (ADR-0014 §7): checked with the
 * Listening checking rules, its key and the transcript the key pins.
 */
export function loadListeningCheckResult(
  form: ListeningTest,
  key: ListeningKey,
  transcript: Transcript,
  attemptId: string | null,
): Promise<LoadedResult> {
  const left = loadListeningSessions(deviceStorage(), form).finished;
  return loadSection({
    skill: "listening",
    form,
    attemptId,
    left:
      left?.check && left.finishedAt !== undefined
        ? {
            id: left.sessionId,
            skill: "listening",
            formId: form.id,
            formVersion: form.version,
            startedAt: left.startedAt,
            finishedAt: left.finishedAt,
            answers: left.answers,
            pauses: left.check.pauses,
            interruptions: left.check.interruptions,
            timeTakenMs: Math.max(0, left.finishedAt - left.startedAt),
          }
        : undefined,
    versions: {
      keyRevision: key.revision,
      rulesVersion: LISTENING_SCORING_RULES_VERSION,
    },
    positions: (attempt) =>
      listeningScoredPositions(
        form,
        checkListening(form, key, transcript, {
          answers: attempt.answers,
          mode: "practice",
          finishReason: "user",
        }).outcomes,
      ),
  });
}

async function loadSection({
  skill,
  form,
  attemptId,
  left,
  versions,
  positions,
}: {
  skill: Skill;
  form: { id: string; version: number };
  attemptId: string | null;
  left: Left;
  versions: Pick<LevelCheckResultRecord, "keyRevision" | "rulesVersion">;
  positions: (attempt: LevelCheckAttempt) => ScoredPosition[];
}): Promise<LoadedResult> {
  const history = await deviceLevelCheckHistory();
  const now = Date.now();
  const attempts = await history.read(skill).catch(() => []);
  const uncommitted: LevelCheckAttempt | undefined =
    left && !attempts.some((a) => a.id === left.id)
      ? { ...left, committedAt: now }
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

  const triple = { ...versions, levelRulesVersion: LEVEL_RULES_VERSION };
  const stored = committed
    ? await currentRecord(history, attempt, triple).catch(() => undefined)
    : undefined;
  if (stored)
    return {
      kind: "result",
      attempt,
      record: stored,
      saved: history.persistent,
    };

  const scored = positions(attempt);
  const result = levelCheckResult(scored);
  const record: LevelCheckResultRecord = {
    attemptId: attempt.id,
    ...triple,
    checkedAt: now,
    outcomes: Object.fromEntries(scored.map((p) => [p.number, p.outcome])),
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
