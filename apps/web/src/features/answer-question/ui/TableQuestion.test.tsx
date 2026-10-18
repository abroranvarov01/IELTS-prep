import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
import { questionUnits, unitOf } from "@/entities/reading";
import { demoTestWithTable } from "@/entities/reading/testing";
import en from "../../../../messages/en.json";
import { QuestionPrompt } from "./QuestionPrompt";
import { renderQuestion } from "./testing/renderQuestion";
import { TypedQuestion } from "./TypedQuestion";

afterEach(cleanup);
const test = demoTestWithTable();

describe("Reading table completion (shared layout)", () => {
  it("shows the table with the current gap marked and the field for it", () => {
    const { latest } = renderQuestion(
      8,
      (unit) => <TypedQuestion unit={unit} />,
      { test },
    );
    const table = screen.getByRole("table", { hidden: true });
    expect(
      within(table)
        .getAllByRole("columnheader", { hidden: true })
        .map((h) => h.textContent),
    ).toEqual(["Step", "What to do"]);
    const current = table.querySelector('[aria-current="true"]');
    expect(current?.textContent).toContain("(8)");
    fireEvent.change(screen.getByRole("textbox", { name: "Answer 8" }), {
      target: { value: "station" },
    });
    expect(latest.session?.answers["8"]).toBe("station");
  });

  it("shows the table with this question's gap marked in review", () => {
    const unit = unitOf(questionUnits(test), 9)!;
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <QuestionPrompt test={test} unit={unit} />
      </NextIntlClientProvider>,
    );
    const table = screen.getByRole("table", { hidden: true });
    expect(table.querySelector('[aria-current="true"]')?.textContent).toContain(
      "(9)",
    );
  });
});
