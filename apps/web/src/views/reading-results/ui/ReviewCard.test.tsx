import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import en from "../../../../messages/en.json";
import {
  type AnswerKey,
  type ReadingAttempt,
  type ResultRecord,
  SCORING_RULES_VERSION,
  checkAttempt,
  questionUnits,
  unitOf,
} from "@/entities/reading";
import { demoKey, demoTest as test } from "@/entities/reading/testing";
import { ReviewCard } from "./ReviewCard";
import { ReviewWorkspace } from "./ReviewWorkspace";

let address = "";
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useSearchParams: () => new URLSearchParams(address),
}));

afterEach(cleanup);

const units = questionUnits(test);
const review = en.reading.review;

function attempt(
  answers: ReadingAttempt["answers"],
  extra: Partial<ReadingAttempt> = {},
): ReadingAttempt {
  return {
    id: "s-00000000-0000-4000-8000-000000000001",
    testId: test.id,
    testVersion: test.version,
    kind: "test",
    mode: "practice",
    startedAt: 1,
    finishedAt: 2,
    finishReason: "user",
    answers,
    pins: {},
    committedAt: 3,
    ...extra,
  };
}

function recordOf(shown: ReadingAttempt, key: AnswerKey = demoKey) {
  return {
    attemptId: shown.id,
    keyRevision: key.revision,
    rulesVersion: SCORING_RULES_VERSION,
    checkedAt: 4,
    ...checkAttempt(test, key, shown),
  } satisfies ResultRecord;
}

const explanation = {
  explanation: [{ text: "Because the passage says " }, { en: "so" }],
  simpler: [{ text: "Simply so." }],
};

/** Renders the card of question `number` as the review shows it. */
function renderCard(
  number: number,
  shown: ReadingAttempt,
  key: AnswerKey = demoKey,
) {
  const unit = unitOf(units, number);
  if (!unit) throw new Error(`no question ${number}`);
  const record = recordOf(shown, key);
  const onShowSentence = vi.fn();
  const outcomes = unit.numbers.map((n) => record.outcomes[n]);
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ReviewCard
        test={test}
        unit={unit}
        outcome={
          outcomes.every((o) => o === "correct")
            ? "correct"
            : outcomes.every((o) => o === "unanswered")
              ? "unanswered"
              : outcomes.some((o) => o === "correct")
                ? "partlyCorrect"
                : "incorrect"
        }
        attempt={shown}
        entry={key.answers[unit.numbers[0] ?? 0]}
        signals={record.signals[unit.key] ?? []}
        explanation={explanation}
        onShowSentence={onShowSentence}
      />
    </NextIntlClientProvider>,
  );
  return { onShowSentence };
}

/** The read-only option rows, each with its label. */
const optionRow = (text: RegExp) =>
  screen.getAllByRole("listitem").find((li) => text.test(li.textContent ?? ""));

