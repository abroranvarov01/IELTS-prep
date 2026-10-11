"use client";

import { useTranslations } from "next-intl";
import type { QuestionUnit } from "@/domain/reading/units";
import { exceedsWordLimit } from "@/domain/reading/word-limit";
import { GapText } from "./GapText";
import { useReading } from "./reading-context";

/**
 * "Type words": sentence, summary and note completion, and short answers.
 * The text shows its numbered gaps with the current one marked; the field
 * below takes the answer as typed, with no spelling help (owner, M4-09).
 * Practice warns when the answer has more words than the instruction allows.
 */
export function TypedQuestion({ unit }: { unit: QuestionUnit }) {
  const t = useTranslations("reading");
  const { session, send } = useReading();
  const number = unit.numbers[0] ?? 0;
  const stored = session.answers[unit.key];
  const value = typeof stored === "string" ? stored : "";
  const answerOf = (gap: number) => {
    const answer = session.answers[String(gap)];
    return typeof answer === "string" && answer.trim() !== ""
      ? answer
      : undefined;
  };
  const group = unit.group;
  const fieldId = `answer-${number}`;
  const warningId = `word-limit-${number}`;
  const limit =
    session.mode === "practice" && "wordLimit" in group
      ? group.wordLimit
      : undefined;
  const isTooLong = limit !== undefined && exceedsWordLimit(value, limit);

  return (
    <>
      <div lang="en">
        {group.type === "sentenceCompletion" && (
          <p>
            <GapText
              segments={
                group.sentences.find((s) =>
                  s.some(
                    (segment) => "gap" in segment && segment.gap === number,
                  ),
                ) ?? []
              }
              current={number}
              answerOf={answerOf}
            />
          </p>
        )}
        {(group.type === "summaryCompletion" ||
          group.type === "noteCompletion") &&
          group.title && <p className="font-bold">{group.title}</p>}
        {group.type === "summaryCompletion" && (
          <p className="mt-1">
            <GapText
              segments={group.text}
              current={number}
              answerOf={answerOf}
            />
          </p>
        )}
        {group.type === "noteCompletion" && (
          <ul className="mt-1 flex flex-col gap-1">
            {group.lines.map((line, i) => (
              <li key={i}>
                <GapText segments={line} current={number} answerOf={answerOf} />
              </li>
            ))}
          </ul>
        )}
        {group.type === "shortAnswer" && (
          <p className="font-bold">
            {group.questions.find((q) => q.number === number)?.question}
          </p>
        )}
      </div>
      <label htmlFor={fieldId} className="mt-4 block font-bold">
        {t("answer.label", { number })}
      </label>
      <input
        id={fieldId}
        type="text"
        lang="en"
        value={value}
        // The test assesses spelling: no correction, capitals or suggestions.
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-describedby={limit && warningId}
        onChange={(event) =>
          send({ type: "answer", number, answer: event.target.value })
        }
        onBlur={() => {
          if (value.trim() !== value)
            send({ type: "answer", number, answer: value.trim() });
        }}
        className="mt-2 block min-h-12 w-full rounded-md border border-border-control bg-surface-base px-4 py-3"
      />
      {limit && (
        <p
          id={warningId}
          aria-live="polite"
          className={isTooLong ? "mt-2 flex items-start gap-2" : undefined}
        >
          {isTooLong && (
            <>
              <WarningIcon />
              {t("wordLimit", { max: limit.words })}
            </>
          )}
        </p>
      )}
    </>
  );
}

function WarningIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-[1.25rem] shrink-0"
      fill="none"
      stroke="currentColor"
    >
      <circle cx="10" cy="10" r="8.25" strokeWidth="1.5" />
      <path d="M10 5.5v5.5" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="14.25" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
