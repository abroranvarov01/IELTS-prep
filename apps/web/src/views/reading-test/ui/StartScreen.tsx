"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Mode, ReadingTest } from "@/entities/reading";
import { OptionRow } from "@/shared/ui/OptionRow";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { QuietLink } from "@/shared/ui/QuietLink";
import { TestBar } from "./TestBar";

/**
 * The test's start screen: its title, the two modes, and Start
 * (READING_EXPERIENCE.md, Practice and Exam Mode). A link can preselect a
 * mode (`?mode=exam`); the user still taps Start. After a finished attempt
 * it also offers the last results (D6).
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
  const preselected = useSearchParams().get("mode") === "exam";
  const [mode, setMode] = useState<Mode>(preselected ? "exam" : "practice");

  return (
    <>
      <TestBar />
      <main id="main" className="px-gutter">
        <div className="mx-auto max-w-column py-8">
          <h1 lang="en" className="text-heading-1 font-extrabold">
            {test.title}
          </h1>
          <fieldset className="mt-6">
            <legend className="font-bold">{t("mode.legend")}</legend>
            <div className="mt-3 flex flex-col gap-3">
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
                  <span className="block font-normal">
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
        </div>
      </main>
    </>
  );
}
