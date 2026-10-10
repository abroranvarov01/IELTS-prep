"use client";

import { useTranslations } from "next-intl";
import { answeredNumbers } from "@/domain/reading/session";
import { useReading } from "./reading-context";

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
              {numbers.map((number) => {
                const isAnswered = answered.has(number);
                const isFlagged = session.flagged.includes(number);
                const isCurrent = session.currentQuestion === number;
                const states = [
                  isAnswered
                    ? t("navigator.answered")
                    : t("navigator.unanswered"),
                  ...(isFlagged ? [t("navigator.flagged")] : []),
                  ...(isCurrent ? [t("navigator.current")] : []),
                ];
                return (
                  <li key={number} className="pb-2">
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
                          <FlagIcon className="size-3" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function FlagIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={className}
      fill="currentColor"
    >
      <path d="M4 2h1v12H4zM5.5 2.5h7l-2 3 2 3h-7z" />
    </svg>
  );
}
