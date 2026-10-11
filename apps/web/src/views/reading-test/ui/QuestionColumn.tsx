"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import {
  QUESTION_COUNT,
  type QuestionUnit,
  unitOf,
  useReading,
} from "@/entities/reading";
import {
  AnswerControl,
  GroupText,
  OptionPicker,
  hasGroupText,
} from "@/features/answer-question";
import { EvidenceList } from "@/features/mark-passage";

/**
 * The desktop question column (READING_EXPERIENCE.md, desktop layout): every
 * question of the passage on screen, by group, each with its answer control in
 * place. The group's text of a summary, notes or word box is shown once, with
 * a labeled control per question under it (owner, 2026-10-11). The current
 * question has a bar along its start edge; working in a question makes it
 * current, and moving to one with the navigator bar focuses its heading.
 */
export function QuestionColumn({
  showSentence,
}: {
  showSentence: (sentenceId: string) => void;
}) {
  const t = useTranslations("reading");
  const { test, units, session, send } = useReading();
  const passage = test.passages[session.view.passage - 1];
  const current = unitOf(units, session.currentQuestion);
  // The "choose from a list" question whose option list is open, by unit key.
  const [picker, setPicker] = useState<string | null>(null);
  const pickerHeadingRef = useRef<HTMLHeadingElement>(null);
  const returnFocusTo = useRef<string | null>(null);
  const isFirstQuestion = useRef(true);
  const changedHere = useRef(false);

  // A question chosen elsewhere (navigator bar, Previous / Next) gets focus on
  // its heading, which also brings it into view; not on first load.
  useEffect(() => {
    if (isFirstQuestion.current || changedHere.current) {
      isFirstQuestion.current = false;
      changedHere.current = false;
      return;
    }
    document.getElementById("question-heading")?.focus();
  }, [session.currentQuestion]);

  // An open option list has its heading focused; a closed one returns focus
  // to its question's answer button.
  useEffect(() => {
    if (picker) {
      pickerHeadingRef.current?.focus();
      return;
    }
    if (returnFocusTo.current)
      document
        .querySelector<HTMLElement>(
          `[data-question="${returnFocusTo.current}"] button`,
        )
        ?.focus();
    returnFocusTo.current = null;
  }, [picker]);

  const closePicker = () => {
    returnFocusTo.current = picker;
    setPicker(null);
  };
  useEffect(() => {
    if (!picker) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      returnFocusTo.current = picker;
      setPicker(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [picker]);

  const makeCurrent = (unit: QuestionUnit) => {
    if (unit === current) return;
    changedHere.current = true;
    send({ type: "goTo", number: unit.numbers[0] ?? 1 });
  };
  const label = (numbers: number[]) =>
    numbers.length > 1
      ? t("question.range", {
          from: numbers[0] ?? 0,
          to: numbers.at(-1) ?? 0,
        })
      : t("question.of", { number: numbers[0] ?? 0, total: QUESTION_COUNT });

  if (!passage) return null;
  return (
    <section
      aria-label={t("sheet.label")}
      className="relative overflow-y-auto border-s border-border-subtle px-gutter py-6"
    >
      <div className="flex flex-col gap-10">
        {passage.questionGroups.map((group) => {
          const groupUnits = units.filter((unit) => unit.group.id === group.id);
          const isShared = hasGroupText(group);
          return (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <h2 id={`group-${group.id}`} className="text-heading-3 font-bold">
                {label(groupUnits.flatMap((unit) => unit.numbers))}
              </h2>
              <p lang="en" className="mt-1 text-text-secondary">
                {group.instruction}
              </p>
              {isShared && (
                <div className="mt-4">
                  <GroupText group={group} current={session.currentQuestion} />
                </div>
              )}
              <div className="mt-6 flex flex-col gap-8">
                {groupUnits.map((unit) => {
                  const isCurrent = unit === current;
                  return (
                    <div
                      key={unit.key}
                      data-question={unit.key}
                      onFocus={() => makeCurrent(unit)}
                      onChange={() => makeCurrent(unit)}
                      className={`border-s-4 ps-4 ${isCurrent ? "border-ink" : "border-surface-base"}`}
                    >
                      <h3
                        id={isCurrent ? "question-heading" : undefined}
                        tabIndex={-1}
                        className="font-bold focus:outline-none"
                      >
                        {label(unit.numbers)}
                      </h3>
                      <div className="mt-3">
                        {picker === unit.key ? (
                          <OptionPicker
                            unit={unit}
                            headingRef={pickerHeadingRef}
                            onBack={closePicker}
                            onChosen={closePicker}
                          />
                        ) : (
                          <AnswerControl
                            unit={unit}
                            withGroupText={!isShared}
                            onChoose={() => {
                              makeCurrent(unit);
                              setPicker(unit.key);
                            }}
                          />
                        )}
                      </div>
                      {session.mode === "practice" && (
                        <EvidenceList
                          number={unit.numbers[0] ?? 0}
                          onShow={showSentence}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
