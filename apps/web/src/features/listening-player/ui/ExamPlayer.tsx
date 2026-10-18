"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { useIsDesktop } from "@/shared/ui/use-is-desktop";
import { ListeningIcon } from "@/shared/ui/icons";
import { SpeakerIcon } from "./icons";
import { useAudio } from "./use-audio";

export type ExamPlayerProps = {
  /** The part the clock says is playing, and its file (a blob: URL). */
  partNumber: number;
  src: string;
  /** Where the clock says the part is, in ms. */
  offsetMs: number;
  /** Whether the recording should be playing now (not paused, not checking). */
  running: boolean;
  onStall: () => void;
  onResume: () => void;
  onFailed: () => void;
};

/**
 * The Exam player (LISTENING_EXPERIENCE.md, The player): no pause, no
 * seeking, no speed. It follows the Exam clock (ADR-0013 §3): whenever
 * playback starts, it seeks to the clock's position. Buffering and any pause
 * the learner did not make are reported, so the clock can subtract them.
 */
export function ExamPlayer({
  partNumber,
  src,
  offsetMs,
  running,
  onStall,
  onResume,
  onFailed,
}: ExamPlayerProps) {
  const t = useTranslations("listening");
  const isDesktop = useIsDesktop();
  const { ref, status, positionMs, durationMs, play, pause, seek } = useAudio({
    src,
    onUnplannedPause: onFailed,
  });
  const offset = useRef(offsetMs);
  useEffect(() => {
    offset.current = offsetMs;
  }, [offsetMs]);

  // Start (or restart after a pause) at the clock's position.
  useEffect(() => {
    if (!running) {
      pause();
      return;
    }
    if (status === "paused") {
      seek(offset.current);
      void play().then((ok) => {
        if (!ok) onFailed();
      });
    }
  }, [running, status, src, play, pause, seek, onFailed]);

  const wasBuffering = useRef(false);
  useEffect(() => {
    if (status === "buffering") {
      wasBuffering.current = true;
      onStall();
    } else if (status === "playing" && wasBuffering.current) {
      wasBuffering.current = false;
      onResume();
    } else if (status === "failed") onFailed();
  }, [status, onStall, onResume, onFailed]);

  const share = durationMs ? Math.min(1, positionMs / durationMs) : 0;

  return (
    <section
      aria-label={t("player.label")}
      className="sticky top-12 z-10 border-b border-border-subtle bg-surface-base px-gutter py-2 desktop:py-4"
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- Captions of a Listening test are its transcript and would give the answers away (LISTENING_EXPERIENCE.md P4); owner exception, 2026-10-18. */}
      <audio ref={ref} src={src} preload="auto" />
      <div className="mx-auto flex min-h-[2.5rem] max-w-measure items-center gap-3">
        <span className="text-skill-listening">
          <ListeningIcon />
        </span>
        <p className="font-medium">
          {status === "loading" || status === "buffering"
            ? t("player.loading")
            : t("exam.playing", { number: partNumber })}
        </p>
        <div
          aria-hidden="true"
          className="h-1 flex-1 rounded-full bg-border-subtle"
        >
          <div
            className="h-1 rounded-full bg-skill-listening"
            style={{ width: `${share * 100}%` }}
          />
        </div>
        {isDesktop && (
          <label className="flex items-center gap-2">
            <SpeakerIcon />
            <span className="sr-only">{t("exam.volume")}</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              defaultValue={1}
              onChange={(event) => {
                if (ref.current)
                  ref.current.volume = Number(event.target.value);
              }}
              className="player-slider h-12 w-[8rem]"
            />
          </label>
        )}
      </div>
      {!isDesktop && (
        <p className="mx-auto max-w-measure text-meta text-text-secondary">
          {t("exam.deviceVolume")}
        </p>
      )}
    </section>
  );
}
