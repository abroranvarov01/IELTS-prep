"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import type { ListeningTest } from "@/entities/listening";
import { PrimaryLink } from "@/shared/ui/PrimaryLink";
import { QuietLink } from "@/shared/ui/QuietLink";
import { PictureStage, SignpostPicture } from "@/shared/ui/StatusMessage";
import { TestBar } from "./TestBar";
import { useRetrySession } from "./use-retry-session";
import { Workspace } from "./Workspace";

/**
 * Trying Listening questions again (LISTENING_EXPERIENCE.md, Targeted
 * practice (M9)): the Listening screen in Practice with only the retried
 * units, so the navigator, Previous / Next and the parts show only those;
 * or, when the address can't start a retry, the reason and the ways on.
 */
export function RetryScreen({
  test,
  keyRevision,
}: {
  test: ListeningTest;
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
            <div className="mx-auto max-w-content">
              <PictureStage picture={(size) => <SignpostPicture size={size} />}>
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-heading-1 font-extrabold focus:outline-none"
                >
                  {t("retry.unavailable")}
                </h1>
                <p className="mt-2 text-text-secondary">
                  {t(`retry.${screen.problem}`)}
                </p>
                <div className="mt-6 desktop:mt-8">
                  <PrimaryLink href={`/listening/${test.id}/results`}>
                    {t("lastResults")}
                  </PrimaryLink>
                </div>
                <div className="mt-2">
                  <QuietLink href={`/listening/${test.id}`}>
                    {t("results.none.start")}
                  </QuietLink>
                </div>
              </PictureStage>
            </div>
          </main>
        </>
      );
    case "active":
      return (
        <Workspace
          test={test}
          session={screen.session}
          send={screen.send}
          // A retry is Practice: no clock.
          now={screen.session.startedAt}
          canSave={screen.canSave}
        />
      );
  }
}
