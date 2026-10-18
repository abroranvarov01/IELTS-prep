import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { renderGroup } from "./testing/renderGroup";

afterEach(cleanup);

const field = (n: number) =>
  screen.getByRole("textbox", { name: `Answer ${n}` });

describe("choose one", () => {
  it("shows every question of the group with its options, as English test content", () => {
    renderGroup(0, 2);
    expect(
      screen.getByRole("heading", { name: "Questions 8–10" }),
    ).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(9);
    const group = screen.getByRole("group", { name: "8 Question 8" });
    expect(group.querySelector("legend")?.getAttribute("lang")).toBe("en");
  });

  it("records a choice and clears it", () => {
    const { latest } = renderGroup(0, 2);
    fireEvent.click(screen.getAllByRole("radio")[1]!);
    expect(latest.session?.answers).toEqual({ "8": "B" });
    fireEvent.click(screen.getByRole("button", { name: "Clear answer" }));
    expect(latest.session?.answers).toEqual({});
  });
});

describe("choose several", () => {
  it("counts the choices and stops at the instruction's number", () => {
    const { latest } = renderGroup(2, 0);
    const boxes = () => screen.getAllByRole("checkbox") as HTMLInputElement[];
    fireEvent.click(boxes()[0]!);
    fireEvent.click(boxes()[2]!);
    expect(screen.getByText("2 of 2 chosen")).toBeTruthy();
    expect(boxes()[1]!.disabled).toBe(true);
    expect(latest.session?.answers).toEqual({ "21": ["A", "C"] });
  });
});

describe("matching with letter buttons", () => {
  it("shows the list once and answers with one tap per item", () => {
    const { latest } = renderGroup(2, 1);
    expect(screen.getAllByText("First")).toHaveLength(1);
    fireEvent.click(screen.getAllByRole("radio", { name: "B, Second" })[1]!);
    expect(latest.session?.answers).toEqual({ "24": "B" });
  });
});

describe("typed gaps in the text", () => {
  it("puts a field in each gap of a form and keeps what is typed", () => {
    const { latest } = renderGroup(0, 0);
    expect(screen.getByText("Example")).toBeTruthy();
    fireEvent.change(field(3), { target: { value: "Smith" } });
    expect(latest.session?.answers).toEqual({ "3": "Smith" });
    expect(field(3).getAttribute("spellcheck")).toBe("false");
    expect(field(3).getAttribute("autocapitalize")).toBe("off");
  });

  it("warns in Practice when an answer has more words than allowed", () => {
    renderGroup(2, 2);
    fireEvent.change(field(27), { target: { value: "two words" } });
    expect(screen.getByText("This answer has more than 1 word.")).toBeTruthy();
  });

  it("gives no word-limit warning in Exam", () => {
    renderGroup(2, 2, { mode: "exam" });
    fireEvent.change(field(27), { target: { value: "two words" } });
    expect(screen.queryByText("This answer has more than 1 word.")).toBeNull();
  });

  it("asks one short-answer question with two numbered answers", () => {
    renderGroup(3, 2);
    expect(screen.getByText("List TWO things.")).toBeTruthy();
    expect(field(37)).toBeTruthy();
    expect(field(38)).toBeTruthy();
  });
});

describe("gaps chosen from a list", () => {
  it("shows the notes' headings and one letter row per gap", () => {
    const { latest } = renderGroup(0, 1);
    expect(screen.getByText("Notes")).toBeTruthy();
    expect(screen.getAllByRole("group")).toHaveLength(3);
    fireEvent.click(screen.getAllByRole("radio", { name: "D, Option D" })[0]!);
    expect(latest.session?.answers).toEqual({ "5": "D" });
  });
});

describe("in Russian", () => {
  it("names the heading and the fields in the interface language", () => {
    renderGroup(0, 0, { locale: "ru" });
    expect(screen.getByRole("heading", { name: "Вопросы 1–4" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Ответ 1" })).toBeTruthy();
  });
});

describe("tables and flow charts in Listening", () => {
  it("puts typed gaps in the table's cells, in both layouts", () => {
    const { latest } = renderGroup(1, 0);
    // The phone blocks and the wide table hold the same field once each;
    // only one of them is shown at a time (CSS).
    const fields = screen.getAllByRole("textbox", {
      name: "Answer 12",
      hidden: true,
    });
    expect(fields).toHaveLength(2);
    fireEvent.change(fields[0]!, { target: { value: "nine" } });
    expect(latest.session?.answers).toEqual({ "12": "nine" });
    expect((fields[1] as HTMLInputElement).value).toBe("nine");
  });

  it("answers a flow chart's gaps from its list", () => {
    const { latest } = renderGroup(1, 1);
    expect(screen.getByText("(16) ______")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("radio", { name: "C, Option C" })[1]!);
    expect(latest.session?.answers).toEqual({ "16": "C" });
  });
});

describe("labelling in Listening", () => {
  it("with letters on the picture, answers each named place with a letter", () => {
    const { latest } = renderGroup(1, 2);
    expect(screen.getByText("Room 18")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("radio", { name: "C, C" })[0]!);
    expect(latest.session?.answers).toEqual({ "18": "C" });
  });

  it("with numbers on the picture, types each label", () => {
    const { latest } = renderGroup(3, 0);
    fireEvent.change(field(32), { target: { value: "valve" } });
    expect(latest.session?.answers).toEqual({ "32": "valve" });
  });

  it("with numbers on the picture and a word list, answers from the list", () => {
    const { latest } = renderGroup(3, 1);
    expect(screen.getByText("Option B")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("radio", { name: "B, Option B" })[1]!);
    expect(latest.session?.answers).toEqual({ "35": "B" });
  });
});
