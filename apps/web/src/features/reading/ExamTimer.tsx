import { useTranslations } from "next-intl";
import { dueWarning } from "@/domain/reading/session";

// Shown bolder from this much time left (DESIGN_SYSTEM.md, M4: test bar).
const LOW_TIME_MS = 5 * 60_000;

/**
 * The Exam countdown in the test bar (READING_EXPERIENCE.md, Mobile reading
 * screen): `mm:ss`, announced only by the warnings at 10 and 5 minutes left.
 */
export function ExamTimer({ remaining }: { remaining: number }) {
  const t = useTranslations("reading");
  const time = formatClock(remaining);
  const warning = dueWarning(remaining);

  return (
    <>
      <span
        role="timer"
        aria-label={t("timer.label", { time })}
        className={`tabular-nums ${remaining <= LOW_TIME_MS ? "font-extrabold" : "font-bold"}`}
      >
        {time}
      </span>
      <p aria-live="polite" className="sr-only">
        {warning !== undefined && t("timer.warning", { minutes: warning })}
      </p>
    </>
  );
}

/** Whole seconds left, rounded up, so 0:00 shows only when the time is up. */
function formatClock(remaining: number): string {
  const seconds = Math.ceil(remaining / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
}
