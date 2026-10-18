"use client";

import { useTranslations } from "next-intl";
import { Fragment, type ReactNode, type RefObject, useState } from "react";
import {
  type ExplanationSegment,
  type Explanations,
  type KeyEntry,
  type ListeningAttempt,
  type ListeningKey,
  type ListeningTest,
  type Segment,
  type Signal,
  type Transcript,
  mediaUrl,
  wordNotInTranscript,
} from "@/entities/listening";
import { normalizeTypedAnswer } from "@/shared/content/normalize";
import type { GapSegment, Option } from "@/shared/content/types";
import { InfoIcon, LineIcon, ListeningIcon } from "@/shared/ui/icons";
import { LabelledPicture } from "@/shared/ui/LabelledPicture";
import { type Outcome, OutcomeIcon } from "@/shared/ui/OutcomeIcon";
import { QUIET_BUTTON } from "@/shared/ui/quiet-action";
import { SecondaryButton } from "@/shared/ui/SecondaryButton";
import {
  type HeardEvidence,
  type ReviewCard as Card,
  evidenceOf,
  evidenceStretch,
  gapContext,
  markQuotes,
  mentionedBy,
} from "../model/review";

/** English words inside a localized string (`<en>…</en>` in the catalogs). */
const en = (chunks: ReactNode) => <span lang="en">{chunks}</span>;

/** "1:23" from milliseconds, as the player shows times. */
export function clock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

const OUTCOME_WORD = {
  correct: "review.correct",
  incorrect: "review.incorrect",
  unanswered: "review.unanswered",
} as const;

type OptionMark = "yourAnswerCorrect" | "yourAnswerIncorrect" | "correctAnswer";
const MARK_STYLE: Record<OptionMark, string> = {
  yourAnswerCorrect: "border-2 border-status-correct",
  yourAnswerIncorrect: "border-2 border-dashed border-ink",
  correctAnswer: "border-2 border-status-correct",
};
const MARK_ICON: Record<OptionMark, Outcome> = {
  yourAnswerCorrect: "correct",
  yourAnswerIncorrect: "incorrect",
  correctAnswer: "correct",
};

/**
 * "Question 5 of 40" (or "Questions 18–19") with the unit's outcome as icon
 * and word, so focusing the heading announces the outcome.
 */
export function ReviewHeading({
  card,
  headingRef,
  progress,
}: {
  card: Card;
  headingRef: RefObject<HTMLHeadingElement | null>;
  progress?: string;
}) {
  const t = useTranslations("reading");
  const { unit, outcome } = card;
  return (
    <div>
      <h2
        id="question-heading"
        ref={headingRef}
        tabIndex={-1}
        className="text-heading-3 font-bold focus:outline-none"
      >
        {unit.numbers.length > 1
          ? t("question.range", {
              from: unit.numbers[0] ?? 0,
              to: unit.numbers.at(-1) ?? 0,
            })
          : t("question.of", { number: unit.key, total: 40 })}
        <span className="mt-1 flex items-center gap-2 text-body">
          <OutcomeIcon outcome={outcome} />
          {outcome === "partlyCorrect"
            ? t("review.partly", {
                correct: card.marks,
                total: unit.numbers.length,
              })
            : t(OUTCOME_WORD[outcome])}
        </span>
      </h2>
      {progress && (
        <p className="mt-1 text-meta text-text-secondary">{progress}</p>
      )}
    </div>
  );
}

/**
 * One answer unit in the Listening review (LISTENING_EXPERIENCE.md,
 * Evidence-first review (M9); DESIGN_SYSTEM.md, M9 components): the question
 * in its context with the answer in place, the answers, where the answer is
 * heard with "Play from", the transcript excerpt with the evidence marked,
 * the part's transcript, why, "Explain simpler" and the notes.
 */
