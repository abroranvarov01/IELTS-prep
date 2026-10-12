"use client";

import { useTranslations } from "next-intl";
import { type QuestionUnit, useReading } from "@/entities/reading";
import { ChevronIcon } from "@/shared/ui/icons";
import { listOptions, matchingPrompt } from "../model/matching";
import { GroupText } from "./GroupText";

/**
 * "Choose from a list": matching headings, information, features, sentence
 * endings, and summaries from a word box. One answer button opens the group's
 * option list in the expanded sheet (READING_EXPERIENCE.md); no drag and drop.
 * Without `withGroupText`, a word box's summary is shown by the caller, once
 * for all its questions, and the button is labeled with its answer number.
 */
export function MatchingQuestion({
  unit,
  onChoose,
  withGroupText = true,
}: {
  unit: QuestionUnit;
  onChoose: () => void;
  withGroupText?: boolean;
}) {
  const t = useTranslations("reading");
  const { test, session } = useReading();
  const number = unit.numbers[0] ?? 0;
  const options = listOptions(test, unit);
  const chosen = options.find((o) => o.id === session.answers[unit.key]);
  const group = unit.group;
  const promptId = `prompt-${number}`;
  const prompt = matchingPrompt(test, unit, number);
  const showsSummary = group.type === "summaryWordBox" && withGroupText;

  return (
    <>
      {showsSummary ? (
        <GroupText group={group} current={number} />
      ) : group.type === "summaryWordBox" ? (
        <p id={promptId} className="font-bold">
          {t("answer.label", { number })}
        </p>
      ) : (
        <p
          id={promptId}
          lang={prompt.kind === "text" ? "en" : undefined}
          className="font-bold"
        >
          {prompt.kind === "paragraph"
            ? t("evidence.paragraph", { letter: prompt.letter })
            : prompt.kind === "text"
              ? prompt.text
              : null}
        </p>
      )}
      <button
        type="button"
        onClick={onChoose}
        aria-describedby={showsSummary ? undefined : promptId}
        className="mt-3 flex min-h-12 w-full items-center justify-between gap-3 rounded-md border border-border-control bg-surface-base px-4 py-3 text-start font-medium transition-colors hover:border-ink active:bg-surface-warm"
      >
        {chosen ? (
          <span lang="en">
            <span className="font-bold">{chosen.id}</span>
            {chosen.text && " "}
            {chosen.text}
          </span>
        ) : (
          <span className="text-text-secondary">{t("answer.choose")}</span>
        )}
        <ChevronIcon direction="right" />
      </button>
    </>
  );
}
