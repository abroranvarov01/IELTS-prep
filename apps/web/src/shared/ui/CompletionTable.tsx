import { Fragment, type ReactNode } from "react";
import type { TableShape } from "@/shared/content/shapes";
import type { GapSegment } from "@/shared/content/types";

/**
 * Table completion, shared by Listening and Reading (DESIGN_SYSTEM.md, M8:
 * table completion): a real table from the tablet breakpoint; on phones one
 * block per row, each cell under its column heading, so 320 px never scrolls
 * sideways (LISTENING_EXPERIENCE.md L5). `cell` renders a cell's text and
 * gaps; only one layout is in the accessibility tree at a time.
 */
export function CompletionTable({
  table,
  cell,
}: {
  table: TableShape;
  cell: (segments: GapSegment[], key: string) => ReactNode;
}) {
  return (
    <>
      <table className="hidden w-full border-collapse text-start tablet:table">
        <thead>
          <tr className="bg-surface-warm">
            {table.columns.map((c) => (
              <th key={c} scope="col" className="p-3 text-start font-bold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, r) => (
            <tr key={r} className="border-b border-border-subtle">
              {row.cells.map((segments, c) =>
                c === 0 && table.rowHeaders ? (
                  <th
                    key={c}
                    scope="row"
                    className="p-3 text-start align-top font-bold"
                  >
                    {cell(segments, `t${r}-${c}`)}
                  </th>
                ) : (
                  <td key={c} className="p-3 align-top leading-loose">
                    {cell(segments, `t${r}-${c}`)}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="flex flex-col gap-2 tablet:hidden">
        {table.rows.map((row, r) => (
          <li key={r} className="rounded-md bg-surface-warm px-4 py-3">
            {row.cells.map((segments, c) =>
              c === 0 ? (
                <p key={c} className="font-bold">
                  {cell(segments, `b${r}-${c}`)}
                </p>
              ) : (
                <Fragment key={c}>
                  <p className="mt-2 text-meta font-bold text-text-secondary">
                    {table.columns[c]}
                  </p>
                  <p className="leading-loose">
                    {cell(segments, `b${r}-${c}`)}
                  </p>
                </Fragment>
              ),
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
