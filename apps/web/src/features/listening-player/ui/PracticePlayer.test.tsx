import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import en from "../../../../messages/en.json";
import ru from "../../../../messages/ru.json";
import { PracticePlayer, type PracticePlayerProps } from "./PracticePlayer";

// jsdom has no media playback: the element's methods are stubbed at that
// boundary, and its events are fired as a browser would.
let playing = false;
beforeEach(() => {
  playing = false;
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    playing = true;
    Object.defineProperty(this, "paused", { value: false, configurable: true });
    this.dispatchEvent(new Event("playing"));
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    playing = false;
    Object.defineProperty(this, "paused", { value: true, configurable: true });
    this.dispatchEvent(new Event("pause"));
  });
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    this.dispatchEvent(new Event("loadstart"));
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderPlayer(
  props: Partial<PracticePlayerProps> = {},
  locale: "en" | "ru" = "en",
) {
  const onPosition = vi.fn();
  const onSpeed = vi.fn();
  render(
    <NextIntlClientProvider locale={locale} messages={{ en, ru }[locale]}>
      <PracticePlayer
        src="/media/part-1.m4a"
        partNumber={2}
        savedPositionMs={0}
        speed={1}
        speeds={[0.75, 1, 1.25]}
        onPosition={onPosition}
        onSpeed={onSpeed}
        {...props}
      />
    </NextIntlClientProvider>,
  );
  const audio = document.querySelector("audio") as HTMLAudioElement;
  const ready = (seconds = 120) => {
    Object.defineProperty(audio, "duration", {
      value: seconds,
      configurable: true,
    });
    act(() => {
      audio.dispatchEvent(new Event("loadedmetadata"));
      audio.dispatchEvent(new Event("canplay"));
    });
  };
  return { audio, ready, onPosition, onSpeed };
}

const button = (name: string | RegExp) => screen.getByRole("button", { name });

describe("the Practice player", () => {
  it("waits for the audio before it can play, and says so", () => {
    renderPlayer();
    expect(screen.getByText("Loading the audio…")).toBeTruthy();
    expect((button("Play") as HTMLButtonElement).disabled).toBe(true);
  });

  it("plays and pauses with one button whose name follows the state", async () => {
    const { ready } = renderPlayer();
    ready();
    await act(async () => fireEvent.click(button("Play")));
    expect(playing).toBe(true);
    act(() => fireEvent.click(button("Pause")));
    expect(playing).toBe(false);
    expect(button("Play")).toBeTruthy();
  });

  it("goes back and forward 5 seconds and moves with the slider", () => {
    const { audio, ready } = renderPlayer();
    ready();
    act(() =>
      fireEvent.change(
        screen.getByRole("slider", { name: "Position in the recording" }),
        { target: { value: "60000" } },
      ),
    );
    expect(audio.currentTime).toBe(60);
    act(() => fireEvent.click(button("Back 5 seconds")));
    expect(audio.currentTime).toBe(55);
    act(() => fireEvent.click(button("Forward 5 seconds")));
    expect(audio.currentTime).toBe(60);
  });

  it("reads its position as words", () => {
    const { audio, ready } = renderPlayer();
    ready(460);
    audio.currentTime = 83;
    act(() => audio.dispatchEvent(new Event("timeupdate")));
    expect(screen.getByRole("slider").getAttribute("aria-valuetext")).toBe(
      "1 minute 23 seconds of 7 minutes 40 seconds",
    );
  });

  it("resumes 3 seconds before where the learner left the part", () => {
    const { audio, ready } = renderPlayer({ savedPositionMs: 40_000 });
    ready();
    expect(audio.currentTime).toBe(37);
  });

  it("offers the three speeds", () => {
    const { ready, onSpeed } = renderPlayer();
    ready();
    act(() => fireEvent.click(button("Speed: 1×")));
    act(() => fireEvent.click(button("0.75×")));
    expect(onSpeed).toHaveBeenCalledWith(0.75);
  });

  it("stops at the end of a part and offers to play it again", () => {
    const { audio, ready } = renderPlayer();
    ready();
    act(() => audio.dispatchEvent(new Event("ended")));
    expect(screen.getByText("End of Part 2")).toBeTruthy();
    expect(button("Play again")).toBeTruthy();
  });

  it("says when it is waiting for the connection", async () => {
    const { audio, ready } = renderPlayer();
    ready();
    await act(async () => fireEvent.click(button("Play")));
    act(() => audio.dispatchEvent(new Event("waiting")));
    expect(screen.getByText("Loading the audio…")).toBeTruthy();
  });

  it("reports a failed load and tries again", () => {
    const { audio, ready } = renderPlayer();
    ready();
    act(() => audio.dispatchEvent(new Event("error")));
    expect(screen.getByText("The audio couldn't load.")).toBeTruthy();
    act(() => fireEvent.click(button("Try again")));
    expect(screen.getByText("Loading the audio…")).toBeTruthy();
  });

  it("keeps the position when the learner pauses", async () => {
    const { audio, ready, onPosition } = renderPlayer();
    ready();
    await act(async () => fireEvent.click(button("Play")));
    audio.currentTime = 12.4;
    act(() => fireEvent.click(button("Pause")));
    expect(onPosition).toHaveBeenLastCalledWith(12400);
  });

  it("speaks Russian", () => {
    renderPlayer({}, "ru");
    expect(screen.getByRole("region", { name: "Аудиоплеер" })).toBeTruthy();
    expect(button("Назад на 5 секунд")).toBeTruthy();
  });
});
