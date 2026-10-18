"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import {
  type ListeningTest,
  type Mode,
  audioBytes,
  recordingMinutes,
} from "@/entities/listening";
import { InfoIcon, LineIcon, ListeningIcon } from "@/shared/ui/icons";
import { OptionRow } from "@/shared/ui/OptionRow";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { QuietLink } from "@/shared/ui/QuietLink";
import { TaskLayout } from "@/shared/ui/TaskLayout";
import { TestBar } from "./TestBar";

// Where the attribution goes in the localized sentence.
const MARK = "\u0000";

const en = (chunks: ReactNode) => <span lang="en">{chunks}</span>;

/**
 * The Listening start screen (LISTENING_EXPERIENCE.md, Start screen): the
 * title, the format, a temporary test's label and attribution, the two
 * modes, the audio size, the headphones and day-first date lines, then
 * Start.
 */
export function StartScreen({
  test,
  onStart,
  lastResultsHref,
}: {
  test: ListeningTest;
  onStart: (mode: Mode) => void;
  /** When this device has a finished attempt (as Reading's D6). */
  lastResultsHref?: string;
}) {
  const t = useTranslations("listening");
  const reading = useTranslations("reading");
  const practice = useTranslations("practice");
  const preselected = useSearchParams().get("mode") === "exam";
  const [mode, setMode] = useState<Mode>(preselected ? "exam" : "practice");
  const minutes = recordingMinutes(test);
  const format = practice("formatListening", {
    parts: test.parts.length,
    questions: test.parts.length * 10,
    minutes,
  });
  const skill = (
    <span className="flex size-8 items-center justify-center rounded-full bg-skill-listening-tint text-skill-listening">
      <ListeningIcon />
    </span>
  );
  const attribution =
    test.origin.kind === "licensed" ? test.origin.attribution : undefined;

  return (
    <>
      <TestBar />
      <main id="main" className="px-gutter">
        <TaskLayout
          side={
            <div className="hidden rounded-lg bg-blush-field p-6 desktop:block">
              <p className="flex items-center gap-3 text-heading-3 font-bold">
                {skill}
                {practice("skill.listening")}
              </p>
              <p className="mt-3 text-text-secondary">{format}</p>
            </div>
          }
        >
          <p className="flex items-center gap-2 text-meta font-bold desktop:hidden">
            {skill}
            {practice("skill.listening")}
          </p>
          <h1
            lang="en"
            className="mt-3 text-heading-1 font-extrabold desktop:mt-[0]"
          >
            {test.title}
          </h1>
          <p className="mt-2 text-meta text-text-secondary desktop:hidden">
            {format}
          </p>
          {test.temporary && (
            <div className="mt-4 flex items-start gap-2">
              <InfoIcon />
              <div>
                <p className="font-bold">{t("temporary.label")}</p>
                {attribution && (
                  <p className="text-meta text-text-secondary">
                    {t("temporary.source", { attribution: MARK })
                      .split(MARK)
                      .map((text, i) =>
                        i === 0 ? (
                          text
                        ) : (
                          <span key={i}>
                            <span lang="en">{attribution}</span>
                            {text}
                          </span>
                        ),
                      )}
                  </p>
                )}
              </div>
            </div>
          )}
          <fieldset className="mt-6">
            <legend className="font-bold">{reading("mode.legend")}</legend>
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
                  <span className="block font-bold">
                    {reading(`mode.${value}`)}
                  </span>
                  <span className="block font-normal text-text-secondary">
                    {t(`mode.${value}Detail`, { minutes })}
                  </span>
                </OptionRow>
              ))}
            </div>
          </fieldset>
          <ul className="mt-4 flex flex-col gap-2">
            <li className="flex items-center gap-3">
              <span className="text-text-secondary">
                <LineIcon className="size-[1.25rem]">
                  <path d="M8 2.5v8M4.5 7.5 8 11l3.5-3.5M3 13.5h10" />
                </LineIcon>
              </span>
              {t("start.audioSize", {
                size: Math.max(1, Math.round(audioBytes(test) / 1_000_000)),
              })}
            </li>
            <li className="flex items-center gap-3">
              <span className="text-text-secondary">
                <ListeningIcon />
              </span>
              {t("start.headphones")}
            </li>
            <li className="flex items-center gap-3">
              <span className="text-text-secondary">
                <LineIcon className="size-[1.25rem]">
                  <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
                  <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
                </LineIcon>
              </span>
              <span>{t.rich("start.dateFormat", { en })}</span>
            </li>
          </ul>
          <div className="mt-6">
            <PrimaryButton onClick={() => onStart(mode)}>
              {reading("start")}
            </PrimaryButton>
          </div>
          {lastResultsHref && (
            <div className="mt-2">
              <QuietLink href={lastResultsHref}>
                {reading("lastResults")}
              </QuietLink>
            </div>
          )}
        </TaskLayout>
      </main>
    </>
  );
}
