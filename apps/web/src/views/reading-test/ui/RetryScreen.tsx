"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef } from "react";
import {
  ReadingContext,
  type ReadingTest,
  questionUnits,
} from "@/entities/reading";
import { PrimaryLink } from "@/shared/ui/PrimaryLink";
import { QuietLink } from "@/shared/ui/QuietLink";
import { TestBar } from "./TestBar";
import { TestWorkspace } from "./TestWorkspace";
import { useRetrySession } from "./use-retry-session";

/**
 * Trying questions again (READING_EXPERIENCE.md, Targeted practice (M5)): the
 * test screen in Practice with only the retried units, so the navigator,
 * Previous / Next and the desktop column show only those; or, when the
 * address can't start a retry, the reason and the ways on.
 */
export function RetryScreen({
  test,
  keyRevision,
}: {
  test: ReadingTest;
  keyRevision: number;
}) {
  const t = useTranslations("reading");
  const params = useSearchParams();
  const screen = useRetrySession(
    test,
    keyRevision,
    params.get("of"),
    params.get("q"),
    params.has("rechecked"),
  );
  const questions =
    screen.status === "active" ? screen.session.retry?.questions : undefined;
  const units = useMemo(
    () =>
      questionUnits(test).filter((unit) =>
        unit.numbers.every((n) => questions?.includes(n)),
      ),
    [test, questions],
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  const unavailable = screen.status === "unavailable";

  // The safe state says what happened: its heading takes the focus.
  useEffect(() => {
    if (unavailable) headingRef.current?.focus();
  }, [unavailable]);

  switch (screen.status) {
    case "loading":
    case "finishing":
      return <TestBar />;
    case "unavailable":
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
                {t("retry.unavailable")}
              </h1>
              <p className="mt-4">{t(`retry.${screen.problem}`)}</p>
              <div className="mt-6">
                <PrimaryLink href={`/reading/${test.id}/results`}>
                  {t("lastResults")}
                </PrimaryLink>
              </div>
              <div className="mt-2">
                <QuietLink href={`/reading/${test.id}`}>
                  {t("results.none.start")}
                </QuietLink>
              </div>
            </div>
          </main>
        </>
      );
    case "active":
      return (
        <ReadingContext.Provider
          value={{ test, units, session: screen.session, send: screen.send }}
        >
          <TestWorkspace canSave={screen.canSave} />
        </ReadingContext.Provider>
      );
  }
}
