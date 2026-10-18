"use client";

import { useTranslations } from "next-intl";
import { type ExamClock } from "@/entities/listening";
import { InfoIcon } from "@/shared/ui/icons";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { TaskLayout } from "@/shared/ui/TaskLayout";
import type { Download } from "./use-listening-session";
import { TestBar } from "./TestBar";

const MB = 1_000_000;
const mb = (bytes: number) => (bytes / MB).toFixed(1);

/**
 * Before an Exam plays (LISTENING_EXPERIENCE.md, Weak connections): the
 * download with its progress, then the one tap that starts the recording, or,
 * coming back to an Exam, "Continue the test" at the clock's position. The
 * tap is also the browser's permission to play sound.
 */
export function Preparing({
  download,
  clock,
  onRetry,
  onGo,
}: {
  download: Download;
  clock: ExamClock;
  onRetry: () => void;
  onGo: () => void;
}) {
  const t = useTranslations("listening");
  const resuming = clock.phase !== "notStarted";
  const progress =
    download.status === "loading" && download.progress
      ? download.progress
      : undefined;
  const share =
    download.status === "ready"
      ? 1
      : progress
        ? progress.loaded / progress.total
        : 0;

  return (
    <>
      <TestBar confirmExit={resuming} />
      <main id="main" className="px-gutter">
        <TaskLayout>
          <h1 className="text-heading-1 font-extrabold">
            {download.status === "ready" && resuming
              ? t("resume.title")
              : t("prepare.title")}
          </h1>
          {download.status === "failed" ? (
            <>
              <p className="mt-4 flex items-start gap-2">
                <InfoIcon />
                {t("prepare.failed")}
              </p>
              <div className="mt-6">
                <PrimaryButton onClick={onRetry}>
                  {t("player.retry")}
                </PrimaryButton>
              </div>
            </>
          ) : download.status === "ready" ? (
            <>
              <p className="mt-4">
                {resuming && clock.phase === "recording"
                  ? t("resume.body", {
                      part: clock.part,
                      time: clockText(clock.offsetMs),
                    })
                  : t("prepare.ready")}
              </p>
              <div className="mt-6">
                <PrimaryButton onClick={onGo}>
                  {resuming ? t("resume.continue") : t("prepare.start")}
                </PrimaryButton>
              </div>
            </>
          ) : (
            <>
              <div
                aria-hidden="true"
                className="mt-4 h-2 rounded-full bg-border-subtle"
              >
                <div
                  className="h-2 rounded-full bg-skill-listening"
                  style={{ width: `${share * 100}%` }}
                />
              </div>
              <p className="mt-2 tabular-nums" aria-live="polite">
                {progress
                  ? t("prepare.progress", {
                      loaded: mb(progress.loaded),
                      total: mb(progress.total),
                    })
                  : t("player.loading")}
              </p>
            </>
          )}
        </TaskLayout>
      </main>
    </>
  );
}

export function clockText(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
