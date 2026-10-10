"use client";

import { useTranslations } from "next-intl";
import type { QuestionUnit } from "@/domain/reading/units";
import { GapText } from "./GapText";
import { useReading } from "./reading-context";

/**
 * "Type words": sentence, summary and note completion, and short answers.
 * The text shows its numbered gaps with the current one marked; the field
 * below takes the answer as typed, with no spelling help (owner, M4-09).
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
        onChange={(event) =>
          send({ type: "answer", number, answer: event.target.value })
        }
        onBlur={() => {
          if (value.trim() !== value)
            send({ type: "answer", number, answer: value.trim() });
        }}
        className="mt-2 block min-h-12 w-full rounded-md border border-border-control bg-surface-base px-4 py-3"
      />
    </>
  );
}
