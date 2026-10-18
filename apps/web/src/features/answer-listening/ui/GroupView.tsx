"use client";

import { useTranslations } from "next-intl";
import { Fragment, type ReactNode } from "react";
import { type QuestionGroup, groupNumbers } from "@/entities/listening";
import type { GapAnswer } from "@/shared/content/shapes";
import {
  ChoiceRows,
  GapField,
  GapLine,
  LetterChoice,
  MultiRows,
  OptionsBox,
} from "./controls";
import { FlowChartView, TableView } from "./layouts";
import { LabellingView } from "./LabellingView";

/**
 * A whole question group as the Listening screen shows it
 * (LISTENING_EXPERIENCE.md, What every Listening question shows): its
 * heading, instruction and title, then every question with its answer
 * control in place.
 */
export function GroupView({ group }: { group: QuestionGroup }) {
  const t = useTranslations("listening");
  const numbers = groupNumbers(group);
  const from = numbers[0] ?? 0;
  const to = numbers.at(-1) ?? from;
  return (
    <section
      aria-labelledby={`group-${group.id}`}
      className="flex flex-col gap-4"
    >
      <div>
        <h2 id={`group-${group.id}`} className="text-heading-3 font-bold">
          {from === to
            ? t("question", { number: from })
            : t("questionsRange", { from, to })}
        </h2>
        <p lang="en" className="mt-1">
          {group.instruction}
        </p>
        {"title" in group && group.title && (
          <p lang="en" className="mt-3 font-bold">
            {group.title}
          </p>
        )}
      </div>
      <GroupBody group={group} />
    </section>
  );
}

function GroupBody({ group }: { group: QuestionGroup }) {
  switch (group.type) {
    case "multipleChoice":
      return group.questions.map((q) => (
        <ChoiceRows
          key={q.number}
          number={q.number}
          legend={
            <>
              {q.number} {q.stem}
            </>
          }
          options={q.options}
        />
      ));
    case "multipleChoiceMulti":
      return group.items.map((item) => (
        <MultiRows
          key={item.numbers[0]}
          numbers={item.numbers}
          legend={
            <>
              {item.numbers.join("–")} {item.stem}
            </>
          }
          options={item.options}
        />
      ));
    case "matchingFeatures":
      return (
        <>
          <OptionsBox options={group.options} />
          {group.questions.map((q) => (
            <LetterChoice
              key={q.number}
              number={q.number}
              label={q.statement}
              options={group.options}
            />
          ))}
        </>
      );
    case "shortAnswer":
      return group.questions.map((q) => (
        <div key={q.numbers[0]} lang="en">
          <p className="font-bold">{q.question}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {q.numbers.map((n) => (
              <GapField key={n} number={n} limit={group.wordLimit} />
            ))}
          </div>
        </div>
      ));
    case "sentenceCompletion":
      return (
        <Completion answer={group.answer} numbers={groupNumbers(group)}>
          {group.sentences.map((s, i) => (
            <p key={i} className="leading-loose">
              <GapLine segments={s} answer={group.answer} />
            </p>
          ))}
        </Completion>
      );
    case "noteCompletion":
      return (
        <Completion answer={group.answer} numbers={groupNumbers(group)}>
          <ul className="flex flex-col gap-2">
            {group.lines.map((line, i) =>
              Array.isArray(line) ? (
                <li key={i} className="flex gap-2 leading-loose">
                  <span aria-hidden="true" className="text-text-secondary">
                    •
                  </span>
                  <span>
                    <GapLine segments={line} answer={group.answer} />
                  </span>
                </li>
              ) : (
                <li key={i} className="mt-2 font-bold">
                  {line.heading}
                </li>
              ),
            )}
          </ul>
        </Completion>
      );
    case "formCompletion":
      return (
        <Completion answer={group.answer} numbers={groupNumbers(group)}>
          <dl className="flex flex-col gap-3 tablet:grid tablet:grid-cols-[2fr_3fr] tablet:gap-x-4">
            {group.lines.map((line, i) => (
              <Fragment key={i}>
                <dt className="text-meta font-bold text-text-secondary tablet:text-body tablet:font-medium tablet:text-ink">
                  {line.label}
                </dt>
                <dd className="leading-loose">
                  <GapLine segments={line.value} answer={group.answer} />
                </dd>
              </Fragment>
            ))}
          </dl>
        </Completion>
      );
    case "tableCompletion":
      return (
        <Completion answer={group.answer} numbers={groupNumbers(group)}>
          <TableView table={group} answer={group.answer} />
        </Completion>
      );
    case "flowChartCompletion":
      return (
        <Completion answer={group.answer} numbers={groupNumbers(group)}>
          <FlowChartView chart={group} answer={group.answer} />
        </Completion>
      );
    case "labelling":
      return <LabellingView group={group} />;
  }
}

/**
 * The text of a completion group, English test content; when its gaps are
 * chosen from a list, the list and one letter row per gap follow it
 * (LISTENING_EXPERIENCE.md L7).
 */
function Completion({
  answer,
  numbers,
  children,
}: {
  answer: GapAnswer;
  numbers: number[];
  children: ReactNode;
}) {
  return (
    <>
      <div lang="en">{children}</div>
      {answer.kind === "choose" && (
        <>
          <OptionsBox options={answer.options} />
          {numbers.map((n) => (
            <LetterChoice
              key={n}
              number={n}
              label=""
              options={answer.options}
            />
          ))}
        </>
      )}
    </>
  );
}
