"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AudioStatus =
  "loading" | "paused" | "playing" | "buffering" | "ended" | "failed";

/**
 * One `<audio>` element and what the player needs from it (ADR-0013 §2):
 * its state, its position, and play, pause and seek. `onUnplannedPause`
 * reports a pause the learner did not make (the browser or the system),
 * which an Exam treats as an interruption (ADR-0013 §3). Background playback
 * is never assumed.
 */
export function useAudio({
  src,
  rate = 1,
  onUnplannedPause,
}: {
  src: string | undefined;
  rate?: number;
  onUnplannedPause?: () => void;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [status, setStatus] = useState<AudioStatus>("loading");
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const planned = useRef(false);
  const unplanned = useRef(onUnplannedPause);
  useEffect(() => {
    unplanned.current = onUnplannedPause;
  }, [onUnplannedPause]);

  useEffect(() => {
    const audio = ref.current;
    if (audio) audio.playbackRate = rate;
  }, [rate, src]);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;
    setStatus("loading");
    setPositionMs(0);
    const on = (event: string, handler: () => void) => {
      audio.addEventListener(event, handler);
      return () => audio.removeEventListener(event, handler);
    };
    const offs = [
      on("loadstart", () => setStatus("loading")),
      on("loadedmetadata", () => setDurationMs(audio.duration * 1000)),
      on("canplay", () => setStatus((s) => (s === "loading" ? "paused" : s))),
      on("playing", () => setStatus("playing")),
      on("waiting", () =>
        setStatus((s) => (s === "playing" ? "buffering" : s)),
      ),
      on("pause", () => {
        if (audio.ended) return;
        setStatus((s) => (s === "failed" ? s : "paused"));
        if (!planned.current) unplanned.current?.();
        planned.current = false;
      }),
      on("ended", () => setStatus("ended")),
      on("error", () => setStatus("failed")),
      on("timeupdate", () => setPositionMs(audio.currentTime * 1000)),
    ];
    return () => offs.forEach((off) => off());
  }, [src]);

  const play = useCallback(async () => {
    const audio = ref.current;
    if (!audio) return false;
    try {
      await audio.play();
      return true;
    } catch {
      // Not allowed yet (no tap) or not playable: the player stays paused.
      return false;
    }
  }, []);

  const pause = useCallback(() => {
    const audio = ref.current;
    if (!audio || audio.paused) return;
    planned.current = true;
    audio.pause();
  }, []);

  const seek = useCallback((ms: number) => {
    const audio = ref.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, ms / 1000);
    setPositionMs(Math.max(0, ms));
    setStatus((s) => (s === "ended" ? "paused" : s));
  }, []);

  return { ref, status, positionMs, durationMs, play, pause, seek };
}
