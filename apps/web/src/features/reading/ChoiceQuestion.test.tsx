import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ChoiceQuestion } from "./ChoiceQuestion";
import { MultiChoiceQuestion } from "./MultiChoiceQuestion";
import { renderQuestion } from "./testing/renderQuestion";

afterEach(cleanup);

const names = () =>
  screen
    .getAllByRole("radio")
    .map((r) => r.closest("label")?.textContent?.trim());

describe("choose one", () => {
  it("offers TRUE, FALSE, NOT GIVEN in full, as English test content", () => {
    renderQuestion(1, (unit) => <ChoiceQuestion unit={unit} />);
    expect(names()).toEqual(["TRUE", "FALSE", "NOT GIVEN"]);
    const group = screen.getByRole("group", {
      name: "In the twentieth century, children commonly travelled to school by bicycle.",
    });
    expect(group.getAttribute("lang")).toBe("en");
  });

  it("offers YES, NO, NOT GIVEN for the writer's views", () => {
    renderQuestion(28, (unit) => <ChoiceQuestion unit={unit} />);
    expect(names()).toEqual(["YES", "NO", "NOT GIVEN"]);
  });

  it("shows multiple-choice letters with their options", () => {
    renderQuestion(5, (unit) => <ChoiceQuestion unit={unit} />);
    expect(names()[1]).toBe("B Cyclists stop more often than drivers.");
  });

  it("records a choice, replaces it, and clears it, in one radio group", () => {
    const { latest } = renderQuestion(
      1,
      (unit) => <ChoiceQuestion unit={unit} />,
      { locale: "ru" },
    );
    const radios = screen.getAllByRole("radio");
    expect(new Set(radios.map((r) => r.getAttribute("name"))).size).toBe(1);

    fireEvent.click(screen.getByRole("radio", { name: "FALSE" }));
    fireEvent.click(screen.getByRole("radio", { name: "NOT GIVEN" }));
    expect(latest.session?.answers["1"]).toBe("NOT GIVEN");

    fireEvent.click(screen.getByRole("button", { name: "Очистить ответ" }));
    expect(latest.session?.answers).toEqual({});
    expect(screen.queryByRole("button", { name: "Очистить ответ" })).toBeNull();
  });
});

describe("choose several", () => {
  it("counts the choices and disables the rest at the limit", () => {
    const { latest } = renderQuestion(22, (unit) => (
      <MultiChoiceQuestion unit={unit} />
    ));
    expect(screen.getByText("0 of 2 chosen")).toBeTruthy();

    fireEvent.click(screen.getByRole("checkbox", { name: /^A / }));
    fireEvent.click(screen.getByRole("checkbox", { name: /^C / }));
    expect(screen.getByText("2 of 2 chosen")).toBeTruthy();
    expect(latest.session?.answers["22"]).toEqual(["A", "C"]);
    const disabled = screen
      .getAllByRole("checkbox")
      .filter((c) => (c as HTMLInputElement).disabled)
      .map((c) => c.getAttribute("value"));
    expect(disabled).toEqual(["B", "D", "E"]);

    fireEvent.click(screen.getByRole("checkbox", { name: /^A / }));
    expect(screen.getByText("1 of 2 chosen")).toBeTruthy();
    expect(
      screen
        .getAllByRole("checkbox")
        .some((c) => (c as HTMLInputElement).disabled),
    ).toBe(false);
  });
});
