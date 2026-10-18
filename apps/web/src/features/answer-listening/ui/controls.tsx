"use client";

import { useTranslations } from "next-intl";
import { Fragment, type ReactNode } from "react";
import { type Answer, useListening } from "@/entities/listening";
import { exceedsWordLimit } from "@/entities/reading";
import type { GapAnswer } from "@/shared/content/shapes";
import type { GapSegment, WordLimit } from "@/shared/content/types";
import { OptionRow } from "@/shared/ui/OptionRow";

/**
 * The stored answer of a question, as text. A question outside the session's
 * units (a retry shows the rest of a group around its own) is locked.
 */
export function useAnswer(number: number) {
  const { session, units, send } = useListening();
  const unit = units.find((u) => u.numbers.includes(number));
  const stored = unit ? session.answers[unit.key] : undefined;
  return {
    unit,
    stored,
    locked: !unit,
    send: (answer: Answer) => send({ type: "answer", number, answer }),
  };
}

/**
 * Where a question sits on screen: it marks the current question with the
 * 4 px bar (DESIGN_SYSTEM.md, M8) and makes it current when the learner works
 * in it (LISTENING_EXPERIENCE.md, What every Listening question shows).
 */
export function QuestionBlock({
  numbers,
  children,
}: {
  numbers: number[];
  children: ReactNode;
}) {
  const { session, send } = useListening();
  const first = numbers[0] ?? 0;
  const current = numbers.includes(session.currentQuestion);
  return (
    <div
      data-question={first}
      onFocusCapture={() => {
        if (!current) send({ type: "goTo", number: first });
      }}
      className={`border-s-4 ps-3 ${current ? "border-ink" : "border-transparent"}`}
    >
      {children}
    </div>
  );
}

/** Choose one: option rows over a native radio group. */
export function ChoiceRows({
  number,
  legend,
  options,
}: {
  number: number;
  legend: ReactNode;
  options: { id: string; text: string }[];
}) {
  const t = useTranslations("reading");
  const { stored, send, locked } = useAnswer(number);
  return (
    <QuestionBlock numbers={[number]}>
      <fieldset disabled={locked}>
        <legend lang="en" className="font-bold">
          {legend}
        </legend>
        <div className="mt-3 flex flex-col gap-2" lang="en">
          {options.map((o) => (
            <OptionRow
              key={o.id}
              type="radio"
              name={`q${number}`}
              value={o.id}
              checked={stored === o.id}
              onChange={() => send(o.id)}
            >
              <span className="font-bold">{o.id}</span> {o.text}
            </OptionRow>
          ))}
        </div>
      </fieldset>
      {typeof stored === "string" && stored !== "" && (
        <button
          type="button"
          onClick={() => send("")}
          className="mt-2 underline underline-offset-4"
        >
          {t("answer.clear")}
        </button>
      )}
    </QuestionBlock>
  );
}

/** Choose several: checkbox rows, the others disabled at the limit. */
export function MultiRows({
  numbers,
  legend,
  options,
}: {
  numbers: number[];
  legend: ReactNode;
  options: { id: string; text: string }[];
}) {
  const t = useTranslations("reading");
  const { stored, send, locked } = useAnswer(numbers[0] ?? 0);
  const chosen = Array.isArray(stored) ? stored : [];
  const full = chosen.length >= numbers.length;
  return (
    <QuestionBlock numbers={numbers}>
      <fieldset>
        <legend lang="en" className="font-bold">
          {legend}
        </legend>
        <p className="mt-1 text-meta text-text-secondary">
          {t("answer.chosenCount", {
            count: chosen.length,
            total: numbers.length,
          })}
        </p>
        <div className="mt-3 flex flex-col gap-2" lang="en">
          {options.map((o) => {
            const on = chosen.includes(o.id);
            return (
              <OptionRow
                key={o.id}
                type="checkbox"
                name={`q${numbers[0]}`}
                value={o.id}
                checked={on}
                disabled={locked || (!on && full)}
                onChange={() =>
                  send(
                    on ? chosen.filter((id) => id !== o.id) : [...chosen, o.id],
                  )
                }
              >
                <span className="font-bold">{o.id}</span> {o.text}
              </OptionRow>
            );
          })}
        </div>
      </fieldset>
    </QuestionBlock>
  );
}

