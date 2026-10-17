import type { ReactNode } from "react";
import { CheckIcon, ChevronIcon } from "@/shared/ui/icons";
import { Illustration } from "@/shared/ui/illustrations";

export type Answer = {
  value: string;
  label: string;
  /** What screen readers say instead of `label`, e.g. "8 or higher" for "8+". */
  spokenLabel?: string;
  /** Who the path is for (exam types). */
  description?: string;
  /** The icon of a path (exam types). */
  illustration?: ReactNode;
};

type AnswerListProps = {
  /** The form field the chosen answer is submitted as. */
  name: string;
  /**
   * How the main answers look: two path cards with an icon and who each is
   * for (exam type), or a grid of band values (target band).
   */
  layout: "paths" | "bands";
  answers: Answer[];
  /** What the chosen answer means, shown between the answers and the fallback. */
  note?: ReactNode;
  /** "I don't know yet": a full answer, shown quieter under the main ones. */
  fallback?: Answer;
  /** The earlier answer, marked when the user comes back to the step. */
  selected?: string;
  selectedLabel: string;
  /** The id of the question heading that labels the answers. */
  labelledBy: string;
  action: (form: FormData) => void | Promise<void>;
};

/**
 * One tap answers: every answer is a submit button, not a radio button, so
 * moving with the keyboard never answers by accident (USER_FLOWS.md). The
 * earlier answer is marked by its look and a check, and named for screen
 * readers, never by color alone (DESIGN_SYSTEM.md, Onboarding composition).
 */
export function AnswerList({
  name,
  layout,
  answers,
  note,
  fallback,
  selected,
  selectedLabel,
  labelledBy,
  action,
}: AnswerListProps) {
  const isSelected = (answer: Answer) => answer.value === selected;
  // The description is announced as the button's description, so its name
  // stays the answer itself ("Academic").
  const descriptionId = (answer: Answer) => `${name}-${answer.value}-about`;
  const button = (answer: Answer, look: string, content: ReactNode) => (
    <button
      type="submit"
      name={name}
      value={answer.value}
      aria-describedby={answer.description ? descriptionId(answer) : undefined}
      className={`transition-colors ${look}`}
    >
      {content}
      {isSelected(answer) && (
        <>
          {/* The space keeps the spoken name two words: "Academic Selected". */}{" "}
          <span className="sr-only">{selectedLabel}</span>
        </>
      )}
    </button>
  );
  const label = (answer: Answer) =>
    answer.spokenLabel ? (
      <>
        <span aria-hidden="true">{answer.label}</span>
        <span className="sr-only">{answer.spokenLabel}</span>
      </>
    ) : (
      answer.label
    );

  const main =
    layout === "paths" ? (
      <ul className="grid gap-3 tablet:grid-cols-2 desktop:gap-4">
        {answers.map((answer) => (
          <li key={answer.value} className="flex">
            {button(
              answer,
              `relative flex w-full items-center gap-4 rounded-lg border p-4 text-start desktop:flex-col desktop:items-start desktop:gap-6 desktop:p-6 ${
                isSelected(answer)
                  ? "border-brand-primary bg-brand-blush-soft"
                  : "border-border-subtle bg-surface-base hover:border-brand-blush active:bg-brand-blush-soft"
              }`,
              <>
                {isSelected(answer) && (
                  <span
                    aria-hidden="true"
                    className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-brand-primary text-surface-base"
                  >
                    <CheckIcon className="size-4" />
                  </span>
                )}
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-full desktop:size-16 ${
                    isSelected(answer)
                      ? "bg-brand-primary text-surface-base"
                      : "bg-brand-blush-soft text-brand-primary-deep"
                  }`}
                >
                  {answer.illustration}
                </span>
                <span className="flex flex-col gap-1 pe-6 desktop:pe-[0]">
                  <span className="text-heading-3 font-bold">
                    {label(answer)}
                  </span>
                  {answer.description && (
                    <span
                      id={descriptionId(answer)}
                      aria-hidden="true"
                      className="text-meta text-text-secondary"
                    >
                      {answer.description}
                    </span>
                  )}
                </span>
              </>,
            )}
          </li>
        ))}
      </ul>
    ) : (
      <ul className="grid grid-cols-3 gap-3 tablet:grid-cols-5">
        {answers.map((answer) => (
          <li key={answer.value} className="flex">
            {button(
              answer,
              `relative flex min-h-[3.5rem] w-full items-center justify-center rounded-md border text-heading-2 font-bold tabular-nums ${
                isSelected(answer)
                  ? "border-brand-primary bg-brand-primary text-surface-base"
                  : "border-border-subtle bg-surface-base hover:border-brand-blush active:bg-brand-blush-soft"
              }`,
              <>
                {isSelected(answer) && (
                  <CheckIcon className="absolute top-1 right-1 size-4" />
                )}
                {label(answer)}
              </>,
            )}
          </li>
        ))}
      </ul>
    );

  return (
    <form action={action}>
      <div role="group" aria-labelledby={labelledBy}>
        {main}
        {note && <div className="mt-4 desktop:mt-6">{note}</div>}
        {fallback && (
          <div className="mt-4 desktop:mt-6">
            {button(
              fallback,
              `-ms-3 inline-flex min-h-12 items-center gap-2 rounded-md px-3 text-start font-medium ${
                isSelected(fallback)
                  ? "bg-surface-base ring-1 ring-ink ring-inset"
                  : "hover:bg-brand-blush-soft active:bg-brand-blush-soft"
              }`,
              <>
                <Illustration className="size-6 text-text-secondary">
                  <circle cx="12" cy="12" r="8.25" />
                  <path d="M9.75 9.75a2.25 2.25 0 1 1 3.15 2.06c-.55.24-.9.75-.9 1.34v.35M12 16.25v.01" />
                </Illustration>
                {label(fallback)}
                {isSelected(fallback) ? (
                  <CheckIcon className="size-4" />
                ) : (
                  <ChevronIcon direction="right" className="size-4" />
                )}
              </>,
            )}
          </div>
        )}
      </div>
    </form>
  );
}
