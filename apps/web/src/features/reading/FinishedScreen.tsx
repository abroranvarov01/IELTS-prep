"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { PrimaryLink } from "@/components/PrimaryLink";
import { QUESTION_COUNT, type ReadingTest } from "@/domain/reading/content";
import { type ReadingSession, answeredNumbers } from "@/domain/reading/session";
import { TestBar } from "./TestBar";

/**
 * The finished page in M4 (READING_EXPERIENCE.md, Practice and Exam Mode):
 * completion and the answered count only. Nothing is checked or scored in M4.
 */
export function FinishedScreen({
  test,
  session,
  onStartAgain,
}: {
  test: ReadingTest;
  /** The finished session, or the attempt committed for it (ADR-0009). */
  session: Pick<ReadingSession, "answers" | "finishReason">;
  onStartAgain: () => void;
}) {
  const t = useTranslations();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Finishing, or the time running out, replaces the screen; say what happened.
  useEffect(() => headingRef.current?.focus(), []);

  return (
    <>
      <TestBar />
      <main id="main" className="px-gutter">
        <div className="mx-auto max-w-column py-8">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-heading-1 font-extrabold focus:outline-none"
          >
            {session.finishReason === "timeUp" && (
              <span className="block text-heading-3 font-bold">
                {t("reading.finished.timeUp")}
              </span>
            )}
            {t("reading.finished.title")}
          </h1>
          <p className="mt-4">
            {t("reading.finished.answered", {
              answered: answeredNumbers(session, test).size,
              total: QUESTION_COUNT,
            })}
          </p>
          <p className="mt-2">{t("reading.finished.notChecked")}</p>
          <div className="mt-6">
            <PrimaryLink href="/">{t("common.goHome")}</PrimaryLink>
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={onStartAgain}
              className="inline-flex min-h-12 items-center font-medium underline"
            >
              {t("reading.finished.again")}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
