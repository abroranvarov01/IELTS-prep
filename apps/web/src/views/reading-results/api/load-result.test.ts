import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import {
  type ReadingEvent,
  type ReadingTest,
  SCORING_RULES_VERSION,
  apply,
  checkAttempt,
  deviceHistory,
  startSession,
} from "@/entities/reading";
import {
  demoKey as key,
  demoTest,
  testSessionId,
} from "@/entities/reading/testing";
import { loadResult } from "./load-result";

// The results loader against a fake IndexedDB (as in history.test.ts). Each
// case uses its own test id, so first-try markers never meet.

const T0 = Date.UTC(2026, 9, 17, 9, 0);
const ngFalse: ReadingEvent[] = [
  { type: "answer", number: 2, answer: "NOT GIVEN" },
  { type: "answer", number: 4, answer: "NOT GIVEN" },
  { type: "answer", number: 28, answer: "NOT GIVEN" },
];

let n = 0;
function freshTest(): ReadingTest {
  n += 1;
  return { ...demoTest, id: `loader-${n}` };
}

/** Commits a finished session of `test` built from `events`. */
async function commit(
  test: ReadingTest,
  id: number,
  events: ReadingEvent[],
  retry?: { of: string; questions: number[] },
) {
  let session = startSession(
    test,
    "practice",
    T0 + id,
    testSessionId(id),
    retry,
  );
  for (const event of [...events, { type: "finish" } as const])
    session = apply(session, test, event, T0 + id + 1);
  const history = await deviceHistory();
  const attempt = await history.commit(test, session, T0 + id + 2);
  if (!attempt) throw new Error("not committed");
  return { history, attempt };
}

describe("loadResult: repeated mistakes", () => {
  it("come from the first try, also on a later attempt's results", async () => {
    const test = freshTest();
    const { attempt: first } = await commit(test, 1, ngFalse);
    const { attempt: later } = await commit(test, 2, []);

    const loaded = await loadResult(test, key, later.id);
    expect(loaded).toMatchObject({
      kind: "result",
      patterns: {
        kind: "patterns",
        scope: "firstTry",
        firstTryId: first.id,
        patterns: [{ category: "ngFalse" }],
      },
    });
  });

  it("check the first try again when its record predates the current key revision", async () => {
    const test = freshTest();
    const { history, attempt: first } = await commit(test, 3, ngFalse);
    await history.addResult(first, {
      attemptId: first.id,
      keyRevision: key.revision,
      rulesVersion: SCORING_RULES_VERSION,
      checkedAt: T0,
      ...checkAttempt(test, key, first),
    });
    const { attempt: later } = await commit(test, 4, []);

    // The key has been corrected since the first try was last checked.
    const corrected = { ...key, revision: key.revision + 1 };
    const loaded = await loadResult(test, corrected, later.id);
    expect(loaded).toMatchObject({
      patterns: { kind: "patterns", patterns: [{ category: "ngFalse" }] },
    });
    expect(
      (await history.results(first)).map((r) => r.keyRevision).sort(),
    ).toEqual([key.revision, corrected.revision]);
  });

  it("look for nothing when the first try is unknown (an imported M4 attempt)", async () => {
    const test = freshTest();
    const history = await deviceHistory();
    const m4 = apply(
      startSession(test, "exam", T0, "m4-finished-1"),
      test,
      { type: "finish" },
      T0 + 1,
    );
    await history.importM4Finished(test, m4, T0 + 2);
    const { attempt } = await commit(test, 5, ngFalse);

    expect(await loadResult(test, key, attempt.id)).toMatchObject({
      patterns: { kind: "unknownFirstTry" },
    });
  });

  it("never appear on a retry's results", async () => {
    const test = freshTest();
    const { attempt: first } = await commit(test, 6, ngFalse);
    const { attempt: retry } = await commit(test, 7, [], {
      of: first.id,
      questions: [2],
    });

    const loaded = await loadResult(test, key, retry.id);
    expect(loaded.kind).toBe("result");
    expect(loaded).not.toHaveProperty("patterns");
  });
});
