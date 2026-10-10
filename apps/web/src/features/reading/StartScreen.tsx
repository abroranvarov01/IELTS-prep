"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import type { ReadingTest } from "@/domain/reading/content";
import type { Mode } from "@/domain/reading/session";
import { OptionRow } from "./OptionRow";
import { TestBar } from "./TestBar";

/** The test's start screen: its title, the two modes, and Start (READING_EXPERIENCE.md, Practice and Exam Mode). */
export function StartScreen({
  test,
  onStart,
}: {
  test: ReadingTest;
  onStart: (mode: Mode) => void;
}) {
  const t = useTranslations("reading");
  const [mode, setMode] = useState<Mode>("practice");

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
        </div>
      </main>
    </>
  );
}
