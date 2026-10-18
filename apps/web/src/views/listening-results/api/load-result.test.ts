import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import {
  type ListeningEvent,
  type ListeningTest,
  apply,
  deviceHistory,
  startSession,
} from "@/entities/listening";
import {
  fixtureListeningKey as key,
  fixtureListeningTest,
  fixtureListeningTranscript as transcript,
} from "@/entities/listening/testing";
import { loadResult } from "./load-result";

// The results loader against a fake IndexedDB (as Reading's). Each case uses
// its own test id, so first-try markers and attempts never meet.

const T0 = Date.UTC(2026, 9, 18, 9, 0);
const id = (n: number) =>
  `s-00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

let n = 0;
function freshTest(): ListeningTest {
  n += 1;
  return { ...fixtureListeningTest, id: `listening-loader-${n}` };
}

function finished(test: ListeningTest, k: number, events: ListeningEvent[]) {
  let session = startSession(test, "practice", T0 + k, id(k));
  for (const event of [...events, { type: "finish" } as const])
    session = apply(session, test, event, T0 + k + 1);
  return session;
}

afterEach(() => localStorage.clear());

describe("loadResult (Listening)", () => {
  it("finds nothing on a device without attempts", async () => {
    expect(await loadResult(freshTest(), key, transcript, null)).toEqual({
      kind: "none",
    });
  });

  it("checks the latest attempt once and keeps its record for the current pair", async () => {
    const test = freshTest();
    const history = await deviceHistory();
    await history.commit(
      test,
      finished(test, 1, [{ type: "answer", number: 1, answer: "here" }]),
      T0 + 5,
    );
    const loaded = await loadResult(test, key, transcript, null);
    expect(loaded).toMatchObject({
      kind: "result",
      saved: true,
      record: { keyRevision: 1, rulesVersion: 1, score: { marks: 1 } },
    });
    await loadResult(test, key, transcript, id(1));
    const [attempt] = (await history.read(test)).attempts;
    expect(await history.results(test, attempt!)).toHaveLength(1);
  });

  it("imports M8's finished session and shows it as checked later", async () => {
    const test = freshTest();
    localStorage.setItem(
      `listening:${test.id}:finished`,
      JSON.stringify({ schema: 1, session: finished(test, 2, []) }),
    );
    const loaded = await loadResult(test, key, transcript, null);
    expect(loaded).toMatchObject({
      kind: "result",
      attempt: { id: id(2), importedFromM8: true },
    });
    expect(localStorage.getItem(`listening:${test.id}:finished`)).toBeNull();
  });

  it("shows only the stored score of an attempt from an earlier content version", async () => {
    const test = freshTest();
    const history = await deviceHistory();
    await history.commit(test, finished(test, 3, []), T0 + 5);
    const changed = { ...test, version: 2 };
    expect(await loadResult(changed, key, transcript, null)).toMatchObject({
      kind: "earlierVersion",
      attempt: { id: id(3), testVersion: 1 },
    });
  });
});
