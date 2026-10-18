"use client";

import { InfoIcon } from "@/shared/ui/icons";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  type AnswerKey,
  type ReadingTest,
  type ResultRecord,
  positionCounts,
  retryQuestions,
  reviewOffer,
  unitOutcomes,
} from "@/entities/reading";
import { useRouter } from "@/shared/i18n/navigation";
import { PrimaryLink } from "@/shared/ui/PrimaryLink";
import { QuietLink } from "@/shared/ui/QuietLink";
import { TaskLayout } from "@/shared/ui/TaskLayout";
import { type Loaded, loadResult } from "../api/load-result";
import { OutcomeIcon } from "./OutcomeIcon";
import { RepeatedMistakes } from "./RepeatedMistakes";

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
  const params = useSearchParams();
  const attemptId = params.get("attempt");
  // Sent by a retry whose source had no record for the current key revision:
  // loading writes it, then the retry continues (use-retry-session.ts).
  const retryRequest = params.get("retry");
  const router = useRouter();
  const [loaded, setLoaded] = useState<Loaded>();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const returning =
    retryRequest !== null &&
    loaded?.kind === "result" &&
    loaded.attempt.kind === "test";

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

  useEffect(() => {
    if (!returning || !loaded || retryRequest === null) return;
    const address = new URLSearchParams({
      of: loaded.attempt.id,
      q: retryRequest,
      rechecked: "1",
    });
    router.replace(`/reading/${test.id}/retry?${address}`);
  }, [returning, loaded, retryRequest, router, test.id]);

  // Arriving from the test, the page says what happened (as M4's finished page).
  useEffect(() => {
    if (loaded && !returning) headingRef.current?.focus();
  }, [loaded, returning]);

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

  if (!loaded || returning)
    return <TaskLayout>{heading(t("results.title"))}</TaskLayout>;

  if (loaded.kind === "none")
    return (
      <TaskLayout>
        {heading(t("results.none.title"))}
        <p className="mt-4">{t("results.none.body")}</p>
        <div className="mt-6">
          <PrimaryLink href={startHref}>{t("results.none.start")}</PrimaryLink>
        </div>
      </TaskLayout>
    );

  const { attempt } = loaded;
  // A retry is shown on its own terms: out of its own questions, never out
  // of 40 and never with the test's score (READING_EXPERIENCE.md, Targeted
  // practice).
  const isRetry = attempt.kind === "retry";
  const title = isRetry ? t("retry.title") : t("results.title");
  const meta = (
    <p className="mt-2 text-meta text-text-secondary">
      <span lang="en">{test.title}</span> · {t(`mode.${attempt.mode}`)}
    </p>
  );
  const score = (record: ResultRecord) => (
    <p className="mt-6 text-heading-1 font-extrabold tabular-nums">
      {t(isRetry ? "retry.score" : "results.score", {
        score: record.score.marks,
        total: record.score.positions,
      })}
    </p>
  );

  if (loaded.kind === "earlierVersion")
    return (
      <TaskLayout>
        {heading(title, attempt.finishReason === "timeUp")}
        {meta}
        {loaded.record && score(loaded.record)}
        <Note>
          {loaded.record ? t("results.oldVersion") : t("results.cannotCheck")}
        </Note>
        <div className="mt-6">
          <PrimaryLink href={startHref}>{t("results.none.start")}</PrimaryLink>
        </div>
      </TaskLayout>
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
  // Every unit not fully correct or unanswered, whole and once (positions).
  const retry = isRetry ? [] : retryQuestions(test, attempt, record);

  return (
    <TaskLayout
      side={
        <div className="mt-8 flex flex-col gap-8 desktop:mt-0">
          {loaded.patterns && (
            <RepeatedMistakes testId={test.id} view={loaded.patterns} />
          )}
          {isRetry ? (
            <div>
              <QuietLink
                href={`/reading/${test.id}/results?attempt=${encodeURIComponent(attempt.retryOf ?? "")}`}
              >
                {t("retry.backToResults")}
              </QuietLink>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {retry.length > 0 && (
                <QuietLink
                  href={`/reading/${test.id}/retry?of=${encodeURIComponent(attempt.id)}&q=${retry.join(",")}`}
                >
                  {t("results.tryAgain", { count: retry.length })}
                </QuietLink>
              )}
              <QuietLink href={startHref}>{t("finished.again")}</QuietLink>
            </div>
          )}
        </div>
      }
    >
      {heading(title, attempt.finishReason === "timeUp")}
      {meta}
      {score(record)}
      <p className="mt-2">
        {isRetry ? t("retry.honest") : t("results.honest")}
      </p>
      {!isRetry && (
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
      )}
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
    </TaskLayout>
  );
}
