import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { dueWarning, remainingMs, useReading } from "@/entities/reading";

// Shown bolder from this much time left (DESIGN_SYSTEM.md, M4: test bar).
const LOW_TIME_MS = 5 * 60_000;

/**
 * The Exam countdown in the test bar (READING_EXPERIENCE.md, Mobile reading
 * screen): `mm:ss`, announced only by the warnings at 10 and 5 minutes left.
 * It reads the device clock every second itself, so only the timer renders
 * again; the session finishes at 0:00 through the screen's own clock
 * (useReadingSession). Shown from its first reading of the clock.
 */
export function ExamTimer() {
  const t = useTranslations("reading");
  const { test, session } = useReading();
  const [now, setNow] = useState<number>();

  useEffect(() => {
    const read = () => setNow(Date.now());
    read();
    const timer = setInterval(read, 1000);
    return () => clearInterval(timer);
  }, []);

  const remaining =
    now === undefined ? undefined : remainingMs(session, test, now);
  if (remaining === undefined) return null;
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
