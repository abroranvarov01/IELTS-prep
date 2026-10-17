"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  type AnswerKey,
  type ReadingTest,
  type ResultRecord,
  positionCounts,
  reviewOffer,
  unitOutcomes,
} from "@/entities/reading";
import { PrimaryLink } from "@/shared/ui/PrimaryLink";
import { QuietLink } from "@/shared/ui/QuietLink";
import { type Loaded, loadResult } from "../api/load-result";
import { InfoIcon } from "./InfoIcon";
import { OutcomeIcon } from "./OutcomeIcon";

/** A short note on the result (DESIGN_SYSTEM.md, M5 results page). */
function Note({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 flex gap-2">
      <InfoIcon />
      <span>{children}</span>
    </p>
  );
}

/**
 * The results page (READING_EXPERIENCE.md, Results page (M5)): the practice
 * score out of the attempt's positions, never a band, the counts of answers
 * not correct and not given, notes, and one red action into the review.
 */
export function ResultsScreen({
  test,
  answerKey,
}: {
  test: ReadingTest;
  answerKey: AnswerKey;
}) {
  const t = useTranslations("reading");
  const attemptId = useSearchParams().get("attempt");
  const [loaded, setLoaded] = useState<Loaded>();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let active = true;
    loadResult(test, answerKey, attemptId)
      .catch((): Loaded => ({ kind: "none" }))
      .then((result) => {
        if (active) setLoaded(result);
      });
    return () => {
      active = false;
    };
  }, [test, answerKey, attemptId]);

  // Arriving from the test, the page says what happened (as M4's finished page).
  useEffect(() => {
    if (loaded) headingRef.current?.focus();
  }, [loaded]);

  const startHref = `/reading/${test.id}`;
  const heading = (title: string, timeUp = false) => (
    <h1
      ref={headingRef}
      tabIndex={-1}
      className="text-heading-1 font-extrabold focus:outline-none"
    >
      {timeUp && (
        <span className="block text-heading-3 font-bold">
          {t("finished.timeUp")}
        </span>
      )}
      {title}
    </h1>
  );

  if (!loaded)
    return (
      <div className="mx-auto max-w-column py-8">
        {heading(t("results.title"))}
      </div>
    );

  if (loaded.kind === "none")
    return (
      <div className="mx-auto max-w-column py-8">
        {heading(t("results.none.title"))}
        <p className="mt-4">{t("results.none.body")}</p>
        <div className="mt-6">
          <PrimaryLink href={startHref}>{t("results.none.start")}</PrimaryLink>
        </div>
      </div>
    );

  const { attempt } = loaded;
  const meta = (
    <p className="mt-2 text-meta text-text-secondary">
      <span lang="en">{test.title}</span> · {t(`mode.${attempt.mode}`)}
    </p>
  );
  const score = (record: ResultRecord) => (
    <p className="mt-6 text-heading-1 font-extrabold tabular-nums">
      {t("results.score", {
        score: record.score.marks,
        total: record.score.positions,
      })}
    </p>
  );

  if (loaded.kind === "earlierVersion")
    return (
      <div className="mx-auto max-w-column py-8">
        {heading(t("results.title"), attempt.finishReason === "timeUp")}
        {meta}
        {loaded.record && score(loaded.record)}
        <Note>
          {loaded.record ? t("results.oldVersion") : t("results.cannotCheck")}
        </Note>
        <div className="mt-6">
          <PrimaryLink href={startHref}>{t("results.none.start")}</PrimaryLink>
        </div>
      </div>
    );

  const { record, correction } = loaded;
  const counts = positionCounts(record);
  const offer = reviewOffer(unitOutcomes(test, attempt, record));
  const reviewLabel = {
    mistakesAndUnanswered: t("results.reviewMistakesAndUnanswered"),
    mistakes: t("results.reviewMistakes"),
    unanswered: t("results.reviewUnanswered"),
    answers: t("results.reviewAll"),
  }[offer];
  const reviewHref = `/reading/${test.id}/review?attempt=${encodeURIComponent(attempt.id)}&set=${offer === "answers" ? "all" : "mistakes"}`;

  return (
    <div className="mx-auto max-w-column py-8">
      {heading(t("results.title"), attempt.finishReason === "timeUp")}
      {meta}
      {score(record)}
      <p className="mt-2">{t("results.honest")}</p>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-text-secondary">
        {t.rich("results.breakdown", {
          incorrect: counts.incorrect,
          unanswered: counts.unanswered,
          notCorrect: (chunks) => (
            <span className="inline-flex items-center gap-1">
              <OutcomeIcon outcome="incorrect" />
              {chunks}
            </span>
          ),
          noAnswer: (chunks) => (
            <span className="inline-flex items-center gap-1">
              <OutcomeIcon outcome="unanswered" />
              {chunks}
            </span>
          ),
        })}
      </p>
      {attempt.importedFromM4 && <Note>{t("results.importedFromM4")}</Note>}
      {correction && (
        <Note>
          {correction.earlierScore === undefined
            ? t("results.recheckedSameScore")
            : t("results.rechecked", {
                score: correction.earlierScore,
                total: record.score.positions,
              })}
        </Note>
      )}
      {!loaded.saved && <Note>{t("results.storageUnavailable")}</Note>}
      <div className="mt-6">
        <PrimaryLink href={reviewHref}>{reviewLabel}</PrimaryLink>
      </div>
      <div className="mt-8">
        <QuietLink href={startHref}>{t("finished.again")}</QuietLink>
      </div>
    </div>
  );
}
