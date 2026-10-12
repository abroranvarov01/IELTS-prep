"use client";

import { useTranslations } from "next-intl";
import {
  type QuestionUnit,
  STATEMENT_ANSWERS,
  useReading,
} from "@/entities/reading";
import { OptionRow } from "@/shared/ui/OptionRow";

/**
 * "Choose one": TRUE/FALSE/NOT GIVEN, YES/NO/NOT GIVEN, multiple choice with
 * one answer. Native radios; choosing never moves on (owner, M4-09).
 */
export function ChoiceQuestion({ unit }: { unit: QuestionUnit }) {
  const t = useTranslations("reading");
  const { session, send } = useReading();
  const number = unit.numbers[0] ?? 0;
  const answer = session.answers[unit.key];
  const { prompt, options } = choices(unit, number);

  return (
    <>
      <fieldset lang="en">
        <legend className="font-bold">{prompt}</legend>
        <div className="mt-3 flex flex-col gap-2">
          {options.map((option) => (
            <OptionRow
              key={option.id}
              type="radio"
              name={`question-${number}`}
              value={option.id}
              checked={answer === option.id}
              onChange={() =>
                send({ type: "answer", number, answer: option.id })
              }
            >
              {option.letter && (
                <>
                  <span className="font-bold">{option.id}</span>{" "}
                </>
              )}
              {option.text}
            </OptionRow>
          ))}
        </div>
      </fieldset>
      {answer !== undefined && (
        <button
          type="button"
          onClick={() => send({ type: "clearAnswer", number })}
          className="mt-2 inline-flex min-h-12 items-center font-medium underline underline-offset-4"
        >
          {t("answer.clear")}
        </button>
      )}
    </>
  );
}

function choices(unit: QuestionUnit, number: number) {
  const group = unit.group;
  switch (group.type) {
    case "trueFalseNotGiven":
    case "yesNoNotGiven":
      return {
        prompt:
          group.questions.find((q) => q.number === number)?.statement ?? "",
        options: STATEMENT_ANSWERS[group.type].map((id) => ({
          id,
          text: id,
          letter: false,
        })),
      };
    case "multipleChoice": {
      const question = group.questions.find((q) => q.number === number);
      return {
        prompt: question?.stem ?? "",
        options: (question?.options ?? []).map((o) => ({ ...o, letter: true })),
      };
    }
    default:
      return { prompt: "", options: [] };
  }
}
