export type Answer = {
  value: string;
  label: string;
  /** What screen readers say instead of `label`, e.g. "8 or higher" for "8+". */
  spokenLabel?: string;
};

type AnswerListProps = {
  /** The form field the chosen answer is submitted as. */
  name: string;
  answers: Answer[];
  /** The earlier answer, marked when the user comes back to the step. */
  selected?: string;
  selectedLabel: string;
  /** The id of the question heading that labels the answers. */
  labelledBy: string;
  action: (form: FormData) => void | Promise<void>;
};

/**
 * One tap answers: every answer is a submit button, not a radio button, so
 * moving with the keyboard never answers by accident (USER_FLOWS.md).
 */
export function AnswerList({
  name,
  answers,
  selected,
  selectedLabel,
  labelledBy,
  action,
}: AnswerListProps) {
  return (
    <form action={action}>
      <div role="group" aria-labelledby={labelledBy}>
        <ul className="flex flex-col gap-3">
          {answers.map((answer) => {
            const isSelected = answer.value === selected;
            return (
              <li key={answer.value}>
                <button
                  type="submit"
                  name={name}
                  value={answer.value}
                  className={`flex min-h-12 w-full items-center justify-between gap-4 rounded-md border px-4 py-3 text-start font-medium transition-colors hover:border-ink active:bg-surface-warm ${
                    isSelected
                      ? "border-ink bg-brand-blush ring-1 ring-ink ring-inset"
                      : "border-border-control bg-surface-base"
                  }`}
                >
                  {answer.spokenLabel ? (
                    <>
                      <span aria-hidden="true">{answer.label}</span>
                      <span className="sr-only">{answer.spokenLabel}</span>
                    </>
                  ) : (
                    answer.label
                  )}
                  {isSelected && (
                    <>
                      {/* The space keeps the spoken name two words: "Academic Selected". */}{" "}
                      <span className="sr-only">{selectedLabel}</span>
                      {/* 20 px: the approved check size (DESIGN_SYSTEM.md, answer option). */}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 16 16"
                        className="size-[1.25rem] shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="m3 8 3.5 3.5L13 5" />
                      </svg>
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </form>
  );
}
