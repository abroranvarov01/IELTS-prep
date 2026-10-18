"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { InfoIcon } from "@/shared/ui/icons";
import { clock } from "./format";
import { PauseIcon, PlayIcon } from "./icons";
import { useAudio } from "./use-audio";

const SAVE_EVERY_MS = 1000;
/** A recording within this much of its end counts as heard to the end. */
const END_MARGIN_MS = 250;

export type CheckPlayerProps = {
  src: string;
  recordingNumber: number;
  /** Where the recording stopped, in ms: it continues from exactly here. */
  savedPositionMs: number;
  onPosition: (ms: number) => void;
  /** The learner paused: a tap on Pause, leaving the page or moving to the other recording while it played. */
  onLearnerPause: () => void;
  /** Playback stopped without the learner: the browser or system, a stall, a failure. */
  onInterruption: () => void;
};

/**
 * The level check's player (LISTENING_EXPERIENCE.md, The level check's
 * Listening section (M9); DESIGN_SYSTEM.md, Level check: two sections): each
 * recording plays once, with Pause, from exactly where it stopped and never
 * from earlier; no seeking, Back, Forward, replay or speed. The learner's
 * pauses and the stops they did not make are reported apart (LD20).
 */
export function CheckPlayer({
  src,
  recordingNumber,
  savedPositionMs,
  onPosition,
  onLearnerPause,
  onInterruption,
}: CheckPlayerProps) {
  const t = useTranslations("levelCheck.listening");
  const tPlayer = useTranslations("listening.player");
  const report = useRef({ onPosition, onLearnerPause, onInterruption });
  useEffect(() => {
    report.current = { onPosition, onLearnerPause, onInterruption };
  }, [onPosition, onLearnerPause, onInterruption]);
  const { ref, status, positionMs, durationMs, play, pause, seek } = useAudio({
    src,
    onUnplannedPause: () => report.current.onInterruption(),
  });

  // Continue exactly where the recording stopped, once it can play.
  const placed = useRef(false);
  useEffect(() => {
    if (status !== "paused" || placed.current) return;
    placed.current = true;
    if (savedPositionMs > 0) seek(savedPositionMs);
  }, [status, savedPositionMs, seek]);

  const total = durationMs || 0;
  const heard =
    status === "ended" ||
    (total > 0 && savedPositionMs >= total - END_MARGIN_MS);
  const started = savedPositionMs > 0 || positionMs > 0;

  // Keep the position while playing and whenever playback stops.
  const playing = status === "playing" || status === "buffering";
  useEffect(() => {
    const element = ref.current;
    if (!element || !placed.current) return;
    const save = () =>
      report.current.onPosition(
        status === "ended"
          ? Math.round(element.duration * 1000)
          : Math.round(element.currentTime * 1000),
      );
    if (!playing) {
      save();
      return;
    }
    const timer = window.setInterval(save, SAVE_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [playing, status, ref]);

  // A stall while playing and a failure after playback began are stops the
  // learner did not make; each is counted once.
  const stalled = useRef(false);
  useEffect(() => {
    if (status === "buffering" && !stalled.current) {
      stalled.current = true;
      report.current.onInterruption();
    } else if (status === "playing") stalled.current = false;
    if (status === "failed" && started) report.current.onInterruption();
  }, [status, started]);

  // Leaving the page, or this recording, while it plays is the learner's pause.
  const isPlaying = useRef(false);
  useEffect(() => {
    isPlaying.current = playing;
  }, [playing]);
  useEffect(() => {
    const element = ref.current;
    const leave = () => {
      if (!isPlaying.current || !element) return;
      isPlaying.current = false;
      pause();
      report.current.onPosition(Math.round(element.currentTime * 1000));
      report.current.onLearnerPause();
    };
    const hidden = () => {
      if (document.visibilityState === "hidden") leave();
    };
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pagehide", leave);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pagehide", leave);
      leave();
    };
  }, [ref, pause]);

  const label = playing
    ? tPlayer("pause")
    : started
      ? t("continue")
      : t("play");

  return (
    <section
      aria-label={tPlayer("label")}
      className="sticky top-12 z-10 border-b border-border-subtle bg-surface-base px-gutter py-2 tablet:py-4"
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- Captions of a Listening test are its transcript and would give the answers away (LISTENING_EXPERIENCE.md P4); owner exception, 2026-10-18. */}
      <audio ref={ref} src={src} preload="auto" />
      <div className="mx-auto flex min-h-[3.5rem] max-w-measure flex-wrap items-center gap-x-3 gap-y-1">
        {heard ? (
          <p className="text-meta font-bold">
            {t("ended", { number: recordingNumber })}
          </p>
        ) : (
          <button
            type="button"
            disabled={status === "loading" || status === "failed"}
            onClick={() => {
              if (playing) {
                pause();
                report.current.onLearnerPause();
              } else void play();
            }}
            className="group inline-flex min-h-12 items-center gap-3 font-medium disabled:text-text-tertiary"
          >
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-ink text-surface-base transition-colors group-hover:bg-text-secondary group-disabled:border group-disabled:border-border-subtle group-disabled:bg-surface-base group-disabled:text-text-tertiary">
              {playing ? <PauseIcon /> : <PlayIcon />}
            </span>
            {status === "loading" || status === "buffering"
              ? tPlayer("loading")
              : label}
          </button>
        )}
        <div className="flex min-w-[8rem] flex-1 items-center gap-3">
          <div
            aria-hidden="true"
            className="h-1 flex-1 rounded-full bg-border-subtle"
          >
            <div
              className="h-1 rounded-full bg-skill-listening"
              style={{
                width: `${total ? Math.min(100, (100 * (heard ? total : positionMs)) / total) : 0}%`,
              }}
            />
          </div>
          <p className="text-meta text-text-secondary tabular-nums">
            {clock(heard ? total : positionMs)} / {clock(total)}
          </p>
        </div>
      </div>
      {status === "failed" && (
        <p className="mx-auto mt-2 flex max-w-measure items-start gap-2">
          <InfoIcon />
          <span>{tPlayer("failed")}</span>
          <button
            type="button"
            className="ms-auto underline underline-offset-4"
            onClick={() => {
              placed.current = false;
              ref.current?.load();
            }}
          >
            {tPlayer("retry")}
          </button>
        </p>
      )}
    </section>
  );
}