describe("ReviewCard", () => {
  it("choose one: labels the chosen option and the accepted one, and shows the evidence and why", () => {
    const { onShowSentence } = renderCard(2, attempt({ "2": "TRUE" }));
    expect(optionRow(/^TRUE/)?.textContent).toContain(
      review.yourAnswerIncorrect,
    );
    expect(optionRow(/^FALSE/)?.textContent).toContain(review.correctAnswer);
    expect(optionRow(/^NOT GIVEN/)?.textContent).toBe("NOT GIVEN");
    expect(
      screen.getByRole("heading", { name: review.evidenceTitle }),
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: review.why })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Show in passage" }));
    expect(onShowSentence).toHaveBeenCalledWith("p1-2-s3");
  });

  it("choose one: the test's text is English inside the localized card", () => {
    renderCard(1, attempt({ "1": "TRUE" }));
    const statement = screen.getByText(/children rode to school/i);
    expect(statement.closest("[lang]")?.getAttribute("lang")).toBe("en");
    expect(screen.getByText("so").getAttribute("lang")).toBe("en");
  });

  it("choose from a list: labels the options of the shared list", () => {
    renderCard(14, attempt({ "14": "iii" }));
    // The prompt names the paragraph; so does the evidence's quote.
    expect(screen.getAllByText("Paragraph A")).toHaveLength(2);
    expect(optionRow(/^iii/)?.textContent).toContain(
      review.yourAnswerIncorrect,
    );
    expect(optionRow(/^ii /)?.textContent).toContain(review.correctAnswer);
  });

  it("type words: shows the answer as typed, the accepted answer and the others accepted, with its notes", () => {
    renderCard(13, attempt({ "13": "winter wether" }));
    expect(screen.getByText("winter wether").getAttribute("lang")).toBe("en");
    expect(screen.getByText(review.correctAnswer)).toBeTruthy();
    expect(screen.getByText("winter weather")).toBeTruthy();
    expect(screen.getByText(review.alsoAccepted)).toBeTruthy();
    expect(screen.getByText("the winter weather")).toBeTruthy();
    expect(screen.getByText(en.reading.signals.oneLetterAway)).toBeTruthy();
  });

  it("an unanswered question says so, with the time-out note, never as not correct", () => {
    renderCard(9, attempt({}, { finishReason: "timeUp", mode: "exam" }));
    expect(screen.getByText(review.noAnswerGiven)).toBeTruthy();
    expect(screen.getByText(en.reading.signals.timeUp)).toBeTruthy();
    expect(screen.queryByText(review.yourAnswerIncorrect)).toBeNull();
    // Exam attempts have no pins, so no "Your evidence".
    expect(screen.queryByText(en.reading.evidence.title)).toBeNull();
  });

  it("choose several, one right and one wrong: each option labeled on its own", () => {
    renderCard(22, attempt({ "22": ["B", "A"] }));
    expect(optionRow(/^A /)?.textContent).toContain(review.yourAnswerCorrect);
    expect(optionRow(/^B /)?.textContent).toContain(review.yourAnswerIncorrect);
    expect(optionRow(/^C /)?.textContent).toContain(review.correctAnswer);
    expect(optionRow(/^D /)?.textContent).not.toContain("answer");
  });

  it("choose several, one chosen and correct: the other accepted option is the correct answer, never a positional letter", () => {
    renderCard(22, attempt({ "22": ["C"] }));
    expect(optionRow(/^C /)?.textContent).toContain(review.yourAnswerCorrect);
    expect(optionRow(/^A /)?.textContent).toContain(review.correctAnswer);
    expect(screen.queryByText(review.yourAnswerIncorrect)).toBeNull();
  });

  it("NOT GIVEN with related sentences: where the passage talks about it, never evidence", () => {
    renderCard(3, attempt({ "3": "FALSE" }, { pins: { "3": ["p1-2-s2"] } }));
    expect(
      screen.getByRole("heading", { name: review.relatedTitle }),
    ).toBeTruthy();
    expect(screen.queryByText(review.evidenceTitle)).toBeNull();
    expect(
      screen.getByText(/so no sentence in the passage confirms/),
    ).toBeTruthy();
    // The note keeps the facts wording of TRUE/FALSE/NOT GIVEN.
    expect(
      screen.getByText(/The passage gives no information on this/),
    ).toBeTruthy();
  });

  it("NOT GIVEN without related sentences: no evidence block at all", () => {
    const key: AnswerKey = {
      ...demoKey,
      answers: {
        ...demoKey.answers,
        3: { accept: ["NOT GIVEN"], evidence: [] },
      },
    };
    renderCard(3, attempt({ "3": "NOT GIVEN" }), key);
    expect(screen.queryByText(review.relatedTitle)).toBeNull();
    expect(screen.queryByText(review.evidenceTitle)).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Show in passage" }),
    ).toBeNull();
  });

  it("YES/NO/NOT GIVEN notes use the writer's views wording", () => {
    renderCard(30, attempt({ "30": "YES" }));
    expect(
      screen.getAllByText(/impossible to say what the writer thinks/).length,
    ).toBeGreaterThan(0);
  });

  it("compares pins with the key's cited sentences only", () => {
    renderCard(5, attempt({ "5": "A" }, { pins: { "5": ["p1-3-s2"] } }));
    expect(screen.getByText(review.pinMiss)).toBeTruthy();
    cleanup();
    renderCard(1, attempt({ "1": "TRUE" }, { pins: { "1": ["p1-1-s2"] } }));
    expect(screen.getByText(review.pinMatch)).toBeTruthy();
  });

  it("Explain simpler is a disclosure: the simpler text follows the button", () => {
    renderCard(1, attempt({ "1": "TRUE" }));
    const button = screen.getByRole("button", { name: review.simpler });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Simply so.")).toBeNull();
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(button.textContent).toBe(review.simplerHide);
    expect(screen.getByText(review.simplerTitle)).toBeTruthy();
    expect(screen.getByText("Simply so.")).toBeTruthy();
  });
});

describe("ReviewWorkspace", () => {
  // jsdom has no layout: scrolling and media queries are stubbed.
  beforeEach(() => {
    // A phone window with reduced motion: the review in its sheet.
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduced-motion"),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal("scrollTo", vi.fn());
    Element.prototype.scrollIntoView = vi.fn();
  });
  afterEach(() => vi.unstubAllGlobals());

  function renderWorkspace(shown: ReadingAttempt, q: number) {
    address = `attempt=${shown.id}&q=${q}&set=all`;
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ReviewWorkspace
          test={test}
          answerKey={demoKey}
          explanations={undefined}
          attempt={shown}
          record={recordOf(shown)}
          bar={() => null}
          notice={null}
        />
      </NextIntlClientProvider>,
    );
  }

  it("a choose-several item has one aggregate outcome, and both its numbers show it in the navigator", () => {
    renderWorkspace(attempt({ "22": ["A", "B"] }), 23);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent).toBe("Questions 22–231 of 2 correct");
    fireEvent.click(screen.getByRole("button", { name: "All questions" }));
    expect(
      screen.getAllByRole("button", {
        name: "Questions 22–23, partly correct, current",
      }),
    ).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "Question 1, no answer" }),
    ).toBeTruthy();
  });

  it("shows the attempt's highlights, and none, without a word, when none were recorded", () => {
    const highlighted = attempt({}, { highlights: ["p1-1-s1"] });
    renderWorkspace(highlighted, 1);
    const main = screen.getByRole("main");
    expect(
      within(main).getAllByText((_, e) => e?.tagName === "MARK"),
    ).toHaveLength(1);
    cleanup();
    renderWorkspace(attempt({}, { highlights: [] }), 1);
    expect(screen.getByRole("main").querySelector("mark")).toBeNull();
    cleanup();
    renderWorkspace(attempt({}), 1);
    expect(screen.getByRole("main").querySelector("mark")).toBeNull();
    expect(screen.queryByText(/highlight/i)).toBeNull();
  });

  it("marks the current question's evidence in the read-only passage", () => {
    renderWorkspace(attempt({ "1": "TRUE" }), 1);
    expect(screen.getByText("Evidence for question 1")).toBeTruthy();
    expect(screen.queryByText(en.reading.passage.label)).toBeNull();
  });
});
