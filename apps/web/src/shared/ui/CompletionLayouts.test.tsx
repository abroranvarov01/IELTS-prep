import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { GapSegment } from "@/shared/content/types";
import { CompletionTable } from "./CompletionTable";
import { FlowChart } from "./FlowChart";

afterEach(cleanup);

const gap = (segments: GapSegment[]) =>
  segments.map((s, i) =>
    "gap" in s ? <input key={i} aria-label={`Answer ${s.gap}`} /> : s.text,
  );

const table = {
  title: "Ways",
  columns: ["Who", "How"],
  rowHeaders: true,
  rows: [
    { cells: [[{ text: "Teacher" }], [{ text: "Signs in " }, { gap: 15 }]] },
    { cells: [[{ text: "Anyone" }], [{ text: "Use the " }, { gap: 17 }]] },
  ],
};

describe("table completion", () => {
  it("is a real table with column and row headers for wide screens", () => {
    render(<CompletionTable table={table} cell={gap} />);
    const t = screen.getByRole("table", { hidden: true });
    expect(
      within(t)
        .getAllByRole("columnheader", { hidden: true })
        .map((h) => h.textContent),
    ).toEqual(["Who", "How"]);
    expect(
      within(t)
        .getAllByRole("rowheader", { hidden: true })
        .map((h) => h.textContent),
    ).toEqual(["Teacher", "Anyone"]);
  });

  it("is one block per row on phones, each cell under its column heading", () => {
    render(<CompletionTable table={table} cell={gap} />);
    const blocks = screen.getAllByRole("listitem");
    expect(blocks).toHaveLength(2);
    expect(blocks[0]!.textContent).toBe("TeacherHowSigns in ");
  });
});

describe("flow-chart completion", () => {
  it("is an ordered list of steps with decorative arrows between them", () => {
    render(
      <FlowChart
        chart={{
          steps: [
            [[{ text: "Find " }, { gap: 11 }]],
            [[{ text: "Meet" }]],
            [[{ text: "Talk" }]],
          ],
        }}
        line={gap}
      />,
    );
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(list.querySelectorAll("svg[aria-hidden='true']")).toHaveLength(2);
    expect(screen.getByRole("textbox", { name: "Answer 11" })).toBeTruthy();
  });
});
