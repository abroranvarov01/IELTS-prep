"use client";

import { useTranslations } from "next-intl";
import {
  type ListeningSession,
  type ListeningTest,
  answeredNumbers,
} from "@/entities/listening";
import { InfoIcon } from "@/shared/ui/icons";
import { PrimaryLink } from "@/shared/ui/PrimaryLink";
import { TaskLayout } from "@/shared/ui/TaskLayout";
import { TestBar } from "./TestBar";

/**
 * The finished page until M9 checks answers (LISTENING_EXPERIENCE.md, The
 * finished page in M8): the answered count, the honest line, and an
 * interrupted Exam said so.
 */
export function FinishedPage({
  test,
  session,
  onStartAgain,
}: {
  test: ListeningTest;
  session: ListeningSession;
  onStartAgain: () => void;
}) {
  const t = useTranslations("listening.finished");
  const reading = useTranslations("reading");
  const common = useTranslations("common");
  const total = test.parts.length * 10;
  return (
    <>
      <TestBar />
      <main id="main" className="px-gutter">
        <TaskLayout>
          {session.finishReason === "timeUp" && (
            <p className="font-bold">{reading("finished.timeUp")}</p>
          )}
          <h1 className="text-heading-1 font-extrabold">{t("title")}</h1>
          <p className="mt-3">
            {t("answered", {
              answered: answeredNumbers(session, test).size,
              total,
            })}
          </p>
          {(session.exam?.interruptions ?? 0) > 0 && (
            <p className="mt-3 flex items-start gap-2">
              <InfoIcon />
              {t("interrupted")}
            </p>
          )}
          <p className="mt-3 flex items-start gap-2">
            <InfoIcon />
            {t("notChecked")}
          </p>
          <div className="mt-6">
            <PrimaryLink href="/">{common("goHome")}</PrimaryLink>
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={onStartAgain}
              className="underline underline-offset-4"
            >
              {reading("finished.again")}
            </button>
          </div>
        </TaskLayout>
      </main>
    </>
  );
}
