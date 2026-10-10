import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import ru from "../../../messages/ru.json";
import { demoTest as test } from "@/domain/reading/demo-test.fixture";
import {
  type ReadingEvent,
  apply,
  startSession,
} from "@/domain/reading/session";
import { questionUnits } from "@/domain/reading/units";
import { QuestionNavigator } from "./QuestionNavigator";
import { ReadingContext } from "./reading-context";

afterEach(cleanup);

function renderNavigator(events: ReadingEvent[]) {
  const session = events.reduce(
    (s, event) => apply(s, test, event, 1),
    startSession(test, "practice", 1),
  );
  const onChoose = vi.fn();
  render(
    <NextIntlClientProvider locale="ru" messages={ru}>
      <ReadingContext.Provider
        value={{ test, units: questionUnits(test), session, send: vi.fn() }}
      >
        <QuestionNavigator onChoose={onChoose} />
      </ReadingContext.Provider>
    </NextIntlClientProvider>,
  );
  return onChoose;
}

describe("QuestionNavigator", () => {
  it("lists all 40 questions in three passage groups", () => {
    renderNavigator([]);
    const groups = screen.getAllByRole("region");
    expect(groups.map((g) => within(g).getAllByRole("button").length)).toEqual([
      13, 14, 13,
    ]);
    expect(screen.getByRole("heading", { name: "Текст 2" })).toBeTruthy();
  });

  it("names every state in words, not only by look", () => {
    renderNavigator([
      { type: "answer", number: 1, answer: "TRUE" },
      { type: "toggleFlag", number: 2 },
      { type: "goTo", number: 2 },
    ]);
    expect(
      screen.getByRole("button", { name: "Вопрос 1, есть ответ" }),
    ).toBeTruthy();
    const second = screen.getByRole("button", {
      name: "Вопрос 2, нет ответа, отмечен для проверки, текущий",
    });
    expect(second.getAttribute("aria-current")).toBe("true");
  });

  it("counts a 'choose two' item one number per choice", () => {
    renderNavigator([{ type: "answer", number: 22, answer: ["A"] }]);
    expect(
      screen.getByRole("button", { name: "Вопрос 22, есть ответ" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Вопрос 23, нет ответа" }),
    ).toBeTruthy();
  });

  it("chooses a question", () => {
    const onChoose = renderNavigator([]);
    fireEvent.click(
      screen.getByRole("button", { name: "Вопрос 30, нет ответа" }),
    );
    expect(onChoose).toHaveBeenCalledWith(30);
  });
});
