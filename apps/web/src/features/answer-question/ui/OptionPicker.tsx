"use client";

import { useLocale, useTranslations } from "next-intl";
import type { RefObject } from "react";
import { type QuestionUnit, useReading } from "@/entities/reading";
import { AnswerOption } from "@/shared/ui/AnswerOption";
import { ChevronIcon } from "@/shared/ui/icons";
import { QUIET_BUTTON } from "@/shared/ui/quiet-action";
import {
  chosenElsewhere,
  listOptions,
  matchingPrompt,
} from "../model/matching";

/**
 * The option list of a "choose from a list" question, in the expanded sheet.
 * Choosing fills the answer and returns to the question. Options the user
 * chose for other questions of the group say so; they stay choosable.
 */
export function OptionPicker({
  unit,
  headingRef,
  onBack,
  onChosen,
}: {
  unit: QuestionUnit;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
  onChosen: () => void;
}) {
  const t = useTranslations("reading");
  const locale = useLocale();
  const { test, units, session, send } = useReading();
  const number = unit.numbers[0] ?? 0;
  const used = chosenElsewhere(session, units, unit);
  const prompt = matchingPrompt(test, unit, number);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-heading-3 font-bold focus:outline-none"
        >
          {prompt.kind === "paragraph" ? (
            t("evidence.paragraph", { letter: prompt.letter })
          ) : prompt.kind === "text" ? (
            <span lang="en">{prompt.text}</span>
          ) : (
            t("answer.label", { number })
          )}
        </h2>
        <button
          type="button"
          onClick={onBack}
          className={`${QUIET_BUTTON} -me-3`}
        >
          <ChevronIcon direction="left" />
          {t("sheet.back")}
        </button>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {listOptions(test, unit).map((option) => {
          const elsewhere = used.get(option.id);
          return (
            <li key={option.id}>
              <AnswerOption
                type="button"
                selected={session.answers[unit.key] === option.id}
                selectedLabel={t("answer.selected")}
                onClick={() => {
                  send({ type: "answer", number, answer: option.id });
                  onChosen();
                }}
              >
                <span lang="en">
                  <span className="font-bold">{option.id}</span>
                  {option.text && " "}
                  {option.text}
                </span>
                {elsewhere && (
                  <span
                    lang={locale}
                    className="block text-meta text-text-secondary"
                  >
                    {t("answer.chosenFor", { question: elsewhere.join(", ") })}
                  </span>
                )}
              </AnswerOption>
            </li>
          );
        })}
      </ul>
    </>
  );
}
