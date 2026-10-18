"use client";

import { InfoIcon } from "@/shared/ui/icons";
import { useTranslations } from "next-intl";
import { Fragment, type ReactNode, useState } from "react";
import {
  type AnswerKeyEntry,
  type ExplanationSegment,
  type Explanations,
  type OptionMark,
  type QuestionUnit,
  type ReadingAttempt,
  type ReadingTest,
  type Signal,
  type UnitOutcome,
  optionMarks,
} from "@/entities/reading";
import { QuestionPrompt, unitOptions } from "@/features/answer-question";
import { SecondaryButton } from "@/shared/ui/SecondaryButton";
import { keySentences, pinComparison, quotesOf } from "../model/review";
import { OutcomeIcon } from "./OutcomeIcon";

/** English words inside a localized string (`<en>…</en>` in the catalogs). */
const en = (chunks: ReactNode) => <span lang="en">{chunks}</span>;

const MARK_STYLE: Record<OptionMark, string> = {
  yourAnswerCorrect: "border-2 border-status-correct",
  yourAnswerIncorrect: "border-2 border-dashed border-ink",
  correctAnswer: "border-2 border-status-correct",
};
const MARK_ICON: Record<OptionMark, UnitOutcome> = {
  yourAnswerCorrect: "correct",
  yourAnswerIncorrect: "incorrect",
  correctAnswer: "correct",
};

/**
 * One answer unit in the review (READING_EXPERIENCE.md, Evidence-first
 * review (M5); DESIGN_SYSTEM.md, M5: review card): the question as in the
 * test, the learner's answer and the accepted one, the key's evidence in the
 * passage, why, "Explain simpler", the learner's pins against the key, and
 * the unit's notes. Its heading is the sheet's (phone) or the column's.
 */
