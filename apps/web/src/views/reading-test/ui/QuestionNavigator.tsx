"use client";

import { useTranslations } from "next-intl";
import { answeredNumbers, useReading } from "@/entities/reading";
import { LineIcon } from "@/shared/ui/icons";

/**
 * Every question of the test, grouped by passage, with its state shown by
 * shape and named in full for screen readers, never by color alone
 * (READING_EXPERIENCE.md, Mobile reading screen: the question navigator).
 */
export function QuestionNavigator({
  onChoose,
}: {
  onChoose: (number: number) => void;
}) {
  const t = useTranslations("reading");
  const { test, units, session } = useReading();
  const answered = answeredNumbers(session, test);

  return (
    <div className="flex flex-col gap-6">
      {test.passages.map((passage) => {
        const numbers = units
          .filter((unit) => unit.passageNumber === passage.number)
          .flatMap((unit) => unit.numbers);
        // A retry may leave a passage without questions.
        if (numbers.length === 0) return null;
        return (
          <section key={passage.id} aria-labelledby={`navigator-${passage.id}`}>
            <h3
              id={`navigator-${passage.id}`}
              className="text-heading-3 font-bold"
            >
              {t("navigator.passage", { number: passage.number })}
            </h3>
            {/* 44 px cells (DESIGN_SYSTEM.md, M4: question navigator). */}
            <ul className="mt-3 grid grid-cols-[repeat(auto-fill,2.75rem)] gap-1">
              {numbers.map((number) => (
                <li key={number} className="pb-2">
                  <NavigatorCell
                    number={number}
                    isAnswered={answered.has(number)}
                    isFlagged={session.flagged.includes(number)}
                    isCurrent={session.currentQuestion === number}
                    onChoose={onChoose}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/**
 * One 44 px question cell (DESIGN_SYSTEM.md, M4: question navigator), in the
 * navigator and in the desktop navigator bar.
 */
export function NavigatorCell({
  number,
  isAnswered,
  isFlagged,
  isCurrent,
  onChoose,
}: {
  number: number;
  isAnswered: boolean;
  isFlagged: boolean;
  isCurrent: boolean;
  onChoose: (number: number) => void;
}) {
  const t = useTranslations("reading");
  const states = [
    isAnswered ? t("navigator.answered") : t("navigator.unanswered"),
    ...(isFlagged ? [t("navigator.flagged")] : []),
    ...(isCurrent ? [t("navigator.current")] : []),
  ];

  return (
    <button
      type="button"
      aria-label={t("navigator.item", {
        number,
        states: states.join(", "),
      })}
      aria-current={isCurrent ? "true" : undefined}
      onClick={() => onChoose(number)}
      className={`relative flex size-[2.75rem] items-center justify-center rounded-sm font-bold tabular-nums ${
        isAnswered
          ? "bg-ink text-surface-base"
          : "border border-border-control bg-surface-base"
      } ${isCurrent ? "after:absolute after:-bottom-[7px] after:inset-x-[0] after:h-[3px] after:bg-ink" : ""}`}
    >
      {number}
      {isFlagged && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full border border-ink bg-surface-base text-ink"
        >
          <FlagIcon className="size-3 fill-current" />
        </span>
      )}
    </button>
  );
}

export function FlagIcon({ className }: { className: string }) {
  return (
    <LineIcon className={className}>
      <path d="M3.5 14.5v-12M3.5 2.5h8.5l-2 3.25 2 3.25H3.5" />
    </LineIcon>
  );
}
