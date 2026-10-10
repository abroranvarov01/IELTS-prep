import { cleanup, fireEvent, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MatchingQuestion } from "./MatchingQuestion";
import { OptionPicker } from "./OptionPicker";
import { renderQuestion } from "./testing/renderQuestion";

afterEach(cleanup);

describe("choose from a list", () => {
  it("asks about a paragraph by its letter, in the interface language", () => {
    const onChoose = vi.fn();
    renderQuestion(
      14,
      (unit) => <MatchingQuestion unit={unit} onChoose={onChoose} />,
      { locale: "ru" },
    );
    expect(screen.getByText("Абзац A")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Выберите ответ" }));
    expect(onChoose).toHaveBeenCalledTimes(1);
  });

  it("shows sentence beginnings with an ellipsis and statements as they are", () => {
    renderQuestion(35, (unit) => (
      <MatchingQuestion unit={unit} onChoose={vi.fn()} />
    ));
    expect(
      screen.getByText("According to the teacher, without short daily tasks …"),
    ).toBeTruthy();
  });

  it("lists the headings, records a choice, and marks headings chosen for other paragraphs", () => {
    const onChosen = vi.fn();
    const { latest } = renderQuestion(14, (unit) => (
      <>
        <OptionPicker
          unit={unit}
          headingRef={createRef()}
          onBack={vi.fn()}
          onChosen={onChosen}
        />
      </>
    ));
    const options = screen
      .getAllByRole("button")
      .filter((b) => b.textContent !== "Back");
    expect(options).toHaveLength(8);
    fireEvent.click(
      screen.getByRole("button", {
        name: "ii Turning empty roofs into green space",
      }),
    );
    expect(latest.session?.answers["14"]).toBe("ii");
    expect(onChosen).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", {
        name: "ii Turning empty roofs into green space Selected",
      }),
    ).toBeTruthy();
  });

  it("says which question already uses an option", () => {
    const { latest } = renderQuestion(19, (unit) => (
      <OptionPicker
        unit={unit}
        headingRef={createRef()}
        onBack={vi.fn()}
        onChosen={vi.fn()}
      />
    ));
    // Paragraph letters only for matching information.
    expect(
      screen
        .getAllByRole("button")
        .map((b) => b.textContent)
        .slice(1),
    ).toEqual(["A", "B", "C", "D", "E"]);
    fireEvent.click(screen.getByRole("button", { name: "D" }));
    expect(latest.session?.answers["19"]).toBe("D");
  });

  it("shows a word-box summary with its gaps, the current one marked, filled with the chosen word", () => {
    const { latest } = renderQuestion(38, (unit) => (
      <>
        <MatchingQuestion unit={unit} onChoose={vi.fn()} />
        <OptionPicker
          unit={unit}
          headingRef={createRef()}
          onBack={vi.fn()}
          onChosen={vi.fn()}
        />
      </>
    ));
    expect(screen.getByText("(38)").closest("[aria-current]")).toBeTruthy();
    expect(screen.getByText("(39)").closest("[aria-current]")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "A brief" }));
    expect(latest.session?.answers["38"]).toBe("A");
    expect(screen.getByText("(38)").parentElement?.textContent).toContain(
      "brief",
    );
  });
});
