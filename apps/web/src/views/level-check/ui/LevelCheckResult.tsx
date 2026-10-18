"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { Level } from "@/entities/level-check";
import {
  type AnswerKey,
  type ReadingTest,
  positionCount,
} from "@/entities/reading";
import { InfoIcon, LineIcon } from "@/shared/ui/icons";
import { PrimaryLink } from "@/shared/ui/PrimaryLink";
import { QuietLink } from "@/shared/ui/QuietLink";
import { PictureStage, SignpostPicture } from "@/shared/ui/StatusMessage";
import { TaskLayout } from "@/shared/ui/TaskLayout";
import { type LoadedResult, loadLevelCheckResult } from "../api/load-result";

/** English words inside a localized type name (`<en>…</en>` in the catalogs). */
const en = (chunks: ReactNode) => <span lang="en">{chunks}</span>;

/**
 * The level check's result (USER_FLOWS.md, Level check flows (M7);
 * DESIGN_SYSTEM.md, M7 components: result): the starting level on the
 * product's own scale with the score, the scope and honest lines, what to
 * practise first and one red action into practice. Never a band.
 */
export function LevelCheckResult({
  form,
  answerKey,
  academicNote,
}: {
  form: ReadingTest;
  answerKey: AnswerKey;
  academicNote: boolean;
}) {
  const t = useTranslations("levelCheck");
  const tReading = useTranslations("reading");
  const attemptId = useSearchParams().get("attempt");
  const [loaded, setLoaded] = useState<LoadedResult>();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let active = true;
    loadLevelCheckResult(form, answerKey, attemptId)
      .catch((): LoadedResult => ({ kind: "none" }))
      .then((result) => {
        if (active) setLoaded(result);
      });
    return () => {
      active = false;
    };
  }, [form, answerKey, attemptId]);

  // Arriving from the section, the page says what happened.
  useEffect(() => {
    if (loaded) headingRef.current?.focus();
  }, [loaded]);

  const heading = (title: string) => (
    <h1
      ref={headingRef}
      tabIndex={-1}
      className="text-heading-1 font-extrabold focus:outline-none"
    >
      {title}
    </h1>
  );

  if (!loaded) return <TaskLayout>{heading(t("result.title"))}</TaskLayout>;

  if (loaded.kind === "none")
    return (
      <PictureStage picture={(size) => <SignpostPicture size={size} />}>
        {heading(t("result.none.title"))}
        <p className="mt-2 text-text-secondary">{t("result.none.body")}</p>
        <div className="mt-6 desktop:mt-8">
          <PrimaryLink href="/level-check">{t("title")}</PrimaryLink>
        </div>
      </PictureStage>
    );

  const { record } = loaded;
  const total = positionCount(form);
  const retake = <QuietLink href="/level-check">{t("retake.start")}</QuietLink>;
  const practise = (
    <PrimaryLink href="/practice">
      <span className="inline-flex items-center gap-2">
        {t("result.practise")}
        <LineIcon className="size-4">
          <path d="M2.75 8h10.5M9 3.75 13.25 8 9 12.25" />
        </LineIcon>
      </span>
    </PrimaryLink>
  );

  if (!record || record.level === "insufficient")
    return (
      <TaskLayout>
        {heading(t("result.insufficient.title"))}
        {record && (
          <p className="mt-4 text-heading-2 font-bold tabular-nums">
            {t("result.insufficient.answered", {
              answered: record.answered,
              total: record.total,
            })}
          </p>
        )}
        <div className="mt-4 flex flex-col gap-2">
          <Note>{t("result.insufficient.body")}</Note>
          {loaded.kind === "earlierForm" && <Note>{t("result.oldForm")}</Note>}
          {loaded.kind === "result" && !loaded.saved && (
            <Note>{tReading("results.storageUnavailable")}</Note>
          )}
        </div>
        <div className="mt-6">
          <PrimaryLink href="/level-check">{t("retake.start")}</PrimaryLink>
        </div>
        <div className="mt-4">
          <QuietLink href="/practice">{t("result.practise")}</QuietLink>
        </div>
      </TaskLayout>
    );

  const practiseFirst = (
    <div className="rounded-lg bg-surface-warm p-4 desktop:p-6">
      <p className="text-meta font-bold text-text-secondary">
        {t("result.practiseFirst")}
      </p>
      {record.practiseFirst.length === 0 ? (
        <p className="mt-2">{t("result.practiseAny")}</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {record.practiseFirst.map((type) => (
            <li key={type} className="flex items-start gap-2">
              <TypeIcon typed={isTyped(type)} />
              <span>
                {t.has(`types.${type}`)
                  ? t.rich(`types.${type}`, { en })
                  : type}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <TaskLayout
      side={<div className="hidden desktop:block">{practiseFirst}</div>}
    >
      {heading(t("result.title"))}
      <p className="mt-4 text-display font-extrabold">
        {t(`levels.${record.level}`)}
      </p>
      <LevelIndicator level={record.level} />
      <p className="mt-3 text-heading-2 font-bold tabular-nums">
        {tReading("results.score", { score: record.score, total })}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Note>{t("result.scope", { questions: total })}</Note>
        <Note>{t("result.honest")}</Note>
        {academicNote && <Note>{t("intro.academicNote")}</Note>}
        {loaded.kind === "earlierForm" && <Note>{t("result.oldForm")}</Note>}
        {loaded.kind === "result" && !loaded.saved && (
          <Note>{tReading("results.storageUnavailable")}</Note>
        )}
      </div>
      <div className="mt-6 desktop:hidden">{practiseFirst}</div>
      <div className="mt-6">{practise}</div>
      <div className="mt-4 flex flex-col gap-2">
        {loaded.kind === "result" && (
          <QuietLink
            href={`/level-check/review?attempt=${encodeURIComponent(loaded.attempt.id)}`}
          >
            {t("result.seeAnswers")}
          </QuietLink>
        )}
        {retake}
      </div>
    </TaskLayout>
  );
}

/** Three segments, the first `level` filled: decorative, the name is the level. */
function LevelIndicator({ level }: { level: Level }) {
  return (
    <div aria-hidden="true" className="mt-2 flex gap-1">
      {[1, 2, 3].map((step) => (
        <span
          key={step}
          className={`h-1 w-8 rounded-full ${step <= level ? "bg-brand-primary" : "bg-border-subtle"}`}
        />
      ))}
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-2">
      <InfoIcon />
      <span>{children}</span>
    </p>
  );
}

const TYPED = new Set([
  "sentenceCompletion",
  "summaryCompletion",
  "noteCompletion",
  "shortAnswer",
]);
const isTyped = (type: string) => TYPED.has(type);

/** A list for choice types, a pencil for typed answers. */
function TypeIcon({ typed }: { typed: boolean }) {
  return (
    <LineIcon className="mt-[0.125rem] size-[1.25rem] text-text-secondary">
      {typed ? (
        <path d="m10.75 2.75 2.5 2.5-7.5 7.5-3.25.75.75-3.25zM9.25 4.25l2.5 2.5" />
      ) : (
        <path d="M5.5 4.25h8M5.5 8h8M5.5 11.75h8M2.5 4.25h.01M2.5 8h.01M2.5 11.75h.01" />
      )}
    </LineIcon>
  );
}
