import type { ReactNode } from "react";
import { AccentPanel } from "@/shared/ui/AccentPanel";
import { CheckIcon, ChevronIcon } from "@/shared/ui/icons";
import { Illustration } from "@/shared/ui/illustrations";

export type Answer = {
  value: string;
  label: string;
  /** What screen readers say instead of `label`, e.g. "8 or higher" for "8+". */
  spokenLabel?: string;
  /** The picture of a path (exam types). */
  illustration?: ReactNode;
};

type AnswerListProps = {
  /** The form field the chosen answer is submitted as. */
  name: string;
  /**
   * How the main answers look: two paths with a picture each (exam type), or
   * a row of band values (target band).
   */
  layout: "paths" | "bands";
  answers: Answer[];
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
 * earlier answer is marked by a check and named for screen readers, never by
 * color alone.
 */
export function AnswerList({
  name,
  layout,
  answers,
  fallback,
  selected,
  selectedLabel,
  labelledBy,
  action,
}: AnswerListProps) {
  const button = (answer: Answer, look: string, content: ReactNode) => (
    <button
      type="submit"
      name={name}
      value={answer.value}
      className={`relative transition-colors ${look}`}
    >
      {content}
      {answer.value === selected && (
        <>
          {/* The space keeps the spoken name two words: "Academic Selected". */}{" "}
          <span className="sr-only">{selectedLabel}</span>
          <span
            aria-hidden="true"
            className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-ink text-surface-base"
          >
            <CheckIcon className="size-4" />
          </span>
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
  const isSelected = (answer: Answer) => answer.value === selected;

  const main =
    layout === "paths" ? (
      <ul className="grid grid-cols-2 gap-3">
        {answers.map((answer) => (
          <li key={answer.value} className="flex">
            {button(
              answer,
              `flex w-full flex-col items-start gap-6 rounded-lg border p-4 text-start ${
                isSelected(answer)
                  ? "border-brand-primary bg-brand-blush-soft ring-1 ring-brand-primary ring-inset"
                  : "border-border-subtle bg-surface-base hover:border-brand-primary active:bg-brand-blush-soft"
              }`,
              <>
                <span
                  className={`flex size-16 items-center justify-center rounded-full ${
                    isSelected(answer)
                      ? "bg-brand-primary text-surface-base"
                      : "bg-brand-blush-soft text-brand-primary-deep"
                  }`}
                >
                  {answer.illustration}
                </span>
                <span className="text-heading-3 font-bold">
                  {label(answer)}
                </span>
              </>,
            )}
          </li>
        ))}
      </ul>
    ) : (
      <AccentPanel>
        <ul className="grid grid-cols-5 gap-2">
          {answers.map((answer) => (
            <li key={answer.value} className="flex">
              {button(
                answer,
                `flex min-h-16 w-full items-center justify-center rounded-md border text-heading-2 font-extrabold tabular-nums ${
                  isSelected(answer)
                    ? "border-brand-primary bg-brand-primary text-surface-base"
                    : "border-brand-blush bg-surface-base hover:border-brand-primary active:bg-brand-blush-soft"
                }`,
                label(answer),
              )}
            </li>
          ))}
        </ul>
      </AccentPanel>
    );

  return (
    <form action={action}>
      <div role="group" aria-labelledby={labelledBy}>
        {main}
        {fallback && (
          <div className="mt-4">
            {button(
              fallback,
              `flex min-h-12 w-full items-center gap-3 rounded-md px-4 text-start font-medium ${
                isSelected(fallback)
                  ? "bg-brand-blush-soft ring-1 ring-ink ring-inset"
                  : "hover:bg-brand-blush-soft active:bg-brand-blush-soft"
              }`,
              <>
                <Illustration className="size-6 text-text-secondary">
                  <circle cx="12" cy="12" r="8.25" />
                  <path d="M9.75 9.75a2.25 2.25 0 1 1 3.15 2.06c-.55.24-.9.75-.9 1.34v.35M12 16.25v.01" />
                </Illustration>
                <span className="flex-1">{label(fallback)}</span>
                <ChevronIcon direction="right" className="size-4" />
              </>,
            )}
          </div>
        )}
      </div>
    </form>
  );
}
