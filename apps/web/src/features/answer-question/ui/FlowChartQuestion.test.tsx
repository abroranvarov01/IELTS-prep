import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
import { questionUnits, unitOf } from "@/entities/reading";
import { demoKey, demoTestWithFlowChart } from "@/entities/reading/testing";
import en from "../../../../messages/en.json";
import { QuestionPrompt } from "./QuestionPrompt";
import { renderQuestion } from "./testing/renderQuestion";
import { TypedQuestion } from "./TypedQuestion";

afterEach(cleanup);
const test = demoTestWithFlowChart();

describe("Reading flow-chart completion (shared layout)", () => {
  it("shows the steps in order with the current gap marked and the field for it", () => {
    const { latest } = renderQuestion(
      7,
      (unit) => <TypedQuestion unit={unit} />,
      { test },
    );
    const steps = screen.getAllByRole("listitem");
    expect(steps).toHaveLength(3);
    expect(
      steps[0]!.querySelector('[aria-current="true"]')?.textContent,
    ).toContain("(7)");
    fireEvent.change(screen.getByRole("textbox", { name: "Answer 7" }), {
      target: { value: "phone" },
    });
    expect(latest.session?.answers["7"]).toBe("phone");
  });

  it("shows the flow chart with this question's gap marked in review", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <QuestionPrompt test={test} unit={unitOf(questionUnits(test), 8)!} />
      </NextIntlClientProvider>,
    );
    expect(
      screen.getAllByRole("listitem")[1]!.querySelector('[aria-current="true"]')
        ?.textContent,
    ).toContain("(8)");
  });

  it("keeps the demo key valid: the gaps are the same questions", () => {
    expect(demoKey.answers[8]?.accept).toEqual(["station"]);
  });
});