export function ReviewCard({
  test,
  card,
  attempt,
  answerKey,
  transcript,
  signals,
  explanation,
  playing,
  audioAvailable,
  onPlay,
  onPause,
  desktop = false,
}: {
  test: ListeningTest;
  card: Card;
  attempt: ListeningAttempt;
  answerKey: ListeningKey;
  transcript: Transcript;
  signals: Signal[];
  explanation: Explanations["items"][string] | undefined;
  /** The segment whose evidence is playing, if any. */
  playing: string | undefined;
  audioAvailable: boolean;
  onPlay: (stretch: { fromMs: number; toMs?: number }, id: string) => void;
  onPause: () => void;
  /** On desktop the transcript is a column of its own: no excerpt, no disclosure. */
  desktop?: boolean;
}) {
  const t = useTranslations("reading");
  const l = useTranslations("listening");
  const player = useTranslations("listening.player");
  const picture = useTranslations("picture");
  const [simpler, setSimpler] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const { unit, outcome } = card;
  const entries = unit.numbers
    .map((n) => answerKey.answers[n])
    .filter((e): e is KeyEntry => e !== undefined);
  const accept = entries[0]?.accept ?? [];
  const heard = evidenceOf(unit, answerKey, transcript);
  const evidenceIds = new Set(heard.map((h) => h.segment.id));
  const segments = transcript.parts[unit.partNumber - 1]?.segments ?? [];
  const segmentById = (id: string) => segments.find((s) => s.id === id);
  const typedAnswers = unit.numbers.map((n) => {
    const a = attempt.answers[String(n)];
    return typeof a === "string" ? a : "";
  });
  const chosen = (() => {
    const a = attempt.answers[unit.key];
    return Array.isArray(a) ? a : a ? [a] : [];
  })();
  const unanswered = outcome === "unanswered";
  const words = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return player("duration", { minutes: Math.floor(s / 60), seconds: s % 60 });
  };

  const noAnswer = (
    <>
      <p className="flex items-start gap-2">
        <OutcomeIcon outcome="unanswered" />
        {t("review.noAnswerGiven")}
      </p>
      {signals.some((s) => s.code === "timeUp") && (
        <Note>{t("signals.timeUp")}</Note>
      )}
      {signals.some((s) => s.code === "notReached") && (
        <Note>{l("signals.notReached")}</Note>
      )}
    </>
  );

  // --- The question in its context ----------------------------------------
  const options = unitOptions(unit);
  const optionText = (id: string) =>
    options.find((o) => o.id === id)?.text ?? "";
  const choice =
    unit.group.type === "multipleChoice" ||
    unit.group.type === "multipleChoiceMulti";
  const letter = (id: string) => (
    <span lang="en">
      <span className="font-bold">{id}</span>
      {optionText(id) && optionText(id) !== id && ` ${optionText(id)}`}
    </span>
  );
  const answerInPlace = (number: number) => {
    const i = unit.numbers.indexOf(number);
    if (i < 0)
      return (
        <span className="text-text-tertiary">
          ({number}) <span aria-hidden="true">______</span>
        </span>
      );
    const given = unit.kind === "text" ? typedAnswers[i] : chosen[0];
    const correct =
      unit.kind === "text"
        ? accept.some(
            (v) =>
              normalizeTypedAnswer(v) === normalizeTypedAnswer(given ?? ""),
          )
        : given !== undefined && accept.includes(given);
    const state: Outcome = !given
      ? "unanswered"
      : correct
        ? "correct"
        : "incorrect";
    return (
      <span
        aria-label={
          given
            ? l("review.yourAnswerInPlace", { number, answer: given })
            : `${number}, ${t("review.unanswered")}`
        }
        className={`mx-0.5 inline-flex items-center gap-1 rounded-sm px-3 py-0.5 align-baseline ${
          state === "correct"
            ? "border-2 border-status-correct"
            : state === "incorrect"
              ? "border-2 border-dashed border-ink"
              : "border border-dashed border-text-secondary"
        }`}
      >
        <span className="font-bold">{number}</span>
        <OutcomeIcon outcome={state} size={16} />
        {given ? <span>{given}</span> : <span>{t("review.unanswered")}</span>}
      </span>
    );
  };
  const line = (segs: GapSegment[]) =>
    segs.map((s, i) =>
      "gap" in s ? (
        <Fragment key={i}>{answerInPlace(s.gap)}</Fragment>
      ) : (
        <Fragment key={i}>{s.text}</Fragment>
      ),
    );
  const context = gapContext(unit.group, unit.numbers[0] ?? 0);

  const question = (() => {
    const g = unit.group;
    if (g.type === "multipleChoice") {
      const q = g.questions.find((x) => x.number === unit.numbers[0]);
      return q && <p className="font-bold">{q.stem}</p>;
    }
    if (g.type === "multipleChoiceMulti") {
      const item = g.items.find((x) => x.numbers[0] === unit.numbers[0]);
      return item && <p className="font-bold">{item.stem}</p>;
    }
    if (g.type === "matchingFeatures") {
      const q = g.questions.find((x) => x.number === unit.numbers[0]);
      return q && <p className="font-bold">{q.statement}</p>;
    }
    if (g.type === "shortAnswer") {
      const q = g.questions.find((x) => x.numbers[0] === unit.numbers[0]);
      return q && <p className="font-bold">{q.question}</p>;
    }
    if (g.type === "labelling") {
      const q = g.questions.find((x) => x.number === unit.numbers[0]);
      return (
        <>
          <LabelledPicture
            src={mediaUrl(test, g.image.src)}
            image={g.image}
            markers={g.markers}
            currentQuestion={unit.numbers[0]}
            labels={{
              enlarge: picture("enlarge"),
              zoomIn: picture("zoomIn"),
              zoomOut: picture("zoomOut"),
              close: picture("close"),
            }}
          />
          {q?.prompt && <p className="mt-3 font-bold">{q.prompt}</p>}
        </>
      );
    }
    if (!context) return undefined;
    if (context.kind === "line")
      return (
        <p className="leading-loose">
          {context.label && (
            <span className="block text-meta font-bold text-text-secondary">
              {context.label}
            </span>
          )}
          {line(context.segments)}
        </p>
      );
    if (context.kind === "lines")
      return (
        <div className="rounded-md border border-border-subtle px-4 py-3 shadow-soft">
          {context.lines.map((ls, i) => (
            <p key={i} className="leading-loose">
              {line(ls)}
            </p>
          ))}
        </div>
      );
    return (
      <div className="rounded-md bg-surface-warm px-4 py-3">
        {context.heading && (
          <p className="font-bold">{line(context.heading)}</p>
        )}
        {context.cells.map((cell, i) => (
          <div key={i} className="mt-2">
            <p className="text-meta font-bold text-text-secondary">
              {cell.column}
            </p>
            <p className="leading-loose">{line(cell.segments)}</p>
          </div>
        ))}
      </div>
    );
  })();

  const answers = choice ? (
    <>
      {unanswered && noAnswer}
      <OptionList options={options} chosen={chosen} accept={accept} />
    </>
  ) : unit.kind === "text" ? (
    <dl className="flex flex-col gap-2">
      <div>
        <dt className="font-bold">{t("review.yourAnswer")}</dt>
        {unanswered ? (
          <dd>{noAnswer}</dd>
        ) : (
          typedAnswers
            .filter((a) => a.trim() !== "")
            .map((a, i) => (
              <dd key={i} lang="en" className="font-passage text-passage">
                {a}
              </dd>
            ))
        )}
      </div>
      <div>
        <dt className="font-bold">{t("review.correctAnswer")}</dt>
        {entries.map((e, i) => (
          <dd key={i} lang="en" className="font-passage text-passage">
            {e.accept[0]}
          </dd>
        ))}
      </div>
      {entries.some((e) => e.accept.length > 1) && (
        <div>
          <dt className="font-bold">{t("review.alsoAccepted")}</dt>
          {entries.flatMap((e) =>
            e.accept.slice(1).map((v) => (
              <dd key={v} lang="en" className="font-passage text-passage">
                {v}
              </dd>
            )),
          )}
        </div>
      )}
    </dl>
  ) : (
    <dl className="flex flex-col gap-2">
      <div>
        <dt className="font-bold">{t("review.yourAnswer")}</dt>
        <dd>{unanswered ? noAnswer : letter(chosen[0] ?? "")}</dd>
      </div>
      <div>
        <dt className="font-bold">{t("review.correctAnswer")}</dt>
        <dd>{letter(accept[0] ?? "")}</dd>
      </div>
    </dl>
  );

  // --- Notes ----------------------------------------------------------------
  const variants = entries.flatMap((e) => e.accept.map(normalizeTypedAnswer));
  const notes = signals.flatMap((s): ReactNode[] => {
    switch (s.code) {
      case "oneLetterAway":
      case "wordLimit":
        return [t(`signals.${s.code}`)];
      case "sameDigitsDifferentForm":
        return [l("signals.sameDigits")];
      case "teenTyNumber":
        return [
          l.rich("signals.teenTyNumber", {
            en,
            yours: typedAnswers.find((a) => a.trim() !== "") ?? "",
            answer: accept[0] ?? "",
          }),
        ];
      case "notInTranscript": {
        const word = typedAnswers
          .map((a) =>
            wordNotInTranscript(
              transcript,
              unit,
              normalizeTypedAnswer(a),
              variants,
            ),
          )
          .find((w) => w !== undefined);
        return word
          ? [
              l.rich("signals.notInTranscript", {
                en,
                word,
                part: unit.partNumber,
              }),
            ]
          : [];
      }
      case "mentionedOption": {
        const d = mentionedBy(
          entries,
          unit.kind === "text" ? typedAnswers : chosen,
          normalizeTypedAnswer,
        );
        const at = d && segmentById(d.segment);
        const answerAt = heard[0]?.segment;
        return d && at && answerAt
          ? [
              l.rich("signals.mentionedOption", {
                en,
                option:
                  "option" in d
                    ? `${d.option} ${optionText(d.option)}`.trim()
                    : d.text,
                mentionedAt: clock(at.startMs),
                answerAt: clock(answerAt.startMs),
              }),
            ]
          : [];
      }
      default:
        // timeUp and notReached are told with "No answer".
        return [];
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p lang="en" className="text-text-secondary">
          {unit.group.instruction}
        </p>
        {question && <div lang="en">{question}</div>}
        <div className="flex flex-col gap-2">{answers}</div>
      </div>

      {heard.length > 0 && (
        <section aria-labelledby="evidence-heading">
          <h3 id="evidence-heading" className="text-heading-3 font-bold">
            {l("review.evidenceTitle")}
          </h3>
          <ul className="mt-2 flex flex-col gap-4">
            {heard.map((h) => (
              <li key={h.segment.id}>
                <EvidenceItem
                  excerpt={!desktop}
                  heard={h}
                  partNumber={unit.partNumber}
                  playing={playing === h.segment.id}
                  available={audioAvailable}
                  words={words}
                  onPlay={() =>
                    onPlay(evidenceStretch(h.segment), h.segment.id)
                  }
                  onPause={onPause}
                />
              </li>
            ))}
          </ul>
          <div className={desktop ? "hidden" : "mt-4"}>
            <button
              type="button"
              aria-expanded={showTranscript}
              aria-controls="part-transcript"
              onClick={() => setShowTranscript(!showTranscript)}
              className={QUIET_BUTTON}
            >
              {showTranscript
                ? l("review.transcriptHide")
                : l("review.transcriptShow", { part: unit.partNumber })}
              <ChevronGlyph up={showTranscript} />
            </button>
          </div>
          {showTranscript && !desktop && (
            <section
              id="part-transcript"
              aria-label={l("review.transcriptTitle", {
                part: unit.partNumber,
              })}
              className="mt-2"
            >
              <TranscriptRows
                segments={segments}
                evidence={heard}
                evidenceIds={evidenceIds}
                available={audioAvailable}
                onPlay={(segment) =>
                  onPlay({ fromMs: segment.startMs }, segment.id)
                }
              />
            </section>
          )}
        </section>
      )}

      {explanation && (
        <section>
          <h3 className="text-heading-3 font-bold">{t("review.why")}</h3>
          <p className="mt-2">
            <Segments segments={explanation.explanation} at={segmentById} />
          </p>
          <div className="mt-3">
            <SecondaryButton
              expanded={simpler}
              onClick={() => setSimpler(!simpler)}
            >
              {simpler ? t("review.simplerHide") : t("review.simpler")}
            </SecondaryButton>
          </div>
          {simpler && (
            <div className="mt-3 border-s-4 border-ink ps-3">
              <p className="font-bold">{t("review.simplerTitle")}</p>
              <p className="mt-1">
                <Segments segments={explanation.simpler} at={segmentById} />
              </p>
            </div>
          )}
        </section>
      )}

      {notes.length > 0 && (
        <ul className="flex flex-col gap-2">
          {notes.map((note, i) => (
            <li key={i}>
              <Note>{note}</Note>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The options a choice, matching or labelling unit offers, with their texts. */
function unitOptions(unit: Card["unit"]): Option[] {
  const g = unit.group;
  switch (g.type) {
    case "multipleChoice":
      return (
        g.questions.find((q) => q.number === unit.numbers[0])?.options ?? []
      );
    case "multipleChoiceMulti":
      return (
        g.items.find((i) => i.numbers[0] === unit.numbers[0])?.options ?? []
      );
    case "matchingFeatures":
      return g.options;
    case "labelling":
      return g.answer.kind === "choose"
        ? g.answer.options
        : g.markers.flatMap((m) =>
            m.option
              ? [{ id: m.option, text: m.label === m.option ? "" : m.label }]
              : [],
          );
    case "shortAnswer":
      return [];
    default:
      return "answer" in g && g.answer.kind === "choose"
        ? g.answer.options
        : [];
  }
}

/** "Heard in Part 2 at 3:14", "Play from 3:14" and the excerpt with the evidence marked. */
function EvidenceItem({
  excerpt,
  heard,
  partNumber,
  playing,
  available,
  words,
  onPlay,
  onPause,
}: {
  /** The transcript excerpt under the button (phones; desktop shows the column). */
  excerpt: boolean;
  heard: HeardEvidence;
  partNumber: number;
  playing: boolean;
  available: boolean;
  words: (ms: number) => string;
  onPlay: () => void;
  onPause: () => void;
}) {
  const l = useTranslations("listening");
  const { segment } = heard;
  const time = clock(segment.startMs);
  return (
    <>
      <p className="flex items-center gap-2 font-bold tabular-nums">
        <span className="text-skill-listening">
          <ListeningIcon />
        </span>
        {l("review.heardAt", { part: partNumber, time })}
      </p>
      <div className="mt-2">
        <SecondaryButton
          disabled={!available}
          ariaLabel={
            playing
              ? l("review.playingEvidence")
              : l("review.playFromName", {
                  part: partNumber,
                  time: words(segment.startMs),
                })
          }
          onClick={playing ? onPause : onPlay}
        >
          <LineIcon className="size-4">
            {playing ? (
              <path d="M5.5 3.5v9M10.5 3.5v9" />
            ) : (
              <path d="M5 3.5v9l7.5-4.5z" />
            )}
          </LineIcon>
          <span className="tabular-nums">
            {playing
              ? l("review.playingEvidence")
              : l("review.playFrom", { time })}
          </span>
        </SecondaryButton>
      </div>
      {!available && (
        <p className="mt-1 text-meta text-text-secondary">
          {l("review.audioUnavailable")}
        </p>
      )}
      {excerpt && (
        <blockquote className="mt-3 rounded-md bg-surface-warm px-4 py-3">
          <p className="text-meta font-bold text-text-secondary">
            <span lang="en">{segment.speaker}</span>
            <span className="font-normal tabular-nums"> · {time}</span>
          </p>
          <p lang="en" className="mt-1 font-passage text-passage">
            <Marked text={segment.text} quotes={heard.quotes} />
          </p>
        </blockquote>
      )}
    </>
  );
}

/** The evidence phrase: the highlight fill and the dotted evidence underline (V1). */
function Marked({ text, quotes }: { text: string; quotes: string[] }) {
  const l = useTranslations("listening");
  return markQuotes(text, quotes).map((part, i) =>
    part.mark ? (
      <mark
        key={i}
        aria-description={l("review.evidenceMark")}
        className="bg-highlight text-ink underline decoration-ink decoration-dotted decoration-2 underline-offset-4"
      >
        {part.text}
      </mark>
    ) : (
      <Fragment key={i}>{part.text}</Fragment>
    ),
  );
}

export function TranscriptRows({
  segments,
  evidence,
  evidenceIds,
  available,
  onPlay,
}: {
  segments: Segment[];
  evidence: HeardEvidence[];
  evidenceIds: Set<string>;
  available: boolean;
  onPlay: (segment: Segment) => void;
}) {
  const l = useTranslations("listening");
  return (
    <ol className="flex flex-col gap-3">
      {segments.map((segment) => {
        const isEvidence = evidenceIds.has(segment.id);
        const narrator = segment.speaker === "Narrator";
        return (
          <li
            key={segment.id}
            data-segment={segment.id}
            className={`grid grid-cols-[4.5rem_1fr] gap-2 ${isEvidence ? "border-s-4 border-ink ps-2" : ""}`}
          >
            <button
              type="button"
              disabled={!available}
              aria-label={l("review.segmentPlay", {
                time: clock(segment.startMs),
              })}
              onClick={() => onPlay(segment)}
              className={`${QUIET_BUTTON} -ms-3 min-h-11 justify-start text-meta text-text-secondary tabular-nums`}
            >
              <LineIcon className="size-4">
                <path d="M5 3.5v9l7.5-4.5z" />
              </LineIcon>
              {clock(segment.startMs)}
            </button>
            <div lang="en">
              <p className="text-meta font-bold text-text-secondary">
                {segment.speaker}
              </p>
              <p
                className={`font-passage text-passage ${narrator ? "text-text-secondary" : ""}`}
              >
                {isEvidence ? (
                  <Marked
                    text={segment.text}
                    quotes={
                      evidence.find((e) => e.segment.id === segment.id)
                        ?.quotes ?? []
                    }
                  />
                ) : (
                  segment.text
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The options of a choice question, read-only (a list, not controls), each
 * marked one with its own label, so nothing depends on the boundary's color.
 */
function OptionList({
  options,
  chosen,
  accept,
}: {
  options: Option[];
  chosen: string[];
  accept: string[];
}) {
  const t = useTranslations("reading.review");
  return (
    <ul className="flex flex-col gap-2">
      {options.map((option) => {
        const isChosen = chosen.includes(option.id);
        const isAccepted = accept.includes(option.id);
        const mark: OptionMark | undefined = isChosen
          ? isAccepted
            ? "yourAnswerCorrect"
            : "yourAnswerIncorrect"
          : isAccepted
            ? "correctAnswer"
            : undefined;
        return (
          <li
            key={option.id}
            className={`rounded-md bg-surface-base px-4 py-3 font-medium ${
              mark ? MARK_STYLE[mark] : "border border-border-subtle"
            }`}
          >
            <span lang="en">
              <span className="font-bold">{option.id}</span> {option.text}
            </span>
            {mark && (
              <span className="mt-1 flex items-center gap-2 font-bold">
                <OutcomeIcon outcome={MARK_ICON[mark]} />
                {t(mark)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Segments({
  segments,
  at,
}: {
  segments: ExplanationSegment[];
  at: (id: string) => Segment | undefined;
}) {
  return segments.map((segment, i) =>
    "en" in segment ? (
      <span key={i} lang="en">
        {segment.en}
      </span>
    ) : "at" in segment ? (
      <span key={i} className="tabular-nums">
        {clock(at(segment.at)?.startMs ?? 0)}
      </span>
    ) : (
      <Fragment key={i}>{segment.text}</Fragment>
    ),
  );
}

function ChevronGlyph({ up }: { up: boolean }) {
  return (
    <LineIcon className="size-4">
      <path d={up ? "m4 10 4-4 4 4" : "m4 6 4 4 4-4"} />
    </LineIcon>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2">
      <InfoIcon />
      <span>{children}</span>
    </p>
  );
}
