import type { ReactNode } from "react";

/**
 * A screen with a picture panel (DESIGN_SYSTEM.md, Picture layout): on
 * desktop, two halves filling the window under the header, a blush panel
 * with the picture on the start side and the content, vertically centered,
 * on white beside it. Phones and tablets: the content alone, in the column.
 */
export function PictureLayout({
  panel,
  children,
}: {
  /** The panel's content: the picture, and any text under it. */
  panel: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-column pt-6 pb-12 desktop:grid desktop:min-h-[calc(100dvh-5rem)] desktop:max-w-none desktop:grid-cols-2 desktop:gap-16 desktop:pt-2 desktop:pb-8">
      <div className="desktop:col-start-2 desktop:row-start-1 desktop:flex desktop:flex-col desktop:justify-center desktop:pe-8">
        {children}
      </div>
      <div className="hidden desktop:col-start-1 desktop:row-start-1 desktop:flex desktop:flex-col desktop:overflow-hidden desktop:rounded-xl desktop:bg-brand-blush-soft desktop:p-12">
        {panel}
      </div>
    </div>
  );
}
