"use client";

import { useTranslations } from "next-intl";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronIcon, InfoIcon } from "@/shared/ui/icons";
import { QUIET_BUTTON } from "@/shared/ui/quiet-action";
import { clock, minutesAndSeconds } from "./format";
import { PauseIcon, PlayIcon, RestartIcon, SkipIcon } from "./icons";
import { useAudio } from "./use-audio";

const SKIP_MS = 5000;
/** Resuming starts a little earlier, so the last sentence is heard again. */
const RESUME_BACK_MS = 3000;
const SAVE_EVERY_MS = 5000;

export type PracticePlayerProps = {
  src: string;
  partNumber: number;
  /** Where the learner left this part, in ms. */
  savedPositionMs: number;
  speed: number;
  speeds: readonly number[];
  onPosition: (ms: number) => void;
  onSpeed: (speed: number) => void;
};

/**
 * The Practice player (LISTENING_EXPERIENCE.md, The player): play and pause,
 * 5 seconds back and forward, a position slider and speed. It never moves to
 * another part by itself and never starts without a tap.
 */
export function PracticePlayer({
  src,
  partNumber,
  savedPositionMs,
  speed,
  speeds,
  onPosition,
  onSpeed,
}: PracticePlayerProps) {
  const t = useTranslations("listening.player");
  const audio = useAudio({ src, rate: speed });
  const { ref, status, positionMs, durationMs, play, pause, seek } = audio;
  const [speedOpen, setSpeedOpen] = useState(false);
  const report = useRef(onPosition);
  useEffect(() => {
    report.current = onPosition;
  }, [onPosition]);

  // Resume where the learner left the part, a little earlier.
  const resumed = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (status !== "paused" || resumed.current === src) return;
    resumed.current = src;
    if (savedPositionMs > 0)
      seek(Math.max(0, savedPositionMs - RESUME_BACK_MS));
  }, [status, src, savedPositionMs, seek]);

  // Keep the position: while playing, on pause, and when the page is hidden.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const save = () => report.current(Math.round(element.currentTime * 1000));
    const timer =
      status === "playing"
        ? window.setInterval(save, SAVE_EVERY_MS)
        : undefined;
    if (status === "paused" && resumed.current === src) save();
    document.addEventListener("visibilitychange", save);
    window.addEventListener("pagehide", save);
    return () => {
      if (timer) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", save);
      window.removeEventListener("pagehide", save);
    };
  }, [status, src, ref]);

  const total = durationMs || 0;
  const words = (ms: number) => t("duration", minutesAndSeconds(ms));
  const waiting = status === "loading" || status === "buffering";

  return (
    <section
      aria-label={t("label")}
      className="sticky top-12 z-10 border-b border-border-subtle bg-surface-base px-gutter py-2 tablet:py-4"
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- Captions of a Listening test are its transcript and would give the answers away (LISTENING_EXPERIENCE.md P4); owner exception, 2026-10-18. */}
      <audio ref={ref} src={src} preload="auto" />
      <div className="mx-auto flex max-w-measure flex-col gap-1 tablet:flex-row-reverse tablet:items-center tablet:gap-3">
        <div className="flex flex-1 flex-col">
          <input
            type="range"
            min={0}
            max={Math.max(1, Math.round(total))}
            step={100}
            value={Math.min(Math.round(positionMs), Math.round(total))}
            disabled={status === "loading" || status === "failed"}
            aria-label={t("position")}
            aria-valuetext={t("valueText", {
              elapsed: words(positionMs),
              total: words(total),
            })}
            onChange={(event) => seek(Number(event.target.value))}
            style={
              {
                "--played": `${total ? (100 * positionMs) / total : 0}%`,
              } as CSSProperties
            }
            className="player-slider h-12 w-full"
          />
          <p
            className="flex justify-between text-meta text-text-secondary tabular-nums"
            aria-live="off"
          >
            {status === "ended" ? (
              <span className="font-bold text-ink">
                {t("ended", { number: partNumber })}
              </span>
            ) : waiting ? (
              <span>{t("loading")}</span>
            ) : (
              <span>{clock(positionMs)}</span>
            )}
            <span>{clock(total)}</span>
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 tablet:justify-start">
          <button
            type="button"
            className={QUIET_BUTTON}
            aria-label={t("back", { seconds: SKIP_MS / 1000 })}
            disabled={status === "loading" || status === "failed"}
            onClick={() => seek(positionMs - SKIP_MS)}
          >
            <SkipIcon direction="back" />
            <span aria-hidden="true" className="text-meta font-bold">
              {SKIP_MS / 1000}
            </span>
          </button>
          <button
            type="button"
            aria-label={
              status === "playing" || status === "buffering"
                ? t("pause")
                : status === "ended"
                  ? t("playAgain")
                  : t("play")
            }
            disabled={status === "loading" || status === "failed"}
            onClick={() => {
              if (status === "playing" || status === "buffering") pause();
              else {
                if (status === "ended") seek(0);
                void play();
              }
            }}
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-ink text-surface-base transition-colors hover:bg-text-secondary disabled:border disabled:border-border-subtle disabled:bg-surface-base disabled:text-text-tertiary"
          >
            {status === "playing" || status === "buffering" ? (
              <PauseIcon />
            ) : status === "ended" ? (
              <RestartIcon />
            ) : (
              <PlayIcon />
            )}
          </button>
          <button
            type="button"
            className={QUIET_BUTTON}
            aria-label={t("forward", { seconds: SKIP_MS / 1000 })}
            disabled={status === "loading" || status === "failed"}
            onClick={() => seek(Math.min(total, positionMs + SKIP_MS))}
          >
            <span aria-hidden="true" className="text-meta font-bold">
              {SKIP_MS / 1000}
            </span>
            <SkipIcon direction="forward" />
          </button>
          <div className="relative ms-auto tablet:ms-[0]">
            <button
              type="button"
              aria-expanded={speedOpen}
              onClick={() => setSpeedOpen((open) => !open)}
              aria-label={t("speed", { speed: `${speed}×` })}
              className={`${QUIET_BUTTON} font-bold`}
            >
              {speed}×
              <ChevronIcon direction="down" />
            </button>
            {speedOpen && (
              <ul
                aria-label={t("speedList")}
                className="absolute end-[0] top-full z-20 min-w-[8rem] rounded-md bg-surface-base p-1 shadow-raised"
              >
                {speeds.map((value) => (
                  <li key={value}>
                    <button
                      type="button"
                      aria-pressed={value === speed}
                      onClick={() => {
                        onSpeed(value);
                        setSpeedOpen(false);
                      }}
                      className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-sm px-3 hover:bg-brand-blush-soft ${value === speed ? "font-bold" : ""}`}
                    >
                      {value}×{value === speed && <CheckIcon />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      {status === "failed" && (
        <p className="mx-auto mt-2 flex max-w-measure items-start gap-2">
          <InfoIcon />
          <span>{t("failed")}</span>
          <button
            type="button"
            className="ms-auto underline underline-offset-4"
            onClick={() => ref.current?.load()}
          >
            {t("retry")}
          </button>
        </p>
      )}
    </section>
  );
}
