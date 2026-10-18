import { act, cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import en from "../../../../messages/en.json";
import { ExamPlayer, type ExamPlayerProps } from "./ExamPlayer";

let plays = 0;
beforeEach(() => {
  plays = 0;
  // A phone-width window (jsdom has no matchMedia).
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    plays++;
    Object.defineProperty(this, "paused", { value: false, configurable: true });
    this.dispatchEvent(new Event("playing"));
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    Object.defineProperty(this, "paused", { value: true, configurable: true });
    this.dispatchEvent(new Event("pause"));
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderExam(props: Partial<ExamPlayerProps> = {}) {
  const handlers = { onStall: vi.fn(), onResume: vi.fn(), onFailed: vi.fn() };
  const view = (p: Partial<ExamPlayerProps>) => (
    <NextIntlClientProvider locale="en" messages={en}>
      <ExamPlayer
        partNumber={2}
        src="blob:part-2"
        offsetMs={4000}
        running
        {...handlers}
        {...p}
      />
    </NextIntlClientProvider>
  );
  const { rerender } = render(view(props));
  const audio = document.querySelector("audio") as HTMLAudioElement;
  const ready = () =>
    act(() => {
      audio.dispatchEvent(new Event("canplay"));
    });
  return {
    audio,
    ready,
    handlers,
    rerender: (p: Partial<ExamPlayerProps>) =>
      rerender(view({ ...props, ...p })),
  };
}

describe("the Exam player", () => {
  it("has no controls: no play, pause, seeking or speed", () => {
    const { ready } = renderExam();
    ready();
    expect(screen.queryByRole("button")).toBeNull();
    expect(
      screen.queryByRole("slider", { name: "Position in the recording" }),
    ).toBeNull();
    expect(screen.getByText("Recording: Part 2")).toBeTruthy();
  });

  it("starts at the clock's position as soon as the part can play", () => {
    const { audio, ready } = renderExam({ offsetMs: 4000 });
    ready();
    expect(audio.currentTime).toBe(4);
    expect(plays).toBe(1);
  });

  it("does not play while the clock is paused", () => {
    const { ready } = renderExam({ running: false });
    ready();
    expect(plays).toBe(0);
  });

  it("reports buffering and the end of it", () => {
    const { audio, ready, handlers } = renderExam();
    ready();
    act(() => audio.dispatchEvent(new Event("waiting")));
    expect(handlers.onStall).toHaveBeenCalled();
    act(() => audio.dispatchEvent(new Event("playing")));
    expect(handlers.onResume).toHaveBeenCalled();
  });

  it("reports a pause it did not make as an interruption, never claiming background playback", () => {
    const { audio, ready, handlers } = renderExam();
    ready();
    act(() => audio.dispatchEvent(new Event("pause")));
    expect(handlers.onFailed).toHaveBeenCalled();
  });

  it("reports an audio error", () => {
    const { audio, ready, handlers } = renderExam();
    ready();
    act(() => audio.dispatchEvent(new Event("error")));
    expect(handlers.onFailed).toHaveBeenCalled();
  });

  it("asks phone users to use the device's volume buttons", () => {
    renderExam();
    expect(screen.getByText("Use your device's volume buttons.")).toBeTruthy();
  });
});
