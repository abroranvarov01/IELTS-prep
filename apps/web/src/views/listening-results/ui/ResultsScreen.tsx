"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  type ListeningKey,
  type ListeningTest,
  type ResultRecord,
  type Transcript,
  positionCounts,
  reviewOffer,
  unitOutcomes,
  wasInterrupted,
} from "@/entities/listening";
import { InfoIcon } from "@/shared/ui/icons";
import { OutcomeIcon } from "@/shared/ui/OutcomeIcon";
import { PrimaryLink } from "@/shared/ui/PrimaryLink";
import { QuietLink } from "@/shared/ui/QuietLink";
import { TaskLayout } from "@/shared/ui/TaskLayout";
import { type Loaded, loadResult } from "../api/load-result";

/** A short note on the result (DESIGN_SYSTEM.md, M5 and M9 results page). */
function Note({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 flex gap-2">
      <InfoIcon />
      <span>{children}</span>
    </p>
  );
}

/**
 * The Listening results page (LISTENING_EXPERIENCE.md, Results page (M9)):
 * the practice score out of 40, never a band, the counts of answers not
 * correct and not given, notes (temporary test, interrupted sitting, checked
 * later, correction, storage), and one red action into the review.
 */
export function ResultsScreen({
  test,
  answerKey,
  transcript,
}: {
  test: ListeningTest;
  answerKey: ListeningKey;
  transcript: Transcript;
}) {
  const t = useTranslations("reading");
  const listening = useTranslations("listening");
  const attemptId = useSearchParams().get("attempt");
  const [loaded, setLoaded] = useState<Loaded>();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let active = true;
    loadResult(test, answerKey, transcript, attemptId)
      .catch((): Loaded => ({ kind: "none" }))
      .then((result) => {
        if (active) setLoaded(result);
      });
    return () => {
      active = false;
    };
  }, [test, answerKey, transcript, attemptId]);

  // Arriving from the test, the page says what happened.
  useEffect(() => {
    if (loaded) headingRef.current?.focus();
  }, [loaded]);

  const startHref = `/listening/${test.id}`;
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

  if (!loaded) return <TaskLayout>{heading(t("results.title"))}</TaskLayout>;

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
  const timeUp = attempt.finishReason === "timeUp";
  const meta = (
    <p className="mt-2 text-meta text-text-secondary">
      <span lang="en">{test.title}</span> · {t(`mode.${attempt.mode}`)}
      {test.temporary && <> · {listening("temporary.label")}</>}
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
      <TaskLayout>
        {heading(t("results.title"), timeUp)}
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
  const offer = reviewOffer(unitOutcomes(test, record));
  const reviewLabel = {
    mistakesAndUnanswered: t("results.reviewMistakesAndUnanswered"),
    mistakes: t("results.reviewMistakes"),
    unanswered: t("results.reviewUnanswered"),
    answers: t("results.reviewAll"),
  }[offer];
  const reviewHref = `/listening/${test.id}/review?attempt=${encodeURIComponent(attempt.id)}&set=${offer === "answers" ? "all" : "mistakes"}`;

  return (
    // "Start again" stays with the result: the side column is for
    // "Mistakes that repeated" and the retry link (M9-11).
    <TaskLayout>
      {heading(t("results.title"), timeUp)}
      {meta}
      {score(record)}
      <p className="mt-2">{listening("results.honest")}</p>
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
      {wasInterrupted(attempt) && (
        <Note>{listening("finished.interrupted")}</Note>
      )}
      {attempt.importedFromM8 && <Note>{t("results.importedFromM4")}</Note>}
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
      <div className="mt-4">
        <QuietLink href={startHref}>{t("finished.again")}</QuietLink>
      </div>
    </TaskLayout>
  );
}
