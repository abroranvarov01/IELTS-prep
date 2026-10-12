import { AnswerOption } from "@/shared/ui/AnswerOption";

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
        <ul className="flex flex-col gap-2">
          {answers.map((answer) => {
            return (
              <li key={answer.value}>
                <AnswerOption
                  type="submit"
                  name={name}
                  value={answer.value}
                  selected={answer.value === selected}
                  selectedLabel={selectedLabel}
                >
                  {answer.spokenLabel ? (
                    <>
                      <span aria-hidden="true">{answer.label}</span>
                      <span className="sr-only">{answer.spokenLabel}</span>
                    </>
                  ) : (
                    answer.label
                  )}
                </AnswerOption>
              </li>
            );
          })}
        </ul>
      </div>
    </form>
  );
}
