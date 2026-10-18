"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { Level, Skill } from "@/entities/level-check";
import type {
  ListeningKey,
  ListeningTest,
  Transcript,
} from "@/entities/listening";
import { type AnswerKey, type ReadingTest } from "@/entities/reading";
import {
  InfoIcon,
  LineIcon,
  ListeningIcon,
  ReadingIcon,
} from "@/shared/ui/icons";
import { PrimaryLink } from "@/shared/ui/PrimaryLink";
import { QuietLink } from "@/shared/ui/QuietLink";
import { PictureStage, SignpostPicture } from "@/shared/ui/StatusMessage";
import { TaskLayout } from "@/shared/ui/TaskLayout";
import {
  type LoadedResult,
  loadLevelCheckResult,
  loadListeningCheckResult,
} from "../api/load-result";

/** English words inside a localized type name (`<en>…</en>` in the catalogs). */
const en = (chunks: ReactNode) => <span lang="en">{chunks}</span>;

type Loaded = Record<Skill, LoadedResult> & {
  /** The section whose attempt the address names (just finished), if any. */
  shown?: Skill;
};

/**
 * The level check's result (USER_FLOWS.md, Level check flows (M7) and The
 * level check with two sections (M9); DESIGN_SYSTEM.md, M7 components:
 * result, and Level check: two sections): each finished section's starting
 * level on the product's own scale with its score and what to practise
 * first, side by side when both are finished, never averaged or compared,
 * and never a band. The Listening section says when it was paused or
 * interrupted, that its audio is temporary and its limits provisional.
 */
