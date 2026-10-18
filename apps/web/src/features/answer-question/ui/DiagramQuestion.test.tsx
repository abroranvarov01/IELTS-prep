import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
import { questionUnits, unitOf } from "@/entities/reading";
import { demoTest2 as test } from "@/entities/reading/testing";
import en from "../../../../messages/en.json";
import { QuestionPrompt } from "./QuestionPrompt";
import { renderQuestion } from "./testing/renderQuestion";
import { TypedQuestion } from "./TypedQuestion";

afterEach(cleanup);
const alt = "Diagram of a solar water heater on a roof";

describe("Reading diagram label completion (shared picture)", () => {
  it("shows the diagram with the current label marked and the field for it", () => {
    const { latest } = renderQuestion(
      2,
      (unit) => <TypedQuestion unit={unit} />,
      { test },
    );
    const img = screen.getAllByRole("img", {
      name: alt,
    })[0] as HTMLImageElement;
    expect(img.getAttribute("src")).toMatch(
      /^\/media\/reading\/demo-academic-2\/diagram\.[0-9a-f]{12}\.svg$/,
    );
    expect(screen.getAllByText("2")[0]!.className).toContain(
      "bg-brand-blush-soft",
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Answer 2" }), {
      target: { value: "plate" },
    });
    expect(latest.session?.answers["2"]).toBe("plate");
  });

  it("shows the diagram with this question's label marked in review", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <QuestionPrompt test={test} unit={unitOf(questionUnits(test), 4)!} />
      </NextIntlClientProvider>,
    );
    expect(screen.getAllByRole("img", { name: alt })).toHaveLength(1);
    expect(screen.getAllByText("4")[0]!.className).toContain(
      "bg-brand-blush-soft",
    );
  });
});