export function ReviewCard({
  test,
  unit,
  outcome,
  attempt,
  entry,
  signals,
  explanation,
  onShowSentence,
}: {
  test: ReadingTest;
  unit: QuestionUnit;
  outcome: UnitOutcome;
  attempt: ReadingAttempt;
  entry: AnswerKeyEntry | undefined;
  signals: Signal[];
  explanation: Explanations["items"][string] | undefined;
  onShowSentence: (sentenceId: string) => void;
}) {
  const t = useTranslations("reading");
  const [simpler, setSimpler] = useState(false);
  const passage = test.passages.find((p) => p.number === unit.passageNumber);
  const answer = attempt.answers[unit.key];
  const accept = entry?.accept ?? [];
  const evidence = keySentences(entry);
  const pins = pinComparison(unit, attempt, entry);
  const unanswered = outcome === "unanswered";
  const timeUp = signals.some((s) => s.code === "timeUp");
  // "Your evidence" says what the pins show; time-out goes with "No answer".
  const notes = signals.filter(
    (s) => s.code !== "timeUp" && s.code !== "pinnedElsewhere",
  );

  const noAnswer = (
    <>
      <p className="flex items-start gap-2">
        <OutcomeIcon outcome="unanswered" />
        {t("review.noAnswerGiven")}
      </p>
      {timeUp && <Note>{t("signals.timeUp")}</Note>}
    </>
  );
  const quotes = (sentenceIds: readonly string[]) =>
    passage && (
      <ul className="mt-2 flex flex-col gap-2">
        {quotesOf(passage, sentenceIds).map((quote) => (
          <li key={quote.id} className="rounded-md bg-surface-warm px-4 py-3">
            <p className="text-meta text-text-secondary">
              {t("evidence.paragraph", { letter: quote.paragraph })}
            </p>
            <blockquote
              id={`quote-${unit.key}-${quote.id}`}
              lang="en"
              className="mt-1 font-passage text-passage"
            >
              {quote.text}
            </blockquote>
            <button
              type="button"
              aria-describedby={`quote-${unit.key}-${quote.id}`}
              onClick={() => onShowSentence(quote.id)}
              className="inline-flex min-h-12 items-center font-medium underline underline-offset-4"
            >
              {t("evidence.show")}
            </button>
          </li>
        ))}
      </ul>
    );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p lang="en" className="text-text-secondary">
          {unit.group.instruction}
        </p>
        <div className="mt-4">
          <QuestionPrompt test={test} unit={unit} />
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {unit.kind === "text" ? (
            <dl className="flex flex-col gap-2">
              <div>
                <dt className="font-bold">{t("review.yourAnswer")}</dt>
                <dd>
                  {unanswered ? (
                    noAnswer
                  ) : (
                    <span lang="en" className="font-passage text-passage">
                      {answer}
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-bold">{t("review.correctAnswer")}</dt>
                <dd lang="en" className="font-passage text-passage">
                  {accept[0]}
                </dd>
              </div>
              {accept.length > 1 && (
                <div>
                  <dt className="font-bold">{t("review.alsoAccepted")}</dt>
                  {accept.slice(1).map((variant) => (
                    <dd
                      key={variant}
                      lang="en"
                      className="font-passage text-passage"
                    >
                      {variant}
                    </dd>
                  ))}
                </div>
              )}
            </dl>
          ) : (
            <>
              {unanswered && noAnswer}
              <OptionList
                options={unitOptions(test, unit)}
                marks={optionMarks(unit, answer, accept)}
              />
            </>
          )}
        </div>
      </div>

      {/* NOT GIVEN without related sentences has no evidence block at all. */}
      {evidence.sentenceIds.length > 0 && (
        <section>
          <h3 className="text-heading-3 font-bold">
            {evidence.kind === "evidence"
              ? t("review.evidenceTitle")
              : t("review.relatedTitle")}
          </h3>
          {quotes(evidence.sentenceIds)}
        </section>
      )}

      {explanation && (
        <section>
          <h3 className="text-heading-3 font-bold">{t("review.why")}</h3>
          <p className="mt-2">
            <Segments segments={explanation.explanation} />
          </p>
          <div className="mt-3">
            <SecondaryButton
              expanded={simpler}
              onClick={() => setSimpler(!simpler)}
            >
              {simpler ? t("review.simplerHide") : t("review.simpler")}
            </SecondaryButton>
          </div>
          {simpler && (
            <div className="mt-3 border-s-4 border-ink ps-3">
              <p className="font-bold">{t("review.simplerTitle")}</p>
              <p className="mt-1">
                <Segments segments={explanation.simpler} />
              </p>
            </div>
          )}
        </section>
      )}

      {pins && (
        <section>
          <h3 className="text-heading-3 font-bold">{t("evidence.title")}</h3>
          {quotes(pins.sentenceIds)}
          {pins.agreement && (
            <p className="mt-2 font-bold">
              {pins.agreement === "notGiven"
                ? t.rich("review.pinNotGiven", { en })
                : pins.agreement === "match"
                  ? t("review.pinMatch")
                  : t("review.pinMiss")}
            </p>
          )}
        </section>
      )}

      {notes.length > 0 && (
        <ul className="flex flex-col gap-2">
          {notes.map((signal) => (
            <li key={signal.code}>
              <Note>
                {"wording" in signal
                  ? t.rich(`signals.${signal.code}.${signal.wording}`, { en })
                  : t(`signals.${signal.code}`)}
              </Note>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * The options of a choice or list question, read-only (a list, not controls),
 * each marked one with its own label, so nothing depends on the boundary's
 * color and no label ties a positional mark to a letter.
 */
function OptionList({
  options,
  marks,
}: {
  options: { id: string; text: string }[];
  marks: Record<string, OptionMark>;
}) {
  const t = useTranslations("reading.review");
  return (
    <ul className="flex flex-col gap-2">
      {options.map((option) => {
        const mark = marks[option.id];
        return (
          <li
            key={option.id}
            className={`rounded-md bg-surface-base px-4 py-3 font-medium ${
              mark ? MARK_STYLE[mark] : "border border-border-subtle"
            }`}
          >
            <span lang="en">
              {option.text === option.id ? (
                option.text
              ) : (
                <>
                  <span className="font-bold">{option.id}</span>
                  {option.text && ` ${option.text}`}
                </>
              )}
            </span>
            {mark && (
              <span className="mt-1 flex items-center gap-2 font-bold">
                <OutcomeIcon outcome={MARK_ICON[mark]} />
                {t(mark)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Segments({ segments }: { segments: ExplanationSegment[] }) {
  return segments.map((segment, i) =>
    "en" in segment ? (
      <span key={i} lang="en">
        {segment.en}
      </span>
    ) : (
      <Fragment key={i}>{segment.text}</Fragment>
    ),
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2">
      <InfoIcon />
      <span>{children}</span>
    </p>
  );
}
