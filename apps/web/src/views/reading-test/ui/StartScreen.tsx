"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  type Mode,
  QUESTION_COUNT,
  type ReadingTest,
} from "@/entities/reading";
import { ReadingIcon } from "@/shared/ui/icons";
import { OptionRow } from "@/shared/ui/OptionRow";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { QuietLink } from "@/shared/ui/QuietLink";
import { TaskLayout } from "@/shared/ui/TaskLayout";
import { TestBar } from "./TestBar";

/**
 * The test's start screen: its title, the two modes, and Start
 * (READING_EXPERIENCE.md, Practice and Exam Mode). A link can preselect a
 * mode (`?mode=exam`); the user still taps Start. After a finished attempt
 * it also offers the last results (D6). In the task composition, with the
 * test's skill and format (audit C6): above the title on phones and
 * tablets, beside the task on desktop.
 */
export function StartScreen({
  test,
  lastResultsHref,
  onStart,
}: {
  test: ReadingTest;
  lastResultsHref?: string;
  onStart: (mode: Mode) => void;
}) {
  const t = useTranslations("reading");
  const practice = useTranslations("practice");
  const preselected = useSearchParams().get("mode") === "exam";
  const [mode, setMode] = useState<Mode>(preselected ? "exam" : "practice");

  const skill = (
    <span className="flex size-8 items-center justify-center rounded-full bg-skill-reading-tint text-brand-primary-deep">
      <ReadingIcon />
    </span>
  );
  const format = practice("format", {
    passages: test.passages.length,
    questions: QUESTION_COUNT,
    minutes: test.durationMinutes,
  });
  const skillName = practice("skill.reading");

  return (
    <>
      <TestBar />
      <main id="main" className="px-gutter">
        <TaskLayout
          side={
            <div className="hidden rounded-lg bg-blush-field p-6 desktop:block">
              <p className="flex items-center gap-3 text-heading-3 font-bold">
                {skill}
                {skillName}
              </p>
              <p className="mt-3 text-text-secondary">{format}</p>
            </div>
          }
        >
          <p className="flex items-center gap-2 text-meta font-bold desktop:hidden">
            {skill}
            {skillName}
          </p>
          <h1
            lang="en"
            className="mt-3 text-heading-1 font-extrabold desktop:mt-0"
          >
            {test.title}
          </h1>
          <p className="mt-2 text-meta text-text-secondary desktop:hidden">
            {format}
          </p>
          <fieldset className="mt-6">
            <legend className="font-bold">{t("mode.legend")}</legend>
            <div className="mt-3 flex flex-col gap-2">
              {(["practice", "exam"] as const).map((value) => (
                <OptionRow
                  key={value}
                  type="radio"
                  name="mode"
                  value={value}
                  checked={mode === value}
                  onChange={() => setMode(value)}
                >
                  <span className="block font-bold">{t(`mode.${value}`)}</span>
                  <span className="block font-normal text-text-secondary">
                    {t(`mode.${value}Detail`)}
                  </span>
                </OptionRow>
              ))}
            </div>
          </fieldset>
          <div className="mt-6">
            <PrimaryButton onClick={() => onStart(mode)}>
              {t("start")}
            </PrimaryButton>
          </div>
          {lastResultsHref && (
            <div className="mt-2">
              <QuietLink href={lastResultsHref}>{t("lastResults")}</QuietLink>
            </div>
          )}
        </TaskLayout>
      </main>
    </>
  );
}
