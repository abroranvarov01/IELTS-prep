"use client";

import { useTranslations } from "next-intl";
import { type QuestionUnit, useReading } from "@/entities/reading";
import { OptionRow } from "@/shared/ui/OptionRow";
import { multiItem } from "../model/choices";

/**
 * "Choose several": one item for several question numbers ("Choose TWO
 * letters"). Checkboxes; at the limit the other options are disabled, so the
 * instruction cannot be exceeded by accident (READING_EXPERIENCE.md).
 */
export function MultiChoiceQuestion({ unit }: { unit: QuestionUnit }) {
  const t = useTranslations("reading");
  const { session, send } = useReading();
  const number = unit.numbers[0] ?? 0;
  const item = multiItem(unit);
  const stored = session.answers[unit.key];
  const chosen = Array.isArray(stored) ? stored : [];
  const isFull = chosen.length >= unit.choose;

  const toggle = (id: string) =>
    send({
      type: "answer",
      number,
      answer: chosen.includes(id)
        ? chosen.filter((c) => c !== id)
        : [...chosen, id],
    });

  if (!item) return null;
  return (
    <fieldset>
      <legend lang="en" className="font-bold">
        {item.stem}
      </legend>
      <p className="mt-1 text-meta text-text-secondary" aria-live="polite">
        {t("answer.chosenCount", { count: chosen.length, total: unit.choose })}
      </p>
      <div lang="en" className="mt-3 flex flex-col gap-2">
        {item.options.map((option) => {
          const isChosen = chosen.includes(option.id);
          return (
            <OptionRow
              key={option.id}
              type="checkbox"
              name={`question-${number}`}
              value={option.id}
              checked={isChosen}
              disabled={isFull && !isChosen}
              onChange={() => toggle(option.id)}
            >
              <span className="font-bold">{option.id}</span> {option.text}
            </OptionRow>
          );
        })}
      </div>
    </fieldset>
  );
}
