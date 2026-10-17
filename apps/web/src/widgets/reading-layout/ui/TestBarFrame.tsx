import type { ReactNode } from "react";

/**
 * The compact bar that replaces the shell header on the Reading screens
 * (READING_EXPERIENCE.md; DESIGN_SYSTEM.md, M4: test bar): the way out on the
 * start side ("Exit" in the test, "Results" in the review), the rest on the
 * end side.
 */
export function TestBarFrame({
  start,
  children,
}: {
  start: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="sticky top-[0] z-20 flex h-12 items-center gap-3 border-b border-border-subtle bg-surface-base px-gutter">
      {start}
      <div className="flex flex-1 items-center justify-end gap-3">
        {children}
      </div>
    </header>
  );
}