/** The shared list of a group's options, once, as English test content. */
export function OptionsBox({
  options,
}: {
  options: { id: string; text: string }[];
}) {
  return (
    <ul
      lang="en"
      className="flex flex-col gap-1 rounded-md bg-surface-warm px-4 py-3"
    >
      {options.map((o) => (
        <li key={o.id}>
          <span className="font-bold">{o.id}</span> {o.text}
        </li>
      ))}
    </ul>
  );
}

/**
 * Letter buttons (LISTENING_EXPERIENCE.md L2): one tap answers. A native
 * radio group; each letter's name carries its text.
 */
export function LetterChoice({
  number,
  label,
  options,
}: {
  number: number;
  label: ReactNode;
  options: { id: string; text: string }[];
}) {
  const t = useTranslations("reading");
  const { stored, send, locked } = useAnswer(number);
  return (
    <QuestionBlock numbers={[number]}>
      <fieldset disabled={locked}>
        <legend lang="en">
          <span className="font-bold">{number}</span> {label}
        </legend>
        <div className="mt-2 flex flex-wrap gap-1">
          {options.map((o) => (
            <label
              key={o.id}
              className="flex size-[2.75rem] cursor-pointer items-center justify-center rounded-sm border border-border-control bg-surface-base font-bold transition-colors hover:bg-brand-blush-soft has-checked:border-ink has-checked:bg-ink has-checked:text-surface-base has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink has-disabled:cursor-default has-disabled:border-border-subtle has-disabled:text-text-tertiary has-disabled:hover:bg-surface-base"
            >
              <input
                type="radio"
                name={`q${number}`}
                value={o.id}
                checked={stored === o.id}
                onChange={() => send(o.id)}
                aria-label={`${o.id}, ${o.text}`}
                lang="en"
                className="sr-only"
              />
              <span aria-hidden="true">{o.id}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {typeof stored === "string" && stored !== "" && (
        <button
          type="button"
          onClick={() => send("")}
          className="mt-1 text-meta underline underline-offset-4"
        >
          {t("answer.clear")}
        </button>
      )}
    </QuestionBlock>
  );
}

/**
 * A typed gap in its place in the text (LISTENING_EXPERIENCE.md L1): the
 * number before it, no spelling help, the Practice word-limit warning.
 */
export function GapField({
  number,
  limit,
}: {
  number: number;
  limit: WordLimit;
}) {
  const t = useTranslations("reading");
  const { session, send: sendEvent } = useListening();
  const { stored, send, locked } = useAnswer(number);
  const value = typeof stored === "string" ? stored : "";
  const current = session.currentQuestion === number;
  const warn = session.mode === "practice" && exceedsWordLimit(value, limit);
  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-1 align-middle">
      <span aria-hidden="true" className="font-bold">
        ({number})
      </span>
      <span data-question={number} className="inline-block">
        <input
          type="text"
          lang="en"
          aria-label={t("answer.label", { number })}
          value={value}
          disabled={locked}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-describedby={warn ? `limit-${number}` : undefined}
          onFocus={() => {
            if (!current) sendEvent({ type: "goTo", number });
          }}
          onChange={(event) => send(event.target.value)}
          onBlur={() => {
            if (value.trim() !== value) send(value.trim());
          }}
          className={`h-[2.75rem] w-[7rem] max-w-full rounded-sm border px-3 ${current ? "border-ink bg-brand-blush-soft" : "border-border-control bg-surface-base"} disabled:border-dashed`}
        />
      </span>
      {warn && (
        <span id={`limit-${number}`} className="block w-full text-meta">
          {t("wordLimit", { max: limit.words })}
        </span>
      )}
    </span>
  );
}

/** Text with its gaps: a field in place for typed gaps, the number for chosen ones. */
export function GapLine({
  segments,
  answer,
}: {
  segments: GapSegment[];
  answer: GapAnswer;
}) {
  return segments.map((segment, i) =>
    "gap" in segment ? (
      answer.kind === "typed" ? (
        <GapField key={i} number={segment.gap} limit={answer.wordLimit} />
      ) : (
        <span key={i} className="font-bold">
          ({segment.gap}) ______
        </span>
      )
    ) : (
      <Fragment key={i}>{segment.text}</Fragment>
    ),
  );
}
