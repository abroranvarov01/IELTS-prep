"use client";

import { useTranslations } from "next-intl";
import type { QuestionUnit } from "@/domain/reading/units";
import { GapText } from "./GapText";
import { listOptions, matchingPrompt } from "./matching";
import { useReading } from "./reading-context";

/**
 * "Choose from a list": matching headings, information, features, sentence
 * endings, and summaries from a word box. One answer button opens the group's
 * option list in the expanded sheet (READING_EXPERIENCE.md); no drag and drop.
 */
export function MatchingQuestion({
  unit,
  onChoose,
}: {
  unit: QuestionUnit;
  onChoose: () => void;
}) {
  const t = useTranslations("reading");
  const { test, session } = useReading();
  const number = unit.numbers[0] ?? 0;
  const options = listOptions(test, unit);
  const chosen = options.find((o) => o.id === session.answers[unit.key]);
  const group = unit.group;
  const promptId = `prompt-${number}`;
  const prompt = matchingPrompt(test, unit, number);

  return (
    <>
      {group.type === "summaryWordBox" ? (
        <p lang="en">
          <GapText
            segments={group.text}
            current={number}
            answerOf={(gap) =>
              options.find((o) => o.id === session.answers[String(gap)])?.text
            }
          />
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
        aria-describedby={
          group.type === "summaryWordBox" ? undefined : promptId
        }
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
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="size-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 3 5 5-5 5" />
        </svg>
      </button>
    </>
  );
}
