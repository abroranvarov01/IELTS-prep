import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnswerList } from "./AnswerList";

const answers = [
  { value: "7.5", label: "7.5" },
  { value: "8+", label: "8+", spokenLabel: "8 или выше" },
  { value: "unknown", label: "Пока не знаю" },
];

function renderList(selected?: string) {
  const action = vi.fn();
  render(
    <>
      <h1 id="question">Какой балл вам нужен?</h1>
      <AnswerList
        name="targetBand"
        answers={answers}
        selected={selected}
        selectedLabel="Выбрано"
        labelledBy="question"
        action={action}
      />
    </>,
  );
  return action;
}

// Vitest globals are off here, so Testing Library does not clean up by itself.
afterEach(cleanup);

describe("AnswerList", () => {
  it("offers every answer as a button inside a group named by the question", () => {
    renderList();

    const group = screen.getByRole("group", { name: "Какой балл вам нужен?" });
    expect(
      within(group)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["7.5", "8+8 или выше", "Пока не знаю"]);
  });

  it("gives 8+ the spoken name '8 or higher'", () => {
    renderList();

    expect(screen.getByRole("button", { name: "8 или выше" })).toBeTruthy();
  });

  it("answers with one tap: submits the tapped answer's value", async () => {
    const action = renderList();

    fireEvent.click(screen.getByRole("button", { name: "Пока не знаю" }));

    await vi.waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    const form = action.mock.calls[0]?.[0] as FormData;
    expect(form.get("targetBand")).toBe("unknown");
  });

  it("marks the earlier answer as selected for screen readers, not by color alone", () => {
    renderList("8+");

    const selected = screen.getByRole("button", { name: "8 или выше Выбрано" });
    expect(selected.querySelector("svg")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "7.5" }).querySelector("svg"),
    ).toBe(null);
  });

  it("uses native buttons, so keyboard users answer with Enter or Space", () => {
    renderList();

    for (const button of screen.getAllByRole("button")) {
      expect(button.tagName).toBe("BUTTON");
      expect(button.getAttribute("type")).toBe("submit");
    }
  });
});
