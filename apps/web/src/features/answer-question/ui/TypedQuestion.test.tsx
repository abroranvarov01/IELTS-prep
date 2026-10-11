import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { renderQuestion } from "./testing/renderQuestion";
import { TypedQuestion } from "./TypedQuestion";

afterEach(cleanup);

describe("type words", () => {
  it("labels the field with its number and turns off spelling help", () => {
    renderQuestion(10, (unit) => <TypedQuestion unit={unit} />, {
      locale: "uz",
    });
    const field = screen.getByRole("textbox", { name: "10-javob" });
    expect(field.getAttribute("spellcheck")).toBe("false");
    expect(field.getAttribute("autocorrect")).toBe("off");
    expect(field.getAttribute("autocapitalize")).toBe("off");
    expect(field.getAttribute("autocomplete")).toBe("off");
  });

  it("keeps what is typed, spaces between words included, and trims it when leaving the field", () => {
    const { latest } = renderQuestion(13, (unit) => (
      <TypedQuestion unit={unit} />
    ));
    const field = screen.getByRole("textbox", { name: "Answer 13" });
    fireEvent.change(field, { target: { value: "winter weather " } });
    expect(latest.session?.answers["13"]).toBe("winter weather ");
    fireEvent.blur(field);
    expect(latest.session?.answers["13"]).toBe("winter weather");
  });

  it("shows the sentence with its gap marked, filled with the answer", () => {
    renderQuestion(10, (unit) => <TypedQuestion unit={unit} />);
    const gap = screen.getByText("(10)").closest("[aria-current]");
    expect(gap).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "lanes" },
    });
    expect(gap?.textContent).toContain("lanes");
  });

  it("shows notes as a list with the title, and summaries with every gap", () => {
    renderQuestion(8, (unit) => <TypedQuestion unit={unit} />);
    expect(screen.getByText("Shared bicycles")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    cleanup();

    renderQuestion(25, (unit) => <TypedQuestion unit={unit} />);
    expect(
      ["(24)", "(25)", "(26)", "(27)"].every((gap) => screen.getByText(gap)),
    ).toBe(true);
    expect(screen.getByText("(25)").closest("[aria-current]")).toBeTruthy();
  });

  it("shows a short-answer question", () => {
    renderQuestion(12, (unit) => <TypedQuestion unit={unit} />);
    expect(
      screen.getByText(
        "What did traders use to carry goods on their bicycles?",
      ),
    ).toBeTruthy();
  });
});
