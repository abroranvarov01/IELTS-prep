import "fake-indexeddb/auto";
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import ru from "../../../../messages/ru.json";
import {
  type ReadingTest,
  apply,
  deviceHistory,
  recordResult,
  startSession,
} from "@/entities/reading";
import {
  demoKey,
  demoTest as test,
  testSessionId,
} from "@/entities/reading/testing";
import { ResultsScreen } from "./ResultsScreen";

// The results page reads its attempt from the address and the device: here a
// fake IndexedDB (as in reading-history.test.ts) and jsdom's localStorage.
let address = "";
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useSearchParams: () => new URLSearchParams(address),
}));

afterEach(cleanup);

const T0 = Date.UTC(2026, 9, 11, 9, 0);

/** Commits attempt `n` (question 1 answered TRUE, which is correct) and opens its address. */
async function committedAttempt(n: number) {
  const session = apply(
    apply(
      startSession(test, "practice", T0, testSessionId(n)),
      test,
      { type: "answer", number: 1, answer: "TRUE" },
      T0,
    ),
    test,
    { type: "finish" },
    T0 + 60_000,
  );
  const history = await deviceHistory();
  const attempt = await history.commit(test, session, T0 + 61_000);
  if (!attempt) throw new Error("not committed");
  address = `attempt=${attempt.id}`;
  return { history, attempt };
}

function renderResults(shown: ReadingTest) {
  render(
    <NextIntlClientProvider locale="ru" messages={ru}>
      <ResultsScreen test={shown} answerKey={demoKey} />
    </NextIntlClientProvider>,
  );
}

describe("ResultsScreen", () => {
  it("shows only the heading while loading, then the score, the counts and the review the button names", async () => {
    const { attempt } = await committedAttempt(1);
    renderResults(test);

    expect(
      screen.getByRole("heading", { level: 1, name: ru.reading.results.title }),
    ).toBeTruthy();
    expect(screen.queryByText(/Верно:/)).toBeNull();

    expect(await screen.findByText("Верно: 1 из 40")).toBeTruthy();
    expect(screen.getByText(ru.reading.results.honest)).toBeTruthy();
    expect(screen.getByText("Неверно: 0")).toBeTruthy();
    expect(screen.getByText("Без ответа: 39")).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: ru.reading.results.reviewUnanswered })
        .getAttribute("href"),
    ).toBe(`/ru/reading/${test.id}/review?attempt=${attempt.id}&set=mistakes`);
  });

  it("keeps the last score of an attempt on an earlier version of the test, without a review", async () => {
    const { history, attempt } = await committedAttempt(2);
    await recordResult(history, test, demoKey, attempt, T0 + 62_000);
    renderResults({ ...test, version: test.version + 1 });

    expect(await screen.findByText(ru.reading.results.oldVersion)).toBeTruthy();
    expect(screen.getByText("Верно: 1 из 40")).toBeTruthy();
    expect(screen.queryByText(ru.reading.results.honest)).toBeNull();
    expect(
      screen
        .getByRole("link", { name: ru.reading.results.none.start })
        .getAttribute("href"),
    ).toBe(`/ru/reading/${test.id}`);
  });

  it("says an attempt on an earlier version of the test without a result can't be checked", async () => {
    await committedAttempt(3);
    renderResults({ ...test, version: test.version + 1 });

    expect(
      await screen.findByText(ru.reading.results.cannotCheck),
    ).toBeTruthy();
    expect(screen.queryByText(/Верно:/)).toBeNull();
  });
});