export function LevelCheckResult({
  reading,
  listening,
  academicNote,
}: {
  reading: { form: ReadingTest; answerKey: AnswerKey };
  listening: {
    form: ListeningTest;
    answerKey: ListeningKey;
    transcript: Transcript;
  };
  academicNote: boolean;
}) {
  const t = useTranslations("levelCheck");
  const tRoot = useTranslations();
  const attemptId = useSearchParams().get("attempt");
  const [loaded, setLoaded] = useState<Loaded>();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let active = true;
    // The attempt in the address belongs to one section; the other shows
    // its latest result.
    const load = async (
      section: (id: string | null) => Promise<LoadedResult>,
    ): Promise<LoadedResult> => {
      const named = await section(attemptId).catch((): LoadedResult => ({
        kind: "none",
      }));
      return named.kind === "none" && attemptId
        ? section(null).catch((): LoadedResult => ({ kind: "none" }))
        : named;
    };
    Promise.all([
      load((id) => loadLevelCheckResult(reading.form, reading.answerKey, id)),
      load((id) =>
        loadListeningCheckResult(
          listening.form,
          listening.answerKey,
          listening.transcript,
          id,
        ),
      ),
    ]).then(([readingResult, listeningResult]) => {
      if (!active) return;
      const shown = (["reading", "listening"] as const).find((skill) => {
        const result = skill === "reading" ? readingResult : listeningResult;
        return result.kind !== "none" && result.attempt.id === attemptId;
      });
      setLoaded({ reading: readingResult, listening: listeningResult, shown });
    });
    return () => {
      active = false;
    };
  }, [reading, listening, attemptId]);

  // Arriving from a section, the page says what happened.
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

  const finished = (["reading", "listening"] as const).filter(
    (skill) => loaded[skill].kind !== "none",
  );
  if (finished.length === 0)
    return (
      <PictureStage picture={(size) => <SignpostPicture size={size} />}>
        {heading(t("result.none.title"))}
        <p className="mt-2 text-text-secondary">{t("result.none.body")}</p>
        <div className="mt-6 desktop:mt-8">
          <PrimaryLink href="/level-check">{t("title")}</PrimaryLink>
        </div>
      </PictureStage>
    );

  // The section just finished leads: first on phones, and its actions.
  const lead: Skill =
    loaded.shown ?? (finished.length === 1 ? finished[0]! : "reading");
  const order: Skill[] = finished.length === 2 ? [lead, other(lead)] : [lead];
  const copy = skillCopy(lead);
  const leadResult = loaded[lead];
  const leadRecord = leadResult.kind === "none" ? undefined : leadResult.record;
  const insufficient = !leadRecord || leadRecord.level === "insufficient";

  const actions = (
    <>
      <div className="mt-6">
        {insufficient && finished.length === 1 ? (
          <PrimaryLink href="/level-check">{t(copy.retake)}</PrimaryLink>
        ) : (
          <PrimaryLink href={copy.practiseHref}>
            <span className="inline-flex items-center gap-2">
              {t(copy.practise)}
              <LineIcon className="size-4">
                <path d="M2.75 8h10.5M9 3.75 13.25 8 9 12.25" />
              </LineIcon>
            </span>
          </PrimaryLink>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {leadResult.kind === "result" && !insufficient && (
          <QuietLink
            href={`${copy.reviewHref}?attempt=${encodeURIComponent(leadResult.attempt.id)}`}
          >
            {t(copy.seeAnswers)}
          </QuietLink>
        )}
        {insufficient && finished.length === 1 ? (
          <QuietLink href={copy.practiseHref}>{t(copy.practise)}</QuietLink>
        ) : (
          <QuietLink href="/level-check">{t(copy.retake)}</QuietLink>
        )}
        {finished.length === 1 && (
          <QuietLink href="/level-check">
            {t(`result.otherSection.${other(lead)}`)}
          </QuietLink>
        )}
      </div>
    </>
  );
  const notes = (scope: number) => (
    <>
      <Note>{t("result.scope", { questions: scope })}</Note>
      <Note>{t("result.honest")}</Note>
    </>
  );

  // One section: the M7 result, with the section's title and copy.
  if (finished.length === 1) {
    const result = loaded[lead];
    if (result.kind === "none") return null;
    const record = result.record;
    const card = record && record.level !== "insufficient" && (
      <PractiseFirst skill={lead} types={record.practiseFirst} />
    );
    return (
      <TaskLayout
        side={card && <div className="hidden desktop:block">{card}</div>}
      >
        {heading(
          !record || record.level === "insufficient"
            ? t("result.insufficient.title")
            : t(copy.title),
        )}
        <SectionLevel skill={lead} result={result} display />
        <div className="mt-4 flex flex-col gap-2">
          {record && record.level !== "insufficient" && notes(record.total)}
          {lead === "reading" && academicNote && (
            <Note>{t("intro.academicNote")}</Note>
          )}
        </div>
        {card && <div className="mt-6 desktop:hidden">{card}</div>}
        {actions}
      </TaskLayout>
    );
  }

  // Both sections: side by side on desktop, the one just finished first on
  // phones; never averaged, and said to be on separate scales.
  return (
    <div className="mx-auto max-w-column py-8 desktop:max-w-content">
      {heading(t("result.titleBoth"))}
      <div className="mt-6 flex flex-col gap-8 desktop:grid desktop:grid-cols-2 desktop:items-start">
        {order.map((skill, i) => {
          const result = loaded[skill];
          if (result.kind === "none") return null;
          return (
            <section
              key={skill}
              aria-labelledby={`section-${skill}`}
              className={
                i > 0
                  ? "border-t border-border-subtle pt-8 desktop:border-t-[0] desktop:pt-[0]"
                  : ""
              }
            >
              <h2
                id={`section-${skill}`}
                className="flex items-center gap-2 text-heading-2 font-bold"
              >
                <span
                  className={
                    skill === "reading"
                      ? "text-brand-primary"
                      : "text-skill-listening"
                  }
                >
                  {skill === "reading" ? <ReadingIcon /> : <ListeningIcon />}
                </span>
                {tRoot(`practice.skill.${skill}`)}
              </h2>
              <SectionLevel skill={skill} result={result} />
              {result.record && result.record.level !== "insufficient" && (
                <div className="mt-6">
                  <PractiseFirst
                    skill={skill}
                    types={result.record.practiseFirst}
                  />
                </div>
              )}
            </section>
          );
        })}
      </div>
      <div className="mt-8 flex max-w-measure flex-col gap-2">
        <Note>{t("result.notComparable")}</Note>
        {notes(positionsOf(loaded[lead]) || positionsOf(loaded[other(lead)]))}
        {academicNote && <Note>{t("intro.academicNote")}</Note>}
      </div>
      {actions}
    </div>
  );
}

const other = (skill: Skill): Skill =>
  skill === "reading" ? "listening" : "reading";

const positionsOf = (result: LoadedResult) =>
  result.kind === "none" ? 0 : (result.record?.total ?? 0);

/** Each section's own copy and addresses (USER_FLOWS.md, Interface copy (M7, M9)). */
function skillCopy(skill: Skill) {
  return skill === "reading"
    ? ({
        title: "result.title",
        practise: "result.practise",
        practiseHref: "/practice",
        seeAnswers: "result.seeAnswers",
        reviewHref: "/level-check/review",
        retake: "retake.start",
      } as const)
    : ({
        title: "result.titleListening",
        practise: "result.practiseListening",
        practiseHref: "/practice#practice-listening",
        seeAnswers: "result.seeAnswersListening",
        reviewHref: "/level-check/review/listening",
        retake: "result.retakeListening",
      } as const);
}

/**
 * A section's level part: the level name, the three steps and the score, or
 * the insufficient-data content; then its notes. `display` is the one-section
 * result's display-size level name; with two sections it is Heading 1 size,
 * so the two names don't compete.
 */
function SectionLevel({
  skill,
  result,
  display = false,
}: {
  skill: Skill;
  result: Exclude<LoadedResult, { kind: "none" }>;
  display?: boolean;
}) {
  const t = useTranslations("levelCheck");
  const tReading = useTranslations("reading");
  const record = result.record;
  const sectionNotes = (
    <>
      {result.kind === "earlierForm" && <Note>{t("result.oldForm")}</Note>}
      {result.kind === "result" && !result.saved && (
        <Note>{tReading("results.storageUnavailable")}</Note>
      )}
    </>
  );

  if (!record || record.level === "insufficient")
    return (
      <>
        {!display && (
          <p className="mt-4 text-heading-3 font-bold">
            {t("result.insufficient.title")}
          </p>
        )}
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
          {sectionNotes}
        </div>
      </>
    );

  return (
    <>
      <p
        className={`mt-4 font-extrabold ${display ? "text-display" : "text-heading-1"}`}
      >
        {t(`levels.${record.level}`)}
      </p>
      <LevelIndicator level={record.level} />
      <p
        className={`mt-3 font-bold tabular-nums ${display ? "text-heading-2" : "text-heading-3"}`}
      >
        {tReading("results.score", {
          score: record.score,
          total: record.total,
        })}
      </p>
      {(skill === "listening" ||
        result.kind === "earlierForm" ||
        !result.saved) && (
        <div className="mt-3 flex flex-col gap-2">
          {skill === "listening" && (
            <ListeningQualifications attempt={result.attempt} />
          )}
          {sectionNotes}
        </div>
      )}
    </>
  );
}

/**
 * The Listening section's qualifications (LD20, LD21; DESIGN_SYSTEM.md):
 * information, not warnings, and nothing on the level itself.
 */
function ListeningQualifications({
  attempt,
}: {
  attempt: { pauses?: number; interruptions?: number };
}) {
  const t = useTranslations("levelCheck");
  return (
    <>
      {(attempt.pauses ?? 0) > 0 && (
        <Note>
          {t.rich("result.withPauses", {
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </Note>
      )}
      {(attempt.interruptions ?? 0) > 0 && (
        <Note>{t("result.playbackInterrupted")}</Note>
      )}
      <Note>{t("listening.temporaryAudio")}</Note>
      <Note>{t("result.listeningRough")}</Note>
    </>
  );
}

function PractiseFirst({ skill, types }: { skill: Skill; types: string[] }) {
  const t = useTranslations("levelCheck");
  return (
    <div className="rounded-lg bg-surface-warm p-4 desktop:p-6">
      <p className="text-meta font-bold text-text-secondary">
        {t("result.practiseFirst")}
      </p>
      {types.length === 0 ? (
        <p className="mt-2">
          {skill === "reading"
            ? t("result.practiseAny")
            : t("result.practiseAnyListening")}
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {types.map((type) => (
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
  "formCompletion",
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
