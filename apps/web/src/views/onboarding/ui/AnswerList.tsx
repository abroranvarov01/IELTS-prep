import type { ReactNode } from "react";
import { ArcMotif } from "@/shared/ui/ArcMotif";
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
   * a scale of band values (target band).
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
 * earlier answer is marked by its look and a check, and named for screen
 * readers, never by color alone (DESIGN_SYSTEM.md, Onboarding composition).
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
  const isSelected = (answer: Answer) => answer.value === selected;
  const button = (answer: Answer, look: string, content: ReactNode) => (
    <button
      type="submit"
      name={name}
      value={answer.value}
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
  const bandIndex = answers.findIndex(isSelected);

  const main =
    layout === "paths" ? (
      <ul className="grid grid-cols-2 gap-3 desktop:gap-4">
        {answers.map((answer) => (
          <li key={answer.value} className="flex">
            {button(
              answer,
              `relative flex min-h-[10rem] w-full flex-col items-start justify-between gap-6 overflow-hidden rounded-lg border p-4 text-start desktop:min-h-[13rem] desktop:p-6 ${
                isSelected(answer)
                  ? "border-brand-primary bg-brand-blush-soft"
                  : "border-border-subtle bg-surface-base hover:border-brand-primary active:bg-brand-blush-soft"
              }`,
              <>
                {isSelected(answer) && (
                  <>
                    <ArcMotif className="-top-12 -right-12 size-[8rem]" />
                    <CheckBadge />
                  </>
                )}
                <span
                  className={`relative flex size-12 items-center justify-center rounded-full desktop:size-16 ${
                    isSelected(answer)
                      ? "bg-brand-primary text-surface-base"
                      : "bg-brand-blush-soft text-brand-primary-deep"
                  }`}
                >
                  {answer.illustration}
                </span>
                <span className="relative text-heading-3 font-bold desktop:text-heading-2">
                  {label(answer)}
                </span>
              </>,
            )}
          </li>
        ))}
      </ul>
    ) : (
      <div>
        <ul className="grid grid-cols-5 gap-2 desktop:gap-3">
          {answers.map((answer) => (
            <li key={answer.value} className="flex">
              {button(
                answer,
                `relative flex min-h-16 w-full items-center justify-center rounded-lg border text-heading-2 font-extrabold tabular-nums desktop:min-h-[6rem] desktop:text-heading-1 ${
                  isSelected(answer)
                    ? "border-brand-primary bg-brand-primary text-surface-base"
                    : "border-border-subtle bg-surface-base hover:border-brand-primary hover:bg-brand-blush-soft active:bg-brand-blush-soft"
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
        {/* A scale under the bands, filled up to the chosen one. Decorative. */}
        <div
          aria-hidden="true"
          className="mt-3 h-1 rounded-full bg-border-subtle"
        >
          {bandIndex >= 0 && (
            <div
              className="h-1 rounded-full bg-brand-highlight"
              style={{ width: `${((bandIndex + 1) / answers.length) * 100}%` }}
            />
          )}
        </div>
      </div>
    );

  return (
    <form action={action}>
      <div role="group" aria-labelledby={labelledBy}>
        {main}
        {fallback && (
          <div className="mt-4">
            {button(
              fallback,
              `-ms-3 inline-flex min-h-12 items-center gap-3 rounded-md px-3 text-start font-medium ${
                isSelected(fallback)
                  ? "bg-brand-blush-soft ring-1 ring-ink ring-inset"
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

/** The chosen path's check, in the tile's top end corner. */
function CheckBadge() {
  return (
    <span
      aria-hidden="true"
      className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-brand-primary text-surface-base"
    >
      <CheckIcon className="size-4" />
    </span>
  );
}
