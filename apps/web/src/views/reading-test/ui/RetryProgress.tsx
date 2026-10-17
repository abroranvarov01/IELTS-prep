import { useTranslations } from "next-intl";
import { sessionNumbers, unitOf, useReading } from "@/entities/reading";

/** "3 of 13 to practise" in a retry, counted in question numbers (positions). */
export function RetryProgress() {
  const t = useTranslations("reading");
  const { units, session } = useReading();
  if (!session.retry) return null;
  const numbers = sessionNumbers(session);
  const first = unitOf(units, session.currentQuestion)?.numbers[0];
  return (
    <p className="text-meta text-text-secondary">
      {t("retry.progress", {
        current: first === undefined ? 1 : numbers.indexOf(first) + 1,
        total: numbers.length,
      })}
    </p>
  );
}
