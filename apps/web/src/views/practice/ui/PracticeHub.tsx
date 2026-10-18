"use client";

import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useState } from "react";
import { QUESTION_COUNT, type ReadingTest } from "@/entities/reading";
import { Link } from "@/shared/i18n/navigation";
import { ChevronIcon, InfoIcon, LineIcon } from "@/shared/ui/icons";
import { QuietLink } from "@/shared/ui/QuietLink";
import { loadStates } from "../api/load-states";
import type { TestState } from "../model/test-state";

/**
 * The Practice Hub (USER_FLOWS.md, Practice Hub (M6); DESIGN_SYSTEM.md, M6
 * components): every shipped test by skill, each row one link to the test's
 * own address with its state on this device, read after mounting. Skills
 * without tests are not shown (decision N3).
 */
export function PracticeHub({ tests }: { tests: ReadingTest[] }) {
  const t = useTranslations();
  const [loaded, setLoaded] =
    useState<Awaited<ReturnType<typeof loadStates>>>();

  useEffect(() => {
    let active = true;
    loadStates(tests).then(
      (result) => {
        if (active) setLoaded(result);
      },
      () => {
        if (active) setLoaded({ readable: false, states: {} });
      },
    );
    return () => {
      active = false;
    };
  }, [tests]);

  return (
    <div className="mx-auto max-w-column py-8 desktop:max-w-none">
      <h1 className="text-heading-1 font-extrabold">{t("practice.title")}</h1>
      {loaded && !loaded.readable && (
        <p className="mt-4 flex gap-2">
          <InfoIcon />
          <span>{t("practice.storageUnavailable")}</span>
        </p>
      )}
      {tests.length === 0 ? (
        <>
          <p className="mt-4">{t("practice.empty")}</p>
          <QuietLink href="/">{t("common.goHome")}</QuietLink>
        </>
      ) : (
        <section aria-labelledby="practice-reading" className="mt-8">
          <h2
            id="practice-reading"
            className="flex items-center gap-3 text-heading-2 font-bold"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-skill-reading-tint text-brand-primary-deep">
              <ReadingIcon />
            </span>
            {t("practice.skill.reading")}
          </h2>
          <ul className="mt-4 grid gap-3 desktop:grid-cols-2 desktop:gap-4">
            {tests.map((test) => {
              const state = loaded?.states[test.id];
              return (
                <li key={test.id}>
                  <Link
                    href={`/reading/${test.id}`}
                    className="flex min-h-[4.5rem] items-center gap-3 rounded-lg border border-border-subtle bg-surface-base p-4 transition-colors hover:border-ink active:bg-surface-warm"
                  >
                    <span className="min-w-0 flex-1">
                      <span lang="en" className="block font-bold">
                        {test.title}
                      </span>
                      <span className="block text-meta text-text-secondary">
                        {t("practice.format", {
                          passages: test.passages.length,
                          questions: QUESTION_COUNT,
                          minutes: test.durationMinutes,
                        })}
                      </span>
                      {/* Reserved while the device is read, so nothing jumps. */}
                      <span className="mt-1 flex min-h-[1.4em] items-center gap-2 text-meta font-medium">
                        {state && <StateLine state={state} />}
                      </span>
                    </span>
                    <ChevronIcon direction="right" />
                  </Link>
                  {state?.kind === "finished" && (
                    <QuietLink href={`/reading/${test.id}/results`}>
                      {t("reading.lastResults")}
                    </QuietLink>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

/** The state in words, with a line icon; never the M5 outcome icons, which mean correctness. */
function StateLine({ state }: { state: TestState }) {
  const t = useTranslations();
  const line = (icon: ReactNode, text: string) => (
    <>
      <LineIcon className="size-4">{icon}</LineIcon>
      {text}
    </>
  );
  const circle = <circle cx="8" cy="8" r="6.25" />;
  switch (state.kind) {
    case "notStarted":
      return line(circle, t("practice.state.notStarted"));
    case "inProgress":
      return line(
        <>
          {circle}
          <path d="M6.75 5.5v5l4-2.5z" />
        </>,
        t("practice.state.inProgress", {
          mode: t(`reading.mode.${state.mode}`),
        }),
      );
    case "finished":
      // Without a stored result, the "See your last results" link says it.
      return state.score
        ? line(
            <>
              {circle}
              <path d="m5.5 8.25 1.75 1.75 3.25-3.5" />
            </>,
            t("practice.state.finished", {
              score: state.score.marks,
              total: state.score.positions,
            }),
          )
        : null;
  }
}

function ReadingIcon() {
  return (
    <LineIcon className="size-[1.25rem]">
      <path d="M8 4.25C6.75 3.25 4.75 2.75 2.25 3v9.5c2.5-.25 4.5.25 5.75 1.25 1.25-1 3.25-1.5 5.75-1.25V3C11.25 2.75 9.25 3.25 8 4.25zM8 4.25v9.5" />
    </LineIcon>
  );
}
