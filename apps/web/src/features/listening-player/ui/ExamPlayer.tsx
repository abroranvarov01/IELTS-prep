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
  /** How far the part's audio actually played, in ms (ADR-0014 §2). */
  onPlayed: (partNumber: number, positionMs: number) => void;
};

/** How often coverage is reported while the audio plays (as the heartbeat). */
const REPORT_MS = 5000;

/**
 * The Exam player (LISTENING_EXPERIENCE.md, The player): no pause, no
 * seeking, no speed. It follows the Exam clock (ADR-0013 §3): whenever
 * playback starts, it seeks to the clock's position. Buffering and any pause
 * the learner did not make are reported, so the clock can subtract them.
 * So is how far the audio actually played: only progress made while playing,
 * never the position the clock seeks to (owner, M9-04 clarification).
 */
export function ExamPlayer({
  partNumber,
  src,
  offsetMs,
  running,
  onStall,
  onResume,
  onFailed,
  onPlayed,
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

  // A run of playback: where it started and how far it got. Reported every
  // few seconds while it plays, and when it stops or the part ends.
  const run = useRef<{ start: number; furthest: number }>(undefined);
  const reported = useRef(0);
  useEffect(() => {
    run.current = undefined;
    reported.current = 0;
  }, [src]);
  useEffect(() => {
    if (status === "playing") {
      run.current ??= { start: positionMs, furthest: positionMs };
      run.current.furthest = Math.max(run.current.furthest, positionMs);
      const { start, furthest } = run.current;
      if (furthest > start && furthest - reported.current >= REPORT_MS) {
        reported.current = furthest;
        onPlayed(partNumber, furthest);
      }
      return;
    }
    const done = run.current;
    run.current = undefined;
    if (!done) return;
    const end = status === "ended" ? durationMs : done.furthest;
    if (end > done.start && end > reported.current) {
      reported.current = end;
      onPlayed(partNumber, end);
    }
  }, [status, positionMs, durationMs, partNumber, onPlayed]);

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
