import type { ReactNode } from "react";

/**
 * The task page (DESIGN_SYSTEM.md, M6 page compositions): phones and tablets
 * keep the single column; on desktop, a main column of 7/12 start-aligned in
 * the content column and, after a 1/12 gap, a side column of 4/12 for
 * supporting content. The side column follows the main one in reading order.
 */
export function TaskLayout({
  side,
  children,
}: {
  side?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-column py-8 desktop:grid desktop:max-w-content desktop:grid-cols-12 desktop:items-start desktop:gap-x-8">
      <div className="desktop:col-span-7">{children}</div>
      {side && (
        <div className="desktop:col-span-4 desktop:col-start-9">{side}</div>
      )}
    </div>
  );
}
