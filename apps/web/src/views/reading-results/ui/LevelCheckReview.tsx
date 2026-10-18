"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import {
  type LevelCheckAttempt,
  deviceLevelCheckHistory,
} from "@/entities/level-check";
import {
  type AnswerKey,
  type Explanations,
  type ReadingAttempt,
  type ReadingTest,
  type ResultRecord,
  SCORING_RULES_VERSION,
  checkAttempt,
} from "@/entities/reading";
import { Link } from "@/shared/i18n/navigation";
import { ChevronIcon } from "@/shared/ui/icons";
import { PrimaryLink } from "@/shared/ui/PrimaryLink";
import { QUIET_BUTTON } from "@/shared/ui/quiet-action";
import { PictureStage, SignpostPicture } from "@/shared/ui/StatusMessage";
import { TestBarFrame } from "@/widgets/reading-layout";
import { ReviewWorkspace } from "./ReviewWorkspace";

type Loaded =
  | { kind: "none" }
  | { kind: "review"; attempt: ReadingAttempt; record: ResultRecord };

/**
 * "See your answers" after the level check (LEVEL_CHECK.md D13): the M5
 * review on the check's attempt, read from the level-check history and
 * checked here for the review alone (the stored result record keeps the
 * level; the review needs the outcomes and signals per unit). The bar's way
 * out leads back to the result.
 */
export function LevelCheckReview({
  form,
  answerKey,
  explanations,
}: {
  form: ReadingTest;
  answerKey: AnswerKey;
  explanations: Explanations | undefined;
}) {
  const t = useTranslations("levelCheck");
  const attemptId = useSearchParams().get("attempt");
  const [loaded, setLoaded] = useState<Loaded>();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let active = true;
    deviceLevelCheckHistory()
      .then((history) => history.read("reading"))
      .then((attempts): Loaded => {
        const found = attempts.find(
          (a) =>
            a.id === attemptId &&
            a.formId === form.id &&
            a.formVersion === form.version,
        );
        if (!found) return { kind: "none" };
        const attempt = asReadingAttempt(found);
        return {
          kind: "review",
          attempt,
          record: {
            attemptId: attempt.id,
            keyRevision: answerKey.revision,
            rulesVersion: SCORING_RULES_VERSION,
            checkedAt: found.committedAt,
            ...checkAttempt(form, answerKey, attempt),
          },
        };
      })
      .catch((): Loaded => ({ kind: "none" }))
      .then((result) => {
        if (active) setLoaded(result);
      });
    return () => {
      active = false;
    };
  }, [form, answerKey, attemptId]);

  useEffect(() => {
    if (loaded?.kind === "none") headingRef.current?.focus();
  }, [loaded]);

  const resultHref = `/level-check/result${
    attemptId ? `?attempt=${encodeURIComponent(attemptId)}` : ""
  }`;
  const bar = (passageNumber?: number) => (
    <TestBarFrame
      start={
        <Link href={resultHref} className={`${QUIET_BUTTON} -ms-3`}>
          <ChevronIcon direction="left" />
          {t("result.title")}
        </Link>
      }
    >
      {passageNumber !== undefined && (
        <span className="font-medium">
          <PassageOf number={passageNumber} total={form.passages.length} />
        </span>
      )}
    </TestBarFrame>
  );

  if (!loaded) return bar();
  if (loaded.kind === "review")
    return (
      <ReviewWorkspace
        test={form}
        answerKey={answerKey}
        explanations={explanations}
        attempt={loaded.attempt}
        record={loaded.record}
        bar={bar}
        notice={null}
      />
    );
  return (
    <>
      {bar()}
      <main id="main" className="px-gutter">
        <div className="mx-auto max-w-content">
          <PictureStage picture={(size) => <SignpostPicture size={size} />}>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-heading-1 font-extrabold focus:outline-none"
            >
              {t("result.none.title")}
            </h1>
            <p className="mt-2 text-text-secondary">{t("result.none.body")}</p>
            <div className="mt-6 desktop:mt-8">
              <PrimaryLink href="/level-check">{t("title")}</PrimaryLink>
            </div>
          </PictureStage>
        </div>
      </main>
    </>
  );
}

function PassageOf({ number, total }: { number: number; total: number }) {
  const t = useTranslations("reading");
  return t("passageOf", { number, total });
}

/** The check's attempt in the shape the review reads: a Practice test attempt without pins or highlights. */
function asReadingAttempt(attempt: LevelCheckAttempt): ReadingAttempt {
  return {
    id: attempt.id,
    testId: attempt.formId,
    testVersion: attempt.formVersion,
    kind: "test",
    mode: "practice",
    startedAt: attempt.startedAt,
    finishedAt: attempt.finishedAt,
    finishReason: "user",
    answers: attempt.answers,
    pins: {},
    committedAt: attempt.committedAt,
  };
}
