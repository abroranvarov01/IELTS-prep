"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { AnswerKey, Explanations, ReadingTest } from "@/entities/reading";
import { Link } from "@/shared/i18n/navigation";
import { ChevronIcon } from "@/shared/ui/icons";
import { PrimaryLink } from "@/shared/ui/PrimaryLink";
import { QUIET_BUTTON } from "@/shared/ui/quiet-action";
import { TestBarFrame } from "@/widgets/reading-layout";
import { type Loaded, loadResult } from "../api/load-result";
import { InfoIcon } from "./InfoIcon";
import { ReviewWorkspace } from "./ReviewWorkspace";

/**
 * The review of an attempt (READING_EXPERIENCE.md, Evidence-first review
 * (M5)), in the test-screen layout: the test bar with "Results", then the
 * attempt from the address, checked as on the results page, or the state
 * that says why there is nothing to review.
 */
export function ReviewScreen({
  test,
  answerKey,
  explanations,
}: {
  test: ReadingTest;
  answerKey: AnswerKey;
  explanations: Explanations | undefined;
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

  // A state without a review says so: its heading takes the focus.
  useEffect(() => {
    if (loaded && loaded.kind !== "result") headingRef.current?.focus();
  }, [loaded]);

  const shownId = loaded && loaded.kind !== "none" ? loaded.attempt.id : null;
  const resultsHref = `/reading/${test.id}/results${
    shownId ? `?attempt=${encodeURIComponent(shownId)}` : ""
  }`;
  const bar = (children?: ReactNode) => (
    <TestBarFrame
      start={
        <Link href={resultsHref} className={`${QUIET_BUTTON} -ms-3`}>
          <ChevronIcon direction="left" />
          {t("review.toResults")}
        </Link>
      }
    >
      {children}
    </TestBarFrame>
  );

  if (!loaded) return bar();

  if (loaded.kind === "result")
    return (
      <ReviewWorkspace
        test={test}
        answerKey={answerKey}
        explanations={explanations}
        attempt={loaded.attempt}
        record={loaded.record}
        bar={(passageNumber) =>
          bar(
            <span className="font-medium">
              {t("passageOf", {
                number: passageNumber,
                total: test.passages.length,
              })}
            </span>,
          )
        }
        notice={
          !loaded.saved && (
            <p role="status" className="mx-auto max-w-measure pt-4 font-medium">
              {t("results.storageUnavailable")}
            </p>
          )
        }
      />
    );

  const startTest = (
    <div className="mt-6">
      <PrimaryLink href={`/reading/${test.id}`}>
        {t("results.none.start")}
      </PrimaryLink>
    </div>
  );
  const heading = (title: string) => (
    <h1
      ref={headingRef}
      tabIndex={-1}
      className="text-heading-1 font-extrabold focus:outline-none"
    >
      {title}
    </h1>
  );

  return (
    <>
      {bar()}
      <main id="main" className="px-gutter">
        <div className="mx-auto max-w-column py-8">
          {loaded.kind === "none" ? (
            <>
              {heading(t("results.none.title"))}
              <p className="mt-4">{t("results.none.body")}</p>
            </>
          ) : (
            <>
              {heading(t("results.title"))}
              {loaded.record && (
                <p className="mt-6 text-heading-1 font-extrabold tabular-nums">
                  {t("results.score", {
                    score: loaded.record.score.marks,
                    total: loaded.record.score.positions,
                  })}
                </p>
              )}
              <p className="mt-4 flex gap-2">
                <InfoIcon />
                <span>
                  {loaded.record
                    ? t("results.oldVersion")
                    : t("results.cannotCheck")}
                </span>
              </p>
            </>
          )}
          {startTest}
        </div>
      </main>
    </>
  );
}
